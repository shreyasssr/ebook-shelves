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

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBooks from "@/pages/admin/AdminBooks";
import AdminBookEdit from "@/pages/admin/AdminBookEdit";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminImport from "@/pages/admin/AdminImport";

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
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="books" element={<AdminBooks />} />
          <Route path="books/:id" element={<AdminBookEdit />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="import" element={<AdminImport />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
