/**
 * Script de seed para NAYDELIN JUDITH RIVERA RODRIGUEZ
 * Crea su perfil de Estudiante en la tabla ESTUDIANTES,
 * y Matches SUGERIDOS con todos los exalumnos activos.
 *
 * Ejecutar: npx tsx seed_naydelin.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// IDs reales de la tabla USERS de Supabase
const NAYDELIN_ID = "b51c5ce8-5c84-4d08-a0d6-4ecbf11178f5";

// IDs reales de los exalumnos en la tabla USERS de Supabase
const EXALUMNOS = [
  { id: "4fb31852-ebe9-458a-b315-324d7ed84079", nombre: "John" },
  { id: "c8f7ac34-f1f2-4165-a331-25f44ad3f791", nombre: "gffnfnd" },
  { id: "44bd154d-cf90-47db-b8b6-9234b3d57160", nombre: "DANIELA DIXON CAYOLA" },
  { id: "ba8fae05-5290-4eef-af22-748ed55e0d3d", nombre: "Andy" },
  { id: "f4aa1632-d188-4e31-af49-495b18ea7147", nombre: "exalumno" },
  { id: "357edcab-3b27-4915-ada2-cf28ef74f609", nombre: "Andres" },
];

async function main() {
  console.log("🌱 Iniciando seed de NAYDELIN...\n");

  // 1. Asegurar que el user exista en USERS
  const existingUser = await prisma.user.findUnique({ where: { id: NAYDELIN_ID } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: NAYDELIN_ID,
        nombre: "NAYDELIN JUDITH RIVERA RODRIGUEZ",
        email: "jeancarlosbarberena29@gmail.com",
        tipo: "ESTUDIANTE",
        status: "ACTIVO",
        activo: true,
      },
    });
    console.log("✅ User creado en USERS para NAYDELIN");
  } else {
    await prisma.user.update({
      where: { id: NAYDELIN_ID },
      data: {
        nombre: "NAYDELIN JUDITH RIVERA RODRIGUEZ",
        tipo: "ESTUDIANTE",
        status: "ACTIVO",
        activo: true,
      },
    });
    console.log("✅ User actualizado en USERS para NAYDELIN");
  }

  // 2. Crear perfil de Estudiante en ESTUDIANTES
  await prisma.estudiante.upsert({
    where: { user_id: NAYDELIN_ID },
    update: {
      carrera: "Ingeniería en Computación",
      busca_mentoria: true,
      busca_empleo: true,
      proyecto_titulo: "Sistema de Análisis de Datos para Proyectos Estudiantiles",
      proyecto_tipo: "Tesis",
    },
    create: {
      user_id: NAYDELIN_ID,
      carrera: "Ingeniería en Computación",
      busca_mentoria: true,
      busca_empleo: true,
      proyecto_titulo: "Sistema de Análisis de Datos para Proyectos Estudiantiles",
      proyecto_tipo: "Tesis",
    },
  });
  console.log("✅ Perfil de Estudiante creado/actualizado en ESTUDIANTES para NAYDELIN");

  // 3. Para cada exalumno: crear Match SUGERIDO con NAYDELIN
  for (const exalumno of EXALUMNOS) {
    // 3a. Verificar que el exalumno exista en USERS y EXALUMNOS
    const existingExaUser = await prisma.user.findUnique({ where: { id: exalumno.id } });
    if (!existingExaUser) {
      await prisma.user.create({
        data: {
          id: exalumno.id,
          nombre: exalumno.nombre,
          email: `${exalumno.id}@placeholder.ucr.ac.cr`,
          tipo: "EXALUMNO",
          status: "ACTIVO",
          activo: true,
        },
      });
      console.log(`  ✅ User creado en USERS para exalumno: ${exalumno.nombre}`);
    }

    const existingExalumno = await prisma.exalumno.findUnique({ where: { user_id: exalumno.id } });
    if (!existingExalumno) {
      await prisma.exalumno.create({
        data: {
          user_id: exalumno.id,
          escuela_facultad: "Ingeniería en Computación",
          ofrece_mentoria: true,
          ofrece_empleo: true,
          ofrece_networking: true,
        },
      });
      console.log(`  ✅ Perfil Exalumno creado en EXALUMNOS para: ${exalumno.nombre}`);
    } else {
      console.log(`  ℹ️  Perfil Exalumno ya existe para: ${exalumno.nombre}`);
    }

    // 3b. Crear el Match SUGERIDO entre NAYDELIN y el exalumno
    await prisma.match.upsert({
      where: {
        estudiante_id_exalumno_id: {
          estudiante_id: NAYDELIN_ID,
          exalumno_id: exalumno.id,
        },
      },
      update: {
        score_match: 78,
        estado: "SUGERIDO",
      },
      create: {
        estudiante_id: NAYDELIN_ID,
        exalumno_id: exalumno.id,
        score_match: 78,
        estado: "SUGERIDO",
      },
    });
    console.log(`  ✅ Match SUGERIDO creado entre NAYDELIN y ${exalumno.nombre}`);

    // 3c. Crear notificación en la tabla NOTIFICATIONS
    await prisma.$executeRaw`
      INSERT INTO "NOTIFICATIONS" (id, user_id, title, message, type, read, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${exalumno.id}::uuid,
        'Nuevo estudiante sugerido',
        ${'NAYDELIN JUDITH RIVERA RODRIGUEZ está buscando apoyo en Desarrollo de Software. ¡Es un match potencial!'},
        'match_request',
        false,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING
    `;
    console.log(`  ✅ Notificación creada para exalumno: ${exalumno.nombre}`);
  }

  console.log("\n🎉 Seed completado exitosamente!");
  console.log(`\n📋 Resumen:`);
  console.log(`   - NAYDELIN (${NAYDELIN_ID}) registrada como Estudiante en ESTUDIANTES`);
  console.log(`   - ${EXALUMNOS.length} Matches SUGERIDOS creados en MATCHES`);
  console.log(`   - ${EXALUMNOS.length} Notificaciones enviadas a los exalumnos en NOTIFICATIONS`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
