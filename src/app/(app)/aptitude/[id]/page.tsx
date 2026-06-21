"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Sigma,
  Zap,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { aptiTopicById, type AptiQuestion } from "@/lib/content";
import { useProgress } from "@/lib/progress";

export default function AptiTopicPage() {
  const params = useParams<{ id: string }>();
  const topic = aptiTopicById(params.id);
  const [tab, setTab] = useState<"study" | "practice">("study");

  if (!topic) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-bone-dim">Topic not found.</p>
        <Link href="/aptitude" className="btn btn-ghost mt-4">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/aptitude"
        className="text-sm text-bone-faint hover:text-bone flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft size={15} /> Aptitude
      </Link>

      <div className="eyebrow mb-2">Aptitude topic</div>
      <h1 className="font-display text-3xl md:text-4xl text-bone">
        {topic.name}
      </h1>
      <p className="text-bone-dim mt-2 leading-relaxed">{topic.why}</p>
      {topic.where && (
        <p className="text-sm text-bone-faint mt-1">Appears in: {topic.where}</p>
      )}

      <div className="flex gap-1 surface p-1 mt-6 w-fit">
        {(["study", "practice"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm capitalize transition-colors ${
              tab === t
                ? "bg-clay/15 text-clay-bright"
                : "text-bone-dim hover:text-bone"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "study" ? (
        <div className="mt-6 space-y-4">
          {topic.formulas.length > 0 && (
            <Section icon={Sigma} title="Core formulas" tone="clay">
              <ul className="space-y-1.5">
                {topic.formulas.map((f, i) => (
                  <li key={i} className="text-bone-dim text-sm leading-relaxed">
                    {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {topic.shortcuts.length > 0 && (
            <Section icon={Zap} title="Shortcut tricks" tone="amber">
              <ul className="space-y-1.5">
                {topic.shortcuts.map((f, i) => (
                  <li key={i} className="text-bone-dim text-sm leading-relaxed">
                    {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {topic.patternRecognition && (
            <Section icon={Eye} title="Pattern recognition" tone="slate">
              <p className="text-bone-dim text-sm leading-relaxed">
                {topic.patternRecognition}
              </p>
            </Section>
          )}
          <button onClick={() => setTab("practice")} className="btn btn-primary">
            Start practising <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <Practice topic={topic.id} questions={topic.questions} />
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  tone: "clay" | "amber" | "slate";
  children: React.ReactNode;
}) {
  const color = {
    clay: "text-clay-bright",
    amber: "text-amber",
    slate: "text-slate",
  }[tone];
  return (
    <div className="surface p-5">
      <div className={`flex items-center gap-2 text-sm font-medium mb-3 ${color}`}>
        <Icon size={16} /> {title}
      </div>
      {children}
    </div>
  );
}

function Practice({
  topic,
  questions,
}: {
  topic: string;
  questions: AptiQuestion[];
}) {
  const { recordApti } = useProgress();
  const pool = useMemo(
    () => questions.filter((q) => q.options && q.options.length === 4),
    [questions]
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealNonMcq, setRevealNonMcq] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  if (pool.length === 0) {
    // fall back to flashcards for topics without generated MCQs
    return <Flashcards questions={questions} />;
  }

  const q = pool[idx];
  const answered = picked !== null;

  const choose = (opt: string) => {
    if (answered) return;
    setPicked(opt);
    const ok = opt === q.answer;
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    recordApti(topic, ok);
  };

  const next = () => {
    setPicked(null);
    setRevealNonMcq(false);
    setIdx((i) => (i + 1) % pool.length);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-bone-faint">
          Question {idx + 1} of {pool.length}
        </span>
        <span className="text-bone-dim">
          Score: <span className="text-olive">{score.correct}</span>/
          {score.total}
        </span>
      </div>

      <div className="surface p-6">
        <p className="text-lg text-bone leading-relaxed">{q.q}</p>
        <div className="grid gap-2.5 mt-5">
          {q.options!.map((opt) => {
            const isAnswer = opt === q.answer;
            const isPicked = opt === picked;
            let cls =
              "border-line hover:border-line-2 text-bone-dim hover:text-bone";
            if (answered && isAnswer)
              cls = "border-olive/50 bg-olive/10 text-olive";
            else if (answered && isPicked)
              cls = "border-rust/50 bg-rust/10 text-rust";
            else if (answered) cls = "border-line text-bone-faint";
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={answered}
                className={`text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between gap-2 ${cls}`}
              >
                <span>{opt}</span>
                {answered && isAnswer && <CheckCircle2 size={16} />}
                {answered && isPicked && !isAnswer && <XCircle size={16} />}
              </button>
            );
          })}
        </div>

        {answered && (q.shortcut || q.solution) && (
          <div className="mt-4 surface-2 p-4 border-l-2 border-clay">
            <div className="flex items-center gap-1.5 text-clay-bright text-sm font-medium mb-1">
              <Lightbulb size={14} /> Approach
            </div>
            <p className="text-sm text-bone-dim leading-relaxed">
              {q.solution || q.shortcut}
            </p>
            {q.shortcut && q.solution && (
              <p className="text-sm text-bone-faint mt-2">
                Shortcut: {q.shortcut}
              </p>
            )}
          </div>
        )}
      </div>

      {answered && (
        <button onClick={next} className="btn btn-primary mt-4">
          Next question <ChevronRight size={16} />
        </button>
      )}
      {!answered && revealNonMcq && (
        <p className="text-sm text-bone-faint mt-3">Pick an option above.</p>
      )}
    </div>
  );
}

function Flashcards({ questions }: { questions: AptiQuestion[] }) {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const q = questions[idx];
  return (
    <div className="mt-6">
      <div className="text-sm text-bone-faint mb-4">
        Flashcard {idx + 1} of {questions.length} · open-ended drill
      </div>
      <div className="surface p-6 min-h-[200px] flex flex-col">
        <p className="text-lg text-bone leading-relaxed flex-1">{q.q}</p>
        {show ? (
          <div className="mt-4 space-y-2">
            <div className="surface-2 p-4">
              <div className="text-xs text-olive uppercase tracking-wider mb-1">
                Answer
              </div>
              <p className="text-bone">{q.answer}</p>
            </div>
            {(q.solution || q.shortcut) && (
              <p className="text-sm text-bone-dim leading-relaxed">
                {q.solution} {q.shortcut && `· ${q.shortcut}`}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShow(true)}
            className="btn btn-ghost mt-4 w-fit"
          >
            <Eye size={15} /> Reveal answer
          </button>
        )}
      </div>
      <button
        onClick={() => {
          setShow(false);
          setIdx((i) => (i + 1) % questions.length);
        }}
        className="btn btn-primary mt-4"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
