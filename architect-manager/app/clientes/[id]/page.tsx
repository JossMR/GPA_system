"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Edit, User, Mail, Phone, Building, MapPin, Calendar, DollarSign, Eye, FileText } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPAClient } from "@/models/GPA_client"
import { GPAProject } from "@/models/GPA_project"
import Link from "next/link"

// Función para obtener el color según el estado del proyecto
const getStateColor = (state: string) => {
  const colors: { [key: string]: string } = {
    'Document Collection': 'bg-yellow-500',
    'Technical Inspection': 'bg-yellow-600',
    'Document Review': 'bg-orange-500',
    'Plans and Budget': 'bg-blue-500',
    'Entity Review': 'bg-blue-600',
    'APC and Permits': 'bg-purple-500',
    'Disbursement': 'bg-indigo-500',
    'Under Construction': 'bg-blue-700',
    'Completed': 'bg-green-500',
    'Logbook Closed': 'bg-green-600',
    'Rejected': 'bg-red-500',
    'Professional Withdrawal': 'bg-red-600',
    'Conditioned': 'bg-gray-500'
  }
  return colors[state] || 'bg-gray-400'
}

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [cliente, setCliente] = useState<GPAClient | null>(null)
  const [projects, setProjects] = useState<GPAProject[] | null>(null)
  const [loading, setLoading] = useState(true)
  const { id } = use(params);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`)
        if (!response.ok) throw new Error("Error fetching client")
        const data = await response.json()
        setCliente(data.client)
      } catch (error) {
        console.error("Error fetching client:", error)
      } finally {
        setLoading(false)
      }
    }
    const fetchProjectsByClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}/projects`)
        if (!response.ok) throw new Error("Error fetching projects")
        const data = await response.json()
        setProjects(data.projects)
      } catch (error) {
        console.error("Error fetching projects by client:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchClient()
    fetchProjectsByClient()
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <p>Cargando información del cliente...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!cliente) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <p>Cliente no encontrado</p>
            <Button
              variant="ghost"
              onClick={() => router.push("/clientes")}
              className="hover:bg-[#c9e077]/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Datos calculados para proyectos con información real
  const totalProyectos = projects?.length || 0
  const proyectosActivos = projects?.filter(p =>
    ['Under Construction', 'Disbursement', 'APC and Permits'].includes(p.PRJ_state)
  ).length || 0
  const proyectosCompletados = projects?.filter(p =>
    ['Completed', 'Logbook Closed'].includes(p.PRJ_state)
  ).length || 0
  const valorTotal = projects?.reduce((sum, p) => sum + (p.PRJ_budget || 0), 0) || 0
  const totalPagado = projects?.reduce((sum, p) => sum + (p.PRJ_final_price || 0), 0) || 0

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/clientes")}
            className="hover:bg-[#c9e077]/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Clientes
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              {cliente.CLI_name} {cliente.CLI_f_lastname} {cliente.CLI_s_lastname}
            </h1>
            <p className="text-muted-foreground">Información completa del cliente</p>
          </div>
          {isAdmin && (
            <Link href={`/clientes/${id}/editar`}>
              <Button className="gradient-primary text-white hover:opacity-90">
                <Edit className="mr-2 h-4 w-4" />
                Editar Cliente
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Cliente */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos Personales */}
            <Card className="card-hover border-[#a2c523]/20 animate-slide-up">
              <CardHeader className="gradient-light text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription className="text-white/80">Datos de contacto y empresa</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre completo</p>
                        <p className="font-medium">{cliente.CLI_name} {cliente.CLI_f_lastname} {cliente.CLI_s_lastname}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Correo electrónico</p>
                        <p className="font-medium">{cliente.CLI_email || "No especificado"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{cliente.CLI_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Identificación</p>
                        <p className="font-medium">{cliente.CLI_identification}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de identificación</p>
                        <p className="font-medium">{cliente.CLI_identificationtype}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Estado civil</p>
                        <p className="font-medium">{cliente.CLI_civil_status}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <p className="font-medium">{cliente.CLI_isperson ? "Persona física" : "Empresa"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Provincia</p>
                        <p className="font-medium">{cliente.CLI_province || "No especificada"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cantón</p>
                        <p className="font-medium">{cliente.CLI_canton || "No especificado"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Distrito</p>
                        <p className="font-medium">{cliente.CLI_district || "No especificado"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#c9e077]/20">
                  <div className="space-y-3">
                    {cliente.CLI_neighborhood && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-[#486b00] mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Barrio/Urbanización</p>
                          <p className="font-medium">{cliente.CLI_neighborhood}</p>
                        </div>
                      </div>
                    )}
                    {cliente.CLI_additional_directions && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-[#486b00] mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Direcciones adicionales</p>
                          <p className="font-medium">{cliente.CLI_additional_directions}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-[#486b00] mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Observaciones</p>
                        <p className="font-medium">{cliente.CLI_observations || "Sin observaciones"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proyectos del Cliente */}
            <Card className="card-hover border-[#7d4427]/20 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="gradient-accent text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Proyectos del Cliente
                  </CardTitle>
                  <Link href={`/proyectos?cliente=${id}`}>
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {projects && projects.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proyecto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Presupuesto</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.slice(0, 5).map((project, index) => (
                        <TableRow
                          key={project.PRJ_id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{project.PRJ_case_number}</div>
                              <div className="text-sm text-muted-foreground">
                                {project.PRJ_area_m2 ? `${project.PRJ_area_m2} m²` : 'Área no especificada'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStateColor(project.PRJ_state)} text-white`}>
                              {project.PRJ_state}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                ${(project.PRJ_budget || 0).toLocaleString()}
                              </div>
                              {project.PRJ_final_price && (
                                <div className="text-muted-foreground">
                                  Final: ${project.PRJ_final_price.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{project.PRJ_province}</div>
                              <div className="text-muted-foreground">
                                {project.PRJ_canton}, {project.PRJ_district}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/proyectos/${project.PRJ_id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Este cliente no tiene proyectos registrados
                    </p>
                    <Link href={`/proyectos/nuevo?cliente=${id}`}>
                      <Button className="mt-4" variant="outline">
                        Crear primer proyecto
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <Card className="card-hover border-[#486b00]/20 animate-slide-in-right">
              <CardHeader className="gradient-primary text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Resumen de Proyectos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#486b00]">{totalProyectos}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{proyectosActivos}</div>
                    <div className="text-sm text-muted-foreground">Activos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{proyectosCompletados}</div>
                    <div className="text-sm text-muted-foreground">Completados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#7d4427]">
                      {totalProyectos > 0 ? Math.round((proyectosCompletados / totalProyectos) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Éxito</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen Financiero */}
            <Card className="card-hover border-[#7d4427]/20 animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="text-[#7d4427] flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {projects && projects.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Valor Total Proyectos:</span>
                      <span className="font-bold text-[#486b00]">${valorTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Precio Final:</span>
                      <span className="font-bold text-green-600">${totalPagado.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Diferencia:</span>
                      <span className={`font-bold ${(totalPagado - valorTotal) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${(totalPagado - valorTotal).toLocaleString()}
                      </span>
                    </div>
                    {valorTotal > 0 && (
                      <div className="pt-2">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progreso de Precios</span>
                          <span>{Math.round((totalPagado / valorTotal) * 100)}%</span>
                        </div>
                        <Progress value={(totalPagado / valorTotal) * 100} className="h-2" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Sin proyectos para mostrar información financiera
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="card-hover border-[#c9e077]/30 animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="text-[#2e4600]">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Link href={`/proyectos/nuevo?cliente=${id}`}>
                  <Button variant="outline" className="w-full border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20">
                    <Building className="mr-2 h-4 w-4" />
                    Nuevo Proyecto
                  </Button>
                </Link>
                <Link href={`/pagos?cliente=${id}`}>
                  <Button variant="outline" className="w-full border-[#7d4427] text-[#7d4427] hover:bg-[#7d4427]/10">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Ver Pagos
                  </Button>
                </Link>
                <Link href={`/proyectos?cliente=${id}`}>
                  <Button variant="outline" className="w-full border-[#486b00] text-[#486b00] hover:bg-[#486b00]/10">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Todos los Proyectos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
