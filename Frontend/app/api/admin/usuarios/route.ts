import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — lista todos los usuarios (solo admin)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get("nombre") || undefined;
  const tipo   = searchParams.get("tipo")   || undefined;
  const status = searchParams.get("status") || undefined;
  const page   = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const PAGE_SIZE = 20;

  const where: any = {
    ...(nombre && { nombre: { contains: nombre, mode: "insensitive" } }),
    ...(tipo   && { tipo }),
    ...(status && { status }),
  };

  try {
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true, nombre: true, email: true, tipo: true,
          activo: true, status: true, email_verified: true,
          created_at: true, reportes_recibidos: true,
          estudiante: { select: { carrera: true, carnet_ucr: true } },
          exalumno:   { select: { escuela_facultad: true, empresa_actual: true } },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    const data = users.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      tipo: u.tipo,
      activo: u.activo,
      status: u.status,
      email_verified: u.email_verified,
      created_at: u.created_at.toISOString(),
      reportes_recibidos: u.reportes_recibidos,
      carrera: u.estudiante?.carrera ?? u.exalumno?.escuela_facultad ?? null,
      carnet_ucr: u.estudiante?.carnet_ucr ?? null,
      empresa_actual: u.exalumno?.empresa_actual ?? null,
    }));

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/admin/usuarios]", error);
    return NextResponse.json({ message: "Error al obtener usuarios" }, { status: 500 });
  }
}
