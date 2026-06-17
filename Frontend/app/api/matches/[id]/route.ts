import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { sendMatchAceptado, sendMatchRechazado, sendMatchConnectionRequest, sendAdminNewActiveMatch } from "@/lib/email";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        estudiante: { include: { user: { select: { name: true, email: true, image: true, phone: true } } } },
        exalumno: { include: { user: { select: { name: true, email: true, image: true, phone: true } } } },
      },
    });

    if (!match) return NextResponse.json({ message: "Match no encontrado" }, { status: 404 });
    return NextResponse.json(match);
  } catch (error) {
    console.error("[Match] Error GET:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    const userId = session.user.id;

    const body = await req.json();
    const { action } = body;

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        estudiante: { include: { user: true } },
        exalumno: { include: { user: true } },
      },
    });

    if (!match) return NextResponse.json({ message: "Match no encontrado" }, { status: 404 });

    const isEstudiante = match.estudianteId === userId;
    const isExalumno = match.exalumnoId === userId;
    if (!isEstudiante && !isExalumno) return NextResponse.json({ message: "No autorizado" }, { status: 403 });

    const emisorNombre = isEstudiante ? match.estudiante.user.name : match.exalumno.user.name;
    const receptorNombre = isEstudiante ? match.exalumno.user.name : match.estudiante.user.name;
    const receptorEmail = isEstudiante ? match.exalumno.user.email : match.estudiante.user.email;

    if (action === "CONTACTAR") {
      if (match.status !== "SUGERIDO") return NextResponse.json({ message: "Match ya no está sugerido" }, { status: 400 });

      const updated = await prisma.match.update({
        where: { id: params.id },
        data: { status: "CONTACTADO", initiatedBy: userId },
      });

      if (receptorEmail) {
        await sendMatchConnectionRequest(receptorEmail, receptorNombre || "", emisorNombre || "");
      }
      return NextResponse.json(updated);
    } 
    
    if (action === "ACEPTAR") {
      if (match.status !== "CONTACTADO") return NextResponse.json({ message: "Match no contactado" }, { status: 400 });
      if (match.initiatedBy === userId) return NextResponse.json({ message: "No puedes aceptar tu propia solicitud" }, { status: 400 });

      const updated = await prisma.match.update({
        where: { id: params.id },
        data: { status: "ACTIVO", acceptedAt: new Date() },
      });

      const emisorEmailOriginal = isEstudiante ? match.exalumno.user.email : match.estudiante.user.email;
      
      if (emisorEmailOriginal) {
        await sendMatchAceptado(emisorEmailOriginal, emisorNombre || "", receptorNombre || "");
      }
      
      // Notificar al admin (Opcional, asumiendo admin@alumni.ucr.ac.cr)
      await sendAdminNewActiveMatch("admin@alumni.ucr.ac.cr", match.estudiante.user.name || "", match.exalumno.user.name || "");

      return NextResponse.json(updated);
    } 
    
    if (action === "RECHAZAR") {
      if (match.status !== "CONTACTADO") return NextResponse.json({ message: "Match no contactado" }, { status: 400 });
      if (match.initiatedBy === userId) return NextResponse.json({ message: "No puedes rechazar tu propia solicitud" }, { status: 400 });

      const updated = await prisma.match.update({
        where: { id: params.id },
        data: { status: "RECHAZADO", rejectedAt: new Date() },
      });

      const emisorEmailOriginal = isEstudiante ? match.exalumno.user.email : match.estudiante.user.email;
      if (emisorEmailOriginal) {
        await sendMatchRechazado(emisorEmailOriginal, emisorNombre || "");
      }

      return NextResponse.json(updated);
    }

    if (action === "CERRAR") {
      if (match.status !== "ACTIVO") return NextResponse.json({ message: "Solo puedes cerrar matches activos" }, { status: 400 });

      const updated = await prisma.match.update({
        where: { id: params.id },
        data: { status: "CERRADO", closedAt: new Date() },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("[Match] Error PATCH:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
