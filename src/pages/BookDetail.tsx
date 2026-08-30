import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// BACKEND REMOVED: this page used to fetch a book (and its language and
// category) from Supabase by slug, then render its full detail page —
// cover, price, description, "what's included", FAQs, add-to-cart, and
// buy-now. No backend is connected, so there is no book data to look up.
// This is now an empty shell; wire a fetch back up here to restore it.
export default function BookDetail() {
  const { slug } = useParams();

  return (
    <>
      <Helmet><title>Book not found | Digisell Books</title></Helmet>
      <div className="max-w-6xl mx-auto px-6 py-16">
        Book "{slug}" not found. <Link to="/books" className="text-primary">Browse all</Link>
      </div>
    </>
  );
}
