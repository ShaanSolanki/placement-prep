// Heuristic Big-O estimator for a user's Python solution.
// This is an ESTIMATE based on code structure (loop nesting, recursion,
// sorting, amortised two-pointer / traversal patterns). It is meant for
// quick guidance, not a formal proof — always reason about your own code.

export interface ComplexityEstimate {
  time: string;
  space: string;
  note: string;
}

const RANK = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)"];
const rankOf = (l: string) => {
  const i = RANK.indexOf(l);
  return i < 0 ? 2 : i;
};
const maxLabel = (a: string, b: string) => (rankOf(a) >= rankOf(b) ? a : b);

/** Ordinal rank of a Big-O label (higher = slower). Exposed for comparisons. */
export function complexityRank(label: string): number {
  return rankOf(label);
}

export type ComplexityVerdict = "optimal" | "close" | "improve";

/**
 * Compare a user's estimate against the optimal (reference) complexity.
 * `time` is weighted more heavily than `space`, like a typical judge.
 */
export function gradeComplexity(
  mine: ComplexityEstimate,
  optimal: ComplexityEstimate
): ComplexityVerdict {
  const dt = rankOf(mine.time) - rankOf(optimal.time);
  const ds = rankOf(mine.space) - rankOf(optimal.space);
  if (dt <= 0 && ds <= 0) return "optimal";
  if (dt <= 1 && ds <= 1) return "close";
  return "improve";
}

