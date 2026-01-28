"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: number
  active: boolean
  name: string
  flastname: string
  slastname: string
  picture: string
  roleid: number
  email: string
  permissions: { screen: string; permission_type: string }[]
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  login: (user: User) => Promise<boolean>
  logout: () => void
  toggleAdminMode: () => void
  hasScreenPermission: (item: { name: string; href: string; icon: any }) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Simular persistencia de sesión
    const savedUser = localStorage.getItem("user")
    const savedAdminMode = localStorage.getItem("adminMode")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedAdminMode) {
      setIsAdmin(JSON.parse(savedAdminMode))
    }
  }, [])

  const login = async (user: User): Promise<boolean> => {
    // Simulación de login
    if (user) {
      setUser(user)
      setIsAdmin(user.roleid === 1)
      return true
    }
    return false
  }

  const logout = async () => {
    setUser(null)
    setIsAdmin(false)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })
      if (!response.ok) {

      }
    } catch {

    }
  }

  const toggleAdminMode = () => {
    const newAdminMode = !isAdmin
    setIsAdmin(newAdminMode)
    localStorage.setItem("adminMode", JSON.stringify(newAdminMode))
  }

  function hasScreenPermission(item: { name: string; href: string; icon: any }): boolean {
    if(user?.roleid === 1) {
      return true;
    }

    switch (item.name) {
      case "Clientes":
        return user?.permissions.some(p => p.screen === "clientes" && (p.permission_type === "View" || p.permission_type === "Edit" || p.permission_type === "Create" || p.permission_type === "All")) || isAdmin;
      case "Proyectos":
        return user?.permissions.some(p => p.screen === "proyectos" && (p.permission_type === "View" || p.permission_type === "Edit" || p.permission_type === "Create" || p.permission_type === "All")) || isAdmin;
      case "Pagos":
        return user?.permissions.some(p => p.screen === "pagos" && (p.permission_type === "View" || p.permission_type === "Edit" || p.permission_type === "Create" || p.permission_type === "All")) || isAdmin;
      case "Reportes":
        return user?.permissions.some(p => p.screen === "reportes" && (p.permission_type === "View" || p.permission_type === "Edit" || p.permission_type === "Create" || p.permission_type === "All")) || isAdmin;
      default:
        return true;
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, toggleAdminMode, hasScreenPermission }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
