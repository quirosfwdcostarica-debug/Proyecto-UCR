import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/TopBar";
import { StudentApplicationModal } from "@/components/donaciones/StudentApplicationModal";
import { StudentProjectsList } from "@/components/donaciones/StudentProjectsList";
import { MyApplicationsList } from "@/components/donaciones/MyApplicationsList";

export default async function DonacionesPage({ searchParams }: { searchParams: { role?: string } }) {
  const session = await auth();

  // NOTA: Se eliminó el redirect temporalmente porque aún no existe la página de login.
  // Para probar la vista de exalumno, puedes agregar "?role=EXALUMNO" a la URL.
  // Ejemplo: http://localhost:3000/donaciones?role=EXALUMNO

  let role = searchParams?.role?.toUpperCase() || "ESTUDIANTE";
  let userName = "Estudiante";

  // Si hay sesión, obtener el rol del usuario desde la sesión
  if (session?.user) {
    role = (session.user as any).tipo || role;
    userName = session.user.name || userName;
  }

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Donaciones y Apoyo" />
      
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* VISTA PARA ESTUDIANTES */}
        {role === "ESTUDIANTE" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl shadow-sm mb-2">
              🎓
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Impulsa tu Proyecto de Graduación
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Hola {userName}, los exalumnos están dispuestos a apoyar el talento de la UCR. 
              Postula tu proyecto para recibir apoyo financiero y haz realidad tus metas académicas.
            </p>
            <div className="pt-4">
              <StudentApplicationModal />
            </div>
            <MyApplicationsList />
          </div>
        )}

        {/* VISTA PARA EXALUMNOS (Y OTROS ROLES COMO ADMIN) */}
        {role !== "ESTUDIANTE" && (
          <div className="animate-in fade-in">
            <StudentProjectsList />
          </div>
        )}
      </div>
    </div>
  );
}
