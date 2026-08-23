"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/Table";
import { receiptsDB } from "@/src/services/dbService";
import type { Receipt } from "@/src/types/receipt";

const receiptVariant = (status: Receipt["status"]) => (status === "Payé" ? "success" : status === "En attente" ? "warning" : "outline");

export default function AdminReceiptsNew() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [downloaded, setDownloaded] = useState("");
  const [receipts, setReceipts] = useState<Receipt[]>(() => receiptsDB.getAll<Receipt>());

  useEffect(() => {
    const onChange = () => setReceipts(receiptsDB.getAll<Receipt>());
    window.addEventListener("db-change", onChange as any);
    return () => window.removeEventListener("db-change", onChange as any);
  }, []);

  const filtered = useMemo(() => receipts.filter((receipt) => `${receipt.reference} ${receipt.userName} ${receipt.description}`.toLowerCase().includes(search.toLowerCase())), [receipts, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reçus</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Consultez et remettez les preuves de paiement aux clients.</p>
        </div>
        <Badge variant="default">{receipts.length} reçus</Badge>
      </div>

      {downloaded && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-300">
          Le reçu {downloaded} est prêt au téléchargement.
        </div>
      )}

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
                    <Button size="icon" variant="ghost" title="Télécharger" onClick={() => setDownloaded(receipt.reference)}><Download className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}