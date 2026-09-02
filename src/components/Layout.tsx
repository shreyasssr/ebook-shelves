import { Link, NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, ShoppingCart, User, LogOut, Search, Mail, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { pb } from "@/lib/pocketbase";

export default function Layout() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [langs, setLangs] = useState<{ code: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [q, setQ] = useState("");

  const currentLang = searchParams.get("lang") || "all";
  const currentCategory = searchParams.get("category");
  const currentSort = searchParams.get("sort");

  const setLanguage = (langCode: string) => {
    const next = new URLSearchParams(searchParams);
    if (langCode === "all") next.delete("lang");
    else next.set("lang", langCode);
    setSearchParams(next);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [langRes, catRes] = await Promise.all([
          pb.collection("languages").getFullList({ filter: "is_active=true", sort: "display_order" }),
          pb.collection("categories").getFullList({ sort: "name" })
        ]);
        setLangs(langRes.map((l: any) => ({ code: l.code, name: l.name })));
        setCategories(catRes.map((c: any) => ({ slug: c.slug, name: c.name })));
      } catch (err) {
        console.error("Failed to load header data", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="theme-retro halftone-bg min-h-screen flex flex-col text-foreground">
      <header className="sticky top-0 z-40 border-b-[3px] border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center size-9 border-[3px] border-border bg-comic-blue text-comic-blue-foreground comic-shadow-sm -rotate-3">
              <BookOpen className="size-4" />
            </span>
            <span className="font-comic text-2xl tracking-wide">
              Digisell <span className="text-burgundy">Books</span>
            </span>
          </Link>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) nav(`/books?q=${encodeURIComponent(q.trim())}`);
            }}
            className="hidden md:flex flex-1 max-w-xl relative"
          >
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 5,000+ titles, authors…"
              className="w-full pl-9 pr-4 py-2 border-[3px] border-input bg-secondary/60 text-sm
                         focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
            />
          </form>

          <nav className="ml-auto flex items-center gap-1">
            <Link to="/books" className="hidden sm:inline-block px-3 py-2 text-sm font-medium hover:text-primary">
              Browse
            </Link>
            <Link to="/cart" className="relative p-2 hover:bg-muted">
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-burgundy text-burgundy-foreground text-[10px] font-poster border-2 border-border rounded-full size-[18px] flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><User className="size-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => nav("/dashboard")}>My Library</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav("/orders")}>Orders</DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => nav("/admin")}>Admin</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); nav("/"); }}>
                    <LogOut className="size-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => nav("/auth")}>Sign in</Button>
            )}
          </nav>
        </div>

        {/* Shelf strip — Destinations, Categories, and Language Dropdown */}
        <div className="border-t-[3px] border-border bg-secondary/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex gap-4 items-center justify-between text-sm overflow-x-auto">
            <div className="flex gap-2 items-center flex-nowrap">
              <Link
                to="/books?sort=new"
                className={`px-3 py-1 border-2 border-border font-medium whitespace-nowrap transition-colors ${
                  currentSort === "new" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                }`}
              >
                New Arrivals
              </Link>
              <Link
                to="/books?sort=bestseller"
                className={`px-3 py-1 border-2 border-border font-medium whitespace-nowrap transition-colors ${
                  currentSort === "bestseller" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                }`}
              >
                Bestsellers
              </Link>
              
              <div className="w-px h-5 bg-border mx-1"></div>
              
              <Link
                to="/books"
                className={`px-3 py-1 border-2 border-border font-medium whitespace-nowrap transition-colors ${
                  !currentCategory && !currentSort ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                }`}
              >
                All Books
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to={`/books?category=${c.slug}`}
                  className={`px-3 py-1 border-2 border-border font-medium whitespace-nowrap transition-colors ${
                    currentCategory === c.slug ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="size-3.5 text-muted-foreground" />
              <select
                value={currentLang}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-background border-2 border-border px-2 py-1 font-medium text-xs rounded-none cursor-pointer outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Language: All</option>
                {langs.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t-[3px] border-border mt-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center size-7 border-[3px] border-border bg-primary text-primary-foreground">
                <BookOpen className="size-3.5" />
              </span>
              <span className="font-comic text-xl tracking-wide">Digisell Books</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              A curated PDF ebook shop in Hindi, English, Marathi, Gujarati, Bengali, Tamil — and growing.
            </p>
          </div>

          <div>
            <div className="font-display font-medium mb-3">Shop</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/books" className="hover:text-primary">Browse all books</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary">My Library</Link></li>
              <li><Link to="/orders" className="hover:text-primary">Order history</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-display font-medium mb-3">Policies</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/refund-policy" className="hover:text-primary">Refund policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms of service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy policy</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-display font-medium mb-3">Stay in the loop</div>
            <p className="text-sm text-muted-foreground mb-3">New titles and offers, once in a while — no spam.</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" placeholder="you@email.com" className="pl-9 bg-background" disabled />
              </div>
              <Button type="submit" variant="outline" disabled>Join</Button>
            </form>
            <p className="text-[11px] text-muted-foreground mt-1.5">Newsletter signup isn't connected yet.</p>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
            <div>© {new Date().getFullYear()} Digisell Books. Digital ebooks, instant delivery.</div>
            <div>Made for readers, in every language.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
