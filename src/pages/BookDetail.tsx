import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen, ShoppingCart, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/hooks/useCart";
import { formatINR, effectivePrice, discountPct } from "@/lib/format";
import { toast } from "sonner";

export default function BookDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { bookIds, add } = useCart();
  const [book, setBook] = useState<any | null>(null);
  const [language, setLanguage] = useState<any | null>(null);
  const [category, setCategory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("books").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      setBook(data);
      if (data) {
        const [{ data: l }, { data: c }] = await Promise.all([
          supabase.from("languages").select("*").eq("id", data.language_id).maybeSingle(),
          data.category_id ? supabase.from("categories").select("*").eq("id", data.category_id).maybeSingle() : Promise.resolve({ data: null }),
        ]);
        setLanguage(l);
        setCategory(c);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="max-w-6xl mx-auto px-6 py-16">Loading...</div>;
  if (!book) return <div className="max-w-6xl mx-auto px-6 py-16">Book not found. <Link to="/books" className="text-primary">Browse all</Link></div>;

  const inCart = bookIds.includes(book.id);
  const price = effectivePrice(book.price, book.discount_price);
  const pct = discountPct(book.price, book.discount_price);

  return (
    <>
      <Helmet>
        <title>{book.name} by {book.author} | Digisell Books</title>
        <meta name="description" content={book.description?.slice(0, 155)} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
          <Link to="/books" className="hover:text-foreground">Books</Link>
          {language && <> / <Link to={`/books?lang=${language.code}`} className="hover:text-foreground">{language.name}</Link></>}
          {" "}/ <span className="text-foreground">{book.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="aspect-[2/3] max-w-sm mx-auto bg-muted rounded-lg overflow-hidden border border-border">
              {book.thumbnail_url ? (
                <img src={book.thumbnail_url} alt={book.name} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <BookOpen className="size-16"/>
                </div>
              )}
            </div>
          </div>

          <div>
            {language && <Badge variant="secondary" className="mb-2">{language.name}</Badge>}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{book.name}</h1>
            <p className="mt-2 text-muted-foreground">by <span className="font-medium text-foreground">{book.author}</span></p>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatINR(price)}</span>
              {pct > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatINR(book.price)}</span>
                  <Badge className="bg-destructive">-{pct}%</Badge>
                </>
              )}
            </div>

            <p className="mt-4 text-base leading-relaxed">{book.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {inCart ? (
                <Button size="lg" variant="outline" onClick={()=>nav("/cart")}>
                  <Check className="size-4 mr-2"/> In cart — View
                </Button>
              ) : (
                <Button size="lg" onClick={async () => {
                  await add(book.id);
                  toast.success("Added to cart");
                }}>
                  <ShoppingCart className="size-4 mr-2"/> Add to cart
                </Button>
              )}
              <Button size="lg" variant="default" className="bg-primary" onClick={async () => {
                if (!inCart) await add(book.id);
                nav("/checkout");
              }}>
                Buy now
              </Button>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3 text-sm border-t border-border pt-6">
              {book.publisher && (<><dt className="text-muted-foreground">Publisher</dt><dd>{book.publisher}</dd></>)}
              {book.published_year && (<><dt className="text-muted-foreground">Year</dt><dd>{book.published_year}</dd></>)}
              {book.edition && (<><dt className="text-muted-foreground">Edition</dt><dd>{book.edition}</dd></>)}
              {book.page_count && (<><dt className="text-muted-foreground">Pages</dt><dd>{book.page_count}</dd></>)}
              {book.isbn && (<><dt className="text-muted-foreground">ISBN</dt><dd>{book.isbn}</dd></>)}
              {category && (<><dt className="text-muted-foreground">Category</dt><dd><Link to={`/books?category=${category.slug}`} className="text-primary hover:underline">{category.name}</Link></dd></>)}
              <dt className="text-muted-foreground">Format</dt><dd>PDF — instant download</dd>
            </dl>
          </div>
        </div>

        {(book.long_description || (book.what_is_included?.length ?? 0) > 0 || (book.faqs?.length ?? 0) > 0) && (
          <div className="mt-12 max-w-3xl">
            {book.long_description && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3">About this book</h2>
                <p className="whitespace-pre-line leading-relaxed">{book.long_description}</p>
              </section>
            )}
            {book.what_is_included?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3">What's included</h2>
                <ul className="space-y-2">
                  {book.what_is_included.map((i: string, idx: number) => (
                    <li key={idx} className="flex gap-2"><Check className="size-5 text-primary shrink-0"/> {i}</li>
                  ))}
                </ul>
              </section>
            )}
            {book.faqs?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3">FAQs</h2>
                <Accordion type="single" collapsible>
                  {book.faqs.map((f: any, idx: number) => (
                    <AccordionItem key={idx} value={String(idx)}>
                      <AccordionTrigger>{f.q || f.question}</AccordionTrigger>
                      <AccordionContent>{f.a || f.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
