import { z } from 'zod';

export const subscriptionSchema = z.object({
  userId: z.number().int().min(1, 'Sélectionnez un abonné'),
  userName: z.string().min(2, 'Nom invalide'),
  planId: z.string().min(1, 'Sélectionnez un plan'),
  planName: z.string().min(1),
  activityId: z.number().int().min(1, 'Sélectionnez une activité'),
  activityName: z.string().min(1),
  status: z.enum(['En attente','Validée','Expirée','Annulée']),
  startDate: z.string().min(10),
  endDate: z.string().min(10),
  amount: z.number().min(0),
  currency: z.string().min(1),
  paymentMethod: z.string().min(1),
});

export type SubscriptionForm = z.infer<typeof subscriptionSchema>;
