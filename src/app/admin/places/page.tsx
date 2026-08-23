"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { usePlaces, useCreatePlace, useUpdatePlace, useDeletePlace } from "@/src/hooks/queries/places";
import type { Place } from "@/src/data/mockData";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PlaceForm } from "@/src/schemas/places";
import { placeSchema } from "@/src/schemas/places";

export default function AdminPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Place | null>(null);

  const { data: placesData = [] } = usePlaces();
  const createPlace = useCreatePlace();
  const updatePlace = useUpdatePlace();
  const deletePlace = useDeletePlace();

  useEffect(() => { setPlaces(placesData); }, [placesData]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<PlaceForm>({ resolver: zodResolver(placeSchema) });
  const image = watch("image");

  const openCreate = () => { setEditItem(null); reset({ name: "", address: "", capacity: 1, description: "", image: "" }); setIsModalOpen(true); };
  const openEdit = (p: Place) => { setEditItem(p); reset({ name: p.name, address: p.location || "", capacity: p.capacity, description: p.description, image: p.image }); setIsModalOpen(true); };

  const onSubmit = async (data: PlaceForm) => {
    const payload = { name: data.name, address: data.address, capacity: data.capacity, description: data.description || "", image: data.image || "" };
    if (editItem) {
      await updatePlace.mutateAsync({ id: editItem.id, data: payload as any });
    } else {
      await createPlace.mutateAsync(payload as any);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => { if (!confirm("Supprimer ce lieu ?")) return; await deletePlace.mutateAsync(id); };

  const filtered = places.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lieux</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{places.length} lieu(x)</p>
        </div>
        <Button onClick={openCreate} isLoading={createPlace.isPending}><Plus className="mr-2 h-4 w-4" />Nouveau lieu</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Rechercher par nom ou type…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-4">
            <div className="flex items-center gap-3">
              {p.image?.startsWith("data:") || p.image?.startsWith("http") ? <img src={p.image} alt={p.name} className="h-12 w-12 rounded-md object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-lg font-bold text-primary-600 dark:bg-primary-900/30">{p.name.split(" ").map((s) => s[0]).join("")}</div>}
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{p.name}</div>
                <div className="text-xs text-slate-500">{p.type} • {p.location}</div>
                <div className="mt-2 text-xs text-slate-500 line-clamp-2">{p.description}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => openEdit(p)} isLoading={updatePlace.isPending}><Edit2 className="mr-1 h-3 w-3" />Modifier</Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id)} isLoading={deletePlace.isPending}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? "Modifier lieu" : "Nouveau lieu"}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm text-slate-600">Nom</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Adresse</label>
            <Input {...register("address")} />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Capacité</label>
            <Input type="number" {...register("capacity", { valueAsNumber: true })} />
            {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Description</label>
            <textarea rows={3} {...register("description")} className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Photo du lieu</label>
            <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setValue("image", String(reader.result), { shouldValidate: true }); reader.readAsDataURL(file); }} className="mt-1 block w-full rounded-lg border border-slate-300 text-sm file:mr-3 file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 dark:border-slate-700 dark:file:bg-primary-900/30 dark:file:text-primary-300" />
            {image && <img src={image} alt="Aperçu du lieu" className="mt-2 h-32 w-full rounded-lg object-cover" />}
          </div>
          <div className="sticky bottom-0 -mx-6 -mb-6 mt-3 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting || createPlace.isPending || updatePlace.isPending}>{editItem ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}