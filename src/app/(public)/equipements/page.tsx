"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, Trash2, Minus, Plus, Sparkles, ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import { productsDB, paymentsDB } from "@/src/services/dbService";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { useToast } from "@/src/contexts/ToastContext";
import { useScrollReveal } from "@/src/hooks/useScrollReveal";

type CartEntry = { product: any; qty: number };

export default function Equipements() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<number, CartEntry>>({});
  const toast = useToast();
  useScrollReveal();

  useEffect(() => {
    const load = async () => setProducts(await productsDB.getAll<any>());
    load();
    return productsDB.subscribe(() => load());
  }, []);

  const items = Object.values(cart);
  const totalCount = items.reduce((s, it) => s + it.qty, 0);
  const total = items.reduce((s, it) => s + (it.product.price || 0) * it.qty, 0);

  const addToCart = (p: any) => {
    if ((p.stock ?? 1) <= 0) return toast.addToast("Équipement en rupture de stock", "error");
    setCart((c) => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty || 0) + 1 } }));
    toast.addToast(`${p.name || p.title} ajouté au panier`, "success");
  };
  const changeQty = (id: number, delta: number) => {
    setCart((c) => {
      const entry = c[id];
      if (!entry) return c;
      const qty = entry.qty + delta;
      if (qty <= 0) {
        const next = { ...c };
        delete next[id];
        return next;
      }
      return { ...c, [id]: { ...entry, qty } };
    });
  };

  const checkout = async () => {
    if (items.length === 0) return toast.addToast("Le panier est vide", "info");
    const payment = await paymentsDB.create({
      items: items.map((it) => ({ ...it.product, qty: it.qty })),
      total,
      date: new Date().toISOString(),
      status: "paid",
    });
    setCart({});
    toast.addToast(`Paiement effectué — Réf ${payment.id}`, "success");
  };

  const stockBadge = (stock?: number) => {
    if (stock === undefined) return null;
    if (stock <= 0) return <Badge variant="danger" className="text-xs">Rupture</Badge>;
    if (stock <= 5) return <Badge variant="warning" className="text-xs">Stock limité · {stock}</Badge>;
    return <Badge variant="success" className="text-xs">En stock</Badge>;
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      {/* Header — moitié d'écran */}
      <div className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-500 px-6 py-12 text-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Badge className="mb-4 inline-flex items-center gap-1.5 bg-white/20 text-white border-white/30 backdrop-blur-sm reveal reveal-visible">
            <Sparkles className="h-3.5 w-3.5" />Boutique
          </Badge>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl leading-tight reveal">Nos équipements</h1>
          <p className="mt-4 text-lg text-primary-100 reveal delay-200">Tout le matériel dont vous avez besoin pour vous entraîner dans les meilleures conditions.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/85 reveal delay-300">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-primary-200" />Qualité garantie</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary-200" />Retrait sur place</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary-200" />Paiement sécurisé</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Produits */}
          <div className="lg:col-span-2">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-24 text-center dark:border-slate-700">
                <Package className="mb-4 h-14 w-14 text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-900 dark:text-white">Aucun équipement disponible</p>
                <p className="mt-1 text-sm text-slate-500">Revenez bientôt, notre boutique se remplit progressivement.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p, index) => {
                  const out = (p.stock ?? 1) <= 0;
                  return (
                    <Card key={p.id} className={`group flex flex-col overflow-hidden border-slate-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800 reveal ${index % 3 === 1 ? "delay-100" : index % 3 === 2 ? "delay-200" : ""}`}>
                      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 transition-transform duration-500 group-hover:scale-[1.03] dark:from-primary-900/20 dark:to-primary-800/20">
                        {p.image?.startsWith("data:") || p.image?.startsWith("http") ? (
                          <img src={p.image} alt={p.name || p.title} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-14 w-14 text-primary-300 dark:text-primary-700" />
                        )}
                        <div className="absolute left-3 top-3">{stockBadge(p.stock)}</div>
                      </div>
                      <CardContent className="flex flex-1 flex-col p-5">
                        <Badge variant="default" className="mb-2 w-fit bg-slate-100 text-xs dark:bg-slate-800">{p.category}</Badge>
                        <h3 className="font-bold text-slate-900 dark:text-white">{p.name || p.title}</h3>
                        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{p.description || "Équipement de qualité pour vos entraînements."}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{p.price ? `${p.price} USD` : "Gratuit"}</p>
                          <Button size="sm" disabled={out} onClick={() => addToCart(p)} className={out ? "" : "group/btn"}>
                            <ShoppingBag className="mr-1.5 h-4 w-4" />{out ? "Indisponible" : "Ajouter"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panier latéral */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="border-slate-200 shadow-md dark:border-slate-800">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                    <ShoppingBag className="h-5 w-5 text-primary-600 dark:text-primary-400" />Panier
                  </h2>
                  {totalCount > 0 && (
                    <span className="rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-bold text-white">{totalCount}</span>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="py-10 text-center">
                    <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Votre panier est vide.<br />Ajoutez des équipements pour commencer.</p>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {items.map(({ product, qty }) => (
                        <li key={product.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30">
                            <Package className="h-5 w-5 text-primary-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{product.name || product.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{(product.price || 0) * qty} USD</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => changeQty(product.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Retirer un">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-slate-900 dark:text-white">{qty}</span>
                            <button onClick={() => changeQty(product.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Ajouter un">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button onClick={() => changeQty(product.id, -qty)} className="ml-1 text-slate-300 transition-colors hover:text-red-500" aria-label="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>Articles</span><span>{totalCount}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
                        <span>Total</span><span className="text-primary-600 dark:text-primary-400">{total} USD</span>
                      </div>
                    </div>
                  </>
                )}

                <Button className="mt-5 w-full" size="lg" disabled={items.length === 0} onClick={checkout}>
                  Payer maintenant · {total} USD
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" />Paiement rapide et sécurisé
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
