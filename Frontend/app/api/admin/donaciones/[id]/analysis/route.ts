import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDonationAnalysis } from "@/lib/ai/saveDonationAnalysis";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const analysis = await getDonationAnalysis(params.id);
    
    if (!analysis) {
      return NextResponse.json({ message: "Análisis no encontrado" }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[GET /api/admin/donaciones/[id]/analysis]", error);
    return NextResponse.json({ message: "Error al obtener el análisis de IA" }, { status: 500 });
  }
}
