import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { receiptsDB } from '../../services/dbService';
import type { Receipt } from '../../types/receipt';
import { FileText, Download, Search, X, Printer } from 'lucide-react';

export function UserReceipts() {
  const email = localStorage.getItem('current_user_email') || '';
  const receipts = receiptsDB.getAll<any>().filter(receipt => receipt.email?.toLowerCase() === email);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const filteredReceipts = receipts.filter((receipt) => {
    if (typeFilter !== 'all' && receipt.type !== typeFilter) return false;
    if (search && !receipt.reference.toLowerCase().includes(search.toLowerCase()) && !receipt.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Payé': return 'success';
      case 'En attente': return 'warning';
      case 'Remboursé': return 'outline';
      default: return 'default';
    }
  };

  const handleDownload = (receipt: Receipt) => {
    // TODO: Implémenter le téléchargement PDF
    console.log('Téléchargement du reçu:', receipt.reference);
  };

  const handlePrint = (receipt: Receipt) => {
    // TODO: Implémenter l'impression
    console.log('Impression du reçu:', receipt.reference);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Mes reçus</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Consultez et téléchargez vos reçus de paiement.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'Abonnement', 'Réservation', 'Paiement'] as string[]).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                typeFilter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              {type === 'all' ? 'Tous' : type}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un reçu..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white sm:w-64"
          />
        </div>
      </div>

      {/* Receipts List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReceipts.map((receipt) => (
          <Card key={receipt.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                  <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{receipt.reference}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{receipt.description}</p>
                </div>
              </div>
              <Badge variant={getStatusVariant(receipt.status)}>{receipt.status}</Badge>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Type</span>
                <span className="font-medium text-slate-900 dark:text-white">{receipt.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Date</span>
                <span className="font-medium text-slate-900 dark:text-white">{receipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Montant</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">
                  {receipt.amount} {receipt.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Méthode</span>
                <span className="font-medium text-slate-900 dark:text-white">{receipt.paymentMethod}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedReceipt(receipt)}>
                <FileText className="mr-2 h-4 w-4" />
                Voir
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(receipt)}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredReceipts.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Aucun reçu trouvé</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Aucun reçu ne correspond à votre recherche.
          </p>
        </Card>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Reçu {selectedReceipt.reference}</h2>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Receipt Header */}
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Centre Sportif</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Kinshasa, RDC</p>
                  </div>
                  <Badge variant={getStatusVariant(selectedReceipt.status)}>{selectedReceipt.status}</Badge>
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Client :</strong> {selectedReceipt.userName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Date :</strong> {selectedReceipt.date}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Réf. paiement :</strong> {selectedReceipt.paymentReference}
                  </p>
                </div>
              </div>

              {/* Receipt Items */}
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Détails</h3>
                <div className="mt-3 space-y-2">
                  {selectedReceipt.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.quantity} × {item.unitPrice} {selectedReceipt.currency}
                        </p>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.total} {selectedReceipt.currency}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                  <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {selectedReceipt.amount} {selectedReceipt.currency}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleDownload(selectedReceipt)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handlePrint(selectedReceipt)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
