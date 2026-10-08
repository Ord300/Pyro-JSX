"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { messagesDB, usersDB } from "@/src/services/dbService";
import { notifyImportantAction } from "@/src/services/notifyService";
import { cn } from "@/src/utils/cn";
import { Headset, MessageSquare, Send, ShieldCheck } from "lucide-react";

type Message = {
  id: number;
  email: string;
  userName?: string | null;
  sender: string;
  subject?: string | null;
  body: string;
  createdAt: string;
  readBySubscriber?: boolean;
};

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

export default function UserMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const email = (
      localStorage.getItem("current_user_email") ||
      localStorage.getItem("current_subscriber_email") ||
      ""
    ).toLowerCase();
    if (!email) return;
    setCurrentEmail(email);
    const [users, rows] = await Promise.all([usersDB.getAll<any>(), messagesDB.getAll<Message>()]);
    setUserName(users.find((user) => user.email?.toLowerCase() === email)?.name || email.split("@")[0]);
    const thread = rows
      .filter((row) => row.email?.toLowerCase() === email)
      .sort((a, b) => a.id - b.id);
    setMessages(thread);
    setLoading(false);
    // Marquer comme lus les messages envoyés par l'administration ou le coach
    const unread = thread.filter((message) => message.sender !== "Abonné" && !message.readBySubscriber);
    if (unread.length > 0) {
      await Promise.all(unread.map((message) => messagesDB.update(message.id, { readBySubscriber: true })));
    }
  }, []);

  useEffect(() => {
    load();
    return messagesDB.subscribe(load);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!draft.trim() || !currentEmail || sending) return;
    setSending(true);
    try {
      await messagesDB.create({
        email: currentEmail,
        userName,
        sender: "Abonné",
        subject: subject.trim() || messages.find((message) => message.subject)?.subject || null,
        body: draft.trim(),
        createdAt: new Date().toISOString(),
        readByAdmin: false,
        readBySubscriber: true,
      });
      setDraft("");
      // Confirme à l'auteur par e-mail (action causée par lui)
      notifyImportantAction("message_recu", {
        email: currentEmail,
        name: userName,
        subject: subject.trim() || "Message envoyé à l'administration",
        body: draft.trim(),
        senderName: "Vous (copie de votre message)",
      }).catch(() => {});
    } finally {
      setSending(false);
    }
  };

  const unreadFromAdmin = messages.filter((message) => message.sender !== "Abonné").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">Messages</h1>
        <p className="mt-1 text-sm text-emerald-900/60 dark:text-emerald-200/60">
          Échangez directement avec l'administration du centre.
        </p>
      </div>

      <Card className="flex h-[calc(100vh-16rem)] min-h-[480px] flex-col overflow-hidden p-0">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white">
            <Headset className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />
          </span>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900 dark:text-white">Administration MoveUp</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Généralement une réponse sous 24&nbsp;h · {messages.length} message{messages.length > 1 ? "s" : ""}</p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex"><ShieldCheck className="mr-1 h-3 w-3" />Support officiel</Badge>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5 dark:bg-slate-950">
          {!loading && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Aucun message pour le moment</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Posez votre question à l'aide du champ ci-dessous : un membre de l'administration vous répondra ici.
              </p>
            </div>
          )}
          {messages.map((message) => {
            const own = message.sender === "Abonné";
            return (
              <div key={message.id} className={cn("flex", own ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  own
                    ? "rounded-br-sm bg-emerald-600 text-white"
                    : "rounded-bl-sm border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                )}>
                  {!own && (
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      {message.sender === "Entraîneur" ? "Coach" : "Administration"}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <small className={cn("mt-1 block text-right text-[10px]", own ? "text-emerald-100" : "text-slate-400")}>
                    {formatTime(message.createdAt)}
                  </small>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          {messages.length === 0 && (
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Sujet de votre demande (ex. Question sur mon abonnement)…"
              className="mb-2"
            />
          )}
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") send(); }}
              placeholder="Écrivez votre message…"
            />
            <Button size="icon" onClick={send} disabled={!draft.trim() || sending} title="Envoyer">
              <Send className={cn("h-4 w-4", sending && "animate-pulse")} />
            </Button>
          </div>
          {unreadFromAdmin > 0 && (
            <p className="mt-2 text-[11px] text-slate-400">Les réponses de l'administration apparaissent automatiquement ici.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
