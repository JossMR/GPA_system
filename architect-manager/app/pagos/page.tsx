"use client"

import { useState, useEffect, useMemo } from "react"
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
import { GPAProject } from "@/models/GPA_project"
import { GPAAddition } from "@/models/GPA_addition"
import { useToast } from "@/hooks/use-toast"

const metodoPago = {
  transferencia: "Transferencia",
  cheque: "Cheque",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
}

export default function PagosPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [payments, setPayments] = useState<GPAPayment[]>([])
  const [projects, setProjects] = useState<GPAProject[]>([])
  const [additions, setAdditions] = useState<GPAAddition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("todos")
  const [selectedPayment, setSelectedPayment] = useState<GPAPayment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState(false)
  const [sumPendingAmounts, setSumPendingAmounts] = useState(0)

  // Debounce del searchTerm con delay de 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    // Actualiza sumPendingAmounts cada vez que projects cambie
    const total = projects.reduce((acc, project) => acc + Number(project.PRJ_remaining_amount || 0), 0)
    setSumPendingAmounts(total)
  }, [projects])
  const [projectsWithDue, setProjectsWithDue] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    PAY_payment_date: "",
    PAY_amount_paid: "",
    PAY_project_id: "",
    PAY_description: "",
  })

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
  function updateInfo() {
    // Calculate pending amount for each project
    let totalPending = 0
    let projectsWithPending = 0

    projects.forEach((project: GPAProject) => {
      if (!project.PRJ_id) return

      if (Number(project.PRJ_remaining_amount) > 0) {
        totalPending += Number(project.PRJ_remaining_amount)
        projectsWithPending++
      }
    })

    //setSumPendingAmounts(totalPending)
    setProjectsWithDue(projectsWithPending)
  }
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch payments
        const paymentsRes = await fetch("/api/payments")
        const paymentsData = await paymentsRes.json()
        const orderedPayments = paymentsData.sort(
          (a: any, b: any) => new Date(b.PAY_payment_date).getTime() - new Date(a.PAY_payment_date).getTime()
        )
        setPayments(orderedPayments)

        // Fetch projects
        const projectsRes = await fetch("/api/projects")
        const projectsJson = await projectsRes.json()
        const projectsList = projectsJson.projects || []
        setProjects(projectsList)

        // Calculate total pending amounts per project
        // Group payments by project
        const paymentsByProject = new Map<number, GPAPayment[]>()
        orderedPayments.forEach((p: GPAPayment) => {
          const projectId = p.PAY_project_id
          if (!paymentsByProject.has(projectId)) {
            paymentsByProject.set(projectId, [])
          }
          paymentsByProject.get(projectId)?.push(p)
        })

        updateInfo()
      } catch (err) {
        console.error("Error fetching data:", err)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // useMemo para que el filtrado pesado solo se ejecute cuando cambien las dependencias reales
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        (payment.projectCaseNumber || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (payment.projectClientName || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const matchesState = stateFilter === "todos" || (payment.projectState) === stateFilter
      
      return matchesSearch && matchesState
    })
  }, [payments, debouncedSearchTerm, stateFilter])

  // Suma de todos los montos de pagos registrados (memoizado para evitar recalcular en cada render)
  const totalIngresos = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.PAY_amount_paid) || 0), 0)
  }, [payments])

  const handleEdit = (payment: GPAPayment) => {
    setSelectedPayment(payment)
    setFormData({
      PAY_payment_date: payment.PAY_payment_date
        ? new Date(payment.PAY_payment_date).toISOString().split('T')[0]
        : "",
      PAY_amount_paid: payment.PAY_amount_paid?.toString() || "",
      PAY_project_id: payment.PAY_project_id?.toString() || "",
      PAY_description: payment.PAY_description || "",
    })
    setViewMode(false)
    setIsDialogOpen(true)
  }

  const handleView = (payment: GPAPayment) => {
    setSelectedPayment(payment)
    setFormData({
      PAY_payment_date: payment.PAY_payment_date
        ? new Date(payment.PAY_payment_date).toISOString().split('T')[0]
        : "",
      PAY_amount_paid: payment.PAY_amount_paid?.toString() || "",
      PAY_project_id: payment.PAY_project_id?.toString() || "",
      PAY_description: payment.PAY_description || "",
    })
    setViewMode(true)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedPayment(null)
    setFormData({
      PAY_payment_date: "",
      PAY_amount_paid: "",
      PAY_project_id: "",
      PAY_description: "",
    })
    setViewMode(false)
    setIsDialogOpen(true)
  }

  const calculateRemainingAmount = (projectId: number, currentPaymentAmount: number): number => {
    const project = projects.find(p => p.PRJ_id === projectId)
    if (!project || !project.PRJ_budget) return 0
    const RemainingAmount = project.PRJ_remaining_amount - currentPaymentAmount
    return Math.max(0, RemainingAmount)
  }

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.PAY_payment_date) {
        toast({
          title: "Error",
          description: "La fecha de pago es obligatoria",
          variant: "destructive",
        })
        return
      }

      if (!formData.PAY_amount_paid || Number(formData.PAY_amount_paid) <= 0) {
        toast({
          title: "Error",
          description: "El monto pagado es obligatorio y debe ser mayor a 0",
          variant: "destructive",
        })
        return
      }

      if (!formData.PAY_project_id) {
        toast({
          title: "Error",
          description: "Debe seleccionar un proyecto",
          variant: "destructive",
        })
        return
      }

      setSaving(true)

      const projectId = Number(formData.PAY_project_id)
      const amountPaid = Number(formData.PAY_amount_paid)

      const paymentData = {
        PAY_payment_date: formData.PAY_payment_date,
        PAY_amount_paid: amountPaid,
        PAY_project_id: projectId,
        PAY_description: formData.PAY_description || null,
      }
      let response
      if (selectedPayment?.PAY_id) {
        // Update existing payment
        response = await fetch(`/api/payments/${selectedPayment.PAY_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        })
      } else {
        // Create new payment
        response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar el pago")
      }

      toast({
        title: "Éxito",
        description: selectedPayment
          ? "Pago actualizado correctamente"
          : "Pago registrado correctamente",
      })

      // Refresh payments, projects, and additions lists
      const [paymentsRes, projectsRes, additionsRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/projects"),
        fetch("/api/additions")
      ])

      const paymentsData = await paymentsRes.json()
      const orderedPayments = paymentsData.sort(
        (a: any, b: any) => new Date(b.PAY_payment_date).getTime() - new Date(a.PAY_payment_date).getTime()
      )
      setPayments(orderedPayments)

      const projectsJson = await projectsRes.json()
      setProjects(projectsJson.projects || [])
      const additionsData = await additionsRes.json()
      setAdditions(additionsData || [])

      setIsDialogOpen(false)
      setSelectedPayment(null)
      setFormData({
        PAY_payment_date: "",
        PAY_amount_paid: "",
        PAY_project_id: "",
        PAY_description: "",
      })
      updateInfo()
    } catch (error: any) {
      console.error("Error saving payment:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el pago",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
                ₡{sumPendingAmounts.toLocaleString()}
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
                    placeholder="Buscar por nombre de cliente o número de caso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="estado">Estado del Proyecto</Label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="Document Collection">Recepción de documentos</SelectItem>
                    <SelectItem value="Technical Inspection">Inspección técnica</SelectItem>
                    <SelectItem value="Document Review">Revisión de documentos</SelectItem>
                    <SelectItem value="Plans and Budget">Planos y presupuesto</SelectItem>
                    <SelectItem value="Entity Review">Revisión de entidad</SelectItem>
                    <SelectItem value="APC and Permits">APC y permisos</SelectItem>
                    <SelectItem value="Disbursement">Desembolso</SelectItem>
                    <SelectItem value="Under Construction">En construcción</SelectItem>
                    <SelectItem value="Completed">Completado</SelectItem>
                    <SelectItem value="Logbook Closed">Bitácora cerrada</SelectItem>
                    <SelectItem value="Rejected">Rechazado</SelectItem>
                    <SelectItem value="Professional Withdrawal">Retiro profesional</SelectItem>
                    <SelectItem value="Conditioned">Condicionado</SelectItem>
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
                    <TableHead>Estado del proyecto</TableHead>
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleView(payment)}
                            className="hover:bg-[#c9e077]/20"
                          >
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

        {/* Dialog para Crear/Editar/Ver Pago */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-[#2e4600]">
                {viewMode ? "Detalles del Pago" : (selectedPayment ? "Editar Pago" : "Registrar Nuevo Pago")}
              </DialogTitle>
              <DialogDescription>
                {viewMode 
                  ? "Información completa del pago registrado" 
                  : (selectedPayment ? "Modifica los datos del pago" : "Ingresa los detalles del nuevo pago")
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="proyecto">
                  Proyecto {!viewMode && <span className="text-red-500">*</span>}
                </Label>
                {viewMode ? (
                  <Input
                    value={(() => {
                      const project = projects.find(p => p.PRJ_id === Number(formData.PAY_project_id))
                      return project 
                        ? `${project.PRJ_case_number} - ${project.client_name} - ₡${Number(project.PRJ_budget || 0).toLocaleString()}`
                        : "N/A"
                    })()}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800 border-[#a2c523]/30"
                  />
                ) : (
                  <Select
                    value={formData.PAY_project_id}
                    onValueChange={(value) => setFormData({ ...formData, PAY_project_id: value })}
                  >
                    <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.PRJ_id} value={project.PRJ_id?.toString() || ""}>
                          {project.PRJ_case_number} - {project.client_name} - ₡{Number(project.PRJ_budget || 0).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fecha">
                    Fecha del pago {!viewMode && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="fecha"
                    type={viewMode ? "text" : "date"}
                    value={viewMode 
                      ? new Date(formData.PAY_payment_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : formData.PAY_payment_date
                    }
                    onChange={(e) => setFormData({ ...formData, PAY_payment_date: e.target.value })}
                    className={viewMode ? "bg-gray-50 dark:bg-gray-800 border-[#a2c523]/30" : "border-[#a2c523]/30 focus:border-[#486b00]"}
                    disabled={viewMode}
                    required={!viewMode}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monto">
                    Monto Pagado {!viewMode && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                    <Input
                      id="monto"
                      type={viewMode ? "text" : "number"}
                      placeholder="25000"
                      value={viewMode 
                        ? `₡${Number(formData.PAY_amount_paid).toLocaleString()}`
                        : formData.PAY_amount_paid
                      }
                      onChange={(e) => {
                        if (!viewMode) {
                          // Remove leading zeros and keep the numeric value
                          let value = e.target.value
                          if (value && !isNaN(Number(value))) {
                            value = String(Number(value))
                          }
                          setFormData({ ...formData, PAY_amount_paid: value })
                        }
                      }}
                      onBlur={(e) => {
                        if (!viewMode) {
                          // Format the value on blur to remove leading zeros
                          const value = e.target.value
                          if (value && !isNaN(Number(value))) {
                            setFormData({ ...formData, PAY_amount_paid: String(Number(value)) })
                          }
                        }
                      }}
                      className={viewMode ? "pl-10 bg-gray-50 dark:bg-gray-800 border-[#a2c523]/30" : "pl-10 border-[#a2c523]/30 focus:border-[#486b00]"}
                      disabled={viewMode}
                      required={!viewMode}
                      min={!viewMode ? "0" : undefined}
                      step={!viewMode ? "0.01" : undefined}
                    />
                  </div>
                </div>
              </div>

              {formData.PAY_project_id && (
                <div className="bg-[#c9e077]/20 p-3 rounded-md space-y-2">
                  {(() => {
                    const project = projects.find(p => p.PRJ_id === Number(formData.PAY_project_id))
                    const budget = Number(project?.PRJ_budget) || 0
                    const projectAdditions = additions.filter(a => a.ATN_project_id === Number(formData.PAY_project_id))
                    const totalAdditions = projectAdditions.reduce((sum, a) => sum + (a.ATN_cost || 0), 0)
                    const totalProjectCost = budget + totalAdditions

                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#2e4600]">Presupuesto inicial:</span>
                          <span className="font-semibold">₡{budget.toLocaleString()}</span>
                        </div>
                        {totalAdditions > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-[#2e4600]">Adiciones ({projectAdditions.length}):</span>
                            <span className="font-semibold">₡{totalAdditions.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm border-t border-[#486b00]/20 pt-2">
                          <span className="text-[#2e4600] font-medium">Costo total del proyecto:</span>
                          <span className="font-bold">₡{totalProjectCost.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-[#486b00]/20 pt-2">
                          <div className="text-sm font-medium text-[#2e4600]">
                            Saldo restante total:
                          </div>
                          <div className="text-2xl font-bold text-[#486b00]">
                            ₡{Number(project?.PRJ_remaining_amount || 0).toLocaleString()}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="detalle">Descripción del pago</Label>
                <Input
                  id="detalle"
                  placeholder={viewMode ? "Sin descripción" : "Descripción o notas adicionales..."}
                  value={formData.PAY_description || (viewMode ? "Sin descripción adicional" : "")}
                  onChange={(e) => setFormData({ ...formData, PAY_description: e.target.value })}
                  className={viewMode ? "bg-gray-50 dark:bg-gray-800 border-[#a2c523]/30" : "border-[#a2c523]/30 focus:border-[#486b00]"}
                  disabled={viewMode}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {viewMode ? (
                // 👁️ Modo Vista: Solo botón de cerrar
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedPayment(null)
                    setViewMode(false)
                    setFormData({
                      PAY_payment_date: "",
                      PAY_amount_paid: "",
                      PAY_project_id: "",
                      PAY_description: "",
                    })
                  }}
                  className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                >
                  Cerrar
                </Button>
              ) : (
                // ✏️ Modo Crear/Editar: Botones normales
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setSelectedPayment(null)
                      setFormData({
                        PAY_payment_date: "",
                        PAY_amount_paid: "",
                        PAY_project_id: "",
                        PAY_description: "",
                      })
                    }}
                    className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="gradient-primary text-white hover:opacity-90"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : (selectedPayment ? "Actualizar" : "Registrar")} Pago
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}