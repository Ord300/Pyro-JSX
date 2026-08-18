import type { Payment, PaymentRequest, PaymentResponse, PaymentMethod } from '../types/payment';
import { paymentsDB, paymentProvidersDB } from './dbService';

// ============================================================
// SERVICE DE PAIEMENT MOCK
// Simule les API M-Pesa / Orange Money
// Architecture prête pour les vraies API (sans données sensibles)
// ============================================================

// Configuration des endpoints réels (à décommenter pour production)
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const MPESA_API_URL = `${API_BASE_URL}/payments/mpesa`;
// const ORANGE_MONEY_API_URL = `${API_BASE_URL}/payments/orange-money`;

const generateReference = (): string => {
  const year = new Date().getFullYear();
  const payments = paymentsDB.getAll<Payment>();
  const nextNum = payments.length + 1;
  return `PAY-${year}-${String(nextNum).padStart(4, '0')}`;
};

const simulateNetworkDelay = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 1500));
};

// Simule la vérification du numéro de téléphone
const validatePhoneNumber = (phone: string): boolean => {
  // Format: +243 XXX XXX XXX (RDC) ou 0XXX XXX XXX
  const regex = /^(\+243|0)\d{9}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

// Simule la réponse de l'API M-Pesa
const mockMpesaRequest = async (phone: string, amount: number): Promise<{ success: boolean; message: string }> => {
  await simulateNetworkDelay();
  if (!validatePhoneNumber(phone)) {
    return { success: false, message: 'Numéro M-Pesa invalide. Format attendu: +243 XXX XXX XXX' };
  }
  // 90% de chance de succès pour la simulation
  const success = Math.random() > 0.1;
  return success
    ? { success: true, message: 'Paiement M-Pesa confirmé' }
    : { success: false, message: 'Transaction M-Pesa échouée. Veuillez réessayer.' };
};

// Simule la réponse de l'API Orange Money
const mockOrangeMoneyRequest = async (phone: string, amount: number): Promise<{ success: boolean; message: string }> => {
  await simulateNetworkDelay();
  if (!validatePhoneNumber(phone)) {
    return { success: false, message: 'Numéro Orange Money invalide. Format attendu: +243 XXX XXX XXX' };
  }
  const success = Math.random() > 0.1;
  return success
    ? { success: true, message: 'Paiement Orange Money confirmé' }
    : { success: false, message: 'Transaction Orange Money échouée. Veuillez réessayer.' };
};

// Simule la réponse de l'API Carte Bancaire
const mockCardRequest = async (): Promise<{ success: boolean; message: string }> => {
  await simulateNetworkDelay();
  const success = Math.random() > 0.1;
  return success
    ? { success: true, message: 'Paiement par carte confirmé' }
    : { success: false, message: 'Paiement par carte refusé. Vérifiez vos informations.' };
};

// Point d'entrée principal pour initier un paiement
// En production, remplacer par des appels fetch/axios vers les vraies API
export const processPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  let providerResult: { success: boolean; message: string };

  switch (request.method) {
    case 'M-Pesa':
      providerResult = await mockMpesaRequest(request.phoneNumber || '', request.amount);
      break;
    case 'Orange Money':
      providerResult = await mockOrangeMoneyRequest(request.phoneNumber || '', request.amount);
      break;
    case 'Carte Bancaire':
      providerResult = await mockCardRequest();
      break;
    default:
      // Espèces - paiement à la réception
      providerResult = { success: true, message: 'Paiement en espèces à confirmer à la réception' };
  }

  const reference = generateReference();

  if (providerResult.success) {
    const payment = paymentsDB.create<Payment>({
      userId: 1, // TODO: Remplacer par l'utilisateur connecté
      userName: 'Jean Dupont', // TODO: Remplacer par l'utilisateur connecté
      amount: request.amount,
      currency: request.currency,
      method: request.method,
      status: request.method === 'Espèces' ? 'En attente' : 'Réussi',
      reference,
      phoneNumber: request.phoneNumber,
      description: request.description,
      createdAt: new Date().toISOString(),
      paidAt: request.method === 'Espèces' ? undefined : new Date().toISOString(),
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

// Récupère tous les paiements
export const getPayments = (): Payment[] => {
  return paymentsDB.getAll<Payment>();
};

// Récupère les paiements d'un utilisateur
export const getPaymentsByUser = (userId: number): Payment[] => {
  return paymentsDB.getAll<Payment>().filter((p) => p.userId === userId);
};

// Récupère un paiement par référence
export const getPaymentByReference = (reference: string): Payment | undefined => {
  return paymentsDB.getAll<Payment>().find((p) => p.reference === reference);
};

// Vérifie le statut d'un paiement
export const checkPaymentStatus = (reference: string): Payment | undefined => {
  return getPaymentByReference(reference);
};

// Rembourse un paiement
export const refundPayment = (reference: string): Payment | undefined => {
  const payment = getPaymentByReference(reference);
  if (payment) {
    return paymentsDB.update<Payment>(payment.id, { status: 'Remboursé' });
  }
  return undefined;
};

// Export des providers disponibles
export const getPaymentProviders = () => paymentProvidersDB.getAll();

// ============================================================
// ARCHITECTURE POUR LES VRAIES API (à décommenter en production)
// ============================================================
/*
export const processMpesaPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  const response = await fetch(MPESA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      phone: request.phoneNumber,
      description: request.description,
    }),
  });
  return response.json();
};

export const processOrangeMoneyPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  const response = await fetch(ORANGE_MONEY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      phone: request.phoneNumber,
      description: request.description,
    }),
  });
  return response.json();
};
*/