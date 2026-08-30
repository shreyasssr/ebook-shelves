import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { formatINR, effectivePrice, discountPct } from "@/lib/format";

export type BookCardData = {
  id: string;
  slug: string;
  name: string;
  author: string;
  price: number;
  discount_price: number | null;
  thumbnail_url: string | null;
};

export default function BookCard({ book }: { book: BookCardData }) {
  const pct = discountPct(book.price, book.discount_price);
  return (
    <Link
      to={`/book/${book.slug}`}
      className="group flex flex-col rounded-lg overflow-hidden border border-border bg-card hover:shadow-lg transition"
    >
      <div className="aspect-[2/3] bg-muted relative overflow-hidden">
        {book.thumbnail_url ? (
          <img
            src={book.thumbnail_url}
            alt={book.name}
            loading="lazy"
            className="object-cover w-full h-full group-hover:scale-105 transition"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <BookOpen className="size-10" />
          </div>
        )}
        {pct > 0 && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded">
            -{pct}%
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">{book.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-bold text-sm">{formatINR(effectivePrice(book.price, book.discount_price))}</span>
          {pct > 0 && <span className="text-xs text-muted-foreground line-through">{formatINR(book.price)}</span>}
        </div>
      </div>
    </Link>
  );
}
