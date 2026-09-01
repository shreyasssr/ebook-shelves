import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { pb } from "@/lib/pocketbase";

export default function Auth() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const { user } = useAuth();
  const [tab, setTab] = useState<"signin"|"signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav(redirect, { replace: true }); }, [user, redirect, nav]);

  const signin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setBusy(true);
    try {
      await pb.collection("users").authWithPassword(email, password);
      // user effect will redirect
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials.");
    } finally {
      setBusy(false);
    }
  };

  const signup = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setBusy(true);
    try {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        full_name: name
      });
      // automatically sign in after signup
      await pb.collection("users").authWithPassword(email, password);
    } catch (err: any) {
      toast.error(err.message || "Failed to create account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet><title>Sign in | Digisell Books</title></Helmet>
      <div className="min-h-[calc(100vh-8rem)] grid md:grid-cols-2">
        {/* Image side — swap for a real photo of a cozy reading nook */}
        <div className="hidden md:block relative border-r border-border">
          <ImagePlaceholder
            variant="prominent"
            label="Auth page — a warm reading nook with an open book, tea, and soft lamp light"
            size="1200×1600"
          />
          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/50 to-transparent">
            <p className="font-display text-white text-2xl italic">
              "A room without books is like a body without a soul."
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-sm">
            <Link to="/" className="flex items-center justify-center gap-2 mb-8">
              <span className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground">
                <BookOpen className="size-4" />
              </span>
              <span className="font-display font-semibold text-xl">Digisell Books</span>
            </Link>

            <h1 className="font-display text-2xl font-semibold mb-6 text-center">Welcome back</h1>
            <Tabs value={tab} onValueChange={(v)=>setTab(v as any)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={signin} className="space-y-4 mt-4">
                  <div><Label>Email</Label><Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/></div>
                  <div><Label>Password</Label><Input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)}/></div>
                  <Button type="submit" className="w-full" disabled={busy}>{busy?"Signing in...":"Sign in"}</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={signup} className="space-y-4 mt-4">
                  <div><Label>Full name</Label><Input required value={name} onChange={(e)=>setName(e.target.value)}/></div>
                  <div><Label>Email</Label><Input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/></div>
                  <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)}/></div>
                  <Button type="submit" className="w-full" disabled={busy}>{busy?"Creating...":"Create account"}</Button>
                </form>
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground text-center mt-6">
              <Link to="/" className="hover:underline">← Back to store</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
