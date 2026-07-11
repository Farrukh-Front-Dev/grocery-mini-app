import { useEffect, useState } from "react";
import type { Product, Category } from "@grocery/shared";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from "../../services/products";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { formatSom } from "../../utils/format";

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, categoryId: 0, unit: "kg" as const, step: 0.5, stockQty: 0 });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", price: 0, categoryId: categories[0]?.id || 0, unit: "kg", step: 0.5, stockQty: 0 });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, categoryId: p.categoryId, unit: p.unit as "kg", step: p.step, stockQty: p.stockQty });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        await createProduct(form);
      }
      setShowModal(false);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm" style={{ color: "var(--tg-hint)" }}>{products.length} ta mahsulot</p>
        <button className="btn btn-primary !w-auto !px-4 !py-2" onClick={openCreate}>+ Qo'shish</button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="📦" title="Mahsulotlar yo'q" description="Yangi mahsulot qo'shing" />
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="card rounded-xl" style={{ background: "var(--tg-secondary-bg)" }}>
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{formatSom(p.price)} / {p.unit} · {p.stockQty} {p.unit}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-sm border-none bg-transparent cursor-pointer" style={{ color: "var(--tg-button)" }} onClick={() => openEdit(p)}>✏️</button>
                <button className="text-sm border-none bg-transparent cursor-pointer" onClick={() => handleDelete(p.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? "Tahrirlash" : "Yangi mahsulot"}</h2>
            <div className="space-y-3">
              <input className="input-field" placeholder="Nomi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input-field" placeholder="Narxi (so'm)" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              <input className="input-field" placeholder="Stock" type="number" value={form.stockQty || ""} onChange={(e) => setForm({ ...form, stockQty: Number(e.target.value) })} />
              <select className="select-btn" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as "kg" })}>
                <option value="kg">kg</option>
                <option value="litr">litr</option>
                <option value="dona">dona</option>
              </select>
              <div className="flex gap-2">
                <button className="btn btn-primary flex-1" disabled={saving || !form.name} onClick={handleSave}>
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button className="btn btn-outline flex-1" onClick={() => setShowModal(false)}>Bekor qilish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
