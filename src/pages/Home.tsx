import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BookCard, { BookCardData } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

// BACKEND REMOVED: featured books, languages, and categories used to be
// fetched from Supabase. No backend is connected, so these render as
// empty states below rather than fake/mock data.
export default function Home() {
  const featured: BookCardData[] = [];
  const langs: any[] = [];
  const categories: any[] = [];

  return (
    <>
      <Helmet>
        <title>Digisell Books — PDF ebooks in Hindi, English, Marathi & more</title>
        <meta name="description" content="Buy and instantly download PDF ebooks across 6+ Indian languages. 5,000+ titles in fiction, self-help, biography, education, and more." />
      </Helmet>

      <section className="border-b border-border bg-gradient-to-br from-muted/50 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full mb-4">
              <Sparkles className="size-3.5" /> 5,000+ ebooks, instant download
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Stories in every language.
              <br />
              <span className="text-primary">Delivered to your inbox.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-md">
              A curated PDF ebook store in Hindi, English, Marathi, Gujarati,
              Bengali, Tamil — and growing.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg"><Link to="/books">Browse all books</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/books?sort=newest">New arrivals</Link></Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {featured.slice(0, 6).map((b, i) => (
              <div key={b.id} className={`aspect-[2/3] rounded-md overflow-hidden border border-border ${i === 1 ? "translate-y-4" : i === 4 ? "-translate-y-2" : ""}`}>
                {b.thumbnail_url ? (
                  <img src={b.thumbnail_url} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent p-3 flex items-end">
                    <div className="text-xs font-semibold line-clamp-3">{b.name}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Languages</h2>
        {langs.length === 0 && (
          <p className="text-sm text-muted-foreground">No languages available.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {langs.map((l) => (
            <Link
              key={l.id}
              to={`/books?lang=${l.code}`}
              className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition bg-card"
            >
              <div className="font-bold">{l.native_name || l.name}</div>
              <div className="text-xs text-muted-foreground">{l.book_count} books</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-bold">Bestsellers</h2>
          <Link to="/books" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-sm text-muted-foreground">No books available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featured.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Browse by category</h2>
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories available.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/books?category=${c.slug}`}
              className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-sm transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
