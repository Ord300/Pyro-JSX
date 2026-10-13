"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Search, Eye, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/Table";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/src/hooks/queries/users";
import { useSubscriptions } from "@/src/hooks/queries/subscriptions";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDynamicStatus, getDaysLeft } from "@/src/utils/subscriptionStatus";
import { confirmAction } from "@/src/components/ui/confirm";

const subscriberSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), status: z.enum(["Actif", "Suspendu", "Inactif"]).default("Actif") });
type SubscriberForm = z.input<typeof subscriberSchema>;

const statusVariant = (s: string) =>
  s === "Validée" ? "success" : s === "Expirée" ? "danger" : s === "Annulée" ? "danger" : s === "Sans abonnement" ? "default" : "default";

const dynamicOfSub = (sub: any | null | undefined): string => {
  if (!sub) return "Sans abonnement";
  return getDynamicStatus(sub);
};

export default function AdminSubscribers() {
  const { data: users = [] } = useUsers();
  const { data: subscriptions = [] } = useSubscriptions();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const subscribers = users.filter((u) => u.role === "Abonné");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubscriberForm>({ resolver: zodResolver(subscriberSchema) });

  useEffect(() => { if (!isModalOpen) reset(); }, [isModalOpen, reset]);

  const openCreate = () => { setEditItem(null); reset({ name: "", email: "", phone: "", status: "Actif" }); setIsModalOpen(true); };
  const openEdit = (u: any) => { setEditItem(u); reset({ name: u.name, email: u.email, phone: u.phone || "", status: u.status || "Actif" }); setIsModalOpen(true); };

  const onSubmit = async (data: SubscriberForm) => {
    if (editItem) {
      await updateUser.mutateAsync({ id: editItem.id, data: { ...data } });
    } else {
      await createUser.mutateAsync({ ...data, role: "Abonné", status: data.status || "Actif" });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => { if (!(await confirmAction({ title: "Supprimer l'abonné", message: "Supprimer cet abonné ?", confirmLabel: "Supprimer" }))) return; await deleteUser.mutateAsync(id); };

  // Abonnement le plus récent par email + statut dynamique (comme côté coach)
  const subByEmail = useMemo(() => {
    const map = new Map<string, any>();
    const sorted = [...(subscriptions as any[])].sort((a, b) => String(b.endDate || "").localeCompare(String(a.endDate || "")));
    for (const s of sorted) {
      const key = String(s.email || "").toLowerCase();
      if (key && !map.has(key)) map.set(key, s);
    }
    return map;
  }, [subscriptions]);

  const enriched = useMemo(
    () => subscribers.map((u) => {
      const sub = subByEmail.get(String(u.email || "").toLowerCase()) ?? null;
      return { user: u, sub, dyn: dynamicOfSub(sub) };
    }),
    [subscribers, subByEmail]
  );

  const counts = useMemo(() => ({
    total: enriched.length,
    valides: enriched.filter((e) => e.dyn === "Validée").length,
    expires: enriched.filter((e) => e.dyn === "Expirée").length,
    sans: enriched.filter((e) => e.dyn === "Sans abonnement").length,
  }), [enriched]);

  const filtered = enriched.filter(({ user, dyn }) => {
    if (statusFilter !== "Tous" && dyn !== statusFilter) return false;
    const q = search.toLowerCase();
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Abonnés</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {counts.total} abonné(s)
            {" · "}
            <span className="font-semibold text-green-600 dark:text-green-400">{counts.valides} actif(s)</span>
            {" · "}
            <span className="font-semibold text-red-600 dark:text-red-400">{counts.expires} expiré(s)</span>
            {counts.sans > 0 && <span className="text-slate-400"> · {counts.sans} sans abonnement</span>}
          </p>
        </div>
        <Button onClick={openCreate} isLoading={createUser.isPending}><Plus className="mr-2 h-4 w-4" />Nouvel abonné</Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Rechercher par nom ou email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {[["Tous", counts.total], ["Validée", counts.valides], ["Expirée", counts.expires], ["Sans abonnement", counts.sans]].map(([s, n]) => (
              <button
                key={String(s)}
                onClick={() => setStatusFilter(String(s))}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}
              >
                {String(s)} ({Number(n)})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Abonné</TableHead>
              <TableHead>Activité / Formule</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Statut abonnement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-slate-400">Aucun abonné trouvé.</TableCell></TableRow>
            ) : filtered.map(({ user: u, sub, dyn }) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      {(u.name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email} • {u.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {sub ? <>{sub.activityName} <span className="text-slate-400">· {sub.planName}</span></> : <span className="text-slate-400">—</span>}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {sub ? `${sub.startDate} → ${sub.endDate}` : <span className="text-slate-400">—</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(dyn) as any}>{dyn}</Badge>
                  {dyn === "Expirée" && sub && (
                    <p className="mt-1 text-[11px] text-red-500">Expiré le {sub.endDate}</p>
                  )}
                  {dyn === "Validée" && sub && (
                    <p className="mt-1 text-[11px] text-green-600 dark:text-green-400">{getDaysLeft(sub)} jour(s) restant(s)</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Voir" onClick={() => setViewItem({ user: u, sub, dyn })}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Modifier" onClick={() => openEdit(u)} isLoading={updateUser.isPending}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" title="Supprimer" onClick={() => handleDelete(u.id)} isLoading={deleteUser.isPending}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Fiche abonné">
        {viewItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {(viewItem.user.name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewItem.user.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(viewItem.dyn) as any}>{viewItem.dyn}</Badge>
                  {viewItem.dyn === "Expirée" && viewItem.sub && (
                    <span className="text-xs text-red-500">Expiré le {viewItem.sub.endDate}</span>
                  )}
                </div>
              </div>
            </div>
            {[
              ["Email", viewItem.user.email],
              ["Téléphone", viewItem.user.phone || "—"],
              ["Matricule", viewItem.sub?.memberNumber ?? "—"],
              ["Activité", viewItem.sub?.activityName ?? "—"],
              ["Formule", viewItem.sub?.planName ?? "—"],
              ["Période", viewItem.sub ? `${viewItem.sub.startDate} → ${viewItem.sub.endDate}` : "—"],
              ["Montant", viewItem.sub ? `${viewItem.sub.amount} ${viewItem.sub.currency ?? "USD"}` : "—"],
            ].map(([label, val]) => (
              <div key={String(label)} className="flex justify-between border-b border-slate-100 py-2 text-sm dark:border-slate-800">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900 dark:text-white">{String(val)}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => setViewItem(null)}>
              <X className="mr-2 h-4 w-4" />Fermer
            </Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? "Modifier abonné" : "Nouvel abonné"}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm">Nom</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm">Email</label>
            <Input {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm">Téléphone</label>
            <Input {...register("phone")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting || createUser.isPending || updateUser.isPending}>{editItem ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}