"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, User, Settings, LogOut, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "./auth-provider"
import { ThemeToggle } from "./theme-toggle"

const notifications = [
  { id: 1, message: "Pago pendiente - Proyecto Villa Moderna", type: "warning" },
  { id: 2, message: "Documentos faltantes - Casa Familiar", type: "error" },
  { id: 3, message: "Reunión programada mañana", type: "info" },
]

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, isAdmin, logout, toggleAdminMode } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Clientes", href: "/clientes" },
    { name: "Proyectos", href: "/proyectos" },
    { name: "Pagos", href: "/pagos" },
    { name: "Promoción", href: "/promocion" },
    { name: "Reportes", href: "/reportes" },
    ...(isAdmin ? [{ name: "Usuarios", href: "/usuarios" }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#a2c523]/20 gradient-primary shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white font-bold text-sm">GA</span>
            </div>
            <span className="font-bold text-lg text-white">Gestor Arquitectónico</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-white/80 ${
                  pathname === item.href ? "text-white border-b-2 border-white/50 pb-1" : "text-white/70"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/20 text-white">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-[#7d4427] hover:bg-[#7d4427]">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 animate-slide-up">
              <div className="space-y-2">
                <h4 className="font-medium">Notificaciones</h4>
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-2 rounded-lg bg-[#c9e077]/10 text-sm border border-[#c9e077]/20"
                  >
                    {notification.message}
                  </div>
                ))}
                <Link href="/notificaciones" className="text-sm text-[#486b00] hover:underline font-medium">
                  Ver todas las notificaciones
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-white/30">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback className="bg-white/20 text-white">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 animate-scale-in" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                  {isAdmin && (
                    <Badge variant="secondary" className="w-fit bg-[#7d4427] text-white">
                      Modo Admin
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Ver perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleAdminMode}>
                <Shield className="mr-2 h-4 w-4" />
                {isAdmin ? "Desactivar" : "Activar"} modo admin
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
