import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  role: z.enum(['Utilisateur', 'Abonné', 'Entraîneur', 'Gestionnaire']).default('Utilisateur'),
  status: z.enum(['Actif', 'Suspendu', 'Inactif']).default('Actif'),
});

export type UserForm = z.infer<typeof userSchema>;
