"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  BookOpen,
  MessagesSquare,
  Calculator,
  Flame,
  Trophy,
  Check,
  Pencil,
  LogOut,
  Loader2,
  Award,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";
import { codingProblems, dsaCards, interviewConcepts } from "@/lib/content";

export default function ProfilePage() {
  const { user, updateName, logout } = useAuth();
  const { progress, resetAll } = useProgress();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);

  const solved = Object.values(progress.coding).filter(
    (s) => s === "solved"
  ).length;
  const dsaSeen = Object.keys(progress.dsaSeen).length;
  const interviewSeen = Object.keys(progress.interviewSeen || {}).length;
  const apti = Object.values(progress.apti).reduce(
    (a, v) => ({
      attempted: a.attempted + v.attempted,
      correct: a.correct + v.correct,
    }),
    { attempted: 0, correct: 0 }
  );
  const aptiAcc =
    apti.attempted > 0 ? Math.round((apti.correct / apti.attempted) * 100) : 0;
  const streak = progress.streak?.count || 0;
  const testsTaken = progress.tests.length;

  const displayName = user?.displayName || "Student";
  const email = user?.email || "Guest — progress saved locally";
  const initial = (displayName || email || "U")[0].toUpperCase();
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateName(name.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    {
      icon: Code2,
      label: "Problems solved",
      value: solved,
      total: codingProblems.length,
    },
    {
      icon: BookOpen,
      label: "DSA cards reviewed",
      value: dsaSeen,
      total: dsaCards.length,
    },
    {
      icon: MessagesSquare,
      label: "Interview concepts",
      value: interviewSeen,
      total: interviewConcepts.length,
    },
    {
      icon: Calculator,
      label: "Aptitude accuracy",
      value: aptiAcc,
      total: 100,
      suffix: "%",
    },
  ];

  const achievements = [
    { label: "First Blood", desc: "Solve your first problem", got: solved >= 1 },
    { label: "Getting Serious", desc: "Solve 10 problems", got: solved >= 10 },
    { label: "Grinder", desc: "Solve 50 problems", got: solved >= 50 },
    { label: "Bookworm", desc: "Review 25 DSA cards", got: dsaSeen >= 25 },
    { label: "Interview Ready", desc: "Study 20 concepts", got: interviewSeen >= 20 },
    { label: "On Fire", desc: "Hit a 7-day streak", got: streak >= 7 },
    { label: "Sharpshooter", desc: "80%+ aptitude accuracy", got: aptiAcc >= 80 && apti.attempted >= 10 },
    { label: "Mock Master", desc: "Complete 5 tests", got: testsTaken >= 5 },
  ];
  const unlocked = achievements.filter((a) => a.got).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <PageHeader eyebrow="Account" title="Your profile." />

      {/* Identity card */}
      <div className="surface p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-clay/20 border border-clay/30 flex items-center justify-center text-clay-bright text-3xl font-display shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2 max-w-sm">
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
              <button
                onClick={save}
                disabled={saving}
                className="btn btn-primary py-2 shrink-0"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl text-bone truncate">
                {displayName}
              </h2>
              {user && (
                <button
                  onClick={() => {
                    setName(user.displayName || "");
                    setEditing(true);
                  }}
                  className="text-bone-faint hover:text-bone p-1"
                  title="Edit name"
                >
                  <Pencil size={15} />
                </button>
              )}
            </div>
          )}
          <p className="text-bone-dim text-sm mt-1 truncate">{email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {streak > 0 && (
              <span className="pill border border-amber/40 bg-amber/10 text-amber">
                <Flame size={12} /> {streak} day streak
              </span>
            )}
            <span className="pill border border-clay/40 bg-clay/10 text-clay-bright">
              <Award size={12} /> {unlocked}/{achievements.length} badges
            </span>
            {memberSince && (
              <span className="pill">Member since {memberSince}</span>
            )}
          </div>
        </div>
        {!user && (
          <Link href="/login" className="btn btn-primary shrink-0">
            Sign in to sync
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => {
          const Icon = s.icon;
          const pct = s.total ? Math.round((s.value / s.total) * 100) : 0;
          return (
            <div key={s.label} className="surface p-5">
              <div className="w-10 h-10 rounded-[10px] bg-clay/12 border border-clay/25 flex items-center justify-center mb-3">
                <Icon size={18} className="text-clay-bright" />
              </div>
              <div className="font-display text-3xl text-bone">
                {s.value}
                {s.suffix || (
                  <span className="text-bone-faint text-lg">/{s.total}</span>
                )}
              </div>
              <div className="text-sm text-bone-dim mt-0.5">{s.label}</div>
              <div className="mt-3 h-1.5 rounded-full bg-stone-3 overflow-hidden">
                <div
                  className="h-full bg-clay rounded-full transition-all"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <div className="surface p-6 mt-6">
        <h2 className="font-display text-xl text-bone mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-clay-bright" /> Achievements
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {achievements.map((a) => (
            <div
              key={a.label}
              className={`surface-2 p-4 border ${
                a.got
                  ? "border-olive/40 bg-olive/5"
                  : "border-line opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                {a.got ? (
                  <Check size={15} className="text-olive shrink-0" />
                ) : (
                  <Target size={15} className="text-bone-faint shrink-0" />
                )}
                <span
                  className={`text-sm font-medium ${
                    a.got ? "text-bone" : "text-bone-faint"
                  }`}
                >
                  {a.label}
                </span>
              </div>
              <p className="text-xs text-bone-faint mt-1.5 leading-relaxed">
                {a.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Account actions */}
      <div className="surface p-6 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-bone font-medium">Account</h3>
          <p className="text-sm text-bone-faint mt-0.5">
            Manage your session and local data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm("Reset all your progress? This cannot be undone."))
                resetAll();
            }}
            className="btn btn-outline py-2"
          >
            Reset progress
          </button>
          {user && (
            <button onClick={() => logout()} className="btn btn-ghost py-2">
              <LogOut size={15} /> Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
