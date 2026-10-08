// ============================================================
// SERVICE DE BASE DE DONNÉES — Client API (SQLite + Prisma)
// Toutes les méthodes sont ASYNCHRONES et passent par /api/db/*
// ============================================================

const DB_KEYS = {
  activities: "activities",
  trainers: "trainers",
  places: "places",
  plans: "plans",
  subscriptions: "subscriptions",
  products: "products",
  subscriptionRequests: "subscriptionRequests",
  payments: "payments",
  paymentProviders: "paymentProviders",
  reservations: "reservations",
  timeSlots: "timeSlots",
  receipts: "receipts",
  users: "users",
  stats: "stats",
  gallery: "gallery",
  messages: "messages",
  notifications: "notifications",
};

const isBrowser = () => typeof window !== "undefined";

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!response.ok) {
    let message = `Erreur API ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export const db = {
  async getAll<T>(key: string): Promise<T[]> {
    if (!isBrowser()) return [];
    return apiRequest<T[]>(`/api/db/${key}`);
  },

  async getById<T = any>(key: string, id: number | string): Promise<T | undefined> {
    const item = await apiRequest<T | null>(`/api/db/${key}/${id}`);
    return item ?? undefined;
  },

  async create<T = any>(key: string, data: any): Promise<T> {
    const newItem = await apiRequest<T>(`/api/db/${key}`, { method: "POST", body: JSON.stringify(data) });
    this.notifyChange(key);
    return newItem;
  },

  async update<T = any>(key: string, id: number | string, data: any): Promise<T | undefined> {
    const updated = await apiRequest<T | null>(`/api/db/${key}/${id}`, { method: "PUT", body: JSON.stringify(data) });
    this.notifyChange(key);
    return updated ?? undefined;
  },

  async delete(key: string, id: number | string): Promise<boolean> {
    await apiRequest(`/api/db/${key}/${id}`, { method: "DELETE" });
    this.notifyChange(key);
    return true;
  },

  async setAll<T>(key: string, items: T[]): Promise<void> {
    if (!isBrowser()) return;
    await apiRequest(`/api/db/${key}`, { method: "PUT", body: JSON.stringify(items) });
    this.notifyChange(key);
  },

  subscribe(callback: () => void): () => void {
    if (!isBrowser()) return () => {};
    window.addEventListener("db-change", callback);
    window.addEventListener("storage", callback);
    return () => {
      window.removeEventListener("db-change", callback);
      window.removeEventListener("storage", callback);
    };
  },

  notifyChange(key: string): void {
    if (!isBrowser()) return;
    window.dispatchEvent(new CustomEvent("db-change", { detail: { key } }));
  },

  async reset(): Promise<void> {
    if (!isBrowser()) return;
    await apiRequest("/api/db/reset", { method: "POST" });
    this.notifyChange("reset");
  },
};

export const activitiesDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.activities),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.activities, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.activities, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.activities, id, data),
  delete: (id: number) => db.delete(DB_KEYS.activities, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const trainersDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.trainers),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.trainers, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.trainers, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.trainers, id, data),
  delete: (id: number) => db.delete(DB_KEYS.trainers, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const placesDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.places),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.places, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.places, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.places, id, data),
  delete: (id: number) => db.delete(DB_KEYS.places, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const plansDB = {
  getAll: () => db.getAll(DB_KEYS.plans),
  getById: (id: string) => db.getById(DB_KEYS.plans, id),
  create: (data: any) => db.create(DB_KEYS.plans, data),
  update: (id: string, data: any) => db.update(DB_KEYS.plans, id, data),
  delete: (id: string) => db.delete(DB_KEYS.plans, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const subscriptionsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.subscriptions),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.subscriptions, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.subscriptions, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.subscriptions, id, data),
  delete: (id: number) => db.delete(DB_KEYS.subscriptions, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const productsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.products),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.products, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.products, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.products, id, data),
  delete: (id: number) => db.delete(DB_KEYS.products, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const subscriptionRequestsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.subscriptionRequests),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.subscriptionRequests, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.subscriptionRequests, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.subscriptionRequests, id, data),
  delete: (id: number) => db.delete(DB_KEYS.subscriptionRequests, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const paymentsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.payments),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.payments, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.payments, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.payments, id, data),
  delete: (id: number) => db.delete(DB_KEYS.payments, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const paymentProvidersDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.paymentProviders),
};

export const reservationsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.reservations),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.reservations, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.reservations, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.reservations, id, data),
  delete: (id: number) => db.delete(DB_KEYS.reservations, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const attendancesDB = {
  getAll: <T = any>() => db.getAll<T>("attendances"),
  getById: <T = any>(id: number) => db.getById<T>("attendances", id),
  create: <T = any>(data: any) => db.create<T>("attendances", data),
  update: <T = any>(id: number, data: any) => db.update<T>("attendances", id, data),
  delete: (id: number) => db.delete("attendances", id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const timeSlotsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.timeSlots),
  setAll: (items: any[]) => db.setAll(DB_KEYS.timeSlots, items),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const receiptsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.receipts),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.receipts, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.receipts, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.receipts, id, data),
  delete: (id: number) => db.delete(DB_KEYS.receipts, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const usersDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.users),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.users, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.users, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.users, id, data),
  delete: (id: number) => db.delete(DB_KEYS.users, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const galleryDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.gallery),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.gallery, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.gallery, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.gallery, id, data),
  delete: (id: number) => db.delete(DB_KEYS.gallery, id),
  setAll: (items: any[]) => db.setAll(DB_KEYS.gallery, items),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const messagesDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.messages),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.messages, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.messages, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.messages, id, data),
  delete: (id: number) => db.delete(DB_KEYS.messages, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const notificationsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.notifications),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.notifications, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.notifications, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.notifications, id, data),
  delete: (id: number) => db.delete(DB_KEYS.notifications, id),
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const statsDB = {
  get: async (): Promise<Record<string, any> | null> => {
    if (!isBrowser()) return null;
    return apiRequest<Record<string, any>>("/api/db/stats");
  },
  update: async (data: Record<string, any>) => {
    if (!isBrowser()) return data;
    const updated = await apiRequest<Record<string, any>>("/api/db/stats", { method: "PUT", body: JSON.stringify(data) });
    db.notifyChange(DB_KEYS.stats);
    return updated;
  },
  subscribe: (callback: () => void) => db.subscribe(callback),
};

export const DB_KEYS_EXPORT = DB_KEYS;
