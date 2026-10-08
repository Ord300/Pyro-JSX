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
  minAge?: number | null;
  maxAge?: number | null;
}

export function formatAgeRange(a: { minAge?: number | null; maxAge?: number | null }): string | null {
  const min = a.minAge != null && !Number.isNaN(Number(a.minAge)) ? Number(a.minAge) : null;
  const max = a.maxAge != null && !Number.isNaN(Number(a.maxAge)) ? Number(a.maxAge) : null;
  if (min != null && max != null) return `De ${min} à ${max} ans`;
  if (min != null) return `Dès ${min} ans`;
  if (max != null) return `Jusqu'à ${max} ans`;
  return null;
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
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

export interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  image: string;
  alt: string;
  order: number;
  visible: boolean;
}

export const mockActivities: Activity[] = [
  {
    id: 1,
    name: "Football",
    category: "Sport collectif",
    description: "Entraînements et matchs de football sur terrain réglementaire avec coach professionnel.",
    trainer: "Coach Mbeki",
    duration: "90 min",
    capacity: 22,
    priceWeek: 15,
    priceMonth: 45,
    priceYear: 450,
    image: "",
    icon: "⚽",
    minAge: 5,
    maxAge: 20,
  },
  {
    id: 2,
    name: "Fitness",
    category: "Cardio",
    description: "Séances de fitness complètes pour améliorer votre condition physique et votre endurance.",
    trainer: "Sarah Martin",
    duration: "60 min",
    capacity: 20,
    priceWeek: 15,
    priceMonth: 45,
    priceYear: 450,
    image: "",
    icon: "🏃",
  },
  {
    id: 3,
    name: "Musculation",
    category: "Force",
    description: "Programme de musculation personnalisé avec équipements de pointe pour développer votre force.",
    trainer: "David Ngoma",
    duration: "60 min",
    capacity: 15,
    priceWeek: 15,
    priceMonth: 45,
    priceYear: 450,
    image: "",
    icon: "🏋️",
  },
  {
    id: 4,
    name: "Boxe",
    category: "Combat",
    description: "Apprenez les techniques de boxe anglaise avec un champion expérimenté.",
    trainer: "Karim Bensalah",
    duration: "75 min",
    capacity: 12,
    priceWeek: 20,
    priceMonth: 55,
    priceYear: 550,
    image: "",
    icon: "🥊",
  },
  {
    id: 5,
    name: "Basketball",
    category: "Sport collectif",
    description: "Entraînements de basketball pour tous les niveaux, du débutant au confirmé.",
    trainer: "Coach Mbeki",
    duration: "90 min",
    capacity: 20,
    priceWeek: 15,
    priceMonth: 45,
    priceYear: 450,
    image: "",
    icon: "🏀",
  },
  {
    id: 6,
    name: "Yoga",
    category: "Bien-être",
    description: "Séances de yoga pour la relaxation, la souplesse et l'équilibre mental.",
    trainer: "Amina Koné",
    duration: "60 min",
    capacity: 18,
    priceWeek: 10,
    priceMonth: 30,
    priceYear: 300,
    image: "",
    icon: "🧘",
  },
];

export const mockTrainers: Trainer[] = [
  {
    id: 1,
    name: "Sarah Martin",
    email: "",
    specialty: "Fitness & Cardio",
    experience: "8 ans",
    activities: ["Fitness", "Cardio"],
    bio: "Coach certifiée en fitness et cardio, spécialisée dans les programmes d'endurance et de remise en forme.",
    image: "",
    social: { facebook: "#", instagram: "#", twitter: "#" },
  },
  {
    id: 2,
    name: "Amina Koné",
    email: "",
    specialty: "Yoga & Bien-être",
    experience: "6 ans",
    activities: ["Yoga", "Méditation"],
    bio: "Instructrice de yoga passionnée, experte en relaxation, souplesse et équilibre mental.",
    image: "",
    social: { facebook: "#", instagram: "#", twitter: "#" },
  },
  {
    id: 3,
    name: "David Ngoma",
    email: "",
    specialty: "Musculation & Force",
    experience: "10 ans",
    activities: ["Musculation", "CrossFit"],
    bio: "Entraîneur de musculation expérimenté, spécialisé dans le développement de la force et la prise de masse.",
    image: "",
    social: { facebook: "#", instagram: "#", twitter: "#" },
  },
  {
    id: 4,
    name: "Karim Bensalah",
    email: "",
    specialty: "Boxe & Combat",
    experience: "12 ans",
    activities: ["Boxe", "MMA"],
    bio: "Ancien champion de boxe, il transmet sa passion et ses techniques aux combattants de tous niveaux.",
    image: "",
    social: { facebook: "#", instagram: "#", twitter: "#" },
  },
  {
    id: 5,
    name: "Coach Mbeki",
    email: "",
    specialty: "Sports collectifs",
    experience: "9 ans",
    activities: ["Football", "Basketball"],
    bio: "Entraîneur de sports collectifs, spécialisé dans le football et le basketball pour tous les âges.",
    image: "",
    social: { facebook: "#", instagram: "#", twitter: "#" },
  },
];

