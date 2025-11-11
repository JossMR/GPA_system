"use client"

import { useEffect, useState, use } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Shield, Trash2, Plus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPARole } from "@/models/GPA_role"
import { GPAPermission } from "@/models/GPA_permission"
import { GPANotificationsTypes } from "@/models/GPA_notificationType"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const { id } = use(params)

  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [role, setRole] = useState<GPARole | null>(null)
  const [roleName, setRoleName] = useState("")
  const [notificationsFor, setNotificationsFor] = useState<"E" | "O">("O")
  const [permissions, setPermissions] = useState<GPAPermission[]>([])
  const [notificationTypes, setNotificationTypes] = useState<GPANotificationsTypes[]>([])
  const [availableNotificationTypes, setAvailableNotificationTypes] = useState<GPANotificationsTypes[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<GPAPermission[]>([])

  // Dialog states
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)

  // Redirect if not admin
  if (!isAdmin) {
    router.push("/usuarios/administrar-roles")
    return null
  }

  // Fetch role data
  useEffect(() => {
    const fetchRole = async () => {
      setFetchingData(true)
      try {
        const response = await fetch(`/api/roles/${id}`)
        if (!response.ok) throw new Error("No se pudo cargar el rol")
        const data = await response.json()
        const roleData = data.role as GPARole

        setRole(roleData)
        setRoleName(roleData.ROL_name || "")
        setNotificationsFor(roleData.ROL_notifications_for || "O")
        setPermissions(roleData.permissions || [])
        setNotificationTypes(roleData.notifications_types || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el rol",
          variant: "destructive"
        })
        router.push("/usuarios/administrar-roles")
      } finally {
        setFetchingData(false)
      }
    }
    fetchRole()
  }, [id, router, toast])

  // Fetch available notification types
  useEffect(() => {
    const fetchNotificationTypes = async () => {
      try {
        const response = await fetch("/api/notifications_types")
        const data = await response.json()
        setAvailableNotificationTypes(data.notificationsTypes || [])
      } catch (error) {
        console.error("Error fetching notification types:", error)
      }
    }
    fetchNotificationTypes()
  }, [])

  // Fetch all available permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch("/api/permission")
        const data = await response.json()
        setAvailablePermissions(data.permissions || [])
      } catch (error) {
        console.error("Error fetching permissions:", error)
      }
    }
    fetchPermissions()
  }, [])

  // Handle remove permission
  const handleRemovePermission = (index: number) => {
    if (permissions.length <= 1) {
      toast({
        title: "No se puede eliminar",
        description: "El rol debe tener al menos un permiso",
        variant: "destructive"
      })
      return
    }
    setPermissions(permissions.filter((_, i) => i !== index))
  }

  // Handle add permission
  const handleAddPermission = (permission: GPAPermission) => {
    // Check if permission already exists
    const exists = permissions.some(
      p => p.SCN_id === permission.SCN_id && p.permission_type === permission.permission_type
    )

    if (exists) {
      toast({
        title: "Permiso duplicado",
        description: "Este permiso ya existe para el rol",
        variant: "destructive"
      })
      return
    }

    setPermissions([...permissions, permission])
    setPermissionDialogOpen(false)
  }

  // Handle remove notification type
  const handleRemoveNotificationType = (ntpId: number) => {
    if (notificationTypes.length <= 1) {
      toast({
        title: "No se puede eliminar",
        description: "El rol debe tener al menos un tipo de notificación",
        variant: "destructive"
      })
      return
    }
    setNotificationTypes(notificationTypes.filter(nt => nt.NTP_id !== ntpId))
  }

  // Handle add notification type
  const handleAddNotificationType = (ntpId: number) => {
    const notifType = availableNotificationTypes.find(nt => nt.NTP_id === ntpId)
    if (!notifType) return

    const exists = notificationTypes.some(nt => nt.NTP_id === ntpId)
    if (exists) {
      toast({
        title: "Tipo duplicado",
        description: "Este tipo de notificación ya está asignado",
        variant: "destructive"
      })
      return
    }

    setNotificationTypes([...notificationTypes, notifType])
    setNotificationDialogOpen(false)
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!roleName.trim()) {
      toast({
        title: "Campo requerido",
        description: "El nombre del rol es obligatorio",
        variant: "destructive"
      })
      return
    }

    if (permissions.length === 0) {
      toast({
        title: "Permisos requeridos",
        description: "El rol debe tener al menos un permiso",
        variant: "destructive"
      })
      return
    }

    if (notificationTypes.length === 0) {
      toast({
        title: "Tipos de notificación requeridos",
        description: "El rol debe tener al menos un tipo de notificación",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const updatedRole: GPARole = {
        ...role,
        ROL_name: roleName.trim(),
        ROL_notifications_for: notificationsFor,
        permissions,
        notifications_types: notificationTypes
      }

      const response = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRole),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error actualizando el rol")
      }

      toast({
        title: "Rol actualizado",
        description: "Los cambios fueron guardados correctamente",
        variant: "success"
      })

      router.push("/usuarios/administrar-roles")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al actualizar el rol",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-medium mr-4" />
          <span className="text-muted-foreground">Cargando información del rol...</span>
        </div>
      </MainLayout>
    )
  }

  if (!role) return null

  // Prevent editing system role (ID 1)
  if (role.ROL_id === 1) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">No se puede editar</h2>
              <p className="text-muted-foreground mb-4">
                El rol de Administrador del Sistema no puede ser modificado.
              </p>
              <Button onClick={() => router.push("/usuarios/administrar-roles")}>
                Volver a Roles
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Filter available permissions and notification types
  const availablePermissionsForDialog = availablePermissions.filter(
    ap => !permissions.some(p => p.SCN_id === ap.SCN_id && p.permission_type === ap.permission_type)
  )

  const availableNTForDialog = availableNotificationTypes.filter(
    nt => !notificationTypes.some(assigned => assigned.NTP_id === nt.NTP_id)
  )

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/usuarios/administrar-roles")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">
              Editar Rol: {role.ROL_name}
            </h1>
            <p className="text-muted-foreground">Modifica los datos del rol</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Información del Rol
              </CardTitle>
              <CardDescription>Datos básicos del rol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">
                    Nombre del Rol <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Ej: Gestor de Proyectos"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationsFor">
                    Notificaciones autorizadas para:
                  </Label>
                  <Select
                    value={notificationsFor}
                    onValueChange={(value) => setNotificationsFor(value as "E" | "O")}
                  >
                    <SelectTrigger id="notificationsFor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="E">Todos</SelectItem>
                      <SelectItem value="O">Sí mismo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Permissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Permisos</CardTitle>
                    <CardDescription>
                      Gestiona los permisos del rol (mínimo 1 requerido)
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPermissionDialogOpen(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar Permiso
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {permissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay permisos asignados</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {permissions.map((permission, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{permission.screen_name}</span>
                          <Badge
                            variant="outline"
                            className={
                              permission.permission_type === 'All' ? 'bg-green-100 text-green-800' :
                                permission.permission_type === 'Edit' ? 'bg-blue-100 text-blue-800' :
                                  permission.permission_type === 'Create' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                            }
                          >
                            {permission.permission_type}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePermission(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tipos de Notificación</CardTitle>
                    <CardDescription>
                      Gestiona los tipos de notificación del rol (mínimo 1 requerido)
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNotificationDialogOpen(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar Tipo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {notificationTypes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay tipos de notificación asignados</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {notificationTypes.map((nt) => (
                      <Badge
                        key={nt.NTP_id}
                        variant="secondary"
                        className="text-sm px-3 py-1 flex items-center gap-2"
                      >
                        {nt.NTP_name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveNotificationType(nt.NTP_id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/usuarios/administrar-roles")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Add Permission Dialog */}
        <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Permiso</DialogTitle>
              <DialogDescription>
                Selecciona un permiso de la lista disponible
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
              {availablePermissionsForDialog.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Todos los permisos están asignados
                </p>
              ) : (
                availablePermissionsForDialog.map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleAddPermission(permission)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{permission.screen_name}</span>
                      <Badge
                        variant="outline"
                        className={
                          permission.permission_type === 'All' ? 'bg-green-100 text-green-800' :
                            permission.permission_type === 'Edit' ? 'bg-blue-100 text-blue-800' :
                              permission.permission_type === 'Create' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                        }
                      >
                        {permission.permission_type}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost">
                      Agregar
                    </Button>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Notification Type Dialog */}
        <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Tipo de Notificación</DialogTitle>
              <DialogDescription>
                Selecciona los tipos de notificación para el rol
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
              {availableNTForDialog.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Todos los tipos de notificación están asignados
                </p>
              ) : (
                availableNTForDialog.map((nt) => (
                  <div
                    key={nt.NTP_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleAddNotificationType(nt.NTP_id!)}
                  >
                    <span>{nt.NTP_name}</span>
                    <Button size="sm" variant="ghost">
                      Agregar
                    </Button>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotificationDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}