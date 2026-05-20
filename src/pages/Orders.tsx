import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";

export function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at",{ascending:false})
      .then(({data})=>setOrders(data ?? []));
  }, [user]);
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
                    <Badge variant={o.status==="completed"?"default":"secondary"}>{o.status}</Badge>
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
  const { user } = useAuth();
  const [order, setOrder] = useState<any|null>(null);
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data: o } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      setOrder(o);
      const { data: i } = await supabase.from("order_items").select("*").eq("order_id", id);
      setItems(i ?? []);
    })();
  }, [id, user]);
  if (!order) return <div className="p-8">Loading...</div>;
  return (
    <>
      <Helmet><title>Order #{order.id.slice(0,8)} | Digisell Books</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">← All orders</Link>
        <div className="flex justify-between items-center mt-2 mb-6">
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0,8)}</h1>
          <Badge>{order.status}</Badge>
        </div>
        <div className="border border-border rounded-lg p-5 bg-card mb-6">
          <div className="text-sm grid grid-cols-2 gap-3">
            <div><div className="text-muted-foreground">Customer</div><div>{order.customer_name}</div></div>
            <div><div className="text-muted-foreground">Email</div><div>{order.customer_email}</div></div>
            <div><div className="text-muted-foreground">Payment</div><div className="capitalize">{order.payment_method}</div></div>
            <div><div className="text-muted-foreground">Total</div><div className="font-bold">{formatINR(order.total_amount)}</div></div>
          </div>
        </div>
        <h2 className="font-semibold mb-3">Items</h2>
        <ul className="space-y-2">
          {items.map((it)=>(
            <li key={it.id} className="flex justify-between p-3 border border-border rounded bg-card">
              <div><div className="font-medium">{it.book_name}</div><div className="text-xs text-muted-foreground">{it.author}</div></div>
              <div className="font-bold">{formatINR(it.unit_price)}</div>
            </li>
          ))}
        </ul>
        {order.status === "completed" && (
          <Button asChild className="mt-6"><Link to="/dashboard">Go to My Library to download →</Link></Button>
        )}
      </div>
    </>
  );
}
