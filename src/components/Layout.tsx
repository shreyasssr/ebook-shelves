import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BookOpen, ShoppingCart, User, LogOut, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

// BACKEND REMOVED: the language filter pills used to be populated from the
// `languages` table. No backend is connected, so this list is empty and
// only the static "All" pill renders.
export default function Layout() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const langs: { code: string; name: string }[] = [];
  const [q, setQ] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <BookOpen className="size-5 text-primary" />
            Digisell <span className="text-primary">Books</span>
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
              placeholder="Search 5,000+ titles, authors..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </form>

          <nav className="ml-auto flex items-center gap-1">
            <Link to="/books" className="hidden sm:inline-block px-3 py-2 text-sm hover:text-primary">
              Browse
            </Link>
            <Link to="/cart" className="relative p-2 rounded-md hover:bg-muted">
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full size-4 flex items-center justify-center">
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
        <div className="border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex gap-1 overflow-x-auto text-sm">
            <NavLink to="/books" end className={({isActive})=>`px-3 py-1 rounded-full ${isActive?"bg-primary text-primary-foreground":"hover:bg-muted"}`}>All</NavLink>
            {langs.map((l) => (
              <NavLink
                key={l.code}
                to={`/books?lang=${l.code}`}
                className="px-3 py-1 rounded-full hover:bg-muted whitespace-nowrap"
              >
                {l.name}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} Digisell Books. Digital ebooks, instant delivery.</div>
          <div className="flex gap-4">
            <Link to="/books">Browse</Link>
            <Link to="/dashboard">Library</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
