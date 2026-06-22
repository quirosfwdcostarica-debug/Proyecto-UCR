"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, MessageCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: { id: string; nombre: string; foto_url?: string };
};

type Conversation = {
  matchId: string;
  contactName: string;
  contactRole: string;
  avatarLetter: string;
};

export default function MensajesPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const urlMatchId   = searchParams?.get("matchId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(urlMatchId ?? null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [inputText, setInputText]         = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingConvs, setLoadingConvs]   = useState(true);
  const [sending, setSending]             = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar sesión + conversaciones activas
  useEffect(() => {
    async function load() {
      try {
        const sessionRes  = await fetch("/api/auth/session");
        const session     = sessionRes.ok ? await sessionRes.json() : null;
        const userId      = session?.user?.id;
        const userTipo    = session?.user?.tipo;
        setCurrentUserId(userId || null);

        if (!userId) { setLoadingConvs(false); return; }

        // mis-matches devuelve todos los matches del usuario logueado, normalizados
        const matchesRes = await fetch("/api/matches/mis-matches", { cache: "no-store" });
        const allMatches = matchesRes.ok ? await matchesRes.json() : [];
        const active     = allMatches.filter((m: any) => m.estado === "ACTIVO" || m.status === "ACTIVO");

        const convs: Conversation[] = active.map((m: any) => {
          const isExalumno = userTipo === "EXALUMNO";
          const otherUser  = isExalumno ? m.estudiante?.user : m.exalumno?.user;
          const otherRole  = isExalumno ? "Estudiante" : "Exalumno";
          const name       = otherUser?.name || otherUser?.nombre || "Usuario";
          return {
            matchId:     m.id,
            contactName: name,
            contactRole: otherRole,
            avatarLetter: name[0].toUpperCase(),
          };
        });

        setConversations(convs);

        // Seleccionar conversación: URL param → primera disponible
        if (urlMatchId && convs.find(c => c.matchId === urlMatchId)) {
          setActiveMatchId(urlMatchId);
        } else if (!activeMatchId && convs.length > 0) {
          setActiveMatchId(convs[0].matchId);
        }
      } catch (err) {
        console.error("Error cargando conversaciones:", err);
      } finally {
        setLoadingConvs(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar + refrescar mensajes del match activo
  const loadMessages = useCallback(async (matchId: string) => {
    try {
      const res  = await fetch(`/api/messages/${matchId}`, { cache: "no-store" });
      const data = res.ok ? await res.json() : [];
      setMessages(data);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!activeMatchId) return;
    loadMessages(activeMatchId);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(activeMatchId), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeMatchId, loadMessages]);

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!inputText.trim() || !activeMatchId || sending) return;
    setSending(true);
    const text = inputText.trim();
    setInputText("");
    try {
      const res = await fetch(`/api/messages/${activeMatchId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      setInputText(text);
    } finally {
      setSending(false);
    }
  }

  function selectConv(matchId: string) {
    setActiveMatchId(matchId);
    router.replace(`/mensajes?matchId=${matchId}`, { scroll: false });
  }

  function formatTime(isoStr: string) {
    if (!isoStr) return "";
    const date   = new Date(isoStr);
    const diffMs = Date.now() - date.getTime();
    const mins   = Math.floor(diffMs / 60000);
    if (mins < 1)    return "Ahora";
    if (mins < 60)   return `${mins}m`;
    if (mins < 1440) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
  }

  const activeConv = conversations.find(c => c.matchId === activeMatchId);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0f4c81]">Mensajes</h1>
          <p className="text-slate-500 mt-1">Chat con tus matches activos</p>
        </div>

        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex-1 min-h-[600px] max-h-[800px]">

          {/* Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Conversaciones activas</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-6 text-center text-slate-400 text-sm">Cargando...</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
                  <MessageCircle className="h-10 w-10 text-slate-300" />
                  <p>No tienes conversaciones activas.</p>
                  <p className="text-xs">Acepta un match para chatear.</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const isSelected = conv.matchId === activeMatchId;
                  return (
                    <div
                      key={conv.matchId}
                      onClick={() => selectConv(conv.matchId)}
                      className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex gap-3 items-center
                        ${isSelected
                          ? "bg-blue-50/60 border-l-4 border-l-[#0f4c81]"
                          : "hover:bg-slate-100 border-l-4 border-l-transparent bg-white"}
                      `}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold border shadow-sm shrink-0
                        ${isSelected ? "bg-[#0f4c81] text-white border-[#0f4c81]" : "bg-blue-50 text-[#0f4c81] border-blue-100"}
                      `}>
                        {conv.avatarLetter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm truncate ${isSelected ? "font-bold text-[#0f4c81]" : "font-semibold text-slate-800"}`}>
                          {conv.contactName}
                        </h3>
                        <p className="text-xs text-slate-400">{conv.contactRole}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col bg-slate-50/30 relative">
            {activeConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-3 shadow-sm z-10">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0f4c81] font-bold border shadow-sm">
                    {activeConv.avatarLetter}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{activeConv.contactName}</h2>
                    <p className="text-xs text-slate-400">{activeConv.contactRole}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-400 text-sm mt-12">
                      ¡Saluda a {activeConv.contactName}!
                    </div>
                  )}
                  {messages.map(msg => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm
                          ${isMe
                            ? "bg-[#0f4c81] text-white rounded-tr-sm"
                            : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"}
                        `}>
                          {!isMe && msg.sender && (
                            <p className="text-[10px] font-semibold text-[#0f4c81] mb-1">{msg.sender.nombre}</p>
                          )}
                          <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div className={`text-[10px] mt-2 font-medium text-right ${isMe ? "text-blue-200" : "text-slate-400"}`}>
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent transition-all bg-slate-50 focus:bg-white shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className="bg-[#0f4c81] text-white h-11 w-11 flex items-center justify-center rounded-full hover:bg-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      aria-label="Enviar"
                    >
                      <Send className="h-5 w-5 ml-0.5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
                <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-slate-300" />
                </div>
                <p>Selecciona una conversación para chatear</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
