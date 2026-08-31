# Admin Features — Implementation Prompt

## Context for whoever implements this (human or AI assistant)

This repo currently has **no backend connected** (Supabase/Firebase/Algolia
were all removed — see `CLEANUP_PROMPT.md`). Everything below is written so
it can be implemented **right now against local/stub data** and will keep
working unchanged once a backend is reconnected — the only thing that
changes later is *where the data comes from*, not the UI or export logic.

Current relevant files:
- `src/pages/admin/AdminDashboard.tsx` — summary cards, currently all zero
- `src/pages/admin/AdminImport.tsx` — CSV bulk importer, currently parses
  files but writes nothing (`progress.errors` is a flat `string[]`)
- `src/pages/admin/AdminLayout.tsx` — admin sidebar nav (`links` array)
- `src/App.tsx` — route definitions

Rather than cramming every new feature into the existing Dashboard and
Import pages, this adds **two new dedicated admin pages** next to them —
a full **Reports** page and an **Import History** page — plus a new
**Email Templates** page, so each concern gets its own screen instead of
overloading the summary views.

---

## Task 1 — CSV Export on Admin Sales Dashboard + new Reports page

### 1a. Quick export button on the existing Dashboard

Add an "Export CSV" button to `AdminDashboard.tsx` next to the summary
cards. It exports exactly what's on screen — one row of the four current
totals (books, orders, revenue, customers) with a timestamp — as an instant
download, no dialogs or options.

```
Add a "Export CSV" button (top-right of the stats grid) to
src/pages/admin/AdminDashboard.tsx. On click, generate a CSV client-side
(no library needed — build the string manually, same pattern already used
in AdminImport.tsx's downloadTemplate function) containing one row: the
four current stat values (books, orders, revenue, customers) plus a
generated_at timestamp column. Trigger the download via a Blob + object
URL, filename `dashboard-summary-{YYYY-MM-DD}.csv`. This must work against
the current stub data (all zeros) without errors — it's meant to also work
unchanged once a backend populates real numbers.
```

### 1b. New page: `/admin/reports`

A summary card total isn't enough for real ops work — add a dedicated
Reports page with a real breakdown table and its own export, decoupled
from the at-a-glance Dashboard.

