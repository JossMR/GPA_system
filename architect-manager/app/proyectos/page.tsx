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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Construcción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {projects?.filter((p) => p.PRJ_state === "Under Construction").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {projects?.filter((p) => p.PRJ_state === "Completed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex">
                <p>₡</p>
                {projects?.reduce((sum, p) => sum + Number(p.PRJ_budget ?? 0), 0).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    <TableHead>Nombre del Cliente</TableHead>
                    <TableHead>Tipo de Proyecto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects?.map((project) => (
                    <TableRow key={project.PRJ_id} className="animate-fade-in">
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.PRJ_case_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{project.client_name}</TableCell>
                      <TableCell>{project.type?.TYP_name}</TableCell>
                      <TableCell>{stateLabels[project.PRJ_state] ?? project.PRJ_state}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            ₡{(project.PRJ_budget ?? 0).toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3" />
                            {project.PRJ_start_construction_date ? new Date(project.PRJ_start_construction_date).toLocaleDateString() : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">Conclusión: {project.PRJ_completion_date ? new Date(project.PRJ_completion_date).toLocaleDateString() : "N/A"}</div>
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
