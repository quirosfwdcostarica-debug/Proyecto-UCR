"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "es" | "en" | "pt" | "fr";

export type TranslationKeys = 
  | "sidebar.dashboard"
  | "sidebar.directory"
  | "sidebar.directory.student"
  | "sidebar.directory.exalumno"
  | "sidebar.positions"
  | "sidebar.positions.student"
  | "sidebar.positions.exalumno"
  | "sidebar.donations"
  | "sidebar.donations.student"
  | "sidebar.donations.exalumno"
  | "sidebar.profile"
  | "sidebar.profile.student"
  | "sidebar.profile.exalumno"
  | "sidebar.cv"
  | "sidebar.editProfile"
  | "sidebar.connections"
  | "sidebar.matches"
  | "sidebar.messages"
  | "sidebar.settings"
  | "sidebar.help"
  | "sidebar.startProject"
  | "sidebar.admin"
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
    "sidebar.directory.student": "Directorio Estudiantes",
    "sidebar.directory.exalumno": "Buscar Mentores",
    "sidebar.positions": "Posiciones",
    "sidebar.positions.student": "Bolsa de Empleo",
    "sidebar.positions.exalumno": "Publicar Empleo",
    "sidebar.donations": "Donaciones",
    "sidebar.donations.student": "Solicitar Apoyo",
    "sidebar.donations.exalumno": "Donar a Proyectos",
    "sidebar.profile": "Perfil",
    "sidebar.profile.student": "Mi Perfil",
    "sidebar.profile.exalumno": "Mi Perfil",
    "sidebar.cv": "Optimizar CV",
    "sidebar.editProfile": "Editar Perfil",
    "sidebar.connections": "Mis Conexiones",
    "sidebar.matches": "Mis Matches",
    "sidebar.messages": "Mis Chats",
    "sidebar.settings": "Ajustes",
    "sidebar.help": "Ayuda",
    "sidebar.startProject": "Iniciar un Proyecto",
    "sidebar.admin": "Administración",
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
    "settings.terms.desc": "Lee atentamente los términos y condiciones de uso de la Fundación Exalumnos U.",
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
    "sidebar.directory.student": "Student Directory",
    "sidebar.directory.exalumno": "Find Mentors",
    "sidebar.positions": "Positions",
    "sidebar.positions.student": "Job Board",
    "sidebar.positions.exalumno": "Post a Job",
    "sidebar.donations": "Donations",
    "sidebar.donations.student": "Request Funding",
    "sidebar.donations.exalumno": "Donate to Projects",
    "sidebar.profile": "Profile",
    "sidebar.profile.student": "My Profile",
    "sidebar.profile.exalumno": "My Profile",
    "sidebar.cv": "Optimize CV",
    "sidebar.editProfile": "Edit Profile",
    "sidebar.connections": "My Connections",
    "sidebar.matches": "My Matches",
    "sidebar.messages": "My Chats",
    "sidebar.settings": "Settings",
    "sidebar.help": "Help",
    "sidebar.startProject": "Start a Project",
    "sidebar.admin": "Administration",
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
    "settings.terms.desc": "Please read carefully the terms and conditions of use for Fundación Exalumnos U.",
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
  },
  pt: {
    "sidebar.dashboard": "Painel",
    "sidebar.directory": "Diretório",
    "sidebar.directory.student": "Diretório de Estudantes",
    "sidebar.directory.exalumno": "Buscar Mentores",
    "sidebar.positions": "Vagas",
    "sidebar.positions.student": "Vagas de Emprego",
    "sidebar.positions.exalumno": "Publicar Vaga",
    "sidebar.donations": "Doações",
    "sidebar.donations.student": "Solicitar Apoio",
    "sidebar.donations.exalumno": "Doar para Projetos",
    "sidebar.profile": "Perfil",
    "sidebar.profile.student": "Meu Perfil",
    "sidebar.profile.exalumno": "Meu Perfil",
    "sidebar.cv": "Otimizar Currículo",
    "sidebar.editProfile": "Editar Perfil",
    "sidebar.connections": "Minhas Conexões",
    "sidebar.matches": "Meus Matches",
    "sidebar.messages": "Meus Chats",
    "sidebar.settings": "Configurações",
    "sidebar.help": "Ajuda",
    "sidebar.startProject": "Iniciar um Projeto",
    "sidebar.admin": "Administração",
    "settings.title": "Configurações da Plataforma",
    "settings.subtitle": "Configure suas preferências de idioma, tema e acesse o suporte legal e técnico.",
    "settings.tab.general": "Geral",
    "settings.tab.terms": "Termos e Condições",
    "settings.tab.help": "Ajuda e Suporte",
    "settings.lang.title": "Idioma da interface",
    "settings.lang.desc": "Selecione o idioma no qual deseja ver a plataforma.",
    "settings.theme.title": "Tema visual",
    "settings.theme.desc": "Escolha entre a aparência clara ou escura para a interface.",
    "settings.theme.light": "Modo Claro",
    "settings.theme.dark": "Modo Escuro",
    "settings.terms.title": "Termos de Serviço e Privacidade",
    "settings.terms.desc": "Leia atentamente os termos e condições de uso da Fundação Exalumnos U.",
    "settings.help.faq.title": "Perguntas Frequentes (FAQs)",
    "settings.help.faq.desc": "Encontre respostas rápidas para as dúvidas comuns sobre a rede.",
    "settings.help.contact.title": "Formulário de Contato",
    "settings.help.contact.desc": "Se você tiver algum problema ou sugestão, envie-nos uma mensagem.",
    "settings.help.contact.name": "Nome Completo",
    "settings.help.contact.email": "Endereço de E-mail",
    "settings.help.contact.message": "Mensagem ou Consulta",
    "settings.help.contact.send": "Enviar Mensagem",
    "settings.help.contact.success": "Mensagem enviada com sucesso! Entraremos em contato em breve.",
    "settings.help.contact.sending": "Enviando...",
  },
  fr: {
    "sidebar.dashboard": "Tableau de Bord",
    "sidebar.directory": "Annuaire",
    "sidebar.directory.student": "Annuaire des Étudiants",
    "sidebar.directory.exalumno": "Trouver des Mentors",
    "sidebar.positions": "Postes",
    "sidebar.positions.student": "Offres d'Emploi",
    "sidebar.positions.exalumno": "Publier un Emploi",
    "sidebar.donations": "Dons",
    "sidebar.donations.student": "Demander un Financement",
    "sidebar.donations.exalumno": "Faire un Don",
    "sidebar.profile": "Profil",
    "sidebar.profile.student": "Mon Profil",
    "sidebar.profile.exalumno": "Mon Profil",
    "sidebar.cv": "Optimiser le CV",
    "sidebar.editProfile": "Modifier le Profil",
    "sidebar.connections": "Mes Connexions",
    "sidebar.matches": "Mes Matches",
    "sidebar.messages": "Mes Chats",
    "sidebar.settings": "Paramètres",
    "sidebar.help": "Aide",
    "sidebar.startProject": "Démarrer un Projet",
    "sidebar.admin": "Administration",
    "settings.title": "Paramètres de la Plateforme",
    "settings.subtitle": "Configurez vos préférences de langue, de thème et accédez à l'assistance juridique et technique.",
    "settings.tab.general": "Général",
    "settings.tab.terms": "Conditions d'Utilisation",
    "settings.tab.help": "Aide et Support",
    "settings.lang.title": "Langue de l'interface",
    "settings.lang.desc": "Sélectionnez la langue dans laquelle vous souhaitez afficher la plateforme.",
    "settings.theme.title": "Thème visuel",
    "settings.theme.desc": "Choisissez entre une apparence claire ou sombre pour l'interface.",
    "settings.theme.light": "Mode Clair",
    "settings.theme.dark": "Mode Sombre",
    "settings.terms.title": "Conditions de Service et Confidentialité",
    "settings.terms.desc": "Veuillez lire attentivement les conditions d'utilisation de la Fondation Exalumnos U.",
    "settings.help.faq.title": "Foire Aux Questions (FAQ)",
    "settings.help.faq.desc": "Trouvez des réponses rapides aux questions courantes sur le réseau.",
    "settings.help.contact.title": "Formulaire de Contact",
    "settings.help.contact.desc": "Si vous avez un problème ou une suggestion, envoyez-nous un message.",
    "settings.help.contact.name": "Nom Complet",
    "settings.help.contact.email": "Adresse E-mail",
    "settings.help.contact.message": "Message ou Demande",
    "settings.help.contact.send": "Envoyer le Message",
    "settings.help.contact.success": "Message envoyé avec succès ! Nous vous contacterons bientôt.",
    "settings.help.contact.sending": "Envoi en cours...",
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
    if (savedLang === "es" || savedLang === "en" || savedLang === "pt" || savedLang === "fr") {
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
