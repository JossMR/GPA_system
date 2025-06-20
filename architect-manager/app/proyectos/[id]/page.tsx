"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DocumentManager } from "@/components/document-manager"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  User,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

// Mock data para el proyecto
const mockProyecto = {
  id: 1,
  nombre: "Villa Moderna",
  cliente: "María González",
  estado: "en_progreso",
  progreso: 65,
  presupuesto: 150000,
  pagado: 97500,
  fechaInicio: "2024-01-15",
  fechaEntrega: "2024-06-15",
  categoria: "residencial",
  ubicacion: "Av. Principal 123, Ciudad",
  descripcion: "Proyecto de villa moderna con diseño contemporáneo, espacios amplios y acabados de lujo.",
}

const mockObservaciones = [
  {
    id: 1,
    fecha: "2024-12-10",
    autor: "Juan Arquitecto",
    observacion: "Se completó la fase de cimentación. Todo según cronograma.",
    tipo: "progreso",
  },
  {
    id: 2,
    fecha: "2024-12-08",
    autor: "María González",
    observacion: "Cliente solicita cambio en el color de fachada principal.",
    tipo: "cambio",
  },
  {
    id: 3,
    fecha: "2024-12-05",
    autor: "Juan Arquitecto",
    observacion: "Retraso en entrega de materiales. Ajustar cronograma.",
    tipo: "problema",
  },
]

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

// Mock documentos del proyecto
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
  {
    id: "doc_4",
    name: "Contrato_Firmado.pdf",
    type: "application/pdf",
    size: 756000,
    uploadDate: "2024-01-12",
    category: "contrato" as const,
    url: "/placeholder.pdf",
  },
  {
    id: "doc_5",
    name: "Foto_Avance_Cimentacion.jpg",
    type: "image/jpeg",
    size: 1200000,
    uploadDate: "2024-12-10",
    category: "foto" as const,
    url: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "doc_6",
    name: "Especificaciones_Tecnicas.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 345000,
    uploadDate: "2024-02-01",
    category: "otro" as const,
    url: "/placeholder.docx",
  },
]

const tipoObservacionColors = {
  progreso: "bg-green-500",
  cambio: "bg-blue-500",
  problema: "bg-red-500",
}

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  category: "plano" | "permiso" | "contrato" | "foto" | "otro"
  url?: string
}

