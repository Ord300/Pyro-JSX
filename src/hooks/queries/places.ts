import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { placesService } from '../../services/placesService';
import type { Place } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function usePlaces() {
  return useQuery<Place[]>({
    queryKey: ['places'],
    queryFn: () => placesService.getAll(),
  });
}

export function useCreatePlace() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<Place, 'id'>) => {
      return placesService.create(data);
    },
    onMutate: async (newItem) => {
      await qc.cancelQueries({ queryKey: ['places'] });
      const previous = qc.getQueryData<Place[]>(['places']);
      qc.setQueryData<Place[]>(['places'], old => old ? [{ id: Math.max(0, ...old.map(i => i.id)) + 1, ...newItem } as Place, ...old] : []);
      return { previous };
    },
    onError: (_err, _new, context: any) => { if (context?.previous) qc.setQueryData(['places'], context.previous); addToast('Erreur création lieu', 'error'); },
    onSuccess: () => addToast('Lieu créé', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['places'] })
  });
}

export function useUpdatePlace() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Place> }) => {
      return placesService.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['places'] });
      const previous = qc.getQueryData<Place[]>(['places']);
      qc.setQueryData<Place[]>(['places'], old => old ? old.map(i => i.id === id ? { ...i, ...data } : i) : []);
      return { previous };
    },
    onError: (_err, _vars, context: any) => { if (context?.previous) qc.setQueryData(['places'], context.previous); addToast('Erreur mise à jour lieu', 'error'); },
    onSuccess: () => addToast('Lieu mis à jour', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['places'] })
  });
}

export function useDeletePlace() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      return placesService.delete(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['places'] });
      const previous = qc.getQueryData<Place[]>(['places']);
      qc.setQueryData<Place[]>(['places'], old => old ? old.filter(i => i.id !== id) : []);
      return { previous };
    },
    onError: (_err, _id, context: any) => { if (context?.previous) qc.setQueryData(['places'], context.previous); addToast('Erreur suppression lieu', 'error'); },
    onSuccess: () => addToast('Lieu supprimé', 'success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['places'] })
  });
}