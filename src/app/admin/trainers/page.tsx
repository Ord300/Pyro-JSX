"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, Dumbbell, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { useTrainers, useCreateTrainer, useUpdateTrainer, useDeleteTrainer } from "@/src/hooks/queries/trainers";
import { useActivities } from "@/src/hooks/queries/activities";
import { usersDB } from "@/src/services/dbService";
import { useToast } from "@/src/contexts/ToastContext";
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
  const [activitySearch, setActivitySearch] = useState("");

  const { data: trainersData = [] } = useTrainers();
  const { data: activitiesData = [] } = useActivities();
  const createTrainer = useCreateTrainer();
  const updateTrainer = useUpdateTrainer();
  const deleteTrainer = useDeleteTrainer();
  const toast = useToast();

  useEffect(() => { setTrainers(trainersData); }, [trainersData]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<TrainerForm>({ resolver: zodResolver(trainerSchema) as any, defaultValues: { activities: [] } });
  const image = watch("image");
  const selectedActivities: string[] = watch("activities") ?? [];

  const openCreate = () => {
    setEditItem(null);
    reset({ name: "", email: "", specialty: "", experience: "", activities: [], bio: "", image: "" });
    setActivitySearch("");
    setIsModalOpen(true);
  };
  const openEdit = (t: Trainer) => {
    setEditItem(t);
    reset({
      name: t.name,
      email: (t as any).email ?? "",
      specialty: t.specialty,
      experience: t.experience,
      activities: Array.isArray(t.activities) ? t.activities : [],
      bio: t.bio,
      image: t.image,
    });
    setActivitySearch("");
    setIsModalOpen(true);
  };

  const toggleActivity = (activityName: string) => {
    const current = selectedActivities ?? [];
    if (current.includes(activityName)) {
      setValue("activities", current.filter((a) => a !== activityName), { shouldValidate: true });
    } else {
      setValue("activities", [...current, activityName], { shouldValidate: true });
    }
  };

  const selectAll = (list: string[]) => setValue("activities", list, { shouldValidate: true });
  const clearAll = () => setValue("activities", [], { shouldValidate: true });

  // Crée (ou met à jour) le compte de connexion de l'entraîneur.
  // Mot de passe initial : "password".
  const ensureTrainerAccount = async (name: string, email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    const users = await usersDB.getAll<any>();
    const existing = users.find((u) => u.email?.toLowerCase() === clean);
    if (existing) {
      if (existing.role !== "Entraîneur") {
        toast.addToast(`Un compte « ${existing.role} » existe déjà avec cet email — compte entraîneur non créé`, "error");
      } else if (existing.name !== name) {
        await usersDB.update(existing.id, { name });
      }
      return;
    }
    await usersDB.create({
      name,
      email: clean,
      role: "Entraîneur",
      status: "Actif",
      password: "password",
      mustChangePassword: false,
    } as any);
    toast.addToast(`Compte entraîneur créé (${clean} / mot de passe : password)`, "success");
  };

  const onSubmit = async (data: TrainerForm) => {
    const payload = {
      name: data.name,
      email: (data as any).email?.trim() ?? "",
      specialty: data.specialty,
      experience: data.experience,
      activities: data.activities ?? [],
      bio: data.bio || "",
      image: data.image || "",
    };
    if (editItem) {
      await updateTrainer.mutateAsync({ id: editItem.id, data: payload as any });
    } else {
      await createTrainer.mutateAsync(payload as any);
    }
    await ensureTrainerAccount(payload.name, payload.email);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => { if (!confirm("Supprimer ce coach ?")) return; await deleteTrainer.mutateAsync(id); };

  const filtered = trainers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.specialty.toLowerCase().includes(search.toLowerCase()) ||
    ((t as any).email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (t.activities ?? []).some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  const activityOptions = activitiesData.map((a) => a.name);
  const visibleOptions = activityOptions.filter((name) =>
    name.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Entraîneurs</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{trainers.length} entraîneur(s) • {activitiesData.length} activité(s) disponible(s)</p>
        </div>
        <Button onClick={openCreate} isLoading={createTrainer.isPending}><Plus className="mr-2 h-4 w-4" />Nouveau coach</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Rechercher par nom, spécialité ou activité…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-4">
            <div className="flex items-center gap-3">
              {t.image?.startsWith("data:") || t.image?.startsWith("http") ? <img src={t.image} alt={t.name} className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600 dark:bg-primary-900/30">{t.name.split(" ").map((s) => s[0]).join("")}</div>}
              <div className="min-w-0">
                <div className="font-medium text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.specialty} • {t.experience}</div>
                {(t as any).email ? (
                  <div className="mt-1 text-xs text-slate-500">🔑 {(t as any).email}</div>
                ) : (
                  <div className="mt-1 text-xs italic text-amber-500">Sans compte de connexion</div>
                )}
                <div className="mt-2 text-xs text-slate-500 line-clamp-2">{t.bio}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Dumbbell className="h-3.5 w-3.5" />
                {(t.activities ?? []).length} activité(s) assignée(s)
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(t.activities ?? []).length === 0 && (
                  <span className="text-xs italic text-slate-400">Aucune activité assignée</span>
                )}
                {(t.activities ?? []).map((a) => (
                  <Badge key={a} variant="default" className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{a}</Badge>
                ))}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => openEdit(t)} isLoading={updateTrainer.isPending}><Edit2 className="mr-1 h-3 w-3" />Modifier</Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(t.id)} isLoading={deleteTrainer.isPending}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? "Modifier entraîneur" : "Nouveau entraîneur"} className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm text-slate-600">Nom</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm text-slate-600">Email (compte de connexion)</label>
            <Input {...register("email" as any)} type="email" placeholder="coach@moveup.cd" />
            {(errors as any).email && <p className="text-xs text-red-500 mt-1">{String((errors as any).email.message)}</p>}
            <p className="mt-1 text-xs text-slate-400">Un compte « Entraîneur » (mot de passe initial : password) est créé automatiquement avec cet email.</p>
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Activités assignées {selectedActivities.length > 0 && <span className="text-primary-600">({selectedActivities.length})</span>}
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => selectAll(activityOptions)} className="text-xs text-primary-600 hover:underline">Tout sélectionner</button>
                <button type="button" onClick={clearAll} className="text-xs text-slate-400 hover:underline">Effacer</button>
              </div>
            </div>

            {selectedActivities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedActivities.map((a) => (
                  <Badge key={a} variant="default" className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    {a}
                    <button type="button" onClick={() => toggleActivity(a)} className="ml-1 hover:text-red-500" aria-label={`Retirer ${a}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Rechercher une activité…" className="pl-9" value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} />
            </div>

            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
              {activitiesData.length === 0 && (
                <p className="p-3 text-xs italic text-slate-400">Aucune activité créée pour le moment. Créez d&apos;abord des activités dans le module Activités.</p>
              )}
              {visibleOptions.length === 0 && activitiesData.length > 0 && (
                <p className="p-3 text-xs italic text-slate-400">Aucune activité ne correspond à la recherche.</p>
              )}
              {activitiesData
                .filter((a) => a.name.toLowerCase().includes(activitySearch.toLowerCase()))
                .map((a) => {
                  const checked = selectedActivities.includes(a.name);
                  return (
                    <label key={a.id} className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${checked ? "bg-primary-50/60 dark:bg-primary-900/20" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleActivity(a.name)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-lg leading-none">{a.icon}</span>
                      <span className="flex-1">
                        <span className="block font-medium text-slate-800 dark:text-slate-100">{a.name}</span>
                        <span className="block text-xs text-slate-400">{a.category}{a.trainer ? ` • ${a.trainer}` : ""}</span>
                      </span>
                      {checked && <Badge variant="default" className="bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">Assignée</Badge>}
                    </label>
                  );
                })}
            </div>
            <p className="mt-1 text-xs text-slate-400">Sélectionnez une ou plusieurs activités à assigner à cet entraîneur.</p>
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
