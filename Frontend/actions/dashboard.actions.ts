"use server";

import prisma from "@/lib/prisma";

export async function getJobPositions() {
  try {
    const posiciones = await prisma.posicion.findMany({
      where: { estado: "activa" },
      select: {
        id: true, titulo: true, tipo: true, modalidad: true,
        empresa: true, jornada: true, fecha_limite: true,
      },
      orderBy: { created_at: "desc" },
      take: 20,
    });
    return posiciones.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      tipo: p.tipo,
      modalidad: p.modalidad,
      empresa: p.empresa,
      jornada: p.jornada,
      fecha_limite: p.fecha_limite?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching posiciones:", error);
    return [];
  }
}

export async function getStudentProjects() {
  try {
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        visible_en_directorio: true,
        busca_financiamiento: true,
        proyecto_titulo: { not: null },
        user: { activo: true },
      },
      select: {
        user_id: true,
        carrera: true,
        proyecto_titulo: true,
        proyecto_tipo: true,
        proyecto_descripcion: true,
        proyecto_porcentaje_avance: true,
        user: { select: { nombre: true, foto_url: true } },
      },
    });

    return estudiantes.map((e) => ({
      id: e.user_id,
      nombre: e.proyecto_titulo ?? "Sin título",
      carrera: e.carrera ?? "Carrera no especificada",
      descripcion: e.proyecto_descripcion ?? e.proyecto_tipo ?? "Proyecto de estudiante",
      avance: e.proyecto_porcentaje_avance ?? 0,
      estudianteNombre: e.user?.nombre ?? "Estudiante",
    }));
  } catch (error) {
    console.error("Error fetching student projects:", error);
    return [];
  }
}
