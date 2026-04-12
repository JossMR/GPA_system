"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Eye, Calendar } from "lucide-react"
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
}

type ProjectOrderBy =
  | "PRJ_case_number"
  | "client_name"
  | "type_name"
  | "PRJ_state"
  | "PRJ_start_construction_date"
  | "PRJ_completion_date"

type ProjectOrderDir = "ASC" | "DESC"

export default function ProjectsPage() {
  const { isAdmin, getUserPermissions } = useAuth()
  const [projects, setProjects] = useState<GPAProject[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [filteredTotalProjects, setFilteredTotalProjects] = useState(0)
  const [globalTotalProjects, setGlobalTotalProjects] = useState(0)
  const [stateCounts, setStateCounts] = useState<Record<string, number>>({})
  const [orderBy, setOrderBy] = useState<ProjectOrderBy>("PRJ_case_number")
  const [orderDir, setOrderDir] = useState<ProjectOrderDir>("ASC")
  const projectsPerPage = 10

  const fetchGlobalTotals = async () => {
    try {
      const response = await fetch("/api/projects/count")
      const data = await response.json()
      setGlobalTotalProjects(data.totalProjects || 0)
      setStateCounts(data.stateCounts || {})
    } catch (error) {
      console.error("Error fetching global projects totals:", error)
    }
  }

  const fetchProjects = async (
    targetPage: number,
    targetSearch: string,
    targetOrderBy?: ProjectOrderBy,
    targetOrderDir?: ProjectOrderDir
  ) => {
    try {
      setLoading(true)
      const finalOrderBy = targetOrderBy || orderBy
      const finalOrderDir = targetOrderDir || orderDir
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(projectsPerPage),
        search: targetSearch,
        orderBy: finalOrderBy,
        orderDir: finalOrderDir,
      })

      const response = await fetch(`/api/projects?${params.toString()}`)
      const data = await response.json()
      setProjects(data.projects || [])
      setFilteredTotalProjects(data.totalProjects || 0)
      setTotalPages(data.totalPages || 0)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGlobalTotals()
  }, [])

  useEffect(() => {
    fetchProjects(page, appliedSearchTerm, orderBy, orderDir)
  }, [page, appliedSearchTerm, orderBy, orderDir])

  const handleApplyFilters = async () => {
    const nextSearch = searchTerm.trim()
    if (page === 1 && appliedSearchTerm === nextSearch) {
      await fetchProjects(1, nextSearch)
      return
    }
    setPage(1)
    setAppliedSearchTerm(nextSearch)
  }

  const handleClearFilters = async () => {
    if (
      !searchTerm &&
      !appliedSearchTerm &&
      page === 1 &&
      orderBy === "PRJ_case_number" &&
      orderDir === "ASC"
    ) {
      await fetchProjects(1, "", "PRJ_case_number", "ASC")
      return
    }

    setSearchTerm("")
    setAppliedSearchTerm("")
    setPage(1)
    setOrderBy("PRJ_case_number")
    setOrderDir("ASC")
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Proyectos</h1>
            <p className="text-muted-foreground">Gestiona todos tus proyectos arquitectónicos</p>
          </div>
          {(getUserPermissions().some(p => p.screen === "proyectos-nuevo" && p.permission_type === "Create") || isAdmin) && (
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
              <div className="text-2xl font-bold">{globalTotalProjects}</div>
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
                  <span className="text-lg font-bold text-gray-600">{stateCounts["Document Collection"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-yellow-700 font-medium text-xs">Inspección Téc.</span>
                  <span className="text-lg font-bold text-yellow-600">{stateCounts["Technical Inspection"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-orange-700 font-medium text-xs">Revisión Doc.</span>
                  <span className="text-lg font-bold text-orange-600">{stateCounts["Document Review"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-purple-700 font-medium text-xs">Planos/Presup.</span>
                  <span className="text-lg font-bold text-purple-600">{stateCounts["Plans and Budget"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-pink-50 rounded">
                  <span className="text-pink-700 font-medium text-xs">Rev. Entidad</span>
                  <span className="text-lg font-bold text-pink-600">{stateCounts["Entity Review"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-indigo-50 rounded">
                  <span className="text-indigo-700 font-medium text-xs">APC/Permisos</span>
                  <span className="text-lg font-bold text-indigo-600">{stateCounts["APC and Permits"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-teal-50 rounded">
                  <span className="text-teal-700 font-medium text-xs">Desembolso</span>
                  <span className="text-lg font-bold text-teal-600">{stateCounts["Disbursement"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-blue-700 font-medium text-xs">En Construc.</span>
                  <span className="text-lg font-bold text-blue-600">{stateCounts["Under Construction"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-green-700 font-medium text-xs">Completados</span>
                  <span className="text-lg font-bold text-green-600">{stateCounts["Completed"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                  <span className="text-emerald-700 font-medium text-xs">Bitác. Cerrada</span>
                  <span className="text-lg font-bold text-emerald-600">{stateCounts["Logbook Closed"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-red-700 font-medium text-xs">Rechazados</span>
                  <span className="text-lg font-bold text-red-600">{stateCounts["Rejected"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-slate-700 font-medium text-xs">Retiro Prof.</span>
                  <span className="text-lg font-bold text-slate-600">{stateCounts["Professional Withdrawal"] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                  <span className="text-amber-700 font-medium text-xs">Condicionados</span>
                  <span className="text-lg font-bold text-amber-600">{stateCounts["Conditioned"] || 0}</span>
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
            <div className="flex flex-col lg:flex-row gap-4">
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
              <div className="lg:w-[220px]">
                <Label htmlFor="orderBy">Ordenar por</Label>
                <select
                  id="orderBy"
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value as ProjectOrderBy)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
                >
                  <option value="PRJ_case_number">Número de caso</option>
                  <option value="client_name">Nombre de cliente</option>
                  <option value="type_name">Tipo</option>
                  <option value="PRJ_state">Estado</option>
                  <option value="PRJ_start_construction_date">Fecha de inicio</option>
                  <option value="PRJ_completion_date">Fecha de conclusión</option>
                </select>
              </div>
              <div className="lg:w-[160px]">
                <Label htmlFor="orderDir">Dirección</Label>
                <select
                  id="orderDir"
                  value={orderDir}
                  onChange={(e) => setOrderDir(e.target.value as ProjectOrderDir)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
                >
                  <option value="DESC">Descendente</option>
                  <option value="ASC">Ascendente</option>
                </select>
              </div>
              <div className="flex gap-2 items-end">
                <Button variant="secondary" className="btn-secondary"  onClick={handleApplyFilters}>
                  Filtrar
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  disabled={
                    !searchTerm &&
                    !appliedSearchTerm &&
                    page === 1 &&
                    orderBy === "PRJ_case_number" &&
                    orderDir === "ASC"
                  }
                >
                  Limpiar
                </Button>
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
              projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron proyectos con los filtros seleccionados.
                </div>
              ) : (
                <>
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
                      {projects.map((project) => (
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
                              ? Number(project.PRJ_area_m2).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : "N/A"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-semibold text-[#2e4600]">
                              {formatCurrency(project.PRJ_budget)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`font-semibold ${Number(project.PRJ_remaining_amount || 0) > 0 ? "text-orange-600" : "text-green-600"}`}>
                              {formatCurrency(project.PRJ_remaining_amount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-1 h-3 w-3 text-[#486b00]" />
                              {project.PRJ_start_construction_date
                                ? new Date(project.PRJ_start_construction_date).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })
                                : "N/A"
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-1 h-3 w-3 text-[#486b00]" />
                              {project.PRJ_completion_date
                                ? new Date(project.PRJ_completion_date).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric"
                                })
                                : "N/A"
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {(getUserPermissions().some(p => p.screen === "proyectos-id" && p.permission_type === "View") || isAdmin) && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/proyectos/${project.PRJ_id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              {(getUserPermissions().some(p => p.screen === "proyectos-id-editar" && p.permission_type === "Edit") || isAdmin) && (
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

                  {totalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === page ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}

                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Mostrando {projects.length} de {filteredTotalProjects} proyectos del filtro actual
                  </div>
                </>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
