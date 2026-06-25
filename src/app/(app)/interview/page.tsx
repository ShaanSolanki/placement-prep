"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, ArrowRight, Circle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  interviewSections,
  interviewBySection,
  interviewConcepts,
} from "@/lib/content";
import { useProgress } from "@/lib/progress";

export default function InterviewPage() {
  const [q, setQ] = useState("");
  const [onlyTodo, setOnlyTodo] = useState(false);
  const { progress } = useProgress();
  const seen = progress.interviewSeen;

  const studiedCount = useMemo(
    () => interviewConcepts.filter((c) => seen[c.id]).length,
    [seen]
  );
  const total = interviewConcepts.length;
  const pct = total ? Math.round((studiedCount / total) * 100) : 0;

  // first un-studied concept, for the "continue" button
  const nextUp = interviewConcepts.find((c) => !seen[c.id]);

  const search = q.trim().toLowerCase();
  const matches = search
    ? interviewConcepts.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.definition.toLowerCase().includes(search) ||
          c.section.toLowerCase().includes(search)
      )
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        eyebrow="Interview Prep"
        title="The full-stack survival guide."
        subtitle="Senior-dev notes across JavaScript, React, Next.js, Node, databases, auth, security and system design — definition, how it works, the questions you'll face and the mistakes to avoid."
      />

      {/* Study progress */}
      <div className="surface p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-bone">
              Studied{" "}
              <span className="text-bone-faint">
                {studiedCount}/{total}
              </span>
            </span>
            <span className="text-bone-faint">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-stone-2 overflow-hidden">
            <div
              className="h-full bg-clay rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {nextUp ? (
          <Link
            href={`/interview/${nextUp.id}`}
            className="btn btn-primary py-2 shrink-0"
          >
            {studiedCount ? "Continue" : "Start studying"}{" "}
            <ArrowRight size={15} />
          </Link>
        ) : (
          <span className="pill border border-olive/40 bg-olive/10 text-olive shrink-0">
            <CheckCircle2 size={13} className="mr-1" /> All studied
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-7">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-faint"
          />
          <input
            className="input pl-9"
            placeholder="Search concepts…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button
          onClick={() => setOnlyTodo((v) => !v)}
          className={`btn py-2 ${onlyTodo ? "btn-primary" : "btn-outline"}`}
        >
          {onlyTodo ? "Showing to-study" : "Hide studied"}
        </button>
      </div>

      {matches ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {matches.map((c) => (
            <ConceptCard
              key={c.id}
              id={c.id}
              title={c.title}
              def={c.definition}
              studied={!!seen[c.id]}
            />
          ))}
          {matches.length === 0 && (
            <p className="text-bone-faint">No concepts match “{q}”.</p>
          )}
        </div>
      ) : (
        <div className="space-y-9">
          {interviewSections.map((section) => {
            const concepts = interviewBySection(section).filter(
              (c) => !onlyTodo || !seen[c.id]
            );
            if (concepts.length === 0) return null;
            const all = interviewBySection(section);
            const done = all.filter((c) => seen[c.id]).length;
            return (
              <div key={section}>
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="font-display text-xl text-bone">{section}</h2>
                  <span className="text-xs text-bone-faint">
                    {done}/{all.length} studied
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {concepts.map((c) => (
                    <ConceptCard
                      key={c.id}
                      id={c.id}
                      title={c.title}
                      def={c.definition}
                      studied={!!seen[c.id]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ConceptCard({
  id,
  title,
  def,
  studied,
}: {
  id: string;
  title: string;
  def: string;
  studied: boolean;
}) {
  return (
    <Link href={`/interview/${id}`} className="surface card-hover p-4 block">
      <div className="flex items-start gap-2">
        {studied ? (
          <CheckCircle2 size={16} className="text-olive mt-0.5 shrink-0" />
        ) : (
          <Circle size={16} className="text-bone-faint/40 mt-0.5 shrink-0" />
        )}
        <div className="min-w-0">
          <h3 className="text-bone font-medium">{title}</h3>
          <p className="text-sm text-bone-dim mt-1 line-clamp-2 leading-relaxed">
            {def}
          </p>
        </div>
      </div>
    </Link>
  );
}
