import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    try {
      const res = await pb.collection("orders").getFullList({ sort: "-created" });
      setOrders(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await pb.collection("orders").update(id, { 
        status,
        access_granted_at: status === "paid" ? new Date().toISOString() : null 
      });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status");
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {loading ? <div className="p-8 text-center text-muted-foreground">Loading...</div> : (
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
                <td className="p-3 font-mono text-xs">#{o.id.slice(0,8)}<br/><span className="text-muted-foreground">{new Date(o.created).toLocaleDateString()}</span></td>
                <td className="p-3">{o.customer_name}<br/><span className="text-xs text-muted-foreground">{o.customer_email}</span></td>
                <td className="p-3 capitalize">{o.payment_method}</td>
                <td className="p-3 font-mono">{formatINR(o.total_amount)}</td>
                <td className="p-3"><Badge variant={o.status === "paid" ? "default" : "secondary"}>{o.status}</Badge></td>
                <td className="p-3">
                  {o.status !== "paid" && (
                    <Button variant="outline" size="sm" onClick={() => updateStatus(o.id, "paid")}>
                      Mark paid
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </>
  );
}
