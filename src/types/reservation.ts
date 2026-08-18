export type ReservationStatus = 'Confirmée' | 'En attente' | 'Annulée' | 'Terminée';

export interface Reservation {
  id: number;
  userId: number;
  userName: string;
  activityId: number;
  activityName: string;
  activityIcon: string;
  placeId: number;
  placeName: string;
  date: string;
  time: string;
  duration: string;
  status: ReservationStatus;
  createdAt: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  capacity: number;
  booked: number;
}

export interface ReservationFlowData {
  activityId?: number;
  date?: string;
  time?: string;
  placeId?: number;
}