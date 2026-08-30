import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto p-16 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">This page doesn't exist.</p>
      <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
    </div>
  );
}
