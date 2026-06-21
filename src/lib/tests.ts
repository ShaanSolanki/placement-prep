import { aptiMcqPool, dsaCards, shuffle } from "./content";
import type { TestItem } from "@/components/TestEngine";

export function buildAptiTest(count: number, topicId?: string): TestItem[] {
  let pool = aptiMcqPool;
  if (topicId && topicId !== "all")
    pool = pool.filter((p) => p.topicId === topicId);
  const picked = shuffle(pool).slice(0, count);
  return picked.map(({ q, topicId, topicName }, i) => ({
    id: `apti-${i}-${q.id}`,
    q: q.q,
    options: shuffle(q.options as string[]),
    answer: q.answer,
    topicId,
    explain: q.solution
      ? `${q.solution}${q.shortcut ? ` — ${q.shortcut}` : ""} (${topicName})`
      : undefined,
  }));
}

const COMPLEXITIES = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
  "O(n^2)",
  "O(n^3)",
  "O(2^n)",
];

function normComplexity(t: string): string | null {
  const m = t.match(/O\([^)]*\)/);
  if (!m) return null;
  const v = m[0].replace(/\s+/g, "");
  const found = COMPLEXITIES.find((c) => c.replace(/\s+/g, "") === v);
  return found || null;
}

export function buildDsaConceptTest(count: number): TestItem[] {
  const patterns = Array.from(
    new Set(dsaCards.map((c) => c.pattern).filter(Boolean))
  );
  const items: TestItem[] = [];
  const cards = shuffle(dsaCards);

  for (const card of cards) {
    if (items.length >= count) break;
    // alternate between complexity & pattern questions
    const useComplexity = items.length % 2 === 0;
    if (useComplexity) {
      const ans = normComplexity(card.complexity.time || "");
      if (!ans) continue;
      const distract = shuffle(
        COMPLEXITIES.filter((c) => c !== ans)
      ).slice(0, 3);
      items.push({
        id: `dsa-c-${card.topic}-${card.id}`,
        q: `What is the optimal time complexity to solve “${card.title}” (${card.topic})?`,
        options: shuffle([ans, ...distract]),
        answer: ans,
        explain: card.keyIdea,
      });
    } else {
      if (!card.pattern) continue;
      const distract = shuffle(
        patterns.filter((p) => p !== card.pattern)
      ).slice(0, 3);
      if (distract.length < 3) continue;
      items.push({
        id: `dsa-p-${card.topic}-${card.id}`,
        q: `Which technique most directly solves “${card.title}” (${card.topic})?`,
        options: shuffle([card.pattern, ...distract]),
        answer: card.pattern,
        explain: card.hint,
      });
    }
  }
  return items.slice(0, count);
}
