import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — vista pública del proyecto de un estudiante específico (por su user_id)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const estudiante = await prisma.estudiante.findUnique({
      where: { user_id: params.id },
      select: {
        carrera: true,
        escuela_facultad: true,
        sede: true,
        nivel_academico: true,
        proyecto_titulo: true,
        proyecto_tipo: true,
        proyecto_descripcion: true,
        proyecto_porcentaje_avance: true,
        proyecto_necesidades: true,
        busca_financiamiento: true,
        busca_mentoria: true,
        busca_empleo: true,
        busca_pasantia: true,
        visible_en_directorio: true,
        user: { select: { nombre: true, foto_url: true } },
      },
    });

    if (!estudiante) return NextResponse.json({ message: "Estudiante no encontrado" }, { status: 404 });
    if (!estudiante.visible_en_directorio || !estudiante.proyecto_titulo)
      return NextResponse.json({ message: "Proyecto no disponible" }, { status: 404 });

    return NextResponse.json({
      studentId: params.id,
      nombre: estudiante.user.nombre,
      foto_url: estudiante.user.foto_url,
      carrera: estudiante.carrera,
      escuela_facultad: estudiante.escuela_facultad,
      sede: estudiante.sede,
      nivel_academico: estudiante.nivel_academico,
      proyecto_titulo: estudiante.proyecto_titulo,
      proyecto_tipo: estudiante.proyecto_tipo,
      proyecto_descripcion: estudiante.proyecto_descripcion,
      proyecto_porcentaje_avance: estudiante.proyecto_porcentaje_avance ?? 0,
      proyecto_necesidades: estudiante.proyecto_necesidades,
      busca_financiamiento: !!estudiante.busca_financiamiento,
      busca_mentoria: !!estudiante.busca_mentoria,
      busca_empleo: !!estudiante.busca_empleo,
      busca_pasantia: !!estudiante.busca_pasantia,
    });
  } catch (error) {
    console.error("[GET /api/proyectos/[id]]", error);
    return NextResponse.json({ message: "Error al obtener proyecto" }, { status: 500 });
  }
}
