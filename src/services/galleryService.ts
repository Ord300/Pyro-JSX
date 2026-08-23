import { galleryDB } from "@/src/services/dbService";
import type { GalleryImage } from "@/src/types/gallery";

// ============================================================
// SERVICE GALERIE — Gère les images d'installations
// ============================================================

export const galleryService = {
  getAll: (): GalleryImage[] => galleryDB.getAll<GalleryImage>(),
  getById: (id: number): GalleryImage | undefined => galleryDB.getById<GalleryImage>(id),
  create: (data: Omit<GalleryImage, "id">): GalleryImage => galleryDB.create<GalleryImage>(data),
  update: (id: number, data: Partial<GalleryImage>): GalleryImage | undefined => galleryDB.update<GalleryImage>(id, data),
  delete: (id: number): boolean => galleryDB.delete(id),
  setAll: (items: GalleryImage[]): void => galleryDB.setAll(items),
};