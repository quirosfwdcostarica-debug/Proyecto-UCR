import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/TopBar";
import { NewJobModal } from "@/components/posiciones/NewJobModal";
import { MyJobsList } from "@/components/posiciones/MyJobsList";
import { AvailableJobsList } from "@/components/posiciones/AvailableJobsList";

export default async function PosicionesPage({ searchParams }: { searchParams: { role?: string } }) {
  const session = await auth();

  // NOTA: Se eliminó el redirect temporalmente porque aún no existe la página de login.
  // Para probar la vista de exalumno, puedes agregar "?role=EXALUMNO" a la URL.
  // Ejemplo: http://localhost:3000/posiciones?role=EXALUMNO

  let role = searchParams?.role?.toUpperCase() || "ESTUDIANTE";
  let userName = role === "EXALUMNO" ? "Exalumno" : "Estudiante";

  // Si hay sesión, obtener el rol del usuario desde la sesión
  if (session?.user) {
    role = (session.user as any).tipo || role;
    userName = session.user.name || userName;
  }

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Bolsa de Empleo" />
      
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* VISTA PARA EXALUMNOS */}
        {role === "EXALUMNO" && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl shadow-sm mb-2">
              💼
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Conecta con el Talento UCR
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Hola {userName}, publica oportunidades de empleo o pasantías para los estudiantes de la universidad. 
              Impulsa el crecimiento profesional de la próxima generación.
            </p>
            <div className="pt-4">
              <NewJobModal />
            </div>
            <MyJobsList />
          </div>
        )}

        {/* VISTA PARA ESTUDIANTES (Y OTROS ROLES) */}
        {role !== "EXALUMNO" && (
          <div className="animate-in fade-in">
            <AvailableJobsList />
          </div>
        )}
      </div>
    </div>
  );
}
