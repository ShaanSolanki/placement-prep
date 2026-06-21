"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Circle,
  CircleDot,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  codingProblems,
  codingCategories,
  codingByCategory,
  difficultyClass,
  CATEGORY_BLURB,
  codingCat,
} from "@/lib/content";
import { useProgress } from "@/lib/progress";

const DIFFS = ["All", "Easy", "Medium", "Hard"];

export default function CodePage() {
  const { progress } = useProgress();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [diff, setDiff] = useState("All");

  const solvedCount = Object.values(progress.coding).filter(
    (s) => s === "solved"
  ).length;

  const catStats = useMemo(() => {
    const map: Record<string, { total: number; solved: number }> = {};
    for (const c of codingCategories) {
      const list = codingByCategory(c);
      map[c] = {
        total: list.length,
        solved: list.filter((p) => progress.coding[p.id] === "solved").length,
      };
    }
    return map;
  }, [progress.coding]);

  const searchResults = useMemo(() => {
    if (!q.trim()) return null;
    const t = q.toLowerCase();
    return codingProblems.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        codingCat(p).toLowerCase().includes(t)
    );
  }, [q]);

  const list = useMemo(() => {
    if (searchResults) return searchResults;
    if (!cat) return [];
    let l = codingByCategory(cat);
    if (diff !== "All") l = l.filter((p) => p.difficulty === diff);
    return l;
  }, [cat, diff, searchResults]);

  const StatusIcon = ({ id }: { id: string }) => {
    const s = progress.coding[id];
    if (s === "solved") return <CheckCircle2 size={17} className="text-olive" />;
    if (s === "attempted")
      return <CircleDot size={17} className="text-amber" />;
    return <Circle size={17} className="text-bone-faint/50" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader
        eyebrow="DSA · Code Judge"
        title="Pick a data type. Start solving."
        subtitle="Every problem runs your Python against real hidden test cases in the browser. Work through a category end-to-end — or search across all 200+ problems."
        right={
          <div className="surface px-5 py-3 text-center">
            <div className="font-display text-3xl text-clay-bright">
              {solvedCount}
              <span className="text-bone-faint text-lg">
                /{codingProblems.length}
              </span>
            </div>
            <div className="text-xs text-bone-faint mt-0.5">solved</div>
          </div>
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-faint"
        />
        <input
          className="input pl-9"
          placeholder="Search all problems…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Search results */}
      {searchResults ? (
        <ProblemTable list={list} StatusIcon={StatusIcon} showCat />
      ) : cat ? (
        // Category detail
        <div>
          <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
            <button
              onClick={() => setCat(null)}
              className="text-sm text-bone-faint hover:text-bone flex items-center gap-1.5"
            >
              <ArrowLeft size={15} /> All data types
            </button>
            <div className="flex gap-1 surface p-1">
              {DIFFS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDiff(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    diff === d
                      ? "bg-clay/15 text-clay-bright"
                      : "text-bone-dim hover:text-bone"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <h2 className="font-display text-2xl text-bone mb-1">{cat}</h2>
          <p className="text-bone-dim text-sm mb-5">
            {CATEGORY_BLURB[cat]} · {catStats[cat]?.solved}/
            {catStats[cat]?.total} solved
          </p>
          <ProblemTable list={list} StatusIcon={StatusIcon} />
        </div>
      ) : (
        // Category grid
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {codingCategories.map((c) => {
            const st = catStats[c];
            const pct = st.total ? Math.round((st.solved / st.total) * 100) : 0;
            return (
              <button
                key={c}
                onClick={() => {
                  setCat(c);
                  setDiff("All");
                }}
                className="surface card-hover p-5 text-left flex flex-col group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg text-bone">{c}</h3>
                  <ArrowRight
                    size={16}
                    className="text-bone-faint group-hover:text-clay-bright group-hover:translate-x-1 transition-all shrink-0 mt-1"
                  />
                </div>
                <p className="text-sm text-bone-dim mt-1.5 leading-relaxed flex-1">
                  {CATEGORY_BLURB[c]}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 h-1.5 rounded-full bg-stone-3 overflow-hidden">
                    <div
                      className="h-full bg-clay rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-bone-faint shrink-0">
                    {st.solved}/{st.total}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProblemTable({
  list,
  StatusIcon,
  showCat = false,
}: {
  list: typeof codingProblems;
  StatusIcon: ({ id }: { id: string }) => React.ReactElement;
  showCat?: boolean;
}) {
  if (list.length === 0)
    return (
      <div className="surface px-5 py-12 text-center text-bone-faint">
        No problems found.
      </div>
    );
  return (
    <div className="surface overflow-hidden">
      {list.map((p) => (
        <Link
          key={p.id}
          href={`/code/${p.id}`}
          className="flex items-center gap-4 px-5 py-3.5 border-b border-line/60 last:border-0 hover:bg-stone-2 transition-colors group"
        >
          <StatusIcon id={p.id} />
          <span className="flex-1 text-bone group-hover:text-clay-bright transition-colors truncate">
            {p.title}
          </span>
          {showCat && (
            <span className="text-xs text-bone-faint hidden sm:block">
              {codingCat(p)}
            </span>
          )}
          <span className={`pill ${difficultyClass(p.difficulty)}`}>
            {p.difficulty}
          </span>
        </Link>
      ))}
    </div>
  );
}
