import { trainersDB } from './dbService';
import type { Trainer } from '../data/mockData';

// ============================================================
// SERVICE ENTRAÎNEURS — Utilise la base de données localStorage
// ============================================================

export const trainersService = {
  getAll: (): Trainer[] => trainersDB.getAll<Trainer>(),
  getById: (id: number): Trainer | undefined => trainersDB.getById<Trainer>(id),
  create: (data: Omit<Trainer, 'id'>): Trainer => trainersDB.create<Trainer>(data),
  update: (id: number, data: Partial<Trainer>): Trainer | undefined => trainersDB.update<Trainer>(id, data),
  delete: (id: number): boolean => trainersDB.delete(id),
};