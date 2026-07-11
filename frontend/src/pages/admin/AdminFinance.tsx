import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getFinanceSummary, getExpenses, createExpense } from "../../services/finance";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Modal } from "../../components/ui/modal";
import { formatSom, formatDate } from "../../utils/format";

export function AdminFinance() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, profit: 0, orderCount: 0 });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [sum, exps] = await Promise.all([getFinanceSummary(), getExpenses()]);
      setSummary(sum);
      setExpenses(exps);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAddExpense = async () => {
    if (!desc || amount <= 0) return;
    setSaving(true);
    try {
      await createExpense({ description: desc, amount });
      setShowExpenseForm(false);
      setDesc("");
      setAmount(0);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-4" style={{ background: "color-mix(in srgb, var(--tg-success) 10%, transparent)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--tg-hint)" }}>Daromad</p>
          <p className="text-lg font-bold" style={{ color: "var(--tg-success)" }}>{formatSom(summary.totalIncome)}</p>
          <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{summary.orderCount} ta buyurtma</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--tg-hint)" }}>Xarajat</p>
          <p className="text-lg font-bold" style={{ color: "var(--tg-destructive)" }}>{formatSom(summary.totalExpenses)}</p>
        </div>
      </div>

      <Card className="mb-4">
        <p className="text-xs mb-1" style={{ color: "var(--tg-hint)" }}>Sof foyda</p>
        <p className="text-2xl font-bold" style={{ color: summary.profit >= 0 ? "var(--tg-success)" : "var(--tg-destructive)" }}>
          {formatSom(summary.profit)}
        </p>
      </Card>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--tg-hint)" }}>Xarajatlar tarixi</h2>
        <Button size="sm" onClick={() => setShowExpenseForm(true)}>
          <Plus size={16} />
          Qo'shish
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="Xarajatlar yo'q" description="Hali hech qanday xarajat qo'shilmagan" />
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <Card key={e.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{e.description}</p>
                <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{formatDate(e.createdAt)}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--tg-destructive)" }}>-{formatSom(e.amount)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showExpenseForm} onClose={() => setShowExpenseForm(false)} title="Xarajat qo'shish">
        <div className="space-y-3">
          <Input placeholder="Tavsif" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Input placeholder="Summa (so'm)" type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
          <div className="flex gap-2">
            <Button className="flex-1" loading={saving} disabled={!desc || amount <= 0} onClick={handleAddExpense}>
              Saqlash
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowExpenseForm(false)}>
              Bekor qilish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
