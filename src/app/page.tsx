import Link from "next/link";
import {
  Code2,
  BookOpen,
  Calculator,
  MessagesSquare,
  Timer,
  ArrowRight,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import {
  dsaCards,
  codingProblems,
  aptiMcqPool,
  interviewConcepts,
  aptiTopics,
} from "@/lib/content";

const stats = [
  { value: dsaCards.length, label: "DSA question cards" },
  { value: codingProblems.length, label: "Live coding problems" },
  { value: aptiMcqPool.length, label: "Aptitude MCQs" },
  { value: interviewConcepts.length, label: "Interview concepts" },
];

const modules = [
  {
    href: "/code",
    icon: Code2,
    title: "Code Judge",
    desc: "LeetCode-style problems with a real Python editor and hidden test cases that run instantly in your browser.",
    meta: `${codingProblems.length} problems · Python`,
  },
  {
    href: "/dsa",
    icon: BookOpen,
    title: "DSA Cards",
    desc: "300 interview question cards across 20 topics — pattern, hint, key idea, complexity and company tags.",
    meta: "20 topics · Arrays → DP",
  },
  {
    href: "/aptitude",
    icon: Calculator,
    title: "Aptitude",
    desc: "Quant, logical & verbal drills with formulas, shortcut tricks and timed MCQ tests modelled on TCS / Infosys OAs.",
    meta: `${aptiTopics.length} topics · ${aptiMcqPool.length} MCQs`,
  },
  {
    href: "/interview",
    icon: MessagesSquare,
    title: "Interview Prep",
    desc: "Full-stack survival guide — JS, React, Next, Node, SQL, system design with answers, code and memory hooks.",
    meta: "12 sections · senior-dev notes",
  },
  {
    href: "/tests",
    icon: Timer,
    title: "Test Center",
    desc: "Mixed mock tests across every data type, timed aptitude sets and coding sprints to simulate the real round.",
    meta: "Mixed · timed · scored",
  },
];

export default function Landing() {
  return (
    <div className="relative z-10">
      <header className="glass-nav sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Brand />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn btn-outline">
              Sign in
            </Link>
            <Link href="/dashboard" className="btn btn-primary">
              Open Studio <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl animate-fadeUp">
          <div className="pill pill-clay mb-6">
            <Terminal size={13} /> End-to-end placement preparation
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-balance text-bone">
            Crack placements from{" "}
            <span className="text-clay-bright italic">one calm</span> workspace.
          </h1>
          <p className="mt-6 text-lg text-bone-dim leading-relaxed max-w-2xl">
            Lock In brings DSA coding practice, aptitude drills and full-stack
            interview prep together — a single, distraction-free studio built
            around a real in-browser code judge. Solve, test, track, repeat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/code" className="btn btn-primary text-base px-6 py-3">
              Start solving <ArrowRight size={16} />
            </Link>
            <Link href="/dsa" className="btn btn-ghost text-base px-6 py-3">
              Browse the question bank
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-bone-faint">
            {[
              "Runs Python in the browser",
              "Real hidden test cases",
              "Progress synced to your account",
            ].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-olive" /> {f}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {stats.map((s) => (
            <div key={s.label} className="surface p-5">
              <div className="font-display text-4xl text-clay-bright">
                {s.value}
              </div>
              <div className="text-sm text-bone-dim mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="eyebrow mb-3">The studio</div>
        <h2 className="font-display text-3xl text-bone mb-8">
          Five rooms, one goal — a job offer.
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="surface card-hover p-6 flex flex-col group"
              >
                <div className="w-11 h-11 rounded-[10px] bg-clay/12 border border-clay/25 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-clay-bright" />
                </div>
                <h3 className="font-display text-xl text-bone mb-2">
                  {m.title}
                </h3>
                <p className="text-sm text-bone-dim leading-relaxed flex-1">
                  {m.desc}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-bone-faint">{m.meta}</span>
                  <ArrowRight
                    size={16}
                    className="text-bone-faint group-hover:text-clay-bright group-hover:translate-x-1 transition-all"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-bone-faint">
          <Brand />
          <p>
            Built for campus placements, internships &amp; product-company
            screens.
          </p>
        </div>
      </footer>
    </div>
  );
}
