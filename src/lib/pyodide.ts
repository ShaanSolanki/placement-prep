"use client";

import type { CodingProblem } from "./content";

const PYODIDE_VERSION = "0.27.7";
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

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
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { set: (k: string, v: unknown) => void };
}

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInterface>;
    __apexPyodide?: Promise<PyodideInterface>;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Pyodide runtime"));
    document.head.appendChild(s);
  });
}

export async function getPyodide(): Promise<PyodideInterface> {
  if (typeof window === "undefined") throw new Error("Pyodide is browser-only");
  if (window.__apexPyodide) return window.__apexPyodide;
  window.__apexPyodide = (async () => {
    await loadScript(`${CDN}pyodide.js`);
    if (!window.loadPyodide) throw new Error("Pyodide failed to initialise");
    return window.loadPyodide({ indexURL: CDN });
  })();
  return window.__apexPyodide;
}

export function isPyodideReady() {
  return typeof window !== "undefined" && !!window.__apexPyodide;
}

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

export async function runTests(
  userCode: string,
  problem: CodingProblem,
  tests: { input: unknown[]; expected: unknown }[]
): Promise<RunSummary> {
  const py = await getPyodide();
  try {
    // (re)define the harness then user code in a fresh-ish namespace
    await py.runPythonAsync(HARNESS);
    // run user code; capture definition errors
    py.globals.set("__apex_user_code", userCode);
    await py.runPythonAsync(
      `exec(__apex_user_code, globals())`
    );
    py.globals.set("__apex_tests_json", JSON.stringify(tests));
    py.globals.set("__apex_func", problem.funcName);
    py.globals.set("__apex_mode", problem.compare || "exact");
    py.globals.set(
      "__apex_argtypes",
      JSON.stringify(problem.argTypes || problem.params.map(() => "raw"))
    );
    py.globals.set("__apex_rettype", problem.retType || "raw");
    const raw = (await py.runPythonAsync(
      `__apex_run(__apex_tests_json, __apex_func, __apex_mode, __apex_argtypes, __apex_rettype)`
    )) as string;
    const parsed = JSON.parse(raw) as Omit<
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
    const msg = e instanceof Error ? e.message : String(e);
    // Clean pyodide traceback to the most relevant lines
    const clean = msg
      .split("\n")
      .filter(
        (l) =>
          l.trim() &&
          !l.includes("pyodide") &&
          !l.includes("File \"<exec>\"") &&
          !l.includes("__apex")
      )
      .slice(-6)
      .join("\n");
    return {
      results: [],
      passed: 0,
      total: tests.length,
      allPassed: false,
      runtimeError: clean || msg,
    };
  }
}
