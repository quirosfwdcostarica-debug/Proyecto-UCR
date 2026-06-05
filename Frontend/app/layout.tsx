import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AppSidebar } from "@/components/layout/AppSidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fundación Exalumnos UCR",
  description: "Plataforma de mentoría, donaciones y empleo para la comunidad de egresados de la Universidad de Costa Rica.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/30`}>
        {/* Aquí podemos inyectar un Navbar en un layout superior o directamente aquí */}
        <div className="relative flex min-h-screen flex-col bg-[#f8fafc]">
          <AppSidebar />
          <main className="flex-1 ml-64 flex flex-col">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
