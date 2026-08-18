// ============================================================
// DONNÉES MOCKÉES — À remplacer par les appels API REST
// ============================================================

export interface Activity {
  id: number;
  name: string;
  category: string;
  description: string;
  trainer: string;
  duration: string;
  capacity: number;
  priceWeek: number;
  priceMonth: number;
  priceYear: number;
  image: string;
  icon: string;
}

export interface Trainer {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  activities: string[];
  bio: string;
  image: string;
  social: { facebook?: string; instagram?: string; twitter?: string };
}

export interface Place {
  id: number;
  name: string;
  type: string;
  capacity: number;
  location: string;
  description: string;
  image: string;
  status: 'Disponible' | 'Occupé' | 'Maintenance';
}

export interface Testimonial {
  id: number;
  name: string;
  activity: string;
  comment: string;
  rating: number;
  avatar: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  period: string;
  price: number;
  currency: string;
  popular: boolean;
  features: string[];
}

export const mockActivities: Activity[] = [];

export const mockTrainers: Trainer[] = [];

export const mockPlaces: Place[] = [];

export const mockTestimonials: Testimonial[] = [];

export const mockPricingPlans: PricingPlan[] = [];

// STATISTIQUES ADMIN MOCKÉES
export const mockStats = {
  totalSubscribers: 0,
  activeSubscriptions: 0,
  expiredSubscriptions: 0,
  pendingRequests: 0,
  totalActivities: 0,
  totalTrainers: 0,
  totalReservations: 0,
  totalRevenue: 0,
};
