# Lock In — Placement Prep Studio

> _Lock in. Get placed._


An end-to-end placement preparation web app: a real in-browser **Python code judge**,
a **300-card DSA question bank**, **aptitude** drills + timed mocks, and a full-stack
**interview** prep guide — all in one calm, matte graphite/clay workspace.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Firebase ·
Monaco · Pyodide**.

---

## What's inside

| Module          | What you get                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- |
| **Code Judge**  | 39 LeetCode-style problems. Write Python in Monaco; it runs against hidden test cases via Pyodide (WebAssembly) — no backend. Run = sample cases, Submit = all cases. |
| **DSA Cards**   | 300 question cards across 20 topics (Arrays → Union Find): pattern, hint, key idea, optimal complexity, companies. Linked to the judge where a runnable problem exists. |
| **Aptitude**    | 44 topics with formulas, shortcut tricks & pattern notes + 725 auto-generated MCQs and flashcards. |
| **Interview**   | 65 full-stack concepts (JS, React, Next, Node, Mongo, SQL, auth, security, system design) — definition, how it works, common questions, mistakes, memory hooks. |
| **Test Center** | Timed Aptitude mock, combined **DSA concept test across every data type**, and a coding sprint — with question palette, flagging, full review & scoring. |
| **Dashboard**   | Live progress: problems solved, cards reviewed, aptitude accuracy, day streak, recent tests.   |

All content is parsed from the three source PDFs (see `../.extracted/` for the parsers)
into `src/data/*.json`. Every coding problem's reference solution is validated against its
own test cases at build time, so the judge's expected outputs are guaranteed correct.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start   # production
```

The Python runtime (Pyodide) downloads from a CDN on the **first** Run/Submit only,
then is cached for the session.

## Firebase — one-time console setup (required for sign-in)

The Firebase web config is already wired in `src/lib/firebase.ts`. To make auth & cloud
sync work you must enable the following in the [Firebase console](https://console.firebase.google.com/)
for project **placement-prep-7ad94**:

1. **Authentication → Sign-in method** → enable **Email/Password** and **Google**.
2. **Firestore Database** → create a database, then paste the rules from `firestore.rules`
   (each user can read/write only their own `users/{uid}` document).
3. `localhost` is an authorised domain by default; add your deployed domain under
   **Authentication → Settings → Authorised domains** when you ship.

Until providers are enabled, you can still use the whole app as a guest — progress is
saved in `localStorage` and merged into your account the first time you sign in.

## Deploy

Works on Vercel (recommended) or Firebase Hosting. No server secrets needed — the judge
runs entirely client-side and content is static.
