import React from 'react';
import { useActivities } from '../../hooks/queries/activities';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';

export function Activities() {
  const { data: activities = [] } = useActivities();
  const categories = [...new Set(activities.map(a => a.category))];
  const [selected, setSelected] = React.useState('Tous');

  const filtered = selected === 'Tous' ? activities : activities.filter(a => a.category === selected);

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 px-6 text-center">
        <Badge className="mb-4 bg-white/20 text-white border-white/30">Nos disciplines</Badge>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Activités sportives</h1>
        <p className="mt-4 text-primary-100 max-w-xl mx-auto">Explorez l'ensemble de nos disciplines encadrées par des entraîneurs certifiés.</p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {['Tous', ...categories].map(cat => (
            <button key={cat} onClick={() => setSelected(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selected === cat ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((activity) => (
            <Card key={activity.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              {activity.image?.startsWith('data:') || activity.image?.startsWith('http') ? <img src={activity.image} alt={activity.name} className="h-40 w-full object-cover" /> : <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-7xl dark:from-primary-900/20 dark:to-primary-800/20">{activity.icon}</div>}
              <CardContent className="p-5">
                <Badge variant="default" className="mb-2 text-xs bg-slate-100 dark:bg-slate-800">{activity.category}</Badge>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activity.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{activity.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{activity.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{activity.capacity} pers.</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Coach : <span className="font-medium text-slate-700 dark:text-slate-200">{activity.trainer}</span></p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <p className="text-xs text-slate-400">À partir de</p>
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{activity.priceWeek} USD<span className="text-xs font-normal text-slate-400">/sem.</span></p>
                  </div>
                  <Link to="/pricing"><Button size="sm">S'abonner</Button></Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
