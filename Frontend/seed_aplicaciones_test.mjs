/**
 * Crea aplicaciones de prueba para el usuario jbriones en posiciones abiertas.
 * Ejecutar desde Frontend/:   node seed_aplicaciones_test.mjs
 */

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

for (const line of readFileSync(new URL("./.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (!(m[1] in process.env)) process.env[m[1]] = v;
}

const prisma = new PrismaClient();

async function main() {
  // 1. Buscar el estudiante jbriones
  const user = await prisma.user.findFirst({
    where: { email: { contains: "jbriones" } },
    select: { id: true, nombre: true, email: true },
  });

  if (!user) {
    console.error("❌ No se encontró ningún usuario con email que contenga 'jbriones'");
    process.exit(1);
  }

  const estudiante = await prisma.estudiante.findUnique({
    where: { user_id: user.id },
    select: { user_id: true },
  });

  if (!estudiante) {
    console.error(`❌ El usuario ${user.email} no tiene perfil de ESTUDIANTE`);
    process.exit(1);
  }

  console.log(`✓ Estudiante encontrado: ${user.nombre} (${user.email})`);

  // 2. Buscar posiciones abiertas donde jbriones NO haya aplicado
  const yaAplico = await prisma.aplicacion.findMany({
    where: { estudiante_id: user.id },
    select: { posicion_id: true },
  });
  const yaAplicoIds = yaAplico.map((a) => a.posicion_id);

  const posiciones = await prisma.posicion.findMany({
    where: {
      estado: { not: "cubierta" },
      id: { notIn: yaAplicoIds },
    },
    select: { id: true, titulo: true, exalumno: { select: { user: { select: { nombre: true } } } } },
    take: 5,
  });

  if (posiciones.length === 0) {
    console.error("❌ No hay posiciones abiertas disponibles (o ya aplicó a todas)");
    process.exit(1);
  }

  console.log(`\n✓ Creando ${posiciones.length} aplicaciones:\n`);

  for (const pos of posiciones) {
    const aplicacion = await prisma.aplicacion.create({
      data: {
        posicion_id: pos.id,
        estudiante_id: user.id,
        estado: "ENVIADA",
      },
      select: { id: true },
    });
    console.log(`  ✓ "${pos.titulo}" (exalumno: ${pos.exalumno?.user.nombre}) → aplicacion ID: ${aplicacion.id}`);
  }

  console.log("\n✅ Listo. Entra como exalumno y selecciona/rechaza las aplicaciones.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
