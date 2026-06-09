import { ExalumnoRegisterForm } from "@/components/forms/ExalumnoRegisterForm";

export default function RegistroExalumnoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0f4c81] sm:text-4xl">
          Registro de Exalumno
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Crea tu cuenta profesional para conectar con estudiantes y ofrecer oportunidades o mentoría.
        </p>
      </div>
      
      <ExalumnoRegisterForm />
      </div>
  );
}
