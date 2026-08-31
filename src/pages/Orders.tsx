import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Receipt, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR } from "@/lib/format";

// BACKEND REMOVED: ...

export function OrdersList() {
  const { user } = useAuth();
  const orders: any[] = []; // Unfiltered
  
  const [statusFilter, setStatusFilter] = useState<"all"|"paid"|"pending"|"failed">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    const orderDate = new Date(o.created_at).getTime();
    if (startDate && orderDate < new Date(startDate).getTime()) return false;
    if (endDate && orderDate > new Date(endDate).getTime() + 86400000) return false;
    return true;
  });

  const isFiltered = statusFilter !== "all" || startDate || endDate;

  return (
    <>
      <Helmet><title>Orders | Digisell Books</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-semibold mb-6">Your orders</h1>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {["all", "paid", "pending", "failed"].map(s => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "secondary"}
                size="sm"
                onClick={() => setStatusFilter(s as any)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 w-36 text-xs font-mono" />
            <span className="text-muted-foreground">—</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 w-36 text-xs font-mono" />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No orders yet.</p>
            <Button asChild className="mt-4"><Link to="/books">Browse books</Link></Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-lg bg-card/50">
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-4 opacity-50">
              <Receipt className="size-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No orders match your current filters.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => { setStatusFilter("all"); setStartDate(""); setEndDate(""); }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((o)=>(
              <Link key={o.id} to={`/order/${o.id}`} className="block p-4 border border-border rounded-lg bg-card hover:border-primary transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground mb-1">#{o.id.slice(0,8)}</div>
                    <div className="text-sm font-medium">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={o.status==="paid"?"default":"secondary"}>{o.status}</Badge>
                    <div className="font-mono font-semibold mt-2">{formatINR(o.total_amount)}</div>
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

  // BACKEND REMOVED: 
  const order: any = null;
  const order_items: any[] = []; 

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">← All orders</Link>
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-card/50">
          <p className="text-muted-foreground font-mono">Order "{id}" not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">← All orders</Link>
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold mb-2">Order {id?.slice(0, 8)}</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <Badge variant={order.status === "paid" ? "default" : "secondary"}>{order.status}</Badge>
          <div className="text-xs text-muted-foreground">Paid via {order.payment_method || "Unknown"}</div>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Item</th>
              <th className="p-4 font-medium text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {order_items.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-8 text-center text-muted-foreground">
                  No line items found.
                </td>
              </tr>
            ) : (
              order_items.map((item, i) => (
                <tr key={i}>
                  <td className="p-4">
                    <div className="font-display font-medium mb-1">{item.book_name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{item.author}</div>
                  </td>
                  <td className="p-4 text-right font-mono">
                    {formatINR(item.unit_price)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-muted/50">
            <tr>
              <td className="p-4 font-semibold">Total</td>
              <td className="p-4 text-right font-mono font-bold text-base">
                {formatINR(order.total_amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="group relative inline-block">
          <Button disabled variant="outline">
            <Download className="size-4 mr-2" /> Download invoice
          </Button>
          <div className="absolute bottom-full right-0 mb-2 hidden w-48 rounded bg-popover p-2 text-xs text-popover-foreground shadow-md group-hover:block text-center border border-border">
            Invoices aren't available yet.
          </div>
        </div>
      </div>
    </div>
  );
}
