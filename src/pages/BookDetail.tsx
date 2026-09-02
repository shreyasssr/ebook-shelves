import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pb } from "@/lib/pocketbase";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { formatINR, effectivePrice, discountPct } from "@/lib/format";
import { useCart } from "@/hooks/useCart";

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { add, bookIds } = useCart();

  useEffect(() => {
    async function loadBook() {
      try {
        const record = await pb.collection("books").getFirstListItem(`slug="${slug}" && is_published=true`, {
          expand: "language,category"
        });
        setBook(record);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [slug]);

  if (loading) {
    return <div className="p-24 text-center">Loading...</div>;
  }

  if (error || !book) {
    return (
      <>
        <Helmet><title>Book not found | Digisell Books</title></Helmet>
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
            <BookOpen className="size-6 text-muted-foreground" />
          </div>
          <h1 className="font-comic text-3xl tracking-wide mb-2">This title isn't on the shelf</h1>
          <p className="text-sm text-muted-foreground mb-6 font-mono">"{slug}"</p>
          <Button asChild><Link to="/books">Browse all books</Link></Button>
        </div>
      </>
    );
  }

  const price = book.price;
  const discount = book.discount_price;
  const finalPrice = effectivePrice(price, discount);
  const pct = discountPct(price, discount);
  const inCart = bookIds.includes(book.id);

  const coverUrl = book.thumbnail 
    ? pb.files.getUrl(book, book.thumbnail)
    : undefined;

  return (
    <>
      <Helmet><title>{book.name} | Digisell Books</title></Helmet>
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-[2/3] bg-muted relative overflow-hidden border-[3px] border-border comic-shadow max-w-sm mx-auto md:mx-0">
             <ImagePlaceholder
                src={coverUrl}
                alt={book.name}
                label={`Cover — "${book.name}"`}
                size="800×1200"
              />
          </div>
        </div>
        <div>
          <h1 className="font-comic text-4xl md:text-6xl tracking-wide mb-2">{book.name}</h1>
          <p className="text-xl text-muted-foreground mb-6">{book.author}</p>
          
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-3xl font-mono font-semibold text-primary">
              {formatINR(finalPrice)}
            </span>
            {pct > 0 && (
              <span className="text-xl text-muted-foreground line-through font-mono">
                {formatINR(price)}
              </span>
            )}
            {pct > 0 && (
              <span className="bg-burgundy text-burgundy-foreground text-sm font-mono px-3 py-1 rounded-full">
                Save {pct}%
              </span>
            )}
          </div>

          <p className="text-base leading-relaxed text-foreground mb-8">
            {book.description || book.long_description || "No description available."}
          </p>
          
          <div className="flex gap-4 mb-8">
            <Button size="lg" onClick={() => add(book.id)} disabled={inCart} className="w-full md:w-auto h-14 px-8 text-lg">
              {inCart ? <><Check className="mr-2" /> In Cart</> : <><ShoppingCart className="mr-2" /> Add to Cart</>}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/20 p-6 border-[3px] border-border comic-shadow">
             {book.expand?.language && (
               <div>
                 <span className="text-muted-foreground block mb-1">Language</span>
                 <span className="font-semibold">{book.expand.language.name}</span>
               </div>
             )}
             {book.expand?.category && (
               <div>
                 <span className="text-muted-foreground block mb-1">Category</span>
                 <span className="font-semibold">{book.expand.category.name}</span>
               </div>
             )}
             {book.page_count && (
               <div>
                 <span className="text-muted-foreground block mb-1">Pages</span>
                 <span className="font-semibold">{book.page_count}</span>
               </div>
             )}
             {book.published_year && (
               <div>
                 <span className="text-muted-foreground block mb-1">Published</span>
                 <span className="font-semibold">{book.published_year}</span>
               </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
}
