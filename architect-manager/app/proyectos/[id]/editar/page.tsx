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
import { ArrowLeft, Save, Building, Calendar, DollarSign, MapPin, Trash2, Plus, Edit } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const mockClientes = [
  { id: 1, nombre: "María González" },
  { id: 2, nombre: "Carlos Rodríguez" },
  { id: 3, nombre: "Ana Martínez" },
]

// Mock data del proyecto existente
const mockProyecto = {
  id: 1,
  nombre: "Villa Moderna",
  cliente: "1",
  categoria: "residencial",
  estado: "en_progreso",
  ubicacion: "Av. Principal 123, Ciudad",
  descripcion: "Proyecto de villa moderna con diseño contemporáneo, espacios amplios y acabados de lujo.",
  presupuesto: 150000,
  anticipo: 50000,
  fechaInicio: "2024-01-15",
  fechaEntrega: "2024-06-15",
}

const mockPagos = [
  {
    id: 1,
    fecha: "2024-12-10",
    monto: 50000,
    metodo: "transferencia",
    detalle: "Pago inicial",
    numeroCaso: "VM-001",
  },
  {
    id: 2,
    fecha: "2024-11-15",
    monto: 30000,
    metodo: "cheque",
    detalle: "Segunda cuota",
    numeroCaso: "VM-002",
  },
  {
    id: 3,
    fecha: "2024-10-20",
    monto: 17500,
    metodo: "efectivo",
    detalle: "Pago por avance",
    numeroCaso: "VM-003",
  },
]

const mockCostosExtra = [
  {
    id: 1,
    descripcion: "Materiales premium para fachada",
    monto: 8000,
    fecha: "2024-12-01",
    aprobado: true,
  },
  {
    id: 2,
    descripcion: "Sistema de domótica adicional",
    monto: 12000,
    fecha: "2024-11-25",
    aprobado: true,
  },
]

