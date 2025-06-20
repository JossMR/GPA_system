"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Bell,
  Plus,
  Search,
  Check,
  X,
  ExternalLink,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  FileText,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const mockNotificaciones = [
  {
    id: 1,
    titulo: "Pago pendiente - Villa Moderna",
    mensaje: "El cliente María González tiene un pago pendiente de $25,000 con vencimiento mañana",
    tipo: "warning",
    fecha: "2024-12-13",
    leida: false,
    proyecto: "Villa Moderna",
    accion: "ir_proyecto",
  },
  {
    id: 2,
    titulo: "Documentos faltantes - Casa Familiar",
    mensaje: "Faltan permisos de construcción para continuar con el proyecto",
    tipo: "error",
    fecha: "2024-12-12",
    leida: false,
    proyecto: "Casa Familiar",
    accion: "ir_proyecto",
  },
  {
    id: 3,
    titulo: "Reunión programada",
    mensaje: "Reunión con Carlos Rodríguez mañana a las 10:00 AM para revisar planos",
    tipo: "info",
    fecha: "2024-12-13",
    leida: true,
    proyecto: "Oficina Corporativa",
    accion: "marcar_calendario",
  },
  {
    id: 4,
    titulo: "Proyecto completado",
    mensaje: "El proyecto Residencia Ecológica ha sido marcado como completado",
    tipo: "success",
    fecha: "2024-12-11",
    leida: true,
    proyecto: "Residencia Ecológica",
    accion: "ver_reporte",
  },
  {
    id: 5,
    titulo: "Nuevo cliente registrado",
    mensaje: "Se ha registrado un nuevo cliente: Laura Fernández",
    tipo: "info",
    fecha: "2024-12-10",
    leida: true,
    proyecto: null,
    accion: "ver_cliente",
  },
]

const tipoIcons = {
  warning: AlertTriangle,
  error: X,
  info: Info,
  success: CheckCircle,
}

const tipoColors = {
  warning: "bg-yellow-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  success: "bg-green-500",
}

const tipoLabels = {
  warning: "Advertencia",
  error: "Error",
  info: "Información",
  success: "Éxito",
}

export default function NotificacionesPage() {
  const { isAdmin } = useAuth()
  const [notificaciones, setNotificaciones] = useState(mockNotificaciones)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todas")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredNotificaciones = notificaciones.filter((notif) => {
    const matchesSearch =
      notif.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.mensaje.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = tipoFilter === "todas" || notif.tipo === tipoFilter
    return matchesSearch && matchesTipo
  })

  const marcarComoLeida = (id: number) => {
    setNotificaciones((prev) => prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif)))
  }

  const eliminarNotificacion = (id: number) => {
    setNotificaciones((prev) => prev.filter((notif) => notif.id !== id))
  }

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              Notificaciones
            </h1>
            <p className="text-muted-foreground">Gestiona tus recordatorios y alertas del sistema</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary text-white hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Notificación
            </Button>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover border-[#a2c523]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Bell className="mr-2 h-4 w-4 text-[#486b00]" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#486b00]">{notificaciones.length}</div>
            </CardContent>
          </Card>
          <Card className="card-hover border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                No Leídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{noLeidasCount}</div>
            </CardContent>
          </Card>
          <Card className="card-hover border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <X className="mr-2 h-4 w-4 text-red-600" />
                Urgentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {notificaciones.filter((n) => n.tipo === "error").length}
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {notificaciones.filter((n) => n.tipo === "success").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-[#c9e077]/30">
          <CardHeader>
            <CardTitle className="text-[#2e4600]">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                  <Input
                    id="search"
                    placeholder="Buscar notificaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="warning">Advertencias</SelectItem>
                    <SelectItem value="error">Errores</SelectItem>
                    <SelectItem value="info">Información</SelectItem>
                    <SelectItem value="success">Éxito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificaciones */}
        <div className="space-y-4">
          {filteredNotificaciones.map((notificacion, index) => {
            const IconComponent = tipoIcons[notificacion.tipo as keyof typeof tipoIcons]
            return (
              <Card
                key={notificacion.id}
                className={`card-hover animate-slide-up ${
                  !notificacion.leida ? "border-l-4 border-l-[#a2c523] bg-[#c9e077]/5" : "border-[#c9e077]/20"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div
                        className={`p-2 rounded-full ${tipoColors[notificacion.tipo as keyof typeof tipoColors]} text-white`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3
                            className={`font-semibold ${!notificacion.leida ? "text-[#2e4600]" : "text-muted-foreground"}`}
                          >
                            {notificacion.titulo}
                          </h3>
                          {!notificacion.leida && <Badge className="bg-[#a2c523] text-white text-xs">Nueva</Badge>}
                          <Badge
                            variant="outline"
                            className={`text-xs ${tipoColors[notificacion.tipo as keyof typeof tipoColors]} text-white border-0`}
                          >
                            {tipoLabels[notificacion.tipo as keyof typeof tipoLabels]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notificacion.mensaje}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {notificacion.fecha}
                          </span>
                          {notificacion.proyecto && (
                            <span className="flex items-center">
                              <FileText className="mr-1 h-3 w-3" />
                              {notificacion.proyecto}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notificacion.accion === "ir_proyecto" && (
                        <Button variant="ghost" size="sm" className="text-[#486b00] hover:bg-[#c9e077]/20">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {!notificacion.leida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => marcarComoLeida(notificacion.id)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarNotificacion(notificacion.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredNotificaciones.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground">
                {searchTerm || tipoFilter !== "todas"
                  ? "No se encontraron notificaciones con los filtros aplicados"
                  : "Todas las notificaciones están al día"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dialog para Nueva Notificación */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#2e4600]">Nueva Notificación</DialogTitle>
              <DialogDescription>Crea un recordatorio manual para el sistema</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  placeholder="Título de la notificación"
                  className="border-[#a2c523]/30 focus:border-[#486b00]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mensaje">Mensaje</Label>
                <Textarea
                  id="mensaje"
                  placeholder="Describe el recordatorio..."
                  className="border-[#a2c523]/30 focus:border-[#486b00]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select defaultValue="info">
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Información</SelectItem>
                    <SelectItem value="warning">Advertencia</SelectItem>
                    <SelectItem value="error">Urgente</SelectItem>
                    <SelectItem value="success">Éxito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
              >
                Cancelar
              </Button>
              <Button className="gradient-primary text-white hover:opacity-90" onClick={() => setIsDialogOpen(false)}>
                Crear Notificación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
