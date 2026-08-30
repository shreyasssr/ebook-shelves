/**
 * src/pages/Catalog.tsx
 *
 * Catalog page — BACKEND REMOVED.
 *
 * This previously branched between a Firestore-backed browse mode
 * (usePaginatedBooks, cursor pagination) and an Algolia-backed search mode
 * (searchBooks, page-based pagination) depending on whether a `?q=` query
 * param was present. Both Firebase and Algolia have been removed along
 * with the entire backend.
 *
 * This file is kept as a working UI shell: the language/category filter
 * sidebar, sort dropdown, search debounce, and URL param sync all still
 * function, but `langs`, `cats`, and `books` are always empty since there
 * is nothing to fetch them from. `usePaginatedBooks` (see src/lib/
 * pagination.ts) already returns an empty result set, so this page falls
 * through to its existing "No books found" empty state.
 *
 * To reconnect a backend: replace the `usePaginatedBooks` call's internals
 * and add real language/category fetches where the effect below currently
 * does nothing.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePaginatedBooks, type BookFilters } from "@/lib/pagination";
import { type BookCardData }                   from "@/components/BookCard";
import BookCard                                from "@/components/BookCard";
import { Button }                              from "@/components/ui/button";
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

  const debouncedQ = useDebounce(rawQ, 300);

  // BACKEND REMOVED: languages/categories used to be fetched from
  // Firestore here. No backend is connected, so the filter sidebar always
  // shows only "All languages" / "All categories".
  const langs: { id: string; code: string; name: string; book_count: number }[] = [];
  const cats:  { id: string; name: string; slug: string }[] = [];

  const langId = langs.find((l) => l.code === langCode)?.id ?? "";
  const catId  = cats.find((c)  => c.slug  === catSlug)?.id  ?? "";

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    next.delete("page");
    setParams(next);
  };

  const filters: BookFilters = {
    languageId: langId || undefined,
    categoryId: catId  || undefined,
    sort,
  };

  const { books, loading, hasMore, loadMore } = usePaginatedBooks(filters, PAGE_SIZE);

  const isSearchMode = Boolean(debouncedQ);
  const totalCount: number | undefined = undefined;

  const langName = langs.find((l) => l.code === langCode)?.name;
  const catName  = cats.find((c)  => c.slug  === catSlug)?.name;
  const title    = debouncedQ ? `"${debouncedQ}"` : langName || catName || "All books";

  return (
    <>
      <Helmet>
        <title>{title} | Digisell Books</title>
        <meta
          name="description"
          content={`Browse${totalCount != null ? ` ${totalCount}` : ""} PDF ebooks${langName ? " in " + langName : ""}${catName ? " — " + catName : ""}.`}
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── Sidebar filters ─────────────────────────────────────────────── */}
          <aside className="md:w-56 shrink-0 space-y-6 text-sm">
            <div>
              <div className="font-semibold mb-2">Language</div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => update("lang", "")}
                    className={!langCode ? "text-primary font-medium" : ""}
                  >
                    All languages
                  </button>
                </li>
                {langs.map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => update("lang", l.code)}
                      className={
                        langCode === l.code
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      {l.name} <span className="text-xs">({l.book_count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-semibold mb-2">Category</div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => update("category", "")}
                    className={!catSlug ? "text-primary font-medium" : ""}
                  >
                    All categories
                  </button>
                </li>
                {cats.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => update("category", c.slug)}
                      className={
                        catSlug === c.slug
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────────── */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">
                {title}
                {totalCount != null && (
                  <span className="text-muted-foreground text-sm font-normal ml-2">
                    ({totalCount})
                  </span>
                )}
              </h1>

              {!isSearchMode && (
                <Select
                  value={sort}
                  onValueChange={(v) => update("sort", v === "popular" ? "" : v)}
                >
                  <SelectTrigger className="w-40">
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

            {loading && books.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No books found. Try a different filter.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {books.map((b: BookCardData) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={loading}
                      onClick={loadMore}
                    >
                      {loading ? "Loading…" : "Load more books"}
                    </Button>
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
