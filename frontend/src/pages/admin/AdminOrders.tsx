import { useEffect, useState } from "react";
import type { Order } from "@grocery/shared";
import { getAllOrders, updateOrderStatus } from "../../services/orders";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { formatSom, formatDate, statusLabel, statusBadgeClass } from "../../utils/format";

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await getAllOrders());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: number, status: string) => {
    const reason = status === "bekor_qilindi" ? prompt("Bekor qilish sababi:") : undefined;
    if (status === "bekor_qilindi" && !reason) return;

    setUpdating(true);
    try {
      await updateOrderStatus(id, status, reason || undefined);
      setSelected(null);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const statusOrder = ["yangi", "tayyorlanmoqda", "yetkazildi", "bekor_qilindi"];
  const sorted = [...orders].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

  if (orders.length === 0) {
    return <EmptyState icon="📋" title="Buyurtmalar yo'q" description="Hali hech qanday buyurtma kelmagan" />;
  }

  return (
    <div>
      <p className="text-sm mb-3" style={{ color: "var(--tg-hint)" }}>{orders.length} ta buyurtma</p>
      <div className="space-y-2">
        {sorted.map((o) => (
          <div
            key={o.id}
            className="rounded-2xl p-4 cursor-pointer"
            style={{ background: "var(--tg-secondary-bg)" }}
            onClick={() => setSelected(o)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold">#{o.id}</span>
              <span className={`badge ${statusBadgeClass(o.status)}`}>{statusLabel(o.status)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--tg-hint)" }}>{formatDate(o.createdAt)}</span>
              <span className="font-semibold">{formatSom(o.total)}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => !updating && setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-1">Buyurtma #{selected.id}</h2>
            <p className="text-sm mb-4" style={{ color: "var(--tg-hint)" }}>{formatDate(selected.createdAt)}</p>

            <div className="space-y-2 mb-4">
              {(() => {
                const items = typeof selected.items === "string" ? JSON.parse(selected.items) : selected.items;
                return items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>#{item.productId} × {item.quantity}</span>
                    <span>{formatSom(item.priceAtOrder * item.quantity)}</span>
                  </div>
                ));
              })()}
              <div className="border-t pt-2 flex justify-between font-semibold" style={{ borderColor: "color-mix(in srgb, var(--tg-hint) 20%, transparent)" }}>
                <span>Jami</span>
                <span>{formatSom(selected.total)}</span>
              </div>
            </div>

            <div className="text-sm mb-4 space-y-1" style={{ color: "var(--tg-hint)" }}>
              <p>📍 Manzil: {selected.deliveryLocation || "Ko'rsatilmagan"}</p>
              <p>💳 To'lov: {selected.paymentMethod}</p>
              {selected.cancelReason && <p className="text-red-500">❌ Sabab: {selected.cancelReason}</p>}
            </div>

            {selected.status === "yangi" && (
              <button className="btn btn-primary mb-2" disabled={updating} onClick={() => handleStatus(selected.id, "tayyorlanmoqda")}>
                ✅ Tayyorlanmoqda
              </button>
            )}
            {selected.status === "tayyorlanmoqda" && (
              <>
                <button className="btn btn-primary mb-2" disabled={updating} onClick={() => handleStatus(selected.id, "yetkazildi")}>
                  ✅ Yetkazildi
                </button>
                <button className="btn btn-outline" disabled={updating} onClick={() => handleStatus(selected.id, "bekor_qilindi")}>
                  ❌ Bekor qilish
                </button>
              </>
            )}
            <button className="btn btn-outline mt-2" onClick={() => setSelected(null)}>
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
