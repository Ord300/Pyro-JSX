"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Search, Send } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { cn } from "@/src/utils/cn";

type Conversation = { id: number; name: string; initials: string; subject: string; last: string; time: string; unread: boolean; messages: { own: boolean; text: string; time: string }[] };
const initial: Conversation[] = [
  { id: 1, name: "Alice Martin", initials: "AM", subject: "Question sur mon abonnement", last: "Merci pour votre aide !", time: "10:24", unread: true, messages: [{ own: false, text: "Bonjour, puis-je modifier mon abonnement mensuel ?", time: "10:12" }, { own: true, text: "Bonjour Alice, oui. Quel abonnement souhaitez-vous choisir ?", time: "10:18" }, { own: false, text: "Merci pour votre aide !", time: "10:24" }] },
  { id: 2, name: "Karim Bensalah", initials: "KB", subject: "Paiement par carte", last: "Ma carte est refusée.", time: "Hier", unread: true, messages: [{ own: false, text: "Bonjour, ma carte est refusée au paiement.", time: "Hier, 16:30" }] },
  { id: 3, name: "Sophie Laurent", initials: "SL", subject: "Réservation Football", last: "Parfait, à samedi.", time: "12 août", unread: false, messages: [{ own: true, text: "Votre réservation est bien confirmée.", time: "12 août" }, { own: false, text: "Parfait, à samedi.", time: "12 août" }] },
];

export default function AdminMessages() {
  const [conversations, setConversations] = useState(initial);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const selected = conversations.find((conversation) => conversation.id === selectedId) || conversations[0];
  const filtered = useMemo(() => conversations.filter((conversation) => `${conversation.name} ${conversation.subject}`.toLowerCase().includes(search.toLowerCase())), [conversations, search]);
  const select = (id: number) => {
    setSelectedId(id);
    setConversations((current) => current.map((conversation) => (conversation.id === id ? { ...conversation, unread: false } : conversation)));
  };
  const send = () => {
    if (!draft.trim()) return;
    const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setConversations((current) => current.map((conversation) => (conversation.id === selected.id ? { ...conversation, last: draft, time: now, messages: [...conversation.messages, { own: true, text: draft, time: now }] } : conversation)));
    setDraft("");
  };
  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[570px] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 sm:w-80 dark:border-slate-800">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-slate-900 dark:text-white">Messages</h1>
            <Badge variant="default">{conversations.filter((conversation) => conversation.unread).length}</Badge>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => select(conversation.id)}
              className={cn("w-full border-t border-slate-100 p-4 text-left transition-colors dark:border-slate-800", selectedId === conversation.id ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800")}
            >
              <div className="flex gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-white">{conversation.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2">
                    <strong className="truncate text-sm text-slate-900 dark:text-white">{conversation.name}</strong>
                    <small className="shrink-0 text-xs text-slate-500">{conversation.time}</small>
                  </span>
                  <span className="block truncate text-xs text-slate-500">{conversation.subject}</span>
                  <span className="mt-1 flex items-center justify-between">
                    <small className="block truncate text-xs text-slate-500">{conversation.last}</small>
                    {conversation.unread && <i className="ml-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <section className="hidden min-w-0 flex-1 flex-col sm:flex">
        <header className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-200">{selected.initials}</span>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">{selected.name}</h2>
            <p className="text-xs text-slate-500">{selected.subject}</p>
          </div>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5 dark:bg-slate-950">
          {selected.messages.map((message, index) => (
            <div key={index} className={cn("flex", message.own ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm", message.own ? "rounded-br-sm bg-primary-600 text-white" : "rounded-bl-sm bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200")}>
                <p>{message.text}</p>
                <small className={cn("mt-1 block text-right text-[10px]", message.own ? "text-primary-100" : "text-slate-400")}>{message.time}</small>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex gap-2">
            <Input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(); }} placeholder="Écrire une réponse…" />
            <Button size="icon" onClick={send} disabled={!draft.trim()} title="Envoyer"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>
      <div className="flex flex-1 items-center justify-center p-6 text-center text-slate-500 sm:hidden">
        <div>
          <MessageSquare className="mx-auto mb-3 h-10 w-10" />
          Sélectionnez une conversation sur un écran plus large.
        </div>
      </div>
    </div>
  );
}