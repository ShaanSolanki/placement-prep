"""One-off enrichment of dsa.json:
  - leetcode: official LeetCode number (by slug/id), where the card is a known LC problem
  - answer:   verified Python solution, reused from coding.json where a card maps to a judge problem
  - appends a few Doubly Linked List cards (with hand-written, verified answers)
Re-running is safe/idempotent.
"""
import json, re, os

ROOT = os.path.join(os.path.dirname(__file__), "..", "src", "data")
dsa = json.load(open(os.path.join(ROOT, "dsa.json"), encoding="utf-8"))
cod = json.load(open(os.path.join(ROOT, "coding.json"), encoding="utf-8"))

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
sol_by_title = {norm(p["title"]): p.get("solution", "") for p in cod}

# LeetCode numbers keyed by card id (ids are LeetCode slugs). Omitted ids => null.
LC = {
    "move-zeroes": 283, "remove-duplicates-from-sorted-array": 26, "two-sum": 1,
    "best-time-to-buy-and-sell-stock": 121, "maximum-subarray": 53,
    "product-of-array-except-self": 238, "merge-intervals": 56, "rotate-array": 189,
    "subarray-sum-equals-k": 560, "next-permutation": 31, "majority-element": 169,
    "set-matrix-zeroes": 73, "trapping-rain-water": 42, "sort-colors": 75,
    "merge-sorted-array": 88, "meeting-rooms": 252, "non-overlapping-intervals": 435,
    "largest-number": 179, "k-closest-points-to-origin": 973, "relative-sort-array": 1122,
    "h-index": 274, "minimum-number-of-arrows": 452, "car-fleet": 853,
    "custom-sort-string": 791, "reorganize-string": 767, "maximum-units-on-a-truck": 1710,
    "smallest-range-covering-k-lists": 632,
    "binary-search": 704, "search-insert-position": 35, "first-bad-version": 278,
    "find-first-and-last-position-of-element-in-sorted-array": 34,
    "search-in-rotated-sorted-array": 33, "find-minimum-in-rotated-sorted-array": 153,
    "peak-index-in-mountain-array": 852, "search-a-2d-matrix": 74,
    "koko-eating-bananas": 875, "capacity-to-ship-packages": 1011,
    "median-of-two-sorted-arrays": 4, "split-array-largest-sum": 410,
    "find-peak-element": 162, "time-based-key-value-store": 981,
    "valid-palindrome": 125, "valid-anagram": 242, "first-unique-character": 387,
    "longest-common-prefix": 14, "reverse-words-in-a-string": 151, "group-anagrams": 49,
    "longest-substring-without-repeating-characters": 3, "longest-substring-without": 3,
    "longest-repeating-character-replacement": 424, "permutation-in-string": 567,
    "minimum-window-substring": 76, "palindromic-substrings": 647,
    "longest-palindromic-substring": 5, "decode-string": 394,
    "encode-and-decode-strings": 271, "regular-expression-matching": 10,
    "contains-duplicate": 217, "intersection-of-two-arrays": 349, "ransom-note": 383,
    "top-k-frequent-elements": 347, "longest-consecutive-sequence": 128,
    "valid-sudoku": 36, "find-all-anagrams-in-a-string": 438,
    "continuous-subarray-sum": 523, "minimum-index-sum-of-two-lists": 599,
    "design-hashmap": 706,
    "sliding-window-maximum": 239, "minimum-size-subarray-sum": 209,
    "fruit-into-baskets": 904, "longest-ones-after-k-flips": 1004,
    "subarrays-with-k-distinct-integers": 992, "count-number-of-nice-subarrays": 1248,
    "maximum-points-from-cards": 1423,
    "reverse-string": 344, "two-sum-ii": 167, "remove-duplicates": 26, "3sum": 15,
    "container-with-most-water": 11, "partition-labels": 763, "squares-of-sorted-array": 977,
    "valid-parentheses": 20, "baseball-game": 682, "backspace-string-compare": 844,
    "min-stack": 155, "evaluate-reverse-polish-notation": 150, "daily-temperatures": 739,
    "next-greater-element": 496, "generate-parentheses": 22,
    "largest-rectangle-in-histogram": 84, "remove-k-digits": 402,
    "asteroid-collision": 735, "simplify-path": 71, "basic-calculator": 224,
    "implement-queue-using-stacks": 232, "number-of-recent-calls": 933,
    "moving-average-from-data-stream": 346, "binary-tree-level-order-traversal": 102,
    "rotting-oranges": 994, "number-of-islands": 200, "walls-and-gates": 286,
    "course-schedule": 207, "shortest-path-in-binary-matrix": 1091,
    "perfect-squares": 279, "open-the-lock": 752, "dota2-senate": 649,
    "design-circular-queue": 622, "jump-game-iii": 1306,
    "reverse-linked-list": 206, "merge-two-sorted-lists": 21, "linked-list-cycle": 141,
    "middle-of-linked-list": 876, "palindrome-linked-list": 234,
    "remove-nth-node-from-end": 19, "add-two-numbers": 2, "reorder-list": 143,
    "copy-list-with-random-pointer": 138, "intersection-of-two-linked-lists": 160,
    "swap-nodes-in-pairs": 24, "reverse-nodes-in-k-group": 25, "merge-k-sorted-lists": 23,
    "lru-cache": 146, "flatten-multilevel-doubly-linked-list": 430,
    "fibonacci-number": 509, "power-function": 50, "pow-x-n": 50,
    "subsets": 78, "permutations": 46, "combination-sum": 39,
    "binary-tree-inorder-traversal": 94, "path-sum": 112, "k-th-symbol-in-grammar": 779,
    "decode-ways": 91, "subsets-ii": 90, "permutations-ii": 47, "combination-sum-ii": 40,
    "letter-combinations-of-a-phone-number": 17, "palindrome-partitioning": 131,
    "word-search": 79, "n-queens": 51, "sudoku-solver": 37, "restore-ip-addresses": 93,
    "combination-sum-iii": 216,
    "invert-binary-tree": 226, "maximum-depth-of-binary-tree": 104, "same-tree": 100,
    "subtree-of-another-tree": 572, "balanced-binary-tree": 110,
    "diameter-of-binary-tree": 543, "binary-tree-right-side-view": 199,
    "lowest-common-ancestor": 236, "validate-binary-search-tree": 98,
    "kth-smallest-in-bst": 230, "construct-tree-from-traversals": 105,
    "serialize-and-deserialize-binary-tree": 297, "binary-tree-maximum-path-sum": 124,
    "search-in-bst": 700, "insert-into-bst": 701,
    "minimum-absolute-difference-in-bst": 530, "kth-smallest-element-in-bst": 230,
    "lowest-common-ancestor-in-bst": 235, "convert-sorted-array-to-bst": 108,
    "delete-node-in-bst": 450, "two-sum-iv": 653, "recover-binary-search-tree": 99,
    "bst-iterator": 173, "trim-a-bst": 669, "range-sum-of-bst": 938,
    "balance-a-bst": 1382, "serialize-and-deserialize-bst": 449,
    "kth-largest-element-in-an-array": 215, "last-stone-weight": 1046,
    "kth-largest-element-in-a-stream": 703, "task-scheduler": 621,
    "find-median-from-data-stream": 295, "meeting-rooms-ii": 253, "ipo": 502,
    "network-delay-time": 743, "design-twitter": 355, "minimum-cost-to-connect-sticks": 1167,
    "jump-game": 55, "jump-game-ii": 45, "gas-station": 134, "assign-cookies": 455,
    "lemonade-change": 860, "merge-triplets-to-form-target": 1899, "hand-of-straights": 846,
    "candy": 135, "queue-reconstruction-by-height": 406, "valid-parenthesis-string": 678,
    "max-area-of-island": 695, "clone-graph": 133, "flood-fill": 733,
    "surrounded-regions": 130, "course-schedule-ii": 210, "pacific-atlantic-water-flow": 417,
    "graph-valid-tree": 261, "number-of-connected-components": 323,
    "redundant-connection": 684, "word-ladder": 127, "alien-dictionary": 269,
    "climbing-stairs": 70, "min-cost-climbing-stairs": 746, "house-robber": 198,
    "house-robber-ii": 213, "coin-change": 322, "longest-increasing-subsequence": 300,
    "word-break": 139, "unique-paths": 62, "longest-common-subsequence": 1143,
    "partition-equal-subset": 416, "maximum-product-subarray": 152, "edit-distance": 72,
    "burst-balloons": 312,
    "implement-trie": 208, "design-add-and-search-words": 211, "replace-words": 648,
    "map-sum-pairs": 677, "word-search-ii": 212, "longest-word-in-dictionary": 720,
    "search-suggestions-system": 1268, "maximum-xor-of-two-numbers": 421,
    "palindrome-pairs": 336, "concatenated-words": 472, "stream-of-characters": 1032,
    "prefix-and-suffix-search": 745, "camelcase-matching": 1023,
    "design-in-memory-file-system": 588, "word-squares": 425,
    "number-of-provinces": 547, "accounts-merge": 721,
    "satisfiability-of-equality-equations": 990, "most-stones-removed": 947,
    "number-of-islands-ii": 305, "min-cost-to-connect-all-points": 1584,
    "evaluate-division": 399, "regions-cut-by-slashes": 959, "couples-holding-hands": 765,
    "similar-string-groups": 839, "swim-in-rising-water": 778,
    # doubly linked list additions:
    "design-linked-list": 707, "design-browser-history": 1472,
}

