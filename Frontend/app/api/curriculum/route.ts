import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Convierte el campo habilidades (Json) a string[]
function parseSkills(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s: any) => typeof s === "string" ? s : (s?.skill ?? "")).filter(Boolean);
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

// Convierte el campo certificaciones (Json) a string[]
function parseCertifications(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((c: any) => (typeof c === "string" ? c : c?.nombre ?? c?.name ?? JSON.stringify(c)));
  }
  return [];
}

// Mapea experiencia_laboral (Json) al formato Experience del editor de CV
function parseExperience(raw: any): { id: string; role: string; company: string; period: string; bullets: string[] }[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : (typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : []);
  return arr.map((e: any, i: number) => ({
    id: e.id ?? `exp-${i + 1}`,
    role: e.role ?? e.titulo ?? e.cargo ?? e.puesto ?? "",
    company: e.company ?? e.empresa ?? e.organizacion ?? "",
    period: e.period ?? e.periodo ?? `${e.anio_inicio ?? ""} – ${e.anio_fin ?? "Presente"}`,
    bullets: Array.isArray(e.bullets) ? e.bullets : Array.isArray(e.logros) ? e.logros : [],
  }));
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  const tipo = (session.user as any).tipo as string;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nombre: true,
        email: true,
        foto_url: true,
        exalumno: {
          select: {
            cargo_actual: true,
            empresa_actual: true,
            pais_ciudad: true,
            escuela_facultad: true,
            anio_graduacion: true,
            biografia: true,
            habilidades: true,
            certificaciones: true,
            experiencia_laboral: true,
          },
        },
        estudiante: {
          select: {
            carrera: true,
            escuela_facultad: true,
            sede: true,
            anio_ingreso: true,
            nivel_academico: true,
            habilidades: true,
            soft_skills: true,
            idiomas: true,
            curriculum: {
              select: {
                habilidades_tecnicas: true,
                idiomas: true,
                experiencias: {
                  select: { id: true, titulo: true, organizacion: true, tipo: true },
                },
                certificaciones: {
                  select: { id: true, nombre: true, institucion: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const ex = user.exalumno;
    const est = user.estudiante;

    // ── Build CV data ──────────────────────────────────────────────────────
    let title = "";
    let location = "San José, Costa Rica";
    let summary = "";
    let skills: string[] = [];
    let education: { institution: string; degree: string; period: string }[] = [];
    let experience: { id: string; role: string; company: string; period: string; bullets: string[] }[] = [];
    let certifications: string[] = [];

    if (tipo === "EXALUMNO" && ex) {
      title = [ex.cargo_actual, ex.empresa_actual].filter(Boolean).join(" en ") || "";
      location = ex.pais_ciudad || "San José, Costa Rica";
      summary = ex.biografia || "";
      skills = parseSkills(ex.habilidades);
      certifications = parseCertifications(ex.certificaciones);
      experience = parseExperience(ex.experiencia_laboral);
      if (ex.escuela_facultad || ex.anio_graduacion) {
        education = [{
          institution: "Universidad de Costa Rica",
          degree: ex.escuela_facultad || "Carrera no especificada",
          period: ex.anio_graduacion ? `– ${ex.anio_graduacion}` : "",
        }];
      }
    } else if (tipo === "ESTUDIANTE" && est) {
      const nivelStr = est.nivel_academico ? `${est.nivel_academico} en ` : "";
      title = est.carrera ? `${nivelStr}${est.carrera}` : "";
      location = est.sede || "San José, Costa Rica";
      skills = parseSkills(est.habilidades ?? est.curriculum?.habilidades_tecnicas);
      certifications = (est.curriculum?.certificaciones ?? []).map((c) => c.nombre || "").filter(Boolean);
      experience = (est.curriculum?.experiencias ?? []).map((e, i) => ({
        id: e.id,
        role: e.titulo || "",
        company: e.organizacion || "",
        period: "",
        bullets: [],
      }));
      if (est.carrera || est.escuela_facultad) {
        education = [{
          institution: "Universidad de Costa Rica",
          degree: est.carrera || est.escuela_facultad || "Carrera no especificada",
          period: est.anio_ingreso ? `${est.anio_ingreso} – Presente` : "En curso",
        }];
      }
    }

    return NextResponse.json({
      name: user.nombre,
      email: user.email,
      foto_url: user.foto_url,
      title,
      location,
      phone: "",
      summary,
      skills,
      education,
      experience,
      certifications,
    });
  } catch (error) {
    console.error("[GET /api/curriculum]", error);
    return NextResponse.json({ message: "Error al obtener datos de curriculum" }, { status: 500 });
  }
}
