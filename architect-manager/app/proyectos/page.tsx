"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Eye, Calendar, DollarSign } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

const mockProyectos = [
  {
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
  },
  {
    id: 2,
    nombre: "Oficina Corporativa",
    cliente: "Carlos Rodríguez",
    estado: "planificacion",
    progreso: 25,
    presupuesto: 300000,
    pagado: 75000,
    fechaInicio: "2024-03-01",
    fechaEntrega: "2024-12-01",
    categoria: "comercial",
  },
  {
    id: 3,
    nombre: "Casa Familiar",
    cliente: "Ana Martínez",
    estado: "completado",
    progreso: 100,
    presupuesto: 120000,
    pagado: 120000,
    fechaInicio: "2023-08-01",
    fechaEntrega: "2024-02-01",
    categoria: "residencial",
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

export default function ProyectosPage() {
  const { isAdmin } = useAuth()
  const [proyectos, setProyectos] = useState(mockProyectos)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")

  const filteredProyectos = proyectos.filter((proyecto) => {
    const matchesSearch =
      proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = estadoFilter === "todos" || proyecto.estado === estadoFilter
    return matchesSearch && matchesEstado
  })

  const handleEstadoChange = (proyectoId: number, nuevoEstado: string) => {
    setProyectos((prev) => prev.map((p) => (p.id === proyectoId ? { ...p, estado: nuevoEstado } : p)))
  }

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

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proyectos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {proyectos.filter((p) => p.estado === "en_progreso").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {proyectos.filter((p) => p.estado === "completado").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${proyectos.reduce((sum, p) => sum + p.presupuesto, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
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
                    placeholder="Buscar por nombre o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="estado">Estado</Label>
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="planificacion">Planificación</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Proyectos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Proyectos ({filteredProyectos.length})</CardTitle>
            <CardDescription>Todos los proyectos registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Financiero</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProyectos.map((proyecto) => (
                  <TableRow key={proyecto.id} className="animate-fade-in">
                    <TableCell>
                      <div>
                        <div className="font-medium">{proyecto.nombre}</div>
                        <div className="text-sm text-muted-foreground capitalize">{proyecto.categoria}</div>
                      </div>
                    </TableCell>
                    <TableCell>{proyecto.cliente}</TableCell>
                    <TableCell>
                      <Select
                        value={proyecto.estado}
                        onValueChange={(value) => handleEstadoChange(proyecto.id, value)}
                        disabled={!isAdmin}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planificacion">Planificación</SelectItem>
                          <SelectItem value="en_progreso">En Progreso</SelectItem>
                          <SelectItem value="completado">Completado</SelectItem>
                          <SelectItem value="pausado">Pausado</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <div className="text-xs text-muted-foreground">Pagado: ${proyecto.pagado.toLocaleString()}</div>
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
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/proyectos/${proyecto.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Link href={`/proyectos/${proyecto.id}/editar`}>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
