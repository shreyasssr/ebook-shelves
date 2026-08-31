import { Link, NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, ShoppingBag, Upload, BarChart3, History, Mail, LogOut } from "lucide-react";

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace/>;
  if (!isAdmin) return <div className="p-8 max-w-md mx-auto text-center">
    <h1 className="text-xl font-bold">Admin access required</h1>
    <p className="mt-2 text-muted-foreground">Your account does not have admin privileges.</p>
    <Link to="/" className="text-primary">← Back to store</Link>
  </div>;

  const links = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/books", label: "Books", icon: BookOpen },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/import", label: "Bulk import", icon: Upload },
    { to: "/admin/import-history", label: "Import History", icon: History },
    { to: "/admin/email-templates", label: "Email Templates", icon: Mail },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid md:grid-cols-[200px_1fr] gap-6">
        <aside className="flex flex-col">
          <div className="space-y-1 flex-1">
            <Link to="/" className="font-bold text-lg block mb-4">Digisell Admin</Link>
            {links.map((l)=>(
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({isActive})=>`flex items-center gap-2 px-3 py-2 rounded text-sm ${isActive?"bg-primary text-primary-foreground":"hover:bg-muted"}`}>
                <l.icon className="size-4"/> {l.label}
              </NavLink>
            ))}
          </div>
          
          <div className="mt-8 pt-4 border-t border-border">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm w-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </aside>
        <main className="bg-background border border-border rounded-lg p-6 min-h-[60vh]">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
