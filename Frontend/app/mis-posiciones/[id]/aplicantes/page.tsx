import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Mail, CheckCircle2, XCircle, FileText } from "lucide-react";

export default function AplicantesPage({ params }: { params: { id: string } }) {
  // Mock Data: Obtener esto vía Prisma desde el Server Component
  const posicion = {
    titulo: "Desarrollador Frontend Junior",
    tipo: "EMPLEO",
    estado: "ACTIVA"
  };

  const aplicantes = [
    {
      id: "a1",
      estudiante: { name: "Luis Jiménez", carrera: "Ingeniería en Computación" },
      estado: "PENDIENTE",
      matchScore: 92,
      fechaAplicacion: "2026-06-04"
    },
    {
      id: "a2",
      estudiante: { name: "Valeria Guzmán", carrera: "Diseño Gráfico" },
      estado: "SELECCIONADO",
      matchScore: 60,
      fechaAplicacion: "2026-06-02"
    },
    {
      id: "a3",
      estudiante: { name: "Carlos Mata", carrera: "Ingeniería de Software" },
      estado: "DESCARTADO",
      matchScore: 85,
      fechaAplicacion: "2026-06-05"
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">
            Candidatos: {posicion.titulo}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{posicion.tipo}</Badge>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
              {posicion.estado}
            </Badge>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Mail className="w-4 h-4" />
          Contactar Seleccionados
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aplicantes.map(aplicante => (
          <Card key={aplicante.id} className="glass flex flex-col border-primary/10 transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{aplicante.estudiante.name}</CardTitle>
                  <CardDescription>{aplicante.estudiante.carrera}</CardDescription>
                </div>
                {/* Affinity Badge */}
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                  {aplicante.matchScore}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fecha:</span>
                <span>{aplicante.fechaAplicacion}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estado:</span>
                <Badge variant={
                  aplicante.estado === 'SELECCIONADO' ? 'default' : 
                  aplicante.estado === 'DESCARTADO' ? 'destructive' : 'secondary'
                }>
                  {aplicante.estado}
                </Badge>
              </div>
              
              <Button variant="outline" className="w-full gap-2 mt-4">
                <FileText className="w-4 h-4" /> Ver CV Adaptado
              </Button>
            </CardContent>
            
            <CardFooter className="bg-muted/20 border-t p-4 flex gap-2">
              {aplicante.estado === "PENDIENTE" && (
                <>
                  {/* Acciones del ATS */}
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Seleccionar
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-2">
                    <XCircle className="w-4 h-4" /> Descartar
                  </Button>
                </>
              )}
              {aplicante.estado === "SELECCIONADO" && (
                <p className="text-sm text-green-600 w-full text-center font-medium">✓ En proceso de contacto</p>
              )}
              {aplicante.estado === "DESCARTADO" && (
                <p className="text-sm text-muted-foreground w-full text-center">Correo de feedback anónimo enviado.</p>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
