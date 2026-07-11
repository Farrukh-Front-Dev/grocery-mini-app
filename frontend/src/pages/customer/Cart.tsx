import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Product } from "@grocery/shared";
import { useCartStore } from "../../store/cart";
import { getProducts } from "../../services/products";
import { createOrder } from "../../services/orders";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Modal } from "../../components/ui/modal";
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
        <EmptyState title="Savatcha bo'sh" description="Mahsulot qo'shish uchun do'konga o'ting" />
      ) : (
        <>
          <div className="space-y-1">
            {cartProducts.map((cp) => (
              <Card key={cp.id} className="flex items-center justify-between gap-3">
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
                    className="border-none bg-transparent cursor-pointer p-1"
                    style={{ color: "var(--tg-destructive)" }}
                    onClick={() => remove(cp.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
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
          </Card>

          <Button className="mt-4 w-full" onClick={() => setShowCheckout(true)}>
            Buyurtma berish
          </Button>
        </>
      )}

      <Modal open={showCheckout} onClose={() => !submitting && setShowCheckout(false)} title="Buyurtma ma'lumotlari">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--tg-hint)" }}>To'lov usuli</p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant={paymentMethod === "naqd" ? "primary" : "outline"}
                onClick={() => setPaymentMethod("naqd")}
              >
                Naqd
              </Button>
              <Button
                className="flex-1"
                variant={paymentMethod === "online" ? "primary" : "outline"}
                onClick={() => setPaymentMethod("online")}
              >
                Online
              </Button>
            </div>
          </div>

          <Input
            label="Yetkazib berish manzili"
            placeholder="Manzilni kiriting..."
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
          />

          {error && (
            <div className="p-3 rounded-xl text-sm text-red-600" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)" }}>
              {error}
            </div>
          )}

          <Button className="w-full" loading={submitting} disabled={!deliveryLocation.trim()} onClick={handleCheckout}>
            Buyurtma qilish — {formatSom(total)}
          </Button>
          <Button variant="outline" className="w-full mt-2" onClick={() => setShowCheckout(false)} disabled={submitting}>
            Bekor qilish
          </Button>
        </div>
      </Modal>
    </div>
  );
}
