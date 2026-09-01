import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toCsv, downloadCsv } from "@/lib/csvExport";
import { Download } from "lucide-react";
import { formatINR } from "@/lib/format";
import { pb } from "@/lib/pocketbase";

export default function AdminReports() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [reportData, setReportData] = useState<{ date: string; orders: number; revenue: number; books_sold: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadReport() {
      if (!startDate || !endDate) return;
      setLoading(true);
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // A full application might use a custom endpoint or view for this.
        // For now we'll fetch orders in range and group in memory.
        const orders = await pb.collection("orders").getFullList({
          filter: `created >= "${start.toISOString().replace('T',' ')}" && created <= "${end.toISOString().replace('T',' ')}" && status="paid"`,
          expand: "order_items_via_order"
        });

        const groups: Record<string, { orders: number; revenue: number; books_sold: number }> = {};
        orders.forEach(o => {
          const date = o.created.split(" ")[0]; // Assuming format 'YYYY-MM-DD HH:MM:SS.sssZ'
          if (!groups[date]) groups[date] = { orders: 0, revenue: 0, books_sold: 0 };
          groups[date].orders += 1;
          groups[date].revenue += o.total_amount || 0;
          
          // Count books
          const items = o.expand?.order_items_via_order || [];
          groups[date].books_sold += items.length; // assuming 1 per item row
        });

        const sortedDates = Object.keys(groups).sort((a,b) => b.localeCompare(a));
        setReportData(sortedDates.map(date => ({
          date,
          orders: groups[date].orders,
          revenue: groups[date].revenue,
          books_sold: groups[date].books_sold
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [startDate, endDate]);

  const handleExport = () => {
    const headers = ["Date", "Orders", "Revenue", "Books sold"];
    const rows = reportData.map(row => [
      row.date,
      row.orders,
      row.revenue,
      row.books_sold
    ]);
    const csvContent = toCsv(headers, rows);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsv(`reports-breakdown-${dateStr}.csv`, csvContent);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6 p-4 border border-border bg-card rounded-lg">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Orders</th>
              <th className="p-3 font-medium">Revenue</th>
              <th className="p-3 font-medium">Books sold</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No data for this range.
                </td>
              </tr>
            ) : (
              reportData.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-3">{row.date}</td>
                  <td className="p-3">{row.orders}</td>
                  <td className="p-3">{formatINR(row.revenue)}</td>
                  <td className="p-3">{row.books_sold}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
