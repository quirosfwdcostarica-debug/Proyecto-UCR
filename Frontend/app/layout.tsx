import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { SidebarWrapper } from "@/components/layout/SidebarWrapper"
import { AuthProvider } from "@/components/layout/AuthProvider"
import { ThemeProvider } from "@/components/providers/ThemeContext"
import { LanguageProvider } from "@/components/providers/LanguageContext"
import { NavigationLoadingProvider } from "@/components/providers/NavigationLoadingProvider"

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
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 transition-colors duration-300`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Suspense fallback={null}>
                <NavigationLoadingProvider>
                  <SidebarWrapper>
                    {children}
                  </SidebarWrapper>
                </NavigationLoadingProvider>
              </Suspense>
            </AuthProvider>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
