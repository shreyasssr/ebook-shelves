# Project Ideas — Fill-In Forms

This is a companion to `PROJECT_IDEAS.md`. That file explains *what* each
idea is and *why*; this file is where you actually **type in your answers**
for each one. Once a section is filled in, hand that section back to your
coding assistant — the filled-in fields are everything it needs to
implement the feature for real, instead of guessing at placeholder content.

Sections are grouped by which frontend page(s) they affect, so you can work
through this page by page instead of jumping around.

> ⚠️ **Blocker to be aware of:** the backend (Supabase/Firebase/Algolia) was
> fully removed in the last cleanup. Every idea below that needs to *store*
> data (catalog, reviews, coupons, orders, etc.) needs a backend reconnected
> first. You can still fill in the content/decisions now — none of that
> work is wasted — but implementation will be blocked until a backend
> exists again. Ideas that are pure frontend/content (policy pages, README,
> homepage copy) can be implemented immediately.

---

## 📄 Home.tsx

### Homepage merchandising *(PROJECT_IDEAS.md §5.2)*

| Field | Your answer |
|---|---|
| Section title 1 (e.g. "Bestsellers") | |
| Books to feature in section 1 (titles or slugs, in order) | |
| Section title 2, if any (e.g. "New Arrivals") | |
| Books to feature in section 2 | |
| Promotional banner headline | |
| Promotional banner subtext | |
| Banner CTA button text | |
| Banner CTA link (page/URL) | |
| Banner image (attach file or describe what it should show) | |
| Banner active dates (start – end), if time-limited | |

---

## 📄 Catalog.tsx / Home.tsx (shared filter data)

### More languages / categories *(PROJECT_IDEAS.md §2.2)*

| Field | Your answer |
|---|---|
| New languages to add (name + short code, one per line, e.g. `Punjabi — pa`) | |
| New categories to add (name + slug, one per line, e.g. `Cooking — cooking`) | |
| Any existing language/category to remove or rename? | |
| Should the filter sidebar sort these alphabetically or by a custom order you specify? | |

### Search relevance tuning *(PROJECT_IDEAS.md §5.1)*

| Field | Your answer |
|---|---|
| Top search terms your users actually type (paste a list once you have usage data) | |
| Any searches that currently return the wrong/no results? | |
| Should misspellings/synonyms be handled (e.g. "buisness" → "business")? List any known ones. | |

---

## 📄 BookDetail.tsx

### Real book catalog — per-book content *(PROJECT_IDEAS.md §2.1)*

Fill in one copy of this table **per book**. Duplicate the block for each
title in your catalog.

| Field | Your answer |
|---|---|
| Title | |
| Author | |
| ISBN (optional) | |
| Language | |
| Category | |
| Short description (1–2 lines, shown in listings) | |
| Long description (full paragraph, shown on detail page) | |
| Price | |
| Discount price (optional) | |
| Page count | |
| Publisher | |
| Published year | |
| Edition | |
| "What's included" bullets (one per line) | |
| FAQ 1 — question | |
| FAQ 1 — answer | |
| FAQ 2 — question | |
| FAQ 2 — answer | |
| Tags (comma-separated) | |
| Cover image file name (attach the file) | |
| Ebook file name — PDF/EPUB (attach the file) | |
| Sample/preview file name, if offering one (attach the file) | |

### Reviews / ratings *(PROJECT_IDEAS.md §2.3 — decisions only, no per-book data needed)*

| Field | Your answer |
|---|---|
| Who can review — only verified purchasers, or anyone? | |
| Star rating only, or star + written text? | |
| Are reviews shown instantly, or held for admin approval first? | |
| Can a user edit/delete their own review later? | |

---

## 📄 Cart.tsx / Checkout.tsx

### Real Razorpay integration *(PROJECT_IDEAS.md §4.1)*

| Field | Your answer |
|---|---|
| Razorpay Key ID (test mode) | |
| Razorpay Key Secret (test mode) — store securely, don't paste in plain chat if this is a real key | |
| Razorpay webhook signing secret | |
| Live mode keys ready, or test-only for now? | |
| Bank settlement account already added in Razorpay dashboard? (yes/no) | |

### COD / pay-later handling *(PROJECT_IDEAS.md §4.2)*

