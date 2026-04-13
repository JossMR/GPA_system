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
  Pencil,
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

type UserOrderBy = 'name' | 'firstLastName' | 'secondLastName' | 'email' | 'role'
type ProjectOrderBy =
  | 'PRJ_case_number'
  | 'client_name'
  | 'type_name'
  | 'PRJ_state'
  | 'PRJ_start_construction_date'
  | 'PRJ_completion_date'
type ProjectOrderDir = 'ASC' | 'DESC'
type NotificationOrderBy = 'name' | 'scheduledDate' | 'status'

export default function NotificationsPage() {
  const { isAdmin, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { refreshNotifications } = useNotifications()
  const [notificationsForMe, setNotificationsForMe] = useState<GPANotification[]>([])
  const [notificationsCreatedByMe, setNotificationsCreatedByMe] = useState<GPANotification[]>([])

  const [forMeSearchTerm, setForMeSearchTerm] = useState("")
  const [forMeAppliedSearchTerm, setForMeAppliedSearchTerm] = useState("")
  const [forMeTipoFilter, setForMeTipoFilter] = useState("todas")
  const [forMeOrderBy, setForMeOrderBy] = useState<NotificationOrderBy>('status')
  const [forMePage, setForMePage] = useState(1)
  const [forMeTotalPages, setForMeTotalPages] = useState(0)
  const [forMeTotalNotifications, setForMeTotalNotifications] = useState(0)
  const [loadingForMe, setLoadingForMe] = useState(true)

  const [createdSearchTerm, setCreatedSearchTerm] = useState("")
  const [createdAppliedSearchTerm, setCreatedAppliedSearchTerm] = useState("")
  const [createdTipoFilter, setCreatedTipoFilter] = useState("todas")
  const [createdOrderBy, setCreatedOrderBy] = useState<NotificationOrderBy>('status')
  const [createdPage, setCreatedPage] = useState(1)
  const [createdTotalPages, setCreatedTotalPages] = useState(0)
  const [createdTotalNotifications, setCreatedTotalNotifications] = useState(0)
  const [loadingCreatedByMe, setLoadingCreatedByMe] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<GPANotification | null>(null)
  const [editNotificationForm, setEditNotificationForm] = useState({
    titulo: "",
    mensaje: "",
    tipo: "personal",
    fecha: "",
    hora: "",
    proyectoId: null as number | null,
  })

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
  const [selectedEditUsers, setSelectedEditUsers] = useState<number[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [appliedUserSearchTerm, setAppliedUserSearchTerm] = useState("")
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(0)
  const [userTotalUsers, setUserTotalUsers] = useState(0)
  const [userOrderBy, setUserOrderBy] = useState<UserOrderBy>('name')
  const [projectSearchTerm, setProjectSearchTerm] = useState("")
  const [appliedProjectSearchTerm, setAppliedProjectSearchTerm] = useState("")
  const [projectPage, setProjectPage] = useState(1)
  const [projectTotalPages, setProjectTotalPages] = useState(0)
  const [projectTotalProjects, setProjectTotalProjects] = useState(0)
  const [projectOrderBy, setProjectOrderBy] = useState<ProjectOrderBy>('PRJ_case_number')
  const [projectOrderDir, setProjectOrderDir] = useState<ProjectOrderDir>('ASC')
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

  const toDateInputValue = (date: string | Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const toTimeInputValue = (date: string | Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const isFutureNotification = (date: string | Date | undefined) => {
    if (!date) return false
    return new Date(date).getTime() > Date.now()
  }

  const toMySQLDateTime = (date: string | Date | undefined | null) => {
    if (!date) return null
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return null

    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    const hours = String(parsed.getHours()).padStart(2, '0')
    const minutes = String(parsed.getMinutes()).padStart(2, '0')
    const seconds = String(parsed.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const fetchNotificationsForMe = async (
    targetPage: number,
    targetSearch: string,
    targetType: string,
    targetOrderBy: NotificationOrderBy,
  ) => {
    if (!user?.id) return
    setLoadingForMe(true)
    try {
      const params = new URLSearchParams({
        scope: 'received',
        user_id: String(user.id),
        page: String(targetPage),
        limit: '8',
        search: targetSearch,
        type: targetType,
        orderBy: targetOrderBy,
        orderDir: targetOrderBy === 'scheduledDate' ? 'DESC' : 'ASC',
      })
      const response = await fetch(`/api/notifications?${params.toString()}`)
      const data = await response.json()
      setNotificationsForMe(data.notifications || [])
      setForMeTotalNotifications(data.totalNotifications || 0)
      setForMeTotalPages(data.totalPages || 0)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar tus notificaciones.",
        variant: "destructive",
      })
    } finally {
      setLoadingForMe(false)
    }
  }

  const fetchNotificationsCreatedByMe = async (
    targetPage: number,
    targetSearch: string,
    targetType: string,
    targetOrderBy: NotificationOrderBy,
  ) => {
    if (!user?.id) return
    setLoadingCreatedByMe(true)
    try {
      const params = new URLSearchParams({
        scope: 'created',
        creator_user_id: String(user.id),
        page: String(targetPage),
        limit: '8',
        search: targetSearch,
        type: targetType,
        orderBy: targetOrderBy,
        orderDir: targetOrderBy === 'scheduledDate' ? 'DESC' : 'ASC',
      })
      const response = await fetch(`/api/notifications?${params.toString()}`)
      const data = await response.json()
      setNotificationsCreatedByMe(data.notifications || [])
      setCreatedTotalNotifications(data.totalNotifications || 0)
      setCreatedTotalPages(data.totalPages || 0)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones creadas por ti.",
        variant: "destructive",
      })
    } finally {
      setLoadingCreatedByMe(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    fetchNotificationsForMe(forMePage, forMeAppliedSearchTerm, forMeTipoFilter, forMeOrderBy)
  }, [user, forMePage, forMeAppliedSearchTerm, forMeTipoFilter, forMeOrderBy])

  useEffect(() => {
    if (!user?.id) return
    fetchNotificationsCreatedByMe(createdPage, createdAppliedSearchTerm, createdTipoFilter, createdOrderBy)
  }, [user, createdPage, createdAppliedSearchTerm, createdTipoFilter, createdOrderBy])

  useEffect(() => {
    if (isDialogOpen) {
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

  useEffect(() => {
    if (isDialogOpen) {
      fetchUsers(userPage, appliedUserSearchTerm, userOrderBy)
    }
  }, [isDialogOpen, userPage, appliedUserSearchTerm, userOrderBy])

  useEffect(() => {
    if (isEditDialogOpen) {
      fetchUsers(userPage, appliedUserSearchTerm, userOrderBy)
    }
  }, [isEditDialogOpen, userPage, appliedUserSearchTerm, userOrderBy])

  useEffect(() => {
    if (isDialogOpen && newNotification.tipo === 'proyectos') {
      fetchProjects(projectPage, appliedProjectSearchTerm, projectOrderBy, projectOrderDir)
    }
  }, [
    isDialogOpen,
    newNotification.tipo,
    projectPage,
    appliedProjectSearchTerm,
    projectOrderBy,
    projectOrderDir,
  ])

  useEffect(() => {
    if (isEditDialogOpen && editNotificationForm.tipo === 'proyectos') {
      fetchProjects(1, '', 'PRJ_case_number', 'ASC')
    }
  }, [isEditDialogOpen, editNotificationForm.tipo])

  const fetchUsers = async (page: number, search: string, orderBy: UserOrderBy = 'name') => {
    setLoadingUsers(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        search,
        orderBy,
        orderDir: 'ASC',
      })
      const response = await fetch(`/api/users?${params.toString()}`)
      const data = await response.json()
      setUsers(data.users || [])
      setUserTotalPages(data.totalPages || 0)
      setUserTotalUsers(data.totalUsers || 0)
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

  const fetchProjects = async (
    page: number,
    search: string,
    orderBy: ProjectOrderBy = 'PRJ_case_number',
    orderDir: ProjectOrderDir = 'ASC'
  ) => {
    setLoadingProjects(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        search,
        orderBy,
        orderDir,
      })
      const response = await fetch(`/api/projects?${params.toString()}`)
      const data = await response.json()
      setProjects(data.projects || [])
      setProjectTotalPages(data.totalPages || 0)
      setProjectTotalProjects(data.totalProjects || 0)
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

  const handleApplyProjectFilters = async () => {
    const nextSearch = projectSearchTerm.trim()
    if (projectPage === 1 && appliedProjectSearchTerm === nextSearch) {
      await fetchProjects(1, nextSearch, projectOrderBy, projectOrderDir)
      return
    }
    setProjectPage(1)
    setAppliedProjectSearchTerm(nextSearch)
  }

  const handleClearProjectFilters = async () => {
    if (
      !projectSearchTerm
      && !appliedProjectSearchTerm
      && projectPage === 1
      && projectOrderBy === 'PRJ_case_number'
      && projectOrderDir === 'ASC'
    ) {
      await fetchProjects(1, '', 'PRJ_case_number', 'ASC')
      return
    }
    setProjectSearchTerm('')
    setAppliedProjectSearchTerm('')
    setProjectPage(1)
    setProjectOrderBy('PRJ_case_number')
    setProjectOrderDir('ASC')
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers([userId])
  }

  const toggleEditUserSelection = (userId: number) => {
    setSelectedEditUsers([userId])
  }

  const handleApplyUserFilters = async () => {
    const nextSearch = userSearchTerm.trim()
    if (userPage === 1 && appliedUserSearchTerm === nextSearch) {
      await fetchUsers(1, nextSearch, userOrderBy)
      return
    }
    setUserPage(1)
    setAppliedUserSearchTerm(nextSearch)
  }

  const handleClearUserFilters = async () => {
    if (!userSearchTerm && !appliedUserSearchTerm && userPage === 1 && userOrderBy === 'name') {
      await fetchUsers(1, '', 'name')
      return
    }
    setUserSearchTerm('')
    setAppliedUserSearchTerm('')
    setUserPage(1)
    setUserOrderBy('name')
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
    setAppliedUserSearchTerm("")
    setUserPage(1)
    setUserOrderBy('name')
    setProjectSearchTerm("")
    setAppliedProjectSearchTerm("")
    setProjectPage(1)
    setProjectOrderBy('PRJ_case_number')
    setProjectOrderDir('ASC')
  }

  const handleApplyForMeFilters = async () => {
    const nextSearch = forMeSearchTerm.trim()
    if (forMePage === 1 && forMeAppliedSearchTerm === nextSearch) {
      await fetchNotificationsForMe(1, nextSearch, forMeTipoFilter, forMeOrderBy)
      return
    }
    setForMePage(1)
    setForMeAppliedSearchTerm(nextSearch)
  }

  const handleClearForMeFilters = async () => {
    if (!forMeSearchTerm && !forMeAppliedSearchTerm && forMePage === 1 && forMeTipoFilter === 'todas' && forMeOrderBy === 'status') {
      await fetchNotificationsForMe(1, '', 'todas', 'status')
      return
    }
    setForMeSearchTerm('')
    setForMeAppliedSearchTerm('')
    setForMePage(1)
    setForMeTipoFilter('todas')
    setForMeOrderBy('status')
  }

  const handleApplyCreatedFilters = async () => {
    const nextSearch = createdSearchTerm.trim()
    if (createdPage === 1 && createdAppliedSearchTerm === nextSearch) {
      await fetchNotificationsCreatedByMe(1, nextSearch, createdTipoFilter, createdOrderBy)
      return
    }
    setCreatedPage(1)
    setCreatedAppliedSearchTerm(nextSearch)
  }

  const handleClearCreatedFilters = async () => {
    if (!createdSearchTerm && !createdAppliedSearchTerm && createdPage === 1 && createdTipoFilter === 'todas' && createdOrderBy === 'status') {
      await fetchNotificationsCreatedByMe(1, '', 'todas', 'status')
      return
    }
    setCreatedSearchTerm('')
    setCreatedAppliedSearchTerm('')
    setCreatedPage(1)
    setCreatedTipoFilter('todas')
    setCreatedOrderBy('status')
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

    if (selectedUsers.length !== 1) {
      toast({
        title: "Error",
        description: "Debe seleccionar un unico usuario destinatario.",
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

      await fetchNotificationsForMe(forMePage, forMeAppliedSearchTerm, forMeTipoFilter, forMeOrderBy)
      await fetchNotificationsCreatedByMe(createdPage, createdAppliedSearchTerm, createdTipoFilter, createdOrderBy)

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
      const notification = notificationsForMe.find(not => not.NOT_id === id)

      if (!notification) {
        throw new Error('Notificación no encontrada')
      }

      if (isFutureNotification(notification.NOT_date)) {
        toast({
          title: "No disponible",
          description: "Esta notificación es futura y aún no se puede marcar como leída.",
          variant: "destructive",
        })
        return
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

      setNotificationsForMe((prev) =>
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

  const handleOpenEditDialog = (notification: GPANotification) => {
    const existingUserIds = notification.destination_users_ids?.map(([id]) => id) || []

    setEditingNotification(notification)
    setEditNotificationForm({
      titulo: notification.NOT_name || "",
      mensaje: notification.NOT_description || "",
      tipo: notification.notification_type_name === "proyectos" ? "proyectos" : "personal",
      fecha: toDateInputValue(notification.NOT_date),
      hora: toTimeInputValue(notification.NOT_date),
      proyectoId: notification.PRJ_id || null,
    })
    setSelectedEditUsers(existingUserIds.length ? [existingUserIds[0]] : (user?.id ? [user.id] : []))
    setIsEditDialogOpen(true)
  }

  const handleUpdateNotification = async () => {
    if (!editingNotification?.NOT_id) return

    if (!editNotificationForm.titulo.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio.",
        variant: "destructive",
      })
      return
    }

    if (!editNotificationForm.mensaje.trim()) {
      toast({
        title: "Error",
        description: "El mensaje es obligatorio.",
        variant: "destructive",
      })
      return
    }

    if (!editNotificationForm.fecha || !editNotificationForm.hora) {
      toast({
        title: "Error",
        description: "La fecha y hora son obligatorias.",
        variant: "destructive",
      })
      return
    }

    if (editNotificationForm.tipo === "proyectos" && !editNotificationForm.proyectoId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un proyecto para notificaciones de tipo 'Proyectos'.",
        variant: "destructive",
      })
      return
    }

    if (selectedEditUsers.length !== 1) {
      toast({
        title: "Error",
        description: "Debe seleccionar un unico usuario destinatario.",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedDate = `${editNotificationForm.fecha} ${editNotificationForm.hora}:00`
      const ntpId = editNotificationForm.tipo === "proyectos" ? 1 : 2

      const payload: GPANotification = {
        ...editingNotification,
        NOT_name: editNotificationForm.titulo,
        NOT_description: editNotificationForm.mensaje,
        NOT_created_at: toMySQLDateTime(editingNotification.NOT_created_at),
        NOT_date: updatedDate,
        PRJ_id: editNotificationForm.tipo === "proyectos" ? (editNotificationForm.proyectoId || null) : null,
        NTP_id: ntpId,
        destination_users_ids: selectedEditUsers.map((userId) => {
          const existingDestination = editingNotification.destination_users_ids?.find(([existingId]) => existingId === userId)
          return [userId, existingDestination ? existingDestination[1] : false]
        }),
      }

      const response = await fetch(`/api/notifications/${editingNotification.NOT_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la notificación')
      }

      toast({
        title: "Éxito",
        description: "Notificación actualizada correctamente.",
        variant: "success",
      })

      await fetchNotificationsForMe(forMePage, forMeAppliedSearchTerm, forMeTipoFilter, forMeOrderBy)
      await fetchNotificationsCreatedByMe(createdPage, createdAppliedSearchTerm, createdTipoFilter, createdOrderBy)
      await refreshNotifications()

      setIsEditDialogOpen(false)
      setEditingNotification(null)
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar la notificación.",
        variant: "destructive",
      })
    }
  }

  const noReadCount = notificationsForMe.filter((n) => {
    const isUnread = n.destination_users_ids?.some(([userId, isRead]) => userId === user?.id && isRead === false)
    const isFuture = isFutureNotification(n.NOT_date)
    return Boolean(isUnread && !isFuture)
  }).length

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover border-[#a2c523]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Bell className="mr-2 h-4 w-4 text-[#486b00]" />
                Para Mí
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#486b00]">{forMeTotalNotifications}</div>
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
          <Card className="card-hover border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="mr-2 h-4 w-4 text-blue-600" />
                Creadas Por Mí
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{createdTotalNotifications}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#c9e077]/30">
          <CardHeader>
            <CardTitle className="text-[#2e4600]">Notificaciones Para Mí</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <Label>Buscar</Label>
                <Input
                  placeholder="Buscar por título o descripción..."
                  value={forMeSearchTerm}
                  onChange={(e) => setForMeSearchTerm(e.target.value)}
                  className="border-[#a2c523]/30 focus:border-[#486b00]"
                />
              </div>
              <div className="md:col-span-3">
                <Label>Tipo</Label>
                <Select value={forMeTipoFilter} onValueChange={(value) => { setForMeTipoFilter(value); setForMePage(1) }}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="proyectos">Proyectos</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Ordenar por</Label>
                <Select value={forMeOrderBy} onValueChange={(value) => { setForMeOrderBy(value as NotificationOrderBy); setForMePage(1) }}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="scheduledDate">Fecha programada</SelectItem>
                    <SelectItem value="status">Estado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <Button variant="secondary" className="btn-secondary" size="sm" onClick={handleApplyForMeFilters}>Filtrar</Button>
                <Button variant="ghost" size="sm" onClick={handleClearForMeFilters}>Limpiar</Button>
              </div>
            </div>

            {loadingForMe ? (
              <div className="text-center py-6 text-muted-foreground">Cargando notificaciones...</div>
            ) : notificationsForMe.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No se encontraron notificaciones para ti</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notificationsForMe.map((notification, index) => {
                  const isUnread = notification.destination_users_ids?.some(([userId, isRead]) => userId === user?.id && isRead === false)
                  const isFuture = isFutureNotification(notification.NOT_date)
                  const isActiveUnread = Boolean(isUnread && !isFuture)
                  return (
                    <Card
                      key={notification.NOT_id}
                      className={`card-hover animate-slide-up ${isActiveUnread ? "border-l-4 border-l-[#a2c523] bg-[#c9e077]/5" : "border-[#c9e077]/20"}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className={`text-lg font-semibold ${isActiveUnread ? "text-[#2e4600]" : "text-muted-foreground"}`}>
                                {notification.NOT_name}
                              </h3>
                              {isFuture ? (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs border-blue-200">Futura</Badge>
                              ) : isUnread ? (
                                <Badge className="bg-[#a2c523] text-white text-xs">Nueva</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs border-gray-300">Leído</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.NOT_description}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {"Programada para: " + formatDate(notification.NOT_date)}
                              </span>
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
                            {isActiveUnread && (
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

            {forMeTotalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setForMePage((prev) => Math.max(1, prev - 1))} disabled={forMePage === 1}>Anterior</Button>
                {Array.from({ length: forMeTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Button key={pageNumber} variant={pageNumber === forMePage ? "secondary" : "outline"} size="sm" onClick={() => setForMePage(pageNumber)}>
                    {pageNumber}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setForMePage((prev) => Math.min(forMeTotalPages, prev + 1))} disabled={forMePage === forMeTotalPages}>Siguiente</Button>
              </div>
            )}
            <div className="text-center text-xs text-muted-foreground">Mostrando {notificationsForMe.length} de {forMeTotalNotifications} notificaciones</div>
          </CardContent>
        </Card>

        <Card className="border-[#c9e077]/30">
          <CardHeader>
            <CardTitle className="text-[#2e4600]">Notificaciones Creadas Por Mí</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <Label>Buscar</Label>
                <Input
                  placeholder="Buscar por título o descripción..."
                  value={createdSearchTerm}
                  onChange={(e) => setCreatedSearchTerm(e.target.value)}
                  className="border-[#a2c523]/30 focus:border-[#486b00]"
                />
              </div>
              <div className="md:col-span-3">
                <Label>Tipo</Label>
                <Select value={createdTipoFilter} onValueChange={(value) => { setCreatedTipoFilter(value); setCreatedPage(1) }}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="proyectos">Proyectos</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Ordenar por</Label>
                <Select value={createdOrderBy} onValueChange={(value) => { setCreatedOrderBy(value as NotificationOrderBy); setCreatedPage(1) }}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="scheduledDate">Fecha programada</SelectItem>
                    <SelectItem value="status">Estado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <Button variant="secondary" className="btn-secondary" size="sm" onClick={handleApplyCreatedFilters}>Filtrar</Button>
                <Button variant="ghost" size="sm" onClick={handleClearCreatedFilters}>Limpiar</Button>
              </div>
            </div>

            {loadingCreatedByMe ? (
              <div className="text-center py-6 text-muted-foreground">Cargando notificaciones...</div>
            ) : notificationsCreatedByMe.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No has creado notificaciones con esos filtros</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notificationsCreatedByMe.map((notification, index) => (
                  <Card key={notification.NOT_id} className="card-hover animate-slide-up border-[#c9e077]/20" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-[#2e4600]">{notification.NOT_name}</h3>
                            <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs border-gray-300">
                              {(notification as any).notification_status === 'unread' ? 'No leída' : 'Leída'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.NOT_description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {"Programada para: " + formatDate(notification.NOT_date)}
                            </span>
                          </div>
                        </div>
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
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => handleOpenEditDialog(notification)}
                          title="Editar notificación"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {createdTotalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setCreatedPage((prev) => Math.max(1, prev - 1))} disabled={createdPage === 1}>Anterior</Button>
                {Array.from({ length: createdTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Button key={pageNumber} variant={pageNumber === createdPage ? "secondary" : "outline"} size="sm" onClick={() => setCreatedPage(pageNumber)}>
                    {pageNumber}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setCreatedPage((prev) => Math.min(createdTotalPages, prev + 1))} disabled={createdPage === createdTotalPages}>Siguiente</Button>
              </div>
            )}
            <div className="text-center text-xs text-muted-foreground">Mostrando {notificationsCreatedByMe.length} de {createdTotalNotifications} notificaciones</div>
          </CardContent>
        </Card>

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
                    <div className="grid gap-3 md:grid-cols-12 mb-2">
                      <div className="md:col-span-6">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                          <Input
                            placeholder="Buscar por caso, cliente o tipo..."
                            value={projectSearchTerm}
                            onChange={(e) => setProjectSearchTerm(e.target.value)}
                            className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="secondary" className="btn-secondary" size="sm" onClick={handleApplyProjectFilters}>
                            Filtrar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearProjectFilters}
                            disabled={
                              !projectSearchTerm
                              && !appliedProjectSearchTerm
                              && projectPage === 1
                              && projectOrderBy === 'PRJ_case_number'
                              && projectOrderDir === 'ASC'
                            }
                          >
                            Limpiar
                          </Button>
                        </div>
                      </div>
                      <div className="md:col-span-4">
                        <Label className="mb-2 block">Ordenar por</Label>
                        <Select value={projectOrderBy} onValueChange={(value) => setProjectOrderBy(value as ProjectOrderBy)}>
                          <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRJ_case_number">Número de caso</SelectItem>
                            <SelectItem value="client_name">Nombre de cliente</SelectItem>
                            <SelectItem value="type_name">Tipo</SelectItem>
                            <SelectItem value="PRJ_state">Estado</SelectItem>
                            <SelectItem value="PRJ_start_construction_date">Fecha de inicio</SelectItem>
                            <SelectItem value="PRJ_completion_date">Fecha de conclusión</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="mb-2 block">Dirección</Label>
                        <Select value={projectOrderDir} onValueChange={(value) => setProjectOrderDir(value as ProjectOrderDir)}>
                          <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DESC">Descendente</SelectItem>
                            <SelectItem value="ASC">Ascendente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                              {projects.map((project) => (
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
                              {projects.length === 0 && (
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
                    {projectTotalPages > 1 && (
                      <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectPage((prev) => Math.max(1, prev - 1))}
                          disabled={projectPage === 1}
                        >
                          Anterior
                        </Button>

                        {Array.from({ length: projectTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                          <Button
                            key={pageNumber}
                            variant={pageNumber === projectPage ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setProjectPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectPage((prev) => Math.min(projectTotalPages, prev + 1))}
                          disabled={projectPage === projectTotalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}
                    <div className="text-center text-xs text-muted-foreground">
                      Mostrando {projects.length} de {projectTotalProjects} proyectos
                    </div>
                  </div>
                )}

                {/* Users Selection */}
                <div className="space-y-2">
                  <Label>Usuario Destinatario ({selectedUsers.length} seleccionado)</Label>
                  <div className="grid gap-3 md:grid-cols-12 mb-2">
                    <div className="md:col-span-7">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                        <Input
                          placeholder="Buscar por nombre, apellidos o correo..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="secondary" className="btn-secondary" size="sm" onClick={handleApplyUserFilters}>
                          Filtrar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearUserFilters}
                          disabled={!userSearchTerm && !appliedUserSearchTerm && userPage === 1 && userOrderBy === 'name'}
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                    <div className="md:col-span-5">
                      <Label className="mb-2 block">Ordenar por</Label>
                      <Select value={userOrderBy} onValueChange={(value) => setUserOrderBy(value as UserOrderBy)}>
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Nombre</SelectItem>
                          <SelectItem value="firstLastName">Primer apellido</SelectItem>
                          <SelectItem value="secondLastName">Segundo apellido</SelectItem>
                          <SelectItem value="email">Correo</SelectItem>
                          <SelectItem value="role">Rol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                            {users.map((usr) => (
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
                            {users.length === 0 && (
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
                  {userTotalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                        disabled={userPage === 1}
                      >
                        Anterior
                      </Button>

                      {Array.from({ length: userTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === userPage ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setUserPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPage((prev) => Math.min(userTotalPages, prev + 1))}
                        disabled={userPage === userTotalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                  <div className="text-center text-xs text-muted-foreground">
                    Mostrando {users.length} de {userTotalUsers} usuarios
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

        {/* Dialog for Edit Notification */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-[#2e4600]">Editar Notificación</DialogTitle>
              <DialogDescription>Actualiza los datos de la notificación creada por ti</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
              <div className="grid gap-6 py-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-titulo">Título *</Label>
                    <Input
                      id="edit-titulo"
                      placeholder="Título de la notificación"
                      value={editNotificationForm.titulo}
                      onChange={(e) => setEditNotificationForm((prev) => ({ ...prev, titulo: e.target.value }))}
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-mensaje">Mensaje *</Label>
                    <Textarea
                      id="edit-mensaje"
                      placeholder="Describe el recordatorio..."
                      value={editNotificationForm.mensaje}
                      onChange={(e) => setEditNotificationForm((prev) => ({ ...prev, mensaje: e.target.value }))}
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-fecha">Fecha *</Label>
                      <Input
                        id="edit-fecha"
                        type="date"
                        value={editNotificationForm.fecha}
                        onChange={(e) => setEditNotificationForm((prev) => ({ ...prev, fecha: e.target.value }))}
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-hora">Hora *</Label>
                      <Input
                        id="edit-hora"
                        type="time"
                        value={editNotificationForm.hora}
                        onChange={(e) => setEditNotificationForm((prev) => ({ ...prev, hora: e.target.value }))}
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Tipo *</Label>
                      <Select
                        value={editNotificationForm.tipo}
                        onValueChange={(value) => setEditNotificationForm((prev) => ({
                          ...prev,
                          tipo: value,
                          proyectoId: value !== "proyectos" ? null : prev.proyectoId,
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

                {editNotificationForm.tipo === "proyectos" && (
                  <div className="space-y-2">
                    <Label>Seleccionar Proyecto *</Label>
                    <div className="grid gap-3 md:grid-cols-12 mb-2">
                      <div className="md:col-span-6">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                          <Input
                            placeholder="Buscar por caso, cliente o tipo..."
                            value={projectSearchTerm}
                            onChange={(e) => setProjectSearchTerm(e.target.value)}
                            className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="secondary" className="btn-secondary" size="sm" onClick={handleApplyProjectFilters}>
                            Filtrar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearProjectFilters}
                            disabled={
                              !projectSearchTerm
                              && !appliedProjectSearchTerm
                              && projectPage === 1
                              && projectOrderBy === 'PRJ_case_number'
                              && projectOrderDir === 'ASC'
                            }
                          >
                            Limpiar
                          </Button>
                        </div>
                      </div>
                      <div className="md:col-span-4">
                        <Label className="mb-2 block">Ordenar por</Label>
                        <Select value={projectOrderBy} onValueChange={(value) => setProjectOrderBy(value as ProjectOrderBy)}>
                          <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRJ_case_number">Número de caso</SelectItem>
                            <SelectItem value="client_name">Nombre de cliente</SelectItem>
                            <SelectItem value="type_name">Tipo</SelectItem>
                            <SelectItem value="PRJ_state">Estado</SelectItem>
                            <SelectItem value="PRJ_start_construction_date">Fecha de inicio</SelectItem>
                            <SelectItem value="PRJ_completion_date">Fecha de conclusión</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="mb-2 block">Dirección</Label>
                        <Select value={projectOrderDir} onValueChange={(value) => setProjectOrderDir(value as ProjectOrderDir)}>
                          <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DESC">Descendente</SelectItem>
                            <SelectItem value="ASC">Ascendente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                              {projects.map((project) => (
                                <TableRow
                                  key={project.PRJ_id}
                                  className={`cursor-pointer hover:bg-[#c9e077]/10 ${editNotificationForm.proyectoId === project.PRJ_id ? 'bg-[#c9e077]/20' : ''
                                    }`}
                                  onClick={() => setEditNotificationForm((prev) => ({
                                    ...prev,
                                    proyectoId: project.PRJ_id
                                  }))}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={editNotificationForm.proyectoId === project.PRJ_id}
                                      onCheckedChange={() => setEditNotificationForm((prev) => ({
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
                              {projects.length === 0 && (
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
                    {projectTotalPages > 1 && (
                      <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectPage((prev) => Math.max(1, prev - 1))}
                          disabled={projectPage === 1}
                        >
                          Anterior
                        </Button>

                        {Array.from({ length: projectTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                          <Button
                            key={pageNumber}
                            variant={pageNumber === projectPage ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setProjectPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectPage((prev) => Math.min(projectTotalPages, prev + 1))}
                          disabled={projectPage === projectTotalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}
                    <div className="text-center text-xs text-muted-foreground">
                      Mostrando {projects.length} de {projectTotalProjects} proyectos
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Usuario Destinatario ({selectedEditUsers.length} seleccionado)</Label>
                  <div className="grid gap-3 md:grid-cols-12 mb-2">
                    <div className="md:col-span-7">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                        <Input
                          placeholder="Buscar por nombre, apellidos o correo..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="secondary" className="btn-secondary" size="sm" onClick={handleApplyUserFilters}>
                          Filtrar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearUserFilters}
                          disabled={!userSearchTerm && !appliedUserSearchTerm && userPage === 1 && userOrderBy === 'name'}
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                    <div className="md:col-span-5">
                      <Label className="mb-2 block">Ordenar por</Label>
                      <Select value={userOrderBy} onValueChange={(value) => setUserOrderBy(value as UserOrderBy)}>
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Nombre</SelectItem>
                          <SelectItem value="firstLastName">Primer apellido</SelectItem>
                          <SelectItem value="secondLastName">Segundo apellido</SelectItem>
                          <SelectItem value="email">Correo</SelectItem>
                          <SelectItem value="role">Rol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                            {users.map((usr) => (
                              <TableRow
                                key={usr.USR_id}
                                className={`cursor-pointer hover:bg-[#c9e077]/10 ${selectedEditUsers.includes(usr.USR_id) ? 'bg-[#c9e077]/20' : ''
                                  }`}
                                onClick={() => toggleEditUserSelection(usr.USR_id)}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={selectedEditUsers.includes(usr.USR_id)}
                                    onCheckedChange={() => toggleEditUserSelection(usr.USR_id)}
                                  />
                                </TableCell>
                                <TableCell>{usr.USR_name}</TableCell>
                                <TableCell>{usr.USR_f_lastname}</TableCell>
                                <TableCell>{usr.USR_s_lastname}</TableCell>
                                <TableCell>{usr.ROL_name}</TableCell>
                              </TableRow>
                            ))}
                            {users.length === 0 && (
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
                  {userTotalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                        disabled={userPage === 1}
                      >
                        Anterior
                      </Button>

                      {Array.from({ length: userTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === userPage ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setUserPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPage((prev) => Math.min(userTotalPages, prev + 1))}
                        disabled={userPage === userTotalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                  <div className="text-center text-xs text-muted-foreground">
                    Mostrando {users.length} de {userTotalUsers} usuarios
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
              >
                Cancelar
              </Button>
              <Button
                className="gradient-primary text-white hover:opacity-90"
                onClick={handleUpdateNotification}
              >
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
