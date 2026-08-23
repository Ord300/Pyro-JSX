"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { useTrainers, useCreateTrainer, useUpdateTrainer, useDeleteTrainer } from "@/src/hooks/queries/trainers";
import type { Trainer } from "@/src/data/mockData";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trainerSchema } from "@/src/schemas/trainers";
import type { TrainerForm } from "@/src/schemas/trainers";

export default function AdminTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Trainer | null>(null);

  const { data: trainersData = [] } = useTrainers();
  const createTrainer = useCreateTrainer();
  const updateTrainer = useUpdateTrainer();
  const deleteTrainer = useDeleteTrainer();

  useEffect(() => { setTrainers(trainersData); }, [trainersData]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<TrainerForm>({ resolver: zodResolver(trainerSchema) as any });
  const image = watch("image");

  const openCreate = () => { setEditItem(null); reset(); setIsModalOpen(true); };
  const openEdit = (t: Trainer) => { setEditItem(t); reset({ name: t.name, specialty: t.specialty, experience: t.experience, activities: t.activities.join(", "), bio: t.bio, image: t.image }); setIsModalOpen(true); };

  const onSubmit = async (data: TrainerForm) => {
    const payload = { name: data.name, specialty: data.specialty, experience: data.experience, activities: data.activities ? data.activities.split(",").map((s) => s.trim()) : [], bio: data.bio || "", image: data.image || "" };
    if (editItem) {
      await updateTrainer.mutateAsync({ id: editItem.id, data: payload as any });
    } else {
      await createTrainer.mutateAsync(payload as any);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => { if (!confirm("Supprimer ce coach ?")) return; await deleteTrainer.mutateAsync(id); };

  const filtered = trainers.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.specialty.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Entraîneurs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{trainers.length} entraîneur(s)</p>
        </div>
        <Button onClick={openCreate} isLoading={createTrainer.isPending}><Plus className="mr-2 h-4 w-4" />Nouveau coach</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Rechercher par nom ou spécialité…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-4">
            <div className="flex items-center gap-3">
              {t.image?.startsWith("data:") || t.image?.startsWith("http") ? <img src={t.image} alt={t.name} className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600 dark:bg-primary-900/30">{t.name.split(" ").map((s) => s[0]).join("")}</div>}
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.specialty} • {t.experience}</div>
                <div className="mt-2 text-xs text-slate-500 line-clamp-2">{t.bio}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => openEdit(t)} isLoading={updateTrainer.isPending}><Edit2 className="mr-1 h-3 w-3" />Modifier</Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(t.id)} isLoading={deleteTrainer.isPending}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? "Modifier entraîneur" : "Nouveau entraîneur"}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm text-slate-600">Nom</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Spécialité</label>
            <Input {...register("specialty")} />
            {errors.specialty && <p className="text-xs text-red-500 mt-1">{errors.specialty.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Expérience</label>
            <Input {...register("experience")} />
            {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Activités (séparées par une virgule)</label>
            <Input {...register("activities")} />
          </div>
          <div>
            <label className="text-sm text-slate-600">Bio</label>
            <textarea rows={3} {...register("bio")} className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm" />
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Photo de l'entraîneur</label>
            <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setValue("image", String(reader.result), { shouldValidate: true }); reader.readAsDataURL(file); }} className="mt-1 block w-full rounded-lg border border-slate-300 text-sm file:mr-3 file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-primary-700 dark:border-slate-700 dark:file:bg-primary-900/30 dark:file:text-primary-300" />
            {image && <img src={image} alt="Aperçu de l'entraîneur" className="mt-2 h-28 w-28 rounded-full object-cover" />}
          </div>
          <div className="sticky bottom-0 -mx-6 -mb-6 mt-3 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting || createTrainer.isPending || updateTrainer.isPending}>{editItem ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}