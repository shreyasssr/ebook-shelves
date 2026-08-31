import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ImagePlaceholder
 *
 * A visual stand-in for wherever a real photo/illustration belongs. Every
 * instance names exactly what to generate and at what size, so swapping in
 * real assets later is a find-and-replace, not a redesign.
 *
 * To swap in a real image once you have one: replace the <ImagePlaceholder>
 * usage with a normal <img src="..." className="w-full h-full object-cover" />
 * inside the same wrapper, or pass `src` here directly (falls back to the
 * placeholder automatically if `src` is empty/undefined).
 */

interface ImagePlaceholderProps {
  /** What this image should depict — used as the on-screen label AND as a
   *  ready-to-use AI image generation prompt starting point. */
  label: string;
  /** Recommended pixel dimensions, e.g. "1600×900" — shown as a hint. */
  size?: string;
  /** Optional real image URL — if provided, renders the image instead. */
  src?: string;
  alt?: string;
  className?: string;
  /** Visual weight: "subtle" for small/secondary spots, "prominent" for heroes. */
  variant?: "subtle" | "prominent";
}

export default function ImagePlaceholder({
  label,
  size,
  src,
  alt,
  className,
  variant = "subtle",
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || label}
        loading="lazy"
        className={cn("w-full h-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center justify-center gap-2 text-center px-4",
        "border-2 border-dashed rounded-md",
        variant === "prominent"
          ? "border-brass/50 bg-gradient-to-br from-primary/5 via-brass/5 to-burgundy/5"
          : "border-border bg-muted/60",
        className
      )}
    >
      <ImageIcon
        className={cn(
          "shrink-0",
          variant === "prominent" ? "size-8 text-brass" : "size-5 text-muted-foreground"
        )}
      />
      <p
        className={cn(
          "font-mono leading-snug text-muted-foreground",
          variant === "prominent" ? "text-xs max-w-[26ch]" : "text-[10px] max-w-[20ch]"
        )}
      >
        {label}
        {size && <span className="block opacity-70 mt-0.5">{size}</span>}
      </p>
    </div>
  );
}
