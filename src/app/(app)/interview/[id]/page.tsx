"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  AlertTriangle,
  Brain,
  Zap,
  Code2,
} from "lucide-react";
import { interviewById, interviewBySection } from "@/lib/content";

export default function ConceptDetail() {
  const params = useParams<{ id: string }>();
  const c = interviewById(params.id);

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

      <div className="pill pill-clay mb-3">{c.section}</div>
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
        <div className="surface p-5 mt-4">
          <div className="flex items-center gap-2 text-clay-bright text-sm font-medium mb-3">
            <HelpCircle size={16} /> Common interview questions
          </div>
          <ul className="space-y-2">
            {c.questions.map((q, i) => (
              <li
                key={i}
                className="text-bone-dim text-sm flex items-start gap-2"
              >
                <span className="text-clay-bright mt-0.5">→</span> {q}
              </li>
            ))}
          </ul>
        </div>
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
