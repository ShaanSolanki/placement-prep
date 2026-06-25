"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  HelpCircle,
  AlertTriangle,
  Brain,
  Zap,
  Code2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import {
  interviewById,
  interviewBySection,
  interviewSiblings,
} from "@/lib/content";
import { useProgress } from "@/lib/progress";

export default function ConceptDetail() {
  const params = useParams<{ id: string }>();
  const c = interviewById(params.id);
  const { progress, markInterviewSeen } = useProgress();
  const studied = !!progress.interviewSeen[params.id];
  const { prev, next, index, list } = interviewSiblings(params.id);

  if (!c) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-bone-dim">Concept not found.</p>
        <Link href="/interview" className="btn btn-ghost mt-4">
          Back
        </Link>
      </div>
    );
  }

  const related = interviewBySection(c.section)
    .filter((x) => x.id !== c.id)
    .slice(0, 4);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/interview"
        className="text-sm text-bone-faint hover:text-bone flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft size={15} /> Interview prep
      </Link>

      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="pill pill-clay">{c.section}</span>
          {index >= 0 && (
            <span className="text-xs text-bone-faint">
              {index + 1} / {list.length}
            </span>
          )}
        </div>
        <button
          onClick={() => markInterviewSeen(c.id, !studied)}
          className={`btn py-2 ${studied ? "btn-outline" : "btn-primary"}`}
        >
          {studied ? (
            <>
              <CheckCircle2 size={15} className="text-olive" /> Studied
            </>
          ) : (
            <>
              <Circle size={15} /> Mark as studied
            </>
          )}
        </button>
      </div>
      <h1 className="font-display text-3xl md:text-4xl text-bone">{c.title}</h1>
      <p className="text-lg text-bone mt-3 leading-relaxed">{c.definition}</p>

      {c.why && (
        <p className="text-bone-dim mt-3 leading-relaxed">
          <span className="text-bone-faint">Why it exists — </span>
          {c.why}
        </p>
      )}
      {c.realWorld && (
        <p className="text-bone-dim mt-1 leading-relaxed">
          <span className="text-bone-faint">Real world — </span>
          {c.realWorld}
        </p>
      )}

      {c.howItWorks && (
        <div className="surface p-5 mt-6">
          <div className="eyebrow mb-2">How it works</div>
          <p className="text-bone-dim leading-relaxed">{c.howItWorks}</p>
        </div>
      )}

      {c.code && (
        <div className="surface-2 mt-4 overflow-hidden">
          <div className="px-4 py-2 text-xs text-bone-faint border-b border-line flex items-center gap-1.5">
            <Code2 size={13} /> Code
          </div>
          <pre className="p-4 text-sm font-mono text-bone overflow-x-auto whitespace-pre">
            {c.code}
          </pre>
        </div>
      )}

      {c.questions.length > 0 && (
        <QuestionSelfTest key={c.id} questions={c.questions} />
      )}

      {c.mistakes.length > 0 && (
        <div className="surface-2 p-5 mt-4 border-l-2 border-rust">
          <div className="flex items-center gap-2 text-rust text-sm font-medium mb-3">
            <AlertTriangle size={16} /> Most common mistakes
          </div>
          <ul className="space-y-1.5">
            {c.mistakes.map((m, i) => (
              <li key={i} className="text-bone-dim text-sm">
                • {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        {c.memoryTrick && (
          <div className="surface-2 p-5">
            <div className="flex items-center gap-2 text-amber text-sm font-medium mb-1.5">
              <Brain size={15} /> Memory trick
            </div>
            <p className="text-bone-dim text-sm leading-relaxed">
              {c.memoryTrick}
            </p>
          </div>
        )}
        {c.fastRevision && (
          <div className="surface-2 p-5">
            <div className="flex items-center gap-2 text-olive text-sm font-medium mb-1.5">
              <Zap size={15} /> Fast revision
            </div>
            <p className="text-bone-dim text-sm leading-relaxed">
              {c.fastRevision}
            </p>
          </div>
        )}
      </div>

      {/* prev / next within section */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={`/interview/${prev.id}`}
            className="surface card-hover p-4 flex items-center gap-2"
          >
            <ChevronLeft size={18} className="text-bone-faint shrink-0" />
            <span className="min-w-0">
              <span className="block text-[11px] text-bone-faint">Previous</span>
              <span className="block text-bone text-sm truncate">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/interview/${next.id}`}
            className="surface card-hover p-4 flex items-center gap-2 justify-end text-right"
          >
            <span className="min-w-0">
              <span className="block text-[11px] text-bone-faint">Next</span>
              <span className="block text-bone text-sm truncate">
                {next.title}
              </span>
            </span>
            <ChevronRight size={18} className="text-bone-faint shrink-0" />
          </Link>
        ) : (
          <span />
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-8">
          <div className="text-sm text-bone-faint mb-2">More in {c.section}</div>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r.id} href={`/interview/${r.id}`} className="pill">
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionSelfTest({ questions }: { questions: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <div className="surface p-5 mt-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-clay-bright text-sm font-medium">
          <HelpCircle size={16} /> Practice questions
        </div>
        <span className="text-xs text-bone-faint">
          {done.size}/{questions.length} you can answer
        </span>
      </div>
      <p className="text-xs text-bone-faint mb-3 flex items-center gap-1.5">
        <Eye size={12} /> Read each one and answer out loud, then tick the ones
        you nailed.
      </p>
      <ul className="space-y-1.5">
        {questions.map((q, i) => {
          const ok = done.has(i);
          return (
            <li key={i}>
              <button
                onClick={() => toggle(i)}
                className={`w-full text-left text-sm flex items-start gap-2 rounded-lg p-2 transition-colors ${
                  ok ? "bg-olive/10 text-bone" : "hover:bg-stone-2 text-bone-dim"
                }`}
              >
                {ok ? (
                  <CheckCircle2 size={15} className="text-olive mt-0.5 shrink-0" />
                ) : (
                  <Circle
                    size={15}
                    className="text-bone-faint/40 mt-0.5 shrink-0"
                  />
                )}
                <span>{q}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
