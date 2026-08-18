// Données mockées pour l'espace abonné

export const mockUserSubscription = {
  id: 'ABN-2026-00042',
  member: 'Jean Dupont',
  activity: 'Fitness',
  formula: 'Mensuelle',
  price: 45,
  currency: 'USD',
  startDate: '2026-08-01',
  endDate: '2026-08-31',
  status: 'Actif',
  daysRemaining: 15,
  totalDays: 30,
};

export const mockUserPayments = [
  { id: 'PAY-001', date: '2026-08-01', amount: 45, method: 'M-Pesa', activity: 'Fitness', formula: 'Mensuelle', status: 'Réussi', receipt: 'REC-001' },
  { id: 'PAY-002', date: '2026-07-01', amount: 45, method: 'Orange Money', activity: 'Fitness', formula: 'Mensuelle', status: 'Réussi', receipt: 'REC-002' },
  { id: 'PAY-003', date: '2026-06-01', amount: 45, method: 'M-Pesa', activity: 'Fitness', formula: 'Mensuelle', status: 'Réussi', receipt: 'REC-003' },
  { id: 'PAY-004', date: '2026-05-15', amount: 15, method: 'Orange Money', activity: 'Yoga', formula: 'Semaine', status: 'Échoué', receipt: null },
];

export const mockUserReservations = [
  { id: 'RES-001', activity: 'Fitness', place: 'Salle Fitness', date: '2026-08-17', time: '09:00', trainer: 'Sarah Martin', status: 'Confirmée' },
  { id: 'RES-002', activity: 'Fitness', place: 'Salle Fitness', date: '2026-08-19', time: '10:00', trainer: 'Sarah Martin', status: 'Confirmée' },
  { id: 'RES-003', activity: 'Yoga', place: 'Studio Yoga', date: '2026-08-20', time: '08:30', trainer: 'Amina Koné', status: 'En attente' },
  { id: 'RES-004', activity: 'Fitness', place: 'Salle Fitness', date: '2026-08-10', time: '09:00', trainer: 'Sarah Martin', status: 'Terminée' },
];

export const mockUserNotifications = [
  { id: 1, icon: '🔔', title: 'Abonnement bientôt expiré', message: 'Votre abonnement expire dans 15 jours. Pensez à renouveler.', date: '2026-08-16', read: false, type: 'warning' },
  { id: 2, icon: '💳', title: 'Paiement confirmé', message: 'Votre paiement de 45 USD a été confirmé avec succès.', date: '2026-08-01', read: true, type: 'success' },
  { id: 3, icon: '🏋️', title: 'Réservation confirmée', message: 'Votre réservation pour Fitness le 17/08 à 09h00 est confirmée.', date: '2026-08-16', read: false, type: 'success' },
  { id: 4, icon: '📅', title: 'Rappel de séance', message: 'Votre séance Fitness commence demain à 09h00.', date: '2026-08-16', read: false, type: 'info' },
  { id: 5, icon: '✅', title: 'Abonnement activé', message: 'Votre abonnement Fitness Mensuel a été activé avec succès.', date: '2026-08-01', read: true, type: 'success' },
];
