import { galleryDB } from "@/src/services/dbService";
import type { GalleryImage } from "@/src/types/gallery";

// ============================================================
// SERVICE GALERIE — Gère les images d'installations
// ============================================================

export const galleryService = {
  getAll: (): Promise<GalleryImage[]> => galleryDB.getAll<GalleryImage>(),
  getById: (id: number): Promise<GalleryImage | undefined> => galleryDB.getById<GalleryImage>(id),
  create: (data: Omit<GalleryImage, "id">): Promise<GalleryImage> => galleryDB.create<GalleryImage>(data),
  update: (id: number, data: Partial<GalleryImage>): Promise<GalleryImage | undefined> => galleryDB.update<GalleryImage>(id, data),
  delete: (id: number): Promise<boolean> => galleryDB.delete(id),
  setAll: (items: GalleryImage[]): Promise<void> => galleryDB.setAll(items),
};
