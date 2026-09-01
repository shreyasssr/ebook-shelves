import { Link } from "react-router-dom";
import { pb } from "@/lib/pocketbase";
import { formatINR, effectivePrice, discountPct } from "@/lib/format";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export type BookCardData = {
  id: string;
  collectionId?: string;
  slug: string;
  name: string;
  author: string;
  price: number;
  discount_price: number | null;
  thumbnail: string | null;
};

export default function BookCard({ book }: { book: BookCardData }) {
  const pct = discountPct(book.price, book.discount_price);
  
  // Create a minimal record-like object for pb.files.getUrl
  const coverUrl = book.thumbnail && book.collectionId 
    ? pb.files.getUrl({ id: book.id, collectionId: book.collectionId }, book.thumbnail)
    : undefined;
  return (
    <Link
      to={`/book/${book.slug}`}
      className="group flex flex-col rounded-md overflow-hidden border border-border bg-card
                 shadow-[2px_2px_0_0_var(--color-border)] hover:shadow-[3px_3px_0_0_var(--color-brass)]
                 hover:-translate-y-0.5 transition-all duration-150"
    >
      {/* Cover — spine shadow on the left edge evokes a real book standing on a shelf */}
      <div className="aspect-[2/3] relative overflow-hidden bg-muted">
        <div className="absolute inset-y-0 left-0 w-2 bg-black/10 z-10" />
        <ImagePlaceholder
          src={coverUrl}
          alt={book.name}
          label={`Cover — "${book.name}"`}
          size="600×900"
          className="group-hover:scale-[1.03] transition-transform duration-300"
        />
        {pct > 0 && (
          <span className="absolute top-2 right-0 bg-burgundy text-burgundy-foreground text-[11px] font-mono font-medium px-2 py-0.5 rounded-l-full shadow-sm">
            −{pct}%
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 border-t border-dashed border-border">
        <h3 className="font-display font-medium text-[15px] leading-snug line-clamp-2 group-hover:text-primary">
          {book.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 font-mono">{book.author}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-mono font-semibold text-sm text-primary">
            {formatINR(effectivePrice(book.price, book.discount_price))}
          </span>
          {pct > 0 && (
            <span className="text-xs text-muted-foreground line-through font-mono">
              {formatINR(book.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
