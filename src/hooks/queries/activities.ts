"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activitiesService } from "@/src/services/activitiesService";
import { db } from "@/src/services/dbService";
import type { Activity } from "@/src/data/mockData";
import { useToast } from "@/src/contexts/ToastContext";

export function useActivities() {
  const qc = useQueryClient();
  useEffect(() => {
    return db.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["activities"] });
    });
  }, [qc]);
  return useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: () => activitiesService.getAll(),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<Activity, "id">) => {
      return activitiesService.create(data);
    },
    onMutate: async (newItem) => {
      await qc.cancelQueries({ queryKey: ["activities"] });
      const previous = qc.getQueryData<Activity[]>(["activities"]);
      qc.setQueryData<Activity[]>(["activities"], (old) => [{ id: -Date.now(), ...newItem } as Activity, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _new, context: any) => { if (context?.previous) qc.setQueryData(["activities"], context.previous); addToast("Erreur création activité", "error"); },
    onSuccess: () => { addToast("Activité créée", "success"); db.notifyChange("activities"); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["activities"] })
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Activity> }) => {
      return activitiesService.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["activities"] });
      const previous = qc.getQueryData<Activity[]>(["activities"]);
      qc.setQueryData<Activity[]>(["activities"], (old) => old ? old.map((i) => i.id === id ? { ...i, ...data } : i) : []);
      return { previous };
    },
    onError: (_err, _vars, context: any) => { if (context?.previous) qc.setQueryData(["activities"], context.previous); addToast("Erreur mise à jour activité", "error"); },
    onSuccess: () => { addToast("Activité mise à jour", "success"); db.notifyChange("activities"); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["activities"] })
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      return activitiesService.delete(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["activities"] });
      const previous = qc.getQueryData<Activity[]>(["activities"]);
      qc.setQueryData<Activity[]>(["activities"], (old) => old ? old.filter((i) => i.id !== id) : []);
      return { previous };
    },
    onError: (_err, _id, context: any) => { if (context?.previous) qc.setQueryData(["activities"], context.previous); addToast("Erreur suppression activité", "error"); },
    onSuccess: () => { addToast("Activité supprimée", "success"); db.notifyChange("activities"); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["activities"] })
  });
}