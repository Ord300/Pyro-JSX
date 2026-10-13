import { activitiesDB, paymentsDB, receiptsDB, subscriptionRequestsDB, subscriptionsDB, usersDB } from "@/src/services/dbService";
import { notifyPaymentConfirmation } from "@/src/services/notifyService";
import { isSubscriptionActive } from "@/src/utils/subscriptionStatus";
import type { Activity } from "@/src/data/mockData";
import type { SubscriptionPlan } from "@/src/types/subscription";

export type RequestStatus = "En attente" | "Confirmée" | "Refusée";
export type ContactRequest = { id: number; name: string; email: string; phone: string; subject: string; description: string; createdAt: string; status: RequestStatus; activityId?: number | null; activityName?: string | null; planId?: string | null; planName?: string | null };

const normalizeRequest = (row: any): ContactRequest => ({ ...row, name: row.name ?? row.userName ?? "" });

export type PlanPeriod = "Week" | "Month" | "Year";

export const resolvePlanPeriod = (planId?: string | null, planName?: string | null): PlanPeriod => {
  const haystack = `${planId ?? ""} ${planName ?? ""}`.toLowerCase();
  if (haystack.includes("week") || haystack.includes("semaine")) return "Week";
  if (haystack.includes("month") || haystack.includes("mois") || haystack.includes("mensuel")) return "Month";
  return "Year";
};

export const addPeriod = (start: Date, period: PlanPeriod): Date => {
  const end = new Date(start);
  if (period === "Week") end.setDate(end.getDate() + 7);
  else if (period === "Month") end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return end;
};

