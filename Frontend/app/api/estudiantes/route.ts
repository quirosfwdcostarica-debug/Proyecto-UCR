import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

export async function GET(request: NextRequest) {
<<<<<<< HEAD
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

=======
>>>>>>> 90eec3fe0d45ab796ae19a62cf4a9674f0db6290
  const { searchParams } = new URL(request.url);
  const carrera = searchParams.get("carrera");
  const apoyo = searchParams.get("apoyoBuscado");
  const nombre = searchParams.get("nombre");

  try {
<<<<<<< HEAD
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
=======
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        ...(carrera && {
          carrera: { contains: carrera, mode: "insensitive" },
        }),
        ...(apoyo === "mentoria" && { busca_mentoria: true }),
        ...(apoyo === "empleo" && { busca_empleo: true }),
        ...(apoyo === "pasantia" && { busca_pasantia: true }),
        ...(apoyo === "financiamiento" && { busca_financiamiento: true }),
        user: {
          activo: true,
          status: { not: "SUSPENDIDO" },
          ...(nombre && {
            nombre: { contains: nombre, mode: "insensitive" },
          }),
        },
      },
      select: {
        user_id: true,
        carrera: true,
        escuela_facultad: true,
        sede: true,
        nivel_academico: true,
        proyecto_titulo: true,
        proyecto_tipo: true,
        busca_financiamiento: true,
        busca_mentoria: true,
        busca_empleo: true,
        busca_pasantia: true,
        user: {
          select: {
            id: true,
            nombre: true,
            foto_url: true,
          },
        },
      },
      orderBy: { user: { created_at: "desc" } },
    });

    // Normalize shape for frontend compatibility
    const sanitized = estudiantes.map((est) => ({
      ...est,
      id: est.user_id,
      user: {
        id: est.user.id,
        name: est.user.nombre,
        image: est.user.foto_url,
      },
    }));
>>>>>>> 90eec3fe0d45ab796ae19a62cf4a9674f0db6290

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
  } catch (error) {
    console.error("[GET /api/estudiantes]", error);
    return NextResponse.json(
      { message: "Error al obtener el directorio de estudiantes" },
      { status: 500 }
    );
  }
}
