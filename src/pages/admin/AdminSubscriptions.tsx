import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { useSubscriptions, useCreateSubscription, useUpdateSubscription, useDeleteSubscription } from '../../hooks/queries/subscriptions';
import { subscriptionSchema, SubscriptionForm } from '../../schemas/subscription';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function AdminSubscriptions() {
  const { data: subs = [] } = useSubscriptions();
  const createSub = useCreateSubscription();
  const updateSub = useUpdateSubscription();
  const deleteSub = useDeleteSubscription();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubscriptionForm>({ resolver: zodResolver(subscriptionSchema) });

  useEffect(() => { if (!isModalOpen) reset(); }, [isModalOpen, reset]);

  const openCreate = () => { setEditItem(null); reset(); setIsModalOpen(true); };
  const openEdit = (s: any) => { setEditItem(s); reset({ userId: s.userId, userName: s.userName, planId: s.planId, planName: s.planName, activityId: s.activityId, activityName: s.activityName, status: s.status, startDate: s.startDate, endDate: s.endDate, amount: s.amount, currency: s.currency, paymentMethod: s.paymentMethod }); setIsModalOpen(true); };

  const onSubmit = async (data: SubscriptionForm) => {
    if (editItem) {
      await updateSub.mutateAsync({ id: editItem.id, data });
    } else {
      await createSub.mutateAsync(data as any);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => { if (!confirm('Supprimer cet abonnement ?')) return; await deleteSub.mutateAsync(id); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Abonnements</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gérez les abonnements des membres.</p>
        </div>
        <Button onClick={openCreate} isLoading={createSub.isLoading}><Plus className="mr-2 h-4 w-4" />Nouvel abonnement</Button>
      </div>

      <div>
        <Table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Abonné</th>
              <th>Formule</th>
              <th>Activité</th>
              <th>Statut</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.userName}</td>
                <td>{s.planName}</td>
                <td>{s.activityName}</td>
                <td>{s.status}</td>
                <td>{s.startDate}</td>
                <td>{s.endDate}</td>
                <td className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)} isLoading={updateSub.isLoading}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(s.id)} isLoading={deleteSub.isLoading}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Modifier abonnement' : 'Nouvel abonnement'}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm">Abonné (id)</label>
            <Input {...register('userId', { valueAsNumber: true })} />
            {errors.userId && <p className="text-xs text-red-500">{errors.userId.message}</p>}
          </div>
          <div>
            <label className="text-sm">Nom abonné</label>
            <Input {...register('userName')} />
          </div>
          <div>
            <label className="text-sm">Formule (id)</label>
            <Input {...register('planId')} />
          </div>
          <div>
            <label className="text-sm">Nom formule</label>
            <Input {...register('planName')} />
          </div>
          <div>
            <label className="text-sm">Activité (id)</label>
            <Input {...register('activityId', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-sm">Nom activité</label>
            <Input {...register('activityName')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm">Début</label>
              <Input type="date" {...register('startDate')} />
            </div>
            <div>
              <label className="text-sm">Fin</label>
              <Input type="date" {...register('endDate')} />
            </div>
            <div>
              <label className="text-sm">Montant</label>
              <Input type="number" {...register('amount', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting || createSub.isLoading || updateSub.isLoading}>{editItem ? 'Enregistrer' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
