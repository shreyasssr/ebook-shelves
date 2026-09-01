import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,100);

export default function AdminBookEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const [book, setBook] = useState<any>({
    name: "", slug: "", author: "", description: "", long_description: "",
    price: 99, discount_price: null, language: "", category: null,
    is_published: false,
    isbn: "", publisher: "", published_year: null, page_count: null, edition: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  
  const [langs, setLangs] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    async function init() {
      try {
        const [lRes, cRes] = await Promise.all([
          pb.collection("languages").getFullList({ sort: "display_order" }),
          pb.collection("categories").getFullList({ sort: "name" })
        ]);
        setLangs(lRes);
        setCats(cRes);
        
        if (!isNew) {
          const rec = await pb.collection("books").getOne(id!);
          setBook(rec);
        }
      } catch (err) {
        toast.error("Failed to load resources");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isNew]);

  const save = async () => {
    setBusy(true);
    try {
      const formData = new FormData();
      Object.keys(book).forEach(k => {
        if (k === 'id' || k === 'created' || k === 'updated' || k === 'collectionId' || k === 'collectionName' || k === 'thumbnail') return;
        if (book[k] !== null && book[k] !== undefined && book[k] !== '') {
          formData.append(k, book[k]);
        }
      });

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      let bookId = id;
      if (isNew) {
        const res = await pb.collection("books").create(formData);
        bookId = res.id;
        toast.success("Book created");
      } else {
        await pb.collection("books").update(id!, formData);
        toast.success("Book updated");
      }

      if (ebookFile && bookId) {
        const bfData = new FormData();
        bfData.append("book", bookId);
        bfData.append("ebook_file", ebookFile);
        
        // Find existing book_file if editing
        let existingBf = null;
        if (!isNew) {
           const bfs = await pb.collection("book_files").getFullList({ filter: `book="${bookId}"` });
           if (bfs.length > 0) existingBf = bfs[0];
        }

        if (existingBf) {
           await pb.collection("book_files").update(existingBf.id, bfData);
        } else {
           await pb.collection("book_files").create(bfData);
        }
      }

      nav("/admin/books");
    } catch (err: any) {
      toast.error(err.message || "Failed to save book");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isNew ? "New book" : "Edit book"}</h1>
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        <div><Label>Title *</Label><Input value={book.name||""} onChange={(e)=>setBook({...book, name:e.target.value, slug: book.slug || slugify(e.target.value)})}/></div>
        <div><Label>Slug</Label><Input value={book.slug||""} onChange={(e)=>setBook({...book, slug:e.target.value})}/></div>
        <div><Label>Author *</Label><Input value={book.author||""} onChange={(e)=>setBook({...book, author:e.target.value})}/></div>
        <div><Label>ISBN</Label><Input value={book.isbn||""} onChange={(e)=>setBook({...book, isbn:e.target.value})}/></div>
        <div><Label>Language *</Label>
          <Select value={book.language||""} onValueChange={(v)=>setBook({...book, language:v})}>
            <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
            <SelectContent>{langs.map((l)=><SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Category</Label>
          <Select value={book.category||""} onValueChange={(v)=>setBook({...book, category:v||null})}>
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
            <Input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) setThumbnailFile(f); }}/>
            {book.thumbnail && !thumbnailFile && <img src={pb.files.getUrl(book, book.thumbnail)} className="w-12 h-16 object-cover rounded"/>}
            {thumbnailFile && <span className="text-xs text-muted-foreground truncate">{thumbnailFile.name} (pending upload)</span>}
          </div>
        </div>
        <div className="md:col-span-2 border border-border rounded p-4">
          <Label>PDF file (private)</Label>
          <div className="flex gap-3 items-center mt-2">
            <Input type="file" accept="application/pdf" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) setEbookFile(f); }}/>
            {ebookFile && <span className="text-xs text-muted-foreground truncate">{ebookFile.name} (pending upload)</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Note: Existing PDF file path is hidden for security. Uploading a new one replaces the old one.</p>
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
