import { activitiesDB } from "@/src/services/dbService";
import type { Activity } from "@/src/data/mockData";

// ============================================================
// SERVICE ACTIVITÉS — Utilise la base de données SQLite (API)
// ============================================================

export const activitiesService = {
  getAll: (): Promise<Activity[]> => activitiesDB.getAll<Activity>(),
  getById: (id: number): Promise<Activity | undefined> => activitiesDB.getById<Activity>(id),
  create: (data: Omit<Activity, "id">): Promise<Activity> => activitiesDB.create<Activity>(data),
  update: (id: number, data: Partial<Activity>): Promise<Activity | undefined> => activitiesDB.update<Activity>(id, data),
  delete: (id: number): Promise<boolean> => activitiesDB.delete(id),
};
