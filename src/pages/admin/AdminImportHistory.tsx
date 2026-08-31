import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv } from "@/lib/csvExport";

// BACKEND REMOVED: 
// Real implementation should persist a job record (filename, timestamp, row counts, 
// and the structured FailedRow[] as JSON) each time AdminImport.tsx's importFile runs.
// This page should list those records most-recent-first.

export default function AdminImportHistory() {
  // Empty array as per prompt (stub data since no backend)
  const history: any[] = [];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Import History</h1>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
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
                  <td className="p-3">{job.date}</td>
                  <td className="p-3">{job.filename}</td>
                  <td className="p-3">{job.totalRows}</td>
                  <td className="p-3 text-green-600">{job.succeeded}</td>
                  <td className="p-3 text-destructive">{job.failed}</td>
                  <td className="p-3 text-right">
                    {job.failed > 0 && (
                      <Button variant="link" size="sm" onClick={() => {}}>
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
