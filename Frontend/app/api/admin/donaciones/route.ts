import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET — todas las donaciones para el panel admin
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") || undefined;
  const page   = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const PAGE_SIZE = 20;

  const where: any = {
    ...(estado && { estado }),
  };

  try {
    const [total, rows] = await Promise.all([
      prisma.donacion.count({ where }),
      (prisma.donacion.findMany as any)({
        where,
        select: {
          id: true, monto: true, destino: true, moneda: true,
          metodo_pago: true, estado: true, comprobante_url: true,
          created_at: true, updated_at: true,
          exalumno: { select: { user: { select: { id: true, nombre: true, email: true } } } },
          estudiante: { select: { proyecto_titulo: true, user: { select: { nombre: true } } } },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }) as Promise<any[]>,
    ]);

    const data = rows.map((d: any) => ({
      id: d.id,
      monto: Number(d.monto),
      destino: d.destino,
      moneda: d.moneda ?? "CRC",
      metodo_pago: d.metodo_pago,
      estado: d.estado,
      comprobante_url: d.comprobante_url ?? null,
      created_at: d.created_at.toISOString(),
      updated_at: d.updated_at.toISOString(),
      exalumno_nombre: d.exalumno?.user?.nombre ?? null,
      exalumno_email: d.exalumno?.user?.email ?? null,
      exalumno_id: d.exalumno?.user?.id ?? null,
      proyecto_titulo: d.estudiante?.proyecto_titulo ?? d.destino ?? "Donación general",
      estudiante_nombre: d.estudiante?.user?.nombre ?? null,
    }));

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/admin/donaciones]", error);
    return NextResponse.json({ message: "Error al obtener donaciones" }, { status: 500 });
  }
}
