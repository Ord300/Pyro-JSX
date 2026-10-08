import { z } from 'zod';

export const trainerSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.union([z.string().email("Email invalide"), z.literal(""), z.undefined()]).optional(),
  specialty: z.string().min(2, "La spécialité est requise"),
  experience: z.string().min(1, "L'expérience est requise"),
  activities: z.array(z.string()).default([]),
  bio: z.string().max(500).optional(),
  image: z.string().optional(),
});

export type TrainerForm = z.infer<typeof trainerSchema>;
