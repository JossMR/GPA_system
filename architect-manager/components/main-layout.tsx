"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { Header } from "./header"
import { Footer } from "./footer"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 animate-fade-in">{children}</main>
      <Footer />
    </div>
  )
}
