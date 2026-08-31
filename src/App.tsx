import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import BookDetail from "@/pages/BookDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import { OrdersList, OrderDetail } from "@/pages/Orders";
import NotFound from "@/pages/NotFound";
import RefundPolicy from "@/pages/static/RefundPolicy";
import Terms from "@/pages/static/Terms";
import Privacy from "@/pages/static/Privacy";

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBooks from "@/pages/admin/AdminBooks";
import AdminBookEdit from "@/pages/admin/AdminBookEdit";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminImport from "@/pages/admin/AdminImport";
import AdminReports from "@/pages/admin/AdminReports";
import AdminImportHistory from "@/pages/admin/AdminImportHistory";
import AdminEmailTemplates from "@/pages/admin/AdminEmailTemplates";
import AdminAuth from "@/pages/admin/AdminAuth";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Catalog />} />
          <Route path="/book/:slug" element={<BookDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/:id" element={<AdminBookEdit />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="import" element={<AdminImport />} />
          <Route path="import-history" element={<AdminImportHistory />} />
          <Route path="email-templates" element={<AdminEmailTemplates />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
