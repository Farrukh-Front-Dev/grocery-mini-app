import { useEffect, useState } from "react";
import type { Order, Expense } from "@grocery/shared";
import { getAllOrders } from "../../services/orders";
import { getExpenses } from "../../services/finance";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { formatSom, formatDate, statusLabel, statusBadgeClass } from "../../utils/format";

export function AdminHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"all" | "completed" | "cancelled">("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [ords, exps] = await Promise.all([getAllOrders(), getExpenses()]);
      setOrders(ords);
      setExpenses(exps);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const completed = orders.filter((o) => o.status === "yetkazildi");
  const cancelled = orders.filter((o) => o.status === "bekor_qilindi");
  const filtered = tab === "completed" ? completed : tab === "cancelled" ? cancelled : orders;
  const items: ({ type: "order" } & Order)[] = filtered.map((o) => ({ ...o, type: "order" as const }));

  const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[
          { id: "all" as const, label: "Barcha", count: orders.length },
          { id: "completed" as const, label: "Yetkazilgan", count: completed.length },
          { id: "cancelled" as const, label: "Bekor qilingan", count: cancelled.length },
        ].map((t) => (
          <Button
            key={t.id}
            className="flex-1"
            variant={tab === t.id ? "primary" : "outline"}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label} ({t.count})
          </Button>
        ))}
      </div>

      {sorted.length === 0 && expenses.length === 0 ? (
        <EmptyState title="Tarix yo'q" description="Hali hech qanday ma'lumot yo'q" />
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => (
            <Card key={`order-${item.id}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">Buyurtma #{item.id}</span>
                <Badge variant={statusBadgeClass(item.status) as any}>{statusLabel(item.status)}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--tg-hint)" }}>{formatDate(item.createdAt)}</span>
                <span className="font-semibold">{formatSom(item.total)}</span>
              </div>
              {item.cancelReason && <p className="text-xs mt-1 text-red-500">Sabab: {item.cancelReason}</p>}
            </Card>
          ))}

          {tab === "all" && expenses.map((e) => (
            <Card key={`expense-${e.id}`} className="" style={{ background: "color-mix(in srgb, var(--tg-destructive) 8%, transparent)" }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Xarajat</span>
                <span className="text-sm font-semibold" style={{ color: "var(--tg-destructive)" }}>-{formatSom(e.amount)}</span>
              </div>
              <p className="text-sm">{e.description}</p>
              <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{formatDate(e.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
