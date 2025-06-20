"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User, Building, Mail, Phone, MapPin } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

// Mock data del cliente existente
const mockCliente = {
  id: 1,
  nombre: "María González",
  email: "maria@email.com",
  telefono: "+1234567890",
  empresa: "Constructora ABC",
  direccion: "Av. Principal 123, Ciudad",
  estado: "activo",
  notas: "Cliente preferencial con múltiples proyectos. Muy puntual en pagos.",
}

export default function EditarClientePage({ params }: { params: { id: string } }) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!isAdmin) {
    router.push("/clientes")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    router.push(`/clientes/${params.id}`)
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-[#c9e077]/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              Editar Cliente: {mockCliente.nombre}
            </h1>
            <p className="text-muted-foreground">Modifica la información del cliente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            <Card className="card-hover border-[#a2c523]/20 animate-slide-up">
              <CardHeader className="gradient-light text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription className="text-white/80">Datos básicos del cliente</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-[#2e4600] font-medium">
                        Nombre completo *
                      </Label>
                      <Input
                        id="nombre"
                        defaultValue={mockCliente.nombre}
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#2e4600] font-medium">
                        Correo electrónico *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                        <Input
                          id="email"
                          type="email"
                          defaultValue={mockCliente.email}
                          className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-[#2e4600] font-medium">
                        Teléfono *
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                        <Input
                          id="telefono"
                          defaultValue={mockCliente.telefono}
                          className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa" className="text-[#2e4600] font-medium">
                        Empresa
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                        <Input
                          id="empresa"
                          defaultValue={mockCliente.empresa}
                          className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-[#2e4600] font-medium">
                      Dirección
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                      <Input
                        id="direccion"
                        defaultValue={mockCliente.direccion}
                        className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-[#2e4600] font-medium">
                      Estado del cliente
                    </Label>
                    <Select defaultValue={mockCliente.estado}>
                      <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notas" className="text-[#2e4600] font-medium">
                      Notas adicionales
                    </Label>
                    <Textarea
                      id="notas"
                      defaultValue={mockCliente.notas}
                      className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="gradient-primary text-white hover:opacity-90">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <Card className="border-[#7d4427]/20 animate-slide-in-right">
              <CardHeader className="gradient-accent text-white rounded-t-lg">
                <CardTitle>Historial del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    Cliente registrado desde enero 2024
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>3 proyectos
                    completados exitosamente
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    Historial de pagos puntual
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    Cliente preferencial
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#c9e077]/30 animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="text-[#2e4600]">Consejos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    Mantén actualizada la información de contacto
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    Las notas ayudan en futuros proyectos
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    Revisa el estado según la actividad
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
