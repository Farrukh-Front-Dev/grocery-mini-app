import { useEffect, useState } from "react";
import type { Product, Category } from "@grocery/shared";
import { getProducts, getCategories } from "../../services/products";
import { QuantityInput } from "../../components/shared/QuantityInput";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { formatSom } from "../../utils/format";
import { useCartStore } from "../../store/cart";

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const addToCart = useCartStore((s) => s.add);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && selectedCat === null) setSelectedCat(cats[0].id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = selectedCat ? products.filter((p) => p.categoryId === selectedCat) : products;
  const currentCat = categories.find((c) => c.id === selectedCat);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-3 -mx-4 px-4 mb-2 scrollbar-none">
          <button
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border-none cursor-pointer whitespace-nowrap transition-all ${
              selectedCat === null ? "" : "opacity-60"
            }`}
            style={{
              background: selectedCat === null ? "var(--tg-button)" : "var(--tg-secondary-bg)",
              color: selectedCat === null ? "var(--tg-button-text)" : "var(--tg-text)",
            }}
            onClick={() => setSelectedCat(null)}
          >
            Hammasi
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border-none cursor-pointer whitespace-nowrap transition-all ${
                selectedCat === cat.id ? "" : "opacity-60"
              }`}
              style={{
                background: selectedCat === cat.id ? "var(--tg-button)" : "var(--tg-secondary-bg)",
                color: selectedCat === cat.id ? "var(--tg-button-text)" : "var(--tg-text)",
              }}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState title="Mahsulotlar yo'q" description="Hozircha hech qanday mahsulot qo'shilmagan" />
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-sm" style={{ color: "var(--tg-hint)" }}>
          Bu kategoriyada mahsulot yo'q
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={(qty) => addToCart(product.id, qty)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (qty: number) => void }) {
  const [qty, setQty] = useState(product.step);

  const outOfStock = product.stockQty <= 0;
  const lowStock = !outOfStock && product.stockQty < 5;

  return (
    <Card className="flex flex-col p-3">
      <div className="w-full aspect-square rounded-xl mb-2 flex items-center justify-center text-3xl overflow-hidden" style={{ background: "color-mix(in srgb, var(--tg-button) 8%, transparent)" }}>
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          "🥦"
        )}
      </div>
      <h3 className="text-sm font-medium mb-0.5">{product.name}</h3>
      <p className="text-sm font-semibold mb-1">{formatSom(product.price)}</p>
      <p className="text-xs mb-2" style={{ color: "var(--tg-hint)" }}>
        / {product.unit}
        {outOfStock && <span className="text-red-500 ml-1">— tugagan</span>}
        {lowStock && <span className="text-amber-500 ml-1">— {product.stockQty}{product.unit}</span>}
      </p>
      <div className="flex items-center justify-between mt-auto">
        <QuantityInput value={qty} step={product.step} max={product.stockQty} disabled={outOfStock} onChange={setQty} />
        <Button
          size="icon"
          disabled={outOfStock}
          onClick={() => { onAdd(qty); }}
        >
          +
        </Button>
      </div>
    </Card>
  );
}
