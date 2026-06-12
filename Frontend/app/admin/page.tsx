"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldAlert,
  Users,
  HeartHandshake,
  Briefcase,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
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
      status: "SUSPENDIDO_AUTO",
    },
    {
      id: "r2",
      reportado: "Laura J.",
      motivo: "Perfil falso",
      conteo: 1,
      status: "REVISION",
    },
    {
      id: "r3",
      reportado: "Juan P.",
      motivo: "Contenido inapropiado",
      conteo: 2,
      status: "REVISION",
    },
  ];

  const donacionesPendientes = [
    { id: "d1", donante: "Ana Rodríguez", monto: "₡75,000", fecha: "Hace 2 horas", tipo: "Beca" },
    { id: "d2", donante: "Marco Soto", monto: "₡150,000", fecha: "Hace 5 horas", tipo: "Proyecto" },
    { id: "d3", donante: "Patricia V.", monto: "₡50,000", fecha: "Hace 1 día", tipo: "General" },
  ];

  const kpiCards = [
    {
      title: "Fondo Total Donado",
      value: `₡${stats.totalDonado}`,
      change: "+12% este mes",
      positive: true,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      title: "Estudiantes Activos",
      value: stats.estudiantesActivos.toString(),
      change: "+48 esta semana",
      positive: true,
      icon: Users,
      color: "text-[#0f4c81]",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      title: "Exalumnos Mentores",
      value: stats.exalumnosActivos.toString(),
      change: "+5 este mes",
      positive: true,
      icon: HeartHandshake,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
    },
    {
      title: "Vacantes Activas",
      value: `${stats.posicionesActivas}`,
      change: "8 nuevas esta semana",
      positive: true,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Panel de Administración" />

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Header Banner */}
        <div className="bg-[#0f4c81] rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-1">
              Acceso Restringido
            </p>
            <h1 className="text-2xl font-bold text-white">
              Panel de Administración
            </h1>
            <p className="text-blue-200 mt-1 text-sm">
              Métricas generales, moderación y aprobación de transacciones — Fundación Exalumnos UCR
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg px-5 py-3">
            <ShieldAlert className="h-8 w-8 text-ucr-celeste" />
            <div>
              <p className="text-white font-bold text-lg">Admin</p>
              <p className="text-blue-200 text-xs">admin@ucr.edu</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, i) => (
            <Card key={i} className={`border ${kpi.border} shadow-sm bg-white`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{kpi.title}</CardTitle>
                <div className={`h-9 w-9 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.positive ? "text-green-600" : "text-red-500"}`}>
                  <TrendingUp className="h-3 w-3" />
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Anti-Fraud Moderation */}
          <Card className="border-border shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-base text-slate-800">Sistema Anti-Fraude</CardTitle>
                  <CardDescription>Usuarios reportados por la comunidad.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportes.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mt-0.5">
                      {r.reportado[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{r.reportado}</p>
                      <p className="text-xs text-slate-500 max-w-[180px]">{r.motivo}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={r.conteo >= 3 ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {r.conteo}/3 reportes
                    </Badge>
                    {r.status === "SUSPENDIDO_AUTO" ? (
                      <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Suspendido
                      </span>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                          Ignorar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs px-2"
                        >
                          Banear
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Donation Verification SLA */}
          <Card className="border-border shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-base text-slate-800">Verificación de Donaciones</CardTitle>
                  <CardDescription>Comprobantes pendientes — SLA 48 hrs.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {donacionesPendientes.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#0f4c81] flex items-center justify-center text-white text-xs font-bold">
                      {d.donante[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{d.donante}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {d.fecha}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-base font-bold text-[#0f4c81]">{d.monto}</span>
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 text-xs">
                      {d.tipo}
                    </Badge>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Aprobar
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card className="border-border shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-[#0f4c81]" />
                </div>
                <div>
                  <CardTitle className="text-base text-slate-800">Directorio de Usuarios</CardTitle>
                  <CardDescription>Administración de cuentas activas en la plataforma.</CardDescription>
                </div>
              </div>
              <Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white text-sm">
                Exportar Reporte
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Carrera</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Gabriel Quirós", email: "gabriel@ucr.ac.cr", rol: "Estudiante", carrera: "Ingeniería en Computación", estado: "Activo" },
                  { name: "María Valverde", email: "mvalverde@ucr.ac.cr", rol: "Exalumno", carrera: "Ingeniería Eléctrica", estado: "Activo" },
                  { name: "Roberto Solís", email: "rsolis@ucr.ac.cr", rol: "Exalumno", carrera: "Bioquímica", estado: "Activo" },
                  { name: "Carlos M.", email: "cm@ucr.ac.cr", rol: "Estudiante", carrera: "Administración", estado: "Suspendido" },
                ].map((user, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#0f4c81] flex items-center justify-center text-white text-xs font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          user.rol === "Exalumno"
                            ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-0"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-50 border-0"
                        }
                      >
                        {user.rol}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{user.carrera}</td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          user.estado === "Activo"
                            ? "bg-green-50 text-green-700 hover:bg-green-50 border-0"
                            : "bg-red-50 text-red-700 hover:bg-red-50 border-0"
                        }
                      >
                        {user.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                          Ver perfil
                        </Button>
                        {user.estado === "Activo" ? (
                          <Button size="sm" variant="destructive" className="h-7 text-xs px-3">
                            Suspender
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 text-xs px-3 bg-green-600 hover:bg-green-700 text-white"
                          >
                            Reactivar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
