import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const load = () => supabase.from("orders").select("*").order("created_at",{ascending:false}).limit(100).then(({data})=>setOrders(data ?? []));
  useEffect(()=>{ load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === "completed") patch.access_granted_at = new Date().toISOString();
    await supabase.from("orders").update(patch).eq("id", id);
    toast.success("Updated");
    load();
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
            {orders.map((o)=>(
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">#{o.id.slice(0,8)}<br/><span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</span></td>
                <td className="p-3">{o.customer_name}<br/><span className="text-xs text-muted-foreground">{o.customer_email}</span></td>
                <td className="p-3 capitalize">{o.payment_method}</td>
                <td className="p-3 font-bold">{formatINR(o.total_amount)}</td>
                <td className="p-3"><Badge variant={o.status==="completed"?"default":"secondary"}>{o.status}</Badge></td>
                <td className="p-3">
                  {o.status !== "completed" && <Button size="sm" onClick={()=>updateStatus(o.id, "completed")}>Mark completed</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
