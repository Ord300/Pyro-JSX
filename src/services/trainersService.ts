import { trainersDB } from "@/src/services/dbService";
import type { Trainer } from "@/src/data/mockData";

// ============================================================
// SERVICE ENTRAÎNEURS — Utilise la base de données SQLite (API)
// ============================================================

export const trainersService = {
  getAll: (): Promise<Trainer[]> => trainersDB.getAll<Trainer>(),
  getById: (id: number): Promise<Trainer | undefined> => trainersDB.getById<Trainer>(id),
  create: (data: Omit<Trainer, "id">): Promise<Trainer> => trainersDB.create<Trainer>(data),
  update: (id: number, data: Partial<Trainer>): Promise<Trainer | undefined> => trainersDB.update<Trainer>(id, data),
  delete: (id: number): Promise<boolean> => trainersDB.delete(id),
};
