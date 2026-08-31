import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR } from "@/lib/format";

// BACKEND REMOVED: both pages below used to fetch orders/order_items from
// Supabase for the signed-in user. No backend is connected — since
// useAuth() always reports signed-out, OrdersList falls through to its
// existing "sign in" prompt, and OrderDetail always falls through to a
// "not found" state rather than spinning forever.

export function OrdersList() {
  const { user } = useAuth();
  const orders: any[] = [];

  if (!user) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
        <Receipt className="size-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground mb-4">Sign in to see your order history.</p>
      <Button asChild><Link to="/auth">Sign in</Link></Button>
    </div>
  );

  return (
    <>
      <Helmet><title>Orders | Digisell Books</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold mb-6">Your orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No orders yet.</p>
            <Button asChild className="mt-4"><Link to="/books">Browse books</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o)=>(
              <Link key={o.id} to={`/order/${o.id}`} className="block p-4 border border-border rounded-lg bg-card hover:border-primary transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0,8)}</div>
                    <div className="text-sm">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={o.status==="paid"?"default":"secondary"}>{o.status}</Badge>
                    <div className="font-mono font-semibold mt-1">{formatINR(o.total_amount)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">← All orders</Link>
      <div className="mt-8 text-center py-16 border-2 border-dashed border-border rounded-lg">
        <p className="text-muted-foreground font-mono">Order "{id}" not found.</p>
      </div>
    </div>
  );
}
