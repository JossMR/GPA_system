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
import { DocumentManager } from "@/components/document-manager"
import { ArrowLeft, Save, Building, Calendar, DollarSign, MapPin, FileText } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const mockClientes = [
  { id: 1, nombre: "María González" },
  { id: 2, nombre: "Carlos Rodríguez" },
  { id: 3, nombre: "Ana Martínez" },
]

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  category: "plano" | "permiso" | "contrato" | "foto" | "otro"
  url?: string
}

export default function NuevoProyectoPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])

  if (!isAdmin) {
    router.push("/proyectos")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Documentos adjuntos:", documents)
    setLoading(false)
    router.push("/proyectos")
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
              Nuevo Proyecto
            </h1>
            <p className="text-muted-foreground">Crea un nuevo proyecto arquitectónico</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <Card className="card-hover border-[#a2c523]/20">
              <CardHeader className="gradient-primary text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Información del Proyecto
                </CardTitle>
                <CardDescription className="text-white/80">Datos básicos del proyecto arquitectónico</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-[#2e4600] font-medium">
                        Nombre del proyecto *
                      </Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Villa Moderna"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cliente" className="text-[#2e4600] font-medium">
                        Cliente *
                      </Label>
                      <Select required>
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockClientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id.toString()}>
                              {cliente.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoria" className="text-[#2e4600] font-medium">
                        Categoría *
                      </Label>
                      <Select required>
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue placeholder="Tipo de proyecto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residencial">Residencial</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                          <SelectItem value="sustentable">Sustentable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-[#2e4600] font-medium">
                        Estado inicial
                      </Label>
                      <Select defaultValue="planificacion">
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planificacion">Planificación</SelectItem>
                          <SelectItem value="en_progreso">En Progreso</SelectItem>
                          <SelectItem value="pausado">Pausado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ubicacion" className="text-[#2e4600] font-medium">
                      Ubicación del proyecto
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                      <Input
                        id="ubicacion"
                        placeholder="Dirección completa del proyecto"
                        className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-[#2e4600] font-medium">
                      Descripción del proyecto
                    </Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Describe los detalles y características del proyecto..."
                      className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[120px]"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Información Financiera */}
            <Card className="card-hover border-[#7d4427]/20">
              <CardHeader className="gradient-accent text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Información Financiera
                </CardTitle>
                <CardDescription className="text-white/80">Presupuesto y detalles económicos</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="presupuesto" className="text-[#2e4600] font-medium">
                      Presupuesto total *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                      <Input
                        id="presupuesto"
                        type="number"
                        placeholder="150000"
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anticipo" className="text-[#2e4600] font-medium">
                      Anticipo inicial
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                      <Input
                        id="anticipo"
                        type="number"
                        placeholder="30000"
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio" className="text-[#2e4600] font-medium">
                      Fecha de inicio *
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                      <Input
                        id="fechaInicio"
                        type="date"
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaEntrega" className="text-[#2e4600] font-medium">
                      Fecha estimada de entrega
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                      <Input
                        id="fechaEntrega"
                        type="date"
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gestión de Documentos */}
            <DocumentManager
              documents={documents}
              onDocumentsChange={setDocuments}
              canEdit={true}
              showUpload={true}
              title="Documentos del Proyecto"
            />

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gradient-primary text-white hover:opacity-90"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear Proyecto
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <Card className="border-[#c9e077]/30">
              <CardHeader>
                <CardTitle className="text-[#2e4600] flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Documentos Requeridos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mr-2"></span>
                    Planos arquitectónicos
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mr-2"></span>
                    Permisos de construcción
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mr-2"></span>
                    Estudio de suelos
                  </p>
                  <p className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mr-2"></span>
                    Contrato firmado
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#7d4427]/20">
              <CardHeader className="bg-[#7d4427]/10 rounded-t-lg">
                <CardTitle className="text-[#7d4427]">Fases del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span>1. Planificación</span>
                    <span className="text-[#a2c523]">0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>2. Diseño</span>
                    <span className="text-muted-foreground">0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3. Construcción</span>
                    <span className="text-muted-foreground">0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>4. Finalización</span>
                    <span className="text-muted-foreground">0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen de documentos */}
            {documents.length > 0 && (
              <Card className="border-[#486b00]/20">
                <CardHeader>
                  <CardTitle className="text-[#486b00]">Documentos Adjuntos</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Total de archivos:</span>
                      <span className="font-medium">{documents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Planos:</span>
                      <span className="font-medium">{documents.filter((d) => d.category === "plano").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fotografías:</span>
                      <span className="font-medium">{documents.filter((d) => d.category === "foto").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contratos:</span>
                      <span className="font-medium">{documents.filter((d) => d.category === "contrato").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
