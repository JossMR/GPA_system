"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, Search, ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPARole } from "@/models/GPA_role"
import { useRouter } from "next/navigation"

export default function RolesPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [roles, setRoles] = useState<GPARole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedRoles, setExpandedRoles] = useState<Set<number>>(new Set())

  // Redirect if not admin
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

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/roles")
        const data = await response.json()
        setRoles(data.roles || [])
      } catch (error) {
        console.error("Error fetching roles:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  // Filter roles by name
  const filteredRoles = roles.filter((role) =>
    role.ROL_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Toggle role expansion
  const toggleRole = (roleId: number) => {
    setExpandedRoles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(roleId)) {
        newSet.delete(roleId)
      } else {
        newSet.add(roleId)
      }
      return newSet
    })
  }

  // Handle edit role
  const handleEditRole = (e: React.MouseEvent, roleId: number) => {
    e.stopPropagation() // Prevent accordion toggle
    // TODO: Implement edit functionality
    console.log("Edit role:", roleId)
  }

  // Handle delete role
  const handleDeleteRole = (e: React.MouseEvent, roleId: number) => {
    e.stopPropagation() // Prevent accordion toggle
    // TODO: Implement delete functionality
    console.log("Delete role:", roleId)
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Administrar Roles</h1>
            <p className="text-muted-foreground">Visualiza los roles y sus permisos del sistema</p>
          </div>
          <Button onClick={() => router.push('/usuarios')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Usuarios
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Roles con Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-medium">
                {roles.filter((r) => r.ROL_notifications_for === 'E').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Permisos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {roles.reduce((acc, role) => acc + (role.permissions?.length || 0), 0)}
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
                <Label htmlFor="search">Buscar por nombre de rol</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar rol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Roles ({filteredRoles.length})</CardTitle>
            <CardDescription>Todos los roles configurados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando roles...</div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No se encontraron roles</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredRoles.map((role) => {
                  const isExpanded = expandedRoles.has(role.ROL_id!)
                  const isSystemRole = role.ROL_id === 1
                  
                  return (
                    <Card key={role.ROL_id} className="border-2">
                      <CardHeader 
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => toggleRole(role.ROL_id!)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-primary-medium flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-primary-medium flex-shrink-0" />
                            )}
                            <Shield className="h-6 w-6 text-primary-medium flex-shrink-0" />
                            <CardTitle className="text-xl truncate">{role.ROL_name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!isSystemRole && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleEditRole(e, role.ROL_id!)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleDeleteRole(e, role.ROL_id!)}
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">Notificaciones para:</span>
                          <Badge variant={role.ROL_notifications_for === 'E' ? "default" : "secondary"}>
                            {role.ROL_notifications_for === 'E' ? 'Todos' : 'Sí mismo'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="space-y-4 pt-0">
                          {/* Permissions */}
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Permisos</h4>
                            {role.permissions && role.permissions.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Pantalla</TableHead>
                                    <TableHead>Tipo de Permiso</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {role.permissions.map((permission, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="font-medium">{permission.screen_name || 'N/A'}</TableCell>
                                      <TableCell>
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
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-sm text-muted-foreground">No hay permisos asignados</p>
                            )}
                          </div>

                          {/* Notification Types */}
                          <div>
                            <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Tipos de Notificación</h4>
                            {role.notifications_types && role.notifications_types.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {role.notifications_types.map((notificationType, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {notificationType.NTP_name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No hay tipos de notificación asignados</p>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}