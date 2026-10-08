"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  Printer,
  FileText,
  CreditCard,
} from "lucide-react";
import { productsDB, paymentsDB, receiptsDB, paymentProvidersDB, usersDB } from "@/src/services/dbService";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { useToast } from "@/src/contexts/ToastContext";

type CartMap = Record<number, number>;

const validatePhoneNumber = (phone: string): boolean =>
  /^(\+243|0)\d{9}$/.test(phone.replace(/\s/g, ""));

const stockBadge = (stock?: number) => {
  if (stock === undefined) return null;
  if (stock <= 0) return <Badge variant="danger" className="text-xs">Rupture</Badge>;
  if (stock <= 5) return <Badge variant="warning" className="text-xs">Stock limité · {stock}</Badge>;
  return <Badge variant="success" className="text-xs">En stock · {stock}</Badge>;
};

export default function DashboardEquipment() {
  const toast = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [cart, setCart] = useState<CartMap>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");

  const [isPayOpen, setIsPayOpen] = useState(false);
  const [method, setMethod] = useState("M-Pesa");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [invoice, setInvoice] = useState<any | null>(null);

  const load = useCallback(async () => {
    const [items, provs, users] = await Promise.all([
      productsDB.getAll<any>(),
      paymentProvidersDB.getAll<any>(),
      usersDB.getAll<any>(),
    ]);
    setProducts(items);
    setProviders(provs);
    const email = (
      localStorage.getItem("current_user_email") ||
      localStorage.getItem("current_subscriber_email") ||
      ""
    ).toLowerCase();
    setCurrentEmail(email);
    setCurrentUser(users.find((u: any) => u.email?.toLowerCase() === email) ?? null);
  }, []);

  useEffect(() => {
    load();
    const unsubs = [productsDB.subscribe(load)];
    return () => unsubs.forEach((fn) => fn());
  }, [load]);

  const categories = useMemo(
    () => ["Toutes", ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      if (category !== "Toutes" && p.category !== category) return false;
      if (q && !`${p.name ?? ""} ${p.category ?? ""} ${p.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, category]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === Number(id)), qty }))
        .filter((l) => l.product && l.qty > 0) as { product: any; qty: number }[],
    [cart, products]
  );

  const totalCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const total = cartLines.reduce((s, l) => s + Number(l.product.price || 0) * l.qty, 0);

  const addToCart = (p: any) => {
    const inCart = cart[p.id] ?? 0;
    if ((p.stock ?? 0) <= inCart) {
      toast.addToast("Stock insuffisant pour cet équipement", "error");
      return;
    }
    setCart((c) => ({ ...c, [p.id]: inCart + 1 }));
    toast.addToast(`${p.name} ajouté au panier`, "success");
  };

  const changeQty = (id: number, delta: number) => {
    setCart((c) => {
      const qty = (c[id] ?? 0) + delta;
      if (qty <= 0) {
        const next = { ...c };
        delete next[id];
        return next;
      }
      const product = products.find((p) => p.id === id);
      if (product && qty > (product.stock ?? 0)) {
        toast.addToast("Quantité maximale en stock atteinte", "error");
        return c;
      }
      return { ...c, [id]: qty };
    });
  };

  const removeLine = (id: number) => {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  };

  const openPayment = () => {
    if (cartLines.length === 0) return toast.addToast("Le panier est vide", "info");
    if (providers.length > 0 && !providers.some((p) => p.name === method)) {
      setMethod(providers[0].name);
    }
    setPhone(currentUser?.phone ?? "");
    setIsPayOpen(true);
  };

  const pay = async () => {
    if (cartLines.length === 0) return;
    const needsPhone = method === "M-Pesa" || method === "Orange Money";
    if (needsPhone && !validatePhoneNumber(phone)) {
      toast.addToast("Numéro Mobile Money invalide. Format attendu : +243 XXX XXX XXX", "error");
      return;
    }
    setPaying(true);
    try {
      // Recontrôle du stock avant paiement
      const fresh = await productsDB.getAll<any>();
      for (const line of cartLines) {
        const current = fresh.find((p: any) => p.id === line.product.id);
        if (!current || (current.stock ?? 0) < line.qty) {
          toast.addToast(`Stock insuffisant pour « ${line.product.name} »`, "error");
          setProducts(fresh);
          setPaying(false);
          return;
        }
      }
      // Simulation du traitement réseau
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const userName = currentUser?.name ?? currentEmail.split("@")[0] ?? "Client";
      const paymentReference = `PAY-${Date.now()}`;

      const payment = await paymentsDB.create<any>({
        userId: currentUser?.id ?? null,
        userName,
        email: currentEmail || null,
        amount: total,
        total,
        currency: "USD",
        method,
        status: method === "Espèces" ? "En attente" : "Réussi",
        reference: paymentReference,
        phoneNumber: needsPhone ? phone : undefined,
        description: `Achat équipements (${totalCount} article${totalCount > 1 ? "s" : ""})`,
        createdAt: now.toISOString(),
        paidAt: method === "Espèces" ? undefined : now.toISOString(),
        date: now.toISOString(),
        items: cartLines.map((l) => ({ id: l.product.id, name: l.product.name, price: l.product.price, qty: l.qty })),
      });

      // Décrémente le stock
      for (const line of cartLines) {
        await productsDB.update(line.product.id, { stock: (line.product.stock ?? 0) - line.qty });
      }

      // Facture
      const allReceipts = await receiptsDB.getAll<any>();
      const receipt = await receiptsDB.create<any>({
        reference: `REC-${now.getFullYear()}-${String(allReceipts.length + 1).padStart(4, "0")}`,
        userId: currentUser?.id ?? null,
        userName,
        email: currentEmail || null,
        phone: currentUser?.phone ?? (needsPhone ? phone : null),
        memberNumber: currentUser?.memberNumber ?? null,
        type: "Paiement",
        amount: total,
        currency: "USD",
        paymentMethod: method,
        paymentReference: payment.reference ?? paymentReference,
        description: `Achat équipements — ${cartLines.map((l) => `${l.product.name} ×${l.qty}`).join(", ")}`,
        date: dateStr,
        status: method === "Espèces" ? "En attente" : "Payé",
        items: cartLines.map((l) => ({
          label: l.product.name,
          quantity: l.qty,
          unitPrice: Number(l.product.price || 0),
          total: Number(l.product.price || 0) * l.qty,
        })),
      });

      setProducts(await productsDB.getAll<any>());
      setCart({});
      setIsPayOpen(false);
      setInvoice(receipt);
      toast.addToast(
        method === "Espèces" ? "Commande enregistrée — paiement à la réception" : `Paiement effectué — Facture ${receipt.reference}`,
        "success"
      );
    } catch {
      toast.addToast("Le paiement a échoué. Veuillez réessayer.", "error");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">Équipements</h1>
        <p className="mt-1 text-sm text-emerald-900/60 dark:text-emerald-200/60">
          Parcourez le catalogue, ajoutez au panier, payez et recevez votre facture.
        </p>
      </div>

      {/* Recherche + catégories */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Rechercher un équipement…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Catalogue */}
        <div className="xl:col-span-2">
          {filtered.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center">
              <Package className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-900 dark:text-white">Aucun équipement trouvé</p>
              <p className="mt-1 text-sm text-slate-500">Essayez une autre recherche ou catégorie.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {filtered.map((p) => {
                const out = (p.stock ?? 0) <= 0;
                const inCart = cart[p.id] ?? 0;
                return (
                  <Card key={p.id} className="group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md">
                    <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20">
                      {p.image?.startsWith("data:") || p.image?.startsWith("http") ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-14 w-14 text-emerald-300 dark:text-emerald-700" />
                      )}
                      <div className="absolute left-3 top-3">{stockBadge(p.stock)}</div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <Badge variant="default" className="mb-2 w-fit bg-slate-100 text-xs dark:bg-slate-800">{p.category}</Badge>
                      <h3 className="font-bold text-slate-900 dark:text-white">{p.name}</h3>
                      <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
                        {p.description || "Équipement de qualité pour vos entraînements."}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{p.price} USD</p>
                        {inCart > 0 ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => changeQty(p.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Retirer un">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-bold">{inCart}</span>
                            <button onClick={() => changeQty(p.id, 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700" aria-label="Ajouter un">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Button size="sm" disabled={out} onClick={() => addToCart(p)}>
                            <ShoppingBag className="mr-1.5 h-4 w-4" />{out ? "Indisponible" : "Ajouter"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Panier */}
        <aside className="xl:sticky xl:top-6 xl:h-fit">
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />Panier
              </h2>
              {totalCount > 0 && (
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">{totalCount}</span>
              )}
            </div>

            {cartLines.length === 0 ? (
              <div className="py-10 text-center">
                <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Votre panier est vide.<br />Ajoutez des équipements pour commencer.</p>
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {cartLines.map(({ product, qty }) => (
                    <li key={product.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <Package className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{Number(product.price || 0) * qty} USD</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => changeQty(product.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Retirer un">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{qty}</span>
                        <button onClick={() => changeQty(product.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Ajouter un">
                          <Plus className="h-3 w-3" />
                        </button>
                        <button onClick={() => removeLine(product.id)} className="ml-1 text-slate-300 hover:text-red-500" aria-label="Supprimer">
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
                    <span>Total</span><span className="text-emerald-700 dark:text-emerald-400">{total} USD</span>
                  </div>
                </div>
              </>
            )}

            <Button className="mt-5 w-full" size="lg" disabled={cartLines.length === 0} onClick={openPayment}>
              <CreditCard className="mr-2 h-4 w-4" />Passer au paiement · {total} USD
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />M-Pesa · Orange Money · Carte · Espèces
            </p>
          </Card>
        </aside>
      </div>

      {/* Modal paiement */}
      <Modal isOpen={isPayOpen} onClose={() => !paying && setIsPayOpen(false)} title="Paiement de la commande">
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            {cartLines.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center justify-between py-1 text-sm">
                <span className="text-slate-600 dark:text-slate-300">{product.name} <span className="text-slate-400">×{qty}</span></span>
                <span className="font-medium">{Number(product.price || 0) * qty} USD</span>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 font-bold dark:border-slate-700">
              <span>Total</span>
              <span className="text-lg text-emerald-700 dark:text-emerald-400">{total} USD</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Méthode de paiement</p>
            <div className="grid grid-cols-2 gap-2">
              {(providers.length > 0 ? providers : [{ name: "M-Pesa" }, { name: "Orange Money" }, { name: "Carte Bancaire" }, { name: "Espèces" }]).map((p: any) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setMethod(p.name)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                    method === p.name
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                  }`}
                >
                  <span>{p.icon ?? "💳"}</span>{p.name}
                </button>
              ))}
            </div>
          </div>

          {(method === "M-Pesa" || method === "Orange Money") && (
            <div>
              <label className="mb-1 block text-sm font-medium">Numéro {method}</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243 8XX XXX XXX" />
            </div>
          )}
          {method === "Espèces" && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              Paiement en espèces à régler à la réception. Votre facture sera marquée « En attente ».
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled={paying} onClick={() => setIsPayOpen(false)}>Annuler</Button>
            <Button className="flex-1" disabled={paying} onClick={pay}>
              {paying ? "Traitement…" : `Payer ${total} USD`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Facture */}
      <Modal isOpen={!!invoice} onClose={() => setInvoice(null)} title="Facture" className="max-w-xl">
        {invoice && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-2 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <p className="font-bold text-slate-900 dark:text-white">
                {invoice.status === "Payé" ? "Paiement confirmé !" : "Commande enregistrée !"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">MoveUp — Kinshasa, RDC</p>
                  <p className="font-mono text-xs text-slate-500">{invoice.reference}</p>
                </div>
                <Badge variant={invoice.status === "Payé" ? "success" : "warning"}>{invoice.status}</Badge>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <p><strong>Client :</strong> {invoice.userName}</p>
                <p><strong>Date :</strong> {invoice.date}</p>
                <p><strong>Méthode :</strong> {invoice.paymentMethod}</p>
                <p><strong>Réf. paiement :</strong> {invoice.paymentReference}</p>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
                {(invoice.items ?? []).map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1 text-sm">
                    <span>{item.label} <span className="text-slate-400">×{item.quantity}</span></span>
                    <span className="font-medium">{item.total} {invoice.currency}</span>
                  </div>
                ))}
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 font-bold dark:border-slate-700">
                  <span>Total</span>
                  <span className="text-lg text-emerald-700 dark:text-emerald-400">{invoice.amount} {invoice.currency}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />Imprimer
              </Button>
              <Link href="/dashboard/receipts" className="flex-1">
                <Button className="w-full"><FileText className="mr-2 h-4 w-4" />Mes factures</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
