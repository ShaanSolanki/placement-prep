"use client";

import type { CodingProblem } from "./content";

const PYODIDE_VERSION = "0.27.7";
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// Hard ceiling for a single run. If user code doesn't finish in time we assume
// an infinite loop (or runaway complexity) and kill the worker — the UI thread
// is never blocked because all Python executes off the main thread.
const TIME_LIMIT_MS = 8000;

export interface TestRunResult {
  ok: boolean;
  got: unknown;
  error: string | null;
  stdout: string;
  input: unknown[];
  expected: unknown;
}

export interface RunSummary {
  results: TestRunResult[];
  passed: number;
  total: number;
  allPassed: boolean;
  runtimeError: string | null;
  timedOut?: boolean;
}

// ---- Python harness (runs inside the worker) ----
const HARNESS = `
import json, copy, io, contextlib

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right

def _build_list(arr):
    dummy = ListNode(); cur = dummy
    for v in (arr or []):
        cur.next = ListNode(v); cur = cur.next
    return dummy.next
def _ser_list(node):
    out = []
    while node:
        out.append(node.val); node = node.next
    return out
def _build_tree(arr):
    arr = arr or []
    if not arr or arr[0] is None:
        return None
    from collections import deque
    it = iter(arr)
    root = TreeNode(next(it)); q = deque([root])
    while q:
        node = q.popleft()
        try: lv = next(it)
        except StopIteration: break
        if lv is not None:
            node.left = TreeNode(lv); q.append(node.left)
        try: rv = next(it)
        except StopIteration: break
        if rv is not None:
            node.right = TreeNode(rv); q.append(node.right)
    return root
def _ser_tree(root):
    if not root: return []
    from collections import deque
    q = deque([root]); out = []
    while q:
        n = q.popleft()
        if n is None:
            out.append(None)
        else:
            out.append(n.val); q.append(n.left); q.append(n.right)
    while out and out[-1] is None:
        out.pop()
    return out
def _conv_in(val, t):
    if t == 'listnode': return _build_list(val)
    if t == 'tree': return _build_tree(val)
    return val
def _conv_out(val, t):
    if t == 'listnode': return _ser_list(val)
    if t == 'tree': return _ser_tree(val)
    return val

def _norm(v, mode):
    if mode in ('sorted','set','rows'):
        return sorted(v)
    if mode in ('unordered2d','groups'):
        return sorted([sorted(x) for x in v])
    return v

def _eq(a, b, mode):
    if mode == 'approx':
        try:
            return abs(float(a) - float(b)) < 1e-4
        except Exception:
            return False
    try:
        return _norm(a, mode) == _norm(b, mode)
    except Exception:
        return a == b

def __apex_run(tests_json, func_name, mode, argtypes_json, rettype):
    tests = json.loads(tests_json)
    argtypes = json.loads(argtypes_json)
    fn = globals().get(func_name)
    out = []
    for t in tests:
        if fn is None:
            out.append({'ok': False, 'got': None,
                        'error': "Function '" + func_name + "' is not defined. Keep the given function name.",
                        'stdout': ''})
            continue
        raw = copy.deepcopy(t['input'])
        atypes = argtypes if argtypes else ['raw'] * len(raw)
        args = [_conv_in(raw[i], atypes[i] if i < len(atypes) else 'raw') for i in range(len(raw))]
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                got = _conv_out(fn(*args), rettype)
            out.append({'ok': bool(_eq(got, t['expected'], mode)),
                        'got': got, 'error': None, 'stdout': buf.getvalue()})
        except Exception as e:
            out.append({'ok': False, 'got': None,
                        'error': type(e).__name__ + ': ' + str(e),
                        'stdout': buf.getvalue()})
    return json.dumps(out, default=str)
`;

// ---- Worker source (classic worker built from a Blob, so it works the same in
// dev and production regardless of the bundler) ----
const WORKER_SRC = `
const CDN = ${JSON.stringify(CDN)};
const HARNESS = ${JSON.stringify(HARNESS)};
let pyReady = null;
function getPy() {
  if (pyReady) return pyReady;
  pyReady = (async () => {
    importScripts(CDN + "pyodide.js");
    const py = await loadPyodide({ indexURL: CDN });
    self.postMessage({ type: "ready" });
    return py;
  })();
  return pyReady;
}
self.onmessage = async (e) => {
  const d = e.data || {};
  if (d.type === "warm") { getPy(); return; }
  if (d.type !== "run") return;
  try {
    const py = await getPy();
    await py.runPythonAsync(HARNESS);
    py.globals.set("__apex_user_code", d.code);
    await py.runPythonAsync("exec(__apex_user_code, globals())");
    py.globals.set("__apex_tests_json", JSON.stringify(d.tests));
    py.globals.set("__apex_func", d.funcName);
    py.globals.set("__apex_mode", d.mode);
    py.globals.set("__apex_argtypes", JSON.stringify(d.argTypes));
    py.globals.set("__apex_rettype", d.retType);
    const raw = await py.runPythonAsync(
      "__apex_run(__apex_tests_json, __apex_func, __apex_mode, __apex_argtypes, __apex_rettype)"
    );
    self.postMessage({ id: d.id, ok: true, raw: raw });
  } catch (err) {
    self.postMessage({ id: d.id, ok: false, error: String((err && err.message) || err) });
  }
};
`;

