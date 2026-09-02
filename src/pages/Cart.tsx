import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { formatINR, effectivePrice } from "@/lib/format";
import { pb } from "@/lib/pocketbase";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export default function Cart() {
  const { bookIds, remove, count } = useCart();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      if (bookIds.length === 0) {
        setBooks([]);
        return;
      }
      setLoading(true);
      try {
        const filterStr = bookIds.map((id: string) => `id="${id}"`).join(" || ");
        const res = await pb.collection("books").getFullList({ filter: filterStr });
        setBooks(res);
      } catch (err) {
        console.error("Cart fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookIds]);

  const total = books.reduce((s, b) => s + Number(effectivePrice(b.price, b.discount_price)), 0);

  return (
    <>
      <Helmet><title>Cart | Digisell Books</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold mb-6">Your cart <span className="text-muted-foreground font-mono text-xl">({count})</span></h1>

        {books.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="size-6 text-muted-foreground"/>
            </div>
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4"><Link to="/books">Browse books</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {books.map((b) => (
                <div key={b.id} className="flex gap-4 p-3 border border-border rounded-lg bg-card">
                  <Link to={`/book/${b.slug}`} className="w-16 h-24 rounded overflow-hidden shrink-0">
                    <ImagePlaceholder src={b.thumbnail ? pb.files.getUrl(b, b.thumbnail) : ""} alt={b.name} label="Cover" size="128×192" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/book/${b.slug}`} className="font-display font-medium hover:text-primary line-clamp-2">{b.name}</Link>
                    <p className="text-sm text-muted-foreground font-mono">{b.author}</p>
                    <p className="mt-2 font-mono font-semibold text-primary">{formatINR(effectivePrice(b.price, b.discount_price))}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={()=>remove(b.id)}><Trash2 className="size-4"/></Button>
                </div>
              ))}
            </div>
            <aside className="space-y-4">
              <div className="border border-border rounded-lg p-5 bg-card">
                <h2 className="font-display font-medium mb-3">Order summary</h2>
                <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span className="font-mono">{formatINR(total)}</span></div>
                <div className="flex justify-between text-sm mb-2 text-muted-foreground"><span>Delivery</span><span>Instant download</span></div>
                <div className="border-t border-dashed border-border my-3"/>
                <div className="flex justify-between font-semibold"><span>Total</span><span className="font-mono">{formatINR(total)}</span></div>
                <Button className="w-full mt-4" size="lg" onClick={()=>nav("/checkout")}>Checkout</Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
