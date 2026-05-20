import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Download, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

type DLItem = {
  id: string;
  book_id: string;
  order_id: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  is_active: boolean;
  book: { name: string; author: string; slug: string; thumbnail_url: string | null } | null;
  order: { created_at: string; total_amount: number; status: string } | null;
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<DLItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setFetching(true);
      const { data: dls } = await supabase
        .from("digital_downloads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!dls?.length) { setItems([]); setFetching(false); return; }

      const bookIds = [...new Set(dls.map((d: any) => d.book_id))];
      const orderIds = [...new Set(dls.map((d: any) => d.order_id))];

      const [{ data: books }, { data: orders }] = await Promise.all([
        supabase.from("books").select("id,name,author,slug,thumbnail_url").in("id", bookIds),
        supabase.from("orders").select("id,created_at,total_amount,status").in("id", orderIds),
      ]);

      setItems(dls.map((d: any) => ({
        ...d,
        book: books?.find((b: any) => b.id === d.book_id) ?? null,
        order: orders?.find((o: any) => o.id === d.order_id) ?? null,
      })));
      setFetching(false);
    })();
  }, [user]);

  const download = async (item: DLItem) => {
    const t = toast.loading("Preparing download...");
    try {
      const { data, error } = await supabase.functions.invoke("generate-download-url", {
        body: { download_id: item.id },
      });
      if (error || !data?.url) throw new Error(error?.message ?? data?.error ?? "Failed");
      toast.dismiss(t);
      window.open(data.url, "_blank");
      // refresh count
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, download_count: i.download_count + 1 } : i));
    } catch (e: any) {
      toast.dismiss(t);
      toast.error(e.message);
    }
  };

  if (loading || fetching) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please <Link to="/auth" className="text-primary">sign in</Link>.</div>;

  return (
    <>
      <Helmet><title>My Library | Digisell Books</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Library</h1>
          <Button asChild variant="outline"><Link to="/orders">Order history</Link></Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <BookOpen className="size-12 mx-auto text-muted-foreground"/>
            <p className="mt-4 text-muted-foreground">No purchases yet.</p>
            <Button asChild className="mt-4"><Link to="/books">Browse books</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((it) => {
              const expired = new Date(it.expires_at) < new Date();
              const exhausted = it.download_count >= it.max_downloads;
              const canDownload = it.is_active && !expired && !exhausted && it.order?.status === "completed";
              return (
                <div key={it.id} className="flex gap-4 p-4 border border-border rounded-lg bg-card">
                  <div className="w-16 h-24 bg-muted rounded overflow-hidden shrink-0">
                    {it.book?.thumbnail_url && <img src={it.book.thumbnail_url} alt={it.book?.name} className="w-full h-full object-cover"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-1">{it.book?.name ?? "Book"}</h3>
                    <p className="text-sm text-muted-foreground">{it.book?.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Downloads: {it.download_count}/{it.max_downloads} · Expires {new Date(it.expires_at).toLocaleDateString()}
                    </p>
                    <Button size="sm" className="mt-2" disabled={!canDownload} onClick={()=>download(it)}>
                      <Download className="size-4 mr-1"/>
                      {expired ? "Expired" : exhausted ? "Limit reached" : "Download PDF"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
