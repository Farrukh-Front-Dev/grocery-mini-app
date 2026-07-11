import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Product, Category } from "@grocery/shared";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from "../../services/products";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Modal } from "../../components/ui/modal";
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
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} />
          Qo'shish
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState title="Mahsulotlar yo'q" description="Yangi mahsulot qo'shing" />
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{formatSom(p.price)} / {p.unit} · {p.stockQty} {p.unit}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil size={16} /></Button>
                <Button variant="ghost" size="icon" style={{ color: "var(--tg-destructive)" }} onClick={() => handleDelete(p.id)}><Trash2 size={16} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Tahrirlash" : "Yangi mahsulot"}>
        <div className="space-y-3">
          <Input placeholder="Nomi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Narxi (so'm)" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <Input placeholder="Stock" type="number" value={form.stockQty || ""} onChange={(e) => setForm({ ...form, stockQty: Number(e.target.value) })} />
          <Select
            options={[
              { value: "kg", label: "kg" },
              { value: "litr", label: "litr" },
              { value: "dona", label: "dona" },
            ]}
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value as "kg" })}
          />
          <div className="flex gap-2">
            <Button className="flex-1" loading={saving} disabled={!form.name} onClick={handleSave}>
              Saqlash
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
              Bekor qilish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
