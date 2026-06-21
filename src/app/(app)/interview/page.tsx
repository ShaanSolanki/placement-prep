"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  interviewSections,
  interviewBySection,
  interviewConcepts,
} from "@/lib/content";

export default function InterviewPage() {
  const [q, setQ] = useState("");
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

      <div className="relative mb-7 max-w-md">
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

      {matches ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {matches.map((c) => (
            <ConceptCard key={c.id} id={c.id} title={c.title} def={c.definition} />
          ))}
          {matches.length === 0 && (
            <p className="text-bone-faint">No concepts match “{q}”.</p>
          )}
        </div>
      ) : (
        <div className="space-y-9">
          {interviewSections.map((section) => (
            <div key={section}>
              <h2 className="font-display text-xl text-bone mb-3">{section}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {interviewBySection(section).map((c) => (
                  <ConceptCard
                    key={c.id}
                    id={c.id}
                    title={c.title}
                    def={c.definition}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConceptCard({
  id,
  title,
  def,
}: {
  id: string;
  title: string;
  def: string;
}) {
  return (
    <Link href={`/interview/${id}`} className="surface card-hover p-4 block">
      <h3 className="text-bone font-medium">{title}</h3>
      <p className="text-sm text-bone-dim mt-1 line-clamp-2 leading-relaxed">
        {def}
      </p>
    </Link>
  );
}
