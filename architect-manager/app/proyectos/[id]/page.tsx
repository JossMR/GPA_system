"use client"

import { use, useEffect, useState } from "react"
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
import { GPAProject } from "@/models/GPA_project"
const estadoProyectoES: Record<string, string> = {
  "Document Collection": "Recolección de Documentos",
  "Technical Inspection": "Inspección Técnica",
  "Document Review": "Revisión de Documentos",
  "Plans and Budget": "Planos y Presupuesto",
  "Entity Review": "Revisión de Entidad",
  "APC and Permits": "APC y Permisos",
  "Disbursement": "Desembolso",
  "Under Construction": "En Construcción",
  "Completed": "Completado",
  "Logbook Closed": "Bitácora Cerrada",
  "Rejected": "Rechazado",
  "Professional Withdrawal": "Retiro Profesional",
  "Conditioned": "Condicionado",
}
const tipoObservacionColors = {
  progreso: "bg-green-500",
  cambio: "bg-blue-500",
  problema: "bg-red-500",
}
const mockProyecto = {
  presupuesto: 150000,
}
const costosExtra = [
  { descripcion: "Permiso municipal", monto: 5000 },
  { descripcion: "Estudio de suelos", monto: 3500 },
]
const pagos = [
  { descripcion: "Anticipo", monto: 20000 },
  { descripcion: "Segundo pago", monto: 15000 },
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

export default function ViewProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const { id } = use(params)

  const [project, setProject] = useState<GPAProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isObservacionDialogOpen, setIsObservacionDialogOpen] = useState(false)
  const [nuevaObservacion, setNuevaObservacion] = useState("")

  // Charge project data
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/projects/${id}?include=all`)
        if (!response.ok) throw new Error("No se pudo cargar el proyecto")
        const data = await response.json()
        setProject(data.project)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#486b00] mr-4" />
          <span className="text-muted-foreground">Cargando información del proyecto...</span>
        </div>
      </MainLayout>
    )
  }

  if (error || !project) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <p>{error || "Proyecto no encontrado"}</p>
          <Button onClick={() => router.push("/proyectos")} className="mt-4">
            Volver
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/proyectos")} className="hover:bg-[#c9e077]/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Proyectos
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              {"Número de caso: " + project.PRJ_case_number}
            </h1>
            <p className="text-muted-foreground">Detalles completos del proyecto</p>
          </div>
          {isAdmin && (
            <Link href={`/proyectos/${id}/editar`}>
              <Button className="gradient-primary text-white hover:opacity-90">
                <Edit className="mr-2 h-4 w-4" />
                Editar Proyecto
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Principal Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
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
                      <span>{project.client_name + "-" + project.client_identification}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Categorías</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {project.categories_names && project.categories_names.length > 0 ? (
                        project.categories_names.map((cat, i) => (
                          <Badge key={i} className="bg-[#a2c523] text-white capitalize">{cat}</Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Sin categorías</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[#2e4600] font-medium">Área m<sup>2</sup></Label>
                    <div className="flex items-center mt-1">
                      <span>{project.PRJ_area_m2 || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Número de Caso</Label>
                    <div className="flex items-center mt-1">
                      <span>{project.PRJ_case_number || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Fecha de Registro</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="mr-2 h-4 w-4 text-[#486b00]" />
                      <span>
                        {project.PRJ_entry_date
                          ? new Date(project.PRJ_entry_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[#2e4600] font-medium">Ubicación</Label>
                  <div className="flex items-center mt-1">
                    <MapPin className="mr-2 h-4 w-4 text-[#486b00]" />
                    <span>
                      {project.PRJ_province}, {project.PRJ_canton}, {project.PRJ_district} {project.PRJ_neighborhood && `, ${project.PRJ_neighborhood}`}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-[#2e4600] font-medium">Direcciones Adicionales</Label>
                  <p className="mt-1 text-muted-foreground">{project.PRJ_additional_directions || "Sin direcciones"}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[#2e4600] font-medium">Fecha Conclusión</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="mr-2 h-4 w-4 text-[#486b00]" />
                      <span>{project.PRJ_completion_date ? new Date(project.PRJ_completion_date).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Número de Bitácora</Label>
                    <div className="flex items-center mt-1">
                      <span>{project.PRJ_logbook_number || "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Fecha de Cierre de Bitácora</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="mr-2 h-4 w-4 text-[#486b00]" />
                      <span>{project.PRJ_logbook_close_date ? new Date(project.PRJ_logbook_close_date).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-[#2e4600] font-medium">Notas</Label>
                  <p className="mt-1 text-muted-foreground">{project.PRJ_notes || "Sin notas"}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[#2e4600] font-medium">Fecha de Inicio</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="mr-2 h-4 w-4 text-[#486b00]" />
                      <span>{project.PRJ_start_construction_date ? new Date(project.PRJ_start_construction_date).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Estado</Label>
                    <div className="mt-2">
                      <Badge className="bg-[#a2c523] text-white">
                        {estadoProyectoES[project.PRJ_state] || project.PRJ_state}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#2e4600] font-medium">Tipo de Proyecto</Label>
                    <div className="flex items-center mt-1">
                      <span>{project.type?.TYP_name || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lateral Panel */}
          <div className="space-y-6">
            {/* Financial Summary */}
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
                    <span className="font-semibold">₡{(project.PRJ_budget ?? 0).toLocaleString()}</span>
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
      </div>
    </MainLayout>
  )
}
