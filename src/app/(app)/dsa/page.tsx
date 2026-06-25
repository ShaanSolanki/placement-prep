"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Flame, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  dsaCards,
  dsaTopics,
  difficultyClass,
  codingForTitle,
} from "@/lib/content";
import { useProgress } from "@/lib/progress";

export default function DsaPage() {
  const { progress } = useProgress();
  const [topic, setTopic] = useState(dsaTopics[0]);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    if (q.trim()) {
      const t = q.toLowerCase();
      return dsaCards.filter(
        (c) =>
          c.title.toLowerCase().includes(t) ||
          c.pattern.toLowerCase().includes(t) ||
          c.topic.toLowerCase().includes(t)
      );
    }
    return dsaCards.filter((c) => c.topic === topic);
  }, [topic, q]);

  const seenCount = Object.keys(progress.dsaSeen).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader
        eyebrow="DSA Question Bank"
        title="300 cards. Every interview pattern."
        subtitle="Topic-wise question cards rebuilt for fast revision — pattern, hint, key idea, optimal complexity and the companies that ask them."
        right={
          <div className="surface px-5 py-3 text-center">
            <div className="font-display text-3xl text-clay-bright">
              {seenCount}
              <span className="text-bone-faint text-lg">/{dsaCards.length}</span>
            </div>
            <div className="text-xs text-bone-faint mt-0.5">reviewed</div>
          </div>
        }
      />

      <div className="relative mb-5 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-faint"
        />
        <input
          className="input pl-9"
          placeholder="Search all 300 cards…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {!q && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-1 px-1">
          {dsaTopics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${
                topic === t
                  ? "bg-clay/15 text-clay-bright border-clay/40"
                  : "border-line text-bone-dim hover:text-bone hover:border-line-2"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((c) => {
          const seen = progress.dsaSeen[c.id];
          const hasCode = codingForTitle(c.title);
          return (
            <Link
              key={`${c.topic}-${c.id}`}
              href={`/dsa/${c.id}`}
              className="surface card-hover p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display text-lg text-bone leading-snug">
                  {c.title}
                </h3>
                {seen && (
                  <CheckCircle2 size={16} className="text-olive shrink-0 mt-1" />
                )}
              </div>
              <p className="text-sm text-bone-dim leading-relaxed line-clamp-2 flex-1">
                {c.statement}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`pill ${difficultyClass(c.difficulty)}`}>
                  {c.difficulty}
                </span>
                <span className="pill">{c.pattern}</span>
                {c.leetcode && (
                  <span className="pill border border-amber/40 bg-amber/10 text-amber">
                    LC #{c.leetcode}
                  </span>
                )}
                {c.frequency.includes("Very High") && (
                  <span className="pill pill-clay">
                    <Flame size={11} /> Hot
                  </span>
                )}
                {hasCode && <span className="pill pill-easy">Solvable</span>}
              </div>
            </Link>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="text-bone-faint text-center py-12">No cards found.</p>
      )}
    </div>
  );
}
