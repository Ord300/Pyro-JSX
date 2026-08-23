import { placesDB } from "@/src/services/dbService";
import type { Place } from "@/src/data/mockData";

// ============================================================
// SERVICE LIEUX — Utilise la base de données localStorage
// ============================================================

export const placesService = {
  getAll: (): Place[] => placesDB.getAll<Place>(),
  getById: (id: number): Place | undefined => placesDB.getById<Place>(id),
  create: (data: Omit<Place, "id">): Place => placesDB.create<Place>(data),
  update: (id: number, data: Partial<Place>): Place | undefined => placesDB.update<Place>(id, data),
  delete: (id: number): boolean => placesDB.delete(id),
};