export const subscriptionFlow = {
  requests: async () => {
    const rows = await subscriptionRequestsDB.getAll<any>();
    return rows.map(normalizeRequest);
  },
  requestByEmail: async (email: string) => {
    const requests = await subscriptionFlow.requests();
    return requests.filter((request) => request.email.toLowerCase() === email.trim().toLowerCase() && request.subject === "Inscription").sort((a, b) => b.id - a.id)[0];
  },
  requestsByEmail: async (email: string) => {
    const requests = await subscriptionFlow.requests();
    return requests.filter((request) => request.email.toLowerCase() === email.trim().toLowerCase()).sort((a, b) => b.id - a.id);
  },
  createRequest: async (data: Omit<ContactRequest, "id" | "createdAt" | "status"> & { activityId?: number; activityName?: string; planId?: string; planName?: string }) => {
    const created = await subscriptionRequestsDB.create<any>({
      userName: data.name,
      email: data.email,
      phone: data.phone,
      activityId: data.activityId ?? null,
      activityName: data.activityName ?? null,
      planId: data.planId ?? null,
      planName: data.planName ?? null,
      subject: data.subject,
      description: data.description,
      createdAt: new Date().toISOString(),
      status: "En attente",
    });
    const req = normalizeRequest(created);
    // NOTE : l'e-mail de confirmation + la notif in-app du demandeur ET l'alerte admin
    // sont envoyés côté serveur (POST /api/db/subscriptionRequests) — source unique, pas de doublon ici.
    return req;
  },
  setRequestStatus: (id: number, status: RequestStatus) => subscriptionRequestsDB.update<ContactRequest>(id, { status }),
  // Confirmation admin d'une demande : crée pour de vrai paiement + abonnement + reçu + compte.
  // Idempotent : si un abonnement existe déjà pour cette demande, aucun doublon n'est créé.
  confirmRequest: async (id: number) => {
    const rows = await subscriptionRequestsDB.getAll<any>();
    const row = rows.find((r) => Number(r.id) === Number(id));
    if (!row) throw new Error("Demande introuvable.");
    const email = String(row.email || "").trim().toLowerCase();
    if (!email.includes("@")) throw new Error("Email du demandeur invalide.");
    const name = row.name ?? row.userName ?? email.split("@")[0];
    const existingSubs = await subscriptionsDB.getAll<any>();
    const dup = existingSubs.find((s) => Number(s.requestId) === Number(id));
    if (dup) {
      if (row.status !== "Confirmée") await subscriptionRequestsDB.update(id, { status: "Confirmée" });
      return { subscription: dup, receipt: null, payment: null, duplicate: true };
    }
    const activities = await activitiesDB.getAll<Activity>();
    const activity = activities.find((a) => row.activityId != null && Number(a.id) === Number(row.activityId))
      ?? activities.find((a) => row.activityName && a.name === row.activityName);
    if (!activity) throw new Error("Activité introuvable pour cette demande.");
    const period = resolvePlanPeriod(row.planId, row.planName);
    const priceKey = period === "Week" ? "priceWeek" : period === "Month" ? "priceMonth" : "priceYear";
    const amount = Number((activity as any)[priceKey]);
    if (!Number.isFinite(amount) || amount < 0) throw new Error("Tarif indisponible pour cette demande.");
    const start = new Date();
    const end = addPeriod(start, period);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const paymentReference = `PAY-${Date.now()}`;
    const users = await usersDB.getAll<any>();
    const user = users.find((item) => String(item.email || "").toLowerCase() === email) ?? null;
    const payment = await paymentsDB.create<any>({
      userId: user?.id ?? 0,
      userName: user?.name ?? name,
      email,
      requestId: row.id,
      subscriptionId: null,
      activityId: activity.id,
      activityName: activity.name,
      amount,
      currency: "USD",
      method: "Espèces",
      status: "En attente",
      reference: paymentReference,
      phoneNumber: row.phone || "",
      description: `Abonnement ${row.planName || ""} - ${activity.name}`,
      createdAt: start.toISOString(),
      paidAt: null,
    });
    const memberNumber = `ABO-${start.getFullYear()}-${String(existingSubs.length + 1).padStart(4, "0")}`;
    const subscription = await subscriptionsDB.create<any>({
      requestId: row.id,
      userId: user?.id ?? 0,
      userName: user?.name ?? name,
      email,
      memberNumber,
      planId: row.planId ?? null,
      planName: row.planName ?? null,
      activityId: activity.id,
      activityName: activity.name,
      status: "Validée",
      startDate: startStr,
      endDate: endStr,
      amount,
      currency: "USD",
      paymentMethod: "Espèces",
      paymentReference,
      createdAt: start.toISOString(),
    });
    await paymentsDB.update(payment.id, { subscriptionId: subscription.id }).catch(() => {});
    const allReceipts = await receiptsDB.getAll<any>();
    const receipt = await receiptsDB.create<any>({
      reference: `REC-${start.getFullYear()}-${String(allReceipts.length + 1).padStart(4, "0")}`,
      subscriptionId: subscription.id,
      userId: user?.id ?? 0,
      userName: user?.name ?? name,
      email,
      phone: row.phone || user?.phone || "",
      memberNumber,
      type: "Abonnement",
      amount,
      currency: "USD",
      paymentMethod: "Espèces",
      paymentReference,
      description: `${activity.name} - ${row.planName || ""}`,
      date: startStr,
      status: "En attente",
      items: [{ label: `${activity.name} — ${row.planName || ""}`, quantity: 1, unitPrice: amount, total: amount }],
    });
    // Compte abonné : on ne touche JAMAIS au mot de passe existant.
    if (user) {
      await usersDB.update(user.id, {
        role: "Abonné",
        status: "Actif",
        ...(user.memberNumber ? {} : { memberNumber }),
      });
    } else {
      await usersDB.create({
        name: user?.name ?? name,
        email,
        phone: row.phone || "",
        role: "Abonné",
        status: "Actif",
        memberNumber,
        password: "Sport@2026",
        mustChangePassword: true,
        lastLogin: startStr,
      });
    }
    await subscriptionRequestsDB.update(id, { status: "Confirmée" });
    return { subscription, receipt, payment, duplicate: false };
  },
  // Souscription directe depuis l'espace abonné (assistant « Nouvel abonnement »).
  // Crée pour de vrai : paiement + abonnement + reçu + compte abonné.
  // Paiement simulé (mode démo) : téléphone valide => succès, sans transaction mobile réelle.
  subscribeDirectly: async ({ email, activityId, plan, method, phone }: {
    email: string;
    activityId: number;
    plan: Pick<SubscriptionPlan, "id" | "name" | "period">;
    method: "M-Pesa" | "Orange Money" | "Carte Bancaire" | "Espèces";
    phone: string;
  }) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@")) throw new Error("Session invalide : reconnectez-vous.");
    const cleanPhone = phone.replace(/[\s.\-]/g, "");
    // Téléphone exigé uniquement pour le Mobile Money (M-Pesa / Orange Money).
    if ((method === "M-Pesa" || method === "Orange Money") && !/^(\+243|0)\d{9}$/.test(cleanPhone)) {
      throw new Error("Numéro invalide. Format attendu : +243 XXX XXX XXX.");
    }
    const activities = await activitiesDB.getAll<Activity>();
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) throw new Error("Activité introuvable.");
    const period = resolvePlanPeriod((plan as any).id, plan.name);
    // Tarif réel de l'activité (source unique), pas le prix vitrine.
    const amount = Number(activity[`price${period}` as keyof Activity]);
    if (!Number.isFinite(amount) || amount < 0) throw new Error("Tarif indisponible pour cette formule.");
    const users = await usersDB.getAll<any>();
    const user = users.find((item) => String(item.email || "").toLowerCase() === cleanEmail) ?? null;
    const userName = user?.name || cleanEmail.split("@")[0];
    // Anti-doublon : un abonnement actif sur la même activité suffit.
    const existingSubscriptions = await subscriptionsDB.getAll<any>();
    const alreadyActive = existingSubscriptions.find(
      (s) => String(s.email || "").toLowerCase() === cleanEmail
        && Number(s.activityId) === Number(activityId)
        && isSubscriptionActive(s)
    );
    if (alreadyActive) return { subscription: alreadyActive, receipt: null, payment: null, duplicate: true, pending: false };
    const pending = method === "Espèces";
    const start = new Date();
    const end = addPeriod(start, period);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    const paymentReference = `PAY-${Date.now()}`;
    const payment = await paymentsDB.create<any>({
      userId: user?.id ?? 0,
      userName,
      email: cleanEmail,
      requestId: null,
      subscriptionId: null,
      activityId: activity.id,
      activityName: activity.name,
      amount,
      currency: "USD",
      method,
      status: pending ? "En attente" : "Réussi",
      reference: paymentReference,
      phoneNumber: cleanPhone,
      description: `Abonnement ${plan.name} - ${activity.name}`,
      createdAt: start.toISOString(),
      paidAt: pending ? null : start.toISOString(),
    });
    const memberNumber = `ABO-${start.getFullYear()}-${String(existingSubscriptions.length + 1).padStart(4, "0")}`;
    const subscription = await subscriptionsDB.create<any>({
      requestId: null,
      userId: user?.id ?? 0,
      userName,
      email: cleanEmail,
      memberNumber,
      planId: (plan as any).id ?? plan.name,
      planName: plan.name,
      activityId: activity.id,
      activityName: activity.name,
      status: pending ? "En attente" : "Validée",
      startDate: startStr,
      endDate: endStr,
      amount,
      currency: "USD",
      paymentMethod: method,
      paymentReference,
      createdAt: start.toISOString(),
    });
    await paymentsDB.update(payment.id, { subscriptionId: subscription.id }).catch(() => {});
    const allReceipts = await receiptsDB.getAll<any>();
    const receipt = await receiptsDB.create<any>({
      reference: `REC-${start.getFullYear()}-${String(allReceipts.length + 1).padStart(4, "0")}`,
      subscriptionId: subscription.id,
      userId: user?.id ?? 0,
      userName,
      email: cleanEmail,
      phone: user?.phone ?? cleanPhone,
      memberNumber,
      type: "Abonnement",
      amount,
      currency: "USD",
      paymentMethod: method,
      paymentReference,
      description: `${activity.name} - ${plan.name}`,
      date: startStr,
      status: pending ? "En attente" : "Payé",
      items: [{ label: `${activity.name} — ${plan.name}`, quantity: 1, unitPrice: amount, total: amount }],
    });
    // Compte abonné : on ne touche JAMAIS au mot de passe existant.
    if (user) {
      await usersDB.update(user.id, {
        role: "Abonné",
        status: "Actif",
        ...(user.memberNumber ? {} : { memberNumber }),
      });
    } else {
      await usersDB.create({
        name: userName,
        email: cleanEmail,
        phone: cleanPhone,
        role: "Abonné",
        status: "Actif",
        memberNumber,
        password: "Sport@2026",
        mustChangePassword: true,
        lastLogin: startStr,
      });
    }
    if (!pending) {
      notifyPaymentConfirmation("abonnement_valide", {
        email: cleanEmail,
        name: userName,
        activityName: activity.name,
        planName: plan.name,
        amount,
        currency: "USD",
        reference: receipt.reference,
        memberNumber,
        method,
        startDate: startStr,
        endDate: endStr,
      }).catch(() => {});
    }
    return { subscription, receipt, payment, duplicate: false, pending };
  },
  completePayment: async ({ request, activity, plan, method, phone }: { request: ContactRequest; activity: Activity; plan: SubscriptionPlan; method: "M-Pesa" | "Orange Money"; phone: string }) => {
    const existingSubscriptions = await subscriptionsDB.getAll<any>();
    const existing = existingSubscriptions.find((subscription) => subscription.requestId === request.id && subscription.status === "Validée");
    if (existing) {
      const receipts = await receiptsDB.getAll<any>();
      let receipt = receipts.find((receipt) => receipt.subscriptionId === existing.id);
      if (!receipt) {
        // Cas de reprise après échec partiel (paiement + abonnement OK, reçu manquant) : on régénère le reçu.
        const healedReceipts = await receiptsDB.getAll<any>();
        const start = new Date();
        receipt = await receiptsDB.create<any>({ reference: `REC-${start.getFullYear()}-${String(healedReceipts.length + 1).padStart(4, "0")}`, subscriptionId: existing.id, userId: 0, userName: request.name, email: request.email, phone: request.phone, memberNumber: existing.memberNumber ?? null, type: "Abonnement", amount: existing.amount, currency: existing.currency || "USD", paymentMethod: existing.paymentMethod, paymentReference: existing.paymentReference, description: `${activity.name} - ${plan.name}`, date: start.toISOString().slice(0, 10), status: "Payé", items: [{ label: `${activity.name} — ${plan.name}`, quantity: 1, unitPrice: existing.amount, total: existing.amount }] });
      }
      return { subscription: existing, receipt, duplicate: true, mailSent: false };
    }
    const start = new Date();
    const end = new Date(start);
    const priceKey = plan.period === "Mois" ? "priceMonth" : plan.period === "Semaine" ? "priceWeek" : "priceYear";
    if (plan.period === "Mois") end.setMonth(end.getMonth() + 1);
    else if (plan.period === "Semaine") end.setDate(end.getDate() + 7);
    else end.setFullYear(end.getFullYear() + 1);
    const payment = await paymentsDB.create<any>({ userId: 0, userName: request.name, email: request.email, requestId: request.id, activityId: activity.id, amount: activity[priceKey as keyof Activity], currency: "USD", method, status: "Réussi", reference: `PAY-${Date.now()}`, phoneNumber: phone, description: `Abonnement ${plan.period} - ${activity.name} - ${plan.name}`, createdAt: start.toISOString(), paidAt: start.toISOString() });
    const allSubscriptions = await subscriptionsDB.getAll<any>();
    const memberNumber = `ABO-${start.getFullYear()}-${String(allSubscriptions.length + 1).padStart(4, "0")}`;
    const subscription = await subscriptionsDB.create<any>({ requestId: request.id, userId: 0, userName: request.name, email: request.email, memberNumber, planId: plan.id, planName: plan.name, activityId: activity.id, activityName: activity.name, status: "Validée", startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), amount: payment.amount, currency: "USD", paymentMethod: method, paymentReference: payment.reference, createdAt: start.toISOString() });
    const allReceipts = await receiptsDB.getAll<any>();
    const receipt = await receiptsDB.create<any>({ reference: `REC-${start.getFullYear()}-${String(allReceipts.length + 1).padStart(4, "0")}`, subscriptionId: subscription.id, userId: 0, userName: request.name, email: request.email, phone: request.phone, memberNumber, type: "Abonnement", amount: payment.amount, currency: "USD", paymentMethod: method, paymentReference: payment.reference, description: `${activity.name} - ${plan.name}`, date: start.toISOString().slice(0, 10), status: "Payé", items: [{ label: `${activity.name} — ${plan.name}`, quantity: 1, unitPrice: payment.amount, total: payment.amount }] });
    const users = await usersDB.getAll<any>();
    const user = users.find((item) => item.email.toLowerCase() === request.email.toLowerCase());
    // Compte abonné : on ne touche JAMAIS au mot de passe existant.
    if (user) {
      await usersDB.update(user.id, {
        role: "Abonné",
        status: "Actif",
        ...(user.memberNumber ? {} : { memberNumber }),
      });
    } else {
      await usersDB.create({
        name: request.name,
        email: request.email,
        phone: request.phone,
        role: "Abonné",
        status: "Actif",
        memberNumber,
        password: "Sport@2026",
        mustChangePassword: true,
        lastLogin: start.toISOString().slice(0, 10),
      });
    }
    localStorage.setItem("current_subscriber_email", request.email.toLowerCase());
    // On attend le verdict e-mail pour afficher un message honnête (envoyé vs simulé).
    const mail = await notifyPaymentConfirmation("abonnement_valide", {
      email: request.email,
      name: request.name,
      activityName: activity.name,
      planName: plan.name,
      amount: payment.amount,
      currency: "USD",
      reference: receipt.reference,
      memberNumber,
      method,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
    }).catch(() => ({ emailed: false, simulated: true }));
    return { subscription, receipt, duplicate: false, mailSent: mail.emailed && !mail.simulated };
  },
  renewSubscription: async ({ subscription, method, phone }: { subscription: any; method: "M-Pesa" | "Orange Money"; phone: string }) => {
    const cleanPhone = String(phone || "").replace(/[\s.\-]/g, "");
    if (!/^(\+243|0)\d{9}$/.test(cleanPhone)) {
      throw new Error("Numéro invalide. Format attendu : +243 XXX XXX XXX.");
    }
    const activities = await activitiesDB.getAll<any>();
    const activity = activities.find((item) => item.id === subscription.activityId);
    const period = resolvePlanPeriod(subscription.planId, subscription.planName);
    const start = new Date();
    const currentEnd = new Date(subscription.endDate);
    const end = addPeriod(currentEnd.getTime() > start.getTime() ? currentEnd : start, period);
    const catalogAmount = activity ? Number(activity[`price${period}` as keyof Activity]) : NaN;
    const amount = Number.isFinite(catalogAmount) ? catalogAmount : Number(subscription.amount);
    if (!Number.isFinite(amount) || amount < 0) throw new Error("Tarif indisponible pour ce renouvellement.");
    const payment = await paymentsDB.create<any>({ userId: subscription.userId ?? 0, userName: subscription.userName, email: subscription.email, requestId: null, subscriptionId: subscription.id, activityId: subscription.activityId ?? null, amount, currency: subscription.currency || "USD", method, status: "Réussi", reference: `PAY-${Date.now()}`, phoneNumber: cleanPhone, description: `Renouvellement ${subscription.planName} - ${subscription.activityName}`, createdAt: start.toISOString(), paidAt: start.toISOString() });
    // Le renouvellement réactive l'abonnement : repasse au statut Validée.
    const updated = await subscriptionsDB.update<any>(subscription.id, { endDate: end.toISOString().slice(0, 10), amount, status: "Validée", paymentMethod: method, paymentReference: payment.reference });
    const allReceipts = await receiptsDB.getAll<any>();
    const receipt = await receiptsDB.create<any>({ reference: `REC-${start.getFullYear()}-${String(allReceipts.length + 1).padStart(4, "0")}`, subscriptionId: subscription.id, userId: subscription.userId ?? 0, userName: subscription.userName, email: subscription.email, memberNumber: subscription.memberNumber ?? null, type: "Renouvellement", amount, currency: subscription.currency || "USD", paymentMethod: method, paymentReference: payment.reference, description: `${subscription.activityName} - ${subscription.planName}`, date: start.toISOString().slice(0, 10), status: "Payé", items: [{ label: `Renouvellement ${subscription.activityName} — ${subscription.planName}`, quantity: 1, unitPrice: amount, total: amount }] });
    notifyPaymentConfirmation("renouvellement", {
      email: subscription.email,
      name: subscription.userName,
      activityName: subscription.activityName,
      planName: subscription.planName,
      amount,
      currency: subscription.currency || "USD",
      reference: receipt.reference,
      memberNumber: subscription.memberNumber,
      method,
      endDate: end.toISOString().slice(0, 10),
    }).catch(() => {});
    return { subscription: updated ?? { ...subscription, endDate: end.toISOString().slice(0, 10), amount, status: "Validée" }, receipt };
  },
};
