import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Download, BookOpen, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DLItem = {
  id: string;
  book_id: string;
  order_id: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  is_active: boolean;
  book: { name: string; author: string; slug: string; thumbnail_url: string | null } | null;
  order: { created: string; total_amount: number; status: string } | null;
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "az" | "expiring">("recent");

  const [items, setItems] = useState<DLItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    async function loadDownloads() {
      if (!user) return;
      try {
        const records = await pb.collection("digital_downloads").getFullList({
          filter: `user="${user.id}"`,
          expand: "book,order"
        });
        
        const formatted = records.map(r => ({
          id: r.id,
          book_id: r.book,
          order_id: r.order,
          download_count: r.download_count,
          max_downloads: r.max_downloads,
          expires_at: r.expires_at,
          is_active: r.is_active,
          book: r.expand?.book ? { 
            name: r.expand.book.name, 
            author: r.expand.book.author, 
            slug: r.expand.book.slug, 
            thumbnail_url: r.expand.book.thumbnail ? pb.files.getUrl(r.expand.book, r.expand.book.thumbnail) : null
          } : null,
          order: r.expand?.order ? { 
            created: r.expand.order.created, 
            total_amount: r.expand.order.total_amount, 
            status: r.expand.order.status 
          } : null
        }));
        
        setItems(formatted);
      } catch (err) {
        console.error("Failed to load downloads", err);
      } finally {
        setLoadingItems(false);
      }
    }
    loadDownloads();
  }, [user]);

  const download = async (item: DLItem) => {
    try {
      const res = await pb.send("/api/generate-download-url", {
        method: "POST",
        body: { download_id: item.id }
      });
      // Increment locally to reflect UI state
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, download_count: i.download_count + 1 } : i));
      window.open(res.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate download link");
    }
  };

  if (authLoading || loadingItems) return <div className="p-24 flex justify-center"><Loader2 className="animate-spin text-primary size-8" /></div>;
  if (!user) return <div className="p-8">Please <Link to="/auth" className="text-primary">sign in</Link>.</div>;

  // Filter client-side
  const filtered = items.filter(it => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (it.book?.name || "").toLowerCase();
    const author = (it.book?.author || "").toLowerCase();
    return name.includes(q) || author.includes(q);
  });

  // Sort client-side
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "az") {
      const nameA = a.book?.name || "";
      const nameB = b.book?.name || "";
      return nameA.localeCompare(nameB);
    } else if (sortBy === "expiring") {
      // Only items that are active and not expired matter here, but sort all by expires_at asc
      return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
    } else {
      // default: recent
      const dateA = new Date(a.order?.created || 0).getTime();
      const dateB = new Date(b.order?.created || 0).getTime();
      return dateB - dateA; // descending
    }
  });

  // Split into "Recent" (last 7 days) and "Older"
  const now = new Date().getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  const recentItems = sorted.filter(it => {
    const createdAt = new Date(it.order?.created || 0).getTime();
    return now - createdAt <= sevenDaysMs;
  });
  const olderItems = sorted.filter(it => {
    const createdAt = new Date(it.order?.created || 0).getTime();
    return now - createdAt > sevenDaysMs;
  });

  const showGroups = recentItems.length > 0 && olderItems.length > 0;

  const ItemCard = ({ it }: { it: DLItem }) => {
    const expired = new Date(it.expires_at) < new Date();
    const exhausted = it.download_count >= it.max_downloads;
    const canDownload = it.is_active && !expired && !exhausted && it.order?.status === "paid";
    
    return (
      <div className="flex gap-4 p-4 border border-border rounded-lg bg-card">
        <div className="w-16 h-24 rounded overflow-hidden shrink-0">
          <ImagePlaceholder src={it.book?.thumbnail_url ?? undefined} alt={it.book?.name} label="Cover" size="128×192" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-medium line-clamp-1 text-base">{it.book?.name ?? "Book"}</h3>
            <p className="text-sm text-muted-foreground font-mono">{it.book?.author}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Downloads: {it.download_count}/{it.max_downloads} · Expires {new Date(it.expires_at).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-3">
            <Button size="sm" disabled={!canDownload} onClick={()=>download(it)}>
              <Download className="size-4 mr-2"/>
              {expired ? "Expired" : exhausted ? "Limit reached" : "Download PDF"}
            </Button>
            
            {/* Inline explanation for disabled states */}
            {!canDownload && (expired || exhausted) && (
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight">
                {expired && `Access expired on ${new Date(it.expires_at).toLocaleDateString()}. Contact support if you need it again.`}
                {exhausted && `You've used all ${it.max_downloads} downloads for this book. Contact support if you need another.`}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet><title>My Library | Digisell Books</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display text-3xl font-semibold">My Library</h1>
          <Button asChild variant="outline"><Link to="/orders">Order history</Link></Button>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search your library..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently purchased</SelectItem>
                <SelectItem value="az">Title A-Z</SelectItem>
                <SelectItem value="expiring">Expiring soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <BookOpen className="size-6 text-muted-foreground"/>
            </div>
            <p className="text-muted-foreground font-medium mb-4">No purchases yet.</p>
            <Button asChild><Link to="/books">Browse books</Link></Button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-card/50">
            <p className="text-muted-foreground mb-4">No books match '{searchQuery}'.</p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>Clear search</Button>
          </div>
        ) : (
          <div>
            {showGroups ? (
              <>
                <div className="mb-8">
                  <h2 className="font-display font-medium text-lg mb-4 text-foreground/90">Recently added</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {recentItems.map(it => <ItemCard key={it.id} it={it} />)}
                  </div>
                </div>
                <div className="border-t border-dashed border-border pt-8">
                  <h2 className="font-display font-medium text-lg mb-4 text-foreground/90">Older purchases</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {olderItems.map(it => <ItemCard key={it.id} it={it} />)}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sorted.map(it => <ItemCard key={it.id} it={it} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
