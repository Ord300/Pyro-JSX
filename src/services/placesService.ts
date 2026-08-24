import { placesDB } from "@/src/services/dbService";
import type { Place } from "@/src/data/mockData";

// ============================================================
// SERVICE LIEUX — Utilise la base de données SQLite (API)
// ============================================================

export const placesService = {
  getAll: (): Promise<Place[]> => placesDB.getAll<Place>(),
  getById: (id: number): Promise<Place | undefined> => placesDB.getById<Place>(id),
  create: (data: Omit<Place, "id">): Promise<Place> => placesDB.create<Place>(data),
  update: (id: number, data: Partial<Place>): Promise<Place | undefined> => placesDB.update<Place>(id, data),
  delete: (id: number): Promise<boolean> => placesDB.delete(id),
};
