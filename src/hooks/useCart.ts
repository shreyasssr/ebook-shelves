import { useEffect, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────
// BACKEND REMOVED: this used to sync the cart to a `cart_items` table for
// signed-in users (merging in the guest/localStorage cart on login). Since
// auth is now always signed-out (see AuthContext), the DB-backed branch is
// gone and the cart is local-only (localStorage), which keeps this hook
// fully functional without any backend.
// ─────────────────────────────────────────────────────────────────────────

const LS_KEY = "digisell.cart.v1";

function getLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function setLocal(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("cart-changed"));
}

export function useCart() {
  const [bookIds, setBookIds] = useState<string[]>([]);
  const loading = false;

  const refresh = useCallback(() => {
    setBookIds(getLocal());
  }, []);

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("cart-changed", h);
    return () => window.removeEventListener("cart-changed", h);
  }, [refresh]);

  const add = async (bookId: string) => {
    const cur = getLocal();
    if (!cur.includes(bookId)) setLocal([...cur, bookId]);
    setBookIds(getLocal());
  };

  const remove = async (bookId: string) => {
    setLocal(getLocal().filter((id) => id !== bookId));
    setBookIds(getLocal());
  };

  const clear = async () => {
    setLocal([]);
    setBookIds([]);
  };

  return { bookIds, count: bookIds.length, loading, add, remove, clear, refresh };
}
