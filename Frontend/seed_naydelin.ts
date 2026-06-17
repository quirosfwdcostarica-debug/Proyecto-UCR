/**
 * Script de seed para NAYDELIN JUDITH RIVERA RODRIGUEZ
 * Crea su perfil de Estudiante en Prisma, un User en NextAuth,
 * y Matches SUGERIDOS con todos los exalumnos activos.
 *
 * Ejecutar: npx ts-node --skip-project seed_naydelin.ts
 * o desde el directorio Frontend: npx tsx seed_naydelin.ts
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

  // 1. Crear User en la tabla NextAuth (si no existe)
  await prisma.user.upsert({
    where: { id: NAYDELIN_ID },
    update: {
      name: "NAYDELIN JUDITH RIVERA RODRIGUEZ",
      email: "jeancarlosbarberena29@gmail.com",
      role: "ESTUDIANTE",
      status: "ACTIVO",
    },
    create: {
      id: NAYDELIN_ID,
      name: "NAYDELIN JUDITH RIVERA RODRIGUEZ",
      email: "jeancarlosbarberena29@gmail.com",
      role: "ESTUDIANTE",
      status: "ACTIVO",
    },
  });
  console.log("✅ User de NextAuth creado/actualizado para NAYDELIN");

  // 2. Crear perfil de Estudiante (si no existe)
  await prisma.estudiante.upsert({
    where: { id: NAYDELIN_ID },
    update: {
      carrera: "Ingeniería en Computación",
      avanceProyecto: 65,
      areaProyecto: "Desarrollo de Software",
      apoyoBuscado: ["Mentoría Profesional", "Oportunidad Laboral", "Networking"],
    },
    create: {
      id: NAYDELIN_ID,
      carrera: "Ingeniería en Computación",
      avanceProyecto: 65,
      areaProyecto: "Desarrollo de Software",
      apoyoBuscado: ["Mentoría Profesional", "Oportunidad Laboral", "Networking"],
    },
  });
  console.log("✅ Perfil de Estudiante creado/actualizado para NAYDELIN");

  // 3. Para cada exalumno: asegurarse de que tenga User y Exalumno en Prisma,
  //    luego crear Match SUGERIDO con NAYDELIN
  for (const exalumno of EXALUMNOS) {
    // 3a. Asegurar que el User de NextAuth exista para el exalumno
    const existingUser = await prisma.user.findUnique({ where: { id: exalumno.id } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: exalumno.id,
          name: exalumno.nombre,
          role: "EXALUMNO",
          status: "ACTIVO",
        },
      });
      console.log(`  ✅ User NextAuth creado para exalumno: ${exalumno.nombre}`);
    }

    // 3b. Asegurar que el perfil de Exalumno exista en Prisma
    const existingExalumno = await prisma.exalumno.findUnique({ where: { id: exalumno.id } });
    if (!existingExalumno) {
      await prisma.exalumno.create({
        data: {
          id: exalumno.id,
          carrera: "Ingeniería en Computación",
          sector: "Sector Privado",
          areasInteres: ["Desarrollo de Software", "Tecnología", "Innovación"],
          apoyoOfrecido: ["Mentoría Profesional", "Networking", "Revisión de CV"],
        },
      });
      console.log(`  ✅ Perfil Exalumno creado para: ${exalumno.nombre}`);
    } else {
      console.log(`  ℹ️  Perfil Exalumno ya existe para: ${exalumno.nombre}`);
    }

    // 3c. Crear el Match SUGERIDO entre NAYDELIN y el exalumno
    await prisma.match.upsert({
      where: {
        estudianteId_exalumnoId: {
          estudianteId: NAYDELIN_ID,
          exalumnoId: exalumno.id,
        },
      },
      update: {
        afinidad: 78,
        status: "SUGERIDO",
      },
      create: {
        estudianteId: NAYDELIN_ID,
        exalumnoId: exalumno.id,
        afinidad: 78,
        status: "SUGERIDO",
      },
    });
    console.log(`  ✅ Match SUGERIDO creado entre NAYDELIN y ${exalumno.nombre}`);

    // 3d. Crear notificación en la tabla NOTIFICATIONS para el exalumno
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
  console.log(`   - NAYDELIN (${NAYDELIN_ID}) registrada como Estudiante en Prisma`);
  console.log(`   - ${EXALUMNOS.length} Matches SUGERIDOS creados`);
  console.log(`   - ${EXALUMNOS.length} Notificaciones enviadas a los exalumnos`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
