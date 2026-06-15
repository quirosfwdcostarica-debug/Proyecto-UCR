import { TopBar } from "@/components/layout/TopBar";
import { AlumniDirectoryClient } from "@/components/directory/AlumniDirectoryClient";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const metadata = {
  title: "Directorio de Exalumnos | Alumni UCR",
  description: "Conecta con la comunidad global de exalumnos graduados de la Universidad de Costa Rica.",
};
export const dynamic = 'force-dynamic';

export default async function DirectorioExalumnosPage() {
  let initialAlumni: any[] = [];
  
  try {
    const res = await fetch(`${API_URL}/exalumnos`, {
      cache: "no-store",
    });
    
    if (res.ok) {
      initialAlumni = await res.json();
    }
  } catch (error) {
    console.error("Error fetching exalumnos from backend:", error);
  }

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      <TopBar title="Directory" />
      <AlumniDirectoryClient initialAlumni={initialAlumni} />
    </div>
  );
}
