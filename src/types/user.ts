export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'Utilisateur' | 'Abonné' | 'Gestionnaire' | string;
  status: 'Actif' | 'Suspendu' | 'Inactif' | string;
  lastLogin?: string;
}
