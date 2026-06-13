import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const nombre = searchParams.get("nombre");

  try {
    const matches = await prisma.match.findMany({
      where: {
        ...(status && { status: status as "SUGERIDO" | "CONTACTADO" | "ACTIVO" }),
        ...(nombre && {
          OR: [
            {
              estudiante: {
                user: { name: { contains: nombre, mode: "insensitive" } },
              },
            },
            {
              exalumno: {
                user: { name: { contains: nombre, mode: "insensitive" } },
              },
            },
          ],
        }),
      },
      orderBy: { afinidad: "desc" },
      include: {
        estudiante: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        exalumno: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("[GET /api/admin/matches]", error);
    return NextResponse.json({ message: "Error al obtener matches" }, { status: 500 });
  }
}
