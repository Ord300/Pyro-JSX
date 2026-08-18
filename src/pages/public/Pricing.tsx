import React from 'react';
import { mockPricingPlans } from '../../data/mockData';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export function Pricing() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 px-6 text-center">
        <Badge className="mb-4 bg-white/20 text-white border-white/30">Nos offres</Badge>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Tarifs &amp; Abonnements</h1>
        <p className="mt-4 text-primary-100 max-w-xl mx-auto">Choisissez la formule qui correspond à votre rythme. Sans engagement caché.</p>
      </div>
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {mockPricingPlans.map((plan) => (
            <div key={plan.id} className={`relative rounded-2xl p-8 flex flex-col gap-6 ${plan.popular ? 'bg-primary-600 text-white shadow-2xl shadow-primary-500/30 md:scale-105 z-10' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'}`}>
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">⭐ PLUS POPULAIRE</span>
              )}
              <div>
                <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-5xl font-extrabold ${plan.popular ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? 'text-primary-100' : 'text-slate-400'}`}>{plan.currency}{plan.period}</span>
                </div>
              </div>
              <ul className="flex-1 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-center gap-2 text-sm ${plan.popular ? 'text-primary-50' : 'text-slate-600 dark:text-slate-400'}`}>
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${plan.popular ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/verification">
                <Button className={`w-full font-semibold ${plan.popular ? 'bg-white text-primary-600 hover:bg-primary-50' : ''}`} variant={plan.popular ? 'primary' : 'outline'}>
                  Commencer maintenant
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
          Tous les prix sont en USD. L'abonnement est activé après validation de votre demande par un administrateur.
        </p>
      </div>
    </div>
  );
}
