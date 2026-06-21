"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Binary,
  Code2,
  Timer,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TestEngine, type TestItem } from "@/components/TestEngine";
import { buildAptiTest, buildDsaConceptTest } from "@/lib/tests";
import { aptiTopics, codingProblems, shuffle } from "@/lib/content";
import { useProgress } from "@/lib/progress";

type Active = {
  title: string;
  kind: "apti" | "dsa-mixed";
  items: TestItem[];
  duration: number;
} | null;

export default function TestsPage() {
  const { progress } = useProgress();
  const [active, setActive] = useState<Active>(null);
  const [aptiCount, setAptiCount] = useState(20);
  const [aptiTopic, setAptiTopic] = useState("all");
  const [dsaCount, setDsaCount] = useState(15);
  const [sprint, setSprint] = useState<typeof codingProblems>([]);

  useEffect(() => {
    setSprint(shuffle(codingProblems).slice(0, 5));
  }, []);

  if (active) {
    return (
      <TestEngine
        title={active.title}
        kind={active.kind}
        items={active.items}
        durationSec={active.duration}
        onExit={() => setActive(null)}
      />
    );
  }

  const startApti = () => {
    const items = buildAptiTest(aptiCount, aptiTopic);
    if (items.length === 0) return;
    setActive({
      title:
        aptiTopic === "all"
          ? "Aptitude Mixed Mock"
          : `${aptiTopics.find((t) => t.id === aptiTopic)?.name} Test`,
      kind: "apti",
      items,
      duration: items.length * 45,
    });
  };

  const startDsa = () => {
    const items = buildDsaConceptTest(dsaCount);
    setActive({
      title: "DSA Combined Concept Test",
      kind: "dsa-mixed",
      items,
      duration: items.length * 40,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader
        eyebrow="Test Center"
        title="Simulate the real round."
        subtitle="Timed mock tests with a question palette, flagging and full review — exactly like the online assessments you'll sit for."
        right={
          progress.tests.length > 0 ? (
            <div className="surface px-5 py-3 text-center">
              <div className="font-display text-3xl text-clay-bright">
                {progress.tests.length}
              </div>
              <div className="text-xs text-bone-faint mt-0.5">tests taken</div>
            </div>
          ) : undefined
        }
      />

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Aptitude test */}
        <div className="surface p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-[10px] bg-clay/12 border border-clay/25 flex items-center justify-center">
              <Calculator size={20} className="text-clay-bright" />
            </div>
            <div>
              <h3 className="font-display text-xl text-bone">Aptitude Mock</h3>
              <p className="text-xs text-bone-faint">
                Quant · Logical · Verbal — TCS/Infosys style
              </p>
            </div>
          </div>
          <p className="text-sm text-bone-dim leading-relaxed mb-4">
            A timed MCQ set drawn across topics. ~45 seconds per question, just
            like a real OA.
          </p>
          <label className="text-xs text-bone-faint">Topic</label>
          <select
            className="input mt-1 mb-3"
            value={aptiTopic}
            onChange={(e) => setAptiTopic(e.target.value)}
          >
            <option value="all">All topics (mixed)</option>
            {aptiTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mb-4">
            {[10, 20, 30].map((n) => (
              <button
                key={n}
                onClick={() => setAptiCount(n)}
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                  aptiCount === n
                    ? "border-clay/50 bg-clay/10 text-clay-bright"
                    : "border-line text-bone-dim hover:text-bone"
                }`}
              >
                {n} Q
              </button>
            ))}
          </div>
          <button onClick={startApti} className="btn btn-primary w-full">
            <Timer size={16} /> Start {aptiCount}-question test
          </button>
        </div>

        {/* DSA combined test */}
        <div className="surface p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-[10px] bg-clay/12 border border-clay/25 flex items-center justify-center">
              <Binary size={20} className="text-clay-bright" />
            </div>
            <div>
              <h3 className="font-display text-xl text-bone">
                DSA Combined Test
              </h3>
              <p className="text-xs text-bone-faint">
                Every data type · pattern & complexity recall
              </p>
            </div>
          </div>
          <p className="text-sm text-bone-dim leading-relaxed mb-4">
            Mixed questions spanning arrays, strings, trees, graphs, DP and more
            — identify the right pattern and optimal complexity under time
            pressure.
          </p>
          <div className="flex gap-2 mb-4">
            {[10, 15, 25].map((n) => (
              <button
                key={n}
                onClick={() => setDsaCount(n)}
                className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
                  dsaCount === n
                    ? "border-clay/50 bg-clay/10 text-clay-bright"
                    : "border-line text-bone-dim hover:text-bone"
                }`}
              >
                {n} Q
              </button>
            ))}
          </div>
          <button onClick={startDsa} className="btn btn-primary w-full">
            <Timer size={16} /> Start combined DSA test
          </button>
        </div>
      </div>

      {/* Coding sprint */}
      <div className="surface p-6 mt-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-[10px] bg-clay/12 border border-clay/25 flex items-center justify-center">
            <Code2 size={20} className="text-clay-bright" />
          </div>
          <div>
            <h3 className="font-display text-xl text-bone">Coding Sprint</h3>
            <p className="text-xs text-bone-faint">
              5 hand-picked problems to solve in the judge
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2 mt-4">
          {sprint.map((p) => {
            const solved = progress.coding[p.id] === "solved";
            return (
              <Link
                key={p.id}
                href={`/code/${p.id}`}
                className={`surface-2 card-hover p-3 text-sm ${
                  solved ? "border-olive/40" : ""
                }`}
              >
                <div className="text-bone line-clamp-2">{p.title}</div>
                <div className="text-xs text-bone-faint mt-2 flex items-center gap-1">
                  {solved ? (
                    <>
                      <Trophy size={11} className="text-olive" /> solved
                    </>
                  ) : (
                    <>
                      {p.topic} <ArrowRight size={11} />
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
