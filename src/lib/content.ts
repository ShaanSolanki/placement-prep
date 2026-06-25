import dsaRaw from "@/data/dsa.json";
import aptiRaw from "@/data/apti.json";
import interviewRaw from "@/data/interview.json";
import codingRaw from "@/data/coding.json";

export interface DsaCard {
  id: string;
  topic: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  frequency: string;
  importance: string;
  companies: string[];
  pattern: string;
  statement: string;
  example: { input: string; output: string };
  constraints: string;
  hint: string;
  keyIdea: string;
  complexity: { time: string; space: string };
  similar: string[];
  rookieMistake: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  topic: string;
  category?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  statement: string;
  examples: { input: string; output: string }[];
  constraints: string;
  funcName: string;
  params: string[];
  argTypes?: string[];
  retType?: string;
  compare: string;
  starter: string;
  solution: string;
  tests: { input: unknown[]; expected: unknown }[];
}

export interface AptiQuestion {
  id: string;
  q: string;
  solution: string;
  shortcut: string;
  answer: string;
  difficulty: string;
  askedIn: string[];
  options: string[] | null;
}

export interface AptiTopic {
  id: string;
  name: string;
  why: string;
  where: string;
  difficulty: string;
  frequency: string;
  formulas: string[];
  shortcuts: string[];
  patternRecognition: string;
  questions: AptiQuestion[];
}

export interface InterviewConcept {
  id: string;
  title: string;
  why: string;
  realWorld: string;
  definition: string;
  howItWorks: string;
  questions: string[];
  mistakes: string[];
  code: string;
  memoryTrick: string;
  fastRevision: string;
  section: string;
}

export const dsaCards = dsaRaw as DsaCard[];
export const codingProblems = codingRaw as CodingProblem[];
export const aptiTopics = aptiRaw as AptiTopic[];
export const interviewConcepts = interviewRaw as InterviewConcept[];

// ---- DSA helpers ----
export const dsaTopics: string[] = (() => {
  const seen: string[] = [];
  for (const c of dsaCards) if (!seen.includes(c.topic)) seen.push(c.topic);
  return seen;
})();

export function dsaByTopic(topic: string) {
  return dsaCards.filter((c) => c.topic === topic);
}
export function dsaCardById(id: string) {
  return dsaCards.find((c) => c.id === id);
}
// link a study card to an executable coding problem if one exists
export function codingForTitle(title: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return codingProblems.find((p) => norm(p.title) === norm(title));
}
export function codingById(id: string) {
  return codingProblems.find((p) => p.id === id);
}
export function codingCat(p: CodingProblem) {
  return p.category || p.topic;
}

// preferred display order for the DSA data-type categories
const CATEGORY_ORDER = [
  "Arrays",
  "Strings",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack & Queue",
  "Linked List",
  "Binary Search",
  "Trees",
  "Dynamic Programming",
  "Greedy & Backtracking",
  "Math & Bit",
  "Matrix & Graph",
];

export const codingCategories: string[] = (() => {
  const present = new Set(codingProblems.map(codingCat));
  const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
  for (const c of present) if (!ordered.includes(c)) ordered.push(c);
  return ordered;
})();

export const codingTopics = codingCategories;

export function codingByCategory(cat: string) {
  const order = { Easy: 0, Medium: 1, Hard: 2 } as Record<string, number>;
  return codingProblems
    .filter((p) => codingCat(p) === cat)
    .sort((a, b) => order[a.difficulty] - order[b.difficulty]);
}

// neighbours within the same data-type category, for prev/next navigation
export function codingSiblings(id: string) {
  const cur = codingById(id);
  if (!cur) return { list: [], index: -1, prev: undefined, next: undefined };
  const list = codingByCategory(codingCat(cur));
  const index = list.findIndex((p) => p.id === id);
  return {
    list,
    index,
    prev: index > 0 ? list[index - 1] : undefined,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : undefined,
  };
}

export const CATEGORY_BLURB: Record<string, string> = {
  Arrays: "Scanning, prefix sums, in-place tricks and Kadane.",
  Strings: "Parsing, palindromes, anagrams and pattern matching.",
  Hashing: "Hash maps & sets for O(1) lookups and counting.",
  "Two Pointers": "Opposite/!same-direction pointers on sorted data.",
  "Sliding Window": "Variable & fixed windows for subarray/substring problems.",
  "Stack & Queue": "LIFO/FIFO, monotonic stacks and expression parsing.",
  "Linked List": "Pointer surgery — reverse, merge, cycle, reorder.",
  "Binary Search": "Search space halving on arrays and on answers.",
  Trees: "DFS/BFS, traversals, BST properties and recursion.",
  "Dynamic Programming": "Optimal substructure — 1D, 2D, knapsack, strings.",
  "Greedy & Backtracking": "Local choices and exhaustive search with pruning.",
  "Math & Bit": "Number theory, bit manipulation and arithmetic.",
  "Matrix & Graph": "Grid traversal, islands, topological sort.",
};

// ---- Apti helpers ----
export function aptiTopicById(id: string) {
  return aptiTopics.find((t) => t.id === id);
}
export const aptiMcqPool: { topicId: string; topicName: string; q: AptiQuestion }[] =
  aptiTopics.flatMap((t) =>
    t.questions
      .filter((q) => q.options && q.options.length === 4)
      .map((q) => ({ topicId: t.id, topicName: t.name, q }))
  );

// ---- Interview helpers ----
export const interviewSections: string[] = (() => {
  const seen: string[] = [];
  for (const c of interviewConcepts)
    if (!seen.includes(c.section)) seen.push(c.section);
  return seen;
})();
export function interviewBySection(section: string) {
  return interviewConcepts.filter((c) => c.section === section);
}
export function interviewById(id: string) {
  return interviewConcepts.find((c) => c.id === id);
}
// neighbours within the same section, for prev/next study navigation
export function interviewSiblings(id: string) {
  const cur = interviewById(id);
  if (!cur) return { list: [], index: -1, prev: undefined, next: undefined };
  const list = interviewBySection(cur.section);
  const index = list.findIndex((c) => c.id === id);
  return {
    list,
    index,
    prev: index > 0 ? list[index - 1] : undefined,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : undefined,
  };
}

// ---- shared ----
export function difficultyClass(d: string) {
  const x = d.toLowerCase();
  if (x.startsWith("easy")) return "pill-easy";
  if (x.startsWith("hard")) return "pill-hard";
  return "pill-medium";
}

export function shuffle<T>(arr: T[], seed = Math.random()): T[] {
  const a = [...arr];
  let s = Math.floor(seed * 1e9) || 1;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
