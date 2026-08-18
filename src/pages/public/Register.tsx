import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { subscriptionFlow } from '../../services/subscriptionFlowService';
import { useToast } from '../../contexts/ToastContext';

export function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', plan: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name) e.name = 'Requis';
    if (!form.email) e.email = 'Requis';
    if (!form.phone) e.phone = 'Requis';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      subscriptionFlow.createRequest({ name: form.name, email: form.email, phone: form.phone, subject: 'Demande d\'abonnement', description: `Plan: ${form.plan || 'Basique'}` });
      toast.addToast('Votre demande d\'abonnement a été envoyée. Nous vous contacterons bientôt.', 'success');
      navigate('/verification');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Dumbbell className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SPORT CENTER</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Demande d'abonnement</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Remplissez ce formulaire pour demander un abonnement basique.</p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Nom complet</label>
                <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Jean Dupont" error={!!errors.name} />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jean@exemple.com" error={!!errors.email} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">Téléphone</label>
                <Input id="phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+243 XXX XXX XXX" error={!!errors.phone} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plan" className="text-sm font-medium text-slate-700 dark:text-slate-300">Plan souhaité</label>
                <select id="plan" value={form.plan} onChange={e => setForm({...form, plan: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:text-slate-50">
                  <option value="">Basique (par défaut)</option>
                  <option value="Basique">Basique</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <Button type="submit" size="lg" className="w-full mt-2" isLoading={loading}>Envoyer ma demande</Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Vous avez déjà fait une demande ?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">Se connecter</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
