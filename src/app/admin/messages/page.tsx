"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Search, Send, Inbox } from "lucide-react";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { messagesDB, usersDB } from "@/src/services/dbService";
import { notifyImportantAction } from "@/src/services/notifyService";
import { cn } from "@/src/utils/cn";

type Message = {
  id: number;
  email: string;
  userName?: string | null;
  sender: string;
  subject?: string | null;
  body: string;
  createdAt: string;
  readByAdmin?: boolean;
};

const initialsOf = (name: string) =>
  name.split(/[.\s_-]/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "??";

const formatTime = (value: string) => {
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return String(value ?? "");
  const date = new Date(ts);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  if (date.toDateString() === yesterday.toDateString()) return `Hier, ${time}`;
  return `${date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}, ${time}`;
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const [rows, users] = await Promise.all([messagesDB.getAll<Message>(), usersDB.getAll<any>()]);
    const names: Record<string, string> = {};
    users.forEach((user) => {
      if (user.email) names[user.email.toLowerCase()] = user.name;
    });
    setUserNames(names);
    const sorted = [...rows].sort((a, b) => a.id - b.id);
    setMessages(sorted);
    setSelectedEmail((current) => current ?? sorted[0]?.email ?? null);
  }, []);

  useEffect(() => {
    load();
    return messagesDB.subscribe(load);
  }, [load]);

  const conversations = useMemo(() => {
    const map = new Map<string, Message[]>();
    messages.forEach((message) => {
      const key = message.email.toLowerCase();
      map.set(key, [...(map.get(key) || []), message]);
    });
    return Array.from(map.entries())
      .map(([email, thread]) => {
        const last = thread[thread.length - 1];
        const name = userNames[email] || last.userName || email.split("@")[0];
        return {
          email,
          name,
          subject: thread.find((message) => message.subject)?.subject || "Discussion générale",
          last: last.body,
          time: formatTime(last.createdAt),
          unread: thread.filter((message) => message.sender === "Abonné" && !message.readByAdmin).length,
          thread,
        };
      })
      .filter((conversation) =>
        `${conversation.name} ${conversation.subject} ${conversation.email}`.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.thread[b.thread.length - 1].createdAt).getTime() - new Date(a.thread[a.thread.length - 1].createdAt).getTime());
  }, [messages, userNames, search]);

  const selected = conversations.find((conversation) => conversation.email === selectedEmail) || conversations[0];

  // Marquer les messages de l'abonné comme lus à l'ouverture
  useEffect(() => {
    if (!selected) return;
    const unread = selected.thread.filter((message) => message.sender === "Abonné" && !message.readByAdmin);
    if (unread.length > 0) {
      Promise.all(unread.map((message) => messagesDB.update(message.id, { readByAdmin: true })));
    }
  }, [selected?.email, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.thread.length, selected?.email]);

  const send = async () => {
    if (!draft.trim() || !selected || sending) return;
    setSending(true);
    try {
      await messagesDB.create({
        email: selected.email,
        userName: "Administration MoveUp",
        sender: "Admin",
        subject: selected.subject,
        body: draft.trim(),
        createdAt: new Date().toISOString(),
        readByAdmin: true,
        readBySubscriber: false,
      });
      setDraft("");
      notifyImportantAction("message_recu", {
        email: selected.email,
        name: selected.name,
        subject: selected.subject,
        body: draft.trim(),
        senderName: "Administration MoveUp",
      }).catch(() => {});
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);

  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[570px] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 sm:w-80 dark:border-slate-800">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-slate-900 dark:text-white">Messages</h1>
            {totalUnread > 0 && <Badge variant="danger">{totalUnread} non lu{totalUnread > 1 ? "s" : ""}</Badge>}
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              <Inbox className="mx-auto mb-3 h-10 w-10" />
              Aucune conversation pour le moment.
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.email}
                onClick={() => setSelectedEmail(conversation.email)}
                className={cn(
                  "w-full border-t border-slate-100 p-4 text-left transition-colors dark:border-slate-800",
                  selected?.email === conversation.email ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-white">
                    {initialsOf(conversation.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-2">
                      <strong className="truncate text-sm text-slate-900 dark:text-white">{conversation.name}</strong>
                      <small className="shrink-0 text-xs text-slate-500">{conversation.time}</small>
                    </span>
                    <span className="block truncate text-xs text-slate-500">{conversation.subject}</span>
                    <span className="mt-1 flex items-center justify-between">
                      <small className={cn("block truncate text-xs", conversation.unread ? "font-semibold text-slate-700 dark:text-slate-200" : "text-slate-500")}>
                        {conversation.last}
                      </small>
                      {conversation.unread > 0 && (
                        <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
                          {conversation.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="hidden min-w-0 flex-1 flex-col sm:flex">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-slate-500">
            <MessageSquare className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
            Sélectionnez une conversation.
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                {initialsOf(selected.name)}
              </span>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{selected.name}</h2>
                <p className="text-xs text-slate-500">{selected.subject} · {selected.email}</p>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5 dark:bg-slate-950">
              {selected.thread.map((message) => {
                const own = message.sender === "Admin";
                return (
                  <div key={message.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm", own ? "rounded-br-sm bg-primary-600 text-white" : "rounded-bl-sm bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200")}>
                      <p>{message.body}</p>
                      <small className={cn("mt-1 block text-right text-[10px]", own ? "text-primary-100" : "text-slate-400")}>
                        {formatTime(message.createdAt)}
                      </small>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
              <div className="flex gap-2">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") send(); }}
                  placeholder="Écrire une réponse…"
                />
                <Button size="icon" onClick={send} disabled={!draft.trim() || sending} title="Envoyer"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        )}
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
