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

    const success = await login(email, password)
    if (success) {
      router.push("/")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
        }}
      ></div>

      {/* Overlay para oscurecer la imagen */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-purple-900/30 to-blue-900/40"></div>

      {/* Elementos geométricos animados */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rotate-45 animate-pulse z-10"></div>
      <div className="absolute top-1/3 right-20 w-24 h-24 border border-white/10 rotate-12 animate-bounce z-10"></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white/10 rotate-45 animate-pulse delay-1000 z-10"></div>
      <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-white/5 rotate-45 animate-ping z-10"></div>
      <div className="absolute bottom-1/3 right-1/3 w-12 h-12 bg-white/5 rotate-45 animate-pulse delay-500 z-10"></div>

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
                <div className="space-y-4">
                  <p className="text-sm text-white/70">Conecta con redes sociales</p>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white animate-bounce-in"
                      style={{ animationDelay: "0.5s" }}
                    >
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-sky-500 hover:bg-sky-600 border-sky-500 text-white animate-bounce-in"
                      style={{ animationDelay: "0.7s" }}
                    >
                      <Twitter className="mr-2 h-4 w-4" />
                      Twitter
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario */}
          <div className="w-1/2 flex items-center justify-center p-12 bg-white">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-[#486b00] to-[#a2c523] flex items-center justify-center mb-6 animate-bounce-in">
                  <Building2 className="text-white h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
                <p className="text-gray-600">Accede a tu cuenta</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Usuario
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus:border-[#486b00] focus:ring-0 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.6s" }}>
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus:border-[#486b00] focus:ring-0 transition-colors"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-[#486b00] to-[#a2c523] hover:from-[#2e4600] hover:to-[#486b00] text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105 animate-slide-up"
                  style={{ animationDelay: "0.8s" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    "Enviar"
                  )}
                </Button>
                <div className="mt-6 flex flex-col items-center">
                <GoogleLoginButton
                  onSuccessRedirect={() => router.push("/")}
                  setLoading={setLoading}
                />
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
