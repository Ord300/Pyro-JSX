"use client";

// ============================================================
// SERVICE DE BASE DE DONNÉES LOCAL (localStorage)
// Synchronise les données entre l'admin et le reste du site
// ============================================================

import { mockActivities, mockTrainers, mockPlaces, mockPricingPlans, mockGalleryImages } from "@/src/data/mockData";

const initialUsers: any[] = [];

const DB_KEYS = {
  activities: "db_activities",
  trainers: "db_trainers",
  places: "db_places",
  plans: "db_plans",
  subscriptions: "db_subscriptions",
  products: "db_products",
  subscriptionRequests: "db_subscription_requests",
  payments: "db_payments",
  paymentProviders: "db_payment_providers",
  reservations: "db_reservations",
  timeSlots: "db_time_slots",
  receipts: "db_receipts",
  users: "db_users",
  stats: "db_stats",
  gallery: "db_gallery",
};

const SEED_VERSION = "6";

const isBrowser = () => typeof window !== "undefined";

const initializeDB = () => {
  if (!isBrowser()) return;
  if (localStorage.getItem("db_seed_version") !== SEED_VERSION) {
    Object.values(DB_KEYS).forEach((key) => localStorage.removeItem(key));
    localStorage.setItem("db_seed_version", SEED_VERSION);
  }
  if (!localStorage.getItem(DB_KEYS.activities)) {
    localStorage.setItem(DB_KEYS.activities, JSON.stringify(mockActivities));
  }
  if (!localStorage.getItem(DB_KEYS.trainers)) {
    localStorage.setItem(DB_KEYS.trainers, JSON.stringify(mockTrainers));
  }
  if (!localStorage.getItem(DB_KEYS.places)) {
    localStorage.setItem(DB_KEYS.places, JSON.stringify(mockPlaces));
  }
  if (!localStorage.getItem(DB_KEYS.plans)) {
    localStorage.setItem(DB_KEYS.plans, JSON.stringify(mockPricingPlans));
  }
  if (!localStorage.getItem(DB_KEYS.gallery)) {
    localStorage.setItem(DB_KEYS.gallery, JSON.stringify(mockGalleryImages));
  }
  if (!localStorage.getItem(DB_KEYS.subscriptions)) {
    localStorage.setItem(DB_KEYS.subscriptions, "[]");
  }
  if (!localStorage.getItem(DB_KEYS.products)) {
    localStorage.setItem(DB_KEYS.products, "[]");
  }
  if (!localStorage.getItem(DB_KEYS.subscriptionRequests)) {
    localStorage.setItem(DB_KEYS.subscriptionRequests, "[]");
  }
  if (!localStorage.getItem(DB_KEYS.payments)) {
    localStorage.setItem(DB_KEYS.payments, "[]");
  }
  if (!localStorage.getItem(DB_KEYS.paymentProviders)) {
    localStorage.setItem(DB_KEYS.paymentProviders, "[]");
  }
  if (!localStorage.getItem(DB_KEYS.reservations)) {
    localStorage.setItem(DB_KEYS.reservations, "[]");
  }
  if (!localStorage.getItem(DB_KEYS.timeSlots)) {
    localStorage.setItem(DB_KEYS.timeSlots, "[]");
  }
  if (!localStorage.getItem(DB_KEYS.receipts)) {
    localStorage.setItem(DB_KEYS.receipts, "[]");
  }
  if (!localStorage.getItem(DB_KEYS.users)) {
    localStorage.setItem(DB_KEYS.users, JSON.stringify(initialUsers));
  }
  try {
    const rawUsers = localStorage.getItem(DB_KEYS.users) || "[]";
    const parsedUsers = JSON.parse(rawUsers);
    const hasAdmin = parsedUsers.some((u: any) => u.email && u.email.toLowerCase() === "admin@gmail.com");
    if (!hasAdmin) {
      const newAdmin = { id: generateId(parsedUsers), name: "Administrateur", email: "admin@gmail.com", password: "password", role: "Gestionnaire", lastLogin: null };
      parsedUsers.push(newAdmin);
      localStorage.setItem(DB_KEYS.users, JSON.stringify(parsedUsers));
    }
  } catch (e) {
    // ignore
  }
  if (!localStorage.getItem(DB_KEYS.stats)) {
    localStorage.setItem(DB_KEYS.stats, JSON.stringify({}));
  }
};

const generateId = (items: any[]): number => {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
};

