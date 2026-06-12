import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calcularAfinidad } from "@/lib/matching";

export async function POST(_request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Solo ADMIN puede generar matches" }, { status: 403 });
  }

  try {
    // Obtener todos los estudiantes activos y no pausados
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        user: {
          status: "ACTIVO",
          // cuentaPausada will be filtered once migration runs
        },
      },
      include: { user: true },
    });

    // Obtener todos los exalumnos activos y no pausados
    const exalumnos = await prisma.exalumno.findMany({
      where: {
        user: {
          status: "ACTIVO",
          // cuentaPausada will be filtered once migration runs
        },
      },
      include: { user: true },
    });

    let creados = 0;
    let actualizados = 0;
    const errores: string[] = [];

    for (const estudiante of estudiantes) {
      for (const exalumno of exalumnos) {
        const afinidad = calcularAfinidad(estudiante, exalumno);

        if (afinidad > 40) {
          try {
            const result = await prisma.match.upsert({
              where: {
                estudianteId_exalumnoId: {
                  estudianteId: estudiante.id,
                  exalumnoId: exalumno.id,
                },
              },
              update: {
                afinidad,
                // Solo actualizar afinidad si el match ya existe
              },
              create: {
                estudianteId: estudiante.id,
                exalumnoId: exalumno.id,
                afinidad,
                status: "SUGERIDO",
              },
            });

            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
              creados++;
            } else {
              actualizados++;
            }
          } catch (err) {
            errores.push(`${estudiante.id}-${exalumno.id}`);
          }
        }
      }
    }

    return NextResponse.json({
      message: "Matches generados exitosamente",
      creados,
      actualizados,
      errores: errores.length > 0 ? errores : undefined,
      totalEstudiantes: estudiantes.length,
      totalExalumnos: exalumnos.length,
    });
  } catch (error) {
    console.error("[POST /api/matches/generar]", error);
    return NextResponse.json(
      { message: "Error al generar matches" },
      { status: 500 }
    );
  }
}
