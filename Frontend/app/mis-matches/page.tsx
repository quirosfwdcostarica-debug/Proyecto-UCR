import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MisMatchesClient from "./MisMatchesClient";

export default async function MisMatchesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).tipo || (session.user as any).role;
  const userId = session.user.id;

  let matches: any[] = [];

  try {
    if (role === "ESTUDIANTE") {
      matches = await prisma.match.findMany({
        where: { estudiante_id: userId },
        include: {
          exalumno: {
            include: {
              user: { select: { nombre: true, foto_url: true, email: true } }
            }
          }
        },
        orderBy: { created_at: "desc" }
      });
    } else if (role === "EXALUMNO") {
      matches = await prisma.match.findMany({
        where: { exalumno_id: userId },
        include: {
          estudiante: {
            include: {
              user: { select: { nombre: true, foto_url: true, email: true } }
            }
          }
        },
        orderBy: { created_at: "desc" }
      });
    }

    // Normalize for the client
    matches = matches.map((m: any) => ({
      id: m.id,
      afinidad: m.score_match || 0,
      desglose: m.desglose_score ? (typeof m.desglose_score === "string" ? JSON.parse(m.desglose_score) : m.desglose_score) : null,
      status: m.estado,
      initiated_by: m.initiated_by,
      exalumno: m.exalumno ? {
        carrera: m.exalumno.carrera,
        sector: m.exalumno.sector,
        apoyoOfrecido: m.exalumno.apoyo_ofrecido || [],
        user: { name: m.exalumno.user.nombre, image: m.exalumno.user.foto_url }
      } : null,
      estudiante: m.estudiante ? {
        carrera: m.estudiante.carrera,
        avanceProyecto: m.estudiante.proyecto_porcentaje_avance || 0,
        areaProyecto: m.estudiante.area_proyecto,
        apoyoBuscado: m.estudiante.apoyo_buscado || [],
        user: { name: m.estudiante.user.nombre, image: m.estudiante.user.foto_url }
      } : null,
    }));
  } catch (error) {
    console.error("Error fetching matches:", error);
  }

  return <MisMatchesClient matches={matches} />;
}