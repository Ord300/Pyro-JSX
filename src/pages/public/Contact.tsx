import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import { subscriptionFlow } from '../../services/subscriptionFlowService';

export function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: "Demande d'abonnement", message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    subscriptionFlow.createRequest({ name: form.name, email: form.email, phone: form.phone, subject: form.subject, description: form.message });
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 px-6 text-center">
        <Badge className="mb-4 bg-white/20 text-white border-white/30">Contact</Badge>
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Contactez-nous</h1>
        <p className="mt-4 text-primary-100 max-w-xl mx-auto">Notre équipe est disponible pour répondre à toutes vos questions.</p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Infos contact */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nos coordonnées</h2>
            {[
              { icon: MapPin, label: 'Adresse', value: 'Avenue du Sport, Kinshasa, RDC' },
              { icon: Phone, label: 'Téléphone', value: '+243 XXX XXX XXX' },
              { icon: Mail, label: 'Email', value: 'contact@sportcenter.cd' },
              { icon: MessageSquare, label: 'WhatsApp', value: '+243 XXX XXX XXX' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              </div>
            ))}
            {/* Horaires */}
            <Card className="mt-6 border-slate-200 dark:border-slate-800">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Horaires d'ouverture</h3>
                <div className="space-y-1 text-sm">
                  {[['Lun – Ven', '06h00 – 22h00'], ['Samedi', '07h00 – 20h00'], ['Dimanche', '08h00 – 18h00']].map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>{day}</span><span className="font-medium text-slate-800 dark:text-slate-200">{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-8">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message envoyé !</h3>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Votre demande a été enregistrée avec le statut « En attente ». Pour un abonnement, vérifiez son statut après validation par l'administration.</p>
                    <Button className="mt-6" onClick={() => setSent(false)}>Envoyer un autre message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Envoyez-nous un message</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nom complet</label>
                        <Input placeholder="Jean Dupont" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <Input type="email" placeholder="jean@exemple.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Numéro de téléphone</label>
                      <Input type="tel" placeholder="+243…" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sujet</label>
                      <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white" required><option>Demande d'abonnement</option><option>Poser une question</option><option>Signaler un problème</option><option>Demande d'information</option><option>Autre</option></select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                      <textarea
                        rows={5}
                        placeholder="Votre message…"
                        value={form.message}
                        onChange={e => setForm({...form, message: e.target.value})}
                        required
                        className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:text-slate-50 resize-none"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      <Send className="mr-2 h-4 w-4" /> Envoyer le message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
