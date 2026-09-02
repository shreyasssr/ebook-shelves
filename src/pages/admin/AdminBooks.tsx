import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { formatINR } from "@/lib/format";
import { pb } from "@/lib/pocketbase";

export default function AdminBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await pb.collection("books").getList(1, 50, {
        filter: q ? `name ~ "${q}"` : "",
        sort: "-created",
        expand: "language,category"
      });
      setBooks(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-semibold">Books</h1>
        <Button asChild><Link to="/admin/books/new"><Plus className="size-4 mr-1"/> Add book</Link></Button>
      </div>
      <div className="flex gap-2 mb-4">
        <Input placeholder="Search by title..." value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&load()}/>
        <Button variant="outline" onClick={load}>Search</Button>
      </div>
      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5"><tr>
            <th className="p-3">Title</th><th className="p-3">Author</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3">Sales</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading...</td></tr> :
              books.map((b)=>(
                <tr key={b.id} className="border-t border-border">
                  <td className="p-3 font-medium">{b.name}</td>
                  <td className="p-3 text-muted-foreground">{b.author}</td>
                  <td className="p-3">{formatINR(b.price)}</td>
                  <td className="p-3"><Badge variant={b.is_published?"default":"secondary"}>{b.is_published?"Published":"Draft"}</Badge></td>
                  <td className="p-3">{b.sales_count}</td>
                  <td className="p-3 text-right">
                    <Button asChild size="sm" variant="ghost"><Link to={`/admin/books/${b.id}`}><Edit className="size-4"/></Link></Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
