# Repo Cleanup — Architect's Audit & Removal Prompt

## Why this exists

This project was scaffolded, then partially migrated from **Supabase** to
**Firebase + Algolia**, then the migration was abandoned mid-way. The result
is a repo carrying two full backend stacks, two search stacks, two package
managers, and a stray Firebase Hosting placeholder page — most of which is
dead weight that will confuse every contributor (including an AI assistant)
who touches this codebase from here on.

**Decision made:** keep **Supabase** as the sole backend. It has the
working majority of the app (auth, cart, checkout, orders, admin, and the
newly-hardened `place-order` edge function). Firebase and Algolia are the
losing branch and get removed, not "kept just in case."

If you disagree with keeping Supabase, stop here and say so before running
the prompt below — everything downstream assumes this decision stands.

---

## Audit findings

### 🔴 Delete outright — dead, orphaned, or actively misleading

| Path | Verdict | Reason |
|---|---|---|
| `src/lib/firebase.ts` | DELETE | Firebase SDK init; no longer needed once Firebase is gone. |
| `firestore.rules` | DELETE | Firestore security rules for a database you're not using. |
| `storage.rules` | DELETE | Firebase Storage rules; Supabase storage policies already exist in `supabase/migrations/`. |
| `firestore.indexes.json` | DELETE | Firestore composite index definitions — meaningless without Firestore. |
| `functions/` (entire directory) | DELETE | Firebase Cloud Functions (`index.ts`, `algolia.ts`, its own `package.json`/`package-lock.json`/`tsconfig.json`). This is a second, parallel backend to `supabase/functions/` — do not confuse the two. |
| `scripts/seedFirestore.ts` | DELETE | Seed script for Firestore. Supabase already has real seed data in `supabase/migrations/`. |
| `public/index.html` | DELETE | This is the **default Firebase Hosting placeholder page** ("Welcome to Firebase Hosting"), loading `firebase-app-compat.js` from a CDN path that doesn't even exist in this project. Vite uses the root-level `index.html`, not this one — it is 100% dead and actively misleading to anyone who opens `public/`. |
| `src/lib/search.ts` | DELETE | Algolia search client. Algolia was only ever wired up to support the Firestore version of the catalog. Supabase already has a working full-text search column (`books.search_vector`, GIN-indexed) defined in the migrations — use that instead. |

### 🟠 Rewrite, don't just delete — these files mix real logic with the dead backend

| Path | Verdict | Reason |
|---|---|---|
| `src/pages/Catalog.tsx` | REWRITE | Currently branches between Firestore queries (default browse) and Algolia (search-query mode). Both branches need replacing with Supabase queries: browse via `.select().range()` against `books`, search via `.textSearch('search_vector', query)` (or `.ilike()` as a simpler fallback) against the same table. Preserve the existing filter-by-language/category and pagination UX. |
| `src/lib/pagination.ts` | REWRITE | Cursor-based Firestore pagination helper. Replace with Supabase range/offset (or keyset) pagination consistent with the rest of the app (see `src/pages/Orders.tsx` or `useCart.ts` for the existing Supabase query style). |
| `functions/src/index.ts` (before deletion) | REFERENCE ONLY | Contains an order-status check (`status !== "completed"`) that was already wrong against Firestore too. No logic here is worth porting — the equivalent, correct logic already lives in `supabase/functions/generate-download-url/index.ts` and `supabase/functions/place-order/index.ts`. Confirm nothing else in this file is load-bearing, then delete with the rest of `functions/`. |

### 🟡 Dependency & config cleanup