| Field | Your answer |
|---|---|
| Keep the "Cash on Delivery"-style option for digital goods, or remove it entirely? | |
| If keeping it: who manually confirms payment — you, or another admin user? | |
| If keeping it: how should the customer be notified once confirmed (email? nothing, they just check Orders page?) | |

### Coupon / discount codes *(PROJECT_IDEAS.md §5.4)*

| Field | Your answer |
|---|---|
| Discount type — percentage off, flat amount off, or both? | |
| Example codes to launch with (code, type, amount, expiry) | |
| Single-use per customer, or reusable by anyone with the code? | |
| Do coupons stack with a book's existing discount_price, or override it? | |
| Global expiry date, or per-code expiry? | |

---

## 📄 Footer / new static pages (linked from Layout.tsx)

### Refund / cancellation policy *(PROJECT_IDEAS.md §3.1)*

| Field | Your answer |
|---|---|
| Are refunds ever offered for digital downloads? | |
| If yes: under what conditions (e.g. "within 24 hours if not downloaded")? | |
| If no: exact wording you want customers to see | |
| Who do customers contact to request a refund (email/page)? | |

### Terms of Service & Privacy Policy *(PROJECT_IDEAS.md §3.2)*

| Field | Your answer |
|---|---|
| Registered business name | |
| Business contact email | |
| Business address (for legal notices) | |
| Data collected from users (check all that apply: email, name, purchase history, IP address, cookies, other — list "other") | |
| Third parties data is shared with (e.g. payment processor, hosting/backend provider, analytics) | |
| Governing law / jurisdiction (e.g. "Republic of India") | |

### GST / invoicing *(PROJECT_IDEAS.md §3.3, India-specific)*

| Field | Your answer |
|---|---|
| Are you GST-registered? (yes/no) | |
| GSTIN, if registered | |
| Invoice numbering scheme you want (e.g. `INV-2026-0001`) | |
| Should invoices auto-email to the customer, or only be downloadable from their Orders page? | |

---

## 📄 Dashboard.tsx / Orders.tsx (customer-facing)

### Email notifications *(PROJECT_IDEAS.md §5.3)*

| Field | Your answer |
|---|---|
| Email provider you'll use (Resend / SendGrid / Postmark / other) | |
| API key for that provider | |
| "From" address and display name (e.g. `orders@yourdomain.com`, "Digisell Books") | |
| Order confirmation email — subject line | |
| Order confirmation email — body copy (or "keep it simple, just confirm the order + link to download") | |
| Any other emails wanted right now (e.g. abandoned cart, welcome email)? | |

---

## 📄 Admin pages (AdminDashboard.tsx, AdminOrders.tsx, AdminBooks.tsx, AdminImport.tsx)

### Sales & customer reports *(PROJECT_IDEAS.md §6.1)*

| Field | Your answer |
|---|---|
| Reporting cadence you actually want (daily / weekly / monthly / on-demand only) | |
| Breakdown you want first (e.g. "revenue by language", "top 10 books by sales", "orders by payment method") | |
| Export format wanted — CSV, or just viewed on-screen? | |

### Bulk import error recovery *(PROJECT_IDEAS.md §6.2)*

| Field | Your answer |
|---|---|
| Should failed rows be downloadable as a corrected CSV (with error reason as an extra column)? (yes/no) | |
| Should a failed import auto-notify you (email), or is checking the admin panel enough? | |

---

## 📄 Foundation (not a specific page — affects the whole app)

### Backend reconnection *(blocking item, see warning at top of this file)*

| Field | Your answer |
|---|---|
| Backend to reconnect — Supabase, Firebase, or something else entirely? | |
| If Supabase: do you have a project already, or does one need creating from scratch? | |
| If something else: what, and do you have docs/credentials ready? | |

### Key rotation / secret scrubbing *(PROJECT_IDEAS.md §1.2 — still outstanding from earlier)*

| Field | Your answer |
|---|---|
| Have any of the previously-leaked keys (old Supabase/Firebase/Algolia) been rotated yet? (yes/no) | |
| Do you want help scrubbing them from git history now, or later? | |

---

## How to use this file

1. Pick one page section above.
2. Fill in every row you can — leave blank anything you're not ready to decide yet, that's fine, just implement what's filled in.
3. Paste that filled-in section to your coding assistant along with: "implement this using the answers below."
4. Move to the next section whenever you're ready — there's no required order except: **backend reconnection should happen before anything that needs to store data.**
