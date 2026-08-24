import { activitiesDB, paymentsDB, receiptsDB, subscriptionRequestsDB, subscriptionsDB, usersDB } from "@/src/services/dbService";
import type { Activity } from "@/src/data/mockData";
import type { SubscriptionPlan } from "@/src/types/subscription";

export type RequestStatus = "En attente" | "Confirmée" | "Refusée";
export type ContactRequest = { id: number; name: string; email: string; phone: string; subject: string; description: string; createdAt: string; status: RequestStatus };

export const subscriptionFlow = {
  requests: () => subscriptionRequestsDB.getAll<ContactRequest>(),
  requestByEmail: async (email: string) => {
    const requests = await subscriptionFlow.requests();
    return requests.filter((request) => request.email.toLowerCase() === email.trim().toLowerCase() && request.subject === "Demande d'abonnement").sort((a, b) => b.id - a.id)[0];
  },
  createRequest: (data: Omit<ContactRequest, "id" | "createdAt" | "status">) => subscriptionRequestsDB.create<ContactRequest>({ ...data, createdAt: new Date().toISOString(), status: "En attente" }),
  setRequestStatus: (id: number, status: RequestStatus) => subscriptionRequestsDB.update<ContactRequest>(id, { status }),
  completePayment: async ({ request, activity, plan, method, phone }: { request: ContactRequest; activity: Activity; plan: SubscriptionPlan; method: "M-Pesa" | "Orange Money"; phone: string }) => {
    const existingSubscriptions = await subscriptionsDB.getAll<any>();
    const existing = existingSubscriptions.find((subscription) => subscription.requestId === request.id && subscription.status === "Validée");
    if (existing) {
      const receipts = await receiptsDB.getAll<any>();
      return { subscription: existing, receipt: receipts.find((receipt) => receipt.subscriptionId === existing.id), duplicate: true };
    }
    const start = new Date();
    const end = new Date(start);
    if (plan.period === "Semaine") end.setDate(end.getDate() + 7);
    else if (plan.period === "Mois") end.setMonth(end.getMonth() + 1);
    else end.setFullYear(end.getFullYear() + 1);
    const payment = await paymentsDB.create<any>({ userId: 0, userName: request.name, email: request.email, requestId: request.id, activityId: activity.id, planId: plan.id, amount: activity[`price${plan.period === "Semaine" ? "Week" : plan.period === "Mois" ? "Month" : "Year"}` as keyof Activity], currency: "USD", method, status: "Réussi", reference: `PAY-${Date.now()}`, phoneNumber: phone, description: `Abonnement ${plan.period} - ${activity.name}`, createdAt: start.toISOString(), paidAt: start.toISOString() });
    const allSubscriptions = await subscriptionsDB.getAll<any>();
    const memberNumber = `ABO-${start.getFullYear()}-${String(allSubscriptions.length + 1).padStart(4, "0")}`;
    const subscription = await subscriptionsDB.create<any>({ requestId: request.id, userId: 0, userName: request.name, email: request.email, memberNumber, planId: plan.id, planName: plan.name, activityId: activity.id, activityName: activity.name, status: "Validée", startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), amount: payment.amount, currency: "USD", paymentMethod: method, paymentReference: payment.reference, createdAt: start.toISOString() });
    const allReceipts = await receiptsDB.getAll<any>();
    const receipt = await receiptsDB.create<any>({ reference: `REC-${start.getFullYear()}-${String(allReceipts.length + 1).padStart(4, "0")}`, subscriptionId: subscription.id, userId: 0, userName: request.name, email: request.email, phone: request.phone, memberNumber, type: "Abonnement", amount: payment.amount, currency: "USD", paymentMethod: method, paymentReference: payment.reference, description: `${activity.name} - ${plan.name}`, date: start.toISOString().slice(0, 10), status: "Payé", items: [{ label: `${activity.name} — ${plan.name}`, quantity: 1, unitPrice: payment.amount, total: payment.amount }] });
    const users = await usersDB.getAll<any>();
    const user = users.find((item) => item.email.toLowerCase() === request.email.toLowerCase());
    const accountData = { role: "Abonné", status: "Actif", memberNumber, password: "Sport@2026", mustChangePassword: true };
    if (user) await usersDB.update(user.id, accountData);
    else await usersDB.create({ name: request.name, email: request.email, phone: request.phone, ...accountData, lastLogin: start.toISOString().slice(0, 10) });
    localStorage.setItem("current_subscriber_email", request.email.toLowerCase());
    return { subscription, receipt, duplicate: false };
  },
};
