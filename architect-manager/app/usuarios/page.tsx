"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Mail, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPAUser } from "@/models/GPA_user"
import { GPARole } from "@/models/GPA_role"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// Function to format date as DD/MM/YYYY HH:MM
function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function UsersPage() {
  const router = useRouter()
  const { isAdmin, getUserPermissions } = useAuth()
  const { toast } = useToast();
  const [users, setUsers] = useState<GPAUser[]>([])
  const [roles, setRoles] = useState<GPARole[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUser, setSelectedUser] = useState<GPAUser | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [selectedState, setSelectedState] = useState<boolean>(true)
  const [page, setPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)
  const [adminUsers, setAdminUsers] = useState(0)
  const [regularUsers, setRegularUsers] = useState(0)
  const [orderBy, setOrderBy] = useState<'name' | 'firstLastName' | 'secondLastName' | 'email' | 'creationDate' | 'lastAccessDate'>('creationDate')
  const usersPerPage = 10
  const defaultOrderBy: typeof orderBy = 'creationDate'
  const selectedRole = roles.find(r => r.ROL_id === Number(selectedRoleId))

  // Fetch users from API
  const fetchUsers = async (
    targetPage: number,
    targetSearch: string,
    targetOrderBy: typeof orderBy = orderBy
  ) => {
    try {
      setLoadingUsers(true)
      const orderDir = targetOrderBy === 'creationDate' || targetOrderBy === 'lastAccessDate' ? 'DESC' : 'ASC'
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(usersPerPage),
        search: targetSearch,
        orderBy: targetOrderBy,
        orderDir,
      })
      const response = await fetch(`/api/users?${params.toString()}`)
      const data = await response.json()
      setUsers(data.users || [])
      setTotalUsers(data.totalUsers || 0)
      setTotalPages(data.totalPages || 0)
      setActiveUsers(data.totalActiveUsers || 0)
      setAdminUsers(data.totalAdminUsers || 0)
      setRegularUsers(data.totalRegularUsers || 0)
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

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers(page, appliedSearchTerm, orderBy)
    }
    loadData()
  }, [page, appliedSearchTerm, orderBy])

  // Fetch roles for the select dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      const response = await fetch("/api/roles");
      const data = await response.json();
      const requestedRoles: GPARole[] = data.roles
      setRoles(requestedRoles);
      if (requestedRoles.length > 0) {
        setSelectedRoleId(String(requestedRoles[0].ROL_id));
      }
    };
    fetchRoles();
  }, []);

  // Handlers for dialog open/close and form submission
  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setSelectedRoleId(String(user.USR_role_id))
    setSelectedState(user.USR_active === 1)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedUser(null)
    setSelectedRoleId(String(roles[0]?.ROL_id || ""))
    setSelectedState(true)
    setIsDialogOpen(true)
  }

  const toggleUserStatus = async (userId: number) => {
    const user = users.find(u => u.USR_id === userId);
    if (!user) return;

    const updatedUser = {
      USR_id: user.USR_id,
      USR_name: user.USR_name,
      USR_f_lastname: user.USR_f_lastname,
      USR_s_lastname: user.USR_s_lastname,
      USR_email: user.USR_email,
      USR_active: user.USR_active === 1 ? 0 : 1,
      USR_role_id: user.USR_role_id,
      ROL_name: user.ROL_name
    };

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Error al actualizar el estado del usuario",
          variant: "destructive"
        })
        return
      }
      await fetchUsers(page, appliedSearchTerm, orderBy)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el estado del usuario",
        variant: "destructive"
      })
    }
  }

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true)
    const formData = new FormData(e.currentTarget);

    const userData = {
      USR_name: formData.get("name") as string,
      USR_f_lastname: formData.get("f_lastname") as string,
      USR_s_lastname: formData.get("s_lastname") as string,
      USR_email: formData.get("email") as string,
      USR_active: selectedState ? 1 : 0,
      USR_role_id: Number(selectedRoleId),
      ROL_name: selectedRole?.ROL_name || "",
      ...(selectedUser && { USR_id: selectedUser.USR_id })
    };
    // if editing, include the user ID
    if (selectedUser) {
      userData["USR_id"] = selectedUser.USR_id;
    }

    try {
      console.log("Enviando datos al API:", userData);
      const response = await fetch("/api/users", {
        method: selectedUser ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Ocurrió un error al guardar el usuario.";
        toast({
          title: "Error en el guardado",
          description: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (response.ok) {
        await fetchUsers(page, appliedSearchTerm, orderBy)
        setIsDialogOpen(false);
        setSelectedUser(null);
        toast({
          title: "Guardado exitoso",
          description: data.message || "El usuario fue guardado exitosamente.",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error en el guardado",
        description: error instanceof Error ? error.message : "Ocurrió un error al guardar el usuario.",
        variant: "destructive",
      });
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = async () => {
    const nextSearch = searchTerm.trim()
    if (page === 1 && appliedSearchTerm === nextSearch) {
      await fetchUsers(1, nextSearch, orderBy)
      return
    }
    setPage(1)
    setAppliedSearchTerm(nextSearch)
  }

  const handleClearFilters = async () => {
    if (!searchTerm && !appliedSearchTerm && page === 1 && orderBy === defaultOrderBy) {
      await fetchUsers(1, "", defaultOrderBy)
      return
    }
    setSearchTerm("")
    setAppliedSearchTerm("")
    setPage(1)
    setOrderBy(defaultOrderBy)
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Usuarios</h1>
            <p className="text-muted-foreground">Administra los usuarios del sistema</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleNew} className="bg-primary-medium hover:bg-primary-dark" disabled={loadingUsers}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
            {(getUserPermissions().some(p => p.screen === "usuarios-administrar-roles" && p.permission_type === "All") || isAdmin) && (
              <Button
                onClick={() => router.push('/usuarios/administrar-roles')}
                variant="outline"
                disabled={loadingUsers}
              >
                Administrar Roles
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-medium">{adminUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{regularUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-7 space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por nombre, apellidos, correo o rol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="btn-secondary"  onClick={handleApplyFilters}>
                    Filtrar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    disabled={!searchTerm && !appliedSearchTerm && page === 1 && orderBy === defaultOrderBy}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              <div className="md:col-span-5 space-y-2">
                <Label htmlFor="orderBy">Ordenar por</Label>
                <Select value={orderBy} onValueChange={(value) => setOrderBy(value as typeof orderBy)}>
                  <SelectTrigger id="orderBy">
                    <SelectValue placeholder="Selecciona un orden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="firstLastName">Primer apellido</SelectItem>
                    <SelectItem value="secondLastName">Segundo apellido</SelectItem>
                    <SelectItem value="email">Correo</SelectItem>
                    <SelectItem value="creationDate">Fecha de creación</SelectItem>
                    <SelectItem value="lastAccessDate">Fecha de último acceso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios ({users.length})</CardTitle>
            <CardDescription>Todos los usuarios registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="text-center py-8 text-muted-foreground">Cargando usuarios...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {appliedSearchTerm ? "No se encontraron usuarios con los filtros aplicados" : "No hay usuarios registrados"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.USR_id} className="animate-fade-in">
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.USR_name + " " + user.USR_f_lastname + " " + user.USR_s_lastname}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {user.USR_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.ROL_name === "admin" ? "default" : "secondary"}
                          className={user.ROL_name === "admin" ? "bg-primary-medium" : ""}
                        >
                          {user.ROL_name === "admin" ? "Administrador" : user.ROL_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.USR_active === 1}
                            onCheckedChange={() => user.USR_id !== undefined && toggleUserStatus(user.USR_id)}
                          />
                          <Badge
                            variant={user.USR_active === 1 ? "default" : "secondary"}
                            className={user.USR_active === 1 ? "bg-green-500" : ""}
                          >
                            {user.USR_active === 1 ? "activo" : "inactivo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3" />
                            Creado: {formatDate(user.USR_creation_date ?? "")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Último acceso: {formatDate(user.USR_last_access_date ?? "")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

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

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
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
              Mostrando {users.length} de {totalUsers} usuarios
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
              <DialogDescription>
                {selectedUser ? "Modifica los datos del usuario existente" : "Ingresa los datos del nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" defaultValue={selectedUser?.USR_name || ""} placeholder="Nombre" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="f_lastname">Primer Apellido</Label>
                  <Input id="f_lastname" name="f_lastname" defaultValue={selectedUser?.USR_f_lastname || ""} placeholder="Primer Apellido" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s_lastname">Segundo Apellido</Label>
                  <Input id="s_lastname" name="s_lastname" defaultValue={selectedUser?.USR_s_lastname || ""} placeholder="Segundo Apellido" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser?.USR_email || ""}
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.ROL_id} value={String(role.ROL_id)}>
                          {role.ROL_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch name="state" id="state" defaultChecked={selectedState} onCheckedChange={setSelectedState} />
                  <Label htmlFor="state">Usuario activo</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary-medium hover:bg-primary-dark">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>{selectedUser ? "Actualizar" : "Crear"}</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
