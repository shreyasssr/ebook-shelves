import { Link, NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, ShoppingBag, Upload, BarChart3, History, Mail, LogOut } from "lucide-react";

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="theme-glass glass-admin-bg min-h-screen p-8 text-foreground">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" replace/>;
  if (!isAdmin) return (
    <div className="theme-glass glass-admin-bg min-h-screen flex items-center justify-center p-8 text-foreground">
      <div className="glass-panel-strong rounded-2xl p-8 max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">Your account does not have admin privileges.</p>
        <Link to="/" className="text-primary">← Back to store</Link>
      </div>
    </div>
  );

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
    <div className="theme-glass glass-admin-bg text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="glass-panel-strong rounded-2xl flex flex-col p-4 h-fit md:sticky md:top-6">
          <div className="space-y-1 flex-1">
            <Link to="/" className="font-display font-semibold text-lg block mb-4 px-1">Digisell Admin</Link>
            {links.map((l)=>(
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({isActive})=>`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${isActive?"bg-primary text-primary-foreground":"hover:bg-accent"}`}>
                <l.icon className="size-4"/> {l.label}
              </NavLink>
            ))}
          </div>
          
          <div className="mt-8 pt-4 border-t border-border">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </aside>
        <main className="glass-panel rounded-2xl p-6 min-h-[60vh]">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
