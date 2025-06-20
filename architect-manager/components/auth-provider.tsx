"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "user"
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  toggleAdminMode: () => void
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulación de login
    if (email && password) {
      const mockUser: User = {
        id: "1",
        name: "Juan Arquitecto",
        email: email,
        avatar: "/placeholder.svg?height=40&width=40",
        role: "user",
      }
      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAdmin(false)
    localStorage.removeItem("user")
    localStorage.removeItem("adminMode")
  }

  const toggleAdminMode = () => {
    const newAdminMode = !isAdmin
    setIsAdmin(newAdminMode)
    localStorage.setItem("adminMode", JSON.stringify(newAdminMode))
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, toggleAdminMode }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
