import type { Payment, PaymentRequest, PaymentResponse, PaymentMethod } from "@/src/types/payment";
import { paymentsDB, paymentProvidersDB } from "@/src/services/dbService";

// ============================================================
// SERVICE DE PAIEMENT MOCK
// Simule les API M-Pesa / Orange Money
// ============================================================

const generateReference = (): string => {
  const year = new Date().getFullYear();
  const payments = paymentsDB.getAll<Payment>();
  const nextNum = payments.length + 1;
  return `PAY-${year}-${String(nextNum).padStart(4, "0")}`;
};

const simulateNetworkDelay = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 1500));
};

const validatePhoneNumber = (phone: string): boolean => {
  const regex = /^(\+243|0)\d{9}$/;
  return regex.test(phone.replace(/\s/g, ""));
};

const mockMpesaRequest = async (phone: string, amount: number): Promise<{ success: boolean; message: string }> => {
  await simulateNetworkDelay();
  if (!validatePhoneNumber(phone)) {
    return { success: false, message: "Numéro M-Pesa invalide. Format attendu: +243 XXX XXX XXX" };
  }
  const success = Math.random() > 0.1;
  return success
    ? { success: true, message: "Paiement M-Pesa confirmé" }
    : { success: false, message: "Transaction M-Pesa échouée. Veuillez réessayer." };
};

const mockOrangeMoneyRequest = async (phone: string, amount: number): Promise<{ success: boolean; message: string }> => {
  await simulateNetworkDelay();
  if (!validatePhoneNumber(phone)) {
    return { success: false, message: "Numéro Orange Money invalide. Format attendu: +243 XXX XXX XXX" };
  }
  const success = Math.random() > 0.1;
  return success
    ? { success: true, message: "Paiement Orange Money confirmé" }
    : { success: false, message: "Transaction Orange Money échouée. Veuillez réessayer." };
};

const mockCardRequest = async (): Promise<{ success: boolean; message: string }> => {
  await simulateNetworkDelay();
  const success = Math.random() > 0.1;
  return success
    ? { success: true, message: "Paiement par carte confirmé" }
    : { success: false, message: "Paiement par carte refusé. Vérifiez vos informations." };
};

export const processPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  let providerResult: { success: boolean; message: string };

  switch (request.method) {
    case "M-Pesa":
      providerResult = await mockMpesaRequest(request.phoneNumber || "", request.amount);
      break;
    case "Orange Money":
      providerResult = await mockOrangeMoneyRequest(request.phoneNumber || "", request.amount);
      break;
    case "Carte Bancaire":
      providerResult = await mockCardRequest();
      break;
    default:
      providerResult = { success: true, message: "Paiement en espèces à confirmer à la réception" };
  }

  const reference = generateReference();

  if (providerResult.success) {
    const payment = paymentsDB.create<Payment>({
      userId: 1,
      userName: "Jean Dupont",
      amount: request.amount,
      currency: request.currency,
      method: request.method,
      status: request.method === "Espèces" ? "En attente" : "Réussi",
      reference,
      phoneNumber: request.phoneNumber,
      description: request.description,
      createdAt: new Date().toISOString(),
      paidAt: request.method === "Espèces" ? undefined : new Date().toISOString(),
    });

    return {
      success: true,
      reference,
      message: providerResult.message,
      payment,
    };
  }

  return {
    success: false,
    reference,
    message: providerResult.message,
  };
};

export const getPayments = (): Payment[] => {
  return paymentsDB.getAll<Payment>();
};

export const getPaymentsByUser = (userId: number): Payment[] => {
  return paymentsDB.getAll<Payment>().filter((p) => p.userId === userId);
};

export const getPaymentByReference = (reference: string): Payment | undefined => {
  return paymentsDB.getAll<Payment>().find((p) => p.reference === reference);
};

export const checkPaymentStatus = (reference: string): Payment | undefined => {
  return getPaymentByReference(reference);
};

export const refundPayment = (reference: string): Payment | undefined => {
  const payment = getPaymentByReference(reference);
  if (payment) {
    return paymentsDB.update<Payment>(payment.id, { status: "Remboursé" });
  }
  return undefined;
};

export const getPaymentProviders = () => paymentProvidersDB.getAll();