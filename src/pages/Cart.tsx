import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { formatINR, effectivePrice } from "@/lib/format";

// BACKEND REMOVED: cart item IDs are still tracked locally (see useCart),
// but resolving those IDs into full book details (name, price, cover) used
// to require a Supabase lookup. No backend is connected, so `books` is
// always empty here and the cart renders its existing "empty" state.
export default function Cart() {
  const { remove, count } = useCart();
  const books: any[] = [];
  const nav = useNavigate();

  const total = books.reduce((s, b) => s + Number(effectivePrice(b.price, b.discount_price)), 0);

  return (
    <>
      <Helmet><title>Cart | Digisell Books</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Your cart ({count})</h1>

        {books.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <ShoppingBag className="size-12 mx-auto text-muted-foreground"/>
            <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4"><Link to="/books">Browse books</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {books.map((b) => (
                <div key={b.id} className="flex gap-4 p-3 border border-border rounded-lg bg-card">
                  <Link to={`/book/${b.slug}`} className="w-16 h-24 bg-muted rounded overflow-hidden shrink-0">
                    {b.thumbnail_url && <img src={b.thumbnail_url} alt={b.name} className="w-full h-full object-cover"/>}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/book/${b.slug}`} className="font-medium hover:text-primary line-clamp-2">{b.name}</Link>
                    <p className="text-sm text-muted-foreground">{b.author}</p>
                    <p className="mt-2 font-bold">{formatINR(effectivePrice(b.price, b.discount_price))}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={()=>remove(b.id)}><Trash2 className="size-4"/></Button>
                </div>
              ))}
            </div>
            <aside className="space-y-4">
              <div className="border border-border rounded-lg p-4 bg-card">
                <h2 className="font-semibold mb-3">Order summary</h2>
                <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>{formatINR(total)}</span></div>
                <div className="flex justify-between text-sm mb-2 text-muted-foreground"><span>Delivery</span><span>Instant download</span></div>
                <div className="border-t border-border my-3"/>
                <div className="flex justify-between font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
                <Button className="w-full mt-4" size="lg" onClick={()=>nav("/checkout")}>Checkout</Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
