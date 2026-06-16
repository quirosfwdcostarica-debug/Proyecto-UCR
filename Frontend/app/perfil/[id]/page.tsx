import { auth } from "@/lib/auth";
import { ProfileDetailsClient } from "@/components/profile/ProfileDetailsClient";
import { notFound } from "next/navigation";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProfilePageProps) {
  try {
    const res = await fetch(`${API_URL}/exalumnos/${params.id}`, {
      cache: "no-store",
    });
    if (!res.ok) return { title: "Perfil | Exalumnos UCR" };
    const exalumno = await res.json();
    return {
      title: `${exalumno.User?.nombre || "Exalumno"} | Perfil Profesional`,
      description: exalumno.biografia || `Perfil profesional de exalumno de la UCR.`,
    };
  } catch (error) {
    return { title: "Perfil | Exalumnos UCR" };
  }
}

export default async function AlumniProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  const accessToken = (session as any)?.user?.accessToken;

  let exalumno = null;

  try {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}/exalumnos/${params.id}`, {
      headers,
      cache: "no-store",
    });

    if (res.status === 404) {
      notFound();
    }

    if (res.ok) {
      exalumno = await res.json();
    }
  } catch (error) {
    console.error("Error fetching exalumno profile:", error);
  }

  if (!exalumno) {
    notFound();
  }

  return (
    <ProfileDetailsClient 
      exalumno={exalumno} 
      currentUser={session?.user || null} 
      accessToken={accessToken}
      apiUrl={API_URL}
    />
  );
}
