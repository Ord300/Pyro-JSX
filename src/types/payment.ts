export type PaymentStatus = 'En attente' | 'Réussi' | 'Échoué' | 'Remboursé';
export type PaymentMethod = 'M-Pesa' | 'Orange Money' | 'Carte Bancaire' | 'Espèces';

export interface Payment {
  id: number;
  userId: number;
  userName: string;
  subscriptionId?: number;
  reservationId?: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  phoneNumber?: string;
  description: string;
  createdAt: string;
  paidAt?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  phoneNumber?: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  message: string;
  payment?: Payment;
}

export interface MockPaymentProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}