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
import { useRouter } from "next/navigation"
import { set } from "react-hook-form"

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

export default function UsersPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState<GPAUser[]>([]);
  const [roles, setRoles] = useState<GPARole[]>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedState, setSelectedState] = useState<boolean>(true);
  const selectedRole = roles.find(r => r.ROL_id === Number(selectedRoleId));

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

      const fetchUsers = async () => {
        const response = await fetch("/api/users")
        const data = await response.json()
        const requestedUsers: GPAUser[] = data.users
        setUsers(requestedUsers)
      }
      useEffect(() => {
      fetchUsers()
    }, [])

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

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setSelectedRoleId(String(user.USR_role_id))
    setSelectedState(user.USR_active === 1)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedUser(null)
    setSelectedRoleId(String(roles[0]?.ROL_id || ""))
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
      if (!response.ok) throw new Error("Error updating user status");
      await fetchUsers();
    } catch (error) {
      console.error("API error:", error);
    }
  }

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    e.preventDefault();
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
    console.log("User Data to submit:", userData);
    
    // if editing, include the user ID
  if (selectedUser) {
    userData["USR_id"] = selectedUser.USR_id;
  }

  try {
    const response = await fetch("/api/users", {
      method: selectedUser ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(selectedUser ? "Error updating user" : "Error creating user");
    }
    const data = await response.json();
    setIsDialogOpen(false);
    await fetchUsers();
    router.push("/usuarios");
  } catch (error) {
    console.error("API error:", error);
  }
  setLoading(false);
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

        {/* Statistics */}
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

        {/* Filters */}
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

        {/* User List */}
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

        {/* Dialog for Creating/Editing User */}
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
                  <Input id="name" name="name" defaultValue={selectedUser?.USR_name || ""} placeholder="Nombre" required/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="f_lastname">Primer Apellido</Label>
                  <Input id="f_lastname" name="f_lastname" defaultValue={selectedUser?.USR_f_lastname || ""} placeholder="Primer Apellido" required/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="s_lastname">Segundo Apellido</Label>
                  <Input id="s_lastname" name="s_lastname" defaultValue={selectedUser?.USR_s_lastname || ""} placeholder="Segundo Apellido" required/>
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
                <Button 
                type="submit"
                disabled={loading}
                className="bg-primary-medium hover:bg-primary-dark">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                    {selectedUser ? "Actualizar" : "Crear"}
                    </>
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
