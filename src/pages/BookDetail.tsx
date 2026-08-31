import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// BACKEND REMOVED: this page used to fetch a book (and its language and
// category) from Supabase by slug, then render its full detail page —
// cover, price, description, "what's included", FAQs, reviews, and
// add-to-cart/buy-now. No backend is connected, so there is no book data
// to look up. This is an on-brand empty state; wire a fetch back up here
// (see git history / CLEANUP_PROMPT.md for the previous implementation
// shape) to restore the full page.
export default function BookDetail() {
  const { slug } = useParams();

  return (
    <>
      <Helmet><title>Book not found | Digisell Books</title></Helmet>
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
          <BookOpen className="size-6 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">This title isn't on the shelf</h1>
        <p className="text-sm text-muted-foreground mb-6 font-mono">"{slug}"</p>
        <Button asChild><Link to="/books">Browse all books</Link></Button>
      </div>
    </>
  );
}
