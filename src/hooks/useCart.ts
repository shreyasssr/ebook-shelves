import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [bookIds, setBookIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (user) {
      setLoading(true);
      const { data } = await supabase
        .from("cart_items")
        .select("book_id")
        .eq("user_id", user.id);
      setBookIds((data ?? []).map((r: any) => r.book_id));
      setLoading(false);
    } else {
      setBookIds(getLocal());
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("cart-changed", h);
    return () => window.removeEventListener("cart-changed", h);
  }, [refresh]);

  // Merge local cart into DB on login
  useEffect(() => {
    (async () => {
      if (!user) return;
      const local = getLocal();
      if (local.length === 0) return;
      await supabase
        .from("cart_items")
        .upsert(
          local.map((book_id) => ({ user_id: user.id, book_id })),
          { onConflict: "user_id,book_id", ignoreDuplicates: true } as any,
        );
      setLocal([]);
      refresh();
    })();
  }, [user, refresh]);

  const add = async (bookId: string) => {
    if (user) {
      await supabase
        .from("cart_items")
        .insert({ user_id: user.id, book_id: bookId })
        .select();
      refresh();
    } else {
      const cur = getLocal();
      if (!cur.includes(bookId)) setLocal([...cur, bookId]);
      setBookIds(getLocal());
    }
  };

  const remove = async (bookId: string) => {
    if (user) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", bookId);
      refresh();
    } else {
      setLocal(getLocal().filter((id) => id !== bookId));
      setBookIds(getLocal());
    }
  };

  const clear = async () => {
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
      refresh();
    } else {
      setLocal([]);
      setBookIds([]);
    }
  };

  return { bookIds, count: bookIds.length, loading, add, remove, clear, refresh };
}
