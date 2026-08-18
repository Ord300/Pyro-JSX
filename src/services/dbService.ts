// ============================================================
// SERVICE DE BASE DE DONNÉES LOCAL (localStorage)
// Synchronise les données entre l'admin et le reste du site
// ============================================================

// Par défaut la base ne crée aucun utilisateur ni données préremplies.
const initialUsers: any[] = [];

const DB_KEYS = {
  activities: 'db_activities',
  trainers: 'db_trainers',
  places: 'db_places',
  plans: 'db_plans',
  subscriptions: 'db_subscriptions',
  products: 'db_products',
  subscriptionRequests: 'db_subscription_requests',
  payments: 'db_payments',
  paymentProviders: 'db_payment_providers',
  reservations: 'db_reservations',
  timeSlots: 'db_time_slots',
  receipts: 'db_receipts',
  users: 'db_users',
  stats: 'db_stats',
};

// Bump seed version to force clearing previous seeded data so admin starts empty
const SEED_VERSION = '3';

// Initialise la base vide ; les données affichées proviennent de vos saisies.
const initializeDB = () => {
  if (localStorage.getItem('db_seed_version') !== SEED_VERSION) {
    Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.setItem('db_seed_version', SEED_VERSION);
  }
  if (!localStorage.getItem(DB_KEYS.activities)) {
    localStorage.setItem(DB_KEYS.activities, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.trainers)) {
    localStorage.setItem(DB_KEYS.trainers, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.places)) {
    localStorage.setItem(DB_KEYS.places, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.plans)) {
    localStorage.setItem(DB_KEYS.plans, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.subscriptions)) {
    localStorage.setItem(DB_KEYS.subscriptions, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.products)) {
    localStorage.setItem(DB_KEYS.products, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.subscriptionRequests)) {
    localStorage.setItem(DB_KEYS.subscriptionRequests, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.payments)) {
    localStorage.setItem(DB_KEYS.payments, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.paymentProviders)) {
    localStorage.setItem(DB_KEYS.paymentProviders, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.reservations)) {
    localStorage.setItem(DB_KEYS.reservations, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.timeSlots)) {
    localStorage.setItem(DB_KEYS.timeSlots, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.receipts)) {
    localStorage.setItem(DB_KEYS.receipts, '[]');
  }
  if (!localStorage.getItem(DB_KEYS.users)) {
    localStorage.setItem(DB_KEYS.users, JSON.stringify(initialUsers));
  }
  // Ensure an admin account exists (créé une seule fois)
  try {
    const rawUsers = localStorage.getItem(DB_KEYS.users) || '[]';
    const parsedUsers = JSON.parse(rawUsers);
    const hasAdmin = parsedUsers.some((u: any) => u.email && u.email.toLowerCase() === 'admin@gmail.com');
    if (!hasAdmin) {
      const newAdmin = { id: generateId(parsedUsers), name: 'Administrateur', email: 'admin@gmail.com', password: 'password', role: 'Gestionnaire', lastLogin: null };
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

// Génère un nouvel ID
const generateId = (items: any[]): number => {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
};

// ============================================================
// CRUD GÉNÉRIQUE
// ============================================================

export const db = {
  // Lire tous les éléments d'une collection
  getAll<T>(key: string): T[] {
    initializeDB();
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T[] : [];
  },

  // Lire un élément par ID
  getById<T = any>(key: string, id: number): T | undefined {
    const items = this.getAll<T>(key);
    return items.find((item: any) => item.id === id);
  },

  // Créer un élément
  create<T = any>(key: string, data: any): T {
    const items = this.getAll<T>(key);
    const newItem = { ...data, id: generateId(items) } as T;
    items.push(newItem);
    localStorage.setItem(key, JSON.stringify(items));
    this.notifyChange(key);
    return newItem;
  },

  // Mettre à jour un élément
  update<T = any>(key: string, id: number, data: any): T | undefined {
    const items = this.getAll<T>(key);
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...data };
    localStorage.setItem(key, JSON.stringify(items));
    this.notifyChange(key);
    return items[index];
  },

  // Supprimer un élément
  delete(key: string, id: number): boolean {
    const items = this.getAll(key);
    const filtered = items.filter((item: any) => item.id !== id);
    if (filtered.length === items.length) return false;
    localStorage.setItem(key, JSON.stringify(filtered));
    this.notifyChange(key);
    return true;
  },

  // Remplacer toute la collection
  setAll<T>(key: string, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
    this.notifyChange(key);
  },

  // Écouter les changements
  subscribe(callback: () => void): () => void {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  },

  // Notifier les changements (pour les onglets multiples)
  notifyChange(key: string): void {
    window.dispatchEvent(new CustomEvent('db-change', { detail: { key } }));
  },

  // Réinitialiser la base de données
  reset(): void {
    Object.values(DB_KEYS).forEach((key) => localStorage.removeItem(key));
    initializeDB();
    this.notifyChange('reset');
  },
};

// ============================================================
// COLLECTIONS SPÉCIFIQUES
// ============================================================

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
    const items: any[] = db.getAll(DB_KEYS.plans);
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...data };
    localStorage.setItem(DB_KEYS.plans, JSON.stringify(items));
    db.notifyChange(DB_KEYS.plans);
    return items[index];
  },
  delete: (id: string) => {
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

export const statsDB = {
  get: () => {
    initializeDB();
    const raw = localStorage.getItem(DB_KEYS.stats);
    return raw ? JSON.parse(raw) : null;
  },
  update: (data: any) => {
    const current = statsDB.get() || {};
    const updated = { ...current, ...data };
    localStorage.setItem(DB_KEYS.stats, JSON.stringify(updated));
    db.notifyChange(DB_KEYS.stats);
    return updated;
  },
};

// Export des clés pour usage externe
export const DB_KEYS_EXPORT = DB_KEYS;
