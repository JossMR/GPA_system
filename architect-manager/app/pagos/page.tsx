"use client"

import { useState, useEffect } from "react"
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
import { GPAPayment } from "@/models/GPA_payment"

const metodoPago = {
  transferencia: "Transferencia",
  cheque: "Cheque",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
}

export default function PagosPage() {
  const { isAdmin } = useAuth()
  const [payments, setPayments] = useState<GPAPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("todos")
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sumLastDueAmount, setSumLastDueAmount] = useState(0)

  const stateLabels: Record<string, string> = {
    "Document Collection": "Recepción de documentos",
    "Technical Inspection": "Inspección técnica",
    "Document Review": "Revisión de documentos",
    "Plans and Budget": "Planos y presupuesto",
    "Entity Review": "Revisión de entidad",
    "APC and Permits": "APC y permisos",
    "Disbursement": "Desembolso",
    "Under Construction": "En construcción",
    "Completed": "Completado",
    "Logbook Closed": "Bitácora cerrada",
    "Rejected": "Rechazado",
    "Professional Withdrawal": "Retiro profesional",
    "Conditioned": "Condicionado",
  }

  const lastPaymentsPerProject = new Map<number, GPAPayment>()

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true)
      try {
        const res = await fetch("/api/payments")
        const data = await res.json()
        const OrderedPayments = data.sort(
          (a: any, b: any) => new Date(b.PAY_payment_date).getTime() - new Date(a.PAY_payment_date).getTime()
        )
        setPayments(OrderedPayments)
      } catch (err) {
        setPayments([])
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
    payments.forEach((p) => {
      const key = p.PAY_project_id
      const prev = lastPaymentsPerProject.get(key)
      if (
        !prev ||
        new Date(p.PAY_payment_date).getTime() > new Date(prev.PAY_payment_date).getTime()
      ) {
        lastPaymentsPerProject.set(key, p)
      }
    })
    let lastDueAmount = 0
    lastPaymentsPerProject.forEach((p) => {
      lastDueAmount += p.PAY_amount_due || 0
    })
    setSumLastDueAmount(lastDueAmount)
  }, [])

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      (payment.projectCaseNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.projectClientName || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesState = stateFilter === "todos" || (payment.projectState) === stateFilter
    return matchesSearch && matchesState
  })

  const totalIngresos = payments.filter((p) => p.projectState === "completado").reduce((sum, p) => sum + p.PAY_amount_paid, 0)
  const pagosPendientes = payments.filter((p) => p.projectState === "pendiente").reduce((sum, p) => sum + p.PAY_amount_due, 0)

  const handleEdit = (payment: any) => {
    setSelectedPayment(payment)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedPayment(null)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-hover border-[#a2c523]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                Ingresos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₡{totalIngresos.toLocaleString()}</div>
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
              <div className="text-2xl font-bold text-yellow-600">
                ₡{sumLastDueAmount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {lastPaymentsPerProject.size} proyectos con saldos pendientes
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
              <div className="text-2xl font-bold text-[#7d4427]">{payments.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Este mes</div>
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
                <Select value={stateFilter} onValueChange={setStateFilter}>
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
            <CardTitle className="text-[#2e4600]">Historial de Pagos ({filteredPayments.length})</CardTitle>
            <CardDescription>Todas las transacciones registradas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando pagos...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Número de Caso</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    {/*TODO <TableHead>Método</TableHead>*/}
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment, index) => (
                    <TableRow key={payment.PAY_id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3 text-[#486b00]" />
                          {payment.PAY_payment_date ? new Date(payment.PAY_payment_date).toLocaleDateString() : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.projectCaseNumber || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.projectClientName || "N/A"}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-[#2e4600]">₡{(payment.PAY_amount_paid)?.toLocaleString()}</div>
                      </TableCell>
                      {/*TODO <TableCell>
                        <Badge variant="outline" className="border-[#a2c523] text-[#486b00]">
                          {metodoPago[(payment.metodo || payment.PAY_method) as keyof typeof metodoPago]}
                        </Badge>
                      </TableCell>*/}
                      <TableCell>
                        <Badge className="bg-[#486b00] text-white">
                          {stateLabels[payment.projectState || "N/A"]}
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
                              onClick={() => handleEdit(payment)}
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
            )}
          </CardContent>
        </Card>

        {/* Dialog para Crear/Editar Pago */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#2e4600]">
                {selectedPayment ? "Editar Pago" : "Registrar Nuevo Pago"}
              </DialogTitle>
              <DialogDescription>
                {selectedPayment ? "Modifica los datos del pago" : "Ingresa los detalles del nuevo pago"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fecha">Fecha del pago</Label>
                  <Input
                    id="fecha"
                    type="date"
                    defaultValue={selectedPayment?.fecha || ""}
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
                      defaultValue={selectedPayment?.monto || ""}
                      className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proyecto">Proyecto</Label>
                <Select defaultValue={selectedPayment?.proyecto || ""}>
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
                  <Select defaultValue={selectedPayment?.metodo || ""}>
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
                    defaultValue={selectedPayment?.numeroCaso || ""}
                    className="border-[#a2c523]/30 focus:border-[#486b00]"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="detalle">Detalle del pago</Label>
                <Input
                  id="detalle"
                  placeholder="Descripción del pago..."
                  defaultValue={selectedPayment?.detalle || ""}
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
                {selectedPayment ? "Actualizar" : "Registrar"} Pago
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
