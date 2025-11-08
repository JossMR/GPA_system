"use client"

import { useEffect, useState } from "react"
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
import { GPANotification } from "@/models/GPA_notification"
import { useRouter } from "next/navigation"

const tipoIcons = {
  warning: AlertTriangle,
  error: X,
  proyectos: Info,
  success: CheckCircle,
}

const tipoColors = {
  warning: "bg-yellow-500",
  error: "bg-red-500",
  proyectos: "bg-blue-500",
  success: "bg-green-500",
}

const tipoLabels = {
  warning: "Advertencia",
  error: "Error",
  proyectos: "Información",
  success: "Éxito",
}

export default function NotificationsPage() {
  const { isAdmin, user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<GPANotification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todas")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const filteredNotifications = notifications.filter((not) => {
    const matchesSearch =
      not.NOT_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      not.NOT_description.toLowerCase().includes(searchTerm.toLowerCase())
    //const matchesTipo = tipoFilter === "todas" || not.tipo === tipoFilter
    //return matchesSearch && matchesTipo
    return matchesSearch
  })

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const response = await fetch(`/api/notifications?user_id=${user.id}`)
      const data = await response.json()
      const requestedNotifications: GPANotification[] = data.notifications
      setNotifications(requestedNotifications)
      console.log("Fetched Notifications:", notifications)
      setLoading(false)  
    }
    fetchNotifications()
  }, [])

  const markAsRead = async (id: number) => {
    try {
      // Find the notification to update
      const notification = notifications.find(not => not.NOT_id === id)
      
      if (!notification) {
        throw new Error('Notificación no encontrada')
      }

      // Actualizar el estado de lectura en destination_users_ids
      const updatedNotification = {
        ...notification,
        destination_users_ids: notification.destination_users_ids?.map(([userId, isRead]) =>
          userId === user?.id ? [userId, true] : [userId, isRead]
        ) as [number, boolean][]
      }

      console.log('Updated Notification:', updatedNotification)
      const response = await fetch(`/api/notifications/${id}?update_read=Y`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNotification)
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la notificación')
      }

      // Actualizar el estado local después de una respuesta exitosa
      setNotifications((prev) =>
        prev.map((not) => not.NOT_id === id ? updatedNotification : not)
      )
    } catch (error) {
      console.error('Error al marcar como leída:', error)
      // Aquí podrías agregar un toast o notificación de error
    }
  }

  const deleteNotifications = (id: number) => {
    setNotifications((prev) => prev.filter((not) => not.NOT_id !== id))
  }

  const noReadCount = notifications.filter((n) => 
    n.destination_users_ids?.some(([userId, isRead]) => userId === user?.id && isRead === false)
  ).length

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
              <div className="text-2xl font-bold text-[#486b00]">{notifications.length}</div>
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
              <div className="text-2xl font-bold text-yellow-600">{noReadCount}</div>
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
                <Label>Tipo</Label>
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="warning">Advertencias</SelectItem>
                    <SelectItem value="error">Errores</SelectItem>
                    <SelectItem value="proyectos">Información</SelectItem>
                    <SelectItem value="success">Éxito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificaciones */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#486b00] mr-4" />
            <span className="text-muted-foreground">Cargando notificaciones...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotifications.map((notification, index) => {
              const IconComponent = tipoIcons[notification.notification_type_name as keyof typeof tipoIcons]
              const isUnread = notification.destination_users_ids?.some(([userId, isRead]) => userId === user?.id && isRead === false)
              
              return (
                <Card
                  key={notification.NOT_id}
                  className={`card-hover animate-slide-up ${isUnread ? "border-l-4 border-l-[#a2c523] bg-[#c9e077]/5" : "border-[#c9e077]/20"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div
                          className={`p-2 rounded-full ${tipoColors[notification.notification_type_name as keyof typeof tipoColors]} text-white`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3
                              className={`font-semibold ${isUnread ? "text-[#2e4600]" : "text-muted-foreground"}`}
                            >
                              {notification.NOT_name}
                            </h3>
                            {isUnread ? (
                              <Badge className="bg-[#a2c523] text-white text-xs">Nueva</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs border-gray-300">Leído</Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs ${tipoColors[notification.notification_type_name as keyof typeof tipoColors]} text-white border-0`}
                            >
                              {tipoLabels[notification.notification_type_name as keyof typeof tipoLabels]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.NOT_description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {notification.NOT_date?.toLocaleString()}
                            </span>
                            {notification.PRJ_id && (
                              <span className="flex items-center">
                                <FileText className="mr-1 h-3 w-3" />
                                {notification.PRJ_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.notification_type_name === "proyectos" && notification.PRJ_id && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#486b00] hover:bg-[#c9e077]/20"
                            onClick={() => router.push(`/proyectos/${notification.PRJ_id}/editar`)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.NOT_id || 0)}
                            className="text-green-600 hover:bg-green-50"
                            title="Marcar como leída"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        {filteredNotifications.length === 0 && !loading && (
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
                <Label>Tipo</Label>
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
