"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Edit, DollarSign, Calendar, CreditCard, Building, TrendingUp, Eye, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPAPayment } from "@/models/GPA_payment"
import { GPAProject } from "@/models/GPA_project"
import { GPAAddition } from "@/models/GPA_addition"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/formatters"

const metodoPago = {
  Transfer: "Transferencia",
  Check: "Cheque",
  Cash: "Efectivo",
  Card: "Tarjeta",
  SINPE: "SINPE",
  Credit: "Crédito",
  Debit: "Débito",
  Deposit: "Depósito",
}

type ProjectOrderBy =
  | "PRJ_case_number"
  | "client_name"
  | "type_name"
  | "PRJ_state"
  | "PRJ_start_construction_date"
  | "PRJ_completion_date"

type ProjectOrderDir = "ASC" | "DESC"
type PaymentOrderBy = "date" | "caseNumber" | "billNumber" | "client" | "method"
type PaymentOrderDir = "ASC" | "DESC"

export default function PagosPage() {
  const { isAdmin, getUserPermissions } = useAuth()
  const { toast } = useToast()
  const [payments, setPayments] = useState<GPAPayment[]>([])
  const [projects, setProjects] = useState<GPAProject[]>([])
  const [additions, setAdditions] = useState<GPAAddition[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("todos")
  const [appliedStateFilter, setAppliedStateFilter] = useState("todos")
  const [orderBy, setOrderBy] = useState<PaymentOrderBy>("date")
  const [orderDir, setOrderDir] = useState<PaymentOrderDir>("DESC")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalPayments, setTotalPayments] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState<GPAPayment | null>(null)
  const [paymentToDelete, setPaymentToDelete] = useState<GPAPayment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState(false)
  const [sumPendingAmounts, setSumPendingAmounts] = useState(0)
  const [deletingPayment, setDeletingPayment] = useState(false)

  useEffect(() => {
    // Actualiza sumPendingAmounts cada vez que projects cambie
    const total = projects.reduce((acc, project) => acc + Number(project.PRJ_remaining_amount || 0), 0)
    setSumPendingAmounts(total)
  }, [projects])
  const [projectsWithDue, setProjectsWithDue] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    PAY_payment_date: "",
    PAY_bill_number: "",
    PAY_amount_paid: "",
    PAY_method: "",
    PAY_project_id: "",
    PAY_description: "",
  })
  const [coverFullAmount, setCoverFullAmount] = useState(false)
  const [projectPickerItems, setProjectPickerItems] = useState<GPAProject[]>([])
  const [projectPickerLoading, setProjectPickerLoading] = useState(false)
  const [projectPickerPage, setProjectPickerPage] = useState(1)
  const [projectPickerTotalPages, setProjectPickerTotalPages] = useState(0)
  const [projectPickerTotalProjects, setProjectPickerTotalProjects] = useState(0)
  const [projectPickerSearchTerm, setProjectPickerSearchTerm] = useState("")
  const [projectPickerAppliedSearchTerm, setProjectPickerAppliedSearchTerm] = useState("")
  const [projectPickerOrderBy, setProjectPickerOrderBy] = useState<ProjectOrderBy>("PRJ_case_number")
  const [projectPickerOrderDir, setProjectPickerOrderDir] = useState<ProjectOrderDir>("ASC")

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

  const fetchPayments = async (
    targetPage: number,
    targetSearch: string,
    targetState: string,
    targetOrderBy: PaymentOrderBy,
    targetOrderDir: PaymentOrderDir,
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "10",
        search: targetSearch,
        state: targetState,
        orderBy: targetOrderBy,
        orderDir: targetOrderDir,
      })

      const response = await fetch(`/api/payments?${params.toString()}`)
      const data = await response.json()
      setPayments(data.payments || [])
      setTotalPages(data.totalPages || 0)
      setTotalPayments(data.totalPayments || 0)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = async () => {
    const nextSearch = searchTerm.trim()
    if (page === 1 && appliedSearchTerm === nextSearch && appliedStateFilter === stateFilter) {
      await fetchPayments(1, nextSearch, stateFilter, orderBy, orderDir)
      return
    }

    setPage(1)
    setAppliedSearchTerm(nextSearch)
    setAppliedStateFilter(stateFilter)
  }

  const handleClearFilters = async () => {
    if (
      !searchTerm
      && !appliedSearchTerm
      && stateFilter === "todos"
      && appliedStateFilter === "todos"
      && orderBy === "date"
      && orderDir === "DESC"
      && page === 1
    ) {
      await fetchPayments(1, "", "todos", "date", "DESC")
      return
    }

    setSearchTerm("")
    setAppliedSearchTerm("")
    setStateFilter("todos")
    setAppliedStateFilter("todos")
    setOrderBy("date")
    setOrderDir("DESC")
    setPage(1)
  }

  const fetchProjectPicker = async (
    targetPage: number,
    targetSearch: string,
    targetOrderBy: ProjectOrderBy,
    targetOrderDir: ProjectOrderDir,
  ) => {
    setProjectPickerLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "10",
        search: targetSearch,
        orderBy: targetOrderBy,
        orderDir: targetOrderDir,
      })

      const response = await fetch(`/api/projects?${params.toString()}`)
      const data = await response.json()
      setProjectPickerItems(data.projects || [])
      setProjectPickerTotalPages(data.totalPages || 0)
      setProjectPickerTotalProjects(data.totalProjects || 0)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los proyectos.",
        variant: "destructive",
      })
    } finally {
      setProjectPickerLoading(false)
    }
  }

  const handleApplyProjectPickerFilters = async () => {
    const nextSearch = projectPickerSearchTerm.trim()
    if (projectPickerPage === 1 && projectPickerAppliedSearchTerm === nextSearch) {
      await fetchProjectPicker(1, nextSearch, projectPickerOrderBy, projectPickerOrderDir)
      return
    }

    setProjectPickerPage(1)
    setProjectPickerAppliedSearchTerm(nextSearch)
  }

  const handleClearProjectPickerFilters = async () => {
    if (
      !projectPickerSearchTerm
      && !projectPickerAppliedSearchTerm
      && projectPickerPage === 1
      && projectPickerOrderBy === "PRJ_case_number"
      && projectPickerOrderDir === "ASC"
    ) {
      await fetchProjectPicker(1, "", "PRJ_case_number", "ASC")
      return
    }

    setProjectPickerSearchTerm("")
    setProjectPickerAppliedSearchTerm("")
    setProjectPickerPage(1)
    setProjectPickerOrderBy("PRJ_case_number")
    setProjectPickerOrderDir("ASC")
  }

  const getSelectedProject = () => {
    const projectId = Number(formData.PAY_project_id)
    if (!projectId) return undefined
    return projects.find((p) => p.PRJ_id === projectId) || projectPickerItems.find((p) => p.PRJ_id === projectId)
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, additionsRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/additions"),
        ])

        const projectsJson = await projectsRes.json()
        setProjects(projectsJson.projects || [])

        const additionsData = await additionsRes.json()
        setAdditions(additionsData || [])

        updateInfo()
      } catch (err) {
        console.error("Error fetching data:", err)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    fetchPayments(page, appliedSearchTerm, appliedStateFilter, orderBy, orderDir)
  }, [page, appliedSearchTerm, appliedStateFilter, orderBy, orderDir])

  useEffect(() => {
    if (isDialogOpen && !viewMode) {
      fetchProjectPicker(projectPickerPage, projectPickerAppliedSearchTerm, projectPickerOrderBy, projectPickerOrderDir)
    }
  }, [
    isDialogOpen,
    viewMode,
    projectPickerPage,
    projectPickerAppliedSearchTerm,
    projectPickerOrderBy,
    projectPickerOrderDir,
  ])

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
      PAY_method: payment.PAY_method || "",
      PAY_project_id: payment.PAY_project_id?.toString() || "",
      PAY_bill_number: payment.PAY_bill_number || "",
      PAY_description: payment.PAY_description || "",
    })
    setCoverFullAmount(false)
    setProjectPickerPage(1)
    setProjectPickerSearchTerm("")
    setProjectPickerAppliedSearchTerm("")
    setProjectPickerOrderBy("PRJ_case_number")
    setProjectPickerOrderDir("ASC")
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
      PAY_method: payment.PAY_method || "",
      PAY_project_id: payment.PAY_project_id?.toString() || "",
      PAY_description: payment.PAY_description || "",
      PAY_bill_number: payment.PAY_bill_number || "",
    })
    setCoverFullAmount(false)
    setViewMode(true)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedPayment(null)
    setFormData({
      PAY_payment_date: "",
      PAY_bill_number: "",
      PAY_amount_paid: "",
      PAY_method: "",
      PAY_project_id: "",
      PAY_description: "",
    })
    setCoverFullAmount(false)
    setProjectPickerPage(1)
    setProjectPickerSearchTerm("")
    setProjectPickerAppliedSearchTerm("")
    setProjectPickerOrderBy("PRJ_case_number")
    setProjectPickerOrderDir("ASC")
    setViewMode(false)
    setIsDialogOpen(true)
  }

  const handleRequestDelete = (payment: GPAPayment) => {
    setPaymentToDelete(payment)
    setIsDeleteDialogOpen(true)
  }

  const handleDeletePayment = async () => {
    if (!paymentToDelete?.PAY_id) return

    try {
      setDeletingPayment(true)
      const response = await fetch(`/api/payments/${paymentToDelete.PAY_id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "No se pudo eliminar el pago",
          variant: "destructive"
        })
      }

      toast({
        title: "Éxito",
        description: "Pago eliminado correctamente",
        variant: "success",
      })

      const [projectsRes, additionsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/additions"),
      ])

      const projectsJson = await projectsRes.json()
      setProjects(projectsJson.projects || [])
      const additionsData = await additionsRes.json()
      setAdditions(additionsData || [])
      updateInfo()

      const nextPage = payments.length === 1 && page > 1 ? page - 1 : page
      if (nextPage !== page) {
        setPage(nextPage)
      } else {
        await fetchPayments(page, appliedSearchTerm, appliedStateFilter, orderBy, orderDir)
      }

      setIsDeleteDialogOpen(false)
      setPaymentToDelete(null)
    } catch (error: any) {
      console.error("Error deleting payment:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el pago",
        variant: "destructive",
      })
    } finally {
      setDeletingPayment(false)
    }
  }

  const calculateRemainingAmount = (projectId: number, currentPaymentAmount: number): number => {
    const project = projects.find(p => p.PRJ_id === projectId)
    if (!project || !project.PRJ_budget) return 0
    const RemainingAmount = project.PRJ_remaining_amount - currentPaymentAmount
    return Math.max(0, RemainingAmount)
  }

  const getMaxAllowedAmountForPayment = (projectId: number): number => {
    const project = projects.find((p) => p.PRJ_id === projectId) || projectPickerItems.find((p) => p.PRJ_id === projectId)
    const remainingAmount = Number(project?.PRJ_remaining_amount || 0)

    if (!selectedPayment) return remainingAmount

    const isSameProject = Number(selectedPayment.PAY_project_id) === projectId
    const oldPaymentAmount = Number(selectedPayment.PAY_amount_paid || 0)

    return isSameProject ? remainingAmount + oldPaymentAmount : remainingAmount
  }

  // Effect to handle "cover full amount" checkbox
  useEffect(() => {
    if (coverFullAmount && formData.PAY_project_id) {
      const project = getSelectedProject()
      if (project) {
        const remainingAmount = Number(project.PRJ_remaining_amount || 0)
        setFormData(prev => ({ ...prev, PAY_amount_paid: remainingAmount.toString() }))
      }
    }
  }, [coverFullAmount, formData.PAY_project_id, projects, projectPickerItems])

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

      if (!formData.PAY_method) {
        toast({
          title: "Error",
          description: "El método de pago es obligatorio",
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

      // Validate payment doesn't exceed remaining amount
      const project = getSelectedProject()
      const project_Id = Number(formData.PAY_project_id)
      const maxAllowedAmount = getMaxAllowedAmountForPayment(project_Id)
      const amountPaid = Number(formData.PAY_amount_paid)

      if (amountPaid > maxAllowedAmount) {
        toast({
          title: "Error",
          description: `El monto a pagar (${formatCurrency(amountPaid)}) excede el saldo permitido del proyecto (${formatCurrency(maxAllowedAmount)})`,
          variant: "destructive",
        })
        return
      }

      setSaving(true)

      const projectId = Number(formData.PAY_project_id)

      const paymentData = {
        PAY_payment_date: formData.PAY_payment_date,
        PAY_bill_number: formData.PAY_bill_number || null,
        PAY_amount_paid: amountPaid,
        PAY_method: formData.PAY_method,
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
        toast({
          title: "Error",
          description: error.error || "No se pudo guardar el pago.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Éxito",
        description: selectedPayment
          ? "Pago actualizado correctamente"
          : "Pago registrado correctamente",
      })

      // Refresh payments, projects, and additions lists
      const [projectsRes, additionsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/additions")
      ])

      const projectsJson = await projectsRes.json()
      setProjects(projectsJson.projects || [])
      const additionsData = await additionsRes.json()
      setAdditions(additionsData || [])

      await fetchPayments(page, appliedSearchTerm, appliedStateFilter, orderBy, orderDir)

      setIsDialogOpen(false)
      setSelectedPayment(null)
      setFormData({
        PAY_payment_date: "",
        PAY_bill_number: "",
        PAY_amount_paid: "",
        PAY_method: "",
        PAY_project_id: "",
        PAY_description: "",
      })
      setCoverFullAmount(false)
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
          {(getUserPermissions().some(p => p.screen === "pagos-nuevo" && p.permission_type === "Create") || isAdmin) && (
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
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIngresos)}</div>
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
                {formatCurrency(sumPendingAmounts)}
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
              <div className="text-2xl font-bold text-[#7d4427]">{totalPayments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-[#c9e077]/30">
          <CardHeader>
            <CardTitle className="text-[#2e4600]">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-12">
              <div className="md:col-span-4">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                  <Input
                    id="search"
                    placeholder="Buscar por nombre de cliente o número de caso..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                    className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <Label htmlFor="estado">Estado del Proyecto</Label>
                <Select value={stateFilter} onValueChange={(value) => {
                  setStateFilter(value)
                  setAppliedStateFilter(value)
                  setPage(1)
                }}>
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
              <div className="md:col-span-2">
                <Label>Ordenar por</Label>
                <Select value={orderBy} onValueChange={(value) => { setOrderBy(value as PaymentOrderBy); setPage(1) }}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Fecha</SelectItem>
                    <SelectItem value="caseNumber">Número de caso</SelectItem>
                    <SelectItem value="billNumber">Número de factura</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="method">Método</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Label>Dirección</Label>
                <Select value={orderDir} onValueChange={(value) => { setOrderDir(value as PaymentOrderDir); setPage(1) }}>
                  <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Desc</SelectItem>
                    <SelectItem value="ASC">Asc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end gap-2">
                <Button variant="secondary" className="btn-secondary" size="sm" onClick={handleApplyFilters}>
                  Filtrar
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Pagos */}
        <Card className="border-[#a2c523]/20">
          <CardHeader>
            <CardTitle className="text-[#2e4600]">Historial de Pagos ({totalPayments})</CardTitle>
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
                    <TableHead>Número de Factura</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado del proyecto</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment, index) => (
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
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.PAY_bill_number || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.projectClientName || "N/A"}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-[#2e4600]">{formatCurrency(payment.PAY_amount_paid)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#a2c523] text-[#486b00]">
                          {metodoPago[payment.PAY_method as keyof typeof metodoPago] || "N/A"}
                        </Badge>
                      </TableCell>
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
                          {(getUserPermissions().some((p) => p.screen === "pagos" && p.permission_type === "Edit") || isAdmin) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(payment)}
                              className="hover:bg-[#c9e077]/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {(getUserPermissions().some((p) => p.screen === "pagos" && p.permission_type === "Edit") || isAdmin) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRequestDelete(payment)}
                              className="hover:bg-red-100 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
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
              Mostrando {payments.length} de {totalPayments} pagos del filtro actual
            </div>
          </CardContent>
        </Card>

        {/* Dialog para Crear/Editar/Ver Pago */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={viewMode ? "sm:max-w-[700px]" : "sm:max-w-[1100px] max-h-[90vh] overflow-hidden"}>
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
            <ScrollArea className={viewMode ? "max-h-[70vh] pr-4" : "max-h-[65vh] pr-4"}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                <Label htmlFor="proyecto">
                  Proyecto {!viewMode && <span className="text-red-500">*</span>}
                </Label>
                {viewMode ? (
                  <Input
                    value={(() => {
                      const project = getSelectedProject()
                      return project
                        ? `${project.PRJ_case_number} - ${project.client_name} - ${formatCurrency(project.PRJ_budget)}`
                        : "N/A"
                    })()}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800 border-[#a2c523]/30"
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="grid gap-3 md:grid-cols-12">
                      <div className="md:col-span-6">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#486b00]" />
                          <Input
                            placeholder="Buscar por caso, cliente o tipo..."
                            value={projectPickerSearchTerm}
                            onChange={(e) => setProjectPickerSearchTerm(e.target.value)}
                            className="pl-8 border-[#a2c523]/30 focus:border-[#486b00]"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="secondary" className="btn-secondary" size="sm" onClick={handleApplyProjectPickerFilters}>
                            Filtrar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearProjectPickerFilters}
                            disabled={
                              !projectPickerSearchTerm
                              && !projectPickerAppliedSearchTerm
                              && projectPickerPage === 1
                              && projectPickerOrderBy === "PRJ_case_number"
                              && projectPickerOrderDir === "ASC"
                            }
                          >
                            Limpiar
                          </Button>
                        </div>
                      </div>

                      <div className="md:col-span-4">
                        <Label className="mb-2 block">Ordenar por</Label>
                        <Select value={projectPickerOrderBy} onValueChange={(value) => setProjectPickerOrderBy(value as ProjectOrderBy)}>
                          <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRJ_case_number">Número de caso</SelectItem>
                            <SelectItem value="client_name">Nombre de cliente</SelectItem>
                            <SelectItem value="type_name">Tipo</SelectItem>
                            <SelectItem value="PRJ_state">Estado</SelectItem>
                            <SelectItem value="PRJ_start_construction_date">Fecha de inicio</SelectItem>
                            <SelectItem value="PRJ_completion_date">Fecha de conclusión</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label className="mb-2 block">Dirección</Label>
                        <Select value={projectPickerOrderDir} onValueChange={(value) => setProjectPickerOrderDir(value as ProjectOrderDir)}>
                          <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DESC">Descendente</SelectItem>
                            <SelectItem value="ASC">Ascendente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border rounded-md border-[#a2c523]/30">
                      <ScrollArea className="h-[200px]">
                        {projectPickerLoading ? (
                          <div className="p-4 text-center text-muted-foreground">Cargando proyectos...</div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Número de Caso</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Presupuesto</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {projectPickerItems.map((project) => (
                                <TableRow
                                  key={project.PRJ_id}
                                  className={`cursor-pointer hover:bg-[#c9e077]/10 ${Number(formData.PAY_project_id) === project.PRJ_id ? "bg-[#c9e077]/20" : ""}`}
                                  onClick={() => setFormData((prev) => ({ ...prev, PAY_project_id: String(project.PRJ_id || "") }))}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={Number(formData.PAY_project_id) === project.PRJ_id}
                                      onCheckedChange={() => setFormData((prev) => ({ ...prev, PAY_project_id: String(project.PRJ_id || "") }))}
                                    />
                                  </TableCell>
                                  <TableCell>{project.PRJ_case_number}</TableCell>
                                  <TableCell>{project.client_name}</TableCell>
                                  <TableCell>{formatCurrency(project.PRJ_budget)}</TableCell>
                                </TableRow>
                              ))}
                              {projectPickerItems.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No se encontraron proyectos
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </ScrollArea>
                    </div>

                    {projectPickerTotalPages > 1 && (
                      <div className="flex flex-wrap justify-center items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectPickerPage((prev) => Math.max(1, prev - 1))}
                          disabled={projectPickerPage === 1}
                        >
                          Anterior
                        </Button>

                        {Array.from({ length: projectPickerTotalPages }, (_, index) => index + 1).map((pageNumber) => (
                          <Button
                            key={pageNumber}
                            variant={pageNumber === projectPickerPage ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setProjectPickerPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProjectPickerPage((prev) => Math.min(projectPickerTotalPages, prev + 1))}
                          disabled={projectPickerPage === projectPickerTotalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}

                    <div className="text-center text-xs text-muted-foreground">
                      Mostrando {projectPickerItems.length} de {projectPickerTotalProjects} proyectos
                    </div>
                  </div>
                )}
              </div>
                <div>
                <label htmlFor="numero-factura">
                  Número de Factura
                </label>
                <Input
                  id="numero-factura"
                  type={viewMode ? "text" : "text"}
                  placeholder="0001"
                  value={viewMode
                    ? formData.PAY_bill_number
                    : formData.PAY_bill_number
                  }
                  onChange={(e) => {
                    if (!viewMode) {
                      let value = e.target.value
                      setFormData({ ...formData, PAY_bill_number: value })
                    }
                  }}
                  className={viewMode ? "bg-gray-50 dark:bg-gray-800 border-[#a2c523]/30" : " border-[#a2c523]/30 focus:border-[#486b00]"}
                  disabled={viewMode}
                  required={!viewMode}
                  min={!viewMode ? "0" : undefined}
                  step={!viewMode ? "0.01" : undefined}
                />
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
                        ? formatCurrency(formData.PAY_amount_paid)
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
                      disabled={viewMode || coverFullAmount}
                      required={!viewMode}
                      min={!viewMode ? "0" : undefined}
                      step={!viewMode ? "0.01" : undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Método de pago */}
                <div className="grid gap-2">
                <Label htmlFor="metodo">
                  Método de Pago {!viewMode && <span className="text-red-500">*</span>}
                </Label>
                {viewMode ? (
                  <Input
                    value={metodoPago[formData.PAY_method as keyof typeof metodoPago] || "N/A"}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800 border-[#a2c523]/30"
                  />
                ) : (
                  <Select
                    value={formData.PAY_method}
                    onValueChange={(value) => setFormData({ ...formData, PAY_method: value })}
                  >
                    <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                      <SelectValue placeholder="Seleccionar método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transfer">Transferencia</SelectItem>
                      <SelectItem value="SINPE">SINPE</SelectItem>
                      <SelectItem value="Check">Cheque</SelectItem>
                      <SelectItem value="Cash">Efectivo</SelectItem>
                      <SelectItem value="Card">Tarjeta</SelectItem>
                      <SelectItem value="Credit">Crédito</SelectItem>
                      <SelectItem value="Debit">Débito</SelectItem>
                      <SelectItem value="Deposit">Depósito</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Opción de cubrir monto completo - solo visible al crear */}
                {!viewMode && !selectedPayment && formData.PAY_project_id && (
                <div className="flex items-center space-x-2 bg-[#c9e077]/10 p-3 rounded-md">
                  <Checkbox
                    id="coverFullAmount"
                    checked={coverFullAmount}
                    onCheckedChange={(checked) => setCoverFullAmount(checked as boolean)}
                  />
                  <Label
                    htmlFor="coverFullAmount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Cubrir todo el saldo restante del proyecto
                  </Label>
                </div>
              )}

                {formData.PAY_project_id && (
                <div className="bg-[#c9e077]/20 p-3 rounded-md space-y-2">
                  {(() => {
                    const project = getSelectedProject()
                    const budget = Number(project?.PRJ_budget) || 0
                    const projectAdditions = additions.filter(a => a.ATN_project_id === Number(formData.PAY_project_id))
                    const totalAdditions = projectAdditions.reduce((sum, a) => sum + (a.ATN_cost || 0), 0)
                    const totalProjectCost = budget + totalAdditions

                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#2e4600]">Presupuesto inicial:</span>
                          <span className="font-semibold">{formatCurrency(budget)}</span>
                        </div>
                        {totalAdditions > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-[#2e4600]">Adiciones ({projectAdditions.length}):</span>
                            <span className="font-semibold">{formatCurrency(totalAdditions)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm border-t border-[#486b00]/20 pt-2">
                          <span className="text-[#2e4600] font-medium">Costo total del proyecto:</span>
                          <span className="font-bold">{formatCurrency(totalProjectCost)}</span>
                        </div>
                        <div className="border-t border-[#486b00]/20 pt-2">
                          <div className="text-sm font-medium text-[#2e4600]">
                            Saldo restante total:
                          </div>
                          <div className="text-2xl font-bold text-[#486b00]">
                            {formatCurrency(project?.PRJ_remaining_amount)}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Advertencia si el monto excede el saldo restante */}
                {!viewMode && formData.PAY_project_id && formData.PAY_amount_paid && (
                (() => {
                  const project = getSelectedProject()
                  const projectId = Number(formData.PAY_project_id)
                  const remainingAmount = getMaxAllowedAmountForPayment(projectId)
                  const amountPaid = Number(formData.PAY_amount_paid)

                  if (amountPaid > remainingAmount) {
                    return (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          ⚠️ El monto a pagar ({formatCurrency(amountPaid)}) excede el saldo restante del proyecto ({formatCurrency(remainingAmount)})
                        </p>
                      </div>
                    )
                  }
                  return null
                })()
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
            </ScrollArea>
            <div className="flex justify-end space-x-2">
              {viewMode ? (
                // 👁️ Modo Vista: Solo botón de cerrar
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setSelectedPayment(null)
                    setViewMode(false)
                    setCoverFullAmount(false)
                    setFormData({
                      PAY_payment_date: "",
                      PAY_bill_number: "",
                      PAY_amount_paid: "",
                      PAY_method: "",
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
                      setCoverFullAmount(false)
                      setFormData({
                        PAY_payment_date: "",
                        PAY_bill_number: "",
                        PAY_amount_paid: "",
                        PAY_method: "",
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

        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open)
            if (!open) setPaymentToDelete(null)
          }}
        >
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-red-600">Eliminar pago</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Se eliminará el pago
                {paymentToDelete?.PAY_bill_number ? ` de  ${paymentToDelete?.PAY_amount_paid} con factura ${paymentToDelete.PAY_bill_number} del proyecto con numero de caso ${paymentToDelete.projectCaseNumber}` : " seleccionado"}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setPaymentToDelete(null)
                }}
                disabled={deletingPayment}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePayment}
                disabled={deletingPayment}
              >
                {deletingPayment ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}