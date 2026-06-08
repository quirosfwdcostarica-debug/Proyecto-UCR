import { ExalumnoProfileForm } from "@/components/forms/ExalumnoProfileForm";

export default function RegistroExalumnoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 sm:text-4xl">
          Devuelve a la Comunidad UCR
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Comparte tu experiencia con futuros profesionales. Ofrece mentorías, pasantías y forma parte de la red oficial de exalumnos.
        </p>
      </div>
      
      <ExalumnoProfileForm />
    </div>
  );
}
