"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Shield, Menu, X, Home, Bell } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "./auth-provider"
import { useNotifications } from "./notifications-provider"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user, isAdmin, logout, toggleAdminMode } = useAuth()
  const { unreadCount } = useNotifications()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Clientes", href: "/clientes", icon: User },
    { name: "Proyectos", href: "/proyectos", icon: Settings },
    { name: "Pagos", href: "/pagos", icon: Settings },
    { name: "Promoción", href: "/promocion", icon: Settings },
    { name: "Reportes", href: "/reportes", icon: Settings },
    ...(isAdmin ? [{ name: "Usuarios", href: "/usuarios", icon: Shield }] : [])
    ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-lg">GA</span>
              </div>
              <div className="absolute inset-0 rounded-xl gradient-primary opacity-0 group-hover:opacity-20 animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl bg-gradient-to-r from-primary-dark to-primary-medium bg-clip-text text-transparent">
                Gestor Arquitectónico
              </span>
              <div className="text-xs text-muted-foreground">Proyectos Profesionales</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                pathname === item.href 
                  ? "active bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <Link href="/notificaciones" className="relative">
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors duration-300">
              <Bell className="h-5 w-5" />
            </Button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-white text-xs font-semibold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors duration-300">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={user?.picture || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-light to-primary-medium text-white font-semibold">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-color rounded-full border-2 border-background flex items-center justify-center">
                    <Shield className="h-2 w-2 text-white" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 animate-scale-in" align="end">
              <div className="p-4 bg-gradient-to-r from-primary-lighter/20 to-primary-light/20">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.picture || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary-light to-primary-medium text-white font-semibold text-lg">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    {isAdmin && (
                      <Badge className="gradient-accent text-white text-xs">
                        Administrador
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-primary/5 transition-colors duration-200">
                <User className="mr-3 h-4 w-4" />
                Ver perfil
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-primary/5 transition-colors duration-200"
                onClick={toggleAdminMode}
              >
                <Shield className="mr-3 h-4 w-4" />
                {isAdmin ? "Desactivar" : "Activar"} modo admin
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-primary/5 transition-colors duration-200">
                <Settings className="mr-3 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                onClick={logout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-primary/10 transition-colors duration-300"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Menú</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <nav className="flex-1 p-6">
                  <div className="space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
