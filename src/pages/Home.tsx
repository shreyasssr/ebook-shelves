import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BookCard, { BookCardData } from "@/components/BookCard";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { Button } from "@/components/ui/button";
import { Sparkles, Quote, Globe2, ShieldCheck, Download } from "lucide-react";

// BACKEND REMOVED: featured books, languages, and categories used to be
// fetched from Supabase. No backend is connected, so these render as
// empty states below rather than fake/mock data.
export default function Home() {
  const featured: BookCardData[] = [];
  const langs: { id: string; code: string; name: string; native_name?: string; book_count: number }[] = [];
  const categories: { id: string; name: string; slug: string }[] = [];

  return (
    <>
      <Helmet>
        <title>Digisell Books — PDF ebooks in Hindi, English, Marathi & more</title>
        <meta name="description" content="Buy and instantly download PDF ebooks across 6+ Indian languages. 5,000+ titles in fiction, self-help, biography, education, and more." />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-sm bg-brass/20 text-brass-foreground px-3 py-1 rounded-full mb-5 font-mono">
              <Sparkles className="size-3.5" /> 5,000+ ebooks, instant download
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Stories in
              <br />
              every language.
              <br />
              <span className="text-primary italic">Delivered instantly.</span>
            </h1>
            <p className="mt-5 text-muted-foreground text-lg max-w-md">
              A curated PDF ebook shop in Hindi, English, Marathi, Gujarati,
              Bengali, Tamil — and growing.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/books">Browse all books</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/books?sort=newest">New arrivals</Link></Button>
            </div>
          </div>

          {/* Hero image — swap the placeholder for a real photo/illustration */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border shadow-[6px_6px_0_0_var(--color-brass)]">
            <ImagePlaceholder
              variant="prominent"
              label="Hero image — warm, cluttered independent bookshop interior with stacked colorful book spines, soft window light"
              size="1600×1200"
            />
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <Download className="size-5 text-primary shrink-0" />
            <span>Instant PDF delivery, no waiting</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe2 className="size-5 text-primary shrink-0" />
            <span>6+ Indian languages, growing weekly</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-primary shrink-0" />
            <span>Lifetime access to everything you buy</span>
          </div>
        </div>
      </section>

      {/* ── Languages ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-foreground mb-1">Shelf by shelf</p>
        <h2 className="font-display text-2xl font-semibold mb-5">Browse by language</h2>
        {langs.length === 0 && (
          <p className="text-sm text-muted-foreground">No languages available yet — check back soon.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {langs.map((l) => (
            <Link
              key={l.id}
              to={`/books?lang=${l.code}`}
              className="group rounded-md overflow-hidden border border-border bg-card hover:shadow-md transition"
            >
              <div className="aspect-[4/3]">
                <ImagePlaceholder
                  label={`${l.name} language tile — an open book cover in ${l.name} script`}
                  size="400×300"
                />
              </div>
              <div className="p-3">
                <div className="font-display font-medium group-hover:text-primary">{l.native_name || l.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{l.book_count} books</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bestsellers ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brass-foreground mb-1">Reader favorites</p>
            <h2 className="font-display text-2xl font-semibold">Bestsellers</h2>
          </div>
          <Link to="/books" className="text-sm text-primary hover:underline font-medium">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg py-14 text-center text-sm text-muted-foreground">
            No books published yet — once your catalog is live, bestsellers will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featured.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </section>

      {/* ── Promo banner ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative rounded-lg overflow-hidden border border-border grid md:grid-cols-2 min-h-[280px]">
          <div className="aspect-[4/3] md:aspect-auto">
            <ImagePlaceholder
              variant="prominent"
              label="Promo banner — a person reading an ebook on a tablet in a cozy corner, warm tones"
              size="1200×900"
            />
          </div>
          <div className="bg-primary text-primary-foreground p-8 md:p-10 flex flex-col justify-center">
            <p className="font-mono text-xs uppercase tracking-widest text-brass mb-2">Limited time</p>
            <h3 className="font-display text-3xl font-semibold mb-3">Monsoon Reading Sale</h3>
            <p className="text-primary-foreground/80 mb-6 max-w-sm">
              Up to 40% off across Fiction and Self-Help, this week only.
            </p>
            <div>
              <Button asChild variant="secondary" size="lg">
                <Link to="/books?category=fiction">Shop the sale</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-foreground mb-1">Find your next read</p>
        <h2 className="font-display text-2xl font-semibold mb-5">Browse by category</h2>
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories available yet.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/books?category=${c.slug}`}
              className="px-4 py-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground text-sm font-medium transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <p className="font-mono text-xs uppercase tracking-widest text-brass-foreground mb-1 text-center">What readers say</p>
          <h2 className="font-display text-2xl font-semibold mb-8 text-center">Loved by readers everywhere</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ananya R.", quote: "Found Marathi titles here I couldn't find anywhere else. Download was instant." },
              { name: "Vikram S.", quote: "The Hindi self-help section alone was worth signing up for." },
              { name: "Fatima K.", quote: "Simple checkout, and my library page keeps everything organized." },
            ].map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-lg p-6 relative">
                <Quote className="size-6 text-brass mb-3" />
                <p className="text-sm text-foreground/90 mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full overflow-hidden shrink-0">
                    <ImagePlaceholder label={`Avatar — ${t.name}`} size="100×100" />
                  </div>
                  <span className="text-sm font-medium font-mono">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
