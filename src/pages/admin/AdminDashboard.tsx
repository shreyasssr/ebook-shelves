import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ books: 0, orders: 0, revenue: 0, users: 0 });
  useEffect(() => {
    (async () => {
      const [b, o, u, r] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status","completed"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount").eq("status","completed"),
      ]);
      const revenue = (r.data ?? []).reduce((s:number,x:any)=>s+Number(x.total_amount),0);
      setStats({ books: b.count ?? 0, orders: o.count ?? 0, users: u.count ?? 0, revenue });
    })();
  }, []);
  const cards = [
    { label: "Total books", value: stats.books },
    { label: "Completed orders", value: stats.orders },
    { label: "Revenue", value: formatINR(stats.revenue) },
    { label: "Customers", value: stats.users },
  ];
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c)=>(
          <div key={c.label} className="border border-border rounded-lg p-4 bg-card">
            <div className="text-xs text-muted-foreground uppercase">{c.label}</div>
            <div className="text-2xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}
