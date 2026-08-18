import React, { useEffect, useState } from 'react';
import { productsDB, paymentsDB } from '../../services/dbService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useToast } from '../../contexts/ToastContext';

export function Equipements() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    setProducts(productsDB.getAll<any>());
    // listen to db changes
    const onChange = () => setProducts(productsDB.getAll<any>());
    window.addEventListener('db-change', onChange as any);
    return () => window.removeEventListener('db-change', onChange as any);
  }, []);

  const addToCart = (p: any) => {
    setCart(c => [...c, p]);
    toast.addToast(`${p.title} ajouté au panier`, 'success');
  };

  const checkout = () => {
    if (cart.length === 0) return toast.addToast('Le panier est vide', 'info');
    // create a payment record
    const total = cart.reduce((s, it) => s + (it.price || 0), 0);
    const payment = paymentsDB.create({ items: cart, total, date: new Date().toISOString(), status: 'paid' });
    setCart([]);
    toast.addToast(`Paiement effectué — Réf ${payment.id}`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Nos équipements</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.length === 0 && (
          <div className="col-span-full text-center text-slate-500">Aucun équipement disponible pour le moment.</div>
        )}
        {products.map(p => (
          <Card key={p.id} className="border">
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="text-lg font-semibold">{p.title}</div>
                <div className="text-sm text-slate-600">{p.description}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-primary-600 font-bold">{p.price ? `${p.price} €` : 'Gratuit'}</div>
                  <Button onClick={() => addToCart(p)}>Ajouter</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Panier</h2>
        <div className="space-y-2">
          {cart.map((c, i) => (
            <div key={i} className="flex items-center justify-between rounded border p-3">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-slate-500">{c.price ? `${c.price} €` : 'Gratuit'}</div>
              </div>
              <div className="text-right">
                <Button variant="outline" onClick={() => setCart(cur => cur.filter((_, idx) => idx !== i))}>Supprimer</Button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between mt-4">
            <div className="text-lg font-bold">Total: {cart.reduce((s, it) => s + (it.price || 0), 0)} €</div>
            <Button onClick={checkout} isLoading={false}>Payer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Equipements;
