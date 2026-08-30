import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const split = (l: string) => {
    const out: string[] = []; let cur = ""; let q = false;
    for (let i=0;i<l.length;i++) {
      const c = l[i];
      if (c === '"') { if (q && l[i+1]==='"') { cur+='"'; i++; } else q = !q; }
      else if (c === "," && !q) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur); return out;
  };
  const headers = split(lines[0]).map(h => h.trim());
  return lines.slice(1).map(l => { const v = split(l); const o: any = {}; headers.forEach((h, i) => o[h] = (v[i] ?? "").trim()); return o; });
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,100);

export default function AdminImport() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, ok: 0, err: 0, errors: [] as string[] });

  const downloadTemplate = () => {
    const headers = "name,author,slug,description,long_description,price,discount_price,language_code,category_slug,isbn,publisher,published_year,page_count,thumbnail_url,file_url,is_published";
    const sample = `Sample Book,John Doe,sample-book,A short description,A long description here,199,149,en,fiction,978-XYZ,Some Press,2024,250,https://example.com/cover.jpg,ebooks/sample.pdf,true`;
    const blob = new Blob([headers + "\n" + sample], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "books-template.csv"; a.click();
  };

  // BACKEND REMOVED: this used to look up language/category IDs, create a
  // bulk_import_jobs row, upsert each parsed row into `books`, and update
  // the job with results — all against Supabase. No backend is connected,
  // so the CSV is still parsed (to validate the file client-side and show
  // row counts) but nothing is written anywhere.
  const importFile = async (file: File) => {
    if (!user) return;
    setBusy(true);
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) { toast.error("Empty CSV"); setBusy(false); return; }

    setProgress({ done: 0, total: rows.length, ok: 0, err: rows.length, errors: [
      "Import is unavailable — no backend is connected. The CSV was parsed but nothing was saved.",
    ] });
    setBusy(false);
    toast.error("Import is unavailable — no backend is connected.");
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Bulk import books</h1>
      <p className="text-sm text-muted-foreground mb-6">Upload a CSV to add or update books in bulk. Use <code>language_code</code> (en/hi/mr/gu/bn/ta) and <code>category_slug</code> to reference taxonomy.</p>

      <div className="flex gap-3 mb-6">
        <Button variant="outline" onClick={downloadTemplate}>Download CSV template</Button>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <Input type="file" accept=".csv" disabled={busy} onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importFile(f); }}/>
      </div>

      {progress.total > 0 && (
        <div className="mt-6 space-y-3">
          <Progress value={(progress.done/progress.total)*100}/>
          <div className="text-sm flex gap-6">
            <span>Processed: {progress.done}/{progress.total}</span>
            <span className="text-green-600">Success: {progress.ok}</span>
            <span className="text-destructive">Errors: {progress.err}</span>
          </div>
          {progress.errors.length > 0 && (
            <details className="border border-border rounded p-3 bg-muted/50">
              <summary className="cursor-pointer text-sm font-medium">View errors ({progress.errors.length})</summary>
              <ul className="text-xs mt-2 space-y-1 max-h-60 overflow-auto">
                {progress.errors.map((e,i)=><li key={i} className="text-destructive">{e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </>
  );
}