export const mockPlaces: Place[] = [
  {
    id: 1,
    name: "Terrain de Football Principal",
    type: "Terrain extérieur",
    capacity: 22,
    location: "Zone A",
    description: "Terrain de football réglementaire avec pelouse synthétique de dernière génération.",
    image: "",
    status: "Disponible",
  },
  {
    id: 2,
    name: "Terrain de Basketball",
    type: "Terrain couvert",
    capacity: 20,
    location: "Zone B",
    description: "Terrain de basketball couvert avec parquet professionnel.",
    image: "",
    status: "Disponible",
  },
  {
    id: 3,
    name: "Salle de Fitness",
    type: "Salle intérieure",
    capacity: 20,
    location: "Bâtiment principal",
    description: "Salle de fitness moderne équipée de machines cardio et de poids libres.",
    image: "",
    status: "Disponible",
  },
  {
    id: 4,
    name: "Salle de Musculation",
    type: "Salle intérieure",
    capacity: 15,
    location: "Bâtiment principal",
    description: "Salle de musculation avec équipements de pointe pour le développement musculaire.",
    image: "",
    status: "Disponible",
  },
  {
    id: 5,
    name: "Salle de Boxe",
    type: "Salle intérieure",
    capacity: 12,
    location: "Zone C",
    description: "Salle de boxe avec ring professionnel, sacs de frappe et équipements de protection.",
    image: "",
    status: "Disponible",
  },
  {
    id: 6,
    name: "Studio Yoga & Bien-être",
    type: "Studio",
    capacity: 18,
    location: "Zone D",
    description: "Studio calme et lumineux dédié au yoga, à la méditation et au bien-être.",
    image: "",
    status: "Disponible",
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Jean Dupont",
    activity: "Fitness",
    comment: "Excellent centre sportif ! Les coachs sont très professionnels et les installations sont modernes.",
    rating: 5,
    avatar: "JD",
  },
  {
    id: 2,
    name: "Marie Dubois",
    activity: "Yoga",
    comment: "Les séances de yoga avec Amina sont incroyables. Je me sens mieux dans mon corps et dans ma tête.",
    rating: 5,
    avatar: "MD",
  },
  {
    id: 3,
    name: "Karim Bensalah",
    activity: "Boxe",
    comment: "La salle de boxe est top ! Les entraînements sont intenses et le coach est très pédagogue.",
    rating: 4,
    avatar: "KB",
  },
  {
    id: 4,
    name: "Sophie Laurent",
    activity: "Football",
    comment: "Le terrain de football est magnifique. Les matchs du week-end sont très conviviaux.",
    rating: 5,
    avatar: "SL",
  },
];

