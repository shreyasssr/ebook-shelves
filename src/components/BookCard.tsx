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
      className="theme-retro comic-shadow-hover group flex flex-col overflow-hidden
                 border-[3px] border-border bg-card comic-shadow-sm"
    >
      {/* Cover — thick ink panel border reads as a comic-panel frame */}
      <div className="aspect-[2/3] relative overflow-hidden bg-muted border-b-[3px] border-border">
        <ImagePlaceholder
          src={coverUrl}
          alt={book.name}
          label={`Cover — "${book.name}"`}
          size="600×900"
          className="group-hover:scale-[1.03] transition-transform duration-300"
        />
        {pct > 0 && (
          <span className="absolute top-2 -right-1 bg-burgundy text-burgundy-foreground text-[11px] font-poster px-2.5 py-1 border-[3px] border-border rotate-3">
            −{pct}%
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-display font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-primary">
          {book.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 font-mono">{book.author}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-poster text-sm text-primary">
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
