"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "es" | "en";

export type TranslationKeys = 
  | "sidebar.dashboard"
  | "sidebar.directory"
  | "sidebar.positions"
  | "sidebar.donations"
  | "sidebar.profile"
  | "sidebar.editProfile"
  | "sidebar.connections"
  | "sidebar.settings"
  | "sidebar.help"
  | "sidebar.startProject"
  | "settings.title"
  | "settings.subtitle"
  | "settings.tab.general"
  | "settings.tab.terms"
  | "settings.tab.help"
  | "settings.lang.title"
  | "settings.lang.desc"
  | "settings.theme.title"
  | "settings.theme.desc"
  | "settings.theme.light"
  | "settings.theme.dark"
  | "settings.terms.title"
  | "settings.terms.desc"
  | "settings.help.faq.title"
  | "settings.help.faq.desc"
  | "settings.help.contact.title"
  | "settings.help.contact.desc"
  | "settings.help.contact.name"
  | "settings.help.contact.email"
  | "settings.help.contact.message"
  | "settings.help.contact.send"
  | "settings.help.contact.success"
  | "settings.help.contact.sending";

const translations: Record<Language, Record<TranslationKeys, string>> = {
  es: {
    "sidebar.dashboard": "Tablero",
    "sidebar.directory": "Directorio",
    "sidebar.positions": "Posiciones",
    "sidebar.donations": "Donaciones",
    "sidebar.profile": "Perfil",
    "sidebar.editProfile": "Editar Perfil",
    "sidebar.settings": "Ajustes",
    "sidebar.help": "Ayuda",
    "sidebar.startProject": "Iniciar un Proyecto",
    "settings.title": "Ajustes de la Plataforma",
    "settings.subtitle": "Configura tus preferencias de idioma, tema y accede al soporte legal y técnico.",
    "settings.tab.general": "General",
    "settings.tab.terms": "Términos y Condiciones",
    "settings.tab.help": "Ayuda y Soporte",
    "settings.lang.title": "Idioma de la interfaz",
    "settings.lang.desc": "Selecciona el idioma en el que deseas ver la plataforma.",
    "settings.theme.title": "Tema visual",
    "settings.theme.desc": "Elige entre la apariencia clara u oscura para la interfaz.",
    "settings.theme.light": "Modo Claro",
    "settings.theme.dark": "Modo Oscuro",
    "settings.terms.title": "Términos de Servicio y Privacidad",
    "settings.terms.desc": "Lee atentamente los términos y condiciones de uso de la Fundación Exalumnos UCR.",
    "settings.help.faq.title": "Preguntas Frecuentes (FAQs)",
    "settings.help.faq.desc": "Encuentra respuestas rápidas a las dudas comunes sobre la red.",
    "settings.help.contact.title": "Formulario de Contacto",
    "settings.help.contact.desc": "Si tienes algún inconveniente o sugerencia, envíanos un mensaje.",
    "settings.help.contact.name": "Nombre Completo",
    "settings.help.contact.email": "Correo Electrónico",
    "settings.help.contact.message": "Mensaje o Consulta",
    "settings.help.contact.send": "Enviar Mensaje",
    "settings.help.contact.success": "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.",
    "settings.help.contact.sending": "Enviando...",
  },
  en: {
    "sidebar.dashboard": "Dashboard",
    "sidebar.directory": "Directory",
    "sidebar.positions": "Positions",
    "sidebar.donations": "Donations",
    "sidebar.profile": "Profile",
    "sidebar.editProfile": "Edit Profile",
    "sidebar.settings": "Settings",
    "sidebar.help": "Help",
    "sidebar.startProject": "Start a Project",
    "settings.title": "Platform Settings",
    "settings.subtitle": "Configure your language and theme preferences, and access legal and technical support.",
    "settings.tab.general": "General",
    "settings.tab.terms": "Terms & Conditions",
    "settings.tab.help": "Help & Support",
    "settings.lang.title": "Interface Language",
    "settings.lang.desc": "Select the language you want to display the platform in.",
    "settings.theme.title": "Visual Theme",
    "settings.theme.desc": "Choose between light or dark appearance for the interface.",
    "settings.theme.light": "Light Mode",
    "settings.theme.dark": "Dark Mode",
    "settings.terms.title": "Terms of Service & Privacy Policy",
    "settings.terms.desc": "Please read carefully the terms and conditions of use for Fundación Exalumnos UCR.",
    "settings.help.faq.title": "Frequently Asked Questions (FAQs)",
    "settings.help.faq.desc": "Find quick answers to common questions about the network.",
    "settings.help.contact.title": "Contact Us",
    "settings.help.contact.desc": "If you have any issues or suggestions, please send us a message.",
    "settings.help.contact.name": "Full Name",
    "settings.help.contact.email": "Email Address",
    "settings.help.contact.message": "Message or Inquiry",
    "settings.help.contact.send": "Send Message",
    "settings.help.contact.success": "Message sent successfully! We will get in touch with you soon.",
    "settings.help.contact.sending": "Sending...",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang === "es" || savedLang === "en") {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: TranslationKeys): string => {
    if (!mounted) return key;
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
