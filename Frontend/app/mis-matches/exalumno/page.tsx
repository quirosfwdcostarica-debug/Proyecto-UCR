import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MatchesExalumnoClient from "./MatchesExalumnoClient";

export default async function MatchesExalumnoPage() {
  let matches: any[] = [];

  try {
    const session = await auth();
    if (session?.user?.id) {
      const userId = session.user.id;

      const rawMatches = await prisma.match.findMany({
        where: { exalumno_id: userId },
        orderBy: { score_match: "desc" },
        include: {
          estudiante: {
            include: {
              user: { select: { nombre: true, foto_url: true } },
            },
          },
        },
      });

      matches = rawMatches.map((m) => ({
        id: m.id,
        afinidad: m.score_match ?? 0,
        status: m.estado as string,
        initiated_by: m.initiated_by ?? "sistema",
        estudiante: {
          user: { name: m.estudiante?.user?.nombre ?? null },
          carrera: m.estudiante?.carrera ?? "",
          avanceProyecto: m.score_match ?? 0,
          apoyoBuscado: [
            m.estudiante?.busca_mentoria       ? "Mentoría"       : null,
            m.estudiante?.busca_empleo         ? "Empleo"         : null,
            m.estudiante?.busca_pasantia       ? "Pasantía"       : null,
            m.estudiante?.busca_financiamiento ? "Financiamiento" : null,
          ].filter(Boolean) as string[],
        },
      }));
    }
  } catch (e) {
    console.error("[MatchesExalumnoPage]", e);
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Cargando matches...</div>}>
      <MatchesExalumnoClient matches={matches} />
    </Suspense>
  );
}
