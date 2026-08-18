import { usersDB } from './dbService';
import type { User } from '../types/user';

// ============================================================
// SERVICE UTILISATEURS — Utilise la base de données localStorage
// ============================================================

export const userService = {
  getAll: (): User[] => usersDB.getAll<User>(),
  getById: (id: number): User | undefined => usersDB.getById<User>(id),
  create: (data: Omit<User, 'id'>): User => usersDB.create<User>(data),
  update: (id: number, data: Partial<User>): User | undefined => usersDB.update<User>(id, data),
  delete: (id: number): boolean => usersDB.delete(id),
};