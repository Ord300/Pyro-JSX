import { activitiesDB } from './dbService';
import type { Activity } from '../data/mockData';

// ============================================================
// SERVICE ACTIVITÉS — Utilise la base de données localStorage
// ============================================================

export const activitiesService = {
  getAll: (): Activity[] => activitiesDB.getAll(),
  getById: (id: number): Activity | undefined => activitiesDB.getById(id),
  create: (data: Omit<Activity, 'id'>): Activity => activitiesDB.create(data),
  update: (id: number, data: Partial<Activity>): Activity | undefined => activitiesDB.update(id, data),
  delete: (id: number): boolean => activitiesDB.delete(id),
};