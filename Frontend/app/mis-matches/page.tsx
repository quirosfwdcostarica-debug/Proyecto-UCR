"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { fetchAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Match {
  id: string;
  afinidad: number;
  estado: string; // "SUGERIDO", "CONTACTADO", "ACTIVO", "RECHAZADO"
  exalumno: {
    user_id: string;
    carrera: string;
    sector: string;
    apoyo_ofrecido: string[];
    User: {
      nombre: string;
    };
  };
}

export default function MisMatchesPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadMatches = async () => {
    try {
      // Por defecto el backend debería filtrar por el userId de la sesión.
      const data = await fetchAPI("/matches");
      setMatches(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar matches",
        description: error.message || "No se pudo conectar con el servidor",
        variant: "destructive"
      });
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadMatches();
    } else if (session === null) {
      setLoading(false);
    }
  }, [session]);

  const handleContactar = async (matchId: string) => {
    try {
      await fetchAPI(`/matches/${matchId}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'CONTACTADO' })
      });
      toast({ title: "Contacto iniciado", description: "Se ha notificado al exalumno." });
      loadMatches();
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case "SUGERIDO": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
      case "CONTACTADO": return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "ACTIVO": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (!session?.user) {
    return (
      <div className="container mx-auto py-12 px-4 min-h-[80vh] flex items-center justify-center">
        <p className="text-lg text-slate-500">Debes iniciar sesión para ver tus matches.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0f4c81]">
          Mis Matches
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Exalumnos sugeridos por la Inteligencia de la Plataforma basados en tu perfil y necesidades.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-[#0f4c81]" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Aún no tienes matches sugeridos. Asegúrate de completar tu perfil.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <Card key={match.id} className="relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 glass border-primary/10 bg-white">
              {/* Score Badge */}
              <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#0f4c81] to-blue-500 text-white font-bold text-lg shadow-lg">
                {match.afinidad || 0}%
              </div>

              <CardHeader className="pr-16">
                <CardTitle className="text-xl text-slate-800">{match.exalumno?.User?.nombre || "Usuario"}</CardTitle>
                <CardDescription className="text-sm">
                  {match.exalumno?.carrera} • {match.exalumno?.sector}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(match.estado)}`}>
                    Estado: {match.estado || 'SUGERIDO'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 text-slate-700">Ofrece:</p>
                  <div className="flex flex-wrap gap-2">
                    {match.exalumno?.apoyo_ofrecido && match.exalumno.apoyo_ofrecido.length > 0 ? (
                      match.exalumno.apoyo_ofrecido.map(apoyo => (
                        <Badge key={apoyo} variant="secondary" className="bg-slate-100 text-slate-700">
                          {apoyo}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Sin datos</span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 pt-4 border-t border-border/50">
                {(match.estado === "SUGERIDO" || !match.estado) && (
                  <Button onClick={() => handleContactar(match.id)} className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white shadow-md transition-all">
                    Contactar
                  </Button>
                )}
                {match.estado === "CONTACTADO" && (
                  <Button disabled variant="outline" className="w-full border-slate-300">
                    Esperando Respuesta...
                  </Button>
                )}
                {match.estado === "ACTIVO" && (
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Ver Conversación
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