export const mockGalleryImages: GalleryImage[] = [
  {
    id: 1,
    title: "Salle de musculation",
    description: "Un espace spacieux équipé de machines modernes pour tous les niveaux.",
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=600&auto=format&fit=crop",
    alt: "Salle de musculation",
    order: 1,
    visible: true,
  },
  {
    id: 2,
    title: "Salle de fitness",
    description: "Cours collectifs et cardio-training dans une ambiance dynamique.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    alt: "Salle de fitness",
    order: 2,
    visible: true,
  },
  {
    id: 3,
    title: "Entraînement personnel",
    description: "Un accompagnement sur-mesure avec nos coachs certifiés.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop",
    alt: "Entraînement personnel",
    order: 3,
    visible: true,
  },
  {
    id: 4,
    title: "Musculation",
    description: "Développez votre force avec un matériel professionnel de dernière génération.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop",
    alt: "Musculation",
    order: 4,
    visible: true,
  },
  {
    id: 5,
    title: "Basketball",
    description: "Un terrain aux normes officielles pour vos matchs et entraînements.",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=600&auto=format&fit=crop",
    alt: "Basketball",
    order: 5,
    visible: true,
  },
  {
    id: 6,
    title: "Salle de sport",
    description: "Un cadre lumineux et convivial pensé pour votre confort.",
    image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop",
    alt: "Salle de sport",
    order: 6,
    visible: true,
  },
  {
    id: 7,
    title: "Cardio",
    description: "Tapis, vélos et rameurs connectés pour booster votre endurance.",
    image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=600&auto=format&fit=crop",
    alt: "Cardio",
    order: 7,
    visible: true,
  },
  {
    id: 8,
    title: "Fitness",
    description: "Des cours variés encadrés par des instructeurs passionnés.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop",
    alt: "Fitness",
    order: 8,
    visible: true,
  },
];

export const mockPricingPlans: PricingPlan[] = [
  {
    id: "week",
    name: "Formule Semaine",
    period: "Semaine",
    price: 15,
    currency: "USD",
    popular: false,
    features: ["Accès 7 jours", "1 activité au choix", "Vestiaires inclus", "Support de base"],
  },
  {
    id: "month",
    name: "Formule Mensuelle",
    period: "Mois",
    price: 45,
    currency: "USD",
    popular: true,
    features: ["Accès 30 jours", "Toutes les activités", "Vestiaires inclus", "Coaching personnalisé", "Application mobile", "Support prioritaire"],
  },
  {
    id: "year",
    name: "Formule Annuelle",
    period: "Année",
    price: 450,
    currency: "USD",
    popular: false,
    features: ["Accès 365 jours", "Toutes les activités", "Vestiaires inclus", "Coaching personnalisé", "Application mobile", "Support VIP 24/7", "2 mois offerts"],
  },
];

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Paire d'haltères 10kg",
    category: "Musculation",
    price: 45,
    stock: 20,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop",
    description: "Haltères en fonte avec revêtement antidérapant, idéal pour la musculation à domicile ou en salle.",
  },
  {
    id: 2,
    name: "Tapis de course Pro",
    category: "Cardio",
    price: 650,
    stock: 5,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
    description: "Tapis motorisé pliable avec écran LCD, parfait pour l'entraînement cardio à Kinshasa.",
  },
  {
    id: 3,
    name: "Vélo elliptique",
    category: "Cardio",
    price: 480,
    stock: 8,
    image: "https://images.unsplash.com/photo-1599058917212-d750aac44416?q=80&w=600&auto=format&fit=crop",
    description: "Vélo elliptique silencieux avec résistance réglable et suivi de performance.",
  },
  {
    id: 4,
    name: "Banc de musculation",
    category: "Musculation",
    price: 180,
    stock: 12,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    description: "Banc réglable robuste pour développé couché et exercices polyvalents.",
  },
  {
    id: 5,
    name: "Gants de boxe 14oz",
    category: "Combat",
    price: 55,
    stock: 30,
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=600&auto=format&fit=crop",
    description: "Gants en cuir synthétique avec protection renforcée pour l'entraînement et le sparring.",
  },
  {
    id: 6,
    name: "Corde à sauter Pro",
    category: "Cardio",
    price: 15,
    stock: 50,
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    description: "Corde à sauter ajustable avec roulements rapides, idéale pour l'échauffement et le cardio.",
  },
];

// STATISTIQUES ADMIN MOCKÉES
export const mockStats = {
  totalSubscribers: 0,
  activeSubscriptions: 0,
  expiredSubscriptions: 0,
  pendingRequests: 0,
  totalActivities: mockActivities.length,
  totalTrainers: mockTrainers.length,
  totalReservations: 0,
  totalRevenue: 0,
};