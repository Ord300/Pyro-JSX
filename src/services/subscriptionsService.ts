import { subscriptionsDB } from "@/src/services/dbService";
import type { Subscription } from "@/src/types/subscription";

// ============================================================
// SERVICE ABONNEMENTS — SQLite wrapper
// ============================================================

export const subscriptionsService = {
  getAll: (): Promise<Subscription[]> => subscriptionsDB.getAll<Subscription>(),
  getById: (id: number): Promise<Subscription | undefined> => subscriptionsDB.getById<Subscription>(id),
  create: (data: Omit<Subscription, "id">): Promise<Subscription> => subscriptionsDB.create<Subscription>(data),
  update: (id: number, data: Partial<Subscription>): Promise<Subscription | undefined> => subscriptionsDB.update<Subscription>(id, data),
  delete: (id: number): Promise<boolean> => subscriptionsDB.delete(id),
};
