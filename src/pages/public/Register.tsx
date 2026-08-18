import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

export function Register() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', gender: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.firstName) e.firstName = 'Requis';
    if (!form.lastName) e.lastName = 'Requis';
    if (!form.email) e.email = 'Requis';
    if (!form.phone) e.phone = 'Requis';
    if (!form.gender) e.gender = 'Requis';
    if (form.password.length < 8) e.password = '8 caractères minimum';
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/verification'); }, 1200);
  };

  const field = (id: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <Input id={id} type={type} placeholder={placeholder} value={form[id]} onChange={e => setForm({...form, [id]: e.target.value})} error={!!errors[id]} />
      {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Dumbbell className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SPORT CENTER</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Créer un compte</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Rejoignez notre communauté sportive dès aujourd'hui.</p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('firstName', 'Prénom', 'text', 'Jean')}
                {field('lastName', 'Nom', 'text', 'Dupont')}
              </div>
              {field('email', 'Email', 'email', 'jean@exemple.com')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('phone', 'Téléphone', 'tel', '+243 XXX XXX XXX')}
                <div className="space-y-1.5">
                  <label htmlFor="gender" className="text-sm font-medium text-slate-700 dark:text-slate-300">Sexe</label>
                  <select id="gender" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:text-slate-50">
                    <option value="">Choisir…</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
                <div className="relative">
                  <Input id="reg-password" type={showPwd ? 'text' : 'password'} placeholder="8 caractères minimum" value={form.password} onChange={e => setForm({...form, password: e.target.value})} error={!!errors.password} className="pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              {field('confirm', 'Confirmer le mot de passe', 'password', '••••••••')}
              <Button type="submit" size="lg" className="w-full mt-2" isLoading={loading}>Créer mon compte</Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">Se connecter</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
