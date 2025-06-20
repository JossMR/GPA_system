"use client"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Edit, User, Mail, Phone, Building, MapPin, Calendar, DollarSign, Eye, FileText } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

// Mock data del cliente
const mockCliente = {
  id: 1,
  nombre: "María González",
  email: "maria@email.com",
  telefono: "+1234567890",
  empresa: "Constructora ABC",
  direccion: "Av. Principal 123, Ciudad",
  fechaRegistro: "2024-01-15",
  estado: "activo",
  notas: "Cliente preferencial con múltiples proyectos. Muy puntual en pagos.",
}

// Mock proyectos del cliente
const mockProyectosCliente = [
  {
    id: 1,
    nombre: "Villa Moderna",
    estado: "en_progreso",
    progreso: 65,
    presupuesto: 150000,
    pagado: 97500,
    fechaInicio: "2024-01-15",
    fechaEntrega: "2024-06-15",
    categoria: "residencial",
  },
  {
    id: 4,
    nombre: "Casa de Campo",
    estado: "completado",
    progreso: 100,
    presupuesto: 120000,
    pagado: 120000,
    fechaInicio: "2023-08-01",
    fechaEntrega: "2024-02-01",
    categoria: "residencial",
  },
  {
    id: 5,
    nombre: "Remodelación Oficina",
    estado: "planificacion",
    progreso: 15,
    presupuesto: 80000,
    pagado: 20000,
    fechaInicio: "2024-12-01",
    fechaEntrega: "2025-04-01",
    categoria: "comercial",
  },
]

const estadoColors = {
  planificacion: "bg-yellow-500",
  en_progreso: "bg-blue-500",
  completado: "bg-green-500",
  pausado: "bg-red-500",
}

const estadoLabels = {
  planificacion: "Planificación",
  en_progreso: "En Progreso",
  completado: "Completado",
  pausado: "Pausado",
}

export default function DetalleClientePage({ params }: { params: { id: string } }) {
  const { isAdmin } = useAuth()
  const router = useRouter()

  const totalProyectos = mockProyectosCliente.length
  const proyectosActivos = mockProyectosCliente.filter((p) => p.estado === "en_progreso").length
  const proyectosCompletados = mockProyectosCliente.filter((p) => p.estado === "completado").length
  const valorTotal = mockProyectosCliente.reduce((sum, p) => sum + p.presupuesto, 0)
  const totalPagado = mockProyectosCliente.reduce((sum, p) => sum + p.pagado, 0)

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-[#c9e077]/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Clientes
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              {mockCliente.nombre}
            </h1>
            <p className="text-muted-foreground">Información completa del cliente</p>
          </div>
          {isAdmin && (
            <Link href={`/clientes/${params.id}/editar`}>
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
                        <p className="font-medium">{mockCliente.nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Correo electrónico</p>
                        <p className="font-medium">{mockCliente.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{mockCliente.telefono}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Empresa</p>
                        <p className="font-medium">{mockCliente.empresa}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Dirección</p>
                        <p className="font-medium">{mockCliente.direccion}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-[#486b00]" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha de registro</p>
                        <p className="font-medium">{mockCliente.fechaRegistro}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#c9e077]/20">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-[#486b00] mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Notas adicionales</p>
                      <p className="font-medium">{mockCliente.notas}</p>
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
                  <Link href={`/proyectos?cliente=${params.id}`}>
                    <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead>Financiero</TableHead>
                      <TableHead>Fechas</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProyectosCliente.map((proyecto, index) => (
                      <TableRow
                        key={proyecto.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{proyecto.nombre}</div>
                            <div className="text-sm text-muted-foreground capitalize">{proyecto.categoria}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${estadoColors[proyecto.estado as keyof typeof estadoColors]} text-white`}>
                            {estadoLabels[proyecto.estado as keyof typeof estadoLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={proyecto.progreso} className="w-16" />
                            <div className="text-xs text-muted-foreground">{proyecto.progreso}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <DollarSign className="mr-1 h-3 w-3" />${proyecto.presupuesto.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Pagado: ${proyecto.pagado.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Calendar className="mr-1 h-3 w-3" />
                              {proyecto.fechaInicio}
                            </div>
                            <div className="text-xs text-muted-foreground">Entrega: {proyecto.fechaEntrega}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/proyectos/${proyecto.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Estado del Cliente */}
            <Card className="card-hover border-[#c9e077]/30 animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-[#2e4600] flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Estado del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <Badge
                    className={`${mockCliente.estado === "activo" ? "bg-green-500" : "bg-gray-500"} text-white px-4 py-2`}
                  >
                    {mockCliente.estado === "activo" ? "Cliente Activo" : "Cliente Inactivo"}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Cliente desde {new Date(mockCliente.fechaRegistro).getFullYear()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card className="card-hover border-[#486b00]/20 animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
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
                      {Math.round((proyectosCompletados / totalProyectos) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Éxito</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen Financiero */}
            <Card className="card-hover border-[#7d4427]/20 animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="text-[#7d4427] flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valor Total Proyectos:</span>
                  <span className="font-bold text-[#486b00]">${valorTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Pagado:</span>
                  <span className="font-bold text-green-600">${totalPagado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Saldo Pendiente:</span>
                  <span className="font-bold text-[#7d4427]">${(valorTotal - totalPagado).toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progreso de Pagos</span>
                    <span>{Math.round((totalPagado / valorTotal) * 100)}%</span>
                  </div>
                  <Progress value={(totalPagado / valorTotal) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Acciones Rápidas */}
            <Card className="card-hover border-[#c9e077]/30 animate-slide-in-right" style={{ animationDelay: "0.6s" }}>
              <CardHeader>
                <CardTitle className="text-[#2e4600]">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Link href={`/proyectos/nuevo?cliente=${params.id}`}>
                  <Button variant="outline" className="w-full border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20">
                    <Building className="mr-2 h-4 w-4" />
                    Nuevo Proyecto
                  </Button>
                </Link>
                <Link href={`/pagos?cliente=${params.id}`}>
                  <Button variant="outline" className="w-full border-[#7d4427] text-[#7d4427] hover:bg-[#7d4427]/10">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Ver Pagos
                  </Button>
                </Link>
                <Link href={`/proyectos?cliente=${params.id}`}>
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