```
Create a new page src/pages/admin/AdminReports.tsx and route it at
/admin/reports (add to src/App.tsx inside the existing <Route path="/admin">
block, and add a "Reports" nav link with a suitable lucide-react icon,
e.g. BarChart3, to the `links` array in src/pages/admin/AdminLayout.tsx,
placed after "Orders").

The page should show:
- A date range picker (default: last 30 days) — reuse existing UI
  components (Input type="date" is fine, no need for a calendar library).
- A breakdown table with columns: Date | Orders | Revenue | Books sold.
  Since no backend is connected yet, render this against an empty array
  (an explicit "No data for this range" empty state — do not fabricate
  rows) exactly the way AdminOrders.tsx currently handles its empty state.
- An "Export CSV" button that exports the full breakdown table (not just
  the summary) — one row per date in the selected range, same columns as
  the table. Reuse the CSV-building approach from Task 1a rather than
  duplicating logic — extract a small shared helper, e.g.
  src/lib/csvExport.ts, exporting a function like
  `toCsv(headers: string[], rows: (string|number)[][]): string`, and use
  it from both AdminDashboard.tsx and AdminReports.tsx.

Leave a clear `// BACKEND REMOVED` comment block at the top of the data-
fetching section (there won't be one yet — just the empty array) explaining
what a real implementation should query once a backend exists: orders
grouped by day within the selected date range, with sums of total_amount
and count of order_items.
```

---

## Task 2 — Download Failed Rows on Admin Bulk Import + new Import History page

### 2a. Structured failed-row tracking

`AdminImport.tsx` currently stores errors as a flat `string[]`
(`progress.errors`), which isn't enough to reconstruct a corrected CSV.
This needs to change to a structured shape first.

```
In src/pages/admin/AdminImport.tsx, change the `progress` state's `errors`
field from `string[]` to a structured array:

type FailedRow = {
  rowNumber: number;           // 1-indexed, matching the CSV's data rows (excluding header)
  data: Record<string, string>; // the original parsed row, unchanged
  reason: string;               // human-readable validation/import error
};

Update `progress` to `{ done, total, ok, err, errors: FailedRow[] }`.
Update the current "no backend" stub in `importFile` to populate this
shape instead of a single string — for now, since nothing can actually be
imported, mark every row as failed with reason "Import unavailable — no
backend is connected", but keep each row's original `data` intact so the
export in 2b has real content to work with. This also sets up the shape
correctly for when real per-row validation (missing fields, unknown
language_code, etc. — see the commented-out logic already removed from
this file) is reconnected later.

Update the existing "View errors" <details> block to read from the new
shape (show `Row {rowNumber} ({data.name || "unknown"}): {reason}`
instead of the old plain string).
```

### 2b. "Download failed rows" button

```
Add a "Download failed rows" button next to "View errors ({count})" in
src/pages/admin/AdminImport.tsx, shown only when `progress.errors.length
> 0`. On click, regenerate a CSV using the same headers as the original
uploaded file (derive them from `Object.keys(rows[0].data)` at parse time
— store the header list in state alongside `progress` so it survives even
if the user re-uploads) plus one extra trailing column, `error_reason`.
Each row is the failed row's original `data` values in header order, plus
its `reason` in the new column. Use the shared `toCsv` helper from Task 1a
(src/lib/csvExport.ts). Filename: `import-errors-{YYYY-MM-DD}.csv`. The
user should be able to fix just those rows in a spreadsheet and re-upload
only the corrected file.
```

### 2c. New page: `/admin/import-history`

```
Create a new page src/pages/admin/AdminImportHistory.tsx and route it at
/admin/import-history (add to src/App.tsx, and add an "Import History"
nav link, e.g. icon History from lucide-react, to AdminLayout.tsx's
`links` array, placed right after "Bulk import").

Show a table of past import attempts: Date | Filename | Total rows |
Succeeded | Failed | (an inline "Download failed rows" link/button per
past import, reusing the same CSV logic as 2b). Since no backend is
connected, render this against an empty array with an explicit "No
imports yet" empty state — do not fabricate history. Leave a
`// BACKEND REMOVED` comment explaining that a real implementation should
persist a job record (filename, timestamp, row counts, and the structured
FailedRow[] as JSON) each time AdminImport.tsx's importFile runs, and that
this page should list those records most-recent-first.
```

---

## Task 3 — Real email template texts + new Email Templates page

Right now there is no email-sending integration at all (see
`PROJECT_IDEAS_INPUT_FORMS.md` → "Email notifications" — that form still
needs your provider choice and API key before anything can actually send).
This task covers writing the **actual content** now and giving it a home
in the codebase and in the admin UI, so it's ready to wire up the moment a
provider is chosen.

### 3a. Template content file

```
Create src/lib/emailTemplates.ts exporting a typed array/record of email
templates, each with: id, name, subject, and body (plain text — do not
build HTML email markup yet, that's a separate task once a provider is
picked). Include these three templates with real, ready-to-send copy (not
placeholder lorem ipsum) written for "Digisell Books", a PDF ebook store:

1. order_confirmation — sent right after a successful order. Must
   reference: order ID, list of purchased book titles, total amount paid,
   and a reminder that download links are available on their Dashboard
   page.
2. welcome — sent after a new account is created. Brief, friendly,
   mentions browsing the catalog and includes a placeholder for a "Browse
   books" link.
3. password_reset — standard reset-link email. Must include a placeholder
   token/link variable (e.g. `{{reset_link}}`) and a note that the link
   expires (state a specific duration, e.g. "1 hour").

Use `{{variable_name}}` style placeholders anywhere real data will be
interpolated later (order ID, book titles, totals, links, names). Keep
each body under ~150 words — these are transactional emails, not
newsletters.
```

### 3b. New page: `/admin/email-templates`

```
Create a new page src/pages/admin/AdminEmailTemplates.tsx and route it at
/admin/email-templates (add to src/App.tsx, and add an "Email Templates"
nav link, e.g. icon Mail from lucide-react, to AdminLayout.tsx's `links`
array, placed at the end).

The page should:
- List the templates from src/lib/emailTemplates.ts (id, name, subject) in
  a simple list/table.
- Clicking a template shows its subject and body in read-only fields for
  now (a live preview), with the `{{placeholders}}` visibly highlighted
  (e.g. wrap them in a <code> tag via a simple regex-based render).
- Do NOT add a "Save" button yet — there's no backend to persist edits to,
  and no email provider to send a test through. Add a disabled "Send test
  email" button with a tooltip/caption: "Connect an email provider to
  enable sending test emails." This makes the page an honest preview tool
  right now rather than implying functionality that doesn't exist yet.
```

---

## Summary of new routes & nav entries

After this work, `/admin` should have five sidebar links instead of four:

| Route | Page file | Nav label |
|---|---|---|
| `/admin` | `AdminDashboard.tsx` (existing, gets export button) | Dashboard |
| `/admin/books` | `AdminBooks.tsx` (existing) | Books |
| `/admin/orders` | `AdminOrders.tsx` (existing) | Orders |
| `/admin/reports` | `AdminReports.tsx` **(new)** | Reports |
| `/admin/import` | `AdminImport.tsx` (existing, gets failed-rows export) | Bulk import |
| `/admin/import-history` | `AdminImportHistory.tsx` **(new)** | Import History |
| `/admin/email-templates` | `AdminEmailTemplates.tsx` **(new)** | Email Templates |

---

## Verification checklist

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] All three new admin routes are reachable from the sidebar and don't
      404
- [ ] Dashboard "Export CSV" button downloads a valid CSV even with all-
      zero stub data
- [ ] Reports page renders its empty state cleanly with no date range
      selected data, and its export button doesn't crash on an empty
      dataset
- [ ] Import page's "Download failed rows" only appears after a failed
      import, and the downloaded CSV's columns match the originally
      uploaded file's headers plus `error_reason`
- [ ] Import History page renders its "No imports yet" empty state
- [ ] Email Templates page shows all three templates with subject/body
      and visibly marked placeholders, and "Send test email" is visibly
      disabled with an explanatory tooltip/caption
- [ ] `src/lib/csvExport.ts` is used by both the Dashboard and Reports
      export buttons (and Import's failed-rows export) — no duplicated
      CSV-building logic across files
