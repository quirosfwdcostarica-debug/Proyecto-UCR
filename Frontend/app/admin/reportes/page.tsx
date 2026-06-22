"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, BarChart, Users, DollarSign, HeartHandshake, Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#0f4c81', '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function AdminReportesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") {
      if ((session?.user as any)?.tipo !== "ADMIN") router.replace("/");
      else loadStats();
    }
  }, [status, session]);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const d = await res.json();
      setData(d);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
    setLoading(false);
  }

  const handlePrint = () => {
    window.print();
  };

  if (status === "loading" || loading) {
    return <div className="flex h-screen items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-[#0f4c81]" /></div>;
  }

  if (!data) return <div className="p-8 text-center text-red-500">Error cargando dashboard</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="print:hidden">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81] mb-6">
            <ArrowLeft className="w-4 h-4" /> Volver al panel
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard de Impacto</h1>
              <p className="text-slate-500">Métricas y estadísticas globales de la plataforma.</p>
            </div>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#0f4c81] text-white rounded-lg hover:bg-[#0f4c81]/90 shadow-sm transition-colors font-medium text-sm">
              <Printer className="w-4 h-4" /> Exportar a PDF
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center border-b border-slate-200 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Reporte de Impacto - Fundación Exalumnos UCR</h1>
          <p className="text-slate-500">Generado el {new Date().toLocaleDateString()}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Donado</p>
              <p className="text-2xl font-bold text-slate-900">₡{(data.kpis?.totalDonado || 0).toLocaleString("es-CR")}</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-white shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Matches Activos</p>
              <p className="text-2xl font-bold text-slate-900">{data.kpis?.matchesActivos || 0}</p>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Estudiantes Activos</p>
              <p className="text-2xl font-bold text-slate-900">{data.kpis?.estudiantesActivos || 0}</p>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Exalumnos Activos</p>
              <p className="text-2xl font-bold text-slate-900">{data.kpis?.exalumnosActivos || 0}</p>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
          
          <Card className="p-6 bg-white shadow-sm border border-slate-200 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-[#0f4c81]" /> Evolución de Donaciones
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data.graficoDonaciones || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₡${value >= 1000 ? (value/1000) + 'k' : value}`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number) => [`₡${value.toLocaleString("es-CR")}`, 'Total']}
                  />
                  <Bar dataKey="total" fill="#0f4c81" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm border border-slate-200 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-[#0f4c81]" /> Distribución de Matches por Carrera
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.graficoMatchesCarrera || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(data.graficoMatchesCarrera || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm border border-slate-200 print:break-inside-avoid lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0f4c81]" /> Estudiantes por Sede UCR
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data.graficoSedes || []} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#334155', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
