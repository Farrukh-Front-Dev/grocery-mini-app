import { useEffect, useState } from "react";
import type { Product, Category, Order } from "@grocery/shared";
import "./App.css";

type Tab = "products" | "cart" | "history";

function getInitData(): string {
  try {
    return window.Telegram?.WebApp?.initData || "";
  } catch {
    return "";
  }
}

function apiHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `tma ${getInitData()}`,
  };
}

export default function App() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try { window.Telegram?.WebApp?.ready(); window.Telegram?.WebApp?.expand(); } catch {}
    fetch("/api/products", { headers: apiHeaders() })
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  return (
    <div className="app">
      <header><h1>🛒 Do'kon</h1></header>
      <main>
        {tab === "products" && <ProductsTab products={products} />}
        {tab === "cart" && <CartTab />}
        {tab === "history" && <HistoryTab />}
      </main>
      <nav className="tabs">
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>📦 Mahsulotlar</button>
        <button className={tab === "cart" ? "active" : ""} onClick={() => setTab("cart")}>🛒 Savatcha</button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>📜 Tarix</button>
      </nav>
    </div>
  );
}

function ProductsTab({ products }: { products: Product[] }) {
  return (
    <div className="products">
      {products.length === 0 && <p className="empty">Mahsulotlar yo'q</p>}
      {products.map((p) => (
        <div key={p.id} className="card">
          <div>
            <h3>{p.name}</h3>
            <p className="price">{p.price.toLocaleString()} so'm / {p.unit}</p>
            {p.stockQty <= 0 ? <p className="badge error">Mavjud emas</p>
              : p.stockQty < 5 ? <p className="badge warn">Faqat {p.stockQty}{p.unit} qoldi</p>
              : null}
          </div>
          <button disabled={p.stockQty <= 0}>+</button>
        </div>
      ))}
    </div>
  );
}

function CartTab() {
  return <p className="empty">Savatcha bo'sh</p>;
}

function HistoryTab() {
  return <p className="empty">Buyurtmalar yo'q</p>;
}
