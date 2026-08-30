import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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

  // BACKEND REMOVED: sign-in/sign-up used to call Supabase Auth. No backend
  // is currently connected, so these are inert — the form renders but
  // cannot actually authenticate anyone.
  const signin = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    setBusy(false);
    toast.error("Sign-in is unavailable — no backend is connected.");
  };

  const signup = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    setBusy(false);
    toast.error("Account creation is unavailable — no backend is connected.");
  };

  return (
    <>
      <Helmet><title>Sign in | Digisell Books</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Digisell Books</h1>
        <Tabs value={tab} onValueChange={(v)=>setTab(v as any)}>
          <TabsList className="grid grid-cols-2 w-full"><TabsTrigger value="signin">Sign in</TabsTrigger><TabsTrigger value="signup">Create account</TabsTrigger></TabsList>
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
    </>
  );
}
