"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowLeft,
  Code2,
  Lightbulb,
  Key,
  Building2,
  AlertTriangle,
  Clock,
  GitBranch,
} from "lucide-react";
import { dsaCardById, difficultyClass, codingForTitle } from "@/lib/content";
import { useProgress } from "@/lib/progress";

export default function DsaDetail() {
  const params = useParams<{ id: string }>();
  const card = dsaCardById(params.id);
  const { markDsaSeen } = useProgress();

  useEffect(() => {
    if (card) markDsaSeen(card.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id]);

  if (!card) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-bone-dim">Card not found.</p>
        <Link href="/dsa" className="btn btn-ghost mt-4">
          Back to cards
        </Link>
      </div>
    );
  }

  const coding = codingForTitle(card.title);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/dsa"
        className="text-sm text-bone-faint hover:text-bone flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft size={15} /> All cards
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="pill pill-clay">{card.topic}</span>
        <span className={`pill ${difficultyClass(card.difficulty)}`}>
          {card.difficulty}
        </span>
        {card.frequency && <span className="pill">Freq: {card.frequency}</span>}
        {card.importance && <span className="pill">{card.importance}</span>}
      </div>

      <h1 className="font-display text-3xl md:text-4xl text-bone mb-4">
        {card.title}
      </h1>

      <p className="text-lg text-bone leading-relaxed">{card.statement}</p>

      {coding && (
        <Link href={`/code/${coding.id}`} className="btn btn-primary mt-6">
          <Code2 size={16} /> Solve this in the Code Judge
        </Link>
      )}

      {/* Example */}
      <div className="surface-2 p-5 mt-6">
        <div className="eyebrow mb-3">Example</div>
        <div className="font-mono text-sm space-y-1.5">
          <div>
            <span className="text-bone-faint">Input: </span>
            <span className="text-bone">{card.example.input}</span>
          </div>
          <div>
            <span className="text-bone-faint">Output: </span>
            <span className="text-olive">{card.example.output}</span>
          </div>
        </div>
        {card.constraints && (
          <div className="mt-3 pt-3 border-t border-line text-sm font-mono text-bone-dim">
            <span className="text-bone-faint">Constraints: </span>
            {card.constraints}
          </div>
        )}
      </div>

      {/* Insight grid */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <InfoBlock icon={Lightbulb} title="Quick hint" tone="amber">
          {card.hint}
        </InfoBlock>
        <InfoBlock icon={Key} title="Key idea" tone="clay">
          {card.keyIdea}
        </InfoBlock>
        <InfoBlock icon={GitBranch} title="Pattern" tone="slate">
          {card.pattern}
        </InfoBlock>
        <InfoBlock icon={Clock} title="Optimal complexity" tone="olive">
          Time {card.complexity.time || "—"} · Space{" "}
          {card.complexity.space || "—"}
        </InfoBlock>
      </div>

      {card.rookieMistake && (
        <div className="mt-4 surface-2 p-5 border-l-2 border-rust">
          <div className="flex items-center gap-2 text-rust text-sm font-medium mb-1.5">
            <AlertTriangle size={15} /> Rookie mistake
          </div>
          <p className="text-bone-dim text-sm leading-relaxed">
            {card.rookieMistake}
          </p>
        </div>
      )}

      {card.companies.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-sm text-bone-faint mb-2">
            <Building2 size={15} /> Asked at
          </div>
          <div className="flex flex-wrap gap-2">
            {card.companies.map((c) => (
              <span key={c} className="pill">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {card.similar.length > 0 && (
        <div className="mt-6">
          <div className="text-sm text-bone-faint mb-2">Similar questions</div>
          <div className="flex flex-wrap gap-2">
            {card.similar.map((s) => (
              <span key={s} className="pill">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  tone: "amber" | "clay" | "slate" | "olive";
  children: React.ReactNode;
}) {
  const color = {
    amber: "text-amber",
    clay: "text-clay-bright",
    slate: "text-slate",
    olive: "text-olive",
  }[tone];
  return (
    <div className="surface-2 p-5">
      <div className={`flex items-center gap-2 text-sm font-medium mb-1.5 ${color}`}>
        <Icon size={15} /> {title}
      </div>
      <p className="text-bone-dim text-sm leading-relaxed">{children}</p>
    </div>
  );
}
