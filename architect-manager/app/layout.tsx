import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { NotificationsProvider } from "@/components/notifications-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestor de Proyectos Arquitectónicos",
  description: "Sistema de gestión para arquitectos"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <NotificationsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange={false}
              storageKey="architect-theme"
            >
              {children}
            </ThemeProvider>
          </NotificationsProvider>
        </AuthProvider>
        <Toaster/>
      </body>
    </html>
  )
}
