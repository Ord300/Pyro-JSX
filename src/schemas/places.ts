import { z } from 'zod';

export const placeSchema = z.object({
  name: z.string().min(2, "Le nom du lieu est requis"),
  address: z.string().min(5, "Adresse invalide"),
  capacity: z.number().int().min(1, "La capacité doit être >= 1"),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
});

export type PlaceForm = z.infer<typeof placeSchema>;
