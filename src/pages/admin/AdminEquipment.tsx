import React, { useMemo, useState } from 'react';
import { Minus, Package, Plus, Search, ShoppingCart } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

type Equipment = { id: number; name: string; category: string; price: number; stock: number; image?: string };

const initialEquipment: Equipment[] = [
  { id: 1, name: 'Ballon de football', category: 'Sports collectifs', price: 25, stock: 18 },
  { id: 2, name: 'Tapis de yoga', category: 'Fitness', price: 18, stock: 9 },
  { id: 3, name: 'Gants de boxe', category: 'Combat', price: 35, stock: 6 },
  { id: 4, name: 'Bouteille isotherme', category: 'Accessoires', price: 12, stock: 24 },
  { id: 5, name: 'Corde à sauter', category: 'Fitness', price: 10, stock: 3 },
  { id: 6, name: 'Serviette sport', category: 'Accessoires', price: 8, stock: 15 },
];

export function AdminEquipment() {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [saleMessage, setSaleMessage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customer, setCustomer] = useState('');
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', image: '' });
  const filtered = useMemo(() => equipment.filter(item => item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())), [equipment, search]);
  const total = equipment.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);
  const itemsCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  const changeQuantity = (item: Equipment, change: number) => {
    const quantity = Math.max(0, Math.min(item.stock, (cart[item.id] || 0) + change));
    setCart(current => ({ ...current, [item.id]: quantity }));
    setSaleMessage('');
  };
  const confirmSale = () => {
    if (!itemsCount || !customer.trim()) return;
    setEquipment(items => items.map(item => ({ ...item, stock: item.stock - (cart[item.id] || 0) })));
    setCart({});
    setSaleMessage(`Vente enregistrée pour ${customer} : ${itemsCount} article(s) pour ${total.toFixed(2)} USD.`);
    setCustomer('');
  };
  const createEquipment = () => {
    if (!form.name.trim() || !form.category.trim() || Number(form.price) <= 0 || Number(form.stock) < 0) return;
    setEquipment(current => [...current, { id: Date.now(), name: form.name.trim(), category: form.category.trim(), price: Number(form.price), stock: Number(form.stock), image: form.image || undefined }]);
    setForm({ name: '', category: '', price: '', stock: '', image: '' });
    setIsCreateOpen(false);
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Équipements à vendre</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sélectionnez les articles et enregistrez une vente au comptoir.</p></div>
      <div className="flex items-center gap-3"><Badge variant="default">{equipment.reduce((sum, item) => sum + item.stock, 0)} unités en stock</Badge><Button onClick={() => setIsCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Ajouter un équipement</Button></div>
    </div>
    {saleMessage && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">{saleMessage}</div>}
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div><div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={event => setSearch(event.target.value)} className="pl-9" placeholder="Rechercher un équipement…" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(item => <Card key={item.id} className="overflow-hidden p-4"><div className="flex items-start justify-between gap-3">{item.image ? <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"><Package className="h-8 w-8 text-slate-400" /></div>}<Badge variant={item.stock <= 5 ? 'warning' : 'success'}>{item.stock} en stock</Badge></div><h2 className="mt-4 font-semibold text-slate-900 dark:text-white">{item.name}</h2><p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p><p className="mt-3 text-lg font-bold text-primary-600">{item.price.toFixed(2)} USD</p><div className="mt-3 flex items-center justify-between"><Button size="icon" variant="outline" onClick={() => changeQuantity(item, -1)} disabled={!cart[item.id]}><Minus className="h-4 w-4" /></Button><span className="font-semibold text-slate-900 dark:text-white">{cart[item.id] || 0}</span><Button size="icon" onClick={() => changeQuantity(item, 1)} disabled={item.stock === 0 || (cart[item.id] || 0) >= item.stock}><Plus className="h-4 w-4" /></Button></div></Card>)}</div>
      </div>
      <Card className="h-fit p-5 xl:sticky xl:top-0"><div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Vente au client</h2></div><div className="mt-4"><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Client</label><Input value={customer} onChange={event => setCustomer(event.target.value)} placeholder="Nom du client…" /></div><div className="mt-5 space-y-3">{equipment.filter(item => cart[item.id]).map(item => <div key={item.id} className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">{cart[item.id]} × {item.name}</span><span className="font-medium text-slate-900 dark:text-white">{(item.price * cart[item.id]).toFixed(2)} $</span></div>)}{!itemsCount && <div className="py-8 text-center text-sm text-slate-500"><Package className="mx-auto mb-2 h-8 w-8 text-slate-300" />Aucun article sélectionné</div>}</div><div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700"><div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white"><span>Total</span><span>{total.toFixed(2)} USD</span></div><Button className="mt-4 w-full" disabled={!itemsCount || !customer.trim()} onClick={confirmSale}>Valider la vente</Button></div></Card>
    </div>
    <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Ajouter un équipement">
      <div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium">Nom de l'équipement</label><Input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Ex. Vélo elliptique" /></div><div><label className="mb-1 block text-sm font-medium">Catégorie</label><Input value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="Ex. Cardio" /></div><div><label className="mb-1 block text-sm font-medium">Photo de la machine</label><input type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm(current => ({ ...current, image: String(reader.result) })); reader.readAsDataURL(file); }} className="block w-full rounded-lg border border-slate-300 text-sm file:mr-3 file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 dark:border-slate-700 dark:file:bg-primary-900/30 dark:file:text-primary-300" /></div><div><label className="mb-1 block text-sm font-medium">Prix de vente (USD)</label><Input type="number" min="0" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} /></div><div><label className="mb-1 block text-sm font-medium">Quantité en stock</label><Input type="number" min="0" value={form.stock} onChange={event => setForm({ ...form, stock: event.target.value })} /></div>{form.image && <div className="sm:col-span-2"><p className="mb-1 text-sm font-medium">Aperçu</p><img src={form.image} alt="Aperçu de l'équipement" className="h-36 w-full rounded-lg object-cover" /></div>}</div><div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900"><Button variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>Annuler</Button><Button className="flex-1" onClick={createEquipment} disabled={!form.name.trim() || !form.category.trim() || Number(form.price) <= 0 || form.stock === ''}>Créer l'équipement</Button></div>
    </Modal>
  </div>;
}
