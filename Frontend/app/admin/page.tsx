import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, Users, HeartHandshake, Briefcase, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  // Datos mockeados del Dashboard
  const stats = {
    totalDonado: "2,450,000",
    estudiantesActivos: 1205,
    exalumnosActivos: 458,
    posicionesActivas: 34,
  };

  const reportes = [
    {
      id: "r1",
      reportado: "Carlos M.",
      motivo: "Uso indebido de la plataforma (Spam)",
      conteo: 3,
      status: "SUSPENDIDO_AUTO" // Si llega a 3, suspendido auto
    },
    {
      id: "r2",
      reportado: "Laura J.",
      motivo: "Perfil falso",
      conteo: 1,
      status: "REVISION"
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
          Panel de Administración (Secure)
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Métricas generales, moderación de perfiles y aprobación de transacciones.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="glass border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fondo Total Donado</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₡{stats.totalDonado}</div>
            <p className="text-xs text-muted-foreground">+12% este mes</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.estudiantesActivos}</div>
          </CardContent>
        </Card>

        <Card className="glass border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exalumnos Mentores</CardTitle>
            <HeartHandshake className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exalumnosActivos}</div>
          </CardContent>
        </Card>

        <Card className="glass border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bolsa de Empleo</CardTitle>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posicionesActivas} vacantes</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Moderación Anti-Fraude */}
        <Card className="glass border-red-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-red-500" />
              <CardTitle>Sistema Anti-Fraude</CardTitle>
            </div>
            <CardDescription>Usuarios reportados por la comunidad.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportes.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border bg-background/50">
                <div>
                  <p className="font-semibold">{r.reportado}</p>
                  <p className="text-sm text-muted-foreground">{r.motivo}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={r.conteo >= 3 ? "destructive" : "secondary"}>
                    {r.conteo} / 3 Reportes
                  </Badge>
                  {r.status === "SUSPENDIDO_AUTO" ? (
                    <span className="text-xs text-red-500 font-bold">Suspendido Auto</span>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Ignorar</Button>
                      <Button size="sm" variant="destructive">Banear</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SLA Donaciones */}
        <Card className="glass border-yellow-500/20">
          <CardHeader>
            <CardTitle>SLA Donaciones (48 hrs)</CardTitle>
            <CardDescription>Comprobantes pendientes de verificación.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
                ✅
              </div>
              <p className="text-lg font-medium">Bandeja limpia</p>
              <p className="text-muted-foreground">Todas las donaciones han sido procesadas.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
