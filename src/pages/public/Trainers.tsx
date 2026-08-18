import React from 'react';
import { useTrainers } from '../../hooks/queries/trainers';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Camera, Globe, MessageCircle } from 'lucide-react';

export function Trainers() {
  const { data: trainers = [] } = useTrainers();
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 px-6 text-center">
        <Badge className="mb-4 bg-white/20 text-white border-white/30">L'équipe</Badge>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Nos entraîneurs</h1>
        <p className="mt-4 text-primary-100 max-w-xl mx-auto">Des professionnels passionnés et certifiés à votre écoute.</p>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-800">
              <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center relative">
                {trainer.image?.startsWith('data:') || trainer.image?.startsWith('http') ? <img src={trainer.image} alt={trainer.name} className="h-28 w-28 rounded-full object-cover ring-4 ring-white/30" /> : <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-5xl font-bold text-white ring-4 ring-white/30">{trainer.name.split(' ').map(n => n[0]).join('')}</div>}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{trainer.name}</h3>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-0.5">{trainer.specialty}</p>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{trainer.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trainer.activities.map(a => <Badge key={a} variant="default" className="text-xs bg-slate-100 dark:bg-slate-800">{a}</Badge>)}
                  <Badge variant="success" className="text-xs">{trainer.experience}</Badge>
                </div>
                <div className="mt-4 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {trainer.social.instagram && <a href={trainer.social.instagram} className="text-slate-400 hover:text-pink-500 transition-colors"><Camera className="h-5 w-5" /></a>}
                  {trainer.social.facebook && <a href={trainer.social.facebook} className="text-slate-400 hover:text-blue-500 transition-colors"><Globe className="h-5 w-5" /></a>}
                  {trainer.social.twitter && <a href={trainer.social.twitter} className="text-slate-400 hover:text-sky-400 transition-colors"><MessageCircle className="h-5 w-5" /></a>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
