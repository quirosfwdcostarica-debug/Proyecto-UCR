import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;


export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nombre     = searchParams.get("nombre")      || undefined;
  const carrera    = searchParams.get("carrera")     || undefined;
  const tipo_apoyo = searchParams.get("tipo_apoyo")  || undefined;
  const sede       = searchParams.get("sede")        || undefined;
  const area       = searchParams.get("area_tematica") || undefined;
  const page       = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  try {
    const apoyo: Record<string, boolean> = {};
    if (tipo_apoyo === "mentoria")           apoyo.busca_mentoria      = true;
    else if (tipo_apoyo === "empleo")        apoyo.busca_empleo        = true;
    else if (tipo_apoyo === "pasantia")      apoyo.busca_pasantia      = true;
    else if (tipo_apoyo === "financiamiento") apoyo.busca_financiamiento = true;

    const where = {
      visible_en_directorio: true,
      activo: true,
      ...(carrera && { carrera:      { contains: carrera, mode: "insensitive" as const } }),
      ...(sede    && { sede:         { contains: sede,    mode: "insensitive" as const } }),
      ...(area    && { area_tematica: { contains: area,   mode: "insensitive" as const } }),
      ...apoyo,
      user: {
        activo: true,
        status: { not: "SUSPENDIDO" as const },
        ...(nombre && { nombre: { contains: nombre, mode: "insensitive" as const } }),
      },
    };

    const [total, rows] = await Promise.all([
      prisma.estudiante.count({ where }),
      prisma.estudiante.findMany({
        where,
        select: {
          user_id: true,
          carrera: true,
          escuela_facultad: true,
          sede: true,
          nivel_academico: true,
          area_tematica: true,
          proyecto_titulo: true,
          proyecto_tipo: true,
          proyecto_descripcion: true,
          proyecto_porcentaje_avance: true,
          busca_financiamiento: true,
          busca_mentoria: true,
          busca_empleo: true,
          busca_pasantia: true,
          user: { select: { id: true, nombre: true, foto_url: true } },
        },
        orderBy: { user: { created_at: "desc" } },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    const data = rows.map((est) => ({
      id: est.user_id,
      carrera: est.carrera ?? "",
      avanceProyecto: est.proyecto_porcentaje_avance ?? 0,
      areaProyecto: est.area_tematica ?? est.proyecto_tipo ?? null,
      proyectoTitulo: est.proyecto_titulo ?? null,
      proyectoDescripcion: est.proyecto_descripcion ?? null,
      sede: est.sede ?? null,
      apoyoBuscado: [
        est.busca_mentoria ? "Mentoría" : null,
        est.busca_empleo ? "Empleo" : null,
        est.busca_pasantia ? "Pasantía" : null,
        est.busca_financiamiento ? "Financiamiento" : null,
      ].filter(Boolean) as string[],
      user: {
        id: est.user.id,
        name: est.user.nombre,
        image: est.user.foto_url,
        bio: null,
        proyectoFinalizado: (est.proyecto_porcentaje_avance ?? 0) === 100,
      },
    }));

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/estudiantes]", error);
    return NextResponse.json({ message: "Error al obtener el directorio" }, { status: 500 });
  }
}
