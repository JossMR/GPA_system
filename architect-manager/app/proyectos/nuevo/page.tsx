"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DocumentManager } from "@/components/document-manager"
import { ArrowLeft, Save, Building, Calendar, DollarSign, MapPin, FileText } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { CostaRicaLocationSelect } from "@/components/ui/costarica-location-select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { GPAClient } from '@/models/GPA_client'
import { ClientSelector } from "@/components/client-selector"
import { GPAProject } from "@/models/GPA_project"
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

export default function NewProjectPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
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
  const { toast } = useToast()
  const clientFieldRef = useRef<HTMLDivElement>(null)
  const [projectTypeId, setProjectTypeId] = useState<number | null>(null)
  const [assignedCategories, setAssignedCategories] = useState<Category[]>([])
  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [filter, setFilter] = useState("")
  const [newCat, setNewCat] = useState("")
  const [allCategories, setAllCategories] = useState<Category[]>([])

  // Delete assigned category
  const handleRemoveCategory = (id: number) => {
    setAssignedCategories(cats => cats.filter(c => c.id !== id))
  }

  // Assign existing category
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

  if (!isAdmin) {
    router.push("/proyectos")
    return null
  }

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

    const newProject: GPAProject = {
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
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      })
      if (!response.ok) {
        // get error message from response body or use a default one
        const errorData = await response.json()
        const errorMessage = errorData.error || "Error creating project"
        throw new Error(errorMessage)
      }
      toast({
        title: "Proyecto Registrado",
        description: "El proyecto fue registrado correctamente",
        variant: "success"
      })
      const data = await response.json()
      const registeredProject: GPAProject = data.project;
      console.log("Registered project", registeredProject)
      router.push("/proyectos")
    } catch (error) {
      console.error(error instanceof Error ? error.message : "There was a problem creating the project.")
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el proyecto.",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true)
      try {
        const response = await fetch("/api/clients")
        const data = await response.json()
        const requestedClients: GPAClient[] = data.clients
        setClients(requestedClients)
      } catch (error) {
        setClients([])
      } finally {
        setClientsLoading(false)
      }
    }
    if (clientDialogOpen) fetchClients()
  }, [clientDialogOpen])

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


  // Available categories to assign (exclude already assigned and filter by name)
  const assignedIds = assignedCategories.map(c => c.id)
  const available = allCategories.filter(
    c => !assignedIds.includes(c.id) && c.name.toLowerCase().includes(filter.toLowerCase())
  )

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
              Nuevo Proyecto
            </h1>
            <p className="text-muted-foreground">Crea un nuevo proyecto arquitectónico</p>
          </div>
        </div>

        <div>
          {/* Principal Information */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
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
                        placeholder="Ej: 22.5"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-[#2e4600] font-medium">
                        Estado
                      </Label>
                      <Select defaultValue="document_Collection"
                        value={state}
                        onValueChange={(value) => setState(value as GPAProject["PRJ_state"])}>
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
                  {/* Assign Client */}
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
                  {/*End Assign Client */}
                  <ProjectTypeManager value={projectTypeId} onChange={setProjectTypeId} />

                  {/*Categories*/}
                  <div className="space-y-2">
                    <Label className="text-[#2e4600] font-medium">Categorías asignadas</Label>
                    <ProjectCategoryTags
                      categories={assignedCategories}
                      onRemove={handleRemoveCategory}
                      onAddClick={() => setCatDialogOpen(true)}
                    />
                  </div>
                  {/*Dialog for selecting/adding categories*/}
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
                  {/*End Categories*/}

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
                      placeholder="Notas adicionales sobre el proyecto"
                      className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/*Financial Information*/}
              <Card className="card-hover border-[#7d4427]/20">
                <CardHeader className="gradient-accent text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
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
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                        <Input
                          id="budget"
                          name="budget"
                          type="text"
                          inputMode="decimal"
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
                          className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Management */}
              <DocumentManager
                documents={documents}
                onDocumentsChange={setDocuments}
                canEdit={true}
                showUpload={true}
                title="Documentos del Proyecto"
              />

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
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear Proyecto
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Sidebar Panel */}
            <div className="space-y-6">
              <Card className="border-[#c9e077]/30">
                <CardHeader>
                  <CardTitle className="text-[#2e4600] flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Documentos Requeridos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#a2c523] mr-2"></span>
                      Planos arquitectónicos
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#a2c523] mr-2"></span>
                      Permisos de construcción
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#a2c523] mr-2"></span>
                      Estudio de suelos
                    </p>
                    <p className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#a2c523] mr-2"></span>
                      Contrato firmado
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#7d4427]/20">
                <CardHeader className="bg-[#7d4427]/10 rounded-t-lg">
                  <CardTitle className="text-[#7d4427]">Fases del Proyecto</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Recolección de documentos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Inspección técnica</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Revisión de documentos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Planos y presupuesto</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Revisión de la entidad Financiera</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>APC y permisos de construcción</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>En construcción</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Completado</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bitácora cerrada</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rechazado</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Retiro profesional</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Condicionado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Summary */}
              {documents.length > 0 && (
                <Card className="border-[#486b00]/20">
                  <CardHeader>
                    <CardTitle className="text-[#486b00]">Documentos Adjuntos</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Total de archivos:</span>
                        <span className="font-medium">{documents.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Planos:</span>
                        <span className="font-medium">{documents.filter((d) => d.category === "plano").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fotografías:</span>
                        <span className="font-medium">{documents.filter((d) => d.category === "foto").length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contratos:</span>
                        <span className="font-medium">{documents.filter((d) => d.category === "contrato").length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </form>
        </div>

        {/*Select Client modal*/}
        <ClientSelector
          open={clientDialogOpen}
          onOpenChange={setClientDialogOpen}
          onSelect={(client) => {
            setClientSelected(client.CLI_id!)
            setClientSelectedObj(client)
          }}
          selectedId={clientSelected}
        />
      </div >
    </MainLayout >
  )
}
