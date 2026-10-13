"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { galleryService } from "@/src/services/galleryService";
import { db } from "@/src/services/dbService";
import type { GalleryImage } from "@/src/types/gallery";
import { useToast } from "@/src/contexts/ToastContext";

export function useGallery() {
  const qc = useQueryClient();
  useEffect(() => {
    return db.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["gallery"] });
    });
  }, [qc]);
  return useQuery<GalleryImage[]>({
    queryKey: ["gallery"],
    queryFn: () => galleryService.getAll(),
  });
}

export function useCreateGalleryImage() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<GalleryImage, "id">) => {
      return galleryService.create(data);
    },
    onMutate: async (newItem) => {
      await qc.cancelQueries({ queryKey: ["gallery"] });
      const previous = qc.getQueryData<GalleryImage[]>(["gallery"]);
      qc.setQueryData<GalleryImage[]>(["gallery"], (old) => [{ id: -Date.now(), ...newItem } as GalleryImage, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _new, context: any) => { if (context?.previous) qc.setQueryData(["gallery"], context.previous); addToast("Erreur création image", "error"); },
    onSuccess: () => { addToast("Image ajoutée", "success"); db.notifyChange("gallery"); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["gallery"] })
  });
}

export function useUpdateGalleryImage() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GalleryImage> }) => {
      return galleryService.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["gallery"] });
      const previous = qc.getQueryData<GalleryImage[]>(["gallery"]);
      qc.setQueryData<GalleryImage[]>(["gallery"], (old) => old ? old.map((i) => i.id === id ? { ...i, ...data } : i) : []);
      return { previous };
    },
    onError: (_err, _vars, context: any) => { if (context?.previous) qc.setQueryData(["gallery"], context.previous); addToast("Erreur mise à jour image", "error"); },
    onSuccess: () => { addToast("Image mise à jour", "success"); db.notifyChange("gallery"); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["gallery"] })
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      return galleryService.delete(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["gallery"] });
      const previous = qc.getQueryData<GalleryImage[]>(["gallery"]);
      qc.setQueryData<GalleryImage[]>(["gallery"], (old) => old ? old.filter((i) => i.id !== id) : []);
      return { previous };
    },
    onError: (_err, _id, context: any) => { if (context?.previous) qc.setQueryData(["gallery"], context.previous); addToast("Erreur suppression image", "error"); },
    onSuccess: () => { addToast("Image supprimée", "success"); db.notifyChange("gallery"); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["gallery"] })
  });
}