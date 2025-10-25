"use client"

import type React from "react"
import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ProjectDocumentManager } from "@/components/project-document-manager"
import { ArrowLeft, Save, Building, Calendar, DollarSign, MapPin, FileText, Trash2, Plus, Edit } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { GPAProject } from "@/models/GPA_project"
import { CostaRicaLocationSelect } from "@/components/ui/costarica-location-select"
import { GPAClient } from '@/models/GPA_client'
import { ClientSelector } from "@/components/client-selector"
import { useToast } from "@/hooks/use-toast"
import { ProjectTypeManager } from "@/components/projectTypeManager"
import { Category, ProjectCategoryTags } from "@/components/projectCategoryTags"

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const clientFieldRef = useRef<HTMLDivElement>(null)
  const { id } = use(params)

  // Principal states
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [project, setProject] = useState<GPAProject | null>(null)
  const [pagos, setPagos] = useState<any[]>([])
  const [costosExtra, setCostosExtra] = useState<any[]>([])
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false)
  const [isCostoDialogOpen, setIsCostoDialogOpen] = useState(false)
  const [selectedPago, setSelectedPago] = useState<any>(null)
  const [selectedCosto, setSelectedCosto] = useState<any>(null)
  const [savingPago, setSavingPago] = useState(false)
  const [savingCosto, setSavingCosto] = useState(false)
  const [coverFullAmount, setCoverFullAmount] = useState(false)
  
  // Form data para pagos
  const [pagoFormData, setPagoFormData] = useState({
    PAY_payment_date: "",
    PAY_amount_paid: "",
    PAY_method: "",
    PAY_description: "",
  })
  
  // Form data para costos extra
  const [costoFormData, setCostoFormData] = useState({
    ATN_name: "",
    ATN_description: "",
    ATN_cost: "",
    ATN_date: "",
  })

  // Form states
  const [province, setProvince] = useState("")
  const [canton, setCanton] = useState("")
  const [district, setDistrict] = useState("")
  const [state, setState] = useState<GPAProject["PRJ_state"]>("Document Collection")
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [clientSelected, setClientSelected] = useState<number | null>(null)
  const [clientSelectedObj, setClientSelectedObj] = useState<GPAClient | null>(null)
  const [clients, setClients] = useState<GPAClient[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [projectTypeId, setProjectTypeId] = useState<number | null>(null)
  const [assignedCategories, setAssignedCategories] = useState<Category[]>([])
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [filter, setFilter] = useState("")
  const [newCat, setNewCat] = useState("")
  const [allCategories, setAllCategories] = useState<Category[]>([])

  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      setFetchingData(true)
      try {
        const response = await fetch(`/api/projects/${id}`)
        if (!response.ok) throw new Error("No se pudo cargar el proyecto")
        const data = await response.json()
        setProject(data.project)
        setProvince(data.project.PRJ_province ?? "")
        setCanton(data.project.PRJ_canton ?? "")
        setDistrict(data.project.PRJ_district ?? "")
        setState(data.project.PRJ_state ?? "Document Collection")
        setProjectTypeId(data.project.PRJ_type_id ?? null)
        setAssignedCategories(
          (data.project.categories ?? []).map((cat: any) => ({
            id: cat.CAT_id,
            name: cat.CAT_name,
          }))
        )
        setClientSelected(data.project.PRJ_client_id ?? null)
        const responseClient = await fetch(`/api/clients/${data.project.PRJ_client_id}`)
        if (responseClient.ok) {
          const clientData = await responseClient.json() as { client: GPAClient | null }
          setClientSelectedObj(clientData.client ?? null)
        }
        
        // Cargar pagos del proyecto
        const paymentsRes = await fetch(`/api/payments?project_id=${id}`)
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json()
          setPagos(paymentsData || [])
        }
        
        // Cargar costos extra del proyecto
        const additionsRes = await fetch(`/api/additions?project_id=${id}`)
        if (additionsRes.ok) {
          const additionsData = await additionsRes.json()
          setCostosExtra(additionsData || [])
        }
      } catch (error) {
        router.push("/proyectos")
      } finally {
        setFetchingData(false)
      }
    }
    fetchProject()
  }, [id, router])

  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true)
      try {
        const response = await fetch("/api/clients")
        const data = await response.json()
        setClients(data.clients)
      } catch {
        setClients([])
      } finally {
        setClientsLoading(false)
      }
    }
    if (clientDialogOpen) fetchClients()
  }, [clientDialogOpen])

  // Load all categories for assignment
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        const categories: Category[] = data.map((cat: any) => ({
          id: cat.CAT_id,
          name: cat.CAT_name,
        }))
        setAllCategories(categories)
      } catch {
        setAllCategories([])
      }
    }
    fetchCategories()
  }, [])

  // Categories handlers
  const handleRemoveCategory = (id: number) => {
    setAssignedCategories(cats => cats.filter(c => c.id !== id))
  }
  const handleAssignCategory = (cat: Category) => {
    setAssignedCategories(cats => [...cats, cat])
    setCatDialogOpen(false)
    setFilter("")
  }
  const handleCreateCategory = async (name: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CAT_name: name }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Ocurrió un error al crear la categoría.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }
      const newCatObj: Category = {
        id: data.categoryId,
        name,
      }
      setAllCategories(cats => [...cats, newCatObj])
      setNewCat("")
      setFilter("")
      toast({
        title: "Categoría creada",
        description: "La categoría fue creada correctamente.",
        variant: "success"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la categoría.",
        variant: "destructive"
      })
    }
    setLoading(false)
  }
  
  // Effect para manejar el checkbox de "cubrir monto completo"
  useEffect(() => {
    if (coverFullAmount && project) {
      const remainingAmount = Number(project.PRJ_remaining_amount || 0)
      setPagoFormData(prev => ({ ...prev, PAY_amount_paid: remainingAmount.toString() }))
    }
  }, [coverFullAmount, project])

  // Lógica de pagos y costos extra
  const handleNewPago = () => {
    setSelectedPago(null)
    setPagoFormData({
      PAY_payment_date: "",
      PAY_amount_paid: "",
      PAY_method: "",
      PAY_description: "",
    })
    setCoverFullAmount(false)
    setIsPagoDialogOpen(true)
  }
  
  const handleEditPago = (pago: any) => {
    setSelectedPago(pago)
    setPagoFormData({
      PAY_payment_date: pago.PAY_payment_date
        ? new Date(pago.PAY_payment_date).toISOString().split('T')[0]
        : "",
      PAY_amount_paid: pago.PAY_amount_paid?.toString() || "",
      PAY_method: pago.PAY_method || "",
      PAY_description: pago.PAY_description || "",
    })
    setCoverFullAmount(false)
    setIsPagoDialogOpen(true)
  }
  
  const handleDeletePago = async (pagoId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pago?")) {
      return
    }
    
    try {
      const response = await fetch(`/api/payments/${pagoId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error("Error al eliminar el pago")
      }
      
      toast({
        title: "Pago eliminado",
        description: "El pago fue eliminado correctamente",
        variant: "success"
      })
      
      // Recargar pagos
      const paymentsRes = await fetch(`/api/payments?project_id=${id}`)
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPagos(paymentsData || [])
      }
      
      // Recargar proyecto para actualizar saldo
      const projectRes = await fetch(`/api/projects/${id}`)
      if (projectRes.ok) {
        const data = await projectRes.json()
        setProject(data.project)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago",
        variant: "destructive"
      })
    }
  }
  
  const handleSavePago = async () => {
    try {
      // Validación
      if (!pagoFormData.PAY_payment_date) {
        toast({
          title: "Error",
          description: "La fecha de pago es obligatoria",
          variant: "destructive",
        })
        return
      }

      if (!pagoFormData.PAY_amount_paid || Number(pagoFormData.PAY_amount_paid) <= 0) {
        toast({
          title: "Error",
          description: "El monto pagado es obligatorio y debe ser mayor a 0",
          variant: "destructive",
        })
        return
      }

      if (!pagoFormData.PAY_method) {
        toast({
          title: "Error",
          description: "El método de pago es obligatorio",
          variant: "destructive",
        })
        return
      }

      // Validar que no exceda el saldo restante
      const remainingAmount = Number(project?.PRJ_remaining_amount || 0)
      const amountPaid = Number(pagoFormData.PAY_amount_paid)

      if (amountPaid > remainingAmount) {
        toast({
          title: "Error",
          description: `El monto a pagar (₡${amountPaid.toLocaleString()}) excede el saldo restante del proyecto (₡${remainingAmount.toLocaleString()})`,
          variant: "destructive",
        })
        return
      }

      setSavingPago(true)

      const paymentData = {
        PAY_payment_date: pagoFormData.PAY_payment_date,
        PAY_amount_paid: amountPaid,
        PAY_method: pagoFormData.PAY_method,
        PAY_project_id: Number(id),
        PAY_description: pagoFormData.PAY_description || null,
      }
      
      let response
      if (selectedPago?.PAY_id) {
        // Actualizar pago existente
        response = await fetch(`/api/payments/${selectedPago.PAY_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        })
      } else {
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
        description: selectedPago
          ? "Pago actualizado correctamente"
          : "Pago registrado correctamente",
        variant: "success"
      })

      // Recargar pagos
      const paymentsRes = await fetch(`/api/payments?project_id=${id}`)
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPagos(paymentsData || [])
      }
      
      // Recargar proyecto para actualizar saldo
      const projectRes = await fetch(`/api/projects/${id}`)
      if (projectRes.ok) {
        const data = await projectRes.json()
        setProject(data.project)
      }

      setIsPagoDialogOpen(false)
      setSelectedPago(null)
      setPagoFormData({
        PAY_payment_date: "",
        PAY_amount_paid: "",
        PAY_method: "",
        PAY_description: "",
      })
      setCoverFullAmount(false)
    } catch (error: any) {
      console.error("Error saving payment:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el pago",
        variant: "destructive",
      })
    } finally {
      setSavingPago(false)
    }
  }
  
  const handleNewCosto = () => {
    setSelectedCosto(null)
    setCostoFormData({
      ATN_name: "",
      ATN_description: "",
      ATN_cost: "",
      ATN_date: "",
    })
    setIsCostoDialogOpen(true)
  }
  
  const handleEditCosto = (costo: any) => {
    setSelectedCosto(costo)
    setCostoFormData({
      ATN_name: costo.ATN_name || "",
      ATN_description: costo.ATN_description || "",
      ATN_cost: costo.ATN_cost?.toString() || "",
      ATN_date: costo.ATN_date
        ? new Date(costo.ATN_date).toISOString().split('T')[0]
        : "",
    })
    setIsCostoDialogOpen(true)
  }
  
  const handleDeleteCosto = async (costoId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este costo extra?")) {
      return
    }
    
    try {
      // Verificar si el costo ya fue pagado
      const costo = costosExtra.find(c => c.ATN_id === costoId)
      if (!costo) return
      
      // Calcular cuánto del presupuesto original ya fue pagado
      const presupuestoBase = Number(project?.PRJ_budget || 0)
      const totalCostosExtra = costosExtra.reduce((sum, c) => sum + (Number(c.ATN_cost) || 0), 0)
      const presupuestoTotal = presupuestoBase + totalCostosExtra
      const totalPagado = pagos.reduce((sum, p) => sum + (Number(p.PAY_amount_paid) || 0), 0)
      
      // Si el total pagado excede el presupuesto base, significa que se ha pagado parte de los costos extra
      if (totalPagado > presupuestoBase) {
        const montoPagadoEnCostosExtra = totalPagado - presupuestoBase
        
        // Calcular qué proporción del costo a eliminar ya fue pagado
        // Si hay múltiples costos extra, distribuimos proporcionalmente
        const proporcionCostoActual = Number(costo.ATN_cost) / totalCostosExtra
        const montoPagadoEsteCosto = montoPagadoEnCostosExtra * proporcionCostoActual
        
        if (montoPagadoEsteCosto > 0) {
          toast({
            title: "No se puede eliminar",
            description: `Este costo extra ya fue pagado ${montoPagadoEsteCosto >= Number(costo.ATN_cost) ? 'completamente' : 'parcialmente'} (₡${Math.round(montoPagadoEsteCosto).toLocaleString()} de ₡${Number(costo.ATN_cost).toLocaleString()})`,
            variant: "destructive",
          })
          return
        }
      }
      
      const response = await fetch(`/api/additions/${costoId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error("Error al eliminar el costo")
      }
      
      toast({
        title: "Costo eliminado",
        description: "El costo extra fue eliminado correctamente",
        variant: "success"
      })
      
      // Recargar costos
      const additionsRes = await fetch(`/api/additions?project_id=${id}`)
      if (additionsRes.ok) {
        const additionsData = await additionsRes.json()
        setCostosExtra(additionsData || [])
      }
      
      // Recargar proyecto para actualizar presupuesto total
      const projectRes = await fetch(`/api/projects/${id}`)
      if (projectRes.ok) {
        const data = await projectRes.json()
        setProject(data.project)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el costo",
        variant: "destructive"
      })
    }
  }
  
  const handleSaveCosto = async () => {
    try {
      // Validación
      if (!costoFormData.ATN_name || costoFormData.ATN_name.trim() === "") {
        toast({
          title: "Error",
          description: "El nombre del costo es obligatorio",
          variant: "destructive",
        })
        return
      }

      if (!costoFormData.ATN_cost || Number(costoFormData.ATN_cost) <= 0) {
        toast({
          title: "Error",
          description: "El costo debe ser mayor a 0",
          variant: "destructive",
        })
        return
      }

      if (!costoFormData.ATN_date) {
        toast({
          title: "Error",
          description: "La fecha es obligatoria",
          variant: "destructive",
        })
        return
      }

      setSavingCosto(true)

      const additionData = {
        ATN_name: costoFormData.ATN_name.trim(),
        ATN_description: costoFormData.ATN_description?.trim() || "",
        ATN_cost: Number(costoFormData.ATN_cost),
        ATN_date: costoFormData.ATN_date,
        ATN_project_id: Number(id),
      }
      
      let response
      if (selectedCosto?.ATN_id) {
        // Actualizar costo existente
        response = await fetch(`/api/additions/${selectedCosto.ATN_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(additionData),
        })
      } else {
        // Crear nuevo costo
        response = await fetch("/api/additions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(additionData),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al guardar el costo")
      }

      toast({
        title: "Éxito",
        description: selectedCosto
          ? "Costo actualizado correctamente"
          : "Costo registrado correctamente",
        variant: "success"
      })

      // Recargar costos y pagos en paralelo
      const [additionsRes, paymentsRes, projectRes] = await Promise.all([
        fetch(`/api/additions?project_id=${id}`),
        fetch(`/api/payments?project_id=${id}`),
        fetch(`/api/projects/${id}`)
      ])
      
      const additionsData = additionsRes.ok ? await additionsRes.json() : []
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : []
      
      setCostosExtra(additionsData)
      setPagos(paymentsData)
      
      if (projectRes.ok) {
        const data = await projectRes.json()
        const updatedProject = data.project
        
        // Recalcular PRJ_remaining_amount basado en los datos actualizados
        const totalAdditions = additionsData.reduce((sum: number, a: any) => sum + (Number(a.ATN_cost) || 0), 0)
        const totalPaid = paymentsData.reduce((sum: number, p: any) => sum + (Number(p.PAY_amount_paid) || 0), 0)
        updatedProject.PRJ_remaining_amount = (Number(updatedProject.PRJ_budget) || 0) + totalAdditions - totalPaid
        
        setProject(updatedProject)
      }

      setIsCostoDialogOpen(false)
      setSelectedCosto(null)
      setCostoFormData({
        ATN_name: "",
        ATN_description: "",
        ATN_cost: "",
        ATN_date: "",
      })
    } catch (error: any) {
      console.error("Error saving addition:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el costo",
        variant: "destructive",
      })
    } finally {
      setSavingCosto(false)
    }
  }

  // Categorías disponibles para asignar
  const assignedIds = assignedCategories.map(c => c.id)
  const available = allCategories.filter(
    c => !assignedIds.includes(c.id) && c.name.toLowerCase().includes(filter.toLowerCase())
  )

  if (!isAdmin) {
    router.push("/proyectos")
    return null
  }

  if (fetchingData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#486b00] mr-4" />
          <span className="text-muted-foreground">Cargando información del proyecto...</span>
        </div>
      </MainLayout>
    )
  }

  if (!project) return null

  // Submit para actualizar el proyecto
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setClientError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (!clientSelectedObj || typeof clientSelectedObj.CLI_id !== "number") {
      setClientError("⚠️ Debe seleccionar un cliente válido")
      setLoading(false)
      clientFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (!projectTypeId) {
      setLoading(false)
      return
    }
    // Construir objeto actualizado
    const updatedProject: GPAProject = {
      ...project,
      PRJ_entry_date: project.PRJ_entry_date ? String(project.PRJ_entry_date).substring(0, 10) : undefined,
      PRJ_case_number: formData.get("caseNumber") as string,
      PRJ_area_m2: formData.get("area") ? Number(formData.get("area")) : undefined,
      PRJ_state: state as GPAProject["PRJ_state"],
      PRJ_budget: formData.get("budget") ? Number(formData.get("budget")) : undefined,
      PRJ_start_construction_date: formData.get("startConstructionDate") ? formData.get("startConstructionDate") as string : undefined,
      PRJ_completion_date: formData.get("completionDate") ? formData.get("completionDate") as string : undefined,
      PRJ_province: province,
      PRJ_canton: canton,
      PRJ_district: district,
      PRJ_neighborhood: formData.get("neighborhood") as string,
      PRJ_additional_directions: formData.get("additionalDirections") as string,
      PRJ_notes: formData.get("notes") as string,
      PRJ_type_id: projectTypeId!,
      PRJ_client_id: clientSelectedObj.CLI_id,
      PRJ_logbook_close_date: formData.get("logbookCloseDate") ? formData.get("logbookCloseDate") as string : undefined,
      PRJ_logbook_number: formData.get("logbookNumber") as string,
      categories: assignedCategories.map(cat => ({
        CAT_id: cat.id,
        CAT_name: cat.name,
      })),
    }
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProject),
      })
      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Error actualizando el proyecto"
        throw new Error(errorMessage)
      }
      toast({
        title: "Proyecto Actualizado",
        description: "Los cambios fueron guardados correctamente",
        variant: "success"
      })
      router.push(`/proyectos/${id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el proyecto.",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/proyectos")} className="hover:bg-[#c9e077]/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              Editar Proyecto: {project.PRJ_case_number}
            </h1>
            <p className="text-muted-foreground">Modifica los datos del proyecto</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <Card className="card-hover border-[#a2c523]/20">
              <CardHeader className="gradient-primary text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Información del Proyecto
                </CardTitle>
                <CardDescription className="text-white/80">Datos básicos del proyecto arquitectónico</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseNumber" className="text-[#2e4600] font-medium">
                      Número de caso *
                    </Label>
                    <Input
                      id="caseNumber"
                      name="caseNumber"
                      defaultValue={project.PRJ_case_number ?? ""}
                      placeholder="Ej: 1256"
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-[#2e4600] font-medium">
                      Área en m<sup>2</sup>
                    </Label>
                    <Input
                      id="area"
                      name="area"
                      defaultValue={project.PRJ_area_m2 ?? ""}
                      placeholder="Ej: 22.5"
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-[#2e4600] font-medium">
                      Estado
                    </Label>
                    <Select
                      value={state}
                      onValueChange={(value) => setState(value as GPAProject["PRJ_state"])}
                    >
                      <SelectTrigger id="state" className="border-[#a2c523]/30 focus:border-[#486b00]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Document Collection">Recolección de Documentos</SelectItem>
                        <SelectItem value="Technical Inspection">Inspección Técnica</SelectItem>
                        <SelectItem value="Document Review">Revisión de Documentos</SelectItem>
                        <SelectItem value="Plans and Budget">Planos y Presupuesto</SelectItem>
                        <SelectItem value="Entity Review">Revisión de Entidad Financiera</SelectItem>
                        <SelectItem value="APC and Permits">APC y Permisos</SelectItem>
                        <SelectItem value="Disbursement">Desembolso</SelectItem>
                        <SelectItem value="Under Construction">En Construcción</SelectItem>
                        <SelectItem value="Completed">Completado</SelectItem>
                        <SelectItem value="Logbook Closed">Bitácora Cerrada</SelectItem>
                        <SelectItem value="Rejected">Rechazado</SelectItem>
                        <SelectItem value="Professional Withdrawal">Retiro Profesional</SelectItem>
                        <SelectItem value="Conditioned">Condicionado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Cliente */}
                <div className="space-y-2" ref={clientFieldRef}>
                  <Label className="text-[#2e4600] font-medium">Cliente *</Label>
                  <div
                    className={`flex gap-0 rounded-md overflow-hidden border ${clientError
                      ? "border-yellow-400 ring-2 ring-yellow-400/50"
                      : "border-[#a2c523]/30 focus-within:border-[#486b00]"
                      } bg-gray-100 dark:bg-[#232d1c]`}
                  >
                    <Input
                      value={
                        clientSelectedObj
                          ? `${clientSelectedObj.CLI_name} ${clientSelectedObj.CLI_f_lastname ?? ""} ${clientSelectedObj.CLI_s_lastname ?? ""} - ${clientSelectedObj.CLI_identification}`
                          : ""
                      }
                      placeholder="Seleccione un cliente"
                      readOnly
                      className="border-none focus:ring-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground rounded-none cursor-not-allowed select-none"
                      tabIndex={-1}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setClientDialogOpen(true)}
                      className="rounded-none border-l border-[#a2c523]/30 bg-gray-200 dark:bg-[#2e3a23] hover:bg-[#c9e077]/30 dark:hover:bg-[#384d2b] text-foreground"
                      style={{ minWidth: 100 }}
                    >
                      Seleccionar
                    </Button>
                  </div>
                  {!clientSelectedObj && (
                    <p className="text-yellow-600 text-sm font-medium">
                      ⚠️ Debe seleccionar un cliente
                    </p>
                  )}
                </div>
                <ProjectTypeManager value={projectTypeId} onChange={setProjectTypeId} />
                {/* Categorías */}
                <div className="space-y-2">
                  <Label className="text-[#2e4600] font-medium">Categorías asignadas</Label>
                  <ProjectCategoryTags
                    categories={assignedCategories}
                    onRemove={handleRemoveCategory}
                    onAddClick={() => setCatDialogOpen(true)}
                  />
                </div>
                {/* Dialog categorías */}
                <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Agregar categoría al proyecto</DialogTitle>
                      <DialogDescription>
                        Selecciona una categoría existente o crea una nueva para asignar al proyecto.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input
                        placeholder="Buscar categoría..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {available.length === 0 && (
                          <div className="text-muted-foreground text-sm">No hay categorías disponibles.</div>
                        )}
                        {available.map(cat => (
                          <div
                            key={cat.id}
                            className="flex justify-between items-center px-2 py-1 rounded cursor-pointer
                            hover:bg-[#eaf5d1] hover:text-[#2e4600] dark:hover:bg-[#384d2b] dark:hover:text-[#eaf5d1] transition-colors"
                            onClick={() => handleAssignCategory(cat)}
                          >
                            <span>{cat.name}</span>
                            <Button size="sm" variant="ghost" className="text-[#486b00]">Agregar</Button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nueva categoría"
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (newCat.trim()) {
                                handleCreateCategory(newCat.trim())
                              }
                            }}
                          >
                            Crear
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCatDialogOpen(false)}>
                        Cerrar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="space-y-2">
                  <Label className="text-[#2e4600] font-medium">
                    Ubicación *
                  </Label>
                  <CostaRicaLocationSelect
                    province={province}
                    setProvince={setProvince}
                    canton={canton}
                    setCanton={setCanton}
                    district={district}
                    setDistrict={setDistrict} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood" className="text-[#2e4600] font-medium">
                    Barrio
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      defaultValue={project.PRJ_neighborhood ?? ""}
                      placeholder="Ej: Santa Cecília"
                      className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalDirections" className="text-[#2e4600] font-medium">
                    Direcciones adicionales
                  </Label>
                  <Textarea
                    id="additionalDirections"
                    name="additionalDirections"
                    defaultValue={project.PRJ_additional_directions ?? ""}
                    placeholder="Direcciones adicionales para llegar al sitio"
                    className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="completionDate" className="text-[#2e4600] font-medium">
                      Fecha de conclusión
                    </Label>
                    <Input
                      id="completionDate"
                      name="completionDate"
                      type="date"
                      defaultValue={project.PRJ_completion_date ? String(project.PRJ_completion_date).substring(0, 10) : ""}
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logbookNumber" className="text-[#2e4600] font-medium">
                      Número de bitácora
                    </Label>
                    <Input
                      id="logbookNumber"
                      name="logbookNumber"
                      defaultValue={project.PRJ_logbook_number ?? ""}
                      placeholder="Ej: 22"
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logbookCloseDate" className="text-[#2e4600] font-medium">
                      Fecha de cierre de bitácora
                    </Label>
                    <Input
                      id="logbookCloseDate"
                      name="logbookCloseDate"
                      type="date"
                      defaultValue={project.PRJ_logbook_close_date ? String(project.PRJ_logbook_close_date).substring(0, 10) : ""}
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[#2e4600] font-medium">
                    Notas Adicionales
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={project.PRJ_notes ?? ""}
                    placeholder="Notas adicionales sobre el proyecto"
                    className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="card-hover border-[#7d4427]/20">
              <CardHeader className="gradient-accent text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <span className="mr-2 text-xl">₡</span>
                  Información Financiera
                </CardTitle>
                <CardDescription className="text-white/80">Presupuesto y detalles económicos</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-[#2e4600] font-medium">
                      Presupuesto Inicial
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 inset-y-0 flex items-center text-[#7d4427] text-lg">₡</span>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        inputMode="decimal"
                        step="any"
                        defaultValue={project.PRJ_budget ?? ""}
                        placeholder="Ej: 150000.25"
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ MozAppearance: "textfield" }}
                        pattern="^\d{1,10}(\.\d{0,2})?$"
                        maxLength={13}
                        title="Máximo 10 dígitos antes del punto y 2 después del punto decimal"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startConstructionDate" className="text-[#2e4600] font-medium">
                      Fecha de inicio de construcción
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                      <Input
                        id="startConstructionDate"
                        name="startConstructionDate"
                        type="date"
                        defaultValue={project.PRJ_start_construction_date ? String(project.PRJ_start_construction_date).substring(0, 10) : ""}
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents*/}
            <ProjectDocumentManager
              projectId={id}
              canEdit={true}
              showUpload={true}
              title="Documentos del Proyecto"
            />
            {/* Payments Management */}
            <Card className="card-hover border-[#c9e077]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#2e4600] flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Historial de Pagos
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleNewPago()
                    }}
                    className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar Pago
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No hay pagos registrados</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagos.map((pago) => (
                        <TableRow key={pago.PAY_id}>
                          <TableCell>
                            {new Date(pago.PAY_payment_date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="font-semibold text-[#2e4600]">
                            ₡{Number(pago.PAY_amount_paid || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-[#a2c523] text-[#486b00]">
                              {pago.PAY_method === "Transfer" ? "Transferencia" :
                               pago.PAY_method === "SINPE" ? "SINPE" :
                               pago.PAY_method === "Check" ? "Cheque" :
                               pago.PAY_method === "Cash" ? "Efectivo" :
                               pago.PAY_method === "Card" ? "Tarjeta" :
                               pago.PAY_method === "Credit" ? "Crédito" :
                               pago.PAY_method === "Debit" ? "Débito" :
                               pago.PAY_method === "Deposit" ? "Depósito" :
                               pago.PAY_method}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {pago.PAY_description || "Sin descripción"}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleEditPago(pago)
                                }}
                                className="hover:bg-[#c9e077]/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleDeletePago(pago.PAY_id)
                                }}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* Extra Costs Management */}
            <Card className="card-hover border-[#7d4427]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#7d4427] flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Costos Extra
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleNewCosto()
                    }}
                    className="border-[#7d4427] text-[#7d4427] hover:bg-[#7d4427]/10"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar Costo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {costosExtra.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay costos extra registrados</p>
                  </div>
                ) : (
                  costosExtra.map((costo) => (
                    <div key={costo.ATN_id} className="border rounded-lg p-3 border-[#7d4427]/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-[#7d4427]">{costo.ATN_name}</span>
                          <p className="text-sm text-muted-foreground mt-1">{costo.ATN_description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(costo.ATN_date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[#7d4427]">₡{Number(costo.ATN_cost || 0).toLocaleString()}</span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleEditCosto(costo)
                              }}
                              className="hover:bg-[#7d4427]/10"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteCosto(costo.ATN_id)
                              }}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/proyectos")}
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gradient-primary text-white hover:opacity-90"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="spacer-y-6">
            <Card className="border-[#486b00]/20">
              <CardHeader>
                <CardTitle className="text-[#486b00]">Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span>Presupuesto base:</span>
                    <span className="font-medium">₡{Number(project.PRJ_budget ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costos extra:</span>
                    <span className="font-medium text-[#7d4427]">
                      +₡{costosExtra.reduce((sum, c) => sum + (Number(c.ATN_cost) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <hr className="border-[#a2c523]/30" />
                  <div className="flex justify-between">
                    <span>Total presupuestado:</span>
                    <span className="font-bold text-[#486b00]">
                      ₡{(Number(project.PRJ_budget ?? 0) + costosExtra.reduce((sum, c) => sum + (Number(c.ATN_cost) || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total pagado:</span>
                    <span className="font-medium text-green-600">
                      ₡{pagos.reduce((sum, p) => sum + (Number(p.PAY_amount_paid) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <hr className="border-[#a2c523]/30" />
                  <div className="flex justify-between">
                    <span>Saldo restante:</span>
                    <span className="font-bold text-[#7d4427]">
                      ₡{Number(project.PRJ_remaining_amount ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#7d4427]/20">
              <CardHeader>
                <CardTitle className="text-[#7d4427]">Historial de Cambios</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm space-y-2">
                  <div className="border-l-2 border-[#a2c523] pl-3 py-1">
                    <p className="font-medium">Última modificación</p>
                    <p className="text-muted-foreground">Hace 2 días</p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-3 py-1">
                    <p className="font-medium">Cambio de presupuesto</p>
                    <p className="text-muted-foreground">Hace 1 semana</p>
                  </div>
                  <div className="border-l-2 border-gray-300 pl-3 py-1">
                    <p className="font-medium">Proyecto creado</p>
                    <p className="text-muted-foreground">Hace 11 meses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
        {/* ClientSelector modal */}
        <ClientSelector
          open={clientDialogOpen}
          onOpenChange={setClientDialogOpen}
          onSelect={(client) => {
            setClientSelected(client.CLI_id!)
            setClientSelectedObj(client)
          }}
          selectedId={clientSelected}
        />
        
        {/* Dialog para Pagos */}
        <Dialog open={isPagoDialogOpen} onOpenChange={setIsPagoDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
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
                  <Label htmlFor="pago-fecha">
                    Fecha del pago <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pago-fecha"
                    type="date"
                    value={pagoFormData.PAY_payment_date}
                    onChange={(e) => setPagoFormData({ ...pagoFormData, PAY_payment_date: e.target.value })}
                    className="border-[#a2c523]/30 focus:border-[#486b00]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pago-monto">
                    Monto Pagado <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                    <Input
                      id="pago-monto"
                      type="number"
                      placeholder="25000"
                      value={pagoFormData.PAY_amount_paid}
                      onChange={(e) => {
                        let value = e.target.value
                        if (value && !isNaN(Number(value))) {
                          value = String(Number(value))
                        }
                        setPagoFormData({ ...pagoFormData, PAY_amount_paid: value })
                      }}
                      onBlur={(e) => {
                        const value = e.target.value
                        if (value && !isNaN(Number(value))) {
                          setPagoFormData({ ...pagoFormData, PAY_amount_paid: String(Number(value)) })
                        }
                      }}
                      className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                      disabled={coverFullAmount}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="grid gap-2">
                <Label htmlFor="pago-metodo">
                  Método de Pago <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={pagoFormData.PAY_method}
                  onValueChange={(value) => setPagoFormData({ ...pagoFormData, PAY_method: value })}
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
              </div>

              {/* Opción de cubrir monto completo - solo visible al crear */}
              {!selectedPago && (
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

              {/* Información del proyecto */}
              {project && (
                <div className="bg-[#c9e077]/20 p-3 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2e4600]">Presupuesto inicial:</span>
                    <span className="font-semibold">₡{Number(project.PRJ_budget || 0).toLocaleString()}</span>
                  </div>
                  {costosExtra.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2e4600]">Costos extra:</span>
                      <span className="font-semibold text-[#7d4427]">
                        +₡{costosExtra.reduce((sum, c) => sum + (Number(c.ATN_cost) || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-[#486b00]/20 pt-2">
                    <span className="text-[#2e4600] font-medium">Total presupuestado:</span>
                    <span className="font-bold">
                      ₡{(Number(project.PRJ_budget || 0) + costosExtra.reduce((sum, c) => sum + (Number(c.ATN_cost) || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-[#486b00]/20 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#2e4600]">Total pagado:</span>
                      <span className="font-semibold text-green-600">₡{pagos.reduce((sum, p) => sum + (Number(p.PAY_amount_paid) || 0), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-[#2e4600] font-medium">Saldo restante:</span>
                      <span className="font-bold text-[#7d4427]">₡{Number(project.PRJ_remaining_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Advertencia si el monto excede el saldo restante */}
              {pagoFormData.PAY_amount_paid && project && (
                (() => {
                  const remainingAmount = Number(project.PRJ_remaining_amount || 0)
                  const amountPaid = Number(pagoFormData.PAY_amount_paid)
                  
                  if (amountPaid > remainingAmount) {
                    return (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          ⚠️ El monto a pagar (₡{amountPaid.toLocaleString()}) excede el saldo restante del proyecto (₡{remainingAmount.toLocaleString()})
                        </p>
                      </div>
                    )
                  }
                  return null
                })()
              )}

              {(() => {
                let descTimer: ReturnType<typeof setTimeout> | null = null
                return (
                  <div className="grid gap-2">
                    <Label htmlFor="pago-descripcion">Descripción del pago</Label>
                    <Input
                      id="pago-descripcion"
                      placeholder="Descripción o notas adicionales..."
                      defaultValue={pagoFormData.PAY_description ?? ""}
                      onChange={(e) => {
                        const value = (e.target as HTMLInputElement).value
                        if (descTimer) clearTimeout(descTimer)
                        descTimer = setTimeout(() => {
                          setPagoFormData(prev => ({ ...prev, PAY_description: value }))
                        }, 600)
                      }}
                      onBlur={(e) => {
                        const value = (e.target as HTMLInputElement).value
                        if (descTimer) {
                          clearTimeout(descTimer)
                          descTimer = null
                        }
                        setPagoFormData(prev => ({ ...prev, PAY_description: value }))
                      }}
                      className="border-[#a2c523]/30 focus:border-[#486b00]"
                    />
                  </div>
                )
              })()}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPagoDialogOpen(false)
                  setSelectedPago(null)
                  setCoverFullAmount(false)
                  setPagoFormData({
                    PAY_payment_date: "",
                    PAY_amount_paid: "",
                    PAY_method: "",
                    PAY_description: "",
                  })
                }}
                className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                disabled={savingPago}
              >
                Cancelar
              </Button>
              <Button
                className="gradient-primary text-white hover:opacity-90"
                onClick={handleSavePago}
                disabled={savingPago}
              >
                {savingPago ? "Guardando..." : (selectedPago ? "Actualizar" : "Registrar")} Pago
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Dialog para Costos Extra */}
        <Dialog open={isCostoDialogOpen} onOpenChange={setIsCostoDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[#7d4427]">
                {selectedCosto ? "Editar Costo Extra" : "Agregar Costo Extra"}
              </DialogTitle>
              <DialogDescription>
                {selectedCosto ? "Modifica los datos del costo extra" : "Ingresa los detalles del nuevo costo"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="costo-nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="costo-nombre"
                  placeholder="Ej: Materiales extra, Permisos adicionales..."
                  value={costoFormData.ATN_name}
                  onChange={(e) => setCostoFormData({ ...costoFormData, ATN_name: e.target.value })}
                  className="border-[#7d4427]/30 focus:border-[#7d4427]"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="costo-descripcion">
                  Descripción
                </Label>
                <Input
                  id="costo-descripcion"
                  placeholder="Ej: Materiales adicionales, honorarios extra..."
                  value={costoFormData.ATN_description}
                  onChange={(e) => setCostoFormData({ ...costoFormData, ATN_description: e.target.value })}
                  className="border-[#7d4427]/30 focus:border-[#7d4427]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="costo-monto">
                    Monto <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                    <Input
                      id="costo-monto"
                      type="number"
                      placeholder="5000"
                      value={costoFormData.ATN_cost}
                      onChange={(e) => {
                        let value = e.target.value
                        if (value && !isNaN(Number(value))) {
                          value = String(Number(value))
                        }
                        setCostoFormData({ ...costoFormData, ATN_cost: value })
                      }}
                      className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="costo-fecha">
                    Fecha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="costo-fecha"
                    type="date"
                    value={costoFormData.ATN_date}
                    onChange={(e) => setCostoFormData({ ...costoFormData, ATN_date: e.target.value })}
                    className="border-[#7d4427]/30 focus:border-[#7d4427]"
                    required
                  />
                </div>
              </div>
              
              {project && (
                <div className="bg-[#7d4427]/10 p-3 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7d4427]">Presupuesto actual:</span>
                    <span className="font-semibold">₡{Number(project.PRJ_budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7d4427]">Costos extra existentes:</span>
                    <span className="font-semibold">
                      ₡{costosExtra.reduce((sum, c) => sum + (Number(c.ATN_cost) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  {costoFormData.ATN_cost && (
                    <div className="flex justify-between text-sm border-t border-[#7d4427]/20 pt-2">
                      <span className="text-[#7d4427] font-medium">Nuevo total:</span>
                      <span className="font-bold">
                        ₡{(
                          Number(project.PRJ_budget || 0) + 
                          costosExtra.reduce((sum, c) => sum + (Number(c.ATN_cost) || 0), 0) +
                          Number(costoFormData.ATN_cost)
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCostoDialogOpen(false)
                  setSelectedCosto(null)
                  setCostoFormData({
                    ATN_name: "",
                    ATN_description: "",
                    ATN_cost: "",
                    ATN_date: "",
                  })
                }}
                className="border-[#7d4427] text-[#7d4427] hover:bg-[#7d4427]/10"
                disabled={savingCosto}
              >
                Cancelar
              </Button>
              <Button
                className="bg-[#7d4427] text-white hover:bg-[#6a3a22]"
                onClick={handleSaveCosto}
                disabled={savingCosto}
              >
                {savingCosto ? "Guardando..." : (selectedCosto ? "Actualizar" : "Agregar")} Costo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}