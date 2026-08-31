/**
 * src/lib/pagination.ts
 *
 * usePaginatedBooks — reusable React hook for paginated book fetching.
 *
 * BACKEND REMOVED: this used to page through Firestore with cursor-based
 * pagination (startAfter). No backend is connected, so this hook always
 * returns an empty list with hasMore=false. The filter/sort API surface is
 * kept identical so Catalog.tsx (or any future caller) doesn't need to
 * change its call site once a backend is wired back up — only the body of
 * fetchPage needs to be replaced with real queries.
 *
 * Usage:
 *   const { books, loading, hasMore, loadMore } = usePaginatedBooks(
 *     { languageId: "hi", sort: "popular" },
 *     24  // page size
 *   );
 */

import { useEffect, useState } from "react";

// ─── Matches the BookCardData shape expected by BookCard.tsx ─────────────────
export interface PaginatedBook {
  id:             string;
  slug:           string;
  name:           string;
  author:         string;
  price:          number;
  discount_price: number | null;
  thumbnail_url:  string | null;
  language_id:    string;
  category_id:    string | null;
}

// ─── Filter / sort options ────────────────────────────────────────────────────
export interface BookFilters {
  languageId?: string;
  categoryId?: string;
  sort?:       "popular" | "newest" | "price-asc" | "price-desc";
  minPrice?:   number;
  maxPrice?:   number;
  searchTerm?: string;
}

export function usePaginatedBooks(
  filters: BookFilters = {},
  pageSize = 24
) {
  const [books] = useState<PaginatedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore] = useState(false);

  // No-op: nothing to (re)fetch without a backend. Kept as an effect so the
  // hook's shape (loading toggles briefly) matches what callers expect.
  useEffect(() => {
    setLoading(true);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.languageId, filters.categoryId, filters.sort, pageSize]);

  const loadMore = () => {
    // No-op: no backend to page against.
  };

  return { books, loading, hasMore, loadMore };
}
