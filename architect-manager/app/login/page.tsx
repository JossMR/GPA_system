"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import GoogleLoginButton from "@/components/GoogleLogin"
import { Loader2, Facebook, Twitter, Building2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    /*
    const success = await login(email, password)
    if (success) {
      router.push("/")
    }
    */
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Imagen de fondo */}
      <div
        className="relative inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
        }}
      ></div>

      {/* Contenedor principal centrado */}
      <div className="relative z-20 w-full max-w-4xl mx-auto animate-scale-in">
        <div className="flex rounded-2xl overflow-hidden shadow-2xl bg-white min-h-[600px]">
          {/* Panel izquierdo */}
          <div className="w-1/2 relative bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800">
            {/* Imagen de fondo del panel izquierdo */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: "url('/placeholder.svg?height=600&width=600')",
              }}
            ></div>

            {/* Contenido del panel izquierdo */}
            <div className="relative z-10 flex flex-col justify-center h-full p-12 text-white">
              <div className="animate-slide-in-left">
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  Hello
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    World.
                  </span>
                </h1>
                <p className="text-base mb-8 text-white/90 leading-relaxed">
                  Bienvenido al sistema de gestión de proyectos arquitectónicos. Administra tus clientes, proyectos y
                  pagos de manera eficiente.
                </p>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="w-1/2 flex items-center justify-center p-12 bg-white">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-[#486b00] to-[#a2c523] flex items-center justify-center mb-6 animate-bounce-in">
                  <Building2 className="text-white h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
                <p className="text-gray-600">Accede a tu cuenta</p>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <GoogleLoginButton
                  onSuccessRedirect={() => router.push("/")}
                  setLoading={setLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
