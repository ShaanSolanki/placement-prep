"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useProgress, type TestResult } from "@/lib/progress";

export interface TestItem {
  id: string;
  q: string;
  options: string[];
  answer: string;
  topicId?: string;
  explain?: string;
}

export function TestEngine({
  title,
  kind,
  items,
  durationSec,
  onExit,
}: {
  title: string;
  kind: TestResult["kind"];
  items: TestItem[];
  durationSec: number;
  onExit: () => void;
}) {
  const { addTest, recordApti } = useProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [cur, setCur] = useState(0);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [left, setLeft] = useState(durationSec);
  const [done, setDone] = useState(false);
  const recorded = useRef(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (done) return;
    if (left <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, done]);

  const finish = () => {
    if (recorded.current) return;
    recorded.current = true;
    setDone(true);
    let correct = 0;
    for (const it of items) {
      const ok = answers[it.id] === it.answer;
      if (ok) correct++;
      if (kind === "apti" && it.topicId && answers[it.id] !== undefined)
        recordApti(it.topicId, ok);
    }
    addTest({
      kind,
      label: title,
      score: correct,
      total: items.length,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
    });
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (done) {
    const correct = items.filter((it) => answers[it.id] === it.answer).length;
    const pct = Math.round((correct / items.length) * 100);
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="surface p-8 text-center">
          <div className="eyebrow mb-2">{title} · complete</div>
          <div
            className={`font-display text-6xl ${
              pct >= 60 ? "text-olive" : pct >= 35 ? "text-amber" : "text-rust"
            }`}
          >
            {pct}%
          </div>
          <p className="text-bone-dim mt-2">
            {correct} of {items.length} correct
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={onExit} className="btn btn-primary">
              <RotateCcw size={15} /> Back to Test Center
            </button>
          </div>
        </div>

        <h3 className="font-display text-xl text-bone mt-8 mb-4">Review</h3>
        <div className="space-y-3">
          {items.map((it, i) => {
            const picked = answers[it.id];
            const ok = picked === it.answer;
            return (
              <div key={it.id} className="surface p-5">
                <div className="flex items-start gap-2">
                  {ok ? (
                    <CheckCircle2
                      size={17}
                      className="text-olive shrink-0 mt-0.5"
                    />
                  ) : (
                    <XCircle size={17} className="text-rust shrink-0 mt-0.5" />
                  )}
                  <p className="text-bone">
                    <span className="text-bone-faint">{i + 1}. </span>
                    {it.q}
                  </p>
                </div>
                <div className="mt-2 ml-7 text-sm space-y-1">
                  <div className="text-olive">Correct: {it.answer}</div>
                  {!ok && (
                    <div className="text-rust">
                      Your answer: {picked ?? "— skipped —"}
                    </div>
                  )}
                  {it.explain && (
                    <div className="text-bone-faint">{it.explain}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const it = items[cur];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Status bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="eyebrow">{title}</div>
          <div className="text-sm text-bone-dim mt-0.5">
            {answeredCount}/{items.length} answered
          </div>
        </div>
        <div
          className={`flex items-center gap-2 surface px-4 py-2 ${
            left < 30 ? "text-rust" : "text-bone"
          }`}
        >
          <Clock size={16} />
          <span className="font-mono text-lg">{fmt(left)}</span>
        </div>
      </div>

      {/* Question */}
      <div className="surface p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-bone-faint">
            Question {cur + 1} of {items.length}
          </span>
          <button
            onClick={() =>
              setFlags((f) => ({ ...f, [it.id]: !f[it.id] }))
            }
            className={`text-xs flex items-center gap-1 ${
              flags[it.id] ? "text-amber" : "text-bone-faint hover:text-bone"
            }`}
          >
            <Flag size={13} /> {flags[it.id] ? "Flagged" : "Flag"}
          </button>
        </div>
        <p className="text-lg text-bone leading-relaxed">{it.q}</p>
        <div className="grid gap-2.5 mt-5">
          {it.options.map((opt) => {
            const picked = answers[it.id] === opt;
            return (
              <button
                key={opt}
                onClick={() =>
                  setAnswers((a) => ({ ...a, [it.id]: opt }))
                }
                className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                  picked
                    ? "border-clay/50 bg-clay/10 text-bone"
                    : "border-line text-bone-dim hover:text-bone hover:border-line-2"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => setCur((c) => Math.max(0, c - 1))}
          disabled={cur === 0}
          className="btn btn-ghost"
        >
          <ChevronLeft size={15} /> Prev
        </button>
        {cur < items.length - 1 ? (
          <button
            onClick={() => setCur((c) => c + 1)}
            className="btn btn-ghost"
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={finish} className="btn btn-primary">
            Submit test
          </button>
        )}
      </div>

      {/* Question palette */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {items.map((q, i) => {
          const ans = answers[q.id] !== undefined;
          const fl = flags[q.id];
          return (
            <button
              key={q.id}
              onClick={() => setCur(i)}
              className={`w-8 h-8 rounded-md text-xs border transition-colors ${
                i === cur
                  ? "border-clay text-clay-bright"
                  : fl
                  ? "border-amber/50 text-amber"
                  : ans
                  ? "border-olive/40 bg-olive/10 text-olive"
                  : "border-line text-bone-faint hover:text-bone"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <button
        onClick={onExit}
        className="text-xs text-bone-faint hover:text-rust mt-6"
      >
        Abandon test
      </button>
    </div>
  );
}
