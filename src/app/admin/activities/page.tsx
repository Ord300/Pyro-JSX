"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, UserRound, Cake } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from "@/src/hooks/queries/activities";
import { useTrainers } from "@/src/hooks/queries/trainers";
import type { Activity } from "@/src/data/mockData";
import { formatAgeRange } from "@/src/data/mockData";

export default function AdminActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Activity | null>(null);
  const [form, setForm] = useState({ name: "", category: "", description: "", trainer: "", duration: "", capacity: "", priceWeek: "", priceMonth: "", priceYear: "", icon: "🏆", image: "", minAge: "", maxAge: "" });

  const { data: activitiesData = [], isLoading } = useActivities();
  const { data: trainersData = [] } = useTrainers();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  useEffect(() => { setActivities(activitiesData); }, [activitiesData]);

  // Coaches assignés à une activité : croise le champ `trainer` de l'activité
  // avec les entraîneurs qui ont cette activité dans leur liste (module Entraîneurs).
  const getCoaches = (a: Activity): string[] => {
    const fromTrainers = (trainersData ?? [])
      .filter((t) => (t.activities ?? []).includes(a.name))
      .map((t) => t.name);
    const names = [...fromTrainers];
    if (a.trainer?.trim() && !names.includes(a.trainer.trim())) names.push(a.trainer.trim());
    return names;
  };

  const filtered = activities.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      getCoaches(a).some((c) => c.toLowerCase().includes(q))
    );
  });

  const openCreate = () => { setEditItem(null); setForm({ name: "", category: "", description: "", trainer: "", duration: "", capacity: "", priceWeek: "", priceMonth: "", priceYear: "", icon: "🏆", image: "", minAge: "", maxAge: "" }); setIsModalOpen(true); };
  const openEdit = (a: Activity) => { setEditItem(a); setForm({ name: a.name, category: a.category, description: a.description, trainer: a.trainer, duration: a.duration, capacity: String(a.capacity), priceWeek: String(a.priceWeek), priceMonth: String(a.priceMonth), priceYear: String(a.priceYear), icon: a.icon, image: a.image?.startsWith("data:") || a.image?.startsWith("http") ? a.image : "", minAge: a.minAge != null ? String(a.minAge) : "", maxAge: a.maxAge != null ? String(a.maxAge) : "" }); setIsModalOpen(true); };
  const handleDelete = async (id: number) => { if (!confirm("Supprimer cette activité ?")) return; await deleteActivity.mutateAsync(id); };

  const parseAge = (v: string): number | null => {
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    if (!Number.isInteger(n) || n < 0 || n > 120) return NaN as unknown as null;
    return n;
  };

  const handleSave = async () => {
    const minAge = parseAge(form.minAge);
    const maxAge = parseAge(form.maxAge);
    if (minAge !== null && (Number.isNaN(minAge as any) || minAge! < 0)) { alert("Âge minimum invalide (0-120)."); return; }
    if (maxAge !== null && (Number.isNaN(maxAge as any) || maxAge! < 0)) { alert("Âge maximum invalide (0-120)."); return; }
    if (minAge != null && maxAge != null && (minAge as number) > (maxAge as number)) { alert("L'âge minimum ne peut pas dépasser l'âge maximum."); return; }
    try {
      if (editItem) {
        await updateActivity.mutateAsync({ id: editItem.id, data: { ...form, capacity: Number(form.capacity), priceWeek: Number(form.priceWeek), priceMonth: Number(form.priceMonth), priceYear: Number(form.priceYear), minAge, maxAge } as any });
      } else {
        await createActivity.mutateAsync({ ...form, capacity: Number(form.capacity), priceWeek: Number(form.priceWeek), priceMonth: Number(form.priceMonth), priceYear: Number(form.priceYear), minAge, maxAge } as any);
      }
      setIsModalOpen(false);
    } catch (e: any) {
      alert(e?.message || "Enregistrement impossible.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activités sportives</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activities.length} activités</p>
        </div>
        <Button onClick={openCreate} isLoading={createActivity.isPending}><Plus className="mr-2 h-4 w-4" />Nouvelle activité</Button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Rechercher…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Grille de cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((a) => (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {a.image?.startsWith("data:") || a.image?.startsWith("http") ? <img src={a.image} alt={a.name} className="h-28 w-full object-cover" /> : <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-5xl dark:from-primary-900/20 dark:to-primary-800/20">{a.icon}</div>}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{a.name}</h3>
                  <Badge variant="default" className="mt-1 text-xs bg-slate-100 dark:bg-slate-800">{a.category}</Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{a.description}</p>
              {formatAgeRange(a) && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                  <Cake className="h-3 w-3" />{formatAgeRange(a)}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-800">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[10px] font-bold text-white">
                  {getCoaches(a).length > 0 ? getCoaches(a)[0].split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : <UserRound className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Coach assigné</p>
                  {getCoaches(a).length > 0 ? (
                    <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200" title={getCoaches(a).join(", ")}>
                      {getCoaches(a).join(", ")}
                    </p>
                  ) : (
                    <p className="text-xs italic text-slate-400">Aucun coach assigné</p>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1 text-xs text-center">
                <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-1.5"><p className="font-bold text-primary-600">${a.priceWeek}</p><p className="text-slate-400">sem.</p></div>
                <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-1.5"><p className="font-bold text-primary-600">${a.priceMonth}</p><p className="text-slate-400">mois</p></div>
                <div className="rounded-md bg-slate-50 dark:bg-slate-800 p-1.5"><p className="font-bold text-primary-600">${a.priceYear}</p><p className="text-slate-400">an</p></div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => openEdit(a)} isLoading={updateActivity.isPending}>
                  <Edit2 className="mr-1 h-3 w-3" />Modifier
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(a.id)} isLoading={deleteActivity.isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Créer/Modifier */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? "Modifier l'activité" : "Nouvelle activité"} className="max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: "name", label: "Nom", placeholder: "Football" },
            { id: "category", label: "Catégorie", placeholder: "Sport collectif" },
            { id: "duration", label: "Durée", placeholder: "90 min" },
            { id: "capacity", label: "Capacité", placeholder: "22" },
            { id: "icon", label: "Icône (emoji)", placeholder: "⚽" },
          ].map(({ id, label, placeholder }) => (
            <div key={id} className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
              <Input placeholder={placeholder} value={(form as any)[id]} onChange={(e) => setForm({ ...form, [id]: e.target.value })} />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Coach assigné</label>
            <select
              value={form.trainer}
              onChange={(e) => setForm({ ...form, trainer: e.target.value })}
              className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:text-slate-50 dark:bg-slate-900"
            >
              <option value="">— Aucun coach —</option>
              {trainersData.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} — {t.specialty}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400">Ou assignez cette activité depuis le module Entraîneurs.</p>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de l'activité…"
              className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:text-slate-50 resize-none" />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Image de l'activité</label>
            <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) })); reader.readAsDataURL(file); }} className="block w-full rounded-lg border border-slate-300 text-sm file:mr-3 file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 dark:border-slate-700 dark:file:bg-primary-900/30 dark:file:text-primary-300" />
            {form.image && <img src={form.image} alt="Aperçu de l'activité" className="h-32 w-full rounded-lg object-cover" />}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prix / semaine ($)</label>
            <Input type="number" value={form.priceWeek} onChange={(e) => setForm({ ...form, priceWeek: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prix / mois ($)</label>
            <Input type="number" value={form.priceMonth} onChange={(e) => setForm({ ...form, priceMonth: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Âge min. d'inscription <span className="font-normal text-slate-400">(optionnel)</span></label>
            <Input type="number" min={0} max={120} placeholder="Ex : 5" value={form.minAge} onChange={(e) => setForm({ ...form, minAge: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Âge max. d'inscription <span className="font-normal text-slate-400">(optionnel)</span></label>
            <Input type="number" min={0} max={120} placeholder="Ex : 20" value={form.maxAge} onChange={(e) => setForm({ ...form, maxAge: e.target.value })} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prix / an ($)</label>
            <Input type="number" value={form.priceYear} onChange={(e) => setForm({ ...form, priceYear: e.target.value })} />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button className="flex-1" onClick={handleSave} isLoading={editItem ? updateActivity.isPending : createActivity.isPending}>{editItem ? "Enregistrer" : "Créer"}</Button>
        </div>
      </Modal>
    </div>
  );
}