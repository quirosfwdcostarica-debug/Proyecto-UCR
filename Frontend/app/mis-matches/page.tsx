import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getMatchesForEstudiante } from "@/actions/matching.actions";
import MisMatchesClient from "./MisMatchesClient";

export default async function MisMatchesPage() {
  // Intentar obtener la sesión; si no hay BD/sesión, usar mock para preview
  let matches: any[] = [];
  let userId: string | undefined;

  try {
    const session = await auth();
    userId = session?.user?.id;
    if (userId) {
      matches = await getMatchesForEstudiante(userId);
    }
  } catch (e) {
    // Sin BD: mostrar UI con datos mock
  }

  // Datos mock para que la UI se vea sin BD configurada
  if (matches.length === 0) {
    matches = [
      {
        id: "m1", afinidad: 95, status: "SUGERIDO",
        exalumno: { user: { name: "Sofía Cerdas" }, carrera: "Ingeniería Industrial", sector: "Sector Privado", apoyoOfrecido: ["Mentoría Profesional", "Revisión de CV"] }
      },
      {
        id: "m2", afinidad: 82, status: "CONTACTADO",
        exalumno: { user: { name: "David Rojas" }, carrera: "Administración de Negocios", sector: "Emprendimiento / Startup", apoyoOfrecido: ["Oportunidad Laboral", "Networking"] }
      },
      {
        id: "m3", afinidad: 100, status: "ACTIVO",
        exalumno: { user: { name: "Laura Montero" }, carrera: "Ingeniería en Computación", sector: "Sector Privado", apoyoOfrecido: ["Apoyo para Proyecto de Graduación", "Mentoría Profesional"] }
      },
      {
        id: "m4", afinidad: 71, status: "CERRADO",
        exalumno: { user: { name: "Marco Solano" }, carrera: "Derecho", sector: "Sector Público", apoyoOfrecido: ["Networking", "Mentoría Profesional"] }
      },
    ];
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Cargando matches...</div>}>
      <MisMatchesClient matches={matches} />
    </Suspense>
  );
}
