import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Download, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { toast } from "sonner";

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

// BACKEND REMOVED: this page used to fetch the signed-in user's
// digital_downloads (joined with books/orders) from Supabase, and the
// "Download PDF" button called the `generate-download-url` edge function
// to mint a signed URL. No backend is connected — since useAuth() always
// reports signed-out, this always falls through to the existing
// "please sign in" state below.
export default function Dashboard() {
  const { user, loading } = useAuth();
  const items: DLItem[] = [];

  const download = async (item: DLItem) => {
    toast.error("Download is unavailable — no backend is connected.");
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">Please <Link to="/auth" className="text-primary">sign in</Link>.</div>;

  return (
    <>
      <Helmet><title>My Library | Digisell Books</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display text-3xl font-semibold">My Library</h1>
          <Button asChild variant="outline"><Link to="/orders">Order history</Link></Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <BookOpen className="size-6 text-muted-foreground"/>
            </div>
            <p className="text-muted-foreground">No purchases yet.</p>
            <Button asChild className="mt-4"><Link to="/books">Browse books</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((it) => {
              const expired = new Date(it.expires_at) < new Date();
              const exhausted = it.download_count >= it.max_downloads;
              const canDownload = it.is_active && !expired && !exhausted && it.order?.status === "paid";
              return (
                <div key={it.id} className="flex gap-4 p-4 border border-border rounded-lg bg-card">
                  <div className="w-16 h-24 rounded overflow-hidden shrink-0">
                    <ImagePlaceholder src={it.book?.thumbnail_url ?? undefined} alt={it.book?.name} label="Cover" size="128×192" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-medium line-clamp-1">{it.book?.name ?? "Book"}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{it.book?.author}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
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
