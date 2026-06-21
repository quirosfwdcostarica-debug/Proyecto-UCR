import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendMatchAceptado, sendMatchRechazado, sendMatchConnectionRequest, sendAdminNewActiveMatch } from "@/lib/email";

// Explicit selects — only existing DB columns
const MATCH_WITH_USERS_SELECT = {
  id: true, estado: true, score_match: true, tipo_apoyo: true, resultado: true,
  estudiante_id: true, exalumno_id: true, initiated_by: true,
  match_reasons: true, accepted_at: true, rejected_at: true, closed_at: true,
  created_at: true, updated_at: true,
  estudiante: {
    select: {
      user_id: true, carrera: true, escuela_facultad: true, proyecto_titulo: true, proyecto_tipo: true,
      busca_mentoria: true, busca_empleo: true, busca_pasantia: true, busca_financiamiento: true,
      user: { select: { nombre: true, email: true, foto_url: true } },
    },
  },
  exalumno: {
    select: {
      user_id: true, escuela_facultad: true, empresa_actual: true, cargo_actual: true,
      ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
      ofrece_donacion_dinero: true, ofrece_guest_speaking: true,
      ofrece_volunteering: true, ofrece_career_advice: true, ofrece_networking: true,
      user: { select: { nombre: true, email: true, foto_url: true } },
    },
  },
} as const;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      select: MATCH_WITH_USERS_SELECT,
    });

    if (!match) return NextResponse.json({ message: "Match no encontrado" }, { status: 404 });

    const normalized = {
      ...match,
      status: match.estado,
      afinidad: match.score_match,
      estudianteId: match.estudiante_id,
      exalumnoId: match.exalumno_id,
      initiatedBy: match.initiated_by,
      estudiante: match.estudiante ? {
        ...match.estudiante,
        id: match.estudiante.user_id,
        user: { name: match.estudiante.user.nombre, email: match.estudiante.user.email, image: match.estudiante.user.foto_url },
      } : null,
      exalumno: match.exalumno ? {
        ...match.exalumno,
        id: match.exalumno.user_id,
        user: { name: match.exalumno.user.nombre, email: match.exalumno.user.email, image: match.exalumno.user.foto_url },
      } : null,
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[Match] Error GET:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    const userId = session.user.id;

    const body = await req.json();
    const { action } = body;

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      select: MATCH_WITH_USERS_SELECT,
    });

    if (!match) return NextResponse.json({ message: "Match no encontrado" }, { status: 404 });

    const isEstudiante = match.estudiante_id === userId;
    const isExalumno = match.exalumno_id === userId;
    if (!isEstudiante && !isExalumno) return NextResponse.json({ message: "No autorizado" }, { status: 403 });

    const emisorNombre = isEstudiante ? match.estudiante?.user.nombre : match.exalumno?.user.nombre;
    const receptorNombre = isEstudiante ? match.exalumno?.user.nombre : match.estudiante?.user.nombre;
    const receptorEmail = isEstudiante ? match.exalumno?.user.email : match.estudiante?.user.email;

    if (action === "CONTACTAR") {
      if (match.estado !== "SUGERIDO") return NextResponse.json({ message: "Match ya no está sugerido" }, { status: 400 });

      const updated = await prisma.match.update({
        where: { id: params.id },
        data: { estado: "CONTACTADO", initiated_by: userId },
      });

      if (receptorEmail) {
        await sendMatchConnectionRequest(receptorEmail, receptorNombre || "", emisorNombre || "");
      }
      return NextResponse.json({ ...updated, status: updated.estado });
    }

    if (action === "ACEPTAR") {
      if (match.estado !== "CONTACTADO") return NextResponse.json({ message: "Match no contactado" }, { status: 400 });
      if (match.initiated_by === userId) return NextResponse.json({ message: "No puedes aceptar tu propia solicitud" }, { status: 400 });

      const updated = await prisma.match.update({
        where: { id: params.id },
        data: { estado: "ACTIVO", accepted_at: new Date() },
      });

      const emisorEmailOriginal = isEstudiante ? match.exalumno?.user.email : match.estudiante?.user.email;
      if (emisorEmailOriginal) {
        await sendMatchAceptado(emisorEmailOriginal, emisorNombre || "", receptorNombre || "");
      }
      await sendAdminNewActiveMatch(
        "admin@alumni.ucr.ac.cr",
        match.estudiante?.user.nombre || "",
        match.exalumno?.user.nombre || ""
      );

      return NextResponse.json({ ...updated, status: updated.estado });
    }

    if (action === "RECHAZAR") {
      if (match.estado !== "CONTACTADO") return NextResponse.json({ message: "Match no contactado" }, { status: 400 });
      if (match.initiated_by === userId) return NextResponse.json({ message: "No puedes rechazar tu propia solicitud" }, { status: 400 });

      const updated = await prisma.match.update({
        where: { id: params.id },
        data: { estado: "CERRADO", rejected_at: new Date() },
      });

      const emisorEmailOriginal = isEstudiante ? match.exalumno?.user.email : match.estudiante?.user.email;
      if (emisorEmailOriginal) {
        await sendMatchRechazado(emisorEmailOriginal, emisorNombre || "");
      }
      return NextResponse.json({ ...updated, status: updated.estado });
    }

    if (action === "CERRAR") {
      if (match.estado !== "ACTIVO") return NextResponse.json({ message: "Solo puedes cerrar matches activos" }, { status: 400 });

      const updated = await prisma.match.update({
        where: { id: params.id },
        data: { estado: "CERRADO", closed_at: new Date() },
      });
      return NextResponse.json({ ...updated, status: updated.estado });
    }

    return NextResponse.json({ message: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("[Match] Error PATCH:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
