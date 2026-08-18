import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { usersDB } from '../../services/dbService';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await auth.login(form.email.trim(), form.password);
    setLoading(false);
    if (!res.ok) { setError(res.message || 'Erreur'); return; }
    const user = auth.user;
    if (user?.role === 'Gestionnaire') navigate('/admin');
    else navigate(user?.mustChangePassword ? '/change-password' : '/dashboard');
  };
  const [error, setError] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-6">
            <Dumbbell className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SPORT CENTER</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Bon retour parmi nous !</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Connectez-vous pour accéder à votre espace.</p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-200">{error}</p>}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Adresse email</label>
                <Input id="login-email" type="email" placeholder="jean@exemple.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
                  <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline dark:text-primary-400">Mot de passe oublié ?</Link>
                </div>
                <div className="relative">
                  <Input id="login-password" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" checked={form.remember} onChange={e => setForm({...form, remember: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">Se souvenir de moi</label>
              </div>
              <Button type="submit" size="lg" className="w-full" isLoading={loading}>Se connecter</Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">S'inscrire</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
