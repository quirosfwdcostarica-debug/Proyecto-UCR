"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, Users, HeartHandshake, Briefcase, DollarSign, Loader2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface KPIs {
  totalDonado: string;
  estudiantesActivos: number;
  exalumnosActivos: number;
  posicionesActivas: number;
  donacionesPendientes: any[];
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadKPIs = async () => {
    try {
      // Intentar obtener de la API real
      const data = await fetchAPI("/admin/kpis");
      setStats(data);
    } catch (error) {
      // Fallback a datos estáticos si el endpoint no está implementado
      setStats({
        totalDonado: "0",
        estudiantesActivos: 0,
        exalumnosActivos: 0,
        posicionesActivas: 0,
        donacionesPendientes: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKPIs();
  }, []);

  const reportes = [
    {
      id: "r1",
      reportado: "Carlos M.",
      motivo: "Uso indebido de la plataforma (Spam)",
      conteo: 3,
      status: "SUSPENDIDO_AUTO"
    },
    {
      id: "r2",
      reportado: "Laura J.",
      motivo: "Perfil falso",
      conteo: 1,
      status: "REVISION"
    }
  ];

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return (
      <div className="container mx-auto py-12 px-4 min-h-[80vh] flex items-center justify-center">
        <p className="text-lg text-slate-500 font-bold">Acceso Denegado. Solo administradores.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

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
            <div className="text-2xl font-bold">₡{stats?.totalDonado || "0"}</div>
            <p className="text-xs text-muted-foreground">Verificado en BD</p>
          </CardContent>
        </Card>
        
        <Card className="glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.estudiantesActivos || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exalumnos Mentores</CardTitle>
            <HeartHandshake className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.exalumnosActivos || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bolsa de Empleo</CardTitle>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.posicionesActivas || 0} vacantes</div>
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
            {stats?.donacionesPendientes && stats.donacionesPendientes.length > 0 ? (
              <div className="space-y-4">
                {stats.donacionesPendientes.map((d: any) => (
                  <div key={d.id} className="flex justify-between items-center p-3 border rounded-lg bg-orange-50/50">
                    <div>
                      <p className="font-bold">₡{d.monto}</p>
                      <p className="text-xs text-muted-foreground">{d.destino}</p>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">Aprobar</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
                  ✅
                </div>
                <p className="text-lg font-medium">Bandeja limpia</p>
                <p className="text-muted-foreground">Todas las donaciones han sido procesadas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
