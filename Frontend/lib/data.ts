import { GraduationCap, Handshake, Users, Wallet } from "lucide-react";
import { C } from "@/lib/theme";

export const IMPACT = [
  { label: "Total donado", value: "₡248.6M", sub: "+18% vs. 2024", icon: Wallet, tone: C.greenDk },
  { label: "Estudiantes apoyados", value: "1,284", sub: "en 6 sedes", icon: GraduationCap, tone: C.blue },
  { label: "Exalumnos activos", value: "3,512", sub: "42 países", icon: Users, tone: C.naranja },
  { label: "Matches exitosos", value: "892", sub: "94% satisfacción", icon: Handshake, tone: C.amarillo },
];

export const ALUMNI = [
  { name: "María Fernanda Rojas", role: "VP de Ingeniería", company: "Globant", career: "Ing. Eléctrica", country: "Costa Rica", tags: ["Mentoría", "Empleo"], score: 94 },
  { name: "Carlos Andrés Méndez", role: "Director Financiero", company: "BAC Credomatic", career: "Economía", country: "Panamá", tags: ["Financiamiento", "Mentoría"], score: 88 },
  { name: "Lucía Vargas Soto", role: "Product Lead", company: "Stripe", career: "Computación", country: "EE.UU.", tags: ["Mentoría", "Pasantías"], score: 91 },
  { name: "José Pablo Quesada", role: "Cirujano", company: "Hospital CIMA", career: "Medicina", country: "Costa Rica", tags: ["Mentoría"], score: 82 },
  { name: "Ana Lucía Brenes", role: "Socia", company: "Deloitte", career: "Contaduría", country: "México", tags: ["Empleo", "Financiamiento"], score: 86 },
  { name: "Diego Hernández Mora", role: "Arquitecto Senior", company: "Gensler", career: "Arquitectura", country: "España", tags: ["Mentoría", "Pasantías"], score: 79 },
];

export const STUDENTS = [
  { name: "Valeria Campos", career: "Ing. Biomédica", sede: "Rodrigo Facio", project: "Prótesis de bajo costo impresas en 3D", progress: 72, need: ["Mentoría", "Financiamiento"], score: 96 },
  { name: "Mateo Jiménez", career: "Computación", sede: "Sede del Atlántico", project: "Modelo de IA para predicción de cosechas", progress: 45, need: ["Pasantía", "Mentoría"], score: 90 },
  { name: "Sofía Aguilar", career: "Economía", sede: "Rodrigo Facio", project: "Impacto del microcrédito rural", progress: 88, need: ["Empleo"], score: 84 },
  { name: "Andrés Solano", career: "Arquitectura", sede: "Sede de Occidente", project: "Vivienda social modular sostenible", progress: 60, need: ["Mentoría", "Financiamiento"], score: 88 },
  { name: "Camila Ureña", career: "Medicina", sede: "Rodrigo Facio", project: "Telemedicina para zonas rurales", progress: 33, need: ["Mentoría"], score: 81 },
  { name: "Esteban Picado", career: "Ing. Eléctrica", sede: "Sede de Guanacaste", project: "Microrred solar comunitaria", progress: 54, need: ["Financiamiento", "Pasantía"], score: 92 },
];

export const JOBS = [
  { title: "Ingeniero/a de Software Jr.", company: "Globant", logo: "G", modality: "Híbrido", jornada: "Tiempo completo", type: "Empleo", skills: ["React", "Node.js", "SQL"], deadline: "12 jun", compat: 93 },
  { title: "Pasantía de Análisis de Datos", company: "BAC Credomatic", logo: "B", modality: "Remoto", jornada: "Medio tiempo", type: "Pasantía", skills: ["Python", "SQL", "Power BI"], deadline: "20 jun", compat: 87 },
  { title: "Diseñador/a de Producto UX", company: "Stripe", logo: "S", modality: "Remoto", jornada: "Tiempo completo", type: "Empleo", skills: ["Figma", "Research", "Prototipado"], deadline: "30 jun", compat: 78 },
  { title: "Pasantía en Ingeniería Clínica", company: "Hospital CIMA", logo: "C", modality: "Presencial", jornada: "Medio tiempo", type: "Pasantía", skills: ["Equipos médicos", "Normativa"], deadline: "08 jul", compat: 71 },
];

export const DONATIONS_HIST = [
  { project: "Prótesis 3D — V. Campos", amount: "₡150,000", date: "02 jun 2026", status: "Confirmada" },
  { project: "Microrred solar — E. Picado", amount: "₡300,000", date: "21 may 2026", status: "Confirmada" },
  { project: "Telemedicina rural — C. Ureña", amount: "₡75,000", date: "15 may 2026", status: "Pendiente" },
  { project: "IA para cosechas — M. Jiménez", amount: "₡200,000", date: "01 may 2026", status: "Rechazada" },
];

export const matchReasons = ["Misma carrera (Ing. Biomédica)", "Áreas de interés: salud y tecnología", "Tipo de apoyo coincide: mentoría + financiamiento", "Disponibilidad horaria compatible"];

export const byCareer = [{ name: "Computación", v: 62 }, { name: "Medicina", v: 48 }, { name: "Economía", v: 41 }, { name: "Eléctrica", v: 37 }, { name: "Arquitectura", v: 29 }, { name: "Biomédica", v: 31 }];

export const byMonth = [{ m: "Ene", v: 18 }, { m: "Feb", v: 22 }, { m: "Mar", v: 19 }, { m: "Abr", v: 28 }, { m: "May", v: 34 }, { m: "Jun", v: 41 }];

export const bySede = [{ name: "Rodrigo Facio", v: 54, c: C.blue }, { name: "Occidente", v: 18, c: C.green }, { name: "Atlántico", v: 14, c: C.amarillo }, { name: "Guanacaste", v: 9, c: C.naranja }, { name: "Otras", v: 5, c: C.celeste }];

export const donorMix = [{ name: "Recurrentes", v: 68, c: C.blue }, { name: "Nuevos", v: 32, c: C.green }];

export const IMGS = {
  conciertos: "https://www.ucr.ac.cr/medios/fotos/pri_large/2025/conciertos-semana-u2-680944dd8398d.jpg",
  campus: "https://commons.wikimedia.org/wiki/Special:FilePath/Actual_Escuela_de_Enfermer%C3%ADa,_Universidad_de_Costa_Rica.jpg?width=1200",
  estudiantes1: "https://commons.wikimedia.org/wiki/Special:FilePath/Canciller_ofrece_Conferencia_ante_estudiantes_de_la_Universidad_de_Costa_Rica_(8576002659).jpg?width=1200",
  estudiantes2: "https://commons.wikimedia.org/wiki/Special:FilePath/Canciller_ofrece_Conferencia_ante_estudiantes_de_la_Universidad_de_Costa_Rica_(8576006623).jpg?width=1200",
};
