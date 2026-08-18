import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import type { User } from '../../types/user';
import { useToast } from '../../contexts/ToastContext';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<User, 'id'>) => {
      return userService.create(data);
    },
    onMutate: async (newUser) => {
      await qc.cancelQueries({ queryKey: ['users'] });
      const previous = qc.getQueryData<User[]>(['users']);
      qc.setQueryData<User[]>(['users'], old => old ? [{ id: Math.max(0, ...old.map(i => i.id)) + 1, ...newUser } as User, ...old] : []);
      return { previous };
    },
    onError: (_err, _newUser, context: any) => { if (context?.previous) qc.setQueryData(['users'], context.previous); addToast('Erreur création utilisateur', 'error'); },
    onSuccess: () => addToast('Utilisateur créé', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      return userService.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['users'] });
      const previous = qc.getQueryData<User[]>(['users']);
      qc.setQueryData<User[]>(['users'], old => old ? old.map(i => i.id === id ? { ...i, ...data } : i) : []);
      return { previous };
    },
    onError: (_err, _vars, context: any) => { if (context?.previous) qc.setQueryData(['users'], context.previous); addToast('Erreur mise à jour utilisateur', 'error'); },
    onSuccess: () => addToast('Utilisateur mis à jour', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      return userService.delete(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['users'] });
      const previous = qc.getQueryData<User[]>(['users']);
      qc.setQueryData<User[]>(['users'], old => old ? old.filter(i => i.id !== id) : []);
      return { previous };
    },
    onError: (_err, _id, context: any) => { if (context?.previous) qc.setQueryData(['users'], context.previous); addToast('Erreur suppression utilisateur', 'error'); },
    onSuccess: () => addToast('Utilisateur supprimé', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['users'] })
  });
}