export const db = {
  getAll<T>(key: string): T[] {
    if (!isBrowser()) return [];
    initializeDB();
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T[] : [];
  },

  getById<T = any>(key: string, id: number): T | undefined {
    const items = this.getAll<T>(key);
    return items.find((item: any) => item.id === id);
  },

  create<T = any>(key: string, data: any): T {
    if (!isBrowser()) return data as T;
    const items = this.getAll<T>(key);
    const newItem = { ...data, id: generateId(items) } as T;
    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));
    this.notifyChange(key);
    return newItem;
  },

  update<T = any>(key: string, id: number, data: any): T | undefined {
    if (!isBrowser()) return undefined;
    const items = this.getAll<T>(key);
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...data };
    localStorage.setItem(key, JSON.stringify(items));
    this.notifyChange(key);
    return items[index];
  },

  delete(key: string, id: number): boolean {
    if (!isBrowser()) return false;
    const items = this.getAll(key);
    const filtered = items.filter((item: any) => item.id !== id);
    if (filtered.length === items.length) return false;
    localStorage.setItem(key, JSON.stringify(filtered));
    this.notifyChange(key);
    return true;
  },

  setAll<T>(key: string, items: T[]): void {
    if (!isBrowser()) return;
    localStorage.setItem(key, JSON.stringify(items));
    this.notifyChange(key);
  },

  subscribe(callback: () => void): () => void {
    if (!isBrowser()) return () => {};
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  },

  notifyChange(key: string): void {
    if (!isBrowser()) return;
    window.dispatchEvent(new CustomEvent("db-change", { detail: { key } }));
  },

  reset(): void {
    if (!isBrowser()) return;
    Object.values(DB_KEYS).forEach((key) => localStorage.removeItem(key));
    initializeDB();
    this.notifyChange("reset");
  },
};

export const activitiesDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.activities),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.activities, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.activities, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.activities, id, data),
  delete: (id: number) => db.delete(DB_KEYS.activities, id),
};

export const trainersDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.trainers),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.trainers, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.trainers, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.trainers, id, data),
  delete: (id: number) => db.delete(DB_KEYS.trainers, id),
};

export const placesDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.places),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.places, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.places, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.places, id, data),
  delete: (id: number) => db.delete(DB_KEYS.places, id),
};

export const plansDB = {
  getAll: () => db.getAll(DB_KEYS.plans),
  getById: (id: string) => {
    const items = db.getAll(DB_KEYS.plans);
    return items.find((item: any) => item.id === id);
  },
  create: (data: any) => db.create(DB_KEYS.plans, data),
  update: (id: string, data: any) => {
    if (!isBrowser()) return undefined;
    const items: any[] = db.getAll(DB_KEYS.plans);
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...data };
    localStorage.setItem(DB_KEYS.plans, JSON.stringify(items));
    db.notifyChange(DB_KEYS.plans);
    return items[index];
  },
  delete: (id: string) => {
    if (!isBrowser()) return false;
    const items: any[] = db.getAll(DB_KEYS.plans);
    const filtered = items.filter((item: any) => item.id !== id);
    if (filtered.length === items.length) return false;
    localStorage.setItem(DB_KEYS.plans, JSON.stringify(filtered));
    db.notifyChange(DB_KEYS.plans);
    return true;
  },
};

export const subscriptionsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.subscriptions),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.subscriptions, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.subscriptions, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.subscriptions, id, data),
  delete: (id: number) => db.delete(DB_KEYS.subscriptions, id),
};

export const productsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.products),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.products, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.products, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.products, id, data),
  delete: (id: number) => db.delete(DB_KEYS.products, id),
};

export const subscriptionRequestsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.subscriptionRequests),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.subscriptionRequests, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.subscriptionRequests, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.subscriptionRequests, id, data),
  delete: (id: number) => db.delete(DB_KEYS.subscriptionRequests, id),
};

export const paymentsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.payments),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.payments, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.payments, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.payments, id, data),
  delete: (id: number) => db.delete(DB_KEYS.payments, id),
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
};

export const timeSlotsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.timeSlots),
  setAll: (items: any[]) => db.setAll(DB_KEYS.timeSlots, items),
};

export const receiptsDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.receipts),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.receipts, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.receipts, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.receipts, id, data),
  delete: (id: number) => db.delete(DB_KEYS.receipts, id),
};

export const usersDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.users),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.users, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.users, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.users, id, data),
  delete: (id: number) => db.delete(DB_KEYS.users, id),
};

export const galleryDB = {
  getAll: <T = any>() => db.getAll<T>(DB_KEYS.gallery),
  getById: <T = any>(id: number) => db.getById<T>(DB_KEYS.gallery, id),
  create: <T = any>(data: any) => db.create<T>(DB_KEYS.gallery, data),
  update: <T = any>(id: number, data: any) => db.update<T>(DB_KEYS.gallery, id, data),
  delete: (id: number) => db.delete(DB_KEYS.gallery, id),
  setAll: (items: any[]) => db.setAll(DB_KEYS.gallery, items),
};

export const statsDB = {
  get: () => {
    if (!isBrowser()) return null;
    initializeDB();
    const raw = localStorage.getItem(DB_KEYS.stats);
    return raw ? JSON.parse(raw) : null;
  },
  update: (data: any) => {
    if (!isBrowser()) return data;
    const current = statsDB.get() || {};
    const updated = { ...current, ...data };
    localStorage.setItem(DB_KEYS.stats, JSON.stringify(updated));
    db.notifyChange(DB_KEYS.stats);
    return updated;
  },
};

export const DB_KEYS_EXPORT = DB_KEYS;