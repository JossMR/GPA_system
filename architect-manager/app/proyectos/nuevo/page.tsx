"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { GPAClient } from '@/models/GPA_client'


interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  category: "plano" | "permiso" | "contrato" | "foto" | "otro"
  url?: string
}

export default function NuevoProyectoPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [province, setProvince] = useState("")
  const [canton, setCanton] = useState("")
  const [district, setDistrict] = useState("")
  const [clienteDialogOpen, setClienteDialogOpen] = useState(false)
  const [clienteFiltro, setClienteFiltro] = useState("")
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null)
  const [clienteSeleccionadoObj, setClienteSeleccionadoObj] = useState<GPAClient | null>(null)
  const [clientes, setClientes] = useState<GPAClient[]>([])
  const [clientesLoading, setClientesLoading] = useState(false)

  if (!isAdmin) {
    router.push("/proyectos")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Documentos adjuntos:", documents)
    setLoading(false)
    router.push("/proyectos")
  }

  useEffect(() => {
    const fetchClientes = async () => {
      setClientesLoading(true)
      try {
        const response = await fetch("/api/clients")
        const data = await response.json()
        const requestedClients: GPAClient[] = data.clients
        setClientes(requestedClients)
      } catch (error) {
        setClientes([])
      } finally {
        setClientesLoading(false)
      }
    }
    if (clienteDialogOpen) fetchClientes()
  }, [clienteDialogOpen])

  // Filtrar clientes por nombre o cédula
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.CLI_name.toLowerCase().includes(clienteFiltro.toLowerCase()) ||
      c.CLI_f_lastname?.toLowerCase().includes(clienteFiltro.toLowerCase()) ||
      c.CLI_s_lastname?.toLowerCase().includes(clienteFiltro.toLowerCase()) ||
      c.CLI_identification.toLowerCase().includes(clienteFiltro.toLowerCase())
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* --- CAMPO CLIENTE Y BOTÓN --- */}
                  <div className="space-y-2">
                    <Label className="text-[#2e4600] font-medium">Cliente *</Label>
                    <div
                      className="flex gap-0 rounded-md overflow-hidden border border-[#a2c523]/30 focus-within:border-[#486b00] bg-gray-100 dark:bg-[#232d1c]"
                    >
                      <Input
                        value={
                          clienteSeleccionadoObj
                            ? `${clienteSeleccionadoObj.CLI_name} ${clienteSeleccionadoObj.CLI_f_lastname ?? ""} ${clienteSeleccionadoObj.CLI_s_lastname ?? ""} - ${clienteSeleccionadoObj.CLI_identification}`
                            : ""
                        }
                        placeholder="Seleccione un cliente"
                        readOnly
                        className="border-none focus:ring-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground rounded-none"
                        tabIndex={-1}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setClienteDialogOpen(true)}
                        className="rounded-none border-l border-[#a2c523]/30 bg-gray-200 dark:bg-[#2e3a23] hover:bg-[#c9e077]/30 dark:hover:bg-[#384d2b] text-foreground"
                        style={{ minWidth: 100 }}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                  {/* --- FIN CAMPO CLIENTE Y BOTÓN --- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="caseNumber" className="text-[#2e4600] font-medium">
                        Número de caso *
                      </Label>
                      <Input
                        id="caseNumber"
                        placeholder="Ej: 1256"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-[#2e4600] font-medium">
                        Área en m2 *
                      </Label>
                      <Input
                        id="area"
                        placeholder="Ej: 22"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-[#2e4600] font-medium">
                        Estado
                      </Label>
                      <Select defaultValue="document_Collection">
                        <SelectTrigger className="border-[#a2c523]/30 focus:border-[#486b00]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="document_Collection">Recolección de Documentos</SelectItem>
                          <SelectItem value="technical_Inspection">Inspección Técnica</SelectItem>
                          <SelectItem value="document_Review">Revisión de Documentos</SelectItem>
                          <SelectItem value="plans_Budget">Planos y Presupuesto</SelectItem>
                          <SelectItem value="entity_Review">Revisión de Entidad Financiera</SelectItem>
                          <SelectItem value="APC_Permits">APC y Permisos</SelectItem>
                          <SelectItem value="disbursement">Desembolso</SelectItem>
                          <SelectItem value="under_Construction">En Construcción</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="logbook_Closed">Bitácora Cerrada</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                          <SelectItem value="professional_Withdrawal">Retiro Profesional</SelectItem>
                          <SelectItem value="conditioned">Condicionado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
                        placeholder="Ej: Santa Cecília"
                        className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additional_Directions" className="text-[#2e4600] font-medium">
                      Direcciones adicionales
                    </Label>
                    <Textarea
                      id="additional_Directions"
                      placeholder="Direcciones adicionales para llegar al sitio"
                      className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[120px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="completion_Date" className="text-[#2e4600] font-medium">
                        Fecha de conclusión
                      </Label>
                      <Input
                        id="completion_Date"
                        type="date"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logbook_Number" className="text-[#2e4600] font-medium">
                        Número de bitácora
                      </Label>
                      <Input
                        id="logbook_Number"
                        placeholder="Ej: 22"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logbook_Close_Date" className="text-[#2e4600] font-medium">
                        Fecha de cierre de bitácora
                      </Label>
                      <Input
                        id="logbook_Close_Date"
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
                      placeholder="Notas adicionales sobre el proyecto"
                      className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[120px]"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Información Financiera */}
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
                    <Label htmlFor="presupuesto" className="text-[#2e4600] font-medium">
                      Presupuesto Inicial
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                      <Input
                        id="presupuesto"
                        type="number"
                        placeholder="150000"
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_Construction_Date" className="text-[#2e4600] font-medium">
                      Fecha de inicio de construcción
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#7d4427]" />
                      <Input
                        id="start_Construction_Date"
                        type="date"
                        className="pl-10 border-[#7d4427]/30 focus:border-[#7d4427]"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gestión de Documentos */}
            <DocumentManager
              documents={documents}
              onDocumentsChange={setDocuments}
              canEdit={true}
              showUpload={true}
              title="Documentos del Proyecto"
            />

            {/* Botones de Acción */}
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
                onClick={handleSubmit}
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

          {/* Panel Lateral */}
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

            {/* Resumen de documentos */}
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
        </div>

        {/* Modal para seleccionar cliente */}
        <Dialog open={clienteDialogOpen} onOpenChange={setClienteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Seleccionar Cliente</DialogTitle>
            </DialogHeader>
            <div className="mb-4">
              <Input
                placeholder="Filtrar por nombre o cédula"
                value={clienteFiltro}
                onChange={e => setClienteFiltro(e.target.value)}
                className="mb-2 text-[#2e4600] dark:text-[#c9e077] placeholder:text-muted-foreground"
              />
              <div className="overflow-x-auto max-h-64">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-[#232d1c]">
                      <th className="px-3 py-2 border text-[#2e4600] dark:text-[#c9e077]">Nombre</th>
                      <th className="px-3 py-2 border text-[#2e4600] dark:text-[#c9e077]">Apellidos</th>
                      <th className="px-3 py-2 border text-[#2e4600] dark:text-[#c9e077]">Cédula</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesLoading ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted-foreground">
                          Cargando clientes...
                        </td>
                      </tr>
                    ) : clientesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted-foreground">
                          No hay clientes que coincidan.
                        </td>
                      </tr>
                    ) : (
                      clientesFiltrados
                        .filter((c) => typeof c.CLI_id === "number")
                        .map((c) => (
                          <tr
                            key={c.CLI_id}
                            onClick={() => {
                              setClienteSeleccionado(c.CLI_id!)
                              setClienteSeleccionadoObj(c)
                              setClienteDialogOpen(false)
                            }}
                            className={
                              "cursor-pointer transition-colors " +
                              (clienteSeleccionado === c.CLI_id
                                ? "bg-[#e6f4d7] dark:bg-[#384d2b]"
                                : "hover:bg-[#f5fbe9] dark:hover:bg-[#2e3a23]") +
                              " text-[#2e4600] dark:text-[#c9e077]"
                            }
                          >
                            <td className="px-3 py-2 border">{c.CLI_name}</td>
                            <td className="px-3 py-2 border">{`${c.CLI_f_lastname ?? ""} ${c.CLI_s_lastname ?? ""}`.trim()}</td>
                            <td className="px-3 py-2 border">{c.CLI_identification}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setClienteDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
