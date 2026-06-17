import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();
  const requesterId = (session?.user as any)?.id as string | undefined;
  const requesterRole = (session?.user as any)?.tipo || (session?.user as any)?.role;

  const { searchParams } = new URL(request.url);
  const carrera = searchParams.get("carrera");
  const areaProyecto = searchParams.get("areaProyecto");
  const apoyoBuscado = searchParams.get("apoyoBuscado");
  const nombre = searchParams.get("nombre");

  try {
    // 1. Fetch active students from the USERS table (matching role, status, and name query)
    const matchingUsers = await prisma.$queryRaw<any[]>`
      SELECT id::text, nombre, foto_url
      FROM "USERS"
      WHERE tipo = 'ESTUDIANTE' 
        AND activo = true
        ${nombre ? Prisma.sql`AND nombre ILIKE ${`%${nombre}%`}` : Prisma.empty}
    `;

    const activeUserIds = matchingUsers.map(u => u.id);

    if (activeUserIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Fetch the corresponding student profiles using those IDs
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        id: { in: activeUserIds },
        ...(carrera && {
          carrera: { contains: carrera, mode: "insensitive" },
        }),
        ...(areaProyecto && {
          areaProyecto: { contains: areaProyecto, mode: "insensitive" },
        }),
        ...(apoyoBuscado && {
          apoyoBuscado: { has: apoyoBuscado },
        }),
      },
      select: {
        id: true,
        carrera: true,
        avanceProyecto: true,
        areaProyecto: true,
        apoyoBuscado: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Fetch project completion status from the User table (NextAuth)
    const nextAuthUsers = await prisma.user.findMany({
      where: { id: { in: estudiantes.map(e => e.id) } },
      select: { id: true, proyectoFinalizado: true }
    });
    const completionMap = new Map(nextAuthUsers.map(u => [u.id, u.proyectoFinalizado]));

    // 4. Combine and return data
    const userMap = new Map(matchingUsers.map(u => [u.id, u]));
    const sanitized = estudiantes.map((est) => {
      const dbUser = userMap.get(est.id);
      return {
        ...est,
        user: {
          id: est.id,
          name: dbUser ? dbUser.nombre : "Estudiante UCR",
          image: dbUser ? dbUser.foto_url : null,
          proyectoFinalizado: completionMap.get(est.id) || false,
        }
      };
    });

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("[GET /api/estudiantes]", error);
    return NextResponse.json(
      { message: "Error al obtener el directorio de estudiantes" },
      { status: 500 }
    );
  }
}
