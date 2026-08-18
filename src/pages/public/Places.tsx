import React from 'react';
import { usePlaces } from '../../hooks/queries/places';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { MapPin, Users } from 'lucide-react';

export function Places() {
  const { data: places = [] } = usePlaces();
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 px-6 text-center">
        <Badge className="mb-4 bg-white/20 text-white border-white/30">Nos espaces</Badge>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Lieux & Installations</h1>
        <p className="mt-4 text-primary-100 max-w-xl mx-auto">Des installations modernes et bien équipées pour tous vos entraînements.</p>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {places.map((place) => (
            <Card key={place.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              {place.image?.startsWith('data:') || place.image?.startsWith('http') ? <img src={place.image} alt={place.name} className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-6xl dark:from-slate-800 dark:to-slate-700">{place.type.includes('Terrain') ? '🏟️' : place.type.includes('Studio') ? '🧘' : '🏋️'}</div>}
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{place.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{place.type}</p>
                  </div>
                  <Badge variant={place.status === 'Disponible' ? 'success' : place.status === 'Occupé' ? 'warning' : 'danger'} className="text-xs shrink-0">
                    {place.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{place.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{place.capacity} personnes max.</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{place.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
