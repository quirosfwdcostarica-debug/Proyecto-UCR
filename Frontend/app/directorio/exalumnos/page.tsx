import { AlumniDirectoryClient } from "@/components/directory/AlumniDirectoryClient";

export const metadata = {
  title: "Directorio de Exalumnos | Alumni UCR",
  description: "Conecta con la comunidad global de exalumnos graduados de la Universidad de Costa Rica.",
};

export default function DirectorioExalumnosPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      <AlumniDirectoryClient />
    </div>
  );
}
