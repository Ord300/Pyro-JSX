import { usersDB, trainersDB, subscriptionsDB, activitiesDB, attendancesDB } from "@/src/services/dbService";

// ============================================================
// ESPACE ENTRAÎNEUR — Contexte partagé
// Retrouve la fiche entraîneur du compte connecté (par email,
// avec repli sur le nom) puis charge ses activités et abonnés.
// ============================================================

export type TrainerContext = {
  user: any;
  trainer: any | null;
  myActivityNames: string[];
  myActivities: any[];
  mySubscriptions: any[];
  myAttendances: any[];
  users: any[];
};

export async function loadTrainerContext(): Promise<TrainerContext | null> {
  if (typeof window === "undefined") return null;
  const email = (localStorage.getItem("current_user_email") || "").toLowerCase();
  if (!email) return null;

  const [users, trainers, subscriptions, activities, attendances] = await Promise.all([
    usersDB.getAll<any>(),
    trainersDB.getAll<any>(),
    subscriptionsDB.getAll<any>(),
    activitiesDB.getAll<any>(),
    attendancesDB.getAll<any>(),
  ]);

  const user = users.find((u) => u.email?.toLowerCase() === email) ?? null;
  if (!user) return null;

  const trainer =
    trainers.find((t) => (t.email ?? "").toLowerCase() === email) ??
    trainers.find((t) => t.name?.toLowerCase() === (user.name ?? "").toLowerCase()) ??
    null;

  const myActivityNames: string[] = Array.isArray(trainer?.activities) ? trainer.activities : [];
  const myActivities = activities.filter((a: any) => myActivityNames.includes(a.name));
  // Activités assignées qui n'existent plus au catalogue : on les garde quand même
  const knownNames = new Set(myActivities.map((a: any) => a.name));
  const extraNames = myActivityNames.filter((n) => !knownNames.has(n));

  const mySubscriptions = subscriptions.filter((s: any) => myActivityNames.includes(s.activityName));
  const myAttendances = attendances.filter((a: any) => myActivityNames.includes(a.activityName));

  return { user, trainer, myActivityNames, myActivities, mySubscriptions, myAttendances, users, extraNames } as TrainerContext & { extraNames: string[] };
}

export function presenceStats(attendances: any[], email?: string | null): { present: number; total: number } {
  if (!email) return { present: 0, total: 0 };
  const rows = attendances.filter((a) => a.email?.toLowerCase() === String(email).toLowerCase());
  return { present: rows.filter((a) => a.present).length, total: rows.length };
}

export function phoneOf(users: any[], email?: string | null): string {
  if (!email) return "—";
  const found = users.find((u) => u.email?.toLowerCase() === String(email).toLowerCase());
  return found?.phone || "—";
}
