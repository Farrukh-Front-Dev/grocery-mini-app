import { useEffect, useState } from "react";
import type { Product } from "@grocery/shared";
import { useCartStore } from "../../store/cart";
import { getProducts } from "../../services/products";
import { createOrder } from "../../services/orders";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import { QuantityInput } from "../../components/shared/QuantityInput";
import { formatSom } from "../../utils/format";

interface CartProduct extends Product {
  cartQty: number;
  cartItemId: number;
}

export function Cart() {
  const { items, fetch, remove, clear, loading } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"naqd" | "online">("naqd");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetch(); getProducts().then(setProducts).catch(() => {}); }, []);

  const cartProducts: CartProduct[] = items
    .map((ci) => {
      const p = products.find((pr) => pr.id === ci.productId);
      if (!p) return null;
      return { ...p, cartQty: ci.quantity, cartItemId: ci.id };
    })
    .filter((cp): cp is CartProduct => cp !== null) as CartProduct[];

  const subtotal = cartProducts.reduce((sum, cp) => sum + cp.price * cp.cartQty, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    setSubmitting(true);
    setError("");
    try {
      await createOrder({
        items: cartProducts.map((cp) => ({ productId: cp.id, quantity: cp.cartQty })),
        paymentMethod,
        deliveryLocation: deliveryLocation || undefined,
      });
      await clear();
      setShowCheckout(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      {cartProducts.length === 0 ? (
        <EmptyState icon="🛒" title="Savatcha bo'sh" description="Mahsulot qo'shish uchun do'konga o'ting" />
      ) : (
        <>
          <div className="space-y-1">
            {cartProducts.map((cp) => (
              <div key={cp.id} className="card rounded-xl" style={{ background: "var(--tg-secondary-bg)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: "color-mix(in srgb, var(--tg-button) 8%, transparent)" }}>
                    🥦
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cp.name}</p>
                    <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{formatSom(cp.price)} / {cp.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <QuantityInput value={cp.cartQty} step={cp.step} max={cp.stockQty + cp.cartQty} onChange={(v) => {
                    if (v <= 0) remove(cp.id);
                    else fetch();
                  }} />
                  <button
                    className="text-lg border-none bg-transparent cursor-pointer"
                    style={{ color: "var(--tg-destructive)" }}
                    onClick={() => remove(cp.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-2xl" style={{ background: "var(--tg-secondary-bg)" }}>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--tg-hint)" }}>Mahsulotlar</span>
              <span>{formatSom(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--tg-hint)" }}>Yetkazib berish</span>
              <span>{deliveryFee === 0 ? "Bepul" : formatSom(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t" style={{ borderColor: "color-mix(in srgb, var(--tg-hint) 20%, transparent)" }}>
              <span>Jami</span>
              <span>{formatSom(total)}</span>
            </div>
          </div>

          <button className="btn btn-primary mt-4" onClick={() => setShowCheckout(true)}>
            Buyurtma berish
          </button>
        </>
      )}

      {showCheckout && (
        <div className="modal-overlay" onClick={() => !submitting && setShowCheckout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Buyurtma ma'lumotlari</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--tg-hint)" }}>To'lov usuli</label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border-none cursor-pointer ${paymentMethod === "naqd" ? "" : "opacity-50"}`}
                    style={{
                      background: paymentMethod === "naqd" ? "var(--tg-button)" : "var(--tg-secondary-bg)",
                      color: paymentMethod === "naqd" ? "var(--tg-button-text)" : "var(--tg-text)",
                    }}
                    onClick={() => setPaymentMethod("naqd")}
                  >
                    💵 Naqd
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border-none cursor-pointer ${paymentMethod === "online" ? "" : "opacity-50"}`}
                    style={{
                      background: paymentMethod === "online" ? "var(--tg-button)" : "var(--tg-secondary-bg)",
                      color: paymentMethod === "online" ? "var(--tg-button-text)" : "var(--tg-text)",
                    }}
                    onClick={() => setPaymentMethod("online")}
                  >
                    📱 Online
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--tg-hint)" }}>Yetkazib berish manzili</label>
                <input
                  className="input-field"
                  placeholder="Manzilni kiriting..."
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl text-sm text-red-600" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)" }}>
                  {error}
                </div>
              )}

              <button className="btn btn-primary" disabled={submitting || !deliveryLocation.trim()} onClick={handleCheckout}>
                {submitting ? "Yuborilmoqda..." : `Buyurtma qilish — ${formatSom(total)}`}
              </button>
              <button className="btn btn-outline mt-2" onClick={() => setShowCheckout(false)} disabled={submitting}>
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
