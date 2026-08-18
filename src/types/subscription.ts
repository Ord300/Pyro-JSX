export type SubscriptionStatus = 'En attente' | 'Validée' | 'Expirée' | 'Annulée';

export interface SubscriptionPlan {
  id: string;
  name: string;
  period: 'Semaine' | 'Mois' | 'Année';
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

export interface Subscription {
  id: number;
  userId: number;
  userName: string;
  planId: string;
  planName: string;
  activityId: number;
  activityName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  createdAt: string;
}

export interface SubscriptionRequest {
  id: number;
  userId: number;
  userName: string;
  email: string;
  phone: string;
  activityId: number;
  activityName: string;
  planId: string;
  planName: string;
  status: 'En attente' | 'Validée' | 'Refusée';
  requestedAt: string;
  notes?: string;
}

export interface SubscriptionWizardData {
  step: number;
  activityId?: number;
  planId?: string;
  paymentMethod?: string;
  phoneNumber?: string;
  agreedToTerms: boolean;
}