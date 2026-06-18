import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getMatchesForExalumno } from "@/actions/matching.actions";
import MatchesExalumnoClient from "./MatchesExalumnoClient";

export default async function MatchesExalumnoPage() {
  let matches: any[] = [];

  try {
    const session = await auth();
    if (session?.user?.id) {
      matches = await getMatchesForExalumno(session.user.id);
    }
  } catch (e) {}

  // Mock para preview sin BD
  if (matches.length === 0) {
    matches = [
      {
        id: "m1", afinidad: 95, status: "CONTACTADO",
        estudiante: { user: { name: "Valeria Campos" }, carrera: "Ingeniería Biomédica", avanceProyecto: 70, apoyoBuscado: ["Mentoría Profesional", "Financiamiento"] }
      },
      {
        id: "m2", afinidad: 88, status: "ACTIVO",
        estudiante: { user: { name: "Esteban Picado" }, carrera: "Ingeniería Eléctrica", avanceProyecto: 40, apoyoBuscado: ["Pasantía", "Networking"] }
      },
      {
        id: "m3", afinidad: 74, status: "SUGERIDO",
        estudiante: { user: { name: "Sofía Aguilar" }, carrera: "Economía", avanceProyecto: 20, apoyoBuscado: ["Revisión de CV", "Mentoría Profesional"] }
      },
      {
        id: "m4", afinidad: 61, status: "CERRADO",
        estudiante: { user: { name: "Andrés Solano" }, carrera: "Arquitectura", avanceProyecto: 90, apoyoBuscado: ["Financiamiento"] }
      },
    ];
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Cargando matches...</div>}>
      <MatchesExalumnoClient matches={matches} />
    </Suspense>
  );
}
