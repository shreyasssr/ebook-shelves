import { Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Digisell <span className="text-primary">Books</span>
          </Link>
          <nav className="text-sm text-muted-foreground">Foundation ready</nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-20 space-y-4">
        <h1 className="text-4xl font-bold">Digisell Books — foundation laid</h1>
        <p className="text-muted-foreground">
          Database schema, RLS, storage buckets, and seed data are live. Framework
          has been swapped from TanStack Start to Vite + React Router v6. Continue
          in the next turn to build out Phases 3–11 (auth, catalog, book detail,
          checkout, dashboard, admin, edge functions).
        </p>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