export function analyzeComplexity(code: string): ComplexityEstimate {
  const lines = code.split("\n").map((l) => l.replace(/#.*$/, ""));
  const flat = lines.join("\n");

  const funcMatch = flat.match(/def\s+(\w+)\s*\(/);
  const funcName = funcMatch ? funcMatch[1] : "";

  // recursion
  let selfCalls = 0;
  if (funcName) {
    const re = new RegExp("\\b" + funcName + "\\s*\\(", "g");
    selfCalls = Math.max(0, (flat.match(re) || []).length - 1);
  }
  const memoized = /lru_cache|@cache|\bmemo\b/.test(flat);
  // shrink-by-constant-factor loops → logarithmic (binary search, bit / digit peeling)
  const logLoop =
    /\/\/\s*2|>>\s*1|>>=|\bmid\b|\(\s*(lo|low|left|l)\s*\+\s*(hi|high|right|r)\s*\)|&=\s*\w+\s*-\s*1|\/\/=\s*\d|\/\/\s*10/.test(
      flat
    );

  // loop nesting via indentation, with a typed stack so that a chain of nested
  // `while` pointer loops (two-pointer / dedup) counts as a single level.
  const indent = (l: string) => l.match(/^\s*/)![0].replace(/\t/g, "    ").length;
  let maxDepth = 0;
  let maxCompFor = 0;
  let numFor = 0;
  let numWhile = 0;
  let traversal = false;
  const stack: { ind: number; type: "for" | "while" }[] = [];

  const effDepth = () =>
    stack.filter((s, i) => s.type === "for" || i === 0 || stack[i - 1].type !== "while")
      .length;

  for (const l of lines) {
    const t = l.trim();
    if (t === "") continue;
    const ind = indent(l);
    while (stack.length && ind <= stack[stack.length - 1].ind) stack.pop();
    const isFor = /^for\b/.test(t);
    const isWhile = /^while\b/.test(t);
    if (isFor || isWhile) {
      stack.push({ ind, type: isFor ? "for" : "while" });
      maxDepth = Math.max(maxDepth, effDepth());
      if (isFor) numFor++;
      else numWhile++;
      if (isWhile && /\b(q|queue|stack|dq|deque|heap|frontier)\b/.test(t))
        traversal = true;
    }
    const compFors = (l.match(/\bfor\b/g) || []).length - (isFor ? 1 : 0);
    if (compFors > 0) {
      maxCompFor = Math.max(maxCompFor, compFors);
      maxDepth = Math.max(maxDepth, effDepth() + compFors);
    }
  }

  // amortised two-pointer / sliding window: a pointer set before a for-loop and
  // advanced by an inner while (the inner while does not multiply the cost).
  const amortised =
    /(left|lo|low|start)\s*=\s*0[\s\S]{0,400}?\bfor\b[\s\S]{0,400}?\bwhile\b[\s\S]{0,200}?(left|lo|low|start)\s*(\+=|-=)/.test(
      flat
    );

  const hasSort = /\bsorted\s*\(|\.sort\s*\(/.test(flat);
  // heap operations are O(log n) each; inside a single loop → O(n log n)
  const usesHeap = /heapq\.|heappush|heappop|heapify/.test(flat);

  // ---- TIME ----
  let time: string;
  let depth = maxDepth;
  if (traversal && depth >= 2) depth = 1; // BFS/DFS amortised to linear
  if (amortised && depth >= 2) depth = Math.max(1, depth - 1); // sliding window

  const pureBinarySearch =
    numFor === 0 && numWhile >= 1 && logLoop && maxCompFor === 0 && selfCalls === 0;
  const divideConquer = selfCalls >= 2 && logLoop;

  if (divideConquer) {
    time = "O(n log n)";
  } else if (selfCalls >= 2 && !memoized) {
    time = "O(2ⁿ)";
  } else if (pureBinarySearch) {
    time = "O(log n)";
  } else {
    time =
      depth <= 0
        ? "O(1)"
        : depth === 1
        ? "O(n)"
        : depth === 2
        ? "O(n²)"
        : "O(n³)";
    if (hasSort) time = maxLabel(time, "O(n log n)");
    // a heap touched inside (at least) one loop pushes an O(n) pass to O(n log n)
    if (usesHeap && depth >= 1) time = maxLabel(time, "O(n log n)");
    if (selfCalls === 1 && logLoop) time = maxLabel(time, "O(log n)");
    if (selfCalls >= 1 && depth >= 1) time = maxLabel(time, "O(n)");
  }

  // ---- SPACE ----
  let space = "O(1)";
  const twoD =
    /\]\s*for\s+\w+\s+in[\s\S]*?for\s+\w+\s+in/.test(flat) ||
    /\[\s*\[[^\]]*\]\s*\*/.test(flat) ||
    /\bfor\b.*\bfor\b.*\]/.test(flat);
  const allocN =
    /\bset\s*\(|\bdict\s*\(|Counter|defaultdict|\[\s*0\s*\]\s*\*|\[\s*None\s*\]\s*\*|\*\s*(len|n|amount)\b|=\s*\[\]|=\s*\{\}|=\s*set\(\)|deque|\.append\b|\bseen\b|\bdp\b|\bres\b\s*=\s*\[|\bstack\b|\bvisited\b/.test(
      flat
    );
  if (twoD) space = "O(n²)";
  else if (allocN) space = "O(n)";
  if (selfCalls >= 1)
    space = maxLabel(space, logLoop && selfCalls < 2 ? "O(log n)" : "O(n)");

  // ---- NOTE ----
  const feats: string[] = [];
  if (selfCalls >= 1) feats.push(memoized ? "memoized recursion" : "recursion");
  if (pureBinarySearch) feats.push("binary search");
  if (maxDepth >= 2 && !(traversal || amortised))
    feats.push("nested loops");
  else if (maxDepth === 1 || (maxDepth >= 2 && (traversal || amortised)))
    feats.push("single pass");
  if (traversal) feats.push("BFS/DFS traversal");
  if (amortised) feats.push("two-pointer / sliding window");
  if (hasSort) feats.push("sorting");
  if (usesHeap) feats.push("heap / priority queue");
  const note = feats.length
    ? `Detected: ${feats.join(", ")}.`
    : "Constant-time operations only.";

  return { time, space, note };
}
