"use server";

// Acciones para obtener datos del backend en lugar de usar datos quemados
// Usamos el API_URL del backend (ej. http://localhost:3001/api)

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function getJobPositions() {
  try {
    const res = await fetch(`${API_URL}/posiciones`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posiciones || data || [];
  } catch (error) {
    console.error("Error fetching posiciones:", error);
    return [];
  }
}

export async function getStudentProjects() {
  try {
    const res = await fetch(`${API_URL}/estudiantes`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const estudiantes = data.estudiantes || data || [];
    
    // Filtrar estudiantes que buscan financiamiento
    return estudiantes
      .filter((e: any) => e.busca_financiamiento && e.proyecto_titulo)
      .map((e: any) => ({
        id: e.user_id,
        nombre: e.proyecto_titulo,
        carrera: e.carrera || "Carrera no especificada",
        descripcion: e.proyecto_tipo || "Proyecto de estudiante",
        avance: e.promedio_ponderado ? Math.round(Number(e.promedio_ponderado) * 10) : 0, // Mock de avance basado en promedio si no hay
        estudianteNombre: e.User?.nombre || "Estudiante",
      }));
  } catch (error) {
    console.error("Error fetching student projects:", error);
    return [];
  }
}
