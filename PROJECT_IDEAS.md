# Digisell / ebook-shelves — Idea Backlog

A running list of improvements for the project. Each idea is written as a
**ready-to-paste prompt** you can hand to an AI coding assistant later, plus
the **facts/files/decisions you need to have ready first** — no code here,
just groundwork. Grouped roughly by priority.

---

## 1. Foundation decisions (do these before anything else)

### 1.1 Pick one backend: Supabase or Firebase
The repo currently has both wired in — `AuthContext`, `useCart`, `Checkout`,
`Orders`, admin pages all use Supabase; `Catalog.tsx` and `pagination.ts` use
Firebase/Firestore. This causes data to disagree between pages.

- **Facts you need to gather first:** which one already has your real book
  catalog / users in it? Which one are you more comfortable operating
  (Firebase console vs Supabase dashboard)? Do you need Postgres-style
  relational queries (Supabase) or are simple document reads enough
  (Firestore)?
- **Files to prepare:** none — this is a decision, not content.
- **Prompt to use once decided:**
  > "We're standardizing on \[Supabase|Firebase] for this project. Remove all
  > code paths, config files, and dependencies for the other backend
  > (\[Firestore/Firebase functions|Supabase client/migrations/edge
  > functions]), and make sure every page reads/writes through the one we
  > kept."

### 1.2 Rotate & re-secure leaked keys
`.env` is committed to the repo history.

- **Facts you need:** list of every key in `.env` (Supabase URL/anon key,
  Firebase config, Algolia keys, any Razorpay keys). For each, confirm in
  the provider's dashboard whether it's a "public/client-safe" key or a
  "secret/service" key.
- **Files to prepare:** a fresh `.env` with rotated secret keys, kept out of
  git this time.
- **Prompt:**
  > "Add `.env` to `.gitignore`, remove it from git history, and add a
  > `.env.example` listing the variable names (no values) so new
  > contributors know what to fill in."

---

## 2. Content & catalog — needs real data, not code

### 2.1 Real book catalog
Right now there are 6 sample books (one per language) seeded via SQL. To
launch you need a real catalog.

- **Facts/files needed per book:** title, author, ISBN (optional), short
  description (1–2 lines), long description (paragraph), language, category,
  price, discount price (optional), page count, publisher, published year,
  edition, "what's included" bullet list, 2–4 FAQs, tags, cover image
  (recommend 3:4 portrait, ≥800×1200px, JPG/WebP), the actual ebook file
  (PDF/EPUB), and a short preview/sample file if you want one.
- **Format to prepare it in:** the CSV import already exists
  (`AdminImport.tsx`) with a template download button — fill that template
  out for your real catalog rather than writing it into the DB by hand.
- **Prompt (once your CSV + files are ready):**
  > "I have a CSV of N books following the existing import template, plus a
  > folder of cover images and ebook files named to match each row's slug.
  > Walk me through uploading the files to storage and importing the CSV so
  > covers/file_url line up correctly."

### 2.2 More languages / categories
Currently: English, Hindi, Marathi, Gujarati, Bengali, Tamil / Fiction,
Self Help, Biography, Education, Business, Spirituality, Children, Poetry.

- **Facts needed:** which additional languages or categories you actually
  plan to stock books in (adding empty ones clutters filters).
- **Prompt:**
  > "Add these languages/categories to the languages/categories tables:
  > \[list]. Keep the existing display_order pattern."

### 2.3 Reviews / ratings
No review system exists yet.

- **Facts to decide first:** should only verified purchasers review? Star
  rating only, or star + text? Moderated (admin approves) or instant?
- **Prompt:**
  > "Add a book reviews feature: users who purchased a book can leave a
  > 1–5 star rating and optional text review, shown on the book detail
  > page with an average rating badge. \[Include your moderation answer
  > here]."

---

## 3. Trust & compliance — needs written policy text, not code

### 3.1 Refund / cancellation policy
Digital goods in India have specific expectations; Razorpay also asks for a
policy URL during onboarding.

- **Facts/files needed:** your actual policy in plain language — e.g. "no
  refunds once downloaded" or "refund within X hours if not downloaded."
- **Prompt:**
  > "Create a /refund-policy page using this text: \[paste your policy].
  > Link it in the footer and at checkout."

### 3.2 Terms of Service & Privacy Policy
Needed for any real payment processor and for Play Store/App Store if you
ever wrap this as an app.

