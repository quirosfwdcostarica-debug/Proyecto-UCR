import { EstudianteRegisterForm } from "@/components/forms/EstudianteRegisterForm";

export default function RegistroEstudiantePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0f4c81] sm:text-4xl">
          Únete a la Red como Estudiante
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Crea tu cuenta institucional para recibir mentoría, pasantías y apoyo en tu proyecto de graduación.
        </p>
      </div>
      
      <EstudianteRegisterForm />
    </div>
  );
}