// Mock documentos existentes
const mockDocuments = [
  {
    id: "doc_1",
    name: "Plano_Arquitectonico_Villa.pdf",
    type: "application/pdf",
    size: 2048576,
    uploadDate: "2024-01-15",
    category: "plano" as const,
    url: "/placeholder.pdf",
  },
  {
    id: "doc_2",
    name: "Permiso_Construccion.pdf",
    type: "application/pdf",
    size: 1024000,
    uploadDate: "2024-01-20",
    category: "permiso" as const,
    url: "/placeholder.pdf",
  },
  {
    id: "doc_3",
    name: "Foto_Terreno_1.jpg",
    type: "image/jpeg",
    size: 512000,
    uploadDate: "2024-01-10",
    category: "foto" as const,
    url: "/placeholder.svg?height=400&width=600",
  },
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

export default function EditarProyectoPage({ params }: { params: { id: string } }) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [pagos, setPagos] = useState(mockPagos)
  const [costosExtra, setCostosExtra] = useState(mockCostosExtra)
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false)
  const [isCostoDialogOpen, setIsCostoDialogOpen] = useState(false)
  const [selectedPago, setSelectedPago] = useState<any>(null)
  const [selectedCosto, setSelectedCosto] = useState<any>(null)

  if (!isAdmin) {
    router.push("/proyectos")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Documentos actualizados:", documents)
    setLoading(false)
    router.push(`/proyectos/${params.id}`)
  }

  const handleNewPago = () => {
    setSelectedPago(null)
    setIsPagoDialogOpen(true)
  }

  const handleEditPago = (pago: any) => {
    setSelectedPago(pago)
    setIsPagoDialogOpen(true)
  }

  const handleDeletePago = (pagoId: number) => {
    setPagos((prev) => prev.filter((p) => p.id !== pagoId))
  }

  const handleSavePago = (pagoData: any) => {
    if (selectedPago) {
      // Editar pago existente
      setPagos((prev) => prev.map((p) => (p.id === selectedPago.id ? { ...p, ...pagoData } : p)))
    } else {
      // Crear nuevo pago
      const newPago = {
        id: Math.max(...pagos.map((p) => p.id)) + 1,
        ...pagoData,
      }
      setPagos((prev) => [...prev, newPago])
    }
    setIsPagoDialogOpen(false)
  }

  const handleNewCosto = () => {
    setSelectedCosto(null)
    setIsCostoDialogOpen(true)
  }

  const handleEditCosto = (costo: any) => {
    setSelectedCosto(costo)
    setIsCostoDialogOpen(true)
  }

  const handleDeleteCosto = (costoId: number) => {
    setCostosExtra((prev) => prev.filter((c) => c.id !== costoId))
  }

  const handleSaveCosto = (costoData: any) => {
    if (selectedCosto) {
      // Editar costo existente
      setCostosExtra((prev) => prev.map((c) => (c.id === selectedCosto.id ? { ...c, ...costoData } : c)))
    } else {
      // Crear nuevo costo
      const newCosto = {
        id: Math.max(...costosExtra.map((c) => c.id)) + 1,
        ...costoData,
      }
      setCostosExtra((prev) => [...prev, newCosto])
    }
    setIsCostoDialogOpen(false)
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
              Editar Proyecto: {mockProyecto.nombre}
            </h1>
            <p className="text-muted-foreground">Modifica los datos del proyecto</p>
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
                        defaultValue={mockProyecto.nombre}
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cliente" className="text-[#2e4600] font-medium">
                        Cliente *
                      </Label>
                      <Select defaultValue={mockProyecto.cliente} required>
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue />
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
                      <Select defaultValue={mockProyecto.categoria} required>
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue />
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
                        Estado del proyecto
                      </Label>
                      <Select defaultValue={mockProyecto.estado}>
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planificacion">Planificación</SelectItem>
                          <SelectItem value="en_progreso">En Progreso</SelectItem>
                          <SelectItem value="completado">Completado</SelectItem>
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
                        defaultValue={mockProyecto.ubicacion}
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
                      defaultValue={mockProyecto.descripcion}
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
                        defaultValue={mockProyecto.presupuesto}
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
                        defaultValue={mockProyecto.anticipo}
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
                        defaultValue={mockProyecto.fechaInicio}
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
                        defaultValue={mockProyecto.fechaEntrega}
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

            {/* Gestión de Pagos */}
            <Card className="card-hover border-[#c9e077]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#2e4600] flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Historial de Pagos
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewPago}
                    className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar Pago
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Detalle</TableHead>
                      <TableHead>N° Caso</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.map((pago) => (
                      <TableRow key={pago.id}>
                        <TableCell>{pago.fecha}</TableCell>
                        <TableCell className="font-semibold text-[#2e4600]">${pago.monto.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#a2c523] text-[#486b00]">
                            {pago.metodo}
                          </Badge>
                        </TableCell>
                        <TableCell>{pago.detalle}</TableCell>
                        <TableCell className="font-mono text-sm">{pago.numeroCaso}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPago(pago)}
                              className="hover:bg-[#c9e077]/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePago(pago.id)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pagos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay pagos registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gestión de Costos Extra */}
            <Card className="card-hover border-[#7d4427]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#7d4427] flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Costos Extra
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewCosto}
                    className="border-[#7d4427] text-[#7d4427] hover:bg-[#7d4427]/10"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar Costo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {costosExtra.map((costo) => (
                  <div key={costo.id} className="border rounded-lg p-3 border-[#7d4427]/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{costo.descripcion}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${costo.aprobado ? "bg-green-500" : "bg-yellow-500"} text-white text-xs`}>
                            {costo.aprobado ? "Aprobado" : "Pendiente"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{costo.fecha}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-[#7d4427]">${costo.monto.toLocaleString()}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCosto(costo)}
                            className="hover:bg-[#7d4427]/10"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCosto(costo.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {costosExtra.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay costos extra registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <Card className="border-[#c9e077]/30">
              <CardHeader>
                <CardTitle className="text-[#2e4600]">Estado del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progreso actual:</span>
                    <span className="font-medium text-[#486b00]">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estado:</span>
                    <span className="font-medium text-blue-600">En Progreso</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Días transcurridos:</span>
                    <span className="font-medium">332</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Días restantes:</span>
                    <span className="font-medium text-[#7d4427]">183</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#7d4427]/20">
              <CardHeader>
                <CardTitle className="text-[#7d4427]">Historial de Cambios</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm space-y-2">
                  <div className="border-l-2 border-[#a2c523] pl-3 py-1">
                    <p className="font-medium">Última modificación</p>
                    <p className="text-muted-foreground">Hace 2 días</p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-3 py-1">
                    <p className="font-medium">Cambio de presupuesto</p>
                    <p className="text-muted-foreground">Hace 1 semana</p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-3 py-1">
                    <p className="font-medium">Proyecto creado</p>
                    <p className="text-muted-foreground">Hace 11 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#486b00]/20">
              <CardHeader>
                <CardTitle className="text-[#486b00]">Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span>Presupuesto base:</span>
                    <span className="font-medium">${mockProyecto.presupuesto.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costos extra:</span>
                    <span className="font-medium text-[#7d4427]">
                      +${costosExtra.reduce((sum, c) => sum + c.monto, 0).toLocaleString()}
                    </span>
                  </div>
                  <hr className="border-[#a2c523]/30" />
                  <div className="flex justify-between">
                    <span>Total presupuestado:</span>
                    <span className="font-bold text-[#486b00]">
                      ${(mockProyecto.presupuesto + costosExtra.reduce((sum, c) => sum + c.monto, 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total pagado:</span>
                    <span className="font-medium text-green-600">
                      ${pagos.reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
                    </span>
                  </div>
                  <hr className="border-[#a2c523]/30" />
                  <div className="flex justify-between">
                    <span>Saldo restante:</span>
                    <span className="font-bold text-[#7d4427]">
                      $
                      {(
                        mockProyecto.presupuesto +
                        costosExtra.reduce((sum, c) => sum + c.monto, 0) -
                        pagos.reduce((sum, p) => sum + p.monto, 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog para Crear/Editar Pago */}
        <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#2e4600]">
                {selectedPago ? "Editar Pago" : "Registrar Nuevo Pago"}
              </DialogTitle>
              <DialogDescription>
                {selectedPago ? "Modifica los datos del pago" : "Ingresa los detalles del nuevo pago"}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const pagoData = {
                  fecha: formData.get("fecha"),
                  monto: Number(formData.get("monto")),
                  metodo: formData.get("metodo"),
                  detalle: formData.get("detalle"),
                  numeroCaso: formData.get("numeroCaso"),
                }
                handleSavePago(pagoData)
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fecha">Fecha del pago</Label>
                    <Input
                      id="fecha"
                      name="fecha"
                      type="date"
                      defaultValue={selectedPago?.fecha || ""}
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="monto">Monto</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                      <Input
                        id="monto"
                        name="monto"
                        type="number"
                        placeholder="25000"
                        defaultValue={selectedPago?.monto || ""}
                        className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="metodo">Método de pago</Label>
                    <Select name="metodo" defaultValue={selectedPago?.metodo || ""} required>
                      <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                        <SelectValue placeholder="Método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="numeroCaso">Número de caso</Label>
                    <Input
                      id="numeroCaso"
                      name="numeroCaso"
                      placeholder="VM-001"
                      defaultValue={selectedPago?.numeroCaso || ""}
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="detalle">Detalle del pago</Label>
                  <Input
                    id="detalle"
                    name="detalle"
                    placeholder="Descripción del pago..."
                    defaultValue={selectedPago?.detalle || ""}
                    className="border-[#a2c523]/30 focus:border-[#486b00]"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPagoDialogOpen(false)}
                  className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="gradient-primary text-white hover:opacity-90">
                  {selectedPago ? "Actualizar" : "Registrar"} Pago
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para Crear/Editar Costo Extra */}
        <Dialog open={isCostoDialogOpen} onOpenChange={setIsCostoDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#7d4427]">
                {selectedCosto ? "Editar Costo Extra" : "Agregar Costo Extra"}
              </DialogTitle>
              <DialogDescription>
                {selectedCosto ? "Modifica los datos del costo extra" : "Ingresa los detalles del nuevo costo extra"}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const costoData = {
                  descripcion: formData.get("descripcion"),
                  monto: Number(formData.get("monto")),
                  fecha: formData.get("fecha"),
                  aprobado: formData.get("aprobado") === "on",
                }
                handleSaveCosto(costoData)
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="descripcion">Descripción del costo</Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    placeholder="Describe el costo extra..."
                    defaultValue={selectedCosto?.descripcion || ""}
                    className="border-[#7d4427]/30 focus:border-[#7d4427]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="monto">Monto</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                      <Input
                        id="monto"
                        name="monto"
                        type="number"
                        placeholder="5000"
                        defaultValue={selectedCosto?.monto || ""}
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      name="fecha"
                      type="date"
                      defaultValue={selectedCosto?.fecha || new Date().toISOString().split("T")[0]}
                      className="border-[#7d4427]/30 focus:border-[#7d4427]"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aprobado"
                    name="aprobado"
                    defaultChecked={selectedCosto?.aprobado || false}
                    className="rounded border-[#7d4427]/30"
                  />
                  <Label htmlFor="aprobado">Costo aprobado por el cliente</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCostoDialogOpen(false)}
                  className="border-[#7d4427] text-[#7d4427] hover:bg-[#7d4427]/10"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="gradient-accent text-white hover:opacity-90">
                  {selectedCosto ? "Actualizar" : "Agregar"} Costo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