export default function DetalleProyectoPage({ params }: { params: { id: string } }) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [observaciones, setObservaciones] = useState(mockObservaciones)
  const [pagos, setPagos] = useState(mockPagos)
  const [costosExtra, setCostosExtra] = useState(mockCostosExtra)
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [isObservacionDialogOpen, setIsObservacionDialogOpen] = useState(false)
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false)
  const [isCostoDialogOpen, setIsCostoDialogOpen] = useState(false)
  const [nuevaObservacion, setNuevaObservacion] = useState("")

  const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0)
  const totalCostosExtra = costosExtra.reduce((sum, costo) => sum + costo.monto, 0)
  const presupuestoTotal = mockProyecto.presupuesto + totalCostosExtra
  const saldoRestante = presupuestoTotal - totalPagado

  const agregarObservacion = () => {
    if (nuevaObservacion.trim()) {
      const nueva = {
        id: observaciones.length + 1,
        fecha: new Date().toISOString().split("T")[0],
        autor: "Juan Arquitecto",
        observacion: nuevaObservacion,
        tipo: "progreso" as const,
      }
      setObservaciones([nueva, ...observaciones])
      setNuevaObservacion("")
      setIsObservacionDialogOpen(false)
    }
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-[#c9e077]/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              {mockProyecto.nombre}
            </h1>
            <p className="text-muted-foreground">Detalles completos del proyecto</p>
          </div>
          {isAdmin && (
            <Link href={`/proyectos/${params.id}/editar`}>
              <Button className="gradient-primary text-white hover:opacity-90">
                <Edit className="mr-2 h-4 w-4" />
                Editar Proyecto
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles del Proyecto */}
            <Card className="card-hover border-[#a2c523]/20">
              <CardHeader className="gradient-light text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Información del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#2e4600] font-medium">Cliente</Label>
                    <div className="flex items-center mt-1">
                      <User className="mr-2 h-4 w-4 text-[#486b00]" />
                      <span>{mockProyecto.cliente}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Categoría</Label>
                    <div className="mt-1">
                      <Badge className="bg-[#a2c523] text-white capitalize">{mockProyecto.categoria}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-[#2e4600] font-medium">Ubicación</Label>
                  <div className="flex items-center mt-1">
                    <MapPin className="mr-2 h-4 w-4 text-[#486b00]" />
                    <span>{mockProyecto.ubicacion}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-[#2e4600] font-medium">Descripción</Label>
                  <p className="mt-1 text-muted-foreground">{mockProyecto.descripcion}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#2e4600] font-medium">Fecha de Inicio</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="mr-2 h-4 w-4 text-[#486b00]" />
                      <span>{mockProyecto.fechaInicio}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Fecha de Entrega</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="mr-2 h-4 w-4 text-[#486b00]" />
                      <span>{mockProyecto.fechaEntrega}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-[#2e4600] font-medium">Progreso del Proyecto</Label>
                  <div className="mt-2 space-y-2">
                    <Progress value={mockProyecto.progreso} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-[#486b00] font-medium">{mockProyecto.progreso}% Completado</span>
                      <Badge
                        className={`${mockProyecto.estado === "en_progreso" ? "bg-blue-500" : "bg-green-500"} text-white`}
                      >
                        {mockProyecto.estado === "en_progreso" ? "En Progreso" : "Completado"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentos del Proyecto */}
            <DocumentManager
              documents={documents}
              onDocumentsChange={setDocuments}
              canEdit={false}
              showUpload={false}
              title="Documentos del Proyecto"
            />

            {/* Observaciones */}
            <Card className="card-hover border-[#7d4427]/20">
              <CardHeader className="gradient-accent text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Observaciones del Proyecto
                  </CardTitle>
                  {isAdmin && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsObservacionDialogOpen(true)}
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Agregar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {observaciones.map((obs, index) => (
                    <div
                      key={obs.id}
                      className="border-l-4 border-[#a2c523] pl-4 py-2 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${tipoObservacionColors[obs.tipo as keyof typeof tipoObservacionColors]} text-white text-xs`}
                          >
                            {obs.tipo}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{obs.fecha}</span>
                          <span className="text-sm font-medium text-[#486b00]">{obs.autor}</span>
                        </div>
                        {isAdmin && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm">{obs.observacion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historial de Pagos */}
            <Card className="card-hover border-[#c9e077]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#2e4600] flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Historial de Pagos
                  </CardTitle>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPagoDialogOpen(true)}
                      className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Agregar Pago
                    </Button>
                  )}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Resumen Financiero */}
            <Card className="card-hover border-[#486b00]/20">
              <CardHeader className="gradient-primary text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Presupuesto Base:</span>
                    <span className="font-semibold">${mockProyecto.presupuesto.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Costos Extra:</span>
                    <span className="font-semibold text-[#7d4427]">+${totalCostosExtra.toLocaleString()}</span>
                  </div>
                  <hr className="border-[#a2c523]/30" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#2e4600]">Total Presupuestado:</span>
                    <span className="font-bold text-lg text-[#2e4600]">${presupuestoTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Pagado:</span>
                    <span className="font-semibold text-green-600">${totalPagado.toLocaleString()}</span>
                  </div>
                  <hr className="border-[#a2c523]/30" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#7d4427]">Saldo Restante:</span>
                    <span className="font-bold text-lg text-[#7d4427]">${saldoRestante.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso de Pagos</span>
                    <span>{Math.round((totalPagado / presupuestoTotal) * 100)}%</span>
                  </div>
                  <Progress value={(totalPagado / presupuestoTotal) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Costos Extra */}
            <Card className="card-hover border-[#7d4427]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#7d4427] flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Costos Extra
                  </CardTitle>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCostoDialogOpen(true)}
                      className="border-[#7d4427] text-[#7d4427] hover:bg-[#7d4427]/10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {costosExtra.map((costo) => (
                  <div key={costo.id} className="border rounded-lg p-3 border-[#7d4427]/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">{costo.descripcion}</span>
                      <Badge className={`${costo.aprobado ? "bg-green-500" : "bg-yellow-500"} text-white text-xs`}>
                        {costo.aprobado ? "Aprobado" : "Pendiente"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{costo.fecha}</span>
                      <span className="font-semibold text-[#7d4427]">${costo.monto.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Estado del Proyecto */}
            <Card className="card-hover border-[#c9e077]/30">
              <CardHeader>
                <CardTitle className="text-[#2e4600] flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Estado del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Planificación</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Diseño</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Construcción</span>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Finalización</span>
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog para Nueva Observación */}
        <Dialog open={isObservacionDialogOpen} onOpenChange={setIsObservacionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#2e4600]">Nueva Observación</DialogTitle>
              <DialogDescription>Agrega una nueva observación al proyecto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="observacion">Observación</Label>
                <Textarea
                  id="observacion"
                  placeholder="Describe la observación..."
                  value={nuevaObservacion}
                  onChange={(e) => setNuevaObservacion(e.target.value)}
                  className="border-[#a2c523]/30 focus:border-[#486b00]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsObservacionDialogOpen(false)}
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
              >
                Cancelar
              </Button>
              <Button onClick={agregarObservacion} className="gradient-primary text-white hover:opacity-90">
                Agregar Observación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
