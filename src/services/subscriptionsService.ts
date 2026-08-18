import { subscriptionsDB } from './dbService';
import type { Subscription } from '../types/subscription';

// ============================================================
// SERVICE ABONNEMENTS — LocalStorage wrapper
// ============================================================

export const subscriptionsService = {
  getAll: (): Subscription[] => subscriptionsDB.getAll<Subscription>(),
  getById: (id: number): Subscription | undefined => subscriptionsDB.getById<Subscription>(id),
  create: (data: Omit<Subscription, 'id'>): Subscription => subscriptionsDB.create<Subscription>(data),
  update: (id: number, data: Partial<Subscription>): Subscription | undefined => subscriptionsDB.update<Subscription>(id, data),
  delete: (id: number): boolean => subscriptionsDB.delete(id),
};
