import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import BookCard, { BookCardData } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 24;

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const lang = params.get("lang") || "";
  const category = params.get("category") || "";
  const q = params.get("q") || "";
  const sort = params.get("sort") || "popular";
  const page = parseInt(params.get("page") || "1", 10);

  const [books, setBooks] = useState<BookCardData[]>([]);
  const [count, setCount] = useState(0);
  const [langs, setLangs] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("languages").select("*").eq("is_active", true).order("display_order").then(({ data }) => setLangs(data ?? []));
    supabase.from("categories").select("*").order("name").then(({ data }) => setCats(data ?? []));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase
        .from("books")
        .select("id,slug,name,author,price,discount_price,thumbnail_url,language_id,category_id", { count: "exact" })
        .eq("is_published", true);

      if (lang) {
        const langRow = langs.find((l) => l.code === lang);
        if (langRow) query = query.eq("language_id", langRow.id);
      }
      if (category) {
        const catRow = cats.find((c) => c.slug === category);
        if (catRow) query = query.eq("category_id", catRow.id);
      }
      if (q) {
        query = query.textSearch("search_vector", q.split(" ").filter(Boolean).map((w) => w + ":*").join(" & "), { config: "simple" });
      }

      if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "price-asc") query = query.order("price", { ascending: true });
      else if (sort === "price-desc") query = query.order("price", { ascending: false });
      else query = query.order("sales_count", { ascending: false });

      const from = (page - 1) * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, count } = await query;
      setBooks((data as any[]) ?? []);
      setCount(count ?? 0);
      setLoading(false);
    })();
  }, [lang, category, q, sort, page, langs, cats]);

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    if (k !== "page") next.delete("page");
    setParams(next);
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const langName = langs.find((l) => l.code === lang)?.name;
  const catName = cats.find((c) => c.slug === category)?.name;
  const title = q ? `“${q}”` : langName || catName || "All books";

  return (
    <>
      <Helmet>
        <title>{title} | Digisell Books</title>
        <meta name="description" content={`Browse ${count} PDF ebooks${langName ? " in " + langName : ""}${catName ? " — " + catName : ""}.`} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 shrink-0 space-y-6 text-sm">
            <div>
              <div className="font-semibold mb-2">Language</div>
              <ul className="space-y-1">
                <li><button onClick={()=>update("lang","")} className={!lang?"text-primary font-medium":""}>All languages</button></li>
                {langs.map((l) => (
                  <li key={l.id}>
                    <button onClick={()=>update("lang", l.code)} className={lang===l.code?"text-primary font-medium":"text-muted-foreground hover:text-foreground"}>
                      {l.name} <span className="text-xs">({l.book_count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2">Category</div>
              <ul className="space-y-1">
                <li><button onClick={()=>update("category","")} className={!category?"text-primary font-medium":""}>All categories</button></li>
                {cats.map((c) => (
                  <li key={c.id}>
                    <button onClick={()=>update("category", c.slug)} className={category===c.slug?"text-primary font-medium":"text-muted-foreground hover:text-foreground"}>
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{title} <span className="text-muted-foreground text-sm font-normal">({count})</span></h1>
              <Select value={sort} onValueChange={(v)=>update("sort", v==="popular"?"":v)}>
                <SelectTrigger className="w-40"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({length:8}).map((_,i)=>(
                  <div key={i} className="aspect-[2/3] bg-muted rounded animate-pulse"/>
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No books found. Try a different filter.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {books.map((b) => <BookCard key={b.id} book={b} />)}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>update("page", String(page-1))}>Prev</Button>
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={()=>update("page", String(page+1))}>Next</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
