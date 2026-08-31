import { Link } from "react-router-dom";
import { BookX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <BookX className="size-12 mx-auto text-brass mb-4" />
      <h1 className="font-display text-6xl font-semibold">404</h1>
      <p className="mt-2 text-muted-foreground">This page isn't on the shelf.</p>
      <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
    </div>
  );
}
