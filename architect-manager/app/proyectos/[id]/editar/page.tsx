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
import { DocumentManager } from "@/components/document-manager"
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

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  category: "plano" | "permiso" | "contrato" | "foto" | "otro"
  url?: string
}

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
  const [documents, setDocuments] = useState<Document[]>([])
  const [pagos, setPagos] = useState<any[]>([])
  const [costosExtra, setCostosExtra] = useState<any[]>([])
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false)
  const [isCostoDialogOpen, setIsCostoDialogOpen] = useState(false)
  const [selectedPago, setSelectedPago] = useState<any>(null)
  const [selectedCosto, setSelectedCosto] = useState<any>(null)

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
        setDocuments([])
        setPagos([])
        setCostosExtra([]) // Cargar si tienes endpoint
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

  // Lógica de pagos y costos extra (igual que antes)
  const handleNewPago = () => {
    setSelectedPago(null)
    setIsPagoDialogOpen(true)
  }
  const handleEditPago = (pago: any) => {
    setSelectedPago(pago)
    setIsPagoDialogOpen(true)
  }
  const handleDeletePago = (pagoId: number) => {
    setPagos((prev) => prev.filter((p) => p.id !== pagoId))
  }
  const handleSavePago = (pagoData: any) => {
    if (selectedPago) {
      setPagos((prev) => prev.map((p) => (p.id === selectedPago.id ? { ...p, ...pagoData } : p)))
    } else {
      const newPago = {
        id: pagos.length ? Math.max(...pagos.map((p) => p.id)) + 1 : 1,
        ...pagoData,
      }
      setPagos((prev) => [...prev, newPago])
    }
    setIsPagoDialogOpen(false)
  }
  const handleNewCosto = () => {
    setSelectedCosto(null)
    setIsCostoDialogOpen(true)
  }
  const handleEditCosto = (costo: any) => {
    setSelectedCosto(costo)
    setIsCostoDialogOpen(true)
  }
  const handleDeleteCosto = (costoId: number) => {
    setCostosExtra((prev) => prev.filter((c) => c.id !== costoId))
  }
  const handleSaveCosto = (costoData: any) => {
    if (selectedCosto) {
      setCostosExtra((prev) => prev.map((c) => (c.id === selectedCosto.id ? { ...c, ...costoData } : c)))
    } else {
      const newCosto = {
        id: costosExtra.length ? Math.max(...costosExtra.map((c) => c.id)) + 1 : 1,
        ...costoData,
      }
      setCostosExtra((prev) => [...prev, newCosto])
    }
    setIsCostoDialogOpen(false)
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
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-[#c9e077]/20">
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
                        defaultValue={project.PRJ_budget ?? ""}
                        placeholder="Ej: 150000.25"
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
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
            <DocumentManager
              documents={documents}
              onDocumentsChange={setDocuments}
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
                    variant="outline"
                    size="sm"
                    onClick={handleNewPago}
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
                      <TableHead>Detalle</TableHead>
                      <TableHead>N° Caso</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagos.map((pago) => (
                      <TableRow key={pago.id}>
                        <TableCell>{pago.fecha}</TableCell>
                        <TableCell className="font-semibold text-[#2e4600]">₡{pago.monto.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#a2c523] text-[#486b00]">
                            {pago.metodo}
                          </Badge>
                        </TableCell>
                        <TableCell>{pago.detalle}</TableCell>
                        <TableCell className="font-mono text-sm">{pago.numeroCaso}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPago(pago)}
                              className="hover:bg-[#c9e077]/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePago(pago.id)}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pagos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay pagos registrados</p>
                  </div>
                )}
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
                    onClick={handleNewCosto}
                    className="border-[#7d4427] text-[#7d4427] hover:bg-[#7d4427]/10"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar Costo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {costosExtra.map((costo) => (
                  <div key={costo.id} className="border rounded-lg p-3 border-[#7d4427]/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{costo.descripcion}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`${costo.aprobado ? "bg-green-500" : "bg-yellow-500"} text-white text-xs`}>
                            {costo.aprobado ? "Aprobado" : "Pendiente"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{costo.fecha}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-[#7d4427]">${costo.monto.toLocaleString()}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCosto(costo)}
                            className="hover:bg-[#7d4427]/10"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCosto(costo.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {costosExtra.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay costos extra registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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
                    <span className="font-medium">₡{(project.PRJ_budget ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costos extra:</span>
                    <span className="font-medium text-[#7d4427]">
                      +₡{costosExtra.reduce((sum, c) => sum + c.monto, 0).toLocaleString()}
                    </span>
                  </div>
                  <hr className="border-[#a2c523]/30" />
                  <div className="flex justify-between">
                    <span>Total presupuestado:</span>
                    <span className="font-bold text-[#486b00]">
                      ₡{((project.PRJ_budget ?? 0) + costosExtra.reduce((sum, c) => sum + c.monto, 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total pagado:</span>
                    <span className="font-medium text-green-600">
                      ₡{pagos.reduce((sum, p) => sum + p.monto, 0).toLocaleString()}
                    </span>
                  </div>
                  <hr className="border-[#a2c523]/30" />
                  <div className="flex justify-between">
                    <span>Saldo restante:</span>
                    <span className="font-bold text-[#7d4427]">
                      ₡
                      {(
                        (project.PRJ_budget ?? 0) +
                        costosExtra.reduce((sum, c) => sum + c.monto, 0) -
                        pagos.reduce((sum, p) => sum + p.monto, 0)
                      ).toLocaleString()}
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
      </div>
    </MainLayout>
  )
}