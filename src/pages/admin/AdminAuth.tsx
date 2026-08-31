import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldAlert, Lock, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // If already signed in, go straight to the admin panel
  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    // BACKEND REMOVED: Sign-in is inert.
    setTimeout(() => {
      setBusy(false);
      toast.error("Sign-in is unavailable — no backend is connected.");
    }, 500);
  };

  return (
    <>
      <Helmet><title>Admin Sign In | Digisell</title></Helmet>
      
      {/* Utilitarian, non-storefront aesthetic: dark, centered, minimal */}
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-50 font-sans">
        
        <div className="w-full max-w-sm space-y-8">
          
          <div className="text-center">
            <div className="mx-auto size-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center mb-6">
              <ShieldAlert className="size-6 text-zinc-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Restricted Access</h1>
            <p className="text-sm text-zinc-400">Staff and administrators only.</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700" 
                  placeholder="admin@digisell.com" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700" 
                  placeholder="••••••••" 
                />
              </div>
              
              <Button type="submit" disabled={busy} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-300 mt-2">
                {busy ? "Authenticating..." : (
                  <>
                    <Lock className="mr-2 size-4" /> Sign in to Dashboard
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="mr-2 size-3" /> Back to the store
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
