import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import type { Order } from "@grocery/shared";
import { getAllOrders, updateOrderStatus } from "../../services/orders";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Modal } from "../../components/ui/modal";
import { formatSom, formatDate, statusLabel, statusBadgeClass } from "../../utils/format";
import { usePolling } from "../../hooks/usePolling";

const STATUS_COLORS: Record<string, string> = {
  yangi: "badge-blue",
  tayyorlanmoqda: "badge-yellow",
  yetkazildi: "badge-green",
  bekor_qilindi: "badge-red",
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await getAllOrders());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  usePolling(load, 8000);

  const handleStatus = async (id: number, status: string) => {
    let reason: string | undefined;
    if (status === "bekor_qilindi") {
      reason = window.prompt("Bekor qilish sababi:") || undefined;
      if (!reason) return;
    }

    setUpdating(true);
    setActionError("");
    try {
      await updateOrderStatus(id, status, reason);
      setSelected(null);
      await load();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const statusOrder = ["yangi", "tayyorlanmoqda", "yetkazildi", "bekor_qilindi"];
  const sorted = [...orders].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

  if (orders.length === 0) {
    return <EmptyState title="Buyurtmalar yo'q" description="Hali hech qanday buyurtma kelmagan" />;
  }

  return (
    <div>
      <p className="text-sm mb-3" style={{ color: "var(--tg-hint)" }}>{orders.length} ta buyurtma</p>
      <div className="space-y-2">
        {sorted.map((o) => (
          <Card
            key={o.id}
            className="cursor-pointer"
            onClick={() => setSelected(o)}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold">#{o.id}</span>
              <Badge variant={(STATUS_COLORS[o.status] || statusBadgeClass(o.status)) as any}>{statusLabel(o.status)}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--tg-hint)" }}>{formatDate(o.createdAt)}</span>
              <span className="font-semibold">{formatSom(o.total)}</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => !updating && setSelected(null)} title={`Buyurtma #${selected?.id}`}>
        {selected && (
          <div>
            <p className="text-sm mb-2" style={{ color: "var(--tg-hint)" }}>{formatDate(selected.createdAt)}</p>

            <div className="p-3 rounded-xl mb-3 text-sm space-y-1" style={{ background: "color-mix(in srgb, var(--tg-hint) 8%, transparent)" }}>
              <p><strong>Mijoz ID:</strong> #{selected.userId}</p>
              <p><strong>Manzil:</strong> {selected.deliveryLocation || "Ko'rsatilmagan"}</p>
              <p><strong>To'lov:</strong> {selected.paymentMethod === "naqd" ? "Naqd" : "Online"}</p>
              {selected.cancelReason && <p className="text-red-500"><strong>Sabab:</strong> {selected.cancelReason}</p>}
            </div>

            <div className="space-y-2 mb-4">
              {(() => {
                const items = typeof selected.items === "string" ? JSON.parse(selected.items) : selected.items;
                return items.map((item: { productId: number; quantity: number; priceAtOrder: number }, i: number) => (
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

            {actionError && (
              <div className="p-3 rounded-xl text-sm text-red-600 mb-3" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)" }}>
                {actionError}
              </div>
            )}

            {(selected.status === "yangi" || selected.status === "tayyorlanmoqda") && (
              <>
                {selected.status === "yangi" && (
                  <Button className="w-full mb-2" loading={updating} onClick={() => handleStatus(selected.id, "tayyorlanmoqda")}>
                    Tayyorlanmoqda
                  </Button>
                )}
                {selected.status === "tayyorlanmoqda" && (
                  <Button className="w-full mb-2" loading={updating} onClick={() => handleStatus(selected.id, "yetkazildi")}>
                    Yetkazildi
                  </Button>
                )}
                <Button variant="outline" className="w-full" loading={updating} onClick={() => handleStatus(selected.id, "bekor_qilindi")}>
                  <X size={16} />
                  Bekor qilish
                </Button>
              </>
            )}
            <Button variant="outline" className="w-full mt-2" onClick={() => setSelected(null)}>
              Yopish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
