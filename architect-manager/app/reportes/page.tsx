"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileSpreadsheet, Calendar, Users, Building, DollarSign } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const reportTypes = [
  {
    id: "clientes",
    title: "Reporte de Clientes",
    description: "Información completa de todos los clientes registrados",
    icon: Users,
    fields: [
      { id: "nombre", label: "Nombre completo", checked: true },
      { id: "email", label: "Correo electrónico", checked: true },
      { id: "telefono", label: "Teléfono", checked: true },
      { id: "empresa", label: "Empresa", checked: true },
      { id: "proyectos", label: "Número de proyectos", checked: false },
      { id: "fechaRegistro", label: "Fecha de registro", checked: false },
      { id: "estado", label: "Estado del cliente", checked: true },
    ],
  },
  {
    id: "proyectos",
    title: "Reporte de Proyectos",
    description: "Detalles de todos los proyectos arquitectónicos",
    icon: Building,
    fields: [
      { id: "nombre", label: "Nombre del proyecto", checked: true },
      { id: "cliente", label: "Cliente", checked: true },
      { id: "estado", label: "Estado actual", checked: true },
      { id: "progreso", label: "Porcentaje de progreso", checked: false },
      { id: "presupuesto", label: "Presupuesto total", checked: true },
      { id: "pagado", label: "Monto pagado", checked: true },
      { id: "fechaInicio", label: "Fecha de inicio", checked: false },
      { id: "fechaEntrega", label: "Fecha de entrega", checked: false },
      { id: "categoria", label: "Categoría", checked: false },
    ],
  },
  {
    id: "pagos",
    title: "Reporte de Pagos",
    description: "Historial completo de pagos y transacciones",
    icon: DollarSign,
    fields: [
      { id: "fecha", label: "Fecha del pago", checked: true },
      { id: "monto", label: "Monto", checked: true },
      { id: "metodo", label: "Método de pago", checked: true },
      { id: "proyecto", label: "Proyecto asociado", checked: true },
      { id: "cliente", label: "Cliente", checked: true },
      { id: "numeroCaso", label: "Número de caso", checked: false },
      { id: "detalle", label: "Detalle del pago", checked: false },
      { id: "estado", label: "Estado del pago", checked: true },
    ],
  },
]

export default function ReportesPage() {
  const { isAdmin } = useAuth()
  const [selectedReport, setSelectedReport] = useState("")
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({})
  const [dateRange, setDateRange] = useState("ultimo_mes")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId)
    const report = reportTypes.find((r) => r.id === reportId)
    if (report) {
      const initialFields: Record<string, boolean> = {}
      report.fields.forEach((field) => {
        initialFields[field.id] = field.checked
      })
      setSelectedFields(initialFields)
    }
  }

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldId]: checked,
    }))
  }

  const handleGenerateReport = async () => {
    if (!selectedReport) return

    setIsGenerating(true)

    // Simular generación de reporte
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Aquí normalmente se generaría el archivo Excel
    console.log("Generando reporte:", {
      type: selectedReport,
      fields: selectedFields,
      dateRange,
    })

    setIsGenerating(false)

    // Simular descarga
    alert("Reporte generado exitosamente (simulación)")
  }

  const currentReport = reportTypes.find((r) => r.id === selectedReport)

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary-dark">Reportes</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Genera reportes detallados en formato Excel con los datos que necesites
          </p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reportes Generados</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Reporte</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ayer</div>
              <p className="text-xs text-muted-foreground">Reporte de Pagos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Más Solicitado</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Clientes</div>
              <p className="text-xs text-muted-foreground">65% de reportes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selección de Tipo de Reporte */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Reporte</CardTitle>
              <CardDescription>Selecciona el tipo de reporte que deseas generar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.id ? "border-primary-medium bg-primary-lighter/10" : "border-border"
                  }`}
                  onClick={() => handleReportSelect(report.id)}
                >
                  <div className="flex items-start space-x-3">
                    <report.icon
                      className={`h-5 w-5 mt-0.5 ${
                        selectedReport === report.id ? "text-primary-medium" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Configuración del Reporte */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                {selectedReport
                  ? "Personaliza los campos y filtros del reporte"
                  : "Selecciona un tipo de reporte para configurar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedReport ? (
                <>
                  {/* Rango de Fechas */}
                  <div className="space-y-2">
                    <Label>Rango de Fechas</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultima_semana">Última semana</SelectItem>
                        <SelectItem value="ultimo_mes">Último mes</SelectItem>
                        <SelectItem value="ultimos_3_meses">Últimos 3 meses</SelectItem>
                        <SelectItem value="ultimo_ano">Último año</SelectItem>
                        <SelectItem value="todo">Todo el historial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campos a Incluir */}
                  <div className="space-y-3">
                    <Label>Campos a Incluir</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {currentReport?.fields.map((field) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={field.id}
                            checked={selectedFields[field.id] || false}
                            onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                          />
                          <Label htmlFor={field.id} className="text-sm">
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón de Generación */}
                  <Button
                    onClick={handleGenerateReport}
                    disabled={isGenerating || !isAdmin}
                    className="w-full bg-primary-medium hover:bg-primary-dark"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generar Reporte Excel
                      </>
                    )}
                  </Button>

                  {!isAdmin && (
                    <p className="text-sm text-muted-foreground text-center">
                      Necesitas permisos de administrador para generar reportes
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un tipo de reporte para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Historial de Reportes */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Reportes</CardTitle>
            <CardDescription>Reportes generados recientemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Reporte de Clientes - Diciembre 2024", date: "2024-12-15", size: "2.3 MB" },
                { name: "Reporte de Proyectos - Noviembre 2024", date: "2024-11-30", size: "1.8 MB" },
                { name: "Reporte de Pagos - Octubre 2024", date: "2024-10-31", size: "3.1 MB" },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.date} • {report.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
