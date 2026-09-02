import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BookCard, { BookCardData } from "@/components/BookCard";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { Button } from "@/components/ui/button";
import { Sparkles, Quote, Globe2, ShieldCheck, Download } from "lucide-react";
import { pb } from "@/lib/pocketbase";

export default function Home() {
  const [featured, setFeatured] = useState<BookCardData[]>([]);
  const [staffPicks, setStaffPicks] = useState<BookCardData[]>([]);
  const [trending, setTrending] = useState<BookCardData[]>([]);
  const [langs, setLangs] = useState<{ id: string; code: string; name: string; native_name?: string; book_count: number }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [booksRes, staffRes, trendingRes, langsRes, catsRes] = await Promise.all([
          pb.collection("books").getList(1, 12, { filter: "is_published=true", sort: "-sales_count" }),
          pb.collection("books").getList(1, 12, { filter: "is_published=true && is_staff_pick=true", sort: "-created" }),
          pb.collection("trending_books").getList(1, 12, { expand: "book" }),
          pb.collection("languages").getFullList({ filter: "is_active=true", sort: "display_order" }),
          pb.collection("categories").getFullList({ sort: "name" })
        ]);

        setFeatured(booksRes.items as unknown as BookCardData[]);
        setStaffPicks(staffRes.items as unknown as BookCardData[]);
        setTrending(trendingRes.items.map(t => t.expand?.book).filter(Boolean) as unknown as BookCardData[]);
        
        setLangs(langsRes.map((l: any) => ({ ...l, book_count: l.book_count || 0 })));
        setCategories(catsRes as any[]);
      } catch (err) {
        console.error("Failed to fetch home data", err);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Digisell Books | PDF ebooks in Hindi, English, Marathi & more</title>
        <meta name="description" content="Buy and instantly download PDF ebooks across 6+ Indian languages. 5,000+ titles in fiction, self-help, biography, education, and more." />
      </Helmet>

      {/* Hero */}
      <section className="theme-retro halftone-bg relative overflow-hidden border-b-[3px] border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-sm bg-accent text-accent-foreground border-[3px] border-border px-3 py-1 mb-5 font-poster -rotate-1">
              <Sparkles className="size-3.5" /> 5,000+ ebooks, instant download
            </div>
            <h1 className="font-comic text-5xl md:text-7xl leading-[0.95] tracking-wide">
              Stories in
              <br />
              every language.
              <br />
              <span className="text-primary">Delivered instantly.</span>
            </h1>
            <p className="mt-5 text-muted-foreground text-lg max-w-md">
              A curated PDF ebook shop in Hindi, English, Marathi, Gujarati,
              Bengali, Tamil — and growing. Novels, comics and manga, all in
              one shelf.
            </p>
            <div className="mt-8 flex gap-3">
              <Button size="lg" asChild className="h-12 px-8 text-base border-[3px] border-border comic-shadow-hover">
                <Link to="/books">Browse the stacks</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden border-[3px] border-border bg-muted rotate-1 hover:rotate-0 transition-transform duration-500 comic-shadow">
            <ImagePlaceholder
              variant="prominent"
              label="A diverse shelf of beautifully bound books, comics and manga"
              size="1600×1200"
            />
          </div>
        </div>
      </section>

      {/* Featured shelf */}
      <section className="theme-retro py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-comic text-4xl tracking-wide">Bestsellers</h2>
            <p className="text-muted-foreground mt-2 font-mono text-sm">Most downloaded this month</p>
          </div>
          <Link to="/books?sort=popular" className="hidden sm:block text-sm font-semibold hover:text-primary transition-colors">
            See all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg bg-card/50 py-16 text-center">
            <p className="text-muted-foreground">Once backend data is restored, featured books will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featured.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>

      {/* Staff Picks shelf */}
      <section className="theme-retro py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 border-t-[3px] border-border">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-comic text-4xl tracking-wide">Staff Picks</h2>
            <p className="text-muted-foreground mt-2 font-mono text-sm">Curated favorites from our team</p>
          </div>
        </div>

        {staffPicks.length === 0 ? (
          <div className="border-[3px] border-dashed border-border rounded-lg bg-card/50 py-16 text-center">
            <p className="text-muted-foreground">No staff picks yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {staffPicks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>

      {/* Trending shelf */}
      <section className="theme-retro py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 border-t-[3px] border-border">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-comic text-4xl tracking-wide">Trending Now</h2>
            <p className="text-muted-foreground mt-2 font-mono text-sm">Hot reads from the last 30 days</p>
          </div>
        </div>

        {trending.length === 0 ? (
          <div className="border-[3px] border-dashed border-border rounded-lg bg-card/50 py-16 text-center">
            <p className="text-muted-foreground">Trending data unavailable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>

      {/* Categories & Languages */}
      <section className="theme-retro border-t-[3px] border-border bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-16">
          {/* Languages */}
          <div>
            <h2 className="font-comic text-3xl tracking-wide mb-6 flex items-center gap-2">
              <Globe2 className="size-6 text-muted-foreground" /> Shop by language
            </h2>
            {langs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Languages currently unavailable.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {langs.map((l) => (
                  <Link
                    key={l.id}
                    to={`/books?lang=${l.code}`}
                    className="flex justify-between items-center p-3 border-[3px] border-border bg-card comic-shadow-hover transition-all group"
                  >
                    <div>
                      <div className="font-semibold">{l.name}</div>
                      {l.native_name && <div className="text-xs text-muted-foreground">{l.native_name}</div>}
                    </div>
                    {/* Optional book count if available */}
                    {/* <div className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                      {l.book_count}
                    </div> */}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <h2 className="font-comic text-3xl tracking-wide mb-6">Subject categories</h2>
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-sm">Categories currently unavailable.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/books?category=${c.slug}`}
                    className="px-4 py-2 border-[3px] border-border bg-card hover:bg-foreground hover:text-background transition-colors text-sm font-medium"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-border py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-10 text-center">
          <div>
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
              <Download className="size-6 text-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Instant PDF access</h3>
            <p className="text-muted-foreground text-sm">Download your books the second your payment clears. No DRM, no special reader apps required.</p>
          </div>
          <div>
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
              <Globe2 className="size-6 text-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Regional focus</h3>
            <p className="text-muted-foreground text-sm">We specialize in Indian languages, working directly with publishers to digitize rare and popular works.</p>
          </div>
          <div>
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
              <ShieldCheck className="size-6 text-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Secure purchasing</h3>
            <p className="text-muted-foreground text-sm">Fully encrypted payments via Razorpay. Access your library forever via your dashboard.</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-t border-border py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-primary-foreground)_0,_transparent_1px)] bg-[size:16px_16px]" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <Quote className="size-10 mx-auto text-primary-foreground/30 mb-6" />
          <p className="font-display text-2xl md:text-3xl leading-relaxed mb-8">
            "Finally, a place where I can easily buy and download Marathi literature in high-quality PDF format. The store is incredibly fast and simple to use."
          </p>
          <div className="font-mono text-sm tracking-wider uppercase text-primary-foreground/70">
            ?" Rohan M., Mumbai
          </div>
        </div>
      </section>
    </>
  );
}
