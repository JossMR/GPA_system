"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Bell,
  Search,
  ExternalLink,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPANotification } from "@/models/GPA_notification"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const tipoIcons = {
  warning: AlertTriangle,
  proyectos: FileText,
  personal: User,
}

const tipoColors = {
  warning: "bg-yellow-500",
  proyectos: "bg-blue-500",
  personal: "bg-green-500",
}

export default function AdminNotificationsPage() {
  const { isAdmin, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [notifications, setNotifications] = useState<GPANotification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todas")
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null)

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/notificaciones')
    }
  }, [isAdmin, router])

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const filteredNotifications = notifications.filter((not) => {
    const matchesSearch =
      not.NOT_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      not.NOT_description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = tipoFilter === "todas" || not.notification_type_name === tipoFilter
    
    return matchesSearch && matchesType
  })

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/notifications')
        const data = await response.json()
        const allNotifications: GPANotification[] = data.notifications
        setNotifications(allNotifications)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las notificaciones.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (isAdmin) {
      fetchNotifications()
    }
  }, [isAdmin, toast])

  const handleDeleteClick = (id: number) => {
    setNotificationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return

    try {
      const response = await fetch(`/api/notifications/${notificationToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la notificación')
      }

      setNotifications((prev) => prev.filter((not) => not.NOT_id !== notificationToDelete))
      
      toast({
        title: "Notificación eliminada",
        description: "La notificación ha sido eliminada exitosamente.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setNotificationToDelete(null)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              Administrar Notificaciones
            </h1>
            <p className="text-muted-foreground">Gestiona todas las notificaciones del sistema</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => router.push('/notificaciones')}
            className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
          >
            Volver a mis notificaciones
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-hover border-[#a2c523]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Bell className="mr-2 h-4 w-4 text-[#486b00]" />
                Total de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#486b00]">{filteredNotifications.length}</div>
            </CardContent>
          </Card>
          <Card className="card-hover border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="mr-2 h-4 w-4 text-blue-600" />
                De Proyectos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {filteredNotifications.filter(n => n.notification_type_name === "proyectos").length}
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4 text-green-600" />
                Personales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredNotifications.filter(n => n.notification_type_name === "personal").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                    placeholder="Buscar notificaciones por título o descripción..."
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
                    <SelectItem value="proyectos">Proyectos</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#486b00] mr-4" />
            <span className="text-muted-foreground">Cargando notificaciones...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNotifications.map((notification, index) => {
              const IconComponent = tipoIcons[notification.notification_type_name as keyof typeof tipoIcons]
              
              return (
                <Card
                  key={notification.NOT_id}
                  className="card-hover animate-slide-up border-[#c9e077]/20"
                  style={{ animationDelay: `${index * 0.05}s` }}
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
                            <h3 className="text-lg font-semibold text-[#2e4600]">
                              {notification.NOT_name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${tipoColors[notification.notification_type_name as keyof typeof tipoColors]} text-white border-0`}
                            >
                              {notification.notification_type_name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.NOT_description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(notification.NOT_date)}
                            </span>
                            {notification.creator_name && (
                              <span className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                {"Creada por: " + notification.creator_name}
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
                            title="Ir al proyecto"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(notification.NOT_id || 0)}
                          className="text-red-600 hover:bg-red-50"
                          title="Eliminar notificación"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                  : "No existen notificaciones en el sistema"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La notificación será eliminada permanentemente del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}