- **Facts/files needed:** your business name/entity, contact email/address,
  what data you collect (email, name, purchase history — check what's
  actually stored in `profiles`/`orders`), any third parties data is shared
  with (Razorpay, Supabase/Firebase, Algolia if used for search).
- **Prompt:**
  > "Create /terms and /privacy pages using this business info and this
  > list of data we collect: \[paste]."

### 3.3 GST / invoice details (India-specific)
If selling digital goods commercially in India you likely need GST-compliant
invoices per order.

- **Facts needed:** your GSTIN (if registered), whether you're under the
  GST threshold, invoice numbering scheme you want.
- **Prompt:**
  > "Generate a downloadable PDF invoice per order, including \[your GSTIN /
  > business details], from the order_items already stored."

---

## 4. Payments — needs real credentials, not code

### 4.1 Real Razorpay integration
Checkout currently stubs payment as always-successful.

- **Facts/files needed:** Razorpay account (test + live keys), your bank
  settlement details already added in Razorpay dashboard, webhook secret.
- **Prompt:**
  > "Replace the stubbed payment flow in place-order with real Razorpay:
  > create an order via Razorpay's API, open their checkout on the
  > frontend, and verify payment via a webhook using this signing secret
  > before marking the order 'paid'."

### 4.2 COD-equivalent for digital goods (pay-later / invoice-on-request)
Odd for ebooks, but the schema supports `payment_method = 'cod'`.

- **Facts to decide:** do you actually want to offer this, or should it be
  removed? If kept — who manually confirms payment before access is
  granted, and how (email? admin panel button — already exists)?
- **Prompt:**
  > "\[Remove the 'cod' payment method entirely | Keep 'cod' but require
  > admin approval before access_granted_at is set — this already exists
  > in AdminOrders, just confirm/document the workflow]."

---

## 5. Discovery & growth — mostly content/decisions

### 5.1 Search relevance tuning
`search.ts` exists but needs real query data to tune.

- **Facts needed:** after some real usage, export the actual search terms
  users type (if you add logging) so ranking can be tuned to what people
  search for.
- **Prompt:**
  > "Here are the top 50 search queries from real users this month:
  > \[paste]. Tune the search ranking/synonyms in search.ts to handle these
  > better."

### 5.2 Homepage merchandising
`Home.tsx` currently shows generic sections.

- **Facts/files needed:** which books you want to feature (bestsellers,
  new arrivals, editor's picks), any banner images/copy for promotions.
- **Prompt:**
  > "Update the homepage to feature these specific books in a
  > 'Bestsellers' row and this banner for \[promotion]: \[paste details
  > and image]."

### 5.3 Email notifications
No transactional email system found in the codebase.

- **Facts needed:** which email provider you'll use (Resend, SendGrid,
  Postmark, etc.) and account/API key, plus what emails you want (order
  confirmation, download link, password reset already handled by
  Supabase auth).
- **Prompt:**
  > "Add order-confirmation emails sent via \[provider] when place-order
  > succeeds, using this API key and this email template copy: \[paste]."

### 5.4 Coupon / discount codes
Only per-book `discount_price` exists; no cart-level codes.

- **Facts to decide:** percentage vs flat discounts, single-use vs
  reusable, expiry dates, whether they stack with existing discount_price.
- **Prompt:**
  > "Add a coupon_codes feature with these rules: \[paste your decided
  > rules]. Apply it during place-order server-side, same as pricing."

---

## 6. Admin/ops quality of life

### 6.1 Sales & customer reports
`AdminDashboard.tsx` shows basic counts; no export.

- **Facts needed:** what reporting cadence you actually want (weekly? per
  book? per language?) — this determines the query shape more than any
  code decision.
- **Prompt:**
  > "Add a CSV export button to AdminOrders/AdminDashboard for \[the
  > specific breakdown you decided on, e.g. 'revenue by language, monthly']."

### 6.2 Bulk import error recovery
`AdminImport.tsx` logs errors but doesn't offer a fixed re-upload flow.

- **Facts needed:** none — this is a workflow decision: should failed rows
  be downloadable as a corrected CSV to re-import?
- **Prompt:**
  > "After a bulk import, let the admin download a CSV of only the failed
  > rows (with the error reason as an extra column) so they can fix and
  > re-upload just those."

---

## How to use this file

Pick a section, fill in the "facts/files needed" for that idea, then paste
the corresponding prompt (with your facts substituted in) to your AI
assistant to implement. Sections 1–3 are foundational and worth doing
before growth features in 5–6.
