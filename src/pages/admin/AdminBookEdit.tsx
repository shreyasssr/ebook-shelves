import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,100);

// BACKEND REMOVED: this form used to load languages/categories, load an
// existing book by id, upload files to Supabase Storage, and insert/update
// the `books` table. No backend is connected — the form still renders and
// is fully editable in local state, but "Upload" and "Save book" are inert.
export default function AdminBookEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const [book, setBook] = useState<any>({
    name: "", slug: "", author: "", description: "", long_description: "",
    price: 99, discount_price: null, language_id: "", category_id: null,
    thumbnail_url: "", file_url: "", is_published: false,
    isbn: "", publisher: "", published_year: null, page_count: null, edition: "",
  });
  const langs: any[] = [];
  const cats: any[] = [];
  const [busy, setBusy] = useState(false);

  const upload = async (file: File, bucket: "ebooks"|"book-assets") => {
    toast.error("File upload is unavailable — no backend is connected.");
    return null;
  };

  const save = async () => {
    setBusy(false);
    toast.error("Saving is unavailable — no backend is connected.");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isNew ? "New book" : "Edit book"}</h1>
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        <div><Label>Title *</Label><Input value={book.name||""} onChange={(e)=>setBook({...book, name:e.target.value, slug: book.slug || slugify(e.target.value)})}/></div>
        <div><Label>Slug</Label><Input value={book.slug||""} onChange={(e)=>setBook({...book, slug:e.target.value})}/></div>
        <div><Label>Author *</Label><Input value={book.author||""} onChange={(e)=>setBook({...book, author:e.target.value})}/></div>
        <div><Label>ISBN</Label><Input value={book.isbn||""} onChange={(e)=>setBook({...book, isbn:e.target.value})}/></div>
        <div><Label>Language *</Label>
          <Select value={book.language_id||""} onValueChange={(v)=>setBook({...book, language_id:v})}>
            <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
            <SelectContent>{langs.map((l)=><SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Category</Label>
          <Select value={book.category_id||""} onValueChange={(v)=>setBook({...book, category_id:v||null})}>
            <SelectTrigger><SelectValue placeholder="None"/></SelectTrigger>
            <SelectContent>{cats.map((c)=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Price (₹) *</Label><Input type="number" value={book.price||""} onChange={(e)=>setBook({...book, price:Number(e.target.value)})}/></div>
        <div><Label>Discount price (₹)</Label><Input type="number" value={book.discount_price||""} onChange={(e)=>setBook({...book, discount_price: e.target.value?Number(e.target.value):null})}/></div>
        <div><Label>Publisher</Label><Input value={book.publisher||""} onChange={(e)=>setBook({...book, publisher:e.target.value})}/></div>
        <div><Label>Published year</Label><Input type="number" value={book.published_year||""} onChange={(e)=>setBook({...book, published_year: e.target.value?Number(e.target.value):null})}/></div>
        <div><Label>Page count</Label><Input type="number" value={book.page_count||""} onChange={(e)=>setBook({...book, page_count: e.target.value?Number(e.target.value):null})}/></div>
        <div><Label>Edition</Label><Input value={book.edition||""} onChange={(e)=>setBook({...book, edition:e.target.value})}/></div>

        <div className="md:col-span-2"><Label>Short description *</Label><Textarea rows={2} value={book.description||""} onChange={(e)=>setBook({...book, description:e.target.value})}/></div>
        <div className="md:col-span-2"><Label>Long description</Label><Textarea rows={6} value={book.long_description||""} onChange={(e)=>setBook({...book, long_description:e.target.value})}/></div>

        <div className="md:col-span-2 border border-border rounded p-4">
          <Label>Thumbnail (public)</Label>
          <div className="flex gap-3 items-center mt-2">
            <Input type="file" accept="image/*" onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f) return; const url=await upload(f,"book-assets"); if(url) setBook({...book, thumbnail_url:url}); }}/>
            {book.thumbnail_url && <img src={book.thumbnail_url} className="w-12 h-16 object-cover rounded"/>}
          </div>
          <Input className="mt-2" placeholder="Or paste URL" value={book.thumbnail_url||""} onChange={(e)=>setBook({...book, thumbnail_url:e.target.value})}/>
        </div>
        <div className="md:col-span-2 border border-border rounded p-4">
          <Label>PDF file (private)</Label>
          <div className="flex gap-3 items-center mt-2">
            <Input type="file" accept="application/pdf" onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f) return; const path=await upload(f,"ebooks"); if(path){ setBook({...book, file_url:path}); toast.success("PDF uploaded"); } }}/>
            {book.file_url && <span className="text-xs text-muted-foreground truncate">{book.file_url}</span>}
          </div>
          <Input className="mt-2" placeholder="Or storage path (e.g. ebooks/my.pdf)" value={book.file_url||""} onChange={(e)=>setBook({...book, file_url:e.target.value})}/>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <Switch checked={book.is_published} onCheckedChange={(v)=>setBook({...book, is_published:v})}/>
          <Label>Published</Label>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button onClick={save} disabled={busy}>{busy?"Saving...":"Save book"}</Button>
          <Button variant="outline" onClick={()=>nav("/admin/books")}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
