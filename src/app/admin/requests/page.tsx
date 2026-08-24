"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye, Search } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/Table";
import { Modal } from "@/src/components/ui/Modal";
import { subscriptionFlow } from "@/src/services/subscriptionFlowService";

type ReqStatus = "En attente" | "Confirmée" | "Refusée";

interface Request {
  id: string; name: string; email: string; phone: string;
  subject: string; date: string; status: ReqStatus; message?: string;
}

const statusVariant = (s: ReqStatus) => (s === "Confirmée" ? "success" : s === "Refusée" ? "danger" : "warning");

export default function AdminRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tous");
  const [selected, setSelected] = useState<Request | null>(null);

  useEffect(() => {
    const load = async () => {
      const all = await subscriptionFlow.requests();
      setRequests(
        all
          .filter((request) => request.subject === "Demande d'abonnement" || (request.subject && request.subject.toLowerCase().includes("abonnement")))
          .map((request) => ({ id: String(request.id), name: request.name, email: request.email, phone: request.phone, subject: request.subject || "Demande d'abonnement", date: (request.createdAt || "").slice(0, 10), status: request.status, message: request.description || "" }))
      );
    };
    load();
  }, []);

  const filtered = requests.filter((r) =>
    (statusFilter === "Tous" || r.status === statusFilter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()))
  );

  const updateStatus = async (id: string, status: ReqStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await subscriptionFlow.setRequestStatus(Number(id), status as any);
    setSelected(null);
  };

  const counts = {
    "En attente": requests.filter((r) => r.status === "En attente").length,
    "Confirmée": requests.filter((r) => r.status === "Confirmée").length,
    "Refusée": requests.filter((r) => r.status === "Refusée").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Demandes d'abonnement</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gérez les demandes soumises par les visiteurs</p>
        </div>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(counts) as [string, number][]).map(([status, count]) => (
          <div
            key={status}
            className={`rounded-xl border p-4 text-center ${statusFilter === status ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}
            onClick={() => setStatusFilter((prev) => (prev === status ? "Tous" : status))}
            style={{ cursor: "pointer" }}
          >
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{count}</p>
            <Badge variant={statusVariant(status as ReqStatus)} className="mt-1 text-xs">{status}</Badge>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Rechercher…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0
              ? <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-10">Aucune demande.</TableCell></TableRow>
              : filtered.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-white">{req.name}</TableCell>
                  <TableCell className="text-slate-500">{req.email}</TableCell>
                  <TableCell className="text-slate-500">{req.phone}</TableCell>
                  <TableCell className="text-slate-500 max-w-[150px] truncate">{req.subject}</TableCell>
                  <TableCell className="text-slate-500">{req.date}</TableCell>
                  <TableCell><Badge variant={statusVariant(req.status)} className="text-xs">{req.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelected(req)} title="Voir"><Eye className="h-4 w-4" /></Button>
                      {req.status === "En attente" && (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => updateStatus(req.id, "Confirmée")} title="Confirmer"><CheckCircle className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => updateStatus(req.id, "Refusée")} title="Refuser"><XCircle className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal détails */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Détail de la demande">
        {selected && (
          <div className="space-y-4">
            <div className={`rounded-lg p-3 text-center ${selected.status === "Confirmée" ? "bg-green-50 dark:bg-green-900/20" : selected.status === "Refusée" ? "bg-red-50 dark:bg-red-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
              <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
            </div>
            {[["ID", selected.id], ["Nom", selected.name], ["Email", selected.email], ["Téléphone", selected.phone], ["Date", selected.date]].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{l}</span><span className="font-medium text-slate-900 dark:text-white">{v}</span>
              </div>
            ))}
            {selected.message && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">{selected.message}</p>}
            {selected.status === "En attente" && (
              <div className="flex gap-3 mt-4">
                <Button variant="secondary" className="flex-1" onClick={() => updateStatus(selected.id, "Confirmée")}>
                  <CheckCircle className="mr-2 h-4 w-4" />Confirmer
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => updateStatus(selected.id, "Refusée")}>
                  <XCircle className="mr-2 h-4 w-4" />Refuser
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}