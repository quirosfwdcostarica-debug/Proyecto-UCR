import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// Vista mockeada de los Matches. 
// En producción se hidratará llamando a getMatchesForEstudiante(session.user.id)
export default function MisMatchesPage() {
  const matchesMock = [
    {
      id: "m1",
      afinidad: 95,
      status: "SUGERIDO",
      exalumno: {
        user: { name: "Sofía Cerdas" },
        carrera: "Ingeniería Industrial",
        sector: "Sector Privado",
        apoyoOfrecido: ["Mentoría Profesional", "Revisión de CV"]
      }
    },
    {
      id: "m2",
      afinidad: 82,
      status: "CONTACTADO",
      exalumno: {
        user: { name: "David Rojas" },
        carrera: "Administración de Negocios",
        sector: "Emprendimiento / Startup",
        apoyoOfrecido: ["Oportunidad Laboral", "Networking"]
      }
    },
    {
      id: "m3",
      afinidad: 100,
      status: "ACTIVO",
      exalumno: {
        user: { name: "Laura Montero" },
        carrera: "Ingeniería en Computación",
        sector: "Sector Privado",
        apoyoOfrecido: ["Apoyo para Proyecto de Graduación", "Mentoría Profesional"]
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "SUGERIDO": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
      case "CONTACTADO": return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "ACTIVO": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
          Mis Matches
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Exalumnos sugeridos por la Inteligencia de la Plataforma basados en tu perfil y necesidades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matchesMock.map(match => (
          <Card key={match.id} className="relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 glass border-primary/10">
            {/* Score Badge */}
            <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-lg shadow-lg">
              {match.afinidad}
            </div>

            <CardHeader className="pr-16">
              <CardTitle className="text-xl">{match.exalumno.user.name}</CardTitle>
              <CardDescription className="text-sm">
                {match.exalumno.carrera} • {match.exalumno.sector}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant="outline" className={`px-3 py-1 ${getStatusColor(match.status)}`}>
                  Estado: {match.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Ofrece:</p>
                <div className="flex flex-wrap gap-2">
                  {match.exalumno.apoyoOfrecido.map(apoyo => (
                    <Badge key={apoyo} variant="secondary" className="bg-muted">
                      {apoyo}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-4 border-t border-border/50">
              {match.status === "SUGERIDO" && (
                <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-md transition-all">
                  Contactar
                </Button>
              )}
              {match.status === "CONTACTADO" && (
                <Button disabled variant="outline" className="w-full">
                  Esperando Respuesta...
                </Button>
              )}
              {match.status === "ACTIVO" && (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Ver Conversación
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
