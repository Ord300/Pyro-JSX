import { prisma } from "@/src/lib/prisma";
import {
  mockActivities,
  mockTrainers,
  mockPlaces,
  mockPricingPlans,
  mockGalleryImages,
  mockProducts,
} from "@/src/data/mockData";
import { mockPaymentProviders } from "@/src/data/paymentData";

type Delegate = {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  deleteMany: (args?: any) => Promise<any>;
  createMany?: (args: any) => Promise<any>;
};

export type ResourceConfig = {
  model: () => Delegate;
  jsonFields: Record<string, string>;
};

const RESOURCES: Record<string, ResourceConfig> = {
  activities: { model: () => prisma.activity, jsonFields: {} },
  trainers: {
    model: () => prisma.trainer,
    jsonFields: { activities: "activitiesJson", social: "socialJson" },
  },
  places: { model: () => prisma.place, jsonFields: {} },
  plans: {
    model: () => prisma.pricingPlan,
    jsonFields: { features: "featuresJson" },
  },
  subscriptions: { model: () => prisma.subscription, jsonFields: {} },
  products: { model: () => prisma.product, jsonFields: {} },
  subscriptionRequests: { model: () => prisma.subscriptionRequest, jsonFields: {} },
  payments: { model: () => prisma.payment, jsonFields: { items: "itemsJson" } },
  paymentProviders: { model: () => prisma.paymentProvider, jsonFields: {} },
  reservations: { model: () => prisma.reservation, jsonFields: {} },
  attendances: { model: () => prisma.attendance, jsonFields: {} },
  timeSlots: { model: () => prisma.timeSlot, jsonFields: {} },
  receipts: { model: () => prisma.receipt, jsonFields: { items: "itemsJson" } },
  users: { model: () => prisma.user, jsonFields: {} },
  gallery: { model: () => prisma.galleryImage, jsonFields: {} },
  messages: { model: () => prisma.message, jsonFields: {} },
  notifications: { model: () => prisma.notification, jsonFields: {} },
};

export function getResource(name: string): ResourceConfig | undefined {
  return RESOURCES[name];
}

function serializeOut(resource: string, record: any, config: ResourceConfig): any {
  const out = { ...record };
  for (const [publicName, column] of Object.entries(config.jsonFields)) {
    const raw = out[column];
    if (!raw) {
      out[publicName] = publicName === "social" ? {} : [];
    } else if (typeof raw !== "string") {
      out[publicName] = raw;
    } else {
      try {
        out[publicName] = JSON.parse(raw);
      } catch {
        console.error(`[DB] ${resource}#${(record as any)?.id} — champ JSON corrompu (${String(column)}), valeur par défaut utilisée.`);
        out[publicName] = publicName === "social" ? {} : [];
      }
    }
    delete out[column];
  }
  if (resource === "users") delete out.password;
  return out;
}

function serializeIn(data: any, config: ResourceConfig): any {
  const out: any = {};
  for (const [key, value] of Object.entries(data)) {
    const column = config.jsonFields[key];
    if (column) {
      out[column] = JSON.stringify(value ?? (key === "social" ? {} : []));
    } else {
      out[key] = value;
    }
  }
  return out;
}

export async function listRecords(resource: string): Promise<any[]> {
  const config = getResource(resource);
  if (!config) throw new Error(`Ressource inconnue: ${resource}`);
  // Sans orderBy : SQLite renvoie l'ordre d'insertion (comportement identique à l'ancien stockage local).
  const rows = await config.model().findMany();
  return rows.map((row) => serializeOut(resource, row, config));
}

export async function getRecord(resource: string, id: string): Promise<any | null> {
  const config = getResource(resource);
  if (!config) throw new Error(`Ressource inconnue: ${resource}`);
  const where = Number.isNaN(Number(id)) ? id : Number(id);
  const row =
    (await config.model().findUnique({ where: { id: where } as any })) ??
    (Number.isNaN(Number(id)) ? await config.model().findFirst({ where: { id } as any }) : null);
  return row ? serializeOut(resource, row, config) : null;
}

export async function createRecord(resource: string, data: any): Promise<any> {
  const config = getResource(resource);
  if (!config) throw new Error(`Ressource inconnue: ${resource}`);
  const payload = serializeIn(data, config);
  delete payload.id;
  try {
    const row = await config.model().create({ data: payload });
    return serializeOut(resource, row, config);
  } catch (e: any) {
    // Compat : serveur dev non redémarré après `prisma db push` (ancien client sans minAge/maxAge)
    if (resource === "activities" && /Unknown argument `(minAge|maxAge)`/.test(e?.message ?? "")) {
      delete payload.minAge;
      delete payload.maxAge;
      const row = await config.model().create({ data: payload });
      return serializeOut(resource, row, config);
    }
    throw e;
  }
}

