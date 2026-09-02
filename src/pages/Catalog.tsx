import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Filter, X } from "lucide-react";
import { pb } from "@/lib/pocketbase";
import { usePaginatedBooks, type BookFilters } from "@/lib/pagination";
import { type BookCardData }                   from "@/components/BookCard";
import BookCard                                from "@/components/BookCard";
import { Button }                              from "@/components/ui/button";
import { Input }                               from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 24;

// ─── Debounce helper ──────────────────────────────────────────────────────────
function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Catalog() {
  const [params, setParams] = useSearchParams();

  const langCode = params.get("lang")     || "";
  const catSlug  = params.get("category") || "";
  const rawQ     = params.get("q")        || "";
  const sort     = (params.get("sort") || "popular") as BookFilters["sort"];
  
  const minPriceParam = params.get("minPrice") || "";
  const maxPriceParam = params.get("maxPrice") || "";

  // Local state for price inputs before debounce
  const [localMin, setLocalMin] = useState(minPriceParam);
  const [localMax, setLocalMax] = useState(maxPriceParam);
  const [priceError, setPriceError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedQ = useDebounce(rawQ, 300);
  const debouncedMin = useDebounce(localMin, 400);
  const debouncedMax = useDebounce(localMax, 400);

  // Sync debounced price values to URL
  useEffect(() => {
    const next = new URLSearchParams(params);
    let changed = false;

    if (debouncedMin) {
      if (next.get("minPrice") !== debouncedMin) { next.set("minPrice", debouncedMin); changed = true; }
    } else {
      if (next.has("minPrice")) { next.delete("minPrice"); changed = true; }
    }

    if (debouncedMax) {
      if (next.get("maxPrice") !== debouncedMax) { next.set("maxPrice", debouncedMax); changed = true; }
    } else {
      if (next.has("maxPrice")) { next.delete("maxPrice"); changed = true; }
    }

    if (changed) {
      next.delete("page");
      setParams(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax]);

  // Validate price range locally
  useEffect(() => {
    if (localMin && localMax && Number(localMin) > Number(localMax)) {
      setPriceError("Min price cannot exceed Max price.");
    } else {
      setPriceError("");
    }
  }, [localMin, localMax]);

  // Fetch langs and cats
  const [langs, setLangs] = useState<{ id: string; code: string; name: string; book_count: number }[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<BookCardData[]>([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [langsRes, catsRes] = await Promise.all([
          pb.collection("languages").getFullList({ filter: "is_active=true", sort: "display_order" }),
          pb.collection("categories").getFullList({ sort: "name" })
        ]);
        setLangs(langsRes.map(l => ({ ...l, book_count: l.book_count || 0 })) as any[]);
        setCats(catsRes as any[]);
      } catch (err) {
        console.error("Failed to load catalog metadata", err);
      }
    }
    loadMeta();
  }, []);

  const langId = langs.find((l) => l.code === langCode)?.id ?? "";
  const catId  = cats.find((c)  => c.slug  === catSlug)?.id  ?? "";

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    next.delete("page");
    setParams(next);
  };

  const clearAllFilters = () => {
    setLocalMin("");
    setLocalMax("");
    setParams(new URLSearchParams());
  };

  const activeFilterCount = [langCode, catSlug, rawQ, minPriceParam, maxPriceParam].filter(Boolean).length;
  const isSearchMode = Boolean(debouncedQ);

  const filters: BookFilters = {
    languageId: langId || undefined,
    categoryId: catId  || undefined,
    sort,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    searchTerm: debouncedQ || undefined,
  };

  const { books, loading, hasMore, loadMore, totalCount } = usePaginatedBooks(filters, PAGE_SIZE);

  // Fetch related books if exactly one lang or cat is selected and not searching
  const showRelated = !isSearchMode && (langCode || catSlug);
  
  useEffect(() => {
    async function loadRelated() {
      if (!showRelated || books.length === 0) return;
      try {
        const firstBook = books[0];
        const res = await pb.collection("books").getList(1, 6, {
          filter: `is_published=true && language="${firstBook.language}" && id!="${firstBook.id}"`,
        });
        setRelatedBooks(res.items as unknown as BookCardData[]);
      } catch (err) {
        console.error("Failed to load related books", err);
      }
    }
    loadRelated();
  }, [showRelated, books]);

  const langName = langs.find((l) => l.code === langCode)?.name;
  const catName  = cats.find((c)  => c.slug  === catSlug)?.name;
  const title    = debouncedQ ? `"${debouncedQ}"` : langName || catName || "All books";

  const pageNum = Math.ceil(books.length / PAGE_SIZE) || 1;

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-2.5">
        <div className="font-comic tracking-wide">Language</div>
      </div>
      <ul className="space-y-1.5 mb-7">
        <li>
          <button
            onClick={() => update("lang", "")}
            className={!langCode ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}
          >
            All languages
          </button>
        </li>
        {langs.map((l) => (
          <li key={l.id}>
            <button
              onClick={() => update("lang", l.code)}
              className={langCode === l.code ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}
            >
              {l.name} <span className="text-xs font-mono">({l.book_count})</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-dashed border-border pt-5 mb-7">
        <div className="font-comic tracking-wide mb-2.5">Category</div>
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => update("category", "")}
              className={!catSlug ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}
            >
              All categories
            </button>
          </li>
          {cats.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => update("category", c.slug)}
                className={catSlug === c.slug ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-dashed border-border pt-5">
        <div className="font-comic tracking-wide mb-2.5">Price range</div>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            value={localMin} 
            onChange={(e) => setLocalMin(e.target.value)}
            className="h-8 font-mono text-xs"
          />
          <span className="text-muted-foreground">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            value={localMax} 
            onChange={(e) => setLocalMax(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
        {priceError && <p className="text-xs text-destructive mt-1.5 font-medium">{priceError}</p>}
      </div>

      {activeFilterCount > 0 && (
        <div className="mt-6 pt-5 border-t border-dashed border-border">
          <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      <Helmet>
        <title>{title} | Digisell Books</title>
        <meta
          name="description"
          content={`Browse${totalCount != null ? ` ${totalCount}` : ""} PDF ebooks${langName ? " in " + langName : ""}${catName ? " — " + catName : ""}.`}
        />
      </Helmet>

      {/* Mobile filters drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-[80%] max-w-sm bg-background h-full p-6 overflow-y-auto border-r-[3px] border-border shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-comic tracking-wide text-lg">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 shrink-0 text-sm">
            <SidebarContent />
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="flex items-end justify-between mb-5 gap-3 flex-wrap">
              <div>
                <h1 className="font-comic text-3xl tracking-wide mb-1">
                  {title}
                </h1>
                <div className="text-sm text-muted-foreground font-mono">
                  {totalCount != null ? `Showing ${books.length} of ${totalCount}` : `${books.length} books`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="md:hidden" 
                  onClick={() => setShowMobileFilters(true)}
                >
                  <Filter className="size-4 mr-2" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>

                {!isSearchMode && (
                  <Select
                    value={sort}
                    onValueChange={(v) => update("sort", v === "popular" ? "" : v)}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {loading && books.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted animate-pulse border-[3px] border-border" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="border-[3px] border-dashed border-border bg-card py-20 text-center flex flex-col items-center justify-center">
                <Filter className="size-8 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No books match your current filters.</p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" onClick={clearAllFilters}>Clear filters</Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {books.map((b: BookCardData) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={loading}
                      onClick={loadMore}
                    >
                      {loading ? "Loading…" : "Load more books"}
                    </Button>
                    <span className="text-xs text-muted-foreground font-mono">Page {pageNum}</span>
                  </div>
                )}
              </>
            )}

            {showRelated && (
              <div className="mt-20 pt-10 border-t border-dashed border-border">
                <h2 className="font-comic text-2xl tracking-wide mb-6">You might also like</h2>
                {relatedBooks.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-8 text-center border-[3px] border-dashed border-border bg-card/50">
                    Once catalog data is restored, related books will appear here.
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {relatedBooks.map((b) => (
                      <div key={b.id} className="w-[160px] sm:w-[180px] shrink-0 snap-start">
                        <BookCard book={b} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
