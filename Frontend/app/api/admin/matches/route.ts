import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).tipo !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const nombre = searchParams.get("nombre") || undefined;

    const matches = await prisma.match.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(nombre
          ? {
              OR: [
                { estudiante: { user: { name: { contains: nombre, mode: "insensitive" } } } },
                { exalumno: { user: { name: { contains: nombre, mode: "insensitive" } } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        estudiante: { include: { user: { select: { name: true, email: true } } } },
        exalumno: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("[Admin Matches] Error:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
