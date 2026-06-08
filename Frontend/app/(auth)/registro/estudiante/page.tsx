import { EstudianteProfileForm } from "@/components/forms/EstudianteProfileForm";

export default function RegistroEstudiantePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 sm:text-4xl">
          Únete a la Red como Estudiante
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Conecta con profesionales de tu carrera para recibir mentoría, pasantías y apoyo en tu proyecto de graduación.
        </p>
      </div>
      
      <EstudianteProfileForm />
    </div>
  );
}