export async function updateRecord(resource: string, id: string, data: any): Promise<any | null> {
  const config = getResource(resource);
  if (!config) throw new Error(`Ressource inconnue: ${resource}`);
  const where = Number.isNaN(Number(id)) ? id : Number(id);
  const existing = await config.model().findUnique({ where: { id: where } as any });
  if (!existing) return null;
  const payload = serializeIn(data, config);
  delete payload.id;
  try {
    const row = await config.model().update({ where: { id: where } as any, data: payload });
    return serializeOut(resource, row, config);
  } catch (e: any) {
    if (resource === "activities" && /Unknown argument `(minAge|maxAge)`/.test(e?.message ?? "")) {
      delete payload.minAge;
      delete payload.maxAge;
      const row = await config.model().update({ where: { id: where } as any, data: payload });
      return serializeOut(resource, row, config);
    }
    throw e;
  }
}

export async function deleteRecord(resource: string, id: string): Promise<boolean> {
  const config = getResource(resource);
  if (!config) throw new Error(`Ressource inconnue: ${resource}`);
  const where = Number.isNaN(Number(id)) ? id : Number(id);
  try {
    await config.model().delete({ where: { id: where } as any });
    return true;
  } catch {
    return false;
  }
}

export async function replaceTimeSlots(items: any[]): Promise<void> {
  await prisma.$transaction([
    prisma.timeSlot.deleteMany(),
    prisma.timeSlot.createMany({
      data: items.map((slot) => ({
        time: String(slot.time),
        available: slot.available !== false,
        capacity: Number(slot.capacity) || 0,
        booked: Number(slot.booked) || 0,
      })),
    }),
  ]);
}

export async function getStats(): Promise<Record<string, any>> {
  const row = await ensureStatsRow();
  return JSON.parse(row.data);
}

export async function updateStats(partial: Record<string, any>): Promise<Record<string, any>> {
  const current = await getStats();
  const merged = { ...current, ...partial };
  await prisma.stat.update({
    where: { id: 1 },
    data: { data: JSON.stringify(merged) },
  });
  return merged;
}

async function ensureStatsRow() {
  const existing = await prisma.stat.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.stat.create({ data: { id: 1, data: "{}" } });
}

async function seedActivitiesAndContent() {
  await prisma.activity.createMany({
    data: mockActivities.map(({ ...a }: any) => ({ ...a })),
  });
  await prisma.trainer.createMany({
    data: mockTrainers.map((t: any) => ({
      name: t.name,
      email: t.email ?? "",
      specialty: t.specialty,
      experience: t.experience,
      bio: t.bio,
      image: t.image,
      activitiesJson: JSON.stringify(t.activities),
      socialJson: JSON.stringify(t.social),
    })),
  });
  await prisma.place.createMany({ data: mockPlaces.map((p: any) => ({ ...p })) });
  await prisma.pricingPlan.createMany({
    data: mockPricingPlans.map((p: any) => ({
      id: p.id,
      name: p.name,
      period: p.period,
      price: p.price,
      currency: p.currency,
      popular: p.popular,
      featuresJson: JSON.stringify(p.features),
    })),
  });
  await prisma.galleryImage.createMany({ data: mockGalleryImages.map((g: any) => ({ ...g })) });
  await prisma.product.createMany({
    data: mockProducts.map((p: any) => ({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      image: p.image,
      description: p.description,
    })),
  });
  await prisma.paymentProvider.createMany({ data: mockPaymentProviders.map((p: any) => ({ ...p })) });
  await prisma.user.create({
    data: {
      name: "Administrateur",
      email: "admin@gmail.com",
      password: "password",
      role: "Gestionnaire",
      status: "Actif",
    },
  });
  await ensureStatsRow();
}

let seeding: Promise<void> | null = null;

export async function ensureSeed(): Promise<void> {
  if (!seeding) {
    seeding = (async () => {
      const count = await prisma.activity.count();
      if (count === 0) {
        await seedActivitiesAndContent();
      } else {
        // Si les produits ont été supprimés manuellement, on les ré-alimente pour que la boutique ne soit jamais vide
        const productCount = await prisma.product.count();
        if (productCount === 0) {
          await prisma.product.createMany({
            data: mockProducts.map((p: any) => ({
              name: p.name,
              category: p.category,
              price: p.price,
              stock: p.stock,
              image: p.image,
              description: p.description,
            })),
          });
        }
      }
    })().catch((error) => {
      seeding = null;
      throw error;
    });
  }
  return seeding;
}

export async function resetDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.receipt.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.subscriptionRequest.deleteMany(),
    prisma.reservation.deleteMany(),
    prisma.timeSlot.deleteMany(),
    prisma.product.deleteMany(),
    prisma.galleryImage.deleteMany(),
    prisma.pricingPlan.deleteMany(),
    prisma.place.deleteMany(),
    prisma.trainer.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.paymentProvider.deleteMany(),
    prisma.message.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.user.deleteMany(),
    prisma.stat.deleteMany(),
  ]);
  seeding = null;
  await ensureSeed();
}
