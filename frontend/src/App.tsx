import { useEffect, useState } from "react";
import { useTelegram } from "./hooks/useTelegram";
import { useAuthStore } from "./store/auth";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { Spinner } from "./components/ui/spinner";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
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
  { id: "products", label: "Mahsulotlar", icon: "products" },
  { id: "cart", label: "Savatcha", icon: "cart" },
  { id: "history", label: "Tarix", icon: "history" },
];

const adminTabs = [
  { id: "admin-products", label: "Mahsulotlar", icon: "admin-products" },
  { id: "admin-orders", label: "Buyurtmalar", icon: "admin-orders" },
  { id: "admin-finance", label: "Moliya", icon: "admin-finance" },
  { id: "admin-history", label: "Tarix", icon: "admin-history" },
];

export default function App() {
  const { user, token } = useAuthStore();
  const [page, setPage] = useState<Page>("products");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(true);
  const { ready, isTelegram } = useTelegram();
  const cartCount = useCartStore((s) => s.totalQuantity());
  const fetchCart = useCartStore((s) => s.fetch);

  useEffect(() => {
    ready();
    const path = window.location.pathname;
    if (path.startsWith("/admin")) {
      setIsAdmin(true);
      if (page === "products") setPage("admin-products");
    }
    if (token) {
      fetchCart();
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  // Not authenticated — show login/register
  if (!loading && !user && !isTelegram) {
    return (
      <div className="page">
        {authPage === "login" ? (
          <Login onSwitch={() => setAuthPage("register")} />
        ) : (
          <Register onSwitch={() => setAuthPage("login")} />
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  // Determine default page based on role
  const currentPage = isAdmin && page === "products" ? "admin-products" : page;

  const pages: Record<Page, { title: string; component: React.ReactNode }> = {
    products: { title: "Do'kon", component: <Products /> },
    cart: { title: "Savatcha", component: <Cart /> },
    history: { title: "Tarix", component: <History /> },
    "admin-products": { title: "Mahsulotlar", component: <AdminProducts /> },
    "admin-orders": { title: "Buyurtmalar", component: <AdminOrders /> },
    "admin-finance": { title: "Moliya", component: <AdminFinance /> },
    "admin-history": { title: "Tarix", component: <AdminHistory /> },
  };

  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <div className="page">
      {!isTelegram && (
        <div className="flex items-center justify-between px-4 py-1.5 text-xs" style={{ background: "color-mix(in srgb, var(--tg-warning) 12%, transparent)" }}>
          <span style={{ color: "var(--tg-warning)" }}>Test mode</span>
          <button
            className="border-none bg-transparent cursor-pointer font-medium"
            style={{ color: "var(--tg-destructive)" }}
            onClick={() => useAuthStore.getState().logout()}
          >
            Chiqish
          </button>
        </div>
      )}
      <Header title={pages[currentPage]?.title || "Do'kon"} />
      <div className="content">{pages[currentPage]?.component}</div>
      <BottomNav tabs={tabs} active={currentPage} onChange={(id) => setPage(id as Page)} badge={cartCount} />
    </div>
  );
}
