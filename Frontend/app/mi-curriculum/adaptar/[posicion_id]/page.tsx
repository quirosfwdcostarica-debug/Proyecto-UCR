import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

interface Props {
  params: { posicion_id: string };
}

export default async function AdaptarCVPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href={`/posiciones/${params.posicion_id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a la posición
        </Link>

        <div className="mb-8">
          <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-1">IA de Adaptación</p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Adaptar CV a esta Posición</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            La IA analizará tus datos y la posición para sugerir mejoras específicas a tu CV.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-sky-50 dark:bg-sky-900/20 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-sky-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            En desarrollo — Bloque 10
          </h2>
          <p className="text-slate-400 font-mono text-xs mb-4">Posición: {params.posicion_id}</p>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm">
            Aquí se mostrará tu CV original y las sugerencias de IA lado a lado. Podrás aceptar, editar o descartar cada sugerencia antes de guardar el CV adaptado.
          </p>
        </div>
      </div>
    </div>
  );
}
