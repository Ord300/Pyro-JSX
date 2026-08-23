"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/src/hooks/queries/users";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const subscriberSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), status: z.enum(["Actif", "Suspendu", "Inactif"]).default("Actif") });
type SubscriberForm = z.input<typeof subscriberSchema>;

export default function AdminSubscribers() {
  const { data: users = [] } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const subscribers = users.filter((u) => u.role === "Abonné");

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

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

  const handleDelete = async (id: number) => { if (!confirm("Supprimer cet abonné ?")) return; await deleteUser.mutateAsync(id); };

  const filtered = subscribers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Abonnés</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Liste des abonnés</p>
        </div>
        <Button onClick={openCreate} isLoading={createUser.isPending}><Plus className="mr-2 h-4 w-4" />Nouvel abonné</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Rechercher par nom ou email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((u) => (
          <div key={u.id} className="rounded-lg border p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-slate-500">{u.email} • {u.phone}</div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => openEdit(u)} isLoading={updateUser.isPending}><Edit2 className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(u.id)} isLoading={deleteUser.isPending}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

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