"use client"

import { useState } from "react"
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

export default function UsuariosPage() {
  const { isAdmin } = useAuth()
  const [usuarios, setUsuarios] = useState(mockUsuarios)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null)
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

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (usuario: any) => {
    setSelectedUsuario(usuario)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedUsuario(null)
    setIsDialogOpen(true)
  }

  const toggleUsuarioEstado = (usuarioId: number) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioId ? { ...u, estado: u.estado === "activo" ? "inactivo" : "activo" } : u)),
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
              <div className="text-2xl font-bold">{usuarios.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {usuarios.filter((u) => u.estado === "activo").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-medium">
                {usuarios.filter((u) => u.rol === "admin").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Regulares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {usuarios.filter((u) => u.rol === "usuario").length}
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
            <CardTitle>Lista de Usuarios ({filteredUsuarios.length})</CardTitle>
            <CardDescription>Todos los usuarios registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id} className="animate-fade-in">
                    <TableCell>
                      <div>
                        <div className="font-medium">{usuario.nombre}</div>
                        <div className="text-sm text-muted-foreground">ID: {usuario.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {usuario.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={usuario.rol === "admin" ? "default" : "secondary"}
                        className={usuario.rol === "admin" ? "bg-primary-medium" : ""}
                      >
                        {usuario.rol === "admin" ? "Administrador" : "Usuario"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={usuario.estado === "activo"}
                          onCheckedChange={() => toggleUsuarioEstado(usuario.id)}
                        />
                        <Badge
                          variant={usuario.estado === "activo" ? "default" : "secondary"}
                          className={usuario.estado === "activo" ? "bg-green-500" : ""}
                        >
                          {usuario.estado}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          Creado: {usuario.fechaCreacion}
                        </div>
                        <div className="text-xs text-muted-foreground">Último acceso: {usuario.ultimoAcceso}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(usuario)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleUsuarioEstado(usuario.id)}>
                          {usuario.estado === "activo" ? (
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
              <DialogTitle>{selectedUsuario ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
              <DialogDescription>
                {selectedUsuario ? "Modifica los datos del usuario" : "Ingresa los datos del nuevo usuario"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input id="nombre" defaultValue={selectedUsuario?.nombre || ""} placeholder="Nombre del usuario" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={selectedUsuario?.email || ""}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rol">Rol</Label>
                <Select defaultValue={selectedUsuario?.rol || "usuario"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="estado" defaultChecked={selectedUsuario?.estado === "activo" || !selectedUsuario} />
                <Label htmlFor="estado">Usuario activo</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-primary-medium hover:bg-primary-dark" onClick={() => setIsDialogOpen(false)}>
                {selectedUsuario ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
