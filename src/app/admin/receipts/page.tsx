"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Printer, Search } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/Table";
import { receiptsDB } from "@/src/services/dbService";
import { downloadReceipt, printReceipt } from "@/src/services/receiptService";
import type { Receipt } from "@/src/types/receipt";

const receiptVariant = (status: Receipt["status"]) => (status === "Payé" ? "success" : status === "En attente" ? "warning" : "outline");

export default function AdminReceiptsNew() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    const load = async () => setReceipts(await receiptsDB.getAll<Receipt>());
    load();
    return receiptsDB.subscribe(() => load());
  }, []);

  const filtered = useMemo(() => receipts.filter((receipt) => `${receipt.reference ?? ""} ${receipt.userName ?? ""} ${receipt.description ?? ""}`.toLowerCase().includes(search.toLowerCase())), [receipts, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reçus</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Consultez et remettez les preuves de paiement aux clients.</p>
        </div>
        <Badge variant="default">{receipts.length} reçus</Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Référence ou client…" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reçu</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell className="font-mono text-xs">{receipt.reference}</TableCell>
                <TableCell className="font-medium text-slate-900 dark:text-white">{receipt.userName}</TableCell>
                <TableCell>{receipt.description}</TableCell>
                <TableCell className="font-semibold">{receipt.amount} {receipt.currency}</TableCell>
                <TableCell>{receipt.date}</TableCell>
                <TableCell><Badge variant={receiptVariant(receipt.status)}>{receipt.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex">
                    <Button size="icon" variant="ghost" title="Voir" onClick={() => setSelected(receipt)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Télécharger" onClick={() => downloadReceipt(receipt)}><Download className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Imprimer" onClick={() => printReceipt(receipt)}><Printer className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Reçu ${selected?.reference ?? ""}`}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Aigles du congo</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Kinshasa, RDC</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <strong>Client :</strong> {selected.userName}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Date :</strong> {selected.date}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Réf. paiement :</strong> {selected.paymentReference}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Méthode :</strong> {selected.paymentMethod}
                </p>
              </div>
              <Badge variant={receiptVariant(selected.status)}>{selected.status}</Badge>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Détails</p>
              <div className="mt-2 space-y-2">
                {(selected.items ?? []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.quantity} × {item.unitPrice} {selected.currency}
                      </p>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {item.total} {selected.currency}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {selected.amount} {selected.currency}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => downloadReceipt(selected)}>
                <Download className="mr-2 h-4 w-4" />Télécharger
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => printReceipt(selected)}>
                <Printer className="mr-2 h-4 w-4" />Imprimer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}