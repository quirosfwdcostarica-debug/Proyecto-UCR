/**
 * Crea 5 estudiantes demo con CVs completos para verificar el sistema de matches.
 * Todos con contraseña: A12345678
 *
 * Ejecutar desde Frontend/:   node seed_estudiantes_demo.mjs
 */

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

// ── Cargar .env.local ────────────────────────────────────────────────────────
for (const line of readFileSync(new URL("./.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (!(m[1] in process.env)) process.env[m[1]] = v;
}

const prisma = new PrismaClient();
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PASSWORD = "A12345678";

// ── Datos de los 5 estudiantes ───────────────────────────────────────────────
const ESTUDIANTES = [
  {
    nombre: "Sofía Ramírez Vargas",
    email: "sofia.ramirez.demo@ucr.ac.cr",
    foto_url: "https://ui-avatars.com/api/?name=Sofia+Ramirez&background=0ea5e9&color=fff&size=200",
    carrera: "Ingeniería en Computación",
    escuela_facultad: "Facultad de Ingeniería",
    sede: "Sede Rodrigo Facio",
    anio_ingreso: 2020,
    nivel_academico: "Bachillerato",
    promedio_ponderado: 9.15,
    area_tematica: "Desarrolladora full-stack con 3 años de experiencia en proyectos académicos y freelance. Especializada en arquitecturas React/Node.js con enfoque en UX e interfaces accesibles.",
    areas_interes: ["Desarrollo Web", "UX Design", "Cloud Computing", "Open Source"],
    habilidades: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Git", "Tailwind CSS", "REST APIs"],
    proyecto_titulo: "Plataforma de gestión académica para la UCR",
    proyecto_tipo: "Tesis de grado",
    proyecto_descripcion: "Sistema web para automatizar la planificación curricular de carreras universitarias, con módulos de análisis de carga horaria, generación de horarios y seguimiento de avance estudiantil. Implementado con Next.js, Prisma y Supabase.",
    busca_empleo: true,
    busca_pasantia: true,
    busca_mentoria: false,
    busca_financiamiento: false,
    curriculum: {
      habilidades_tecnicas: ["React", "TypeScript", "Node.js", "Docker"],
      experiencias: [
        { titulo: "Desarrolladora Frontend Freelance", organizacion: "Clientes independientes", tipo: "Freelance" },
        { titulo: "Asistente de Investigación", organizacion: "CITIC - UCR", tipo: "Asistencia universitaria" },
      ],
      certificaciones: [
        { nombre: "AWS Cloud Practitioner", institucion: "Amazon Web Services" },
        { nombre: "Meta Frontend Developer Certificate", institucion: "Meta / Coursera" },
      ],
    },
  },
  {
    nombre: "Daniel Herrera Mora",
    email: "daniel.herrera.demo@ucr.ac.cr",
    foto_url: "https://ui-avatars.com/api/?name=Daniel+Herrera&background=8b5cf6&color=fff&size=200",
    carrera: "Ingeniería Industrial",
    escuela_facultad: "Facultad de Ingeniería",
    sede: "Sede Rodrigo Facio",
    anio_ingreso: 2019,
    nivel_academico: "Licenciatura",
    promedio_ponderado: 8.72,
    area_tematica: "Ingeniero industrial con enfoque en optimización de procesos y análisis de datos. Experiencia en proyectos de mejora continua (Lean/Six Sigma) y modelado de operaciones.",
    areas_interes: ["Optimización de procesos", "Análisis de datos", "Lean Manufacturing", "Simulación"],
    habilidades: ["Python", "Excel avanzado", "Minitab", "AutoCAD", "Power BI", "SQL", "Arena Simulation"],
    proyecto_titulo: "Optimización de la cadena de suministro en PyMEs costarricenses",
    proyecto_tipo: "Proyecto de investigación",
    proyecto_descripcion: "Análisis y rediseño de la cadena de suministro de 12 pequeñas y medianas empresas del sector alimentario, aplicando metodologías Lean y simulación de eventos discretos para reducir costos operativos.",
    busca_empleo: true,
    busca_pasantia: false,
    busca_mentoria: true,
    busca_financiamiento: false,
    curriculum: {
      habilidades_tecnicas: ["Python", "Power BI", "SQL", "Arena Simulation"],
      experiencias: [
        { titulo: "Analista de Procesos (Práctica)", organizacion: "Cooperativa Dos Pinos", tipo: "Práctica profesional" },
        { titulo: "Tutor de Estadística", organizacion: "UCR - Facultad de Ingeniería", tipo: "Asistencia universitaria" },
      ],
      certificaciones: [
        { nombre: "Lean Six Sigma Green Belt", institucion: "ASQ" },
        { nombre: "Google Data Analytics Certificate", institucion: "Google / Coursera" },
      ],
    },
  },
  {
    nombre: "Andrea López Quesada",
    email: "andrea.lopez.demo@ucr.ac.cr",
    foto_url: "https://ui-avatars.com/api/?name=Andrea+Lopez&background=f59e0b&color=fff&size=200",
    carrera: "Administración de Empresas",
    escuela_facultad: "Facultad de Ciencias Económicas",
    sede: "Sede Rodrigo Facio",
    anio_ingreso: 2021,
    nivel_academico: "Bachillerato",
    promedio_ponderado: 8.90,
    area_tematica: "Estudiante de Administración con énfasis en mercadeo digital y emprendimiento. Fundadora de una startup social que conecta artesanos con mercados internacionales.",
    areas_interes: ["Emprendimiento", "Marketing Digital", "E-commerce", "Responsabilidad Social Empresarial"],
    habilidades: ["Marketing Digital", "Google Analytics", "Meta Ads", "Canva", "HubSpot", "Excel", "Presentaciones ejecutivas", "Inglés B2"],
    proyecto_titulo: "Modelo de negocio sostenible para artesanos de la Zona de los Santos",
    proyecto_tipo: "Proyecto de graduación",
    proyecto_descripcion: "Diseño e implementación de un modelo de comercio electrónico B2C para artesanos rurales, incluyendo estrategia de marca, canales digitales y logística internacional. El piloto generó $18,000 en ventas en el primer semestre.",
    busca_empleo: false,
    busca_pasantia: true,
    busca_mentoria: true,
    busca_financiamiento: true,
    curriculum: {
      habilidades_tecnicas: ["Google Analytics", "Meta Ads", "HubSpot", "Shopify"],
      experiencias: [
        { titulo: "Co-fundadora y Directora de Marketing", organizacion: "ArteSur CR", tipo: "Emprendimiento" },
        { titulo: "Asistente de Marketing", organizacion: "Cámara de Comercio de Costa Rica", tipo: "Práctica profesional" },
      ],
      certificaciones: [
        { nombre: "Google Digital Marketing & E-commerce", institucion: "Google / Coursera" },
        { nombre: "HubSpot Content Marketing Certification", institucion: "HubSpot Academy" },
      ],
    },
  },
  {
    nombre: "Carlos Jiménez Solano",
    email: "carlos.jimenez.demo@ucr.ac.cr",
    foto_url: "https://ui-avatars.com/api/?name=Carlos+Jimenez&background=10b981&color=fff&size=200",
    carrera: "Ingeniería Eléctrica",
    escuela_facultad: "Facultad de Ingeniería",
    sede: "Sede Rodrigo Facio",
    anio_ingreso: 2018,
    nivel_academico: "Licenciatura",
    promedio_ponderado: 8.45,
    area_tematica: "Ingeniero eléctrico especializado en energías renovables y sistemas de automatización industrial. Experiencia en diseño de instalaciones fotovoltaicas y sistemas SCADA para plantas industriales.",
    areas_interes: ["Energías renovables", "Automatización industrial", "IoT", "Eficiencia energética"],
    habilidades: ["MATLAB", "AutoCAD Electrical", "PLC (Siemens, Allen Bradley)", "Python", "SCADA", "NEC/IEC normativa", "Diseño fotovoltaico", "C++"],
    proyecto_titulo: "Sistema de monitoreo energético IoT para campus universitarios",
    proyecto_tipo: "Tesis de grado",
    proyecto_descripcion: "Desarrollo de una red de sensores IoT para monitoreo en tiempo real del consumo eléctrico en el campus universitario, con dashboard de análisis y alertas automáticas para reducción de desperdicio energético.",
    busca_empleo: true,
    busca_pasantia: false,
    busca_mentoria: false,
    busca_financiamiento: true,
    curriculum: {
      habilidades_tecnicas: ["MATLAB", "Python", "PLC Siemens", "SCADA", "AutoCAD Electrical"],
      experiencias: [
        { titulo: "Ingeniero de Proyectos (Práctica)", organizacion: "ICE - Instituto Costarricense de Electricidad", tipo: "Práctica profesional" },
        { titulo: "Técnico en Instalaciones Eléctricas", organizacion: "ElectroCR S.A.", tipo: "Empleo part-time" },
      ],
      certificaciones: [
        { nombre: "Certificación en Diseño Solar Fotovoltaico", institucion: "SENAC Brasil (virtual)" },
        { nombre: "Siemens TIA Portal Fundamentals", institucion: "Siemens" },
      ],
    },
  },
  {
    nombre: "María Fernanda Castro Rojas",
    email: "mariafe.castro.demo@ucr.ac.cr",
    foto_url: "https://ui-avatars.com/api/?name=Maria+Castro&background=ec4899&color=fff&size=200",
    carrera: "Psicología",
    escuela_facultad: "Facultad de Ciencias Sociales",
    sede: "Sede Rodrigo Facio",
    anio_ingreso: 2020,
    nivel_academico: "Bachillerato",
    promedio_ponderado: 9.30,
    area_tematica: "Estudiante de Psicología con énfasis en psicología organizacional y bienestar laboral. Experiencia en diseño de programas de salud mental para empresas y aplicación de metodologías de selección de personal.",
    areas_interes: ["Psicología Organizacional", "Recursos Humanos", "Bienestar Laboral", "Coaching Ejecutivo"],
    habilidades: ["Entrevistas por competencias", "Assessment centers", "Diseño de encuestas (Google Forms, Typeform)", "SPSS", "Gestión de conflictos", "Facilitación de talleres", "Inglés C1"],
    proyecto_titulo: "Burnout en el sector tecnológico costarricense post-pandemia",
    proyecto_tipo: "Investigación aplicada",
    proyecto_descripcion: "Estudio cuantitativo y cualitativo del síndrome de burnout en 200 profesionales del sector TI en Costa Rica, identificando factores protectores y de riesgo para diseñar un programa de intervención organizacional.",
    busca_empleo: true,
    busca_pasantia: true,
    busca_mentoria: true,
    busca_financiamiento: false,
    curriculum: {
      habilidades_tecnicas: ["SPSS", "Google Forms", "Typeform", "Canva", "Zoom / Teams para talleres"],
      experiencias: [
        { titulo: "Asistente de Recursos Humanos", organizacion: "Grupo Nación", tipo: "Práctica profesional" },
        { titulo: "Facilitadora de Talleres de Bienestar", organizacion: "CCSS - Área de Salud Montes de Oca", tipo: "Voluntariado" },
      ],
      certificaciones: [
        { nombre: "Coaching de Vida y Ejecutivo", institucion: "International Coaching Community" },
        { nombre: "Certificación en Psicometría Aplicada", institucion: "SHL Group / Talogy" },
      ],
    },
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🎓 Creando 5 estudiantes demo con CVs completos...\n");

  for (const est of ESTUDIANTES) {
    process.stdout.write(`  ⏳ ${est.nombre} (${est.email}) ... `);

    // 1. Crear usuario en Supabase Auth (si ya existe, reutilizarlo)
    let supabaseId;
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
    const found = existing?.users?.find((u) => u.email === est.email);

    if (found) {
      supabaseId = found.id;
      // Actualizar contraseña por si acaso
      await supabaseAdmin.auth.admin.updateUserById(supabaseId, { password: PASSWORD });
    } else {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email: est.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { nombre: est.nombre },
      });
      if (error) throw new Error(`Supabase error para ${est.email}: ${error.message}`);
      supabaseId = created.user.id;
    }

    // 2. Upsert en tabla USERS de Prisma
    await prisma.user.upsert({
      where: { id: supabaseId },
      create: {
        id: supabaseId,
        email: est.email,
        nombre: est.nombre,
        tipo: "ESTUDIANTE",
        email_verified: true,
        foto_url: est.foto_url,
        status: "ACTIVO",
        activo: true,
      },
      update: {
        nombre: est.nombre,
        foto_url: est.foto_url,
        status: "ACTIVO",
        email_verified: true,
      },
    });

    // 3. Upsert en tabla ESTUDIANTES
    await prisma.estudiante.upsert({
      where: { user_id: supabaseId },
      create: {
        user_id: supabaseId,
        carrera: est.carrera,
        escuela_facultad: est.escuela_facultad,
        sede: est.sede,
        anio_ingreso: est.anio_ingreso,
        nivel_academico: est.nivel_academico,
        promedio_ponderado: est.promedio_ponderado,
        area_tematica: est.area_tematica,
        areas_interes: est.areas_interes,
        habilidades: est.habilidades,
        proyecto_titulo: est.proyecto_titulo,
        proyecto_tipo: est.proyecto_tipo,
        proyecto_descripcion: est.proyecto_descripcion,
        busca_empleo: est.busca_empleo,
        busca_pasantia: est.busca_pasantia,
        busca_mentoria: est.busca_mentoria,
        busca_financiamiento: est.busca_financiamiento,
        visible_en_directorio: true,
      },
      update: {
        carrera: est.carrera,
        escuela_facultad: est.escuela_facultad,
        sede: est.sede,
        anio_ingreso: est.anio_ingreso,
        nivel_academico: est.nivel_academico,
        promedio_ponderado: est.promedio_ponderado,
        area_tematica: est.area_tematica,
        areas_interes: est.areas_interes,
        habilidades: est.habilidades,
        proyecto_titulo: est.proyecto_titulo,
        proyecto_tipo: est.proyecto_tipo,
        proyecto_descripcion: est.proyecto_descripcion,
        busca_empleo: est.busca_empleo,
        busca_pasantia: est.busca_pasantia,
        busca_mentoria: est.busca_mentoria,
        busca_financiamiento: est.busca_financiamiento,
        visible_en_directorio: true,
      },
    });

    // 4. Upsert en tabla CURRICULUM + experiencias + certificaciones
    const curriculum = await prisma.curriculum.upsert({
      where: { estudiante_id: supabaseId },
      create: {
        estudiante_id: supabaseId,
        habilidades_tecnicas: est.curriculum.habilidades_tecnicas,
      },
      update: {
        habilidades_tecnicas: est.curriculum.habilidades_tecnicas,
      },
    });

    // Limpiar y recrear experiencias
    await prisma.curriculumExperiencia.deleteMany({ where: { curriculum_id: curriculum.id } });
    for (const exp of est.curriculum.experiencias) {
      await prisma.curriculumExperiencia.create({
        data: { curriculum_id: curriculum.id, titulo: exp.titulo, organizacion: exp.organizacion, tipo: exp.tipo },
      });
    }

    // Limpiar y recrear certificaciones
    await prisma.curriculumCertificacion.deleteMany({ where: { curriculum_id: curriculum.id } });
    for (const cert of est.curriculum.certificaciones) {
      await prisma.curriculumCertificacion.create({
        data: { curriculum_id: curriculum.id, nombre: cert.nombre, institucion: cert.institucion },
      });
    }

    console.log("✅");
  }

  console.log("\n📋 Resumen de credenciales:");
  console.log("─".repeat(60));
  for (const est of ESTUDIANTES) {
    console.log(`  📧 ${est.email.padEnd(40)} 🔑 ${PASSWORD}`);
  }
  console.log("─".repeat(60));
  console.log("\n✅ Listo. Inicia sesión con cualquiera de estos usuarios para probar matches y CVs.");
}

main()
  .catch((e) => { console.error("\n❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
