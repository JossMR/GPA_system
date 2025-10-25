"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Eye, Calendar, DollarSign, PawPrint } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { GPAProject } from "@/models/GPA_project"
import { formatCurrency } from "@/lib/formatters"

const stateLabels = {
  "Document Collection": "Recepción de Documentos",
  "Technical Inspection": "Inspección Técnica",
  "Document Review": "Revisión de Documentos",
  "Plans and Budget": "Creación de Planos y Presupuesto",
  "Entity Review": "Revisión de Entidad Financiera",
  "APC and Permits": "APC y Permisos",
  "Disbursement": "Desembolso",
  "Under Construction": "En Construcción",
  "Completed": "Completado",
  "Logbook Closed": "Bitácora Cerrada",
  "Rejected": "Rechazado",
  "Professional Withdrawal": "Retiro Profesional",
  "Conditioned": "Condicionado",
};

const estadoColors = {
  planificacion: "bg-yellow-500",
  en_progreso: "bg-blue-500",
  completado: "bg-green-500",
  pausado: "bg-red-500",
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState<GPAProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const filteredProjects = projects?.filter(
    (project) =>
      project.PRJ_case_number.includes(searchTerm) ||
      project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.type?.TYP_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true)
    const response = await fetch("/api/projects")
    const data = await response.json()
    const requestedProjects: GPAProject[] = data.projects
    setProjects(requestedProjects)
    setLoading(false)
  }
  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Proyectos</h1>
            <p className="text-muted-foreground">Gestiona todos tus proyectos arquitectónicos</p>
          </div>
          {isAdmin && (
            <Link href="/proyectos/nuevo">
              <Button className="gradient-primary text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="md:w-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length}</div>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Proyectos por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700 font-medium text-xs">Recepción Doc.</span>
                  <span className="text-lg font-bold text-gray-600">{projects?.filter((p) => p.PRJ_state === "Document Collection").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-yellow-700 font-medium text-xs">Inspección Téc.</span>
                  <span className="text-lg font-bold text-yellow-600">{projects?.filter((p) => p.PRJ_state === "Technical Inspection").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-orange-700 font-medium text-xs">Revisión Doc.</span>
                  <span className="text-lg font-bold text-orange-600">{projects?.filter((p) => p.PRJ_state === "Document Review").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-purple-700 font-medium text-xs">Planos/Presup.</span>
                  <span className="text-lg font-bold text-purple-600">{projects?.filter((p) => p.PRJ_state === "Plans and Budget").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-pink-50 rounded">
                  <span className="text-pink-700 font-medium text-xs">Rev. Entidad</span>
                  <span className="text-lg font-bold text-pink-600">{projects?.filter((p) => p.PRJ_state === "Entity Review").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-indigo-50 rounded">
                  <span className="text-indigo-700 font-medium text-xs">APC/Permisos</span>
                  <span className="text-lg font-bold text-indigo-600">{projects?.filter((p) => p.PRJ_state === "APC and Permits").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-teal-50 rounded">
                  <span className="text-teal-700 font-medium text-xs">Desembolso</span>
                  <span className="text-lg font-bold text-teal-600">{projects?.filter((p) => p.PRJ_state === "Disbursement").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-blue-700 font-medium text-xs">En Construc.</span>
                  <span className="text-lg font-bold text-blue-600">{projects?.filter((p) => p.PRJ_state === "Under Construction").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-green-700 font-medium text-xs">Completados</span>
                  <span className="text-lg font-bold text-green-600">{projects?.filter((p) => p.PRJ_state === "Completed").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                  <span className="text-emerald-700 font-medium text-xs">Bitác. Cerrada</span>
                  <span className="text-lg font-bold text-emerald-600">{projects?.filter((p) => p.PRJ_state === "Logbook Closed").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-red-700 font-medium text-xs">Rechazados</span>
                  <span className="text-lg font-bold text-red-600">{projects?.filter((p) => p.PRJ_state === "Rejected").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-slate-700 font-medium text-xs">Retiro Prof.</span>
                  <span className="text-lg font-bold text-slate-600">{projects?.filter((p) => p.PRJ_state === "Professional Withdrawal").length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                  <span className="text-amber-700 font-medium text-xs">Condicionados</span>
                  <span className="text-lg font-bold text-amber-600">{projects?.filter((p) => p.PRJ_state === "Conditioned").length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por numero de caso o tipo de proyecto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Proyectos</CardTitle>
            <CardDescription>Todos los proyectos registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#486b00] mr-4" />
                <span className="text-muted-foreground">Cargando información de proyectos...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero de Caso</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Área (m²)</TableHead>
                    <TableHead className="text-right">Presupuesto</TableHead>
                    <TableHead className="text-right">Saldo Restante</TableHead>
                    <TableHead>Fecha de Inicio</TableHead>
                    <TableHead>Fecha de Conclusión</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects?.map((project) => (
                    <TableRow key={project.PRJ_id} className="animate-fade-in">
                      <TableCell>
                        <div className="font-medium">{project.PRJ_case_number}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.client_name}</div>
                          <div className="text-xs text-muted-foreground">{project.client_identification}</div>
                        </div>
                      </TableCell>
                      <TableCell>{project.type?.TYP_name || "N/A"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-[#a2c523]/10 text-[#486b00]">
                          {stateLabels[project.PRJ_state] ?? project.PRJ_state}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {project.PRJ_area_m2 
                          ? Number(project.PRJ_area_m2).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : "N/A"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-semibold text-[#2e4600]">
                          {formatCurrency(project.PRJ_budget)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-semibold ${Number(project.PRJ_remaining_amount || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {formatCurrency(project.PRJ_remaining_amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3 text-[#486b00]" />
                          {project.PRJ_start_construction_date 
                            ? new Date(project.PRJ_start_construction_date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : "N/A"
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3 text-[#486b00]" />
                          {project.PRJ_completion_date 
                            ? new Date(project.PRJ_completion_date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : "N/A"
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/proyectos/${project.PRJ_id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {isAdmin && (
                            <Link href={`/proyectos/${project.PRJ_id}/editar`}>
                              <Button variant="ghost" size="sm" className="hover:bg-[#c9e077]/20">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
