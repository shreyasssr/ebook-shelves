import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toCsv, downloadCsv } from "@/lib/csvExport";
import { Download } from "lucide-react";
import { formatINR } from "@/lib/format";

// BACKEND REMOVED: 
// Real implementation should query orders grouped by day within the selected date range.
// Specifically: sums of total_amount and count of order_items for each date.

export default function AdminReports() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Empty array as per prompt (stub data since no backend)
  const reportData: { date: string; orders: number; revenue: number; books_sold: number }[] = [];

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
