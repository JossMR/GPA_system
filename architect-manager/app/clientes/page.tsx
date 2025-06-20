"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Eye, Phone, Mail } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

const mockClientes = [
  {
    id: 1,
    nombre: "María González",
    email: "maria@email.com",
    telefono: "+1234567890",
    empresa: "Constructora ABC",
    proyectos: 3,
    estado: "activo",
    fechaRegistro: "2024-01-15",
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    email: "carlos@email.com",
    telefono: "+1234567891",
    empresa: "Inmobiliaria XYZ",
    proyectos: 1,
    estado: "activo",
    fechaRegistro: "2024-02-20",
  },
  {
    id: 3,
    nombre: "Ana Martínez",
    email: "ana@email.com",
    telefono: "+1234567892",
    empresa: "Desarrollo Urbano",
    proyectos: 2,
    estado: "inactivo",
    fechaRegistro: "2024-01-10",
  },
]

export default function ClientesPage() {
  const { isAdmin } = useAuth()
  const [clientes, setClientes] = useState(mockClientes)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">Clientes</h1>
            <p className="text-muted-foreground">Gestiona tu cartera de clientes</p>
          </div>
          {isAdmin && (
            <Link href="/clientes/nuevo">
              <Button className="gradient-primary text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </Link>
          )}
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
                    placeholder="Buscar por nombre, email o empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes ({filteredClientes.length})</CardTitle>
            <CardDescription>Todos los clientes registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Proyectos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="animate-fade-in">
                    <TableCell>
                      <div>
                        <div className="font-medium">{cliente.nombre}</div>
                        <div className="text-sm text-muted-foreground">Registrado: {cliente.fechaRegistro}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {cliente.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {cliente.telefono}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{cliente.empresa}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{cliente.proyectos} proyectos</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cliente.estado === "activo" ? "default" : "secondary"}
                        className={cliente.estado === "activo" ? "bg-green-500" : ""}
                      >
                        {cliente.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clientes/${cliente.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Link href={`/clientes/${cliente.id}/editar`}>
                            <Button variant="ghost" size="sm" className="hover:bg-[#c9e077]/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
