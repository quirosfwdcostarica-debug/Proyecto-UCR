import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
<<<<<<< HEAD
import { AppSidebar } from "@/components/layout/AppSidebar"
import { SidebarWrapper } from "@/components/layout/SidebarWrapper"
import { AuthProvider } from "@/components/layout/AuthProvider"
=======
import { SidebarWrapper } from "@/components/layout/SidebarWrapper"
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b

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
<<<<<<< HEAD
        <AuthProvider>
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </AuthProvider>
=======
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
>>>>>>> 9219c068a57a9100e7b6440df479107ea21a9f7b
        <Toaster />
      </body>
    </html>
  )
}