let worker: Worker | null = null;
let booted = false;
let msgId = 0;

function getWorker(): Worker {
  if (worker) return worker;
  const blob = new Blob([WORKER_SRC], { type: "text/javascript" });
  worker = new Worker(URL.createObjectURL(blob));
  booted = false;
  worker.addEventListener("message", (e: MessageEvent) => {
    if ((e.data as { type?: string })?.type === "ready") booted = true;
  });
  return worker;
}

function killWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    booted = false;
  }
}

export function isPyodideReady() {
  return booted;
}

/** Warm the runtime ahead of the first Run so booting isn't on the critical path. */
export function preloadPyodide() {
  if (typeof window === "undefined") return;
  const w = getWorker();
  // a no-op run that just triggers pyodide load inside the worker
  w.postMessage({ type: "warm" });
}

function cleanTraceback(msg: string): string {
  return (
    msg
      .split("\n")
      .filter(
        (l) =>
          l.trim() &&
          !l.includes("pyodide") &&
          !l.includes('File "<exec>"') &&
          !l.includes("__apex")
      )
      .slice(-6)
      .join("\n") || msg
  );
}

export async function runTests(
  userCode: string,
  problem: CodingProblem,
  tests: { input: unknown[]; expected: unknown }[]
): Promise<RunSummary> {
  if (typeof window === "undefined")
    throw new Error("Pyodide is browser-only");

  const w = getWorker();
  const id = ++msgId;

  const raw = await new Promise<{ ok: boolean; raw?: string; error?: string }>(
    (resolve) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        // The infinite loop / runaway is stuck inside the worker — terminate it
        // so it can never block the page. A fresh worker boots on next run.
        killWorker();
        resolve({ ok: false, error: "__TIMEOUT__" });
      }, TIME_LIMIT_MS);

      const onMessage = (e: MessageEvent) => {
        const data = e.data as { id?: number; ok: boolean; raw?: string; error?: string; type?: string };
        if (data.type === "ready") return;
        if (data.id !== id) return;
        if (settled) return;
        settled = true;
        cleanup();
        resolve({ ok: data.ok, raw: data.raw, error: data.error });
      };

      const onError = (ev: ErrorEvent) => {
        if (settled) return;
        settled = true;
        cleanup();
        killWorker();
        resolve({ ok: false, error: ev.message || "Worker crashed" });
      };

      function cleanup() {
        clearTimeout(timer);
        w.removeEventListener("message", onMessage);
        w.removeEventListener("error", onError);
      }

      w.addEventListener("message", onMessage);
      w.addEventListener("error", onError);
      w.postMessage({
        type: "run",
        id,
        code: userCode,
        tests,
        funcName: problem.funcName,
        mode: problem.compare || "exact",
        argTypes: problem.argTypes || problem.params.map(() => "raw"),
        retType: problem.retType || "raw",
      });
    }
  );

  if (!raw.ok) {
    if (raw.error === "__TIMEOUT__") {
      return {
        results: [],
        passed: 0,
        total: tests.length,
        allPassed: false,
        timedOut: true,
        runtimeError:
          `Time Limit Exceeded (> ${TIME_LIMIT_MS / 1000}s).\n` +
          "Your code likely contains an infinite loop or is far too slow. " +
          "Check your loop conditions and recursion base cases.",
      };
    }
    return {
      results: [],
      passed: 0,
      total: tests.length,
      allPassed: false,
      runtimeError: cleanTraceback(raw.error || "Unknown error"),
    };
  }

  try {
    const parsed = JSON.parse(raw.raw as string) as Omit<
      TestRunResult,
      "input" | "expected"
    >[];
    const results: TestRunResult[] = parsed.map((r, i) => ({
      ...r,
      input: tests[i].input,
      expected: tests[i].expected,
    }));
    const passed = results.filter((r) => r.ok).length;
    return {
      results,
      passed,
      total: results.length,
      allPassed: passed === results.length && results.length > 0,
      runtimeError: null,
    };
  } catch (e) {
    return {
      results: [],
      passed: 0,
      total: tests.length,
      allPassed: false,
      runtimeError: cleanTraceback(e instanceof Error ? e.message : String(e)),
    };
  }
}
