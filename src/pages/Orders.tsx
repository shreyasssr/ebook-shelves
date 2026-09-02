import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Receipt, Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR } from "@/lib/format";
import { pb } from "@/lib/pocketbase";

export function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<"all"|"paid"|"pending"|"failed">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await pb.collection("orders").getFullList({
          filter: `user="${user.id}"`,
          sort: "-created"
        });
        setOrders(res);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  if (loading) return <div className="p-24 flex justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>;

  if (!user) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
        <Receipt className="size-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground mb-4">Sign in to see your order history.</p>
      <Button asChild><Link to="/auth">Sign in</Link></Button>
    </div>
  );

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    const orderDate = new Date(o.created).getTime();
    if (startDate && orderDate < new Date(startDate).getTime()) return false;
    if (endDate && orderDate > new Date(endDate).getTime() + 86400000) return false;
    return true;
  });

  const isFiltered = statusFilter !== "all" || startDate || endDate;

  return (
    <>
      <Helmet><title>Orders | Digisell Books</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-comic text-4xl tracking-wide mb-6">Your orders</h1>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "paid", "pending", "failed"].map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s as any)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Input type="date" className="h-9" value={startDate} onChange={e=>setStartDate(e.target.value)} />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="date" className="h-9" value={endDate} onChange={e=>setEndDate(e.target.value)} />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg bg-card py-20 text-center text-muted-foreground">
            {isFiltered ? "No orders match these filters." : "You haven't placed any orders yet."}
          </div>
        ) : (
          <div className="border-[3px] border-border  bg-card comic-shadow">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground font-medium border-b-[3px] border-border">
                <tr>
                  <th className="px-4 py-3 font-normal">Order</th>
                  <th className="px-4 py-3 font-normal">Date</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/order/${o.id}`} className="font-mono text-primary hover:underline">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{new Date(o.created).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={o.status === "paid" ? "default" : "secondary"}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">{formatINR(o.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const orderData = await pb.collection("orders").getOne(id!);
        const itemsData = await pb.collection("order_items").getFullList({ filter: `order="${id}"` });
        setOrder(orderData);
        setItems(itemsData);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, user]);

  if (loading) return <div className="p-24 flex justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>;

  if (error || !order) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="font-comic text-3xl tracking-wide mb-2">Order not found</h1>
      <p className="text-muted-foreground mb-6">We couldn't find order <span className="font-mono">{id}</span>.</p>
      <Button asChild><Link to="/orders">Back to orders</Link></Button>
    </div>
  );

  return (
    <>
      <Helmet><title>Order {order.id} | Digisell Books</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
          &larr; Back to all orders
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b-[3px] border-border pb-6 mb-6">
          <div>
            <h1 className="font-comic text-4xl tracking-wide mb-1">Order {order.id}</h1>
            <p className="text-muted-foreground">Placed on {new Date(order.created).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant={order.status === "paid" ? "default" : "secondary"} className="text-sm">
              {order.status}
            </Badge>
            <Button variant="outline" size="sm" disabled>
              <Download className="size-4 mr-2" /> Invoice (Coming Soon)
            </Button>
          </div>
        </div>

        <div className="border-[3px] border-border  bg-card comic-shadow mb-8">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground border-b-[3px] border-border">
              <tr>
                <th className="px-4 py-3 font-normal">Item</th>
                <th className="px-4 py-3 font-normal text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{item.book_name}</div>
                    <div className="text-muted-foreground text-xs">{item.author}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{formatINR(item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-[3px] border-border bg-secondary/20">
              <tr>
                <td className="px-4 py-3 text-right font-medium text-muted-foreground">Total</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-primary">{formatINR(order.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 p-6 border-[3px] border-border  bg-card comic-shadow comic-shadow/50 text-sm">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Payment Details</h3>
            <div className="space-y-1 text-muted-foreground">
              <p>Method: <span className="capitalize text-foreground">{order.payment_method}</span></p>
              {order.payment_reference_id && <p>Reference: <span className="font-mono text-foreground">{order.payment_reference_id}</span></p>}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Customer Details</h3>
            <div className="space-y-1 text-muted-foreground">
              <p>{order.customer_name}</p>
              <p>{order.customer_email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
