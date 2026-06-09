import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SidebarWrapper } from "@/components/layout/SidebarWrapper"

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
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
        <Toaster />
      </body>
    </html>
  )
}
