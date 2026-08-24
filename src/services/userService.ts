import { usersDB } from "@/src/services/dbService";
import type { User } from "@/src/types/user";

// ============================================================
// SERVICE UTILISATEURS — Utilise la base de données SQLite (API)
// ============================================================

export const userService = {
  getAll: (): Promise<User[]> => usersDB.getAll<User>(),
  getById: (id: number): Promise<User | undefined> => usersDB.getById<User>(id),
  create: (data: Omit<User, "id">): Promise<User> => usersDB.create<User>(data),
  update: (id: number, data: Partial<User>): Promise<User | undefined> => usersDB.update<User>(id, data),
  delete: (id: number): Promise<boolean> => usersDB.delete(id),
};
