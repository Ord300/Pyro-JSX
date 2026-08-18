import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trainersService } from '../../services/trainersService';
import type { Trainer } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function useTrainers() {
  return useQuery<Trainer[]>({
    queryKey: ['trainers'],
    queryFn: () => trainersService.getAll(),
  });
}

export function useCreateTrainer() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<Trainer, 'id'>) => {
      return trainersService.create(data);
    },
    onMutate: async (newItem) => {
      await qc.cancelQueries({ queryKey: ['trainers'] });
      const previous = qc.getQueryData<Trainer[]>(['trainers']);
      qc.setQueryData<Trainer[]>(['trainers'], old => old ? [{ id: Math.max(0, ...old.map(i => i.id)) + 1, ...newItem } as Trainer, ...old] : []);
      return { previous };
    },
    onError: (_err, _new, context: any) => { if (context?.previous) qc.setQueryData(['trainers'], context.previous); addToast('Erreur création entraîneur', 'error'); },
    onSuccess: () => addToast('Entraîneur créé', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['trainers'] })
  });
}

export function useUpdateTrainer() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Trainer> }) => {
      return trainersService.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['trainers'] });
      const previous = qc.getQueryData<Trainer[]>(['trainers']);
      qc.setQueryData<Trainer[]>(['trainers'], old => old ? old.map(i => i.id === id ? { ...i, ...data } : i) : []);
      return { previous };
    },
    onError: (_err, _vars, context: any) => { if (context?.previous) qc.setQueryData(['trainers'], context.previous); addToast('Erreur mise à jour entraîneur', 'error'); },
    onSuccess: () => addToast('Entraîneur mis à jour', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['trainers'] })
  });
}

export function useDeleteTrainer() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      return trainersService.delete(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['trainers'] });
      const previous = qc.getQueryData<Trainer[]>(['trainers']);
      qc.setQueryData<Trainer[]>(['trainers'], old => old ? old.filter(i => i.id !== id) : []);
      return { previous };
    },
    onError: (_err, _id, context: any) => { if (context?.previous) qc.setQueryData(['trainers'], context.previous); addToast('Erreur suppression entraîneur', 'error'); },
    onSuccess: () => addToast('Entraîneur supprimé', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['trainers'] })
  });
}