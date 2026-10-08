"use client";

import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Eye } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/Table";
import { Modal } from "@/src/components/ui/Modal";
import type { User } from "@/src/types/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/src/schemas/user";
import type { UserForm } from "@/src/schemas/user";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/src/hooks/queries/users";

const statusVariant = (s: string) => (s === "Actif" ? "success" : s === "Suspendu" ? "danger" : "warning");
const roleVariant = (r: string) => (r === "Gestionnaire" ? "default" : r === "Abonné" ? "outline" : "default");

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const { data: users = [] } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserForm>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: { name: "", email: "", phone: undefined, role: "Utilisateur", status: "Actif" }
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", email: "", phone: undefined, role: "Utilisateur", status: "Actif" });
    setIsFormOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    reset({ name: u.name, email: u.email, phone: u.phone, role: u.role as any, status: u.status as any });
    setIsFormOpen(true);
  };

  const handleSave = handleSubmit(async (values) => {
    if (editing) {
      await updateUser.mutateAsync({ id: editing.id, data: values as Partial<User> });
    } else {
      await createUser.mutateAsync(values as any);
    }
    setIsFormOpen(false);
  });

  const handleDelete = async (u: User) => {
    if (!confirm(`Supprimer ${u.name} ?`)) return;
    await deleteUser.mutateAsync(u.id);
  };

  const filtered = users.filter((u) =>
    (roleFilter === "Tous" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{users.length} utilisateurs au total</p>
        </div>
        <Button onClick={openCreate} isLoading={createUser.isPending}><Plus className="mr-2 h-4 w-4" />Ajouter un utilisateur</Button>
      </div>

      {/* Filtres */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Rechercher par nom ou email…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex gap-2">
            {["Tous", "Utilisateur", "Abonné", "Entraîneur", "Gestionnaire"].map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${roleFilter === r ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-10">Aucun utilisateur trouvé.</TableCell></TableRow>
            ) : paginated.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500">{user.phone}</TableCell>
                <TableCell><Badge variant={roleVariant(user.role) as any} className="text-xs">{user.role}</Badge></TableCell>
                <TableCell><Badge variant={statusVariant(user.status) as any} className="text-xs">{user.status}</Badge></TableCell>
                <TableCell className="text-slate-500 text-sm">{user.lastLogin}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewUser(user)} title="Voir"><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Modifier" onClick={() => openEdit(user)} isLoading={updateUser.isPending}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" title="Supprimer" onClick={() => handleDelete(user)} isLoading={deleteUser.isPending}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-3">
          <p className="text-xs text-slate-500">{filtered.length} résultat(s)</p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${page === p ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Détails */}
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="Détails de l'utilisateur">
        {viewUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl font-bold text-primary-600 dark:text-primary-400">
                {viewUser.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewUser.name}</h3>
                <Badge variant={statusVariant(viewUser.status) as any}>{viewUser.status}</Badge>
              </div>
            </div>
            {[["Email", viewUser.email], ["Téléphone", viewUser.phone], ["Rôle", viewUser.role], ["Dernière connexion", viewUser.lastLogin]].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900 dark:text-white">{val}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal Création / Édition */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editing ? "Modifier utilisateur" : "Ajouter un utilisateur"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500">Nom complet</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{String(errors.name.message)}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-500">Email</label>
            <Input {...register("email")} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{String(errors.email.message)}</p>}
          </div>
          <div>
            <label className="text-xs text-slate-500">Téléphone</label>
            <Input {...register("phone")} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{String(errors.phone.message)}</p>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500">Rôle</label>
              <select {...register("role")} className="mt-1 block w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm">
                <option>Utilisateur</option>
                <option>Abonné</option>
                <option>Entraîneur</option>
                <option>Gestionnaire</option>
              </select>
            </div>
            <div className="w-40">
              <label className="text-xs text-slate-500">Statut</label>
              <select {...register("status")} className="mt-1 block w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm">
                <option>Actif</option>
                <option>Suspendu</option>
                <option>Inactif</option>
              </select>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting}>{editing ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}