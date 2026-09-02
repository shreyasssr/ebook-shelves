import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv } from "@/lib/csvExport";
import { pb } from "@/lib/pocketbase";

export default function AdminImportHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await pb.collection("bulk_import_jobs").getFullList({ sort: "-created" });
        setHistory(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <>
      <h1 className="text-2xl font-display font-semibold mb-6">Import History</h1>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Filename</th>
              <th className="p-3 font-medium">Total rows</th>
              <th className="p-3 font-medium text-green-600">Succeeded</th>
              <th className="p-3 font-medium text-destructive">Failed</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No imports yet
                </td>
              </tr>
            ) : (
              history.map((job, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-3">{new Date(job.created).toLocaleDateString()}</td>
                  <td className="p-3">{job.filename}</td>
                  <td className="p-3">{job.total_rows}</td>
                  <td className="p-3 text-green-600">{job.success_rows}</td>
                  <td className="p-3 text-destructive">{job.error_rows}</td>
                  <td className="p-3 text-right">
                    {job.error_rows > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const log = job.error_log || [];
                          if (log.length === 0) return;
                          
                          const allKeys = new Set<string>();
                          log.forEach((err: any) => Object.keys(err.data).forEach(k => allKeys.add(k)));
                          const headers = [...Array.from(allKeys), "error_reason"];
                          
                          const rows = log.map((err: any) => [
                            ...Array.from(allKeys).map(k => err.data[k] ?? ""),
                            err.reason
                          ]);
                          
                          const csv = toCsv(headers, rows);
                          downloadCsv(`failed-rows-${job.filename}.csv`, csv);
                        }}
                      >
                        Download failed rows
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
