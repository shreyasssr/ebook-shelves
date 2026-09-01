import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

export interface PaginatedBook {
  id:             string;
  slug:           string;
  name:           string;
  author:         string;
  price:          number;
  discount_price: number | null;
  thumbnail:      string | null;
  language:       string;
  category:       string | null;
  expand?:        any;
}

export interface BookFilters {
  languageId?: string;
  categoryId?: string;
  sort?:       "popular" | "newest" | "price-asc" | "price-desc";
  minPrice?:   number;
  maxPrice?:   number;
  searchTerm?: string;
}

const sortMap: Record<string, string> = {
  "popular": "-sales_count",
  "newest": "-created",
  "price-asc": "price",
  "price-desc": "-price"
};

export function usePaginatedBooks(filters: BookFilters = {}, pageSize = 24) {
  const [books, setBooks] = useState<PaginatedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  // Reset pagination when filters change
  useEffect(() => {
    setBooks([]);
    setPage(1);
    setHasMore(false);
    setTotalCount(undefined);
  }, [
    filters.languageId, filters.categoryId, filters.sort,
    filters.minPrice, filters.maxPrice, filters.searchTerm, pageSize
  ]);

  useEffect(() => {
    let active = true;

    async function fetchBooks() {
      setLoading(true);
      try {
        const filterParts = ["is_published=true"];
        
        if (filters.languageId) filterParts.push(`language="${filters.languageId}"`);
        if (filters.categoryId) filterParts.push(`category="${filters.categoryId}"`);
        if (filters.minPrice !== undefined) filterParts.push(`price >= ${filters.minPrice}`);
        if (filters.maxPrice !== undefined) filterParts.push(`price <= ${filters.maxPrice}`);
        if (filters.searchTerm) filterParts.push(`name ~ "${filters.searchTerm}"`);

        const result = await pb.collection("books").getList(page, pageSize, {
          filter: filterParts.join(" && "),
          sort: filters.sort ? sortMap[filters.sort] : sortMap["popular"],
          expand: "language,category"
        });

        if (active) {
          setBooks(prev => page === 1 ? (result.items as unknown as PaginatedBook[]) : [...prev, ...(result.items as unknown as PaginatedBook[])]);
          setHasMore(result.page < result.totalPages);
          setTotalCount(result.totalItems);
        }
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchBooks();

    return () => { active = false; };
  }, [
    page, pageSize,
    filters.languageId, filters.categoryId, filters.sort,
    filters.minPrice, filters.maxPrice, filters.searchTerm
  ]);

  const loadMore = () => {
    if (!loading && hasMore) setPage(p => p + 1);
  };

  return { books, loading, hasMore, loadMore, totalCount };
}