| Item | Verdict | Reason |
|---|---|---|
| `"firebase"` in `package.json` dependencies | REMOVE | No longer imported anywhere once the above files are deleted/rewritten. |
| `"algoliasearch"` and `"@algolia/client-search"` in `package.json` dependencies | REMOVE | Only ever used by `search.ts` and `Catalog.tsx`'s search branch, both being replaced. |
| `VITE_FIREBASE_*`, `VITE_ALGOLIA_*` env vars (in `.env`, `.env.example` if present, and any deploy config) | REMOVE | Dead config for removed services. |
| Two lockfiles: `bun.lock` **and** `package-lock.json` | DECIDE, THEN DELETE ONE | Committing both invites version drift between `npm install` and `bun install` producing different resolved dependency trees. Pick one package manager as canonical (the README currently documents both as equally valid — that's the actual bug to fix). If you don't have a strong preference, keep `package-lock.json` (npm is the more universal default for CI/deploy platforms) and delete `bun.lock` + `bunfig.toml`. |
| `.gitignore` | FIX | Does not list `.env` — this is why real Supabase/Firebase/Algolia keys ended up committed to git history in the first place (see `CHECKOUT_FIX.md` context). Add `.env`, `.env.local`, `.env.*.local`. |
| `README.md` | UPDATE | Currently documents "Backend / Database: Supabase & Firebase Firestore integration," lists `firestore.rules` in the project structure section, and presents `npm`/`bun` as interchangeable. All three statements will be false after this cleanup — update them. |

### ⚪ Leave alone — confirmed in active use, do not touch

- `supabase/` (config, migrations, functions) — this is the real, kept backend.
- `src/integrations/supabase/` — generated Supabase client + types, actively used by 17+ files.
- Everything else under `src/pages`, `src/components`, `src/hooks`, `src/contexts` not listed above.

---

## The prompt

Paste this to your coding assistant once you've confirmed the decision to
keep Supabase:

```
Act as a senior software architect doing a hostile code review of this
repo's dependency surface. This project has two abandoned parallel
backends (Supabase and Firebase) plus a dead Algolia search integration
left over from an incomplete migration. We are standardizing on Supabase
only. Be ruthless — anything serving the removed stacks gets deleted, not
commented out, not left "just in case."

Do the following, in order:

1. DELETE these files/directories outright, and confirm nothing else in
   the repo imports from them before deleting:
   - src/lib/firebase.ts
   - src/lib/search.ts
   - firestore.rules
   - storage.rules
   - firestore.indexes.json
   - functions/ (the entire Firebase Cloud Functions directory, including
     its own package.json, package-lock.json, tsconfig.json, and src/)
   - scripts/seedFirestore.ts
   - public/index.html (this is the unused, default "Welcome to Firebase
     Hosting" placeholder — Vite serves the root index.html instead; this
     one is pure dead weight and should not exist)

2. REWRITE (do not just delete) these files, since they contain real
   product logic mixed in with the dead backend calls:
   - src/pages/Catalog.tsx — remove the Firestore query branch and the
     Algolia search branch entirely. Replace both with Supabase queries
     against the `books` table: use `.range()` for normal browsing/
     pagination, and `.textSearch('search_vector', query)` for the search
     box (the search_vector column and its GIN index already exist in
     the Supabase migrations — do not reinvent search). Preserve the
     existing UX: language/category filtering, infinite-scroll-or-
     paginate behavior, loading states.
   - src/lib/pagination.ts — replace the Firestore cursor-based
     pagination helper with a Supabase-based equivalent. Match the query
     style already used elsewhere in the app (see src/hooks/useCart.ts or
     src/pages/Orders.tsx for the house style).

3. REMOVE these dependencies from package.json and update the lockfile:
   - firebase
   - algoliasearch
   - @algolia/client-search
   Run whatever install command matches the canonical package manager
   (see step 5) to regenerate the lockfile cleanly.

4. SEARCH the entire repo (not just src/) for any remaining references
   to "firebase", "firestore", or "algolia" — in code, env files,
   .gitignore, CI config, deploy config, and README.md — and remove or
   correct every one of them. Do not leave commented-out Firebase code
   "for reference."

5. RESOLVE the dual package-manager situation: this repo commits both
   bun.lock and package-lock.json. Pick ONE canonical package manager.
   Default to npm/package-lock.json unless told otherwise — delete
   bun.lock and bunfig.toml, and update README.md to document npm only
   (currently it presents both as interchangeable, which is misleading
   once only one lockfile is authoritative).

6. FIX .gitignore: it currently does not ignore .env, which is how real
   API keys ended up committed to this repo's history. Add .env,
   .env.local, and .env.*.local.

7. UPDATE README.md: remove the "Firebase Firestore integration" line
   from the backend description, remove firestore.rules from the project
   structure diagram, and remove any other now-false claims about the
   stack.

8. VERIFY: after all changes, run a full TypeScript build/typecheck and
   report every error. Do not consider this done until the build is
   clean — a partial migration that doesn't compile is worse than the
   mess we started with. Also grep the final repo for the literal
   strings "firebase" and "algolia" (case-insensitive) and show me any
   remaining hits before you consider this complete.

Do NOT touch: anything under supabase/ (config, migrations, functions),
or src/integrations/supabase/ — that is the real, kept backend.
```

---

## Post-cleanup checklist (do this yourself after the assistant finishes)

- [ ] `npm run build` (or `bun run build`, whichever you kept) completes with zero errors
- [ ] `grep -ri "firebase\|algolia" -r . --exclude-dir=node_modules --exclude-dir=.git` returns nothing
- [ ] Catalog page still loads books, still filters by language/category, and search still returns results
- [ ] `.env` is no longer tracked by git (`git status` should not show it after these changes if it was already committed — you still need to scrub history separately, see `CHECKOUT_FIX.md` / `PROJECT_IDEAS.md` §1.2 for that)
- [ ] Only one lockfile remains in the repo root
- [ ] README accurately describes the stack you actually run
