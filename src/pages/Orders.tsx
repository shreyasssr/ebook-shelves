import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
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
  if (!user) return <div className="p-8"><Link to="/auth" className="text-primary">Sign in</Link></div>;
  return (
    <>
      <Helmet><title>Orders | Digisell Books</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Your orders</h1>
        {orders.length === 0 ? <p className="text-muted-foreground">No orders yet.</p> :
          <div className="space-y-3">
            {orders.map((o)=>(
              <Link key={o.id} to={`/order/${o.id}`} className="block p-4 border border-border rounded-lg bg-card hover:border-primary">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0,8)}</div>
                    <div className="text-sm">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={o.status==="paid"?"default":"secondary"}>{o.status}</Badge>
                    <div className="font-bold mt-1">{formatINR(o.total_amount)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        }
      </div>
    </>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">← All orders</Link>
      <p className="mt-4">Order "{id}" not found.</p>
    </div>
  );
}
