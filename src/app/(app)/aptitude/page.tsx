"use client";

import Link from "next/link";
import { ArrowRight, Star, Timer } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { aptiTopics } from "@/lib/content";
import { useProgress } from "@/lib/progress";

export default function AptitudePage() {
  const { progress } = useProgress();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader
        eyebrow="Aptitude"
        title="Quant, logical & verbal — the OA gatekeeper."
        subtitle="Formulas, shortcut tricks and pattern recognition for every topic, plus thousands of practice questions modelled on TCS NQT, Infosys and Wipro rounds."
        right={
          <Link href="/tests" className="btn btn-primary">
            <Timer size={16} /> Timed mock test
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aptiTopics.map((t) => {
          const stat = progress.apti[t.id];
          const acc =
            stat && stat.attempted
              ? Math.round((stat.correct / stat.attempted) * 100)
              : null;
          const stars = (t.frequency.match(/★/g) || []).length;
          const mcqs = t.questions.filter((q) => q.options).length;
          return (
            <Link
              key={t.id}
              href={`/aptitude/${t.id}`}
              className="surface card-hover p-5 flex flex-col group"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg text-bone leading-snug">
                  {t.name}
                </h3>
                <ArrowRight
                  size={16}
                  className="text-bone-faint group-hover:text-clay-bright group-hover:translate-x-1 transition-all shrink-0 mt-1"
                />
              </div>
              <p className="text-sm text-bone-dim mt-2 line-clamp-2 flex-1">
                {t.why}
              </p>
              <div className="flex items-center justify-between mt-4 text-xs">
                <div className="flex items-center gap-1 text-amber">
                  {Array.from({ length: Math.max(stars, 1) }).map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" />
                  ))}
                </div>
                <span className="text-bone-faint">{mcqs} MCQs</span>
              </div>
              {acc !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-stone-3 overflow-hidden">
                    <div
                      className="h-full bg-olive rounded-full"
                      style={{ width: `${acc}%` }}
                    />
                  </div>
                  <span className="text-xs text-olive">{acc}%</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
