export interface Receipt {
  id: number;
  reference: string;
  userId: number;
  userName: string;
  type: 'Abonnement' | 'Réservation' | 'Paiement';
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference: string;
  description: string;
  date: string;
  status: 'Payé' | 'En attente' | 'Remboursé';
  items: ReceiptItem[];
}

export interface ReceiptItem {
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptFilter {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}