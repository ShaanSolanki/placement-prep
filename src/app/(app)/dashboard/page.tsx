"use client";

import Link from "next/link";
import {
  Code2,
  Calculator,
  BookOpen,
  Flame,
  ArrowRight,
  Trophy,
  Target,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import {
  codingProblems,
  dsaCards,
  aptiMcqPool,
  difficultyClass,
  codingCategories,
  codingByCategory,
} from "@/lib/content";

export default function Dashboard() {
  const { user } = useAuth();
  const { progress } = useProgress();

  const solved = Object.values(progress.coding).filter(
    (s) => s === "solved"
  ).length;
  const cardsSeen = Object.keys(progress.dsaSeen).length;
  const aptiTotals = Object.values(progress.apti).reduce(
    (a, v) => ({
      attempted: a.attempted + v.attempted,
      correct: a.correct + v.correct,
    }),
    { attempted: 0, correct: 0 }
  );
  const aptiAcc =
    aptiTotals.attempted > 0
      ? Math.round((aptiTotals.correct / aptiTotals.attempted) * 100)
      : 0;
  const streak = progress.streak?.count || 0;

  const nextProblems = codingProblems
    .filter((p) => progress.coding[p.id] !== "solved")
    .slice(0, 4);

  const stats = [
    {
      icon: Code2,
      label: "Problems solved",
      value: solved,
      total: codingProblems.length,
      href: "/code",
    },
    {
      icon: BookOpen,
      label: "DSA cards reviewed",
      value: cardsSeen,
      total: dsaCards.length,
      href: "/dsa",
    },
    {
      icon: Calculator,
      label: "Aptitude attempted",
      value: aptiTotals.attempted,
      total: aptiMcqPool.length,
      href: "/aptitude",
    },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();
  const name = user?.displayName?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="eyebrow mb-2">Dashboard</div>
          <h1 className="font-display text-3xl md:text-4xl text-bone">
            {greeting}, {name}.
          </h1>
          <p className="text-bone-dim mt-2">
            {solved === 0
              ? "Let's get your first problem solved today."
              : "Keep the momentum going — consistency wins placements."}
          </p>
        </div>
        {streak > 0 && (
          <div className="surface px-5 py-4 flex items-center gap-3">
            <Flame size={26} className="text-amber" />
            <div>
              <div className="font-display text-2xl text-bone leading-none">
                {streak}
              </div>
              <div className="text-xs text-bone-faint">day streak</div>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          const pct = s.total ? Math.round((s.value / s.total) * 100) : 0;
          return (
            <Link key={s.label} href={s.href} className="surface card-hover p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-[10px] bg-clay/12 border border-clay/25 flex items-center justify-center">
                  <Icon size={18} className="text-clay-bright" />
                </div>
                <ArrowRight size={15} className="text-bone-faint" />
              </div>
              <div className="font-display text-3xl text-bone">
                {s.value}
                <span className="text-bone-faint text-lg">/{s.total}</span>
              </div>
              <div className="text-sm text-bone-dim mt-0.5">{s.label}</div>
              <div className="mt-3 h-1.5 rounded-full bg-stone-3 overflow-hidden">
                <div
                  className="h-full bg-clay rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* DSA mastery by data type */}
      <div className="surface p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-bone flex items-center gap-2">
            <Code2 size={18} className="text-clay-bright" /> DSA mastery by data
            type
          </h2>
          <Link
            href="/code"
            className="text-sm text-bone-faint hover:text-clay-bright"
          >
            Open judge
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {codingCategories.map((c) => {
            const list = codingByCategory(c);
            const solved = list.filter(
              (p) => progress.coding[p.id] === "solved"
            ).length;
            const pct = list.length
              ? Math.round((solved / list.length) * 100)
              : 0;
            return (
              <Link
                key={c}
                href="/code"
                className="group flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-bone-dim group-hover:text-bone truncate">
                      {c}
                    </span>
                    <span className="text-xs text-bone-faint shrink-0 ml-2">
                      {solved}/{list.length}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-3 overflow-hidden">
                    <div
                      className="h-full bg-clay rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue solving */}
        <div className="lg:col-span-2 surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-bone flex items-center gap-2">
              <Target size={18} className="text-clay-bright" /> Continue solving
            </h2>
            <Link
              href="/code"
              className="text-sm text-bone-faint hover:text-clay-bright"
            >
              View all
            </Link>
          </div>
          <div className="space-y-1">
            {nextProblems.map((p) => (
              <Link
                key={p.id}
                href={`/code/${p.id}`}
                className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-stone-2 transition-colors group"
              >
                <span className="text-bone group-hover:text-clay-bright transition-colors">
                  {p.title}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-bone-faint hidden sm:block">
                    {p.topic}
                  </span>
                  <span className={`pill ${difficultyClass(p.difficulty)}`}>
                    {p.difficulty}
                  </span>
                </div>
              </Link>
            ))}
            {nextProblems.length === 0 && (
              <p className="text-bone-dim py-6 text-center">
                🎉 You&apos;ve solved every problem. Try the Test Center.
              </p>
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <div className="surface p-6">
            <h2 className="font-display text-lg text-bone mb-3 flex items-center gap-2">
              <Calculator size={17} className="text-clay-bright" /> Aptitude
              accuracy
            </h2>
            <div className="font-display text-4xl text-bone">{aptiAcc}%</div>
            <p className="text-sm text-bone-dim mt-1">
              {aptiTotals.correct}/{aptiTotals.attempted} correct
            </p>
            <Link href="/aptitude" className="btn btn-ghost w-full mt-4">
              Practice aptitude
            </Link>
          </div>

          <div className="surface p-6">
            <h2 className="font-display text-lg text-bone mb-3 flex items-center gap-2">
              <Trophy size={17} className="text-clay-bright" /> Recent tests
            </h2>
            {progress.tests.length === 0 ? (
              <p className="text-sm text-bone-dim">
                No tests yet.{" "}
                <Link href="/tests" className="text-clay-bright">
                  Take a mock
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-2">
                {progress.tests.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-bone-dim truncate">{t.label}</span>
                    <span className="text-bone font-medium shrink-0 ml-2">
                      {t.score}/{t.total}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
