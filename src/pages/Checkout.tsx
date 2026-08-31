import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Tag, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatINR, effectivePrice } from "@/lib/format";
import { toast } from "sonner";

// BACKEND REMOVED: this page used to (1) prefill contact details from the
// signed-in user's `profiles` row, (2) resolve cart book IDs into full
// book records, and (3) place the order via the `place-order` edge
// function, which recomputed pricing server-side. No backend is
// connected, so book lookup always returns empty (falling through to the
// existing "cart is empty" state) and the submit handler is inert.
export default function Checkout() {
  const { loading: authLoading } = useAuth();
  useCart(); // cart id tracking still works locally; book resolution below does not
  const nav = useNavigate();
  const books: any[] = [];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"razorpay"|"cod">("razorpay");
  const [promo, setPromo] = useState("");
  const [busy, setBusy] = useState(false);

  const total = books.reduce((s, b) => s + Number(effectivePrice(b.price, b.discount_price)), 0);

  // Promo codes aren't implemented yet (see PROJECT_IDEAS.md §5.4) — this
  // is UI-only for now, styled in so the flow reads naturally end to end.
  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Promo codes aren't available yet.");
  };

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(false);
    toast.error("Checkout is unavailable — no backend is connected.");
  };

  if (authLoading) return <div className="p-8">Loading...</div>;
  if (books.length === 0) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
        <ShoppingBag className="size-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">Your cart is empty.</p>
      <Button asChild className="mt-4"><Link to="/books">Browse books</Link></Button>
    </div>
  );

  return (
    <>
      <Helmet><title>Checkout | Digisell Books</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold mb-6">Checkout</h1>
        <form onSubmit={place} className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="border border-border rounded-lg p-5 bg-card">
              <h2 className="font-display font-medium mb-4">Contact details</h2>
              <div className="space-y-3">
                <div><Label>Full name</Label><Input required value={name} onChange={(e)=>setName(e.target.value)}/></div>
                <div><Label>Email (for delivery)</Label><Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/></div>
              </div>
            </section>

            <section className="border border-border rounded-lg p-5 bg-card">
              <h2 className="font-display font-medium mb-4">Payment method</h2>
              <RadioGroup value={method} onValueChange={(v)=>setMethod(v as any)}>
                <label className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="razorpay"/>
                  <div className="flex-1">
                    <div className="font-medium">Razorpay (stubbed)</div>
                    <div className="text-xs text-muted-foreground">Card / UPI / Netbanking — payment simulated for now</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="cod"/>
                  <div className="flex-1">
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-xs text-muted-foreground">Admin will confirm and grant access manually (stubbed: auto-granted)</div>
                  </div>
                </label>
              </RadioGroup>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="border border-border rounded-lg p-5 bg-card sticky top-24">
              <h2 className="font-display font-medium mb-3">Order summary</h2>
              <ul className="space-y-2 max-h-60 overflow-auto text-sm">
                {books.map((b)=>(
                  <li key={b.id} className="flex justify-between gap-2">
                    <span className="line-clamp-1">{b.name}</span>
                    <span className="shrink-0 font-mono">{formatINR(effectivePrice(b.price, b.discount_price))}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Tag className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                  <Input
                    value={promo}
                    onChange={(e)=>setPromo(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="pl-9 font-mono"
                  />
                </div>
                <Button type="button" variant="outline" onClick={applyPromo}>Apply</Button>
              </div>

              <div className="border-t border-dashed border-border my-4"/>
              <div className="flex justify-between font-semibold"><span>Total</span><span className="font-mono">{formatINR(total)}</span></div>
              <Button type="submit" className="w-full mt-4" size="lg" disabled={busy}>
                {busy ? "Placing order..." : `Place order — ${formatINR(total)}`}
              </Button>
            </div>
          </aside>
        </form>
      </div>
    </>
  );
}
