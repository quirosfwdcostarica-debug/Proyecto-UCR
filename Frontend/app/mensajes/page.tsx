"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';

// Definición de las estructuras de datos
type Message = {
  id: number;
  text: string;
  sender: 'me' | 'them';
  time: string;
};

type Conversation = {
  id: number;
  contactName: string;
  contactRole: string;
  avatarLetter: string;
  messages: Message[];
};

// Datos simulados de varias conversaciones
const initialConversations: Conversation[] = [
  {
    id: 1,
    contactName: "Empresa XYZ",
    contactRole: "Recursos Humanos",
    avatarLetter: "X",
    messages: [
      {
        id: 1,
        text: "¡Hola! Hemos recibido tu postulación y nos ha parecido muy interesante tu perfil.",
        sender: "them",
        time: "10:30 AM"
      },
      {
        id: 2,
        text: "Nos gustaría coordinar una breve entrevista la próxima semana para conocerte mejor y contarte más sobre la oferta de Desarrollador Web. ¿Tendrías disponibilidad el próximo martes a las 10:00 AM?",
        sender: "them",
        time: "10:31 AM"
      },
      {
        id: 3,
        text: "Quedamos atentos a tu respuesta. ¡Saludos!",
        sender: "them",
        time: "10:31 AM"
      }
    ]
  },
  {
    id: 2,
    contactName: "Juan Pérez",
    contactRole: "Desarrollador Senior",
    avatarLetter: "J",
    messages: [
      {
        id: 1,
        text: "Hola, vi tu perfil en la plataforma Alumni y me gustaría conectar.",
        sender: "them",
        time: "Ayer"
      }
    ]
  },
  {
    id: 3,
    contactName: "Soporte Técnico",
    contactRole: "Administración",
    avatarLetter: "S",
    messages: [
      {
        id: 1,
        text: "Tu solicitud de ayuda ha sido procesada. Por favor revisa tu correo para más detalles.",
        sender: "them",
        time: "Hace 2 días"
      }
    ]
  }
];

export default function MensajesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Leer el parámetro de la URL (chatId) para seleccionar la conversación correcta
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chatId = params.get('chatId');
      if (chatId) {
        const parsedId = parseInt(chatId, 10);
        // Validar que el chat exista
        if (initialConversations.find(c => c.id === parsedId)) {
          setActiveChatId(parsedId);
        }
      }
    }
  }, []);

  const activeChat = conversations.find(c => c.id === activeChatId);

  // Auto-scroll al fondo cuando los mensajes cambian
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeChatId) {
        return { ...conv, messages: [...conv.messages, newMessage] };
      }
      return conv;
    }));

    setInputText("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0f4c81]">Mensajes</h1>
          <p className="text-slate-500 mt-1">Gestiona tus conversaciones y contactos</p>
        </div>
        
        {/* Chat Layout: Barra lateral + Contenido Principal */}
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex-1 min-h-[600px] max-h-[800px]">
          
          {/* Sidebar: Lista de Conversaciones */}
          <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <input 
                type="text" 
                placeholder="Buscar conversación..." 
                className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => {
                const lastMessage = conv.messages[conv.messages.length - 1];
                const isActive = conv.id === activeChatId;
                
                return (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveChatId(conv.id)}
                    className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex gap-3 items-center
                      ${isActive ? 'bg-blue-50/60 border-l-4 border-l-[#0f4c81]' : 'hover:bg-slate-100 border-l-4 border-l-transparent bg-white'}
                    `}
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold border shadow-sm shrink-0 transition-colors
                      ${isActive ? 'bg-[#0f4c81] text-white border-[#0f4c81]' : 'bg-blue-50 text-[#0f4c81] border-blue-100'}
                    `}>
                      {conv.avatarLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`text-sm truncate ${isActive ? 'font-bold text-[#0f4c81]' : 'font-semibold text-slate-800'}`}>
                          {conv.contactName}
                        </h3>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{lastMessage?.time}</span>
                      </div>
                      <p className={`text-xs truncate ${isActive ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                        {lastMessage?.sender === 'me' ? 'Tú: ' : ''}{lastMessage?.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50/30 relative">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0f4c81] font-bold border shadow-sm">
                      {activeChat.avatarLetter}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-800">{activeChat.contactName}</h2>
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> En línea
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-medium px-3 py-1 bg-slate-100 rounded-full">
                    {activeChat.contactRole}
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                  {activeChat.messages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm relative group
                          ${isMe 
                            ? 'bg-[#0f4c81] text-white rounded-tr-sm' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                          }`}
                        >
                          <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.text}</p>
                          <div className={`text-[10px] mt-2 font-medium text-right
                            ${isMe ? 'text-blue-200' : 'text-slate-400'}
                          `}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Elemento invisible para asegurar que hagamos scroll hasta abajo */}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Escribe tu mensaje..." 
                      className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c81] focus:border-transparent transition-all bg-slate-50 focus:bg-white shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={!inputText.trim()}
                      className="bg-[#0f4c81] text-white h-11 w-11 flex items-center justify-center rounded-full hover:bg-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md shrink-0"
                      aria-label="Enviar mensaje"
                    >
                      <Send className="h-5 w-5 ml-1" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
                <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-slate-300" />
                </div>
                <p>Selecciona una conversación para empezar a chatear</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

