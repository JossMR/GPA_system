"use client"

import { useEffect,useState } from "react"
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
import { Plus, Search, Edit, UserCheck, UserX, Mail, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPAUser } from "@/models/GPA_user"
import { GPARole } from "@/models/GPA_role"

// Función para formatear fecha a dd/mm/yyyy hh:mm
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
const mockUsuarios = [
  {
    id: 1,
    nombre: "Juan Arquitecto",
    email: "juan@arquitecto.com",
    rol: "admin",
    estado: "activo",
    fechaCreacion: "2024-01-15",
    ultimoAcceso: "2024-12-13",
  },
  {
    id: 2,
    nombre: "María Diseñadora",
    email: "maria@diseño.com",
    rol: "usuario",
    estado: "activo",
    fechaCreacion: "2024-02-20",
    ultimoAcceso: "2024-12-12",
  },
  {
    id: 3,
    nombre: "Carlos Supervisor",
    email: "carlos@supervisor.com",
    rol: "usuario",
    estado: "inactivo",
    fechaCreacion: "2024-01-10",
    ultimoAcceso: "2024-11-15",
  },
]

export default function UsersPage() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<GPAUser[]>([]);
  const [roles, setRoles] = useState<GPARole[]>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Redirigir si no es admin
  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
              <p className="text-muted-foreground">Necesitas permisos de administrador para acceder a esta sección.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const filteredUsers = users.filter(
    (user) =>
      user.USR_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.USR_f_lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.USR_s_lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ROL_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
      const fetchUsers = async () => {
        const response = await fetch("/api/users")
        const data = await response.json()
        const requestedUsers: GPAUser[] = data.users
        setUsers(requestedUsers)
      }
      fetchUsers()
    }, [])

  useEffect(() => {
      const fetchRoles = async () => {
        const response = await fetch("/api/roles");
        const data = await response.json();
        const requestedRoles: GPARole[] = data.roles
        setRoles(requestedRoles);
      };
      fetchRoles();
    }, []);

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const toggleUserStatus = (userId: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.USR_id === userId ? { ...u, USR_active: u.USR_active === 1 ? 0 : 1 } : u)),
    )
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Usuarios</h1>
            <p className="text-muted-foreground">Administra los usuarios del sistema</p>
          </div>
          <Button onClick={handleNew} className="bg-primary-medium hover:bg-primary-dark">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.USR_active === 1).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-medium">
                {users.filter((u) => u.ROL_name === "admin").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter((u) => u.ROL_name === "usuario").length}
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
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
            <CardDescription>Todos los usuarios registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
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
                {filteredUsers.map((user) => (
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
                        {user.ROL_name === "admin" ? "Administrador" : "Usuario"}
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
                        <div className="text-xs text-muted-foreground">Último acceso: {formatDate(user.USR_last_access_date ?? "")}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => user.USR_id !== undefined && toggleUserStatus(user.USR_id)}>
                          {user.USR_active === 1 ? (
                            <UserX className="h-4 w-4 text-red-500" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog para Crear/Editar Usuario */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
              <DialogDescription>
                {selectedUser ? "Modifica los datos del usuario existente" : "Ingresa los datos del nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" defaultValue={selectedUser?.nombre || ""} placeholder="Nombre" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pApellido">Primer Apellido</Label>
                <Input id="pApellido" defaultValue={selectedUser?.pApellido || ""} placeholder="Primer Apellido" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sApellido">Segundo Apellido</Label>
                <Input id="sApellido" defaultValue={selectedUser?.sApellido || ""} placeholder="Segundo Apellido" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={selectedUser?.email || ""}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rol">Rol</Label>
                <Select defaultValue={selectedUser?.rol || "usuario"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.ROL_name} value={role.ROL_name.toString()}>
                        {role.ROL_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="estado" defaultChecked={selectedUser?.estado === "activo" || !selectedUser} />
                <Label htmlFor="estado">Usuario activo</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-primary-medium hover:bg-primary-dark" onClick={() => setIsDialogOpen(false)}>
                {selectedUser ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
