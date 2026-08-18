// Données mockées pour les graphiques et tableaux du dashboard admin

export const revenueData = [
  { month: 'Jan', revenue: 4200, subscriptions: 38 },
  { month: 'Fév', revenue: 5800, subscriptions: 52 },
  { month: 'Mar', revenue: 7200, subscriptions: 61 },
  { month: 'Avr', revenue: 6500, subscriptions: 55 },
  { month: 'Mai', revenue: 8900, subscriptions: 74 },
  { month: 'Jun', revenue: 9200, subscriptions: 82 },
  { month: 'Jul', revenue: 11500, subscriptions: 95 },
  { month: 'Aoû', revenue: 13200, subscriptions: 110 },
];

export const activityDistribution = [
  { name: 'Football', value: 28, color: '#3b82f6' },
  { name: 'Fitness', value: 22, color: '#10b981' },
  { name: 'Musculation', value: 18, color: '#f59e0b' },
  { name: 'Boxe', value: 12, color: '#ef4444' },
  { name: 'Basketball', value: 10, color: '#8b5cf6' },
  { name: 'Yoga', value: 10, color: '#06b6d4' },
];

export const reservationData = [
  { day: 'Lun', reservations: 24 },
  { day: 'Mar', reservations: 30 },
  { day: 'Mer', reservations: 28 },
  { day: 'Jeu', reservations: 35 },
  { day: 'Ven', reservations: 42 },
  { day: 'Sam', reservations: 55 },
  { day: 'Dim', reservations: 18 },
];

export const recentPayments = [
  { id: 'PAY-001', name: 'Jean Dupont', activity: 'Fitness', amount: 45, method: 'M-Pesa', status: 'Réussi', date: '2026-08-16' },
  { id: 'PAY-002', name: 'Marie Koné', activity: 'Yoga', amount: 30, method: 'Orange Money', status: 'Réussi', date: '2026-08-16' },
  { id: 'PAY-003', name: 'Karim Bensalah', activity: 'Boxe', amount: 55, method: 'M-Pesa', status: 'En attente', date: '2026-08-15' },
  { id: 'PAY-004', name: 'Sophie Laurent', activity: 'Football', amount: 450, method: 'Orange Money', status: 'Réussi', date: '2026-08-15' },
  { id: 'PAY-005', name: 'David Ngoma', activity: 'Musculation', amount: 35, method: 'M-Pesa', status: 'Échoué', date: '2026-08-14' },
];

export const recentReservations = [
  { id: 'RES-001', member: 'Jean Dupont', activity: 'Fitness', place: 'Salle Fitness', date: '2026-08-17', time: '09:00', status: 'Confirmée' },
  { id: 'RES-002', member: 'Marie Koné', activity: 'Yoga', place: 'Studio Yoga', date: '2026-08-17', time: '10:30', status: 'Confirmée' },
  { id: 'RES-003', member: 'Karim Bensalah', activity: 'Boxe', place: 'Salle Boxe', date: '2026-08-17', time: '14:00', status: 'En attente' },
  { id: 'RES-004', member: 'Sophie Laurent', activity: 'Football', place: 'Terrain A', date: '2026-08-18', time: '07:00', status: 'Confirmée' },
];

export const pendingRequests = [
  { id: 'REQ-001', name: 'Alice Martin', email: 'alice@mail.com', phone: '+243 812 345 678', subject: 'Demande fitness', date: '2026-08-16', status: 'En attente' },
  { id: 'REQ-002', name: 'Bob Lukusa', email: 'bob@mail.com', phone: '+243 823 456 789', subject: 'Demande musculation', date: '2026-08-15', status: 'En attente' },
  { id: 'REQ-003', name: 'Claire Dibas', email: 'claire@mail.com', phone: '+243 834 567 890', subject: 'Demande yoga', date: '2026-08-15', status: 'En attente' },
];
