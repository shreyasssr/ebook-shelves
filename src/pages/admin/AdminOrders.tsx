import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

// BACKEND REMOVED: this table used to list orders from Supabase, and
// "Mark paid" called an update against the `orders` table. No backend is
// connected — the list is always empty and status updates are inert.
export default function AdminOrders() {
  const orders: any[] = [];

  const updateStatus = async (id: string, status: string) => {
    toast.error("Updating orders is unavailable — no backend is connected.");
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left"><tr>
            <th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Method</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Action</th>
          </tr></thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No orders.</td></tr>
            ) : orders.map((o)=>(
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">#{o.id.slice(0,8)}<br/><span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span></td>
                <td className="p-3">{o.customer_name}<br/><span className="text-xs text-muted-foreground">{o.customer_email}</span></td>
                <td className="p-3 capitalize">{o.payment_method}</td>
                <td className="p-3 font-bold">{formatINR(o.total_amount)}</td>
                <td className="p-3"><Badge variant={o.status==="paid"?"default":"secondary"}>{o.status}</Badge></td>
                <td className="p-3">
                  {o.status !== "paid" && <Button size="sm" onClick={()=>updateStatus(o.id, "paid")}>Mark paid</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
