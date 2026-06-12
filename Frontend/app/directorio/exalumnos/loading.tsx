import { BookLoader } from "@/components/ui/BookLoader";

export default function LoadingExalumnos() {
  return (
    <div className="min-h-full bg-[#f8fafc] flex flex-col">
      <div className="h-16 border-b border-border bg-white flex items-center px-8">
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <BookLoader message="Cargando directorio de exalumnos" />
      </div>
    </div>
  );
}
