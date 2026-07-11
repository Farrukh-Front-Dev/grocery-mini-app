import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Order } from "@grocery/shared";
import { getMyOrders } from "../../services/orders";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { formatSom, formatDate, statusLabel, statusBadgeClass } from "../../utils/format";

export function History() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await getMyOrders());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const active = orders.filter((o) => o.status === "yangi" || o.status === "tayyorlanmoqda");
  const completed = orders.filter((o) => o.status === "yetkazildi" || o.status === "bekor_qilindi");

  if (orders.length === 0) {
    return <EmptyState title="Buyurtmalar yo'q" description="Hali hech qanday buyurtma bermagansiz" />;
  }

  return (
    <div>
      {active.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--tg-hint)" }}>Faol buyurtmalar</h2>
          <div className="space-y-2">
            {active.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--tg-hint)" }}>Tarix</h2>
          <div className="space-y-2">
            {completed.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;

  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">#{order.id}</span>
          <span className="text-xs" style={{ color: "var(--tg-hint)" }}>{formatDate(order.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusBadgeClass(order.status) as any}>{statusLabel(order.status)}</Badge>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span style={{ color: "var(--tg-hint)" }}>{items.length} ta mahsulot</span>
        <span className="font-semibold">{formatSom(order.total)}</span>
      </div>
      {order.cancelReason && order.status === "bekor_qilindi" && (
        <p className="text-xs mt-2 text-red-500">Sabab: {order.cancelReason}</p>
      )}
      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-1" style={{ borderColor: "color-mix(in srgb, var(--tg-hint) 20%, transparent)" }}>
          {items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.productId ? `#${item.productId}` : "Mahsulot"}</span>
              <span>{item.quantity} × {formatSom(item.priceAtOrder)}</span>
            </div>
          ))}
          <div className="flex justify-between text-xs mt-2" style={{ color: "var(--tg-hint)" }}>
            <span>Yetkazib berish: {order.deliveryLocation || "Ko'rsatilmagan"}</span>
            <span>To'lov: {order.paymentMethod}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
