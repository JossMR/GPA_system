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
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  User,
  Calendar,
  FileText,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPANotification, getLocalMySQLDateTime } from "@/models/GPA_notification"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/components/notifications-provider"
import { toast } from "sonner"
import { useToast } from "@/hooks/use-toast"

const tipoIcons = {
  warning: AlertTriangle,
  error: X,
  proyectos: FileText,
  personal: User,
}

const tipoColors = {
  warning: "bg-yellow-500",
  error: "bg-red-500",
  proyectos: "bg-blue-500",
  personal: "bg-green-500",
}

const tipoLabels = {
  warning: "Advertencia",
  error: "Error",
  proyectos: "Proyectos",
  personal: "Personal",
}

interface UserForSelection {
  USR_id: number
  USR_name: string
  USR_f_lastname: string
  USR_s_lastname: string
  ROL_name: string
}

interface ProjectForSelection {
  PRJ_id: number
  PRJ_case_number: string
  client_name: string
  client_identification: string
}

export default function NotificationsPage() {
  const { isAdmin, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { refreshNotifications } = useNotifications()
  const [notifications, setNotifications] = useState<GPANotification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todas")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // New notification form states
  const [newNotification, setNewNotification] = useState({
    titulo: "",
    mensaje: "",
    tipo: "personal",
    fecha: "",
    hora: "",
    proyectoId: null as number | null,
  })
  const [users, setUsers] = useState<UserForSelection[]>([])
  const [projects, setProjects] = useState<ProjectForSelection[]>([])
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [projectSearchTerm, setProjectSearchTerm] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)

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

    const notificationDate = not.NOT_date ? new Date(not.NOT_date) : null
    const now = new Date()
    const isDateValid = !notificationDate || notificationDate <= now

    return matchesSearch && matchesType && isDateValid
  })

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.USR_name} ${u.USR_f_lastname} ${u.USR_s_lastname}`.toLowerCase()
    return fullName.includes(userSearchTerm.toLowerCase())
  })

  const filteredProjects = projects.filter((p) => {
    const searchLower = projectSearchTerm.toLowerCase()
    return (
      p.PRJ_case_number.toLowerCase().includes(searchLower) ||
      p.client_name.toLowerCase().includes(searchLower)
    )
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
      setLoading(false)
    }
    fetchNotifications()
  }, [user])

  useEffect(() => {
    if (isDialogOpen) {
      fetchUsers()
      fetchProjects()
      // Set current user as default selected
      if (user?.id) {
        setSelectedUsers([user.id])
      }
      // Set default date and time to now
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = now.toTimeString().slice(0, 5)
      setNewNotification(prev => ({
        ...prev,
        fecha: dateStr,
        hora: timeStr,
      }))
    } else {
      // Reset form when dialog closes
      resetForm()
    }
  }, [isDialogOpen, user])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive",
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos.",
        variant: "destructive",
      })
    } finally {
      setLoadingProjects(false)
    }
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const resetForm = () => {
    setNewNotification({
      titulo: "",
      mensaje: "",
      tipo: "personal",
      fecha: "",
      hora: "",
      proyectoId: null,
    })
    setSelectedUsers(user?.id ? [user.id] : [])
    setUserSearchTerm("")
    setProjectSearchTerm("")
  }

  const handleCreateNotification = async () => {
    // Validations
    if (!newNotification.titulo.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio.",
        variant: "destructive",
      })
      return
    }

    if (!newNotification.mensaje.trim()) {
      toast({
        title: "Error",
        description: "El mensaje es obligatorio.",
        variant: "destructive",
      })
      return
    }

    if (!newNotification.fecha || !newNotification.hora) {
      toast({
        title: "Error",
        description: "La fecha y hora son obligatorias.",
        variant: "destructive",
      })
      return
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un usuario destinatario.",
        variant: "destructive",
      })
      return
    }

    if (newNotification.tipo === "proyectos" && !newNotification.proyectoId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un proyecto para notificaciones de tipo 'Proyectos'.",
        variant: "destructive",
      })
      return
    }

    try {
      // Combine date and time
      const notificationDate = `${newNotification.fecha} ${newNotification.hora}:00`

      // Get notification type ID
      const ntpId = newNotification.tipo === "proyectos" ? 1 : 2 // Adjust according to your database

      const notificationData: GPANotification = {
        NOT_creator_user_id: user?.id || 0,
        NOT_name: newNotification.titulo,
        NOT_description: newNotification.mensaje,
        NOT_date: notificationDate,
        NOT_created_at: getLocalMySQLDateTime(),
        NTP_id: ntpId,
        PRJ_id: newNotification.proyectoId || undefined,
        destination_users_ids: selectedUsers.map(userId => [userId, false]),
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      if (!response.ok) {
        toast({
          title: "Error",
          description: "No se pudo crear la notificación.",
          variant: "destructive",
        })
        throw new Error('Error al crear la notificación')
      }

      toast({
        title: "Éxito",
        description: "Notificación creada correctamente.",
        variant: "success",
      })

      // Refresh notifications
      const refreshResponse = await fetch(`/api/notifications?user_id=${user?.id}`)
      const refreshData = await refreshResponse.json()
      setNotifications(refreshData.notifications)

      await refreshNotifications()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la notificación.",
        variant: "destructive",
      })
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const notification = notifications.find(not => not.NOT_id === id)

      if (!notification) {
        throw new Error('Notificación no encontrada')
      }

      const updatedNotification = {
        ...notification,
        destination_users_ids: notification.destination_users_ids?.map(([userId, isRead]) =>
          userId === user?.id ? [userId, true] : [userId, isRead]
        ) as [number, boolean][]
      }

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

      setNotifications((prev) =>
        prev.map((not) => not.NOT_id === id ? updatedNotification : not)
      )

      await refreshNotifications()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída.",
        variant: "destructive",
      })
    }
  }

  const deleteNotifications = (id: number) => {
    setNotifications((prev) => prev.filter((not) => not.NOT_id !== id))
  }

  const noReadCount = filteredNotifications.filter((n) =>
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
            <div className="flex flex-col gap-2">
              <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Notificación
              </Button>
              <Button
                variant="outline"
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                onClick={() => router.push('/notificaciones/administrar-notificaciones')}
              >
                Administrar notificaciones
              </Button>
            </div>
          )}
        </div>

        {/* Stadistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover border-[#a2c523]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Bell className="mr-2 h-4 w-4 text-[#486b00]" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#486b00]">{filteredNotifications.length}</div>
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
                              className={`text-lg font-semibold ${isUnread ? "text-[#2e4600]" : "text-muted-foreground"}`}
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
                              {notification.notification_type_name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.NOT_description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {"Programada para: " + formatDate(notification.NOT_date)}
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

        {/* Dialog for New Notification */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-[#2e4600]">Nueva Notificación</DialogTitle>
              <DialogDescription>Crea un recordatorio manual para el sistema</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
              <div className="grid gap-6 py-4">
                {/* Basic Information */}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      placeholder="Título de la notificación"
                      value={newNotification.titulo}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, titulo: e.target.value }))
                      }
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mensaje">Mensaje *</Label>
                    <Textarea
                      id="mensaje"
                      placeholder="Describe el recordatorio..."
                      value={newNotification.mensaje}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, mensaje: e.target.value }))
                      }
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fecha">Fecha *</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={newNotification.fecha}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, fecha: e.target.value }))
                        }
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="hora">Hora *</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={newNotification.hora}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, hora: e.target.value }))
                        }
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Tipo *</Label>
                      <Select
                        value={newNotification.tipo}
                        onValueChange={(value) => setNewNotification(prev => ({
                          ...prev,
                          tipo: value,
                          proyectoId: value !== "proyectos" ? null : prev.proyectoId
                        }))}
                      >
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proyectos">Proyectos</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Project Selection (only if tipo is "proyectos") */}
                {newNotification.tipo === "proyectos" && (
                  <div className="space-y-2">
                    <Label>Seleccionar Proyecto *</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                      <Input
                        placeholder="Buscar por número de caso o nombre del cliente..."
                        value={projectSearchTerm}
                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                        className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                    <div className="border rounded-md border-[#a2c523]/30">
                      <ScrollArea className="h-[200px]">
                        {loadingProjects ? (
                          <div className="p-4 text-center text-muted-foreground">
                            Cargando proyectos...
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Número de Caso</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Identificación</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredProjects.map((project) => (
                                <TableRow
                                  key={project.PRJ_id}
                                  className={`cursor-pointer hover:bg-[#c9e077]/10 ${newNotification.proyectoId === project.PRJ_id ? 'bg-[#c9e077]/20' : ''
                                    }`}
                                  onClick={() => setNewNotification(prev => ({
                                    ...prev,
                                    proyectoId: project.PRJ_id
                                  }))}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={newNotification.proyectoId === project.PRJ_id}
                                      onCheckedChange={() => setNewNotification(prev => ({
                                        ...prev,
                                        proyectoId: project.PRJ_id
                                      }))}
                                    />
                                  </TableCell>
                                  <TableCell>{project.PRJ_case_number}</TableCell>
                                  <TableCell>{project.client_name}</TableCell>
                                  <TableCell>{project.client_identification}</TableCell>
                                </TableRow>
                              ))}
                              {filteredProjects.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No se encontraron proyectos
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                )}

                {/* Users Selection */}
                <div className="space-y-2">
                  <Label>Usuarios Destinatarios ({selectedUsers.length} seleccionados)</Label>
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                    <Input
                      placeholder="Buscar por nombre o apellidos..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                  <div className="border rounded-md border-[#a2c523]/30">
                    <ScrollArea className="h-[250px]">
                      {loadingUsers ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Cargando usuarios...
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Primer Apellido</TableHead>
                              <TableHead>Segundo Apellido</TableHead>
                              <TableHead>Rol</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map((usr) => (
                              <TableRow
                                key={usr.USR_id}
                                className={`cursor-pointer hover:bg-[#c9e077]/10 ${selectedUsers.includes(usr.USR_id) ? 'bg-[#c9e077]/20' : ''
                                  }`}
                                onClick={() => toggleUserSelection(usr.USR_id)}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={selectedUsers.includes(usr.USR_id)}
                                    onCheckedChange={() => toggleUserSelection(usr.USR_id)}
                                  />
                                </TableCell>
                                <TableCell>{usr.USR_name}</TableCell>
                                <TableCell>{usr.USR_f_lastname}</TableCell>
                                <TableCell>{usr.USR_s_lastname}</TableCell>
                                <TableCell>{usr.ROL_name}</TableCell>
                              </TableRow>
                            ))}
                            {filteredUsers.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                  No se encontraron usuarios
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
              >
                Cancelar
              </Button>
              <Button
                className="gradient-primary text-white hover:opacity-90"
                onClick={handleCreateNotification}
              >
                Crear Notificación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
