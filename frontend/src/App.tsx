import { useEffect, useState } from "react";
import { useTelegram } from "./hooks/useTelegram";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { Products } from "./pages/customer/Products";
import { Cart } from "./pages/customer/Cart";
import { History } from "./pages/customer/History";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminFinance } from "./pages/admin/AdminFinance";
import { AdminHistory } from "./pages/admin/AdminHistory";
import { useCartStore } from "./store/cart";

type Page = "products" | "cart" | "history" | "admin-products" | "admin-orders" | "admin-finance" | "admin-history";

const customerTabs = [
  { id: "products", label: "Mahsulotlar", icon: "📦" },
  { id: "cart", label: "Savatcha", icon: "🛒" },
  { id: "history", label: "Tarix", icon: "📜" },
];

const adminTabs = [
  { id: "admin-products", label: "Mahsulotlar", icon: "📦" },
  { id: "admin-orders", label: "Buyurtmalar", icon: "📋" },
  { id: "admin-finance", label: "Moliya", icon: "💰" },
  { id: "admin-history", label: "Tarix", icon: "📜" },
];

export default function App() {
  const [page, setPage] = useState<Page>("products");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { ready, isTelegram } = useTelegram();
  const cartCount = useCartStore((s) => s.totalQuantity());
  const fetchCart = useCartStore((s) => s.fetch);

  useEffect(() => {
    ready();
    const path = window.location.pathname;
    setIsAdmin(path.startsWith("/admin"));
    if (path === "/admin") setPage("admin-products");
    fetchCart();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--tg-button)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const pages: Record<Page, { title: string; component: React.ReactNode }> = {
    products: { title: "🛒 Do'kon", component: <Products /> },
    cart: { title: "🛒 Savatcha", component: <Cart /> },
    history: { title: "📜 Tarix", component: <History /> },
    "admin-products": { title: "📦 Mahsulotlar", component: <AdminProducts /> },
    "admin-orders": { title: "📋 Buyurtmalar", component: <AdminOrders /> },
    "admin-finance": { title: "💰 Moliya", component: <AdminFinance /> },
    "admin-history": { title: "📜 Tarix", component: <AdminHistory /> },
  };

  const current = pages[page];
  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <div className="page">
      {!isTelegram && (
        <div className="text-center text-xs py-1.5 font-medium" style={{ background: "color-mix(in srgb, var(--tg-warning) 15%, transparent)", color: "var(--tg-warning)" }}>
          🛠 Development mode — Telegram'da ochilsa to'liq ishlaydi
        </div>
      )}
      <Header title={current.title} />
      <div className="content">{current.component}</div>
      <BottomNav tabs={tabs} active={page} onChange={(id) => setPage(id as Page)} badge={cartCount} />
    </div>
  );
}
