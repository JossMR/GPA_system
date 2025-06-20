"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Edit, DollarSign, Calendar, CreditCard, Building, TrendingUp, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const mockPagos = [
  {
    id: 1,
    fecha: "2024-12-10",
    monto: 25000,
    metodo: "transferencia",
    proyecto: "Villa Moderna",
    cliente: "María González",
    numeroCaso: "VM-001",
    detalle: "Pago inicial del proyecto",
    estado: "completado",
  },
  {
    id: 2,
    fecha: "2024-12-08",
    monto: 15000,
    metodo: "cheque",
    proyecto: "Casa Familiar",
    cliente: "Ana Martínez",
    numeroCaso: "CF-002",
    detalle: "Segunda cuota",
    estado: "completado",
  },
  {
    id: 3,
    fecha: "2024-12-15",
    monto: 30000,
    metodo: "efectivo",
    proyecto: "Oficina Corporativa",
    cliente: "Carlos Rodríguez",
    numeroCaso: "OC-003",
    detalle: "Pago por avance de obra",
    estado: "pendiente",
  },
  {
    id: 4,
    fecha: "2024-12-05",
    monto: 8000,
    metodo: "tarjeta",
    proyecto: "Villa Moderna",
    cliente: "María González",
    numeroCaso: "VM-004",
    detalle: "Costo extra - Materiales premium",
    estado: "completado",
  },
]

const metodoPago = {
  transferencia: "Transferencia",
  cheque: "Cheque",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
}

const estadoColors = {
  completado: "bg-green-500",
  pendiente: "bg-yellow-500",
  rechazado: "bg-red-500",
}

export default function PagosPage() {
  const { isAdmin } = useAuth()
  const [pagos, setPagos] = useState(mockPagos)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [selectedPago, setSelectedPago] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredPagos = pagos.filter((pago) => {
    const matchesSearch =
      pago.proyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.numeroCaso.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = estadoFilter === "todos" || pago.estado === estadoFilter
    return matchesSearch && matchesEstado
  })

  const totalIngresos = pagos.filter((p) => p.estado === "completado").reduce((sum, p) => sum + p.monto, 0)
  const pagosPendientes = pagos.filter((p) => p.estado === "pendiente").reduce((sum, p) => sum + p.monto, 0)

  const handleEdit = (pago: any) => {
    setSelectedPago(pago)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedPago(null)
    setIsDialogOpen(true)
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              Gestión de Pagos
            </h1>
            <p className="text-muted-foreground">Administra todos los pagos y transacciones</p>
          </div>
          {isAdmin && (
            <Button onClick={handleNew} className="gradient-primary text-white hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          )}
        </div>

        {/* Estadísticas Financieras */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="card-hover border-[#a2c523]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                Ingresos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalIngresos.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12% este mes
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-yellow-600" />
                Pagos Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${pagosPendientes.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {pagos.filter((p) => p.estado === "pendiente").length} pagos
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-[#7d4427]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-[#7d4427]" />
                Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#7d4427]">{pagos.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Este mes</div>
            </CardContent>
          </Card>

          <Card className="card-hover border-[#486b00]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Building className="mr-2 h-4 w-4 text-[#486b00]" />
                Proyectos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#486b00]">{new Set(pagos.map((p) => p.proyecto)).size}</div>
              <div className="text-xs text-muted-foreground mt-1">Con pagos registrados</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
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
                    placeholder="Buscar por proyecto, cliente o número de caso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="estado">Estado</Label>
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Pagos */}
        <Card className="border-[#a2c523]/20">
          <CardHeader>
            <CardTitle className="text-[#2e4600]">Historial de Pagos ({filteredPagos.length})</CardTitle>
            <CardDescription>Todas las transacciones registradas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagos.map((pago, index) => (
                  <TableRow key={pago.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3 text-[#486b00]" />
                        {pago.fecha}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pago.proyecto}</div>
                        <div className="text-sm text-muted-foreground">{pago.numeroCaso}</div>
                      </div>
                    </TableCell>
                    <TableCell>{pago.cliente}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-[#2e4600]">${pago.monto.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#a2c523] text-[#486b00]">
                        {metodoPago[pago.metodo as keyof typeof metodoPago]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${estadoColors[pago.estado as keyof typeof estadoColors]} text-white`}>
                        {pago.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="hover:bg-[#c9e077]/20">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(pago)}
                            className="hover:bg-[#c9e077]/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog para Crear/Editar Pago */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#2e4600]">
                {selectedPago ? "Editar Pago" : "Registrar Nuevo Pago"}
              </DialogTitle>
              <DialogDescription>
                {selectedPago ? "Modifica los datos del pago" : "Ingresa los detalles del nuevo pago"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fecha">Fecha del pago</Label>
                  <Input
                    id="fecha"
                    type="date"
                    defaultValue={selectedPago?.fecha || ""}
                    className="border-[#a2c523]/30 focus:border-[#486b00]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monto">Monto</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                    <Input
                      id="monto"
                      type="number"
                      placeholder="25000"
                      defaultValue={selectedPago?.monto || ""}
                      className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proyecto">Proyecto</Label>
                <Select defaultValue={selectedPago?.proyecto || ""}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Villa Moderna">Villa Moderna</SelectItem>
                    <SelectItem value="Casa Familiar">Casa Familiar</SelectItem>
                    <SelectItem value="Oficina Corporativa">Oficina Corporativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="metodo">Método de pago</Label>
                  <Select defaultValue={selectedPago?.metodo || ""}>
                    <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                      <SelectValue placeholder="Método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numeroCaso">Número de caso</Label>
                  <Input
                    id="numeroCaso"
                    placeholder="VM-001"
                    defaultValue={selectedPago?.numeroCaso || ""}
                    className="border-[#a2c523]/30 focus:border-[#486b00]"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="detalle">Detalle del pago</Label>
                <Input
                  id="detalle"
                  placeholder="Descripción del pago..."
                  defaultValue={selectedPago?.detalle || ""}
                  className="border-[#a2c523]/30 focus:border-[#486b00]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
              >
                Cancelar
              </Button>
              <Button className="gradient-primary text-white hover:opacity-90" onClick={() => setIsDialogOpen(false)}>
                {selectedPago ? "Actualizar" : "Registrar"} Pago
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
