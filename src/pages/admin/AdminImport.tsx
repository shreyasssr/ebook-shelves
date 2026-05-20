import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

  const importFile = async (file: File) => {
    if (!user) return;
    setBusy(true);
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) { toast.error("Empty CSV"); setBusy(false); return; }

    const [{ data: langs }, { data: cats }] = await Promise.all([
      supabase.from("languages").select("id,code"),
      supabase.from("categories").select("id,slug"),
    ]);
    const langMap = new Map((langs ?? []).map((l: any) => [l.code, l.id]));
    const catMap = new Map((cats ?? []).map((c: any) => [c.slug, c.id]));

    const { data: job } = await supabase.from("bulk_import_jobs").insert({
      admin_id: user.id, total_rows: rows.length, status: "processing",
    }).select().single();

    setProgress({ done: 0, total: rows.length, ok: 0, err: 0, errors: [] });
    let ok = 0, err = 0; const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const lang_id = langMap.get(r.language_code);
        if (!lang_id) throw new Error(`Unknown language_code "${r.language_code}"`);
        const cat_id = r.category_slug ? catMap.get(r.category_slug) : null;
        if (r.category_slug && !cat_id) throw new Error(`Unknown category_slug "${r.category_slug}"`);
        if (!r.name || !r.author || !r.description || !r.price || !r.file_url)
          throw new Error("Missing required field (name, author, description, price, file_url)");

        const payload = {
          name: r.name, author: r.author, slug: r.slug || slugify(r.name),
          description: r.description, long_description: r.long_description || null,
          price: Number(r.price), discount_price: r.discount_price ? Number(r.discount_price) : null,
          language_id: lang_id, category_id: cat_id || null,
          isbn: r.isbn || null, publisher: r.publisher || null,
          published_year: r.published_year ? Number(r.published_year) : null,
          page_count: r.page_count ? Number(r.page_count) : null,
          thumbnail_url: r.thumbnail_url || null, file_url: r.file_url,
          is_published: String(r.is_published).toLowerCase() === "true",
        };
        const { error: e } = await supabase.from("books").upsert(payload, { onConflict: "slug" });
        if (e) throw e;
        ok++;
      } catch (e: any) {
        err++;
        errors.push(`Row ${i+2} (${r.name}): ${e.message}`);
      }
      setProgress({ done: i+1, total: rows.length, ok, err, errors });
    }

    await supabase.from("bulk_import_jobs").update({
      status: "completed", processed_rows: rows.length,
      success_rows: ok, error_rows: err, error_log: errors,
      completed_at: new Date().toISOString(),
    }).eq("id", job!.id);

    setBusy(false);
    toast.success(`Imported ${ok} books (${err} errors)`);
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
