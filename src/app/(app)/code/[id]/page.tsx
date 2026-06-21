"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Eye,
  Terminal,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Gauge,
} from "lucide-react";
import {
  codingById,
  codingSiblings,
  codingCat,
  difficultyClass,
  type CodingProblem,
} from "@/lib/content";
import { runTests, type RunSummary } from "@/lib/pyodide";
import { analyzeComplexity, type ComplexityEstimate } from "@/lib/complexity";
import { useProgress } from "@/lib/progress";

export default function SolvePage() {
  const params = useParams<{ id: string }>();
  const problem = codingById(params.id);
  const { markCoding, progress } = useProgress();
  const { index, list, prev, next } = codingSiblings(params.id);
  const alreadySolved = progress.coding[params.id] === "solved";

  const [code, setCode] = useState("");
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [analysis, setAnalysis] = useState<ComplexityEstimate | null>(null);
  const [running, setRunning] = useState<false | "run" | "submit">(false);
  const [booting, setBooting] = useState(false);
  const [tab, setTab] = useState<"tests" | "result">("tests");
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const storageKey = problem ? `apex_code_${problem.id}` : "";

  useEffect(() => {
    if (!problem) return;
    const saved = localStorage.getItem(storageKey);
    setCode(saved ?? problem.starter);
    setSummary(null);
    setAnalysis(null);
    setShowSolution(false);
    setTab("tests");
  }, [problem, storageKey]);

  const persist = (v: string) => {
    setCode(v);
    if (storageKey) localStorage.setItem(storageKey, v);
  };

  const editorMount: OnMount = (_editor, monaco) => {
    monaco.editor.defineTheme("apex", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "7c756c", fontStyle: "italic" },
        { token: "keyword", foreground: "cf7945" },
        { token: "string", foreground: "8a9a5b" },
        { token: "number", foreground: "c9a24b" },
        { token: "function", foreground: "ede9e3" },
      ],
      colors: {
        "editor.background": "#171615",
        "editor.foreground": "#ede9e3",
        "editorLineNumber.foreground": "#5a544d",
        "editorLineNumber.activeForeground": "#b3ada4",
        "editor.selectionBackground": "#b5683c40",
        "editor.lineHighlightBackground": "#1c1b1a",
        "editorCursor.foreground": "#cf7945",
        "editorIndentGuide.background1": "#2b2826",
        "editorGutter.background": "#171615",
      },
    });
    monaco.editor.setTheme("apex");
  };

  const execute = useCallback(
    async (kind: "run" | "submit") => {
      if (!problem) return;
      setRunning(kind);
      setTab("result");
      if (!window.__apexPyodide) setBooting(true);
      const tests = kind === "run" ? problem.tests.slice(0, 2) : problem.tests;
      try {
        const result = await runTests(code, problem, tests);
        setSummary(result);
        setAnalysis(analyzeComplexity(code));
        if (kind === "submit") {
          if (result.allPassed) markCoding(problem.id, "solved");
          else markCoding(problem.id, "attempted");
        }
      } finally {
        setRunning(false);
        setBooting(false);
      }
    },
    [code, problem, markCoding]
  );

  // keyboard shortcuts: Ctrl/Cmd+Enter = Run, +Shift = Submit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        execute(e.shiftKey ? "submit" : "run");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [execute]);

  if (!problem) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-bone-dim">Problem not found.</p>
        <Link href="/code" className="btn btn-ghost mt-4">
          Back to problems
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-0px)] lg:h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-line bg-stone/60 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/code"
            className="text-bone-faint hover:text-bone shrink-0"
            title="Back to all problems"
          >
            <ArrowLeft size={18} />
          </Link>
          {alreadySolved && (
            <CheckCircle2 size={17} className="text-olive shrink-0" />
          )}
          <h1 className="font-display text-lg text-bone truncate">
            {problem.title}
          </h1>
          <span
            className={`pill ${difficultyClass(
              problem.difficulty
            )} hidden sm:inline-flex`}
          >
            {problem.difficulty}
          </span>
          {index >= 0 && (
            <span className="text-xs text-bone-faint hidden md:inline whitespace-nowrap">
              {codingCat(problem)} · {index + 1}/{list.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* prev / next problem */}
          <div className="flex items-center mr-1">
            {prev ? (
              <Link
                href={`/code/${prev.id}`}
                title={`Previous: ${prev.title}`}
                className="p-2 rounded-lg text-bone-dim hover:text-bone hover:bg-stone-2"
              >
                <ChevronLeft size={17} />
              </Link>
            ) : (
              <span className="p-2 text-bone-faint/30">
                <ChevronLeft size={17} />
              </span>
            )}
            {next ? (
              <Link
                href={`/code/${next.id}`}
                title={`Next: ${next.title}`}
                className="p-2 rounded-lg text-bone-dim hover:text-bone hover:bg-stone-2"
              >
                <ChevronRight size={17} />
              </Link>
            ) : (
              <span className="p-2 text-bone-faint/30">
                <ChevronRight size={17} />
              </span>
            )}
          </div>
          <button
            onClick={() => execute("run")}
            disabled={!!running}
            className="btn btn-ghost py-2"
            title="Run sample tests (Ctrl/Cmd + Enter)"
          >
            {running === "run" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Play size={15} />
            )}
            <span className="hidden sm:inline">Run</span>
          </button>
          <button
            onClick={() => execute("submit")}
            disabled={!!running}
            className="btn btn-primary py-2"
            title="Submit all tests (Ctrl/Cmd + Shift + Enter)"
          >
            {running === "submit" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </div>

      {/* Split */}
      <div className="flex-1 grid lg:grid-cols-2 min-h-0">
        {/* Description */}
        <div className="overflow-y-auto border-b lg:border-b-0 lg:border-r border-line p-6 min-h-0">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="pill pill-clay">{problem.topic}</span>
            <span className={`pill ${difficultyClass(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>

          <p className="text-bone leading-relaxed whitespace-pre-line">
            {problem.statement}
          </p>

          <div className="mt-6 space-y-4">
            {problem.examples.map((ex, i) => (
              <div key={i} className="surface-2 p-4">
                <div className="text-xs text-bone-faint uppercase tracking-wider mb-2">
                  Example {i + 1}
                </div>
                <div className="font-mono text-sm space-y-1">
                  <div>
                    <span className="text-bone-faint">Input: </span>
                    <span className="text-bone">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-bone-faint">Output: </span>
                    <span className="text-olive">{ex.output}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-xs text-bone-faint uppercase tracking-wider mb-2">
              Constraints
            </div>
            <div className="font-mono text-sm text-bone-dim space-y-1">
              {problem.constraints.split("|").map((c, i) => (
                <div key={i}>• {c.trim()}</div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setShowHint((v) => !v)}
              className="btn btn-outline py-2"
            >
              <Lightbulb size={15} /> {showHint ? "Hide" : "Hint"}
            </button>
            <button
              onClick={() => setShowSolution((v) => !v)}
              className="btn btn-outline py-2"
            >
              <Eye size={15} /> {showSolution ? "Hide" : "Solution"}
            </button>
          </div>
          {showHint && (
            <div className="mt-3 surface-2 p-4 text-sm text-bone-dim leading-relaxed">
              Keep the given function name <code className="text-clay-bright">{problem.funcName}()</code> and
              return the value (do not <code>print</code>). The signature is{" "}
              <code className="text-clay-bright">
                {problem.funcName}({problem.params.join(", ")})
              </code>
              .
            </div>
          )}
          {showSolution && (
            <div className="mt-3 surface-2 overflow-hidden">
              <div className="px-4 py-2 text-xs text-bone-faint border-b border-line">
                Reference solution (Python)
              </div>
              <pre className="p-4 text-sm font-mono text-bone overflow-x-auto whitespace-pre">
                {problem.solution}
              </pre>
            </div>
          )}
        </div>

        {/* Editor + console */}
        <div className="flex flex-col min-h-0">
          <div className="h-9 px-4 flex items-center justify-between border-b border-line bg-stone/40 shrink-0">
            <span className="text-xs text-bone-faint flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-olive" /> Python 3
            </span>
            <button
              onClick={() => persist(problem.starter)}
              className="text-xs text-bone-faint hover:text-bone flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <div className="flex-1 min-h-[240px]">
            <Editor
              height="100%"
              language="python"
              value={code}
              onChange={(v) => persist(v ?? "")}
              onMount={editorMount}
              options={{
                fontSize: 14,
                fontFamily: "var(--font-mono), monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 14 },
                tabSize: 4,
                lineNumbersMinChars: 3,
                renderLineHighlight: "line",
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console */}
          <div className="h-[38%] min-h-[180px] border-t border-line flex flex-col bg-ink-2 shrink-0">
            <div className="h-9 px-3 flex items-center gap-1 border-b border-line shrink-0">
              <button
                onClick={() => setTab("tests")}
                className={`px-3 py-1 rounded-md text-xs ${
                  tab === "tests"
                    ? "bg-stone-2 text-bone"
                    : "text-bone-faint hover:text-bone"
                }`}
              >
                Sample tests
              </button>
              <button
                onClick={() => setTab("result")}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1.5 ${
                  tab === "result"
                    ? "bg-stone-2 text-bone"
                    : "text-bone-faint hover:text-bone"
                }`}
              >
                <Terminal size={12} /> Output
              </button>
              {summary && (
                <span
                  className={`ml-auto text-xs font-medium ${
                    summary.allPassed ? "text-olive" : "text-rust"
                  }`}
                >
                  {summary.runtimeError
                    ? "Error"
                    : `${summary.passed}/${summary.total} passed`}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
              {tab === "tests" && (
                <div className="space-y-2">
                  {problem.tests.slice(0, 3).map((t, i) => (
                    <div key={i} className="surface-2 p-3">
                      <div className="text-bone-faint">Case {i + 1}</div>
                      <div className="text-bone mt-1">
                        input = {JSON.stringify(t.input)}
                      </div>
                      <div className="text-olive">
                        expected = {JSON.stringify(t.expected)}
                      </div>
                    </div>
                  ))}
                  <p className="text-bone-faint pt-1">
                    + {Math.max(problem.tests.length - 3, 0)} more hidden case(s)
                    on Submit.
                  </p>
                </div>
              )}

              {tab === "result" && (
                <ResultView
                  summary={summary}
                  running={!!running}
                  booting={booting}
                  next={next}
                  analysis={analysis}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplexityCard({ analysis }: { analysis: ComplexityEstimate }) {
  return (
    <div className="surface-2 p-3 mb-2 border border-slate/25">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-bone-faint flex items-center gap-1.5">
          <Gauge size={13} className="text-slate" /> Your solution · estimated
        </span>
        <div className="flex items-center gap-4">
          <span>
            <span className="text-bone-faint">Time </span>
            <span className="text-slate font-medium">{analysis.time}</span>
          </span>
          <span>
            <span className="text-bone-faint">Space </span>
            <span className="text-slate font-medium">{analysis.space}</span>
          </span>
        </div>
      </div>
      <p className="text-bone-faint mt-1.5 leading-relaxed">
        {analysis.note} <span className="opacity-70">Estimate from code structure — verify by reasoning.</span>
      </p>
    </div>
  );
}

function ResultView({
  summary,
  running,
  booting,
  next,
  analysis,
}: {
  summary: RunSummary | null;
  running: boolean;
  booting: boolean;
  next?: CodingProblem;
  analysis?: ComplexityEstimate | null;
}) {
  if (running) {
    return (
      <div className="flex items-center gap-2 text-bone-dim">
        <Loader2 size={14} className="animate-spin" />
        {booting ? "Booting Python runtime (first run only)…" : "Running tests…"}
      </div>
    );
  }
  if (!summary) {
    return (
      <p className="text-bone-faint">
        Press <span className="text-bone">Run</span> to test against sample cases,
        or <span className="text-clay-bright">Submit</span> for all cases.
      </p>
    );
  }
  if (summary.runtimeError) {
    return (
      <div>
        <div className="flex items-center gap-1.5 text-rust mb-2">
          <XCircle size={14} /> Your code raised an error
        </div>
        <pre className="text-rust whitespace-pre-wrap bg-rust/10 border border-rust/20 rounded-lg p-3">
          {summary.runtimeError}
        </pre>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {analysis && <ComplexityCard analysis={analysis} />}
      {summary.allPassed && (
        <div className="surface-2 border border-olive/30 bg-olive/5 rounded-lg p-3 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-olive">
            <PartyPopper size={17} />
            <span className="font-medium">
              Accepted — all {summary.total} tests passed!
            </span>
          </div>
          {next ? (
            <Link
              href={`/code/${next.id}`}
              className="btn btn-primary py-1.5 px-3 shrink-0"
            >
              Next problem <ChevronRight size={15} />
            </Link>
          ) : (
            <Link
              href="/code"
              className="btn btn-ghost py-1.5 px-3 shrink-0"
            >
              Category complete · Back
            </Link>
          )}
        </div>
      )}
      {summary.results.map((r, i) => (
        <div
          key={i}
          className={`surface-2 p-3 border ${
            r.ok ? "border-olive/25" : "border-rust/30"
          }`}
        >
          <div className="flex items-center gap-1.5">
            {r.ok ? (
              <CheckCircle2 size={13} className="text-olive" />
            ) : (
              <XCircle size={13} className="text-rust" />
            )}
            <span className={r.ok ? "text-olive" : "text-rust"}>
              Case {i + 1}
            </span>
          </div>
          <div className="mt-1.5 space-y-0.5 text-bone-dim">
            <div>input = {JSON.stringify(r.input)}</div>
            <div>expected = {JSON.stringify(r.expected)}</div>
            {!r.ok && (
              <div className="text-rust">
                got = {r.error ? r.error : JSON.stringify(r.got)}
              </div>
            )}
            {r.stdout && (
              <div className="text-bone-faint">stdout: {r.stdout.trim()}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
