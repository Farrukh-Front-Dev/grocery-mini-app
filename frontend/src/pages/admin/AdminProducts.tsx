import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { Product, Category } from "@grocery/shared";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, uploadImage, createCategory } from "../../services/products";
import { LoadingState } from "../../components/shared/LoadingState";
import { ErrorState } from "../../components/shared/ErrorState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Modal } from "../../components/ui/modal";
import { formatSom } from "../../utils/format";

const UNITS: { value: string; label: string }[] = [
  { value: "kg", label: "kg" },
  { value: "litr", label: "litr" },
  { value: "dona", label: "dona" },
];

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", price: 0, categoryId: 0, unit: "kg" as string, step: 0.5, stockQty: 0, image: "", isActive: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", icon: "🛒" });
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", price: 0, categoryId: categories[0]?.id || 0, unit: "kg", step: 0.5, stockQty: 0, image: "", isActive: true });
    setImageFile(null);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, categoryId: p.categoryId, unit: p.unit, step: p.step, stockQty: p.stockQty, image: p.image || "", isActive: p.isActive });
    setImageFile(null);
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError("");
    try {
      let imageUrl = form.image;
      if (imageFile) {
        const result = await uploadImage(imageFile);
        imageUrl = result.url;
      }
      const payload = { ...form, unit: form.unit as "kg" | "litr" | "dona", image: imageUrl };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowModal(false);
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      await updateProduct(p.id, { isActive: !p.isActive });
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    }
  };

  const handleCatSave = async () => {
    if (!catForm.name.trim()) return;
    setCatSaving(true);
    setCatError("");
    try {
      await createCategory({ name: catForm.name, icon: catForm.icon });
      setShowCatModal(false);
      setCatForm({ name: "", icon: "🛒" });
      await load();
    } catch (e: unknown) {
      setCatError(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setCatSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm" style={{ color: "var(--tg-hint)" }}>{products.length} ta mahsulot</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowCatModal(true)}>
            Kategoriya
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} />
            Qo'shish
          </Button>
        </div>
      </div>

      {formError && (
        <div className="p-3 rounded-xl text-sm text-red-600 mb-3" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)" }}>
          {formError}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState title="Mahsulotlar yo'q" description="Yangi mahsulot qo'shing" />
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <Card key={p.id} className={`flex items-center justify-between ${!p.isActive ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: "color-mix(in srgb, var(--tg-button) 8%, transparent)" }}>🥦</div>
                )}
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--tg-hint)" }}>{formatSom(p.price)} / {p.unit} · {p.stockQty} {p.unit}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => toggleActive(p)} title={p.isActive ? "Yashirish" : "Ko'rsatish"}>
                  {p.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
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
          <Select
            label="Kategoriya"
            options={categories.map((c) => ({ value: String(c.id), label: `${c.icon} ${c.name}` }))}
            value={String(form.categoryId)}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
          />
          <Input placeholder="Narxi (so'm)" type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <Input placeholder="Stock" type="number" value={form.stockQty || ""} onChange={(e) => setForm({ ...form, stockQty: Number(e.target.value) })} />
          <Input placeholder="Qadam (step)" type="number" value={form.step} onChange={(e) => setForm({ ...form, step: Number(e.target.value) })} />
          <Select
            options={UNITS}
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
          <Input
            placeholder="Rasm URL (yoki yuklash)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
            style={{ color: "var(--tg-hint)" }}
          />
          {formError && (
            <div className="p-3 rounded-xl text-sm text-red-600" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)" }}>
              {formError}
            </div>
          )}
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

      <Modal open={showCatModal} onClose={() => setShowCatModal(false)} title="Yangi kategoriya">
        <div className="space-y-3">
          <Input placeholder="Kategoriya nomi" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
          <Input placeholder="Icon (emoji)" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} />
          {catError && (
            <div className="p-3 rounded-xl text-sm text-red-600" style={{ background: "color-mix(in srgb, var(--tg-destructive) 10%, transparent)" }}>
              {catError}
            </div>
          )}
          <div className="flex gap-2">
            <Button className="flex-1" loading={catSaving} disabled={!catForm.name.trim()} onClick={handleCatSave}>
              Saqlash
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowCatModal(false)}>
              Bekor qilish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
