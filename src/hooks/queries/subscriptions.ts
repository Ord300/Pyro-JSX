import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionsService } from '../../services/subscriptionsService';
import type { Subscription } from '../../types/subscription';
import { useToast } from '../../contexts/ToastContext';

export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionsService.getAll(),
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (data: Omit<Subscription, 'id'>) => subscriptionsService.create(data),
    onMutate: async (newSub) => {
      await qc.cancelQueries({ queryKey: ['subscriptions'] });
      const previous = qc.getQueryData<Subscription[]>(['subscriptions']);
      qc.setQueryData<Subscription[]>(['subscriptions'], old => old ? [{ id: Math.max(0, ...old.map(i => i.id)) + 1, ...newSub } as Subscription, ...old] : []);
      return { previous };
    },
    onError: (_err, _new, context: any) => { if (context?.previous) qc.setQueryData(['subscriptions'], context.previous); addToast('Erreur création abonnement','error'); },
    onSuccess: () => addToast('Abonnement créé','success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['subscriptions'] })
  });
}

export function useUpdateSubscription() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Subscription> }) => subscriptionsService.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['subscriptions'] });
      const previous = qc.getQueryData<Subscription[]>(['subscriptions']);
      qc.setQueryData<Subscription[]>(['subscriptions'], old => old ? old.map(i => i.id === id ? { ...i, ...data } as Subscription : i) : []);
      return { previous };
    },
    onError: (_err, _vars, context: any) => { if (context?.previous) qc.setQueryData(['subscriptions'], context.previous); addToast('Erreur mise à jour abonnement','error'); },
    onSuccess: () => addToast('Abonnement mis à jour','success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['subscriptions'] })
  });
}

export function useDeleteSubscription() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => subscriptionsService.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['subscriptions'] });
      const previous = qc.getQueryData<Subscription[]>(['subscriptions']);
      qc.setQueryData<Subscription[]>(['subscriptions'], old => old ? old.filter(i => i.id !== id) : []);
      return { previous };
    },
    onError: (_err, _id, context: any) => { if (context?.previous) qc.setQueryData(['subscriptions'], context.previous); addToast('Erreur suppression abonnement','error'); },
    onSuccess: () => addToast('Abonnement supprimé','success'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['subscriptions'] })
  });
}
