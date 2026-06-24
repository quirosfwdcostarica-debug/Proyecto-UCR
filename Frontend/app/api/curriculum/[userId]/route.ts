import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

function parseSkills(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s: any) => typeof s === "string" ? s : (s?.skill ?? "")).filter(Boolean);
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}

function parseCertifications(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((c: any) => typeof c === "string" ? c : c?.nombre ?? c?.name ?? "").filter(Boolean);
  return [];
}

function parseExperience(raw: any) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : (() => { try { return JSON.parse(raw); } catch { return []; } })();
  return arr.map((e: any, i: number) => ({
    id: e.id ?? `exp-${i + 1}`,
    role: e.role ?? e.titulo ?? e.cargo ?? e.puesto ?? "",
    company: e.company ?? e.empresa ?? e.organizacion ?? "",
    period: e.period ?? e.periodo ?? `${e.anio_inicio ?? ""} – ${e.anio_fin ?? "Presente"}`,
    bullets: Array.isArray(e.bullets) ? e.bullets : Array.isArray(e.logros) ? e.logros : [],
  }));
}

// GET /api/curriculum/[userId] — CV público de otro usuario (requiere estar autenticado)
export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true, nombre: true, email: true, foto_url: true, tipo: true, status: true,
        exalumno: {
          select: {
            cargo_actual: true, empresa_actual: true, pais_ciudad: true,
            escuela_facultad: true, anio_graduacion: true, biografia: true,
            habilidades: true, certificaciones: true, experiencia_laboral: true,
          },
        },
        estudiante: {
          select: {
            carrera: true, escuela_facultad: true, sede: true,
            anio_ingreso: true, nivel_academico: true, habilidades: true,
            area_tematica: true, areas_interes: true, promedio_ponderado: true,
            proyecto_titulo: true, proyecto_tipo: true, proyecto_descripcion: true,
            busca_financiamiento: true, busca_mentoria: true,
            busca_empleo: true, busca_pasantia: true,
            curriculum: {
              select: {
                habilidades_tecnicas: true,
                experiencias: { select: { id: true, titulo: true, organizacion: true, tipo: true } },
                certificaciones: { select: { id: true, nombre: true, institucion: true } },
              },
            },
          },
        },
      },
    });

    if (!user || user.status === "SUSPENDIDO")
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });

    const ex  = user.exalumno;
    const est = user.estudiante;
    const tipo = user.tipo;

    let title = "", location = "San José, Costa Rica", summary = "";
    let skills: string[] = [];
    let education: { institution: string; degree: string; period: string }[] = [];
    let experience: { id: string; role: string; company: string; period: string; bullets: string[] }[] = [];
    let certifications: string[] = [];
    let proyecto: { titulo: string; tipo: string; descripcion: string } | null = null;
    let busca: string[] = [];

    if (tipo === "EXALUMNO" && ex) {
      title          = [ex.cargo_actual, ex.empresa_actual].filter(Boolean).join(" en ") || "";
      location       = ex.pais_ciudad || "San José, Costa Rica";
      summary        = ex.biografia || "";
      skills         = parseSkills(ex.habilidades);
      certifications = parseCertifications(ex.certificaciones);
      experience     = parseExperience(ex.experiencia_laboral);
      if (ex.escuela_facultad || ex.anio_graduacion) {
        education = [{
          institution: "Universidad de Costa Rica",
          degree: ex.escuela_facultad || "Carrera no especificada",
          period: ex.anio_graduacion ? `– ${ex.anio_graduacion}` : "",
        }];
      }
    } else if (tipo === "ESTUDIANTE" && est) {
      const nivelStr = est.nivel_academico ? `${est.nivel_academico} en ` : "";
      title    = est.carrera ? `${nivelStr}${est.carrera}` : est.escuela_facultad ? `Estudiante – ${est.escuela_facultad}` : "";
      location = est.sede || "San José, Costa Rica";
      summary  = (est as any).area_tematica || "";

      // Merge habilidades + areas_interes
      const baseSkills   = parseSkills((est as any).habilidades ?? (est as any).curriculum?.habilidades_tecnicas);
      const interesSkills: string[] = Array.isArray((est as any).areas_interes)
        ? (est as any).areas_interes.filter((s: any) => typeof s === "string")
        : [];
      const merged = [...baseSkills, ...interesSkills];
      skills = merged.filter((s, i) => merged.indexOf(s) === i);

      certifications = ((est as any).curriculum?.certificaciones ?? [])
        .map((c: any) => [c.nombre, c.institucion].filter(Boolean).join(" – "))
        .filter(Boolean);

      experience = ((est as any).curriculum?.experiencias ?? []).map((e: any) => ({
        id: e.id, role: e.titulo || "", company: e.organizacion || "",
        period: e.tipo || "", bullets: [],
      }));

      const degreeParts = [
        est.carrera || "Carrera no especificada",
        est.escuela_facultad ? `• ${est.escuela_facultad}` : "",
      ].filter(Boolean);
      const promedio = (est as any).promedio_ponderado;
      const periodParts = [
        est.anio_ingreso ? `${est.anio_ingreso} – Presente` : "En curso",
        promedio ? `• PA: ${Number(promedio).toFixed(2)}` : "",
      ].filter(Boolean);
      education = [{
        institution: "Universidad de Costa Rica",
        degree: degreeParts.join("  "),
        period: periodParts.join("  "),
      }];

      if (est.proyecto_titulo) {
        proyecto = {
          titulo:      est.proyecto_titulo,
          tipo:        est.proyecto_tipo || "",
          descripcion: est.proyecto_descripcion || "",
        };
      }

      if ((est as any).busca_empleo)          busca.push("Empleo");
      if ((est as any).busca_pasantia)        busca.push("Pasantía");
      if ((est as any).busca_mentoria)        busca.push("Mentoría");
      if ((est as any).busca_financiamiento)  busca.push("Financiamiento");
    }

    return NextResponse.json({
      name: user.nombre, foto_url: user.foto_url, tipo,
      title, location, summary,
      skills, education, experience, certifications, proyecto, busca,
    });
  } catch (error) {
    console.error("[GET /api/curriculum/[userId]]", error);
    return NextResponse.json({ message: "Error al obtener CV" }, { status: 500 });
  }
}
