import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { toCsv, downloadCsv } from "@/lib/csvExport";
import { pb } from "@/lib/pocketbase";

type FailedRow = {
  rowNumber: number;
  data: Record<string, string>;
  reason: string;
};

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

export default function AdminImport() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0, ok: 0, err: 0, errors: [] as FailedRow[] });

  const downloadTemplate = () => {
    const headers = "name,author,slug,description,long_description,price,discount_price,language_code,category_slug,isbn,publisher,published_year,page_count,is_published";
    const sample = `Sample Book,John Doe,sample-book,A short description,A long description here,199,149,en,fiction,978-XYZ,Some Press,2024,250,true`;
    const blob = new Blob([headers + "\n" + sample], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "books-template.csv"; a.click();
  };

  const importFile = async (file: File) => {
    if (!user) return;
    setBusy(true);
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) { toast.error("Empty CSV"); setBusy(false); return; }
    
    const fileHeaders = Object.keys(rows[0]);
    setHeaders(fileHeaders);

    setProgress({ done: 0, total: rows.length, ok: 0, err: 0, errors: [] });
    
    // Pre-fetch taxonomies
    const [langs, cats] = await Promise.all([
      pb.collection("languages").getFullList(),
      pb.collection("categories").getFullList()
    ]);
    
    let ok = 0;
    let err = 0;
    const errors: FailedRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const lang = langs.find(l => l.code === row.language_code);
        const cat = cats.find(c => c.slug === row.category_slug);
        
        if (!lang) throw new Error(`Unknown language_code: ${row.language_code}`);
        
        const data = {
          name: row.name,
          slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
          author: row.author,
          description: row.description,
          long_description: row.long_description,
          price: Number(row.price),
          discount_price: row.discount_price ? Number(row.discount_price) : null,
          language: lang.id,
          category: cat ? cat.id : null,
          isbn: row.isbn,
          publisher: row.publisher,
          published_year: row.published_year ? Number(row.published_year) : null,
          page_count: row.page_count ? Number(row.page_count) : null,
          is_published: row.is_published === 'true'
        };

        // If slug exists, update, else create. But for simple import, we just try to find by slug
        let existing;
        try { existing = await pb.collection("books").getFirstListItem(`slug="${data.slug}"`); } catch (_) {}
        
        if (existing) {
          await pb.collection("books").update(existing.id, data);
        } else {
          await pb.collection("books").create(data);
        }
        ok++;
      } catch (e: any) {
        err++;
        errors.push({ rowNumber: i + 1, data: row, reason: e.message || "Failed" });
      }
      setProgress(p => ({ ...p, done: i + 1, ok, err, errors }));
    }

    try {
      await pb.collection("bulk_import_jobs").create({
        filename: file.name,
        total_rows: rows.length,
        success_rows: ok,
        error_rows: err,
        error_log: errors
      });
    } catch(e) {
      console.error("Failed to save job record", e);
    }

    setBusy(false);
    toast.success("Import complete.");
  };

  const downloadFailedRows = () => {
    if (!progress.errors.length) return;
    
    const exportHeaders = [...headers, "error_reason"];
    const exportRows = progress.errors.map(err => {
      const rowValues = headers.map(h => err.data[h] ?? "");
      return [...rowValues, err.reason];
    });

    const csvContent = toCsv(exportHeaders, exportRows);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsv(`import-errors-${dateStr}.csv`, csvContent);
  };

  return (
    <>
      <h1 className="text-2xl font-display font-semibold mb-2">Bulk import books</h1>
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
          <div className="text-sm flex gap-6 items-center">
            <span>Processed: {progress.done}/{progress.total}</span>
            <span className="text-green-600">Success: {progress.ok}</span>
            <span className="text-destructive">Errors: {progress.err}</span>
            {progress.errors.length > 0 && (
              <Button size="sm" variant="secondary" onClick={downloadFailedRows} className="ml-auto">
                Download failed rows
              </Button>
            )}
          </div>
          {progress.errors.length > 0 && (
            <details className="glass-panel rounded-xl p-3 bg-white/5">
              <summary className="cursor-pointer text-sm font-medium">
                View errors ({progress.errors.length})
              </summary>
              <ul className="text-xs mt-4 space-y-1 max-h-60 overflow-auto">
                {progress.errors.map((e,i)=> (
                  <li key={i} className="text-destructive">
                    Row {e.rowNumber} ({e.data.name || "unknown"}): {e.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </>
  );
}
