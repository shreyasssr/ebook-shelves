import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatINR, effectivePrice } from "@/lib/format";
import { toast } from "sonner";

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { bookIds, clear } = useCart();
  const nav = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"razorpay"|"cod">("razorpay");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav(`/auth?redirect=/checkout`);
  }, [user, authLoading, nav]);

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? "");
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
        .then(({data})=>{ if (data?.full_name) setName(data.full_name); });
    }
  }, [user]);

  useEffect(() => {
    if (bookIds.length === 0) { setBooks([]); return; }
    supabase.from("books").select("id,name,author,price,discount_price").in("id", bookIds)
      .then(({data})=>setBooks(data ?? []));
  }, [bookIds]);

  const total = books.reduce((s, b) => s + Number(effectivePrice(b.price, b.discount_price)), 0);

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (books.length === 0) return;
    setBusy(true);

    // 1. Create order (status: pending for razorpay, processing for cod)
    const initialStatus = method === "cod" ? "completed" : "completed"; // stubbed: auto-complete both
    const { data: order, error: oErr } = await supabase.from("orders").insert({
      user_id: user.id,
      customer_email: email,
      customer_name: name,
      total_amount: total,
      status: initialStatus,
      payment_method: method,
      payment_reference_id: method === "razorpay" ? `stub_pay_${Date.now()}` : null,
      access_granted_at: new Date().toISOString(),
    }).select().single();

    if (oErr || !order) { setBusy(false); toast.error(oErr?.message ?? "Order failed"); return; }

    // 2. Order items
    const items = books.map((b) => ({
      order_id: order.id,
      book_id: b.id,
      book_name: b.name,
      author: b.author,
      unit_price: effectivePrice(b.price, b.discount_price),
    }));
    const { error: iErr } = await supabase.from("order_items").insert(items);
    if (iErr) { setBusy(false); toast.error(iErr.message); return; }

    // 3. Digital downloads (one per book) — file_url is the storage path
    const downloads = books.map((b) => ({
      order_id: order.id,
      book_id: b.id,
      user_id: user.id,
      download_url: `pending`, // will be served via edge function
    }));
    await supabase.from("digital_downloads").insert(downloads);

    // 4. Bump sales counters (best-effort)
    // Skipped: would require RPC or per-book update; non-critical for MVP.

    await clear();
    setBusy(false);
    toast.success("Order placed! Access granted.");
    nav(`/order/${order.id}`);
  };

  if (authLoading) return <div className="p-8">Loading...</div>;
  if (books.length === 0) return (
    <div className="max-w-md mx-auto p-8 text-center">
      <p>Your cart is empty.</p>
      <Button asChild className="mt-4"><Link to="/books">Browse books</Link></Button>
    </div>
  );

  return (
    <>
      <Helmet><title>Checkout | Digisell Books</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <form onSubmit={place} className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="border border-border rounded-lg p-5 bg-card">
              <h2 className="font-semibold mb-4">Contact details</h2>
              <div className="space-y-3">
                <div><Label>Full name</Label><Input required value={name} onChange={(e)=>setName(e.target.value)}/></div>
                <div><Label>Email (for delivery)</Label><Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/></div>
              </div>
            </section>

            <section className="border border-border rounded-lg p-5 bg-card">
              <h2 className="font-semibold mb-4">Payment method</h2>
              <RadioGroup value={method} onValueChange={(v)=>setMethod(v as any)}>
                <label className="flex items-center gap-3 p-3 border border-border rounded cursor-pointer">
                  <RadioGroupItem value="razorpay"/>
                  <div className="flex-1">
                    <div className="font-medium">Razorpay (stubbed)</div>
                    <div className="text-xs text-muted-foreground">Card / UPI / Netbanking — payment simulated for now</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-border rounded cursor-pointer">
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
            <div className="border border-border rounded-lg p-4 bg-card sticky top-24">
              <h2 className="font-semibold mb-3">Order summary</h2>
              <ul className="space-y-2 max-h-60 overflow-auto text-sm">
                {books.map((b)=>(
                  <li key={b.id} className="flex justify-between gap-2">
                    <span className="line-clamp-1">{b.name}</span>
                    <span className="shrink-0">{formatINR(effectivePrice(b.price, b.discount_price))}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border my-3"/>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
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
