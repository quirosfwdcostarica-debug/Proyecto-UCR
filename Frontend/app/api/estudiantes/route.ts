import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { auth } from "@/lib/auth";

const API_URL = process.env.API_URL || "http://localhost:3001/api";
=======
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
>>>>>>> 907fc53ecfd76e3a1553856ec28ef26b58240508

const PAGE_SIZE = 12;


export async function GET(request: NextRequest) {
<<<<<<< HEAD
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

  const { searchParams } = new URL(request.url);
  const carrera = searchParams.get("carrera");
  const apoyoBuscado = searchParams.get("apoyoBuscado");
  const nombre = searchParams.get("nombre");
  const areaProyecto = searchParams.get("areaProyecto");

  try {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/estudiantes`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Error fetching from backend: ${res.status}`);
    }

    const estudiantesBackend = await res.json();

    // Map backend schema to frontend EstudianteItem schema
    let mapped = estudiantesBackend.map((est: any) => {
      const tags: string[] = [];
      if (est.busca_financiamiento) tags.push("MONETARIA");
      if (est.busca_mentoria) tags.push("MENTORÍA");
      if (est.busca_empleo) tags.push("EMPLEO");
      if (est.busca_pasantia) tags.push("PASANTÍA");

      return {
        id: est.user_id,
        carrera: est.carrera || "Carrera No Especificada",
        avanceProyecto: 50, // Default progress since backend doesn't store it
        areaProyecto: est.escuela_facultad || null,
        apoyoBuscado: tags.length > 0 ? tags : ["APOYO GENERAL"],
        user: {
          id: est.user_id,
          name: est.User?.nombre || "Estudiante UCR",
          image: est.User?.foto_url || null,
          bio: "Proyecto: " + (est.proyecto_titulo || "Sin título"),
          proyectoFinalizado: false,
        }
      };
    });

    // Apply filters in JS
    if (carrera) {
      mapped = mapped.filter((est: any) => 
        est.carrera.toLowerCase().includes(carrera.toLowerCase())
      );
    }
    if (areaProyecto) {
      mapped = mapped.filter((est: any) => 
        est.areaProyecto && est.areaProyecto.toLowerCase().includes(areaProyecto.toLowerCase())
      );
    }
    if (apoyoBuscado) {
      mapped = mapped.filter((est: any) => 
        est.apoyoBuscado.some((tag: string) => tag.toLowerCase() === apoyoBuscado.toLowerCase())
      );
    }
    if (nombre) {
      mapped = mapped.filter((est: any) => 
        est.user.name.toLowerCase().includes(nombre.toLowerCase())
      );
    }

    return NextResponse.json(mapped);
=======
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
  const nombre = searchParams.get("nombre") || undefined;
  const carrera = searchParams.get("carrera") || undefined;
  const tipo_apoyo = searchParams.get("tipo_apoyo") || undefined;
  const sede = searchParams.get("sede") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  try {
    const apoyo: Record<string, boolean> = {};
    if (tipo_apoyo === "mentoria") apoyo.busca_mentoria = true;
    else if (tipo_apoyo === "empleo") apoyo.busca_empleo = true;
    else if (tipo_apoyo === "pasantia") apoyo.busca_pasantia = true;
    else if (tipo_apoyo === "financiamiento") apoyo.busca_financiamiento = true;

    const where = {
      ...(carrera && { carrera: { contains: carrera, mode: "insensitive" as const } }),
      ...(sede && { sede: { contains: sede, mode: "insensitive" as const } }),
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
          proyecto_titulo: true,
          proyecto_tipo: true,
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
      areaProyecto: est.proyecto_tipo ?? null,
      proyectoTitulo: est.proyecto_titulo ?? null,
      proyectoDescripcion: null,
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
        proyectoFinalizado: false,
      },
    }));

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
>>>>>>> 907fc53ecfd76e3a1553856ec28ef26b58240508
  } catch (error) {
    console.error("[GET /api/estudiantes]", error);
    return NextResponse.json({ message: "Error al obtener el directorio" }, { status: 500 });
  }
}
