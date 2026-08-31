import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toCsv, downloadCsv } from "@/lib/csvExport";

// BACKEND REMOVED: these stats used to be aggregated from Supabase
// (books/orders/profiles counts + revenue sum). No backend is connected,
// so every card shows a zero/empty value rather than fake numbers.
export default function AdminDashboard() {
  const stats = { books: 0, orders: 0, revenue: 0, users: 0 };
  const cards = [
    { label: "Total books", value: stats.books },
    { label: "Completed orders", value: stats.orders },
    { label: "Revenue", value: formatINR(stats.revenue) },
    { label: "Customers", value: stats.users },
  ];

  const handleExport = () => {
    const headers = ["Total Books", "Completed Orders", "Revenue", "Customers", "Generated At"];
    const rows = [[
      stats.books,
      stats.orders,
      stats.revenue,
      stats.users,
      new Date().toISOString()
    ]];
    const csvStr = toCsv(headers, rows);
    const dateStr = new Date().toISOString().split("T")[0];
    downloadCsv(`dashboard-summary-${dateStr}.csv`, csvStr);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
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
