"use client";

import { useMemo, useState, useEffect } from "react";
import { Minus, Package, Plus, Search, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { productsDB } from "@/src/services/dbService";
import { DB_KEYS_EXPORT } from "@/src/services/dbService";

type Equipment = { id: number; name: string; category: string; price: number; stock: number; image?: string };

const initialEquipment: Equipment[] = [
  { id: 1, name: "Ballon de football", category: "Sports collectifs", price: 25, stock: 18 },
  { id: 2, name: "Tapis de yoga", category: "Fitness", price: 18, stock: 9 },
  { id: 3, name: "Gants de boxe", category: "Combat", price: 35, stock: 6 },
  { id: 4, name: "Bouteille isotherme", category: "Accessoires", price: 12, stock: 24 },
  { id: 5, name: "Corde à sauter", category: "Fitness", price: 10, stock: 3 },
  { id: 6, name: "Serviette sport", category: "Accessoires", price: 8, stock: 15 },
];

export default function AdminEquipment() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Equipment | null>(null);
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "", image: "" });
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    setEquipment(productsDB.getAll<Equipment>());
    const onChange = () => setEquipment(productsDB.getAll<Equipment>());
    window.addEventListener("db-change", onChange as any);
    return () => window.removeEventListener("db-change", onChange as any);
  }, []);

  const filtered = useMemo(
    () => equipment.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())),
    [equipment, search]
  );

  const increaseStock = (id: number, amount = 1) => {
    const item = equipment.find((i: any) => i.id === id);
    if (!item) return;
    const newStock = Math.max(0, (item.stock || 0) + amount);
    productsDB.update(id, { stock: newStock });
    setEquipment((eq) => eq.map((i: any) => i.id === id ? { ...i, stock: newStock } : i));
  };
  const decreaseStock = (id: number, amount = 1) => {
    const item = equipment.find((i: any) => i.id === id);
    if (!item) return;
    const newStock = Math.max(0, (item.stock || 0) - amount);
    productsDB.update(id, { stock: newStock });
    setEquipment((eq) => eq.map((i: any) => i.id === id ? { ...i, stock: newStock } : i));
  };
  const removeEquipment = (id: number) => {
    productsDB.delete(id);
    setEquipment((eq) => eq.filter((i: any) => i.id !== id));
  };

  const openCreate = () => { setEditItem(null); setForm({ name: "", category: "", price: "", stock: "", image: "" }); setIsCreateOpen(true); };
  const openEdit = (item: Equipment) => { setEditItem(item); setForm({ name: item.name, category: item.category, price: String(item.price), stock: String(item.stock), image: item.image || "" }); setIsCreateOpen(true); };

  const submitForm = () => {
    if (!form.name.trim() || !form.category.trim() || Number(form.price) <= 0 || Number(form.stock) < 0) return;
    const newItem: Equipment = { id: Date.now(), name: form.name.trim(), category: form.category.trim(), price: Number(form.price), stock: Number(form.stock), image: form.image || undefined };
    if (editItem) {
      setEquipment((eq) => eq.map((i: any) => i.id === editItem.id ? newItem : i));
    } else {
      setEquipment((current) => [...current, newItem]);
    }
    productsDB.create(newItem);
    setIsCreateOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des équipements</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ajoutez, éditez et gérez les stocks des équipements.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default">{equipment.reduce((sum, item) => sum + item.stock, 0)} unités en stock</Badge>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Rechercher un équipement…" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.id} className="overflow-hidden p-4 hover:shadow-lg transition">
            <div className="flex items-center gap-4">
              {item.image ? <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"><Package className="h-10 w-10 text-slate-400" /></div>}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-slate-900 dark:text-white">{item.name}</h2>
                  <Badge variant={item.stock <= 5 ? "warning" : "success"}>{item.stock} en stock</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                <p className="mt-3 text-lg font-bold text-primary-600">{item.price.toFixed(2)} USD</p>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => decreaseStock(item.id)}><Minus className="h-4 w-4" /></Button>
                  <Button size="icon" onClick={() => increaseStock(item.id)}><Plus className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeEquipment(item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setEditItem(null); }} title={editItem ? "Modifier l'équipement" : "Ajouter un équipement"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">Nom de l'équipement</label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex. Vélo elliptique" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Catégorie</label>
            <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Ex. Cardio" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Photo de la machine</label>
            <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) })); reader.readAsDataURL(file); }} className="block w-full rounded-lg border border-slate-300 text-sm file:mr-3 file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 dark:border-slate-700 dark:file:bg-primary-900/30 dark:file:text-primary-300" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Prix (USD)</label>
            <Input type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantité en stock</label>
            <Input type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
          </div>
          {form.image && <div className="sm:col-span-2"><p className="mb-1 text-sm font-medium">Aperçu</p><img src={form.image} alt="Aperçu de l'équipement" className="h-36 w-full rounded-lg object-cover" /></div>}
        </div>
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <Button variant="outline" className="flex-1" onClick={() => { setIsCreateOpen(false); setEditItem(null); }}>Annuler</Button>
          <Button className="flex-1" onClick={submitForm}>{editItem ? "Enregistrer" : "Ajouter"}</Button>
        </div>
      </Modal>
    </div>
  );
}