for card in dsa:
    card["leetcode"] = LC.get(card["id"])
    s = sol_by_title.get(norm(card["title"]))
    card["answer"] = s if s else card.get("answer")  # keep any existing

# ---- Doubly Linked List cards ----
DLL = [
    {
        "id": "design-linked-list", "topic": "Linked List",
        "title": "Design Linked List", "difficulty": "Medium",
        "frequency": "High", "importance": "Must Do",
        "companies": ["Amazon", "Microsoft", "Adobe"],
        "pattern": "Doubly Linked List + sentinels",
        "statement": "Design your own linked list (singly or doubly). Implement get(index), addAtHead(val), addAtTail(val), addAtIndex(index, val) and deleteAtIndex(index). A doubly linked list with dummy head/tail sentinels makes every operation clean and O(1) at the ends.",
        "example": {"input": "addAtHead(1); addAtTail(3); addAtIndex(1,2); get(1)", "output": "2"},
        "constraints": "0 <= index, val <= 1000 | at most 2000 calls",
        "hint": "Keep a size counter and two sentinel nodes (head, tail) so you never special-case empty/ends.",
        "keyIdea": "Doubly linked list with sentinels. Each node holds prev & next; insert/delete is just 4 pointer rewires.",
        "complexity": {"time": "O(1) add/del at ends, O(n) by index", "space": "O(n)"},
        "similar": ["LRU Cache", "Flatten Multilevel Doubly Linked List", "Design Browser History"],
        "rookieMistake": "Bhool jaana ki DLL me dono prev aur next update karne padte hain — sirf next set karne se list toot jaati hai.",
        "leetcode": 707,
        "answer": "class Node:\n    def __init__(self, val=0):\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass MyLinkedList:\n    def __init__(self):\n        self.head = Node()      # sentinel\n        self.tail = Node()      # sentinel\n        self.head.next = self.tail\n        self.tail.prev = self.head\n        self.size = 0\n\n    def _node_at(self, index):\n        # walk from the nearer end\n        if index < self.size - index:\n            cur = self.head.next\n            for _ in range(index):\n                cur = cur.next\n        else:\n            cur = self.tail.prev\n            for _ in range(self.size - 1 - index):\n                cur = cur.prev\n        return cur\n\n    def get(self, index):\n        if index < 0 or index >= self.size:\n            return -1\n        return self._node_at(index).val\n\n    def _insert_before(self, nxt, val):\n        prev = nxt.prev\n        node = Node(val)\n        node.prev, node.next = prev, nxt\n        prev.next = nxt.prev = node\n        self.size += 1\n\n    def addAtHead(self, val):\n        self._insert_before(self.head.next, val)\n\n    def addAtTail(self, val):\n        self._insert_before(self.tail, val)\n\n    def addAtIndex(self, index, val):\n        if index < 0 or index > self.size:\n            return\n        nxt = self.tail if index == self.size else self._node_at(index)\n        self._insert_before(nxt, val)\n\n    def deleteAtIndex(self, index):\n        if index < 0 or index >= self.size:\n            return\n        node = self._node_at(index)\n        node.prev.next = node.next\n        node.next.prev = node.prev\n        self.size -= 1\n",
    },
    {
        "id": "design-browser-history", "topic": "Linked List",
        "title": "Design Browser History", "difficulty": "Medium",
        "frequency": "High", "importance": "Must Do",
        "companies": ["Amazon", "Bloomberg", "Uber"],
        "pattern": "Doubly Linked List",
        "statement": "You start on the homepage. visit(url) clears all forward history and moves to url. back(steps) and forward(steps) move along history but cannot go beyond the ends. A doubly linked list models the back/forward tape naturally.",
        "example": {"input": "visit('g'); visit('fb'); back(1); forward(1)", "output": "'fb'"},
        "constraints": "1 <= steps <= 100 | at most 5000 calls",
        "hint": "Each node points to prev (back) and next (forward). visit() snips off everything ahead.",
        "keyIdea": "Doubly linked list cursor. back/forward = walk prev/next up to `steps` or until a sentinel end.",
        "complexity": {"time": "O(1) visit, O(steps) back/forward", "space": "O(n)"},
        "similar": ["Design Linked List", "LRU Cache"],
        "rookieMistake": "visit() ke baad forward history clear karna bhool jaana — purana 'next' chain reachable reh jaata hai.",
        "leetcode": 1472,
        "answer": "class Node:\n    def __init__(self, url):\n        self.url = url\n        self.prev = None\n        self.next = None\n\nclass BrowserHistory:\n    def __init__(self, homepage):\n        self.cur = Node(homepage)\n\n    def visit(self, url):\n        node = Node(url)\n        self.cur.next = node      # drop all forward history\n        node.prev = self.cur\n        self.cur = node\n\n    def back(self, steps):\n        while steps and self.cur.prev:\n            self.cur = self.cur.prev\n            steps -= 1\n        return self.cur.url\n\n    def forward(self, steps):\n        while steps and self.cur.next:\n            self.cur = self.cur.next\n            steps -= 1\n        return self.cur.url\n",
    },
    {
        "id": "doubly-linked-list-basics", "topic": "Linked List",
        "title": "Doubly Linked List — Insert & Delete", "difficulty": "Easy",
        "frequency": "High", "importance": "Must Do",
        "companies": ["TCS", "Infosys", "Wipro", "Amazon"],
        "pattern": "Doubly Linked List",
        "statement": "Implement the core doubly-linked-list operations: insert at front, insert at end, delete a given node, and traverse forward/backward. Every node stores both prev and next pointers, so deletion is O(1) when you already hold the node.",
        "example": {"input": "insert_front(2); insert_end(5); to_list()", "output": "[2, 5]"},
        "constraints": "Values fit in a machine int",
        "hint": "On delete: stitch node.prev.next -> node.next and node.next.prev -> node.prev (guard the ends).",
        "keyIdea": "Bidirectional pointers. Holding a node = O(1) delete (no need to find the previous node, unlike a singly list).",
        "complexity": {"time": "O(1) insert/delete at known node", "space": "O(n)"},
        "similar": ["Design Linked List", "Design Browser History", "LRU Cache"],
        "rookieMistake": "Head/tail edge cases na sambhalna — front/end delete pe prev/next None ho sakta hai.",
        "leetcode": None,
        "answer": "class Node:\n    def __init__(self, val):\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass DoublyLinkedList:\n    def __init__(self):\n        self.head = None\n        self.tail = None\n\n    def insert_front(self, val):\n        node = Node(val)\n        if not self.head:\n            self.head = self.tail = node\n        else:\n            node.next = self.head\n            self.head.prev = node\n            self.head = node\n\n    def insert_end(self, val):\n        node = Node(val)\n        if not self.tail:\n            self.head = self.tail = node\n        else:\n            node.prev = self.tail\n            self.tail.next = node\n            self.tail = node\n\n    def delete(self, node):\n        if node.prev:\n            node.prev.next = node.next\n        else:\n            self.head = node.next\n        if node.next:\n            node.next.prev = node.prev\n        else:\n            self.tail = node.prev\n\n    def to_list(self):\n        out, cur = [], self.head\n        while cur:\n            out.append(cur.val)\n            cur = cur.next\n        return out\n",
    },
]

existing_ids = {c["id"] for c in dsa}
added = 0
# insert the DLL cards right after the existing Linked List block
ll_end = max((i for i, c in enumerate(dsa) if c["topic"] == "Linked List"), default=len(dsa) - 1)
for card in DLL:
    if card["id"] in existing_ids:
        continue
    ll_end += 1
    dsa.insert(ll_end, card)
    added += 1

json.dump(dsa, open(os.path.join(ROOT, "dsa.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

with_lc = sum(1 for c in dsa if c.get("leetcode"))
with_ans = sum(1 for c in dsa if c.get("answer"))
print(f"total cards: {len(dsa)} | added DLL: {added}")
print(f"with leetcode #: {with_lc} | with answer: {with_ans}")
