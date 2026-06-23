/**
 * Seed de prueba — crea 1 estudiante + 1 exalumno con carrera coincidente,
 * ambos visibles en directorio, y genera el match SUGERIDO con el algoritmo real.
 *
 * Crea los usuarios en Supabase Auth (email confirmado + password) para que
 * puedan INICIAR SESIÓN y probar el flujo contactar → aceptar.
 *
 * Ejecutar desde Frontend/:   node seed_test_match.mjs
 */

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

// ─── Cargar .env.local manualmente (node no lo hace solo) ──────────────────────
for (const line of readFileSync(new URL("./.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (!(m[1] in process.env)) process.env[m[1]] = v;
}

const prisma = new PrismaClient();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Algoritmo de afinidad (réplica de lib/matching.ts para uso en script) ─────
function calcularAfinidad(est, exa) {
  const reasons = [];
  const bd = { carrera: 0, intereses: 0, sector: 0, apoyo: 0 };

  const cE = (est.carrera || "").toLowerCase().trim();
  const cX = (exa.carrera || "").toLowerCase().trim();
  if (cE && cX && (cE.includes(cX) || cX.includes(cE))) { bd.carrera = 30; reasons.push("Misma área académica"); }

  const aE = (est.areasInteres || []).map((a) => a.toLowerCase().trim()).filter(Boolean);
  const aX = (exa.areasInteres || []).map((a) => a.toLowerCase().trim()).filter(Boolean);
  if (aE.length && aX.length) {
    const inter = aE.filter((a) => aX.includes(a));
    if (inter.length) { bd.intereses = Math.round((30 * inter.length) / Math.max(aE.length, 1)); reasons.push(`Áreas en común: ${inter.slice(0, 2).join(", ")}`); }
  }

  const s = (exa.sector || "").toLowerCase().trim();
  const ap = (est.areaProyecto || "").toLowerCase().trim();
  if (s && ap && (s.includes(ap) || ap.includes(s))) { bd.sector = 20; reasons.push("Sector compatible con el proyecto"); }

  const buscado = new Set((est.apoyoBuscado || []).map((a) => a.toLowerCase().trim()));
  const ofrecido = new Set((exa.apoyoOfrecido || []).map((a) => a.toLowerCase().trim()));
  const comun = [...buscado].filter((a) => ofrecido.has(a));
  if (comun.length) { bd.apoyo = 20; reasons.push(`Apoyo compatible: ${comun.slice(0, 2).join(", ")}`); }

  return { score: Math.min(bd.carrera + bd.intereses + bd.sector + bd.apoyo, 100), reasons, breakdown: bd };
}

// ─── Helper: crear o recuperar un usuario de Supabase Auth ─────────────────────
async function ensureAuthUser(email, password, nombre) {
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { nombre },
  });
  if (!error && data?.user) return data.user.id;

  // Ya existe → buscarlo por email paginando
  for (let page = 1; page <= 10; page++) {
    const { data: list } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    const found = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found.id;
    if (!list?.users?.length || list.users.length < 200) break;
  }
  throw new Error(`No se pudo crear ni encontrar el usuario auth: ${email} (${error?.message})`);
}

// ─── Datos de prueba (alineados para score 100) ────────────────────────────────
const PASSWORD = "Demo1234!";
const CARRERA = "Ingeniería en Computación";

const EST = { email: "estudiante.demo@example.com", nombre: "Estudiante Demo" };
const EXA = { email: "exalumno.demo@example.com", nombre: "Exalumno Demo" };

async function main() {
  console.log("🌱 Seed de match de prueba\n");

  const estId = await ensureAuthUser(EST.email, PASSWORD, EST.nombre);
  const exaId = await ensureAuthUser(EXA.email, PASSWORD, EXA.nombre);
  console.log(`  auth estudiante: ${estId}`);
  console.log(`  auth exalumno:   ${exaId}\n`);

  // USERS
  await prisma.user.upsert({
    where: { id: estId },
    update: { nombre: EST.nombre, email: EST.email, tipo: "ESTUDIANTE", status: "ACTIVO", activo: true, email_verified: true },
    create: { id: estId, nombre: EST.nombre, email: EST.email, tipo: "ESTUDIANTE", status: "ACTIVO", activo: true, email_verified: true },
  });
  await prisma.user.upsert({
    where: { id: exaId },
    update: { nombre: EXA.nombre, email: EXA.email, tipo: "EXALUMNO", status: "ACTIVO", activo: true, email_verified: true },
    create: { id: exaId, nombre: EXA.nombre, email: EXA.email, tipo: "EXALUMNO", status: "ACTIVO", activo: true, email_verified: true },
  });

  // ESTUDIANTE (perfil completo + visible)
  const estProfile = {
    carnet_ucr: "B12345", carrera: CARRERA, sede: "Sede Rodrigo Facio",
    proyecto_titulo: "Plataforma de tutorías con IA", area_tematica: "Tecnología",
    areas_interes: ["Inteligencia Artificial"], proyecto_porcentaje_avance: 40,
    busca_mentoria: true, busca_empleo: true,
    visible_en_directorio: true, activo: true,
  };
  await prisma.estudiante.upsert({ where: { user_id: estId }, update: estProfile, create: { user_id: estId, ...estProfile } });

  // EXALUMNO (perfil completo + visible)
  const exaProfile = {
    carrera: CARRERA, escuela_facultad: CARRERA, sector: "Tecnología",
    anio_graduacion: 2018, empresa_actual: "Microsoft", cargo_actual: "Senior Software Engineer",
    areas_interes: ["Inteligencia Artificial", "Ciencia de Datos"],
    ofrece_mentoria: true, ofrece_empleo: true, ofrece_networking: true,
    perfil_completo: true, visible_en_directorio: true,
  };
  await prisma.exalumno.upsert({ where: { user_id: exaId }, update: exaProfile, create: { user_id: exaId, ...exaProfile } });

  console.log("✅ Perfiles creados y visibles en directorio\n");

  // ─── Generar el match con el algoritmo real ──────────────────────────────────
  const { score, reasons, breakdown } = calcularAfinidad(
    { carrera: CARRERA, areaProyecto: "Tecnología", areasInteres: ["Inteligencia Artificial"], apoyoBuscado: ["mentoria", "empleo"] },
    { carrera: CARRERA, sector: "Tecnología", areasInteres: ["Inteligencia Artificial", "Ciencia de Datos"], apoyoOfrecido: ["mentoria", "empleo", "networking"] }
  );

  await prisma.match.upsert({
    where: { estudiante_id_exalumno_id: { estudiante_id: estId, exalumno_id: exaId } },
    update: { score_match: score, estado: "SUGERIDO", match_reasons: reasons },
    create: { estudiante_id: estId, exalumno_id: exaId, score_match: score, estado: "SUGERIDO", match_reasons: reasons },
  });

  console.log(`🎯 Match SUGERIDO generado — score ${score}/100`);
  console.log(`   breakdown: carrera=${breakdown.carrera} intereses=${breakdown.intereses} sector=${breakdown.sector} apoyo=${breakdown.apoyo}`);
  console.log(`   razones: ${reasons.join(" · ")}\n`);

  console.log("🔑 Credenciales de prueba (password para ambos):", PASSWORD);
  console.log(`   ESTUDIANTE → ${EST.email}`);
  console.log(`   EXALUMNO   → ${EXA.email}`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
