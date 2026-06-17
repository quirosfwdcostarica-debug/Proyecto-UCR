import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MisMatchesClient from "./MisMatchesClient";

export default async function MisMatchesPage() {
  let matches: any[] = [];

  try {
    const session = await auth();
    if (session?.user?.id) {
      const userId = session.user.id;

      const rawMatches = await prisma.match.findMany({
        where: { estudiante_id: userId },
        orderBy: { score_match: "desc" },
        include: {
          exalumno: {
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
        exalumno: {
          user: { name: m.exalumno?.user?.nombre ?? null },
          carrera: m.exalumno?.escuela_facultad ?? "",
          sector: m.exalumno?.empresa_actual ?? m.exalumno?.cargo_actual ?? "",
          apoyoOfrecido: [
            m.exalumno?.ofrece_mentoria         ? "Mentoría"        : null,
            m.exalumno?.ofrece_empleo           ? "Empleo"          : null,
            m.exalumno?.ofrece_pasantia         ? "Pasantía"        : null,
            m.exalumno?.ofrece_donacion_dinero  ? "Financiamiento"  : null,
            m.exalumno?.ofrece_guest_speaking   ? "Guest Speaking"  : null,
            m.exalumno?.ofrece_networking       ? "Networking"      : null,
          ].filter(Boolean) as string[],
        },
      }));
    }
  } catch (e) {
    console.error("[MisMatchesPage]", e);
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Cargando matches...</div>}>
      <MisMatchesClient matches={matches} />
    </Suspense>
  );
}