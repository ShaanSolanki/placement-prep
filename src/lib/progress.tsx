"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

export interface TestResult {
  id: string;
  kind: "apti" | "dsa-mixed" | "coding";
  label: string;
  score: number;
  total: number;
  durationSec: number;
  ts: number;
}

export interface Progress {
  coding: Record<string, "solved" | "attempted">;
  complexity: Record<string, { time: string; space: string }>;
  dsaSeen: Record<string, boolean>;
  interviewSeen: Record<string, boolean>;
  bookmarks: Record<string, boolean>;
  apti: Record<string, { attempted: number; correct: number }>;
  tests: TestResult[];
  streak?: { last: string; count: number };
}

const EMPTY: Progress = {
  coding: {},
  complexity: {},
  dsaSeen: {},
  interviewSeen: {},
  bookmarks: {},
  apti: {},
  tests: [],
};

interface ProgressAPI {
  progress: Progress;
  ready: boolean;
  markCoding: (id: string, status: "solved" | "attempted") => void;
  recordComplexity: (id: string, c: { time: string; space: string }) => void;
  markDsaSeen: (id: string) => void;
  markInterviewSeen: (id: string, seen?: boolean) => void;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
  recordApti: (topicId: string, correct: boolean) => void;
  addTest: (r: Omit<TestResult, "id" | "ts">) => void;
  resetAll: () => void;
}

const Ctx = createContext<ProgressAPI | null>(null);
const LS_KEY = "apex_progress_v1";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function mergeProgress(a: Progress, b: Progress): Progress {
  const apti: Progress["apti"] = { ...a.apti };
  for (const [k, v] of Object.entries(b.apti)) {
    apti[k] = {
      attempted: (apti[k]?.attempted || 0) + v.attempted,
      correct: (apti[k]?.correct || 0) + v.correct,
    };
  }
  return {
    coding: { ...a.coding, ...b.coding },
    complexity: { ...a.complexity, ...b.complexity },
    dsaSeen: { ...a.dsaSeen, ...b.dsaSeen },
    interviewSeen: { ...a.interviewSeen, ...b.interviewSeen },
    bookmarks: { ...a.bookmarks, ...b.bookmarks },
    apti,
    tests: [...a.tests, ...b.tests].sort((x, y) => y.ts - x.ts).slice(0, 100),
    streak: b.streak || a.streak,
  };
}

export function ProgressProvider({
  user,
  children,
}: {
  user: User | null;
  children: ReactNode;
}) {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [ready, setReady] = useState(false);
  const uidRef = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load on mount / auth change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setReady(false);
      const local: Progress = (() => {
        try {
          const raw = localStorage.getItem(LS_KEY);
          return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
        } catch {
          return EMPTY;
        }
      })();

      if (user) {
        uidRef.current = user.uid;
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          const remote = (snap.exists() ? snap.data() : {}) as Partial<Progress>;
          const merged = mergeProgress({ ...EMPTY, ...remote } as Progress, local);
          if (!cancelled) {
            setProgress(merged);
            // push merged (so guest progress survives) + clear local guest cache
            await setDoc(doc(db, "users", user.uid), merged, { merge: true });
            localStorage.removeItem(LS_KEY);
          }
        } catch {
          if (!cancelled) setProgress(local);
        }
      } else {
        uidRef.current = null;
        if (!cancelled) setProgress(local);
      }
      if (!cancelled) setReady(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // persist (debounced)
  const persist = (next: Progress) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (uidRef.current) {
        setDoc(doc(db, "users", uidRef.current), next, { merge: true }).catch(
          () => {}
        );
      } else {
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(next));
        } catch {
          /* ignore quota */
        }
      }
    }, 400);
  };

  const update = (fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  };

  const bumpStreak = (p: Progress): Progress["streak"] => {
    const t = todayStr();
    if (p.streak?.last === t) return p.streak;
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const count = p.streak?.last === yesterday ? p.streak.count + 1 : 1;
    return { last: t, count };
  };

  const api: ProgressAPI = {
    progress,
    ready,
    markCoding: (id, status) =>
      update((p) => ({
        ...p,
        coding: {
          ...p.coding,
          [id]: status === "solved" ? "solved" : p.coding[id] || "attempted",
        },
        streak: status === "solved" ? bumpStreak(p) : p.streak,
      })),
    recordComplexity: (id, c) =>
      update((p) => ({
        ...p,
        complexity: { ...p.complexity, [id]: c },
      })),
    markDsaSeen: (id) =>
      update((p) => ({ ...p, dsaSeen: { ...p.dsaSeen, [id]: true } })),
    markInterviewSeen: (id, seen = true) =>
      update((p) => {
        const interviewSeen = { ...p.interviewSeen };
        if (seen) interviewSeen[id] = true;
        else delete interviewSeen[id];
        return { ...p, interviewSeen };
      }),
    toggleBookmark: (key) =>
      update((p) => {
        const bookmarks = { ...p.bookmarks };
        if (bookmarks[key]) delete bookmarks[key];
        else bookmarks[key] = true;
        return { ...p, bookmarks };
      }),
    isBookmarked: (key) => !!progress.bookmarks[key],
    recordApti: (topicId, correct) =>
      update((p) => ({
        ...p,
        apti: {
          ...p.apti,
          [topicId]: {
            attempted: (p.apti[topicId]?.attempted || 0) + 1,
            correct: (p.apti[topicId]?.correct || 0) + (correct ? 1 : 0),
          },
        },
      })),
    addTest: (r) =>
      update((p) => ({
        ...p,
        tests: [
          { ...r, id: crypto.randomUUID(), ts: Date.now() },
          ...p.tests,
        ].slice(0, 100),
        streak: bumpStreak(p),
      })),
    resetAll: () => update(() => ({ ...EMPTY })),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
