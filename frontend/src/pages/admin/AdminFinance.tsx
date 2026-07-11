import { useEffect, useState } from "react";
import { getFinanceSummary, getExpenses, createExpense } from "../../services/finance";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
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

      <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--tg-secondary-bg)" }}>
        <p className="text-xs mb-1" style={{ color: "var(--tg-hint)" }}>Sof foyda</p>
        <p className="text-2xl font-bold" style={{ color: summary.profit >= 0 ? "var(--tg-success)" : "var(--tg-destructive)" }}>
          {formatSom(summary.profit)}
        </p>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--tg-hint)" }}>Xarajatlar tarixi</h2>
        <button className="btn btn-primary !w-auto !px-4 !py-2" onClick={() => setShowExpenseForm(true)}>+ Qo'shish</button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon="💰" title="Xarajatlar yo'q" description="Hali hech qanday xarajat qo'shilmagan" />
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="card rounded-xl" style={{ background: "var(--tg-secondary-bg)" }}>
              <div>
                <p className="text-sm font-medium">{e.description}</p>
                <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{formatDate(e.createdAt)}</p>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--tg-destructive)" }}>-{formatSom(e.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {showExpenseForm && (
        <div className="modal-overlay" onClick={() => setShowExpenseForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Xarajat qo'shish</h2>
            <div className="space-y-3">
              <input className="input-field" placeholder="Tavsif" value={desc} onChange={(e) => setDesc(e.target.value)} />
              <input className="input-field" placeholder="Summa (so'm)" type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
              <div className="flex gap-2">
                <button className="btn btn-primary flex-1" disabled={saving || !desc || amount <= 0} onClick={handleAddExpense}>
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button className="btn btn-outline flex-1" onClick={() => setShowExpenseForm(false)}>Bekor qilish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
