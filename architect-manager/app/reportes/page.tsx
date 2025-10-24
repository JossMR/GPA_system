"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileSpreadsheet, Users, Building, DollarSign, ChevronLeft, ChevronRight, Eye, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const reportTypes = [
  {
    id: "clientes",
    title: "Reporte de Clientes",
    description: "Información completa de todos los clientes registrados",
    icon: Users,
    fields: [
      { id: "nombre", label: "Nombre completo", checked: true },
      { id: "identificacion", label: "Identificación", checked: true },
      { id: "tipoIdentificacion", label: "Tipo de identificación", checked: true },
      { id: "email", label: "Correo electrónico", checked: true },
      { id: "telefono", label: "Teléfono", checked: true },
      { id: "estadoCivil", label: "Estado civil", checked: false },
      { id: "esPerson", label: "Es persona física", checked: false },
      { id: "provincia", label: "Provincia", checked: false },
      { id: "canton", label: "Cantón", checked: false },
      { id: "distrito", label: "Distrito", checked: false },
      { id: "barrio", label: "Barrio", checked: false },
      { id: "direcciones", label: "Direcciones adicionales", checked: false },
      { id: "observaciones", label: "Observaciones", checked: false },
      { id: "proyectos", label: "Número de proyectos", checked: true },
    ],
  },
  {
    id: "proyectos",
    title: "Reporte de Proyectos",
    description: "Detalles de todos los proyectos arquitectónicos",
    icon: Building,
    fields: [
      { id: "numeroCaso", label: "Número de caso", checked: true },
      { id: "cliente", label: "Cliente", checked: true },
      { id: "identificacionCliente", label: "Identificación del cliente", checked: false },
      { id: "estado", label: "Estado actual", checked: true },
      { id: "tipo", label: "Tipo de proyecto", checked: false },
      { id: "categorias", label: "Categorías", checked: false },
      { id: "presupuesto", label: "Presupuesto inicial", checked: true },
      { id: "precioFinal", label: "Precio final", checked: false },
      { id: "restante", label: "Monto restante", checked: true },
      { id: "area", label: "Área en m²", checked: false },
      { id: "fechaIngreso", label: "Fecha de ingreso", checked: true },
      { id: "fechaEntrega", label: "Fecha de entrega", checked: false },
      { id: "fechaInicioConst", label: "Fecha inicio construcción", checked: false },
      { id: "fechaCierreBitacora", label: "Fecha cierre bitácora", checked: false },
      { id: "numeroBitacora", label: "Número de bitácora", checked: false },
      { id: "provincia", label: "Provincia", checked: false },
      { id: "canton", label: "Cantón", checked: false },
      { id: "distrito", label: "Distrito", checked: false },
      { id: "barrio", label: "Barrio", checked: false },
      { id: "direcciones", label: "Direcciones adicionales", checked: false },
      { id: "notas", label: "Notas", checked: false },
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
      { id: "numeroCaso", label: "Número de caso", checked: true },
      { id: "cliente", label: "Cliente", checked: true },
      { id: "detalle", label: "Detalle del pago", checked: true },
      { id: "estadoProyecto", label: "Estado del proyecto", checked: false },
    ],
  },
]

export default function ReportesPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [selectedReport, setSelectedReport] = useState("")
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({})
  const [dateRange, setDateRange] = useState("ultimo_mes")
  const [isGenerating, setIsGenerating] = useState(false)
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [metodoPagoFilter, setMetodoPagoFilter] = useState("todos")
  const [includeAllFields, setIncludeAllFields] = useState(false)
  
  // Estados para la vista previa
  const [previewData, setPreviewData] = useState<any[]>([])
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showPreview, setShowPreview] = useState(false)

  // Calcular datos paginados
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = previewData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(previewData.length / itemsPerPage)

  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId)
    setIncludeAllFields(false)
    setShowPreview(false)
    setPreviewData([])
    setCurrentPage(1)
    const report = reportTypes.find((r) => r.id === reportId)
    if (report) {
      const initialFields: Record<string, boolean> = {}
      report.fields.forEach((field) => {
        initialFields[field.id] = field.checked
      })
      setSelectedFields(initialFields)
    }
  }

  const handleIncludeAllToggle = (checked: boolean) => {
    setIncludeAllFields(checked)
    if (checked) {
      // Guardar estado actual antes de activar todos
      const report = reportTypes.find((r) => r.id === selectedReport)
      if (report) {
        const allFields: Record<string, boolean> = {}
        report.fields.forEach((field) => {
          allFields[field.id] = true
        })
        setSelectedFields(allFields)
      }
    } else {
      // Restaurar al estado por defecto cuando se desactiva
      const report = reportTypes.find((r) => r.id === selectedReport)
      if (report) {
        const defaultFields: Record<string, boolean> = {}
        report.fields.forEach((field) => {
          defaultFields[field.id] = field.checked
        })
        setSelectedFields(defaultFields)
      }
    }
  }

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldId]: checked,
    }))
  }

  const translateProjectState = (state: string): string => {
    const translations: Record<string, string> = {
      "Document Collection": "Recolección de Documentos",
      "Technical Inspection": "Inspección Técnica",
      "Document Review": "Revisión de Documentos",
      "Plans and Budget": "Planos y Presupuesto",
      "Entity Review": "Revisión de Entidad",
      "APC and Permits": "APC y Permisos",
      "Disbursement": "Desembolso",
      "Under Construction": "En Construcción",
      "Completed": "Completado",
      "Logbook Closed": "Bitácora Cerrada",
      "Rejected": "Rechazado",
      "Professional Withdrawal": "Retiro Profesional",
      "Conditioned": "Condicionado"
    }
    return translations[state] || state
  }

  const translateCivilStatus = (status: string): string => {
    const translations: Record<string, string> = {
      "Single": "Soltero/a",
      "Married": "Casado/a",
      "Divorced": "Divorciado/a",
      "Widowed": "Viudo/a"
    }
    return translations[status] || status
  }

  const translateIdentificationType = (type: string): string => {
    const translations: Record<string, string> = {
      "national": "Cédula Nacional",
      "dimex": "DIMEX",
      "passport": "Pasaporte",
      "nite": "NITE",
      "entity": "Cédula Jurídica"
    }
    return translations[type] || type
  }

  const translatePaymentMethod = (method: string): string => {
    const translations: Record<string, string> = {
      "Cash": "Efectivo",
      "Card": "Tarjeta",
      "SINPE": "SINPE Móvil",
      "Credit": "Crédito",
      "Debit": "Débito",
      "Transfer": "Transferencia",
      "Deposit": "Depósito",
      "Check": "Cheque"
    }
    return translations[method] || method
  }

  const translateDateRange = (range: string): string => {
    const translations: Record<string, string> = {
      "ultima_semana": "Última semana",
      "ultimo_mes": "Último mes",
      "ultimos_3_meses": "Últimos 3 meses",
      "ultimo_ano": "Último año",
      "todo": "Todo el historial"
    }
    return translations[range] || range
  }

  const getDateFilter = (range: string): Date | null => {
    const now = new Date()
    switch (range) {
      case "ultima_semana":
        return new Date(now.setDate(now.getDate() - 7))
      case "ultimo_mes":
        return new Date(now.setMonth(now.getMonth() - 1))
      case "ultimos_3_meses":
        return new Date(now.setMonth(now.getMonth() - 3))
      case "ultimo_ano":
        return new Date(now.setFullYear(now.getFullYear() - 1))
      case "todo":
        return null
      default:
        return null
    }
  }

  // Cargar vista previa de datos
  const loadPreviewData = async () => {
    if (!selectedReport) return

    setIsLoadingPreview(true)
    setShowPreview(true)
    setCurrentPage(1)

    try {
      let data: any[] = []

      if (selectedReport === "clientes") {
        const response = await fetch("/api/clients")
        const result = await response.json()
        data = result.clients || []
      } else if (selectedReport === "proyectos") {
        const response = await fetch("/api/projects")
        const result = await response.json()
        let projects = result.projects || []
        console.log("Projects fetcheds on reportes:", projects)
        // Aplicar filtro de fecha
        const dateFilter = getDateFilter(dateRange)
        if (dateFilter) {
          projects = projects.filter((p: any) => {
            const entryDate = new Date(p.PRJ_entry_date)
            return entryDate >= dateFilter
          })
        }

        // Aplicar filtro de estado
        if (estadoFilter !== "todos") {
          projects = projects.filter((p: any) => p.PRJ_state === estadoFilter)
        }

        data = projects
      } else if (selectedReport === "pagos") {
        const response = await fetch("/api/payments")
        let payments = await response.json()

        // Aplicar filtro de fecha
        const dateFilter = getDateFilter(dateRange)
        if (dateFilter) {
          payments = payments.filter((p: any) => {
            const paymentDate = new Date(p.PAY_payment_date)
            return paymentDate >= dateFilter
          })
        }

        // Aplicar filtro de método de pago
        if (metodoPagoFilter !== "todos") {
          payments = payments.filter((p: any) => p.PAY_method === metodoPagoFilter)
        }

        data = payments
      }

      setPreviewData(data)
    } catch (error) {
      console.error("Error cargando vista previa:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la vista previa",
        variant: "destructive"
      })
    } finally {
      setIsLoadingPreview(false)
    }
  }

  // Recargar vista previa cuando cambian los filtros
  useEffect(() => {
    if (selectedReport && showPreview) {
      loadPreviewData()
    }
    // Para clientes no hay filtros de fecha, solo recarga cuando cambia el reporte
    if (selectedReport === "clientes") return
  }, [selectedReport === "clientes" ? null : dateRange, estadoFilter, metodoPagoFilter])

  // Renderizar fila de la tabla según el tipo de reporte
  const renderPreviewRow = (item: any, index: number) => {
    if (selectedReport === "clientes") {
      return (
        <TableRow key={index}>
          {selectedFields.nombre && (
            <TableCell>{`${item.CLI_name || ""} ${item.CLI_f_lastname || ""} ${item.CLI_s_lastname || ""}`.trim()}</TableCell>
          )}
          {selectedFields.identificacion && <TableCell>{item.CLI_identification || "N/A"}</TableCell>}
          {selectedFields.tipoIdentificacion && <TableCell>{translateIdentificationType(item.CLI_identificationtype)}</TableCell>}
          {selectedFields.email && <TableCell>{item.CLI_email || "N/A"}</TableCell>}
          {selectedFields.telefono && <TableCell>{item.CLI_phone || "N/A"}</TableCell>}
          {selectedFields.estadoCivil && <TableCell>{translateCivilStatus(item.CLI_civil_status)}</TableCell>}
          {selectedFields.esPerson && <TableCell>{item.CLI_isperson ? "Sí" : "No"}</TableCell>}
          {selectedFields.provincia && <TableCell>{item.CLI_province || "N/A"}</TableCell>}
          {selectedFields.canton && <TableCell>{item.CLI_canton || "N/A"}</TableCell>}
          {selectedFields.distrito && <TableCell>{item.CLI_district || "N/A"}</TableCell>}
          {selectedFields.barrio && <TableCell>{item.CLI_neighborhood || "N/A"}</TableCell>}
          {selectedFields.direcciones && <TableCell>{item.CLI_additional_directions || "N/A"}</TableCell>}
          {selectedFields.observaciones && <TableCell>{item.CLI_observations || "N/A"}</TableCell>}
          {selectedFields.proyectos && <TableCell className="text-center">{item.CLI_projects_amount || 0}</TableCell>}
        </TableRow>
      )
    } else if (selectedReport === "proyectos") {
      return (
        <TableRow key={index}>
          {selectedFields.numeroCaso && <TableCell>{item.PRJ_case_number || "N/A"}</TableCell>}
          {selectedFields.cliente && <TableCell>{item.client_name || "N/A"}</TableCell>}
          {selectedFields.identificacionCliente && <TableCell>{item.client_identification || "N/A"}</TableCell>}
          {selectedFields.estado && <TableCell>{translateProjectState(item.PRJ_state)}</TableCell>}
          {selectedFields.tipo && <TableCell>{item.type?.TYP_name || "N/A"}</TableCell>}
          {selectedFields.categorias && <TableCell>{item.categories_names?.join(", ") || "N/A"}</TableCell>}
          {selectedFields.presupuesto && (
            <TableCell className="text-right">₡{parseFloat(item.PRJ_budget || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</TableCell>
          )}
          {selectedFields.precioFinal && (
            <TableCell className="text-right">₡{parseFloat(item.PRJ_final_price || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</TableCell>
          )}
          {selectedFields.restante && (
            <TableCell className="text-right">₡{parseFloat(item.PRJ_remaining_amount || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</TableCell>
          )}
          {selectedFields.area && (
            <TableCell className="text-right">{parseFloat(item.PRJ_area_m2 || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })} m²</TableCell>
          )}
          {selectedFields.fechaIngreso && (
            <TableCell>{item.PRJ_entry_date ? format(new Date(item.PRJ_entry_date), "dd/MM/yyyy") : "N/A"}</TableCell>
          )}
          {selectedFields.fechaEntrega && (
            <TableCell>{item.PRJ_completion_date ? format(new Date(item.PRJ_completion_date), "dd/MM/yyyy") : "N/A"}</TableCell>
          )}
          {selectedFields.fechaInicioConst && (
            <TableCell>{item.PRJ_start_construction_date ? format(new Date(item.PRJ_start_construction_date), "dd/MM/yyyy") : "N/A"}</TableCell>
          )}
          {selectedFields.fechaCierreBitacora && (
            <TableCell>{item.PRJ_logbook_close_date ? format(new Date(item.PRJ_logbook_close_date), "dd/MM/yyyy") : "N/A"}</TableCell>
          )}
          {selectedFields.numeroBitacora && <TableCell>{item.PRJ_logbook_number || "N/A"}</TableCell>}
          {selectedFields.provincia && <TableCell>{item.PRJ_province || "N/A"}</TableCell>}
          {selectedFields.canton && <TableCell>{item.PRJ_canton || "N/A"}</TableCell>}
          {selectedFields.distrito && <TableCell>{item.PRJ_district || "N/A"}</TableCell>}
          {selectedFields.barrio && <TableCell>{item.PRJ_neighborhood || "N/A"}</TableCell>}
          {selectedFields.direcciones && <TableCell>{item.PRJ_additional_directions || "N/A"}</TableCell>}
          {selectedFields.notas && <TableCell>{item.PRJ_notes || "N/A"}</TableCell>}
        </TableRow>
      )
    } else if (selectedReport === "pagos") {
      return (
        <TableRow key={index}>
          {selectedFields.fecha && (
            <TableCell>{item.PAY_payment_date ? format(new Date(item.PAY_payment_date), "dd/MM/yyyy") : "N/A"}</TableCell>
          )}
          {selectedFields.monto && (
            <TableCell className="text-right">₡{parseFloat(item.PAY_amount_paid || 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}</TableCell>
          )}
          {selectedFields.metodo && (
            <TableCell>{item.PAY_method ? translatePaymentMethod(item.PAY_method) : "N/A"}</TableCell>
          )}
          {selectedFields.numeroCaso && <TableCell>{item.projectCaseNumber || "N/A"}</TableCell>}
          {selectedFields.cliente && <TableCell>{item.projectClientName || "N/A"}</TableCell>}
          {selectedFields.detalle && <TableCell>{item.PAY_description || "N/A"}</TableCell>}
          {selectedFields.estadoProyecto && (
            <TableCell>{item.projectState ? translateProjectState(item.projectState) : "N/A"}</TableCell>
          )}
        </TableRow>
      )
    }
  }

  // Renderizar encabezados de la tabla
  const renderPreviewHeaders = () => {
    const currentFields = reportTypes.find(r => r.id === selectedReport)?.fields || []
    
    return currentFields
      .filter(field => selectedFields[field.id])
      .map(field => (
        <TableHead key={field.id}>{field.label}</TableHead>
      ))
  }

  const generateClientsReport = async () => {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      let clients = data.clients || []

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Clientes")

      // Colores corporativos
      const primaryColor = "2E4600"
      const secondaryColor = "486B00"
      const lightColor = "C9E077"

      // Título del reporte
      worksheet.mergeCells("A1:G1")
      const titleCell = worksheet.getCell("A1")
      titleCell.value = "REPORTE DE CLIENTES"
      titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } }
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: primaryColor }
      }
      titleCell.alignment = { vertical: "middle", horizontal: "center" }
      worksheet.getRow(1).height = 35

      // Información del filtro
      worksheet.mergeCells("A2:G2")
      const filterCell = worksheet.getCell("A2")
      filterCell.value = `Reporte de Clientes - Todos los registros`
      filterCell.font = { size: 11, italic: true }
      filterCell.alignment = { horizontal: "center" }
      worksheet.getRow(2).height = 20

      // Fecha de generación
      worksheet.mergeCells("A3:G3")
      const dateCell = worksheet.getCell("A3")
      dateCell.value = `Generado el: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`
      dateCell.font = { size: 10, italic: true }
      dateCell.alignment = { horizontal: "center" }
      worksheet.getRow(3).height = 20

      // Encabezados
      const headers: string[] = []
      const fields: string[] = []

      if (selectedFields.nombre) {
        headers.push("Nombre Completo")
        fields.push("nombre")
      }
      if (selectedFields.identificacion) {
        headers.push("Identificación")
        fields.push("identificacion")
      }
      if (selectedFields.tipoIdentificacion) {
        headers.push("Tipo de Identificación")
        fields.push("tipoIdentificacion")
      }
      if (selectedFields.email) {
        headers.push("Correo Electrónico")
        fields.push("email")
      }
      if (selectedFields.telefono) {
        headers.push("Teléfono")
        fields.push("telefono")
      }
      if (selectedFields.estadoCivil) {
        headers.push("Estado Civil")
        fields.push("estadoCivil")
      }
      if (selectedFields.esPerson) {
        headers.push("Es Persona Física")
        fields.push("esPerson")
      }
      if (selectedFields.provincia) {
        headers.push("Provincia")
        fields.push("provincia")
      }
      if (selectedFields.canton) {
        headers.push("Cantón")
        fields.push("canton")
      }
      if (selectedFields.distrito) {
        headers.push("Distrito")
        fields.push("distrito")
      }
      if (selectedFields.barrio) {
        headers.push("Barrio")
        fields.push("barrio")
      }
      if (selectedFields.direcciones) {
        headers.push("Direcciones Adicionales")
        fields.push("direcciones")
      }
      if (selectedFields.observaciones) {
        headers.push("Observaciones")
        fields.push("observaciones")
      }
      if (selectedFields.proyectos) {
        headers.push("N° de Proyectos")
        fields.push("proyectos")
      }

      worksheet.getRow(5).values = headers
      worksheet.getRow(5).font = { bold: true, color: { argb: "FFFFFFFF" } }
      worksheet.getRow(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: secondaryColor }
      }
      worksheet.getRow(5).alignment = { vertical: "middle", horizontal: "center" }
      worksheet.getRow(5).height = 25

      // Datos
      let rowIndex = 6
      clients.forEach((client: any) => {
        const rowData: any[] = []
        
        if (selectedFields.nombre) {
          const fullName = `${client.CLI_name || ""} ${client.CLI_f_lastname || ""} ${client.CLI_s_lastname || ""}`.trim()
          rowData.push(fullName)
        }
        if (selectedFields.identificacion) {
          rowData.push(client.CLI_identification || "N/A")
        }
        if (selectedFields.tipoIdentificacion) {
          rowData.push(translateIdentificationType(client.CLI_identificationtype))
        }
        if (selectedFields.email) {
          rowData.push(client.CLI_email || "N/A")
        }
        if (selectedFields.telefono) {
          rowData.push(client.CLI_phone || "N/A")
        }
        if (selectedFields.estadoCivil) {
          rowData.push(translateCivilStatus(client.CLI_civil_status))
        }
        if (selectedFields.esPerson) {
          rowData.push(client.CLI_isperson ? "Sí" : "No")
        }
        if (selectedFields.provincia) {
          rowData.push(client.CLI_province || "N/A")
        }
        if (selectedFields.canton) {
          rowData.push(client.CLI_canton || "N/A")
        }
        if (selectedFields.distrito) {
          rowData.push(client.CLI_district || "N/A")
        }
        if (selectedFields.barrio) {
          rowData.push(client.CLI_neighborhood || "N/A")
        }
        if (selectedFields.direcciones) {
          rowData.push(client.CLI_additional_directions || "N/A")
        }
        if (selectedFields.observaciones) {
          rowData.push(client.CLI_observations || "N/A")
        }
        if (selectedFields.proyectos) {
          rowData.push(client.CLI_projects_amount || 0)
        }

        worksheet.getRow(rowIndex).values = rowData
        worksheet.getRow(rowIndex).alignment = { vertical: "middle" }
        
        // Alternar colores de fila
        if (rowIndex % 2 === 0) {
          worksheet.getRow(rowIndex).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F5F5F5" }
          }
        }
        
        rowIndex++
      })

      // Ajustar ancho de columnas
      worksheet.columns.forEach((column, index) => {
        column.width = 20
      })

      // Bordes
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= 5) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            }
          })
        }
      })

      // Resumen al final
      const summaryRow = rowIndex + 1
      worksheet.mergeCells(`A${summaryRow}:${String.fromCharCode(64 + headers.length)}${summaryRow}`)
      const summaryCell = worksheet.getCell(`A${summaryRow}`)
      summaryCell.value = `Total de clientes: ${clients.length}`
      summaryCell.font = { bold: true, size: 12 }
      summaryCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: lightColor }
      }
      summaryCell.alignment = { horizontal: "center" }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(blob, `Reporte_Clientes_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`)

      toast({
        title: "Reporte generado",
        description: "El reporte de clientes se ha descargado exitosamente"
      })
    } catch (error) {
      console.error("Error generando reporte:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el reporte de clientes",
        variant: "destructive"
      })
    }
  }

  const generateProjectsReport = async () => {
    try {
      const response = await fetch("/api/projects")
      const data = await response.json()
      let projects = data.projects || []

      // Aplicar filtro de fecha
      const dateFilter = getDateFilter(dateRange)
      if (dateFilter) {
        projects = projects.filter((p: any) => {
          const entryDate = new Date(p.PRJ_entry_date)
          return entryDate >= dateFilter
        })
      }

      // Aplicar filtro de estado
      if (estadoFilter !== "todos") {
        projects = projects.filter((p: any) => p.PRJ_state === estadoFilter)
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Proyectos")

      const primaryColor = "2E4600"
      const secondaryColor = "486B00"
      const lightColor = "C9E077"

      // Título
      worksheet.mergeCells("A1:I1")
      const titleCell = worksheet.getCell("A1")
      titleCell.value = "REPORTE DE PROYECTOS"
      titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } }
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: primaryColor }
      }
      titleCell.alignment = { vertical: "middle", horizontal: "center" }
      worksheet.getRow(1).height = 35

      // Filtros aplicados
      worksheet.mergeCells("A2:I2")
      const filterCell = worksheet.getCell("A2")
      let filterText = `Filtro de fecha: ${translateDateRange(dateRange)}`
      if (estadoFilter !== "todos") {
        filterText += ` | Estado: ${translateProjectState(estadoFilter)}`
      }
      filterCell.value = filterText
      filterCell.font = { size: 11, italic: true }
      filterCell.alignment = { horizontal: "center" }
      worksheet.getRow(2).height = 20

      // Fecha de generación
      worksheet.mergeCells("A3:I3")
      const dateCell = worksheet.getCell("A3")
      dateCell.value = `Generado el: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`
      dateCell.font = { size: 10, italic: true }
      dateCell.alignment = { horizontal: "center" }
      worksheet.getRow(3).height = 20

      // Encabezados
      const headers: string[] = []
      const fields: string[] = []

      if (selectedFields.numeroCaso) {
        headers.push("N° de Caso")
        fields.push("numeroCaso")
      }
      if (selectedFields.cliente) {
        headers.push("Cliente")
        fields.push("cliente")
      }
      if (selectedFields.identificacionCliente) {
        headers.push("Identificación Cliente")
        fields.push("identificacionCliente")
      }
      if (selectedFields.estado) {
        headers.push("Estado")
        fields.push("estado")
      }
      if (selectedFields.tipo) {
        headers.push("Tipo de Proyecto")
        fields.push("tipo")
      }
      if (selectedFields.categorias) {
        headers.push("Categorías")
        fields.push("categorias")
      }
      if (selectedFields.presupuesto) {
        headers.push("Presupuesto Inicial")
        fields.push("presupuesto")
      }
      if (selectedFields.precioFinal) {
        headers.push("Precio Final")
        fields.push("precioFinal")
      }
      if (selectedFields.restante) {
        headers.push("Monto Restante")
        fields.push("restante")
      }
      if (selectedFields.area) {
        headers.push("Área (m²)")
        fields.push("area")
      }
      if (selectedFields.fechaIngreso) {
        headers.push("Fecha de Ingreso")
        fields.push("fechaIngreso")
      }
      if (selectedFields.fechaEntrega) {
        headers.push("Fecha de Entrega")
        fields.push("fechaEntrega")
      }
      if (selectedFields.fechaInicioConst) {
        headers.push("Fecha Inicio Construcción")
        fields.push("fechaInicioConst")
      }
      if (selectedFields.fechaCierreBitacora) {
        headers.push("Fecha Cierre Bitácora")
        fields.push("fechaCierreBitacora")
      }
      if (selectedFields.numeroBitacora) {
        headers.push("N° Bitácora")
        fields.push("numeroBitacora")
      }
      if (selectedFields.provincia) {
        headers.push("Provincia")
        fields.push("provincia")
      }
      if (selectedFields.canton) {
        headers.push("Cantón")
        fields.push("canton")
      }
      if (selectedFields.distrito) {
        headers.push("Distrito")
        fields.push("distrito")
      }
      if (selectedFields.barrio) {
        headers.push("Barrio")
        fields.push("barrio")
      }
      if (selectedFields.direcciones) {
        headers.push("Direcciones Adicionales")
        fields.push("direcciones")
      }
      if (selectedFields.notas) {
        headers.push("Notas")
        fields.push("notas")
      }

      worksheet.getRow(5).values = headers
      worksheet.getRow(5).font = { bold: true, color: { argb: "FFFFFFFF" } }
      worksheet.getRow(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: secondaryColor }
      }
      worksheet.getRow(5).alignment = { vertical: "middle", horizontal: "center" }
      worksheet.getRow(5).height = 25

      // Datos
      let rowIndex = 6
      let totalBudget = 0
      let totalRemaining = 0

      projects.forEach((project: any) => {
        const rowData: any[] = []
        
        if (selectedFields.numeroCaso) {
          rowData.push(project.PRJ_case_number || "N/A")
        }
        if (selectedFields.cliente) {
          rowData.push(project.client_name || "N/A")
        }
        if (selectedFields.identificacionCliente) {
          rowData.push(project.client_identification || "N/A")
        }
        if (selectedFields.estado) {
          rowData.push(translateProjectState(project.PRJ_state))
        }
        if (selectedFields.tipo) {
          rowData.push(project.type?.TYP_name || "N/A")
        }
        if (selectedFields.categorias) {
          rowData.push(project.categories_names?.join(", ") || "N/A")
        }
        if (selectedFields.presupuesto) {
          const budget = parseFloat(project.PRJ_budget) || 0
          totalBudget += budget
          rowData.push(`₡${budget.toLocaleString("es-CR", { minimumFractionDigits: 2 })}`)
        }
        if (selectedFields.precioFinal) {
          rowData.push(project.PRJ_final_price ? `₡${parseFloat(project.PRJ_final_price).toLocaleString("es-CR", { minimumFractionDigits: 2 })}` : "N/A")
        }
        if (selectedFields.restante) {
          const remaining = parseFloat(project.PRJ_remaining_amount) || 0
          totalRemaining += remaining
          rowData.push(`₡${remaining.toLocaleString("es-CR", { minimumFractionDigits: 2 })}`)
        }
        if (selectedFields.area) {
          rowData.push(project.PRJ_area_m2 ? `${parseFloat(project.PRJ_area_m2).toLocaleString("es-CR", { minimumFractionDigits: 2 })} m²` : "N/A")
        }
        if (selectedFields.fechaIngreso) {
          rowData.push(project.PRJ_entry_date ? format(new Date(project.PRJ_entry_date), "dd/MM/yyyy") : "N/A")
        }
        if (selectedFields.fechaEntrega) {
          rowData.push(project.PRJ_completion_date ? format(new Date(project.PRJ_completion_date), "dd/MM/yyyy") : "N/A")
        }
        if (selectedFields.fechaInicioConst) {
          rowData.push(project.PRJ_start_construction_date ? format(new Date(project.PRJ_start_construction_date), "dd/MM/yyyy") : "N/A")
        }
        if (selectedFields.fechaCierreBitacora) {
          rowData.push(project.PRJ_logbook_close_date ? format(new Date(project.PRJ_logbook_close_date), "dd/MM/yyyy") : "N/A")
        }
        if (selectedFields.numeroBitacora) {
          rowData.push(project.PRJ_logbook_number || "N/A")
        }
        if (selectedFields.provincia) {
          rowData.push(project.PRJ_province || "N/A")
        }
        if (selectedFields.canton) {
          rowData.push(project.PRJ_canton || "N/A")
        }
        if (selectedFields.distrito) {
          rowData.push(project.PRJ_district || "N/A")
        }
        if (selectedFields.barrio) {
          rowData.push(project.PRJ_neighborhood || "N/A")
        }
        if (selectedFields.direcciones) {
          rowData.push(project.PRJ_additional_directions || "N/A")
        }
        if (selectedFields.notas) {
          rowData.push(project.PRJ_notes || "N/A")
        }

        worksheet.getRow(rowIndex).values = rowData
        worksheet.getRow(rowIndex).alignment = { vertical: "middle" }
        
        if (rowIndex % 2 === 0) {
          worksheet.getRow(rowIndex).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F5F5F5" }
          }
        }
        
        rowIndex++
      })

      // Ajustar ancho de columnas
      worksheet.columns.forEach((column) => {
        column.width = 18
      })

      // Bordes
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= 5) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            }
          })
        }
      })

      // Resumen
      const summaryRow = rowIndex + 1
      worksheet.mergeCells(`A${summaryRow}:${String.fromCharCode(64 + headers.length)}${summaryRow}`)
      const summaryCell = worksheet.getCell(`A${summaryRow}`)
      summaryCell.value = `Total de proyectos: ${projects.length} | Presupuesto total: ₡${totalBudget.toLocaleString("es-CR", { minimumFractionDigits: 2 })} | Monto restante: ₡${totalRemaining.toLocaleString("es-CR", { minimumFractionDigits: 2 })}`
      summaryCell.font = { bold: true, size: 11 }
      summaryCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: lightColor }
      }
      summaryCell.alignment = { horizontal: "center" }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(blob, `Reporte_Proyectos_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`)

      toast({
        title: "Reporte generado",
        description: "El reporte de proyectos se ha descargado exitosamente"
      })
    } catch (error) {
      console.error("Error generando reporte:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el reporte de proyectos",
        variant: "destructive"
      })
    }
  }

  const generatePaymentsReport = async () => {
    try {
      const response = await fetch("/api/payments")
      let payments = await response.json()

      // Aplicar filtro de fecha
      const dateFilter = getDateFilter(dateRange)
      if (dateFilter) {
        payments = payments.filter((p: any) => {
          const paymentDate = new Date(p.PAY_payment_date)
          return paymentDate >= dateFilter
        })
      }

      // Aplicar filtro de método de pago
      if (metodoPagoFilter !== "todos") {
        payments = payments.filter((p: any) => p.PAY_method === metodoPagoFilter)
      }

      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet("Pagos")

      const primaryColor = "2E4600"
      const secondaryColor = "486B00"
      const lightColor = "C9E077"

      // Título
      worksheet.mergeCells("A1:H1")
      const titleCell = worksheet.getCell("A1")
      titleCell.value = "REPORTE DE PAGOS"
      titleCell.font = { size: 18, bold: true, color: { argb: "FFFFFFFF" } }
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: primaryColor }
      }
      titleCell.alignment = { vertical: "middle", horizontal: "center" }
      worksheet.getRow(1).height = 35

      // Filtros aplicados
      worksheet.mergeCells("A2:H2")
      const filterCell = worksheet.getCell("A2")
      let filterText = `Filtro de fecha: ${translateDateRange(dateRange)}`
      if (metodoPagoFilter !== "todos") {
        filterText += ` | Método de pago: ${translatePaymentMethod(metodoPagoFilter)}`
      }
      filterCell.value = filterText
      filterCell.font = { size: 11, italic: true }
      filterCell.alignment = { horizontal: "center" }
      worksheet.getRow(2).height = 20

      // Fecha de generación
      worksheet.mergeCells("A3:H3")
      const dateCell = worksheet.getCell("A3")
      dateCell.value = `Generado el: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`
      dateCell.font = { size: 10, italic: true }
      dateCell.alignment = { horizontal: "center" }
      worksheet.getRow(3).height = 20

      // Encabezados
      const headers: string[] = []
      const fields: string[] = []

      if (selectedFields.fecha) {
        headers.push("Fecha de Pago")
        fields.push("fecha")
      }
      if (selectedFields.monto) {
        headers.push("Monto")
        fields.push("monto")
      }
      if (selectedFields.metodo) {
        headers.push("Método de Pago")
        fields.push("metodo")
      }
      if (selectedFields.numeroCaso) {
        headers.push("N° de Caso")
        fields.push("numeroCaso")
      }
      if (selectedFields.cliente) {
        headers.push("Cliente")
        fields.push("cliente")
      }
      if (selectedFields.detalle) {
        headers.push("Detalle del Pago")
        fields.push("detalle")
      }
      if (selectedFields.estadoProyecto) {
        headers.push("Estado del Proyecto")
        fields.push("estadoProyecto")
      }

      worksheet.getRow(5).values = headers
      worksheet.getRow(5).font = { bold: true, color: { argb: "FFFFFFFF" } }
      worksheet.getRow(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: secondaryColor }
      }
      worksheet.getRow(5).alignment = { vertical: "middle", horizontal: "center" }
      worksheet.getRow(5).height = 25

      // Datos
      let rowIndex = 6
      let totalAmount = 0

      payments.forEach((payment: any) => {
        const rowData: any[] = []
        
        if (selectedFields.fecha) {
          rowData.push(payment.PAY_payment_date ? format(new Date(payment.PAY_payment_date), "dd/MM/yyyy") : "N/A")
        }
        if (selectedFields.monto) {
          const amount = parseFloat(payment.PAY_amount_paid) || 0
          totalAmount += amount
          rowData.push(`₡${amount.toLocaleString("es-CR", { minimumFractionDigits: 2 })}`)
        }
        if (selectedFields.metodo) {
          rowData.push(payment.PAY_method ? translatePaymentMethod(payment.PAY_method) : "N/A")
        }
        if (selectedFields.numeroCaso) {
          rowData.push(payment.projectCaseNumber || "N/A")
        }
        if (selectedFields.cliente) {
          rowData.push(payment.projectClientName || "N/A")
        }
        if (selectedFields.detalle) {
          rowData.push(payment.PAY_description || "N/A")
        }
        if (selectedFields.estadoProyecto) {
          rowData.push(payment.projectState ? translateProjectState(payment.projectState) : "N/A")
        }

        worksheet.getRow(rowIndex).values = rowData
        worksheet.getRow(rowIndex).alignment = { vertical: "middle" }
        
        if (rowIndex % 2 === 0) {
          worksheet.getRow(rowIndex).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F5F5F5" }
          }
        }
        
        rowIndex++
      })

      // Ajustar ancho de columnas
      worksheet.columns.forEach((column) => {
        column.width = 20
      })

      // Bordes
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber >= 5) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            }
          })
        }
      })

      // Resumen
      const summaryRow = rowIndex + 1
      worksheet.mergeCells(`A${summaryRow}:${String.fromCharCode(64 + headers.length)}${summaryRow}`)
      const summaryCell = worksheet.getCell(`A${summaryRow}`)
      summaryCell.value = `Total de pagos: ${payments.length} | Monto total recibido: ₡${totalAmount.toLocaleString("es-CR", { minimumFractionDigits: 2 })}`
      summaryCell.font = { bold: true, size: 11 }
      summaryCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: lightColor }
      }
      summaryCell.alignment = { horizontal: "center" }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(blob, `Reporte_Pagos_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`)

      toast({
        title: "Reporte generado",
        description: "El reporte de pagos se ha descargado exitosamente"
      })
    } catch (error) {
      console.error("Error generando reporte:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el reporte de pagos",
        variant: "destructive"
      })
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedReport) return

    setIsGenerating(true)

    try {
      switch (selectedReport) {
        case "clientes":
          await generateClientsReport()
          break
        case "proyectos":
          await generateProjectsReport()
          break
        case "pagos":
          await generatePaymentsReport()
          break
      }
    } finally {
      setIsGenerating(false)
    }
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
                      <h4 className="font-medium">{report.title}</h4>
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
                  {/* Rango de Fechas - Solo para proyectos y pagos */}
                  {(selectedReport === "proyectos" || selectedReport === "pagos") && (
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
                  )}

                  {/* Filtros adicionales según tipo de reporte */}
                  {selectedReport === "proyectos" && (
                    <div className="space-y-2">
                      <Label>Estado del Proyecto</Label>
                      <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los estados</SelectItem>
                          <SelectItem value="Document Collection">Recolección de Documentos</SelectItem>
                          <SelectItem value="Technical Inspection">Inspección Técnica</SelectItem>
                          <SelectItem value="Document Review">Revisión de Documentos</SelectItem>
                          <SelectItem value="Plans and Budget">Planos y Presupuesto</SelectItem>
                          <SelectItem value="Entity Review">Revisión de Entidad</SelectItem>
                          <SelectItem value="APC and Permits">APC y Permisos</SelectItem>
                          <SelectItem value="Disbursement">Desembolso</SelectItem>
                          <SelectItem value="Under Construction">En Construcción</SelectItem>
                          <SelectItem value="Completed">Completado</SelectItem>
                          <SelectItem value="Logbook Closed">Bitácora Cerrada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedReport === "pagos" && (
                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <Select value={metodoPagoFilter} onValueChange={setMetodoPagoFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los métodos</SelectItem>
                          <SelectItem value="Cash">Efectivo</SelectItem>
                          <SelectItem value="Card">Tarjeta</SelectItem>
                          <SelectItem value="SINPE">SINPE Móvil</SelectItem>
                          <SelectItem value="Transfer">Transferencia</SelectItem>
                          <SelectItem value="Deposit">Depósito</SelectItem>
                          <SelectItem value="Check">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Campos a Incluir */}
                  <div className="space-y-3">
                    <Label>Campos a Incluir</Label>
                    
                    {/* Checkbox para incluir todos los campos */}
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md border border-primary-light/30">
                      <Checkbox
                        id="includeAll"
                        checked={includeAllFields}
                        onCheckedChange={(checked) => handleIncludeAllToggle(checked as boolean)}
                      />
                      <Label htmlFor="includeAll" className="text-sm font-semibold cursor-pointer">
                        Incluir todos los campos
                      </Label>
                    </div>

                    {/* Lista de campos individuales */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {currentReport?.fields.map((field) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={field.id}
                            checked={selectedFields[field.id] || false}
                            disabled={includeAllFields}
                            onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                          />
                          <Label 
                            htmlFor={field.id} 
                            className={`text-sm ${includeAllFields ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer'}`}
                          >
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

                  {/* Botón de Vista Previa */}
                  <Button
                    onClick={loadPreviewData}
                    disabled={isLoadingPreview}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoadingPreview ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-medium mr-2" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Vista Previa
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

        {/* Vista Previa del Reporte */}
        {showPreview && selectedReport && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vista Previa del Reporte</CardTitle>
                  <CardDescription>
                    Mostrando {currentItems.length} de {previewData.length} registros
                    {selectedReport !== "clientes" && dateRange !== "todo" && ` (${translateDateRange(dateRange)})`}
                    {selectedReport === "proyectos" && estadoFilter !== "todos" && ` - ${translateProjectState(estadoFilter)}`}
                    {selectedReport === "pagos" && metodoPagoFilter !== "todos" && ` - ${translatePaymentMethod(metodoPagoFilter)}`}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadPreviewData}
                  disabled={isLoadingPreview}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingPreview ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-medium" />
                </div>
              ) : previewData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay datos que coincidan con los filtros seleccionados</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {renderPreviewHeaders()}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentItems.map((item, index) => renderPreviewRow(item, index))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Resumen */}
                  <div className="mt-4 p-4 bg-primary-lighter/10 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Registros</p>
                        <p className="text-2xl font-bold text-primary-dark">{previewData.length}</p>
                      </div>
                      {selectedReport === "proyectos" && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Presupuesto Total</p>
                            <p className="text-2xl font-bold text-primary-dark">
                              ₡{previewData.reduce((sum, p) => sum + (parseFloat(p.PRJ_budget) || 0), 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Monto Restante</p>
                            <p className="text-2xl font-bold text-primary-dark">
                              ₡{previewData.reduce((sum, p) => sum + (parseFloat(p.PRJ_remaining_amount) || 0), 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </>
                      )}
                      {selectedReport === "pagos" && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">Monto Total Recibido</p>
                          <p className="text-2xl font-bold text-primary-dark">
                            ₡{previewData.reduce((sum, p) => sum + (parseFloat(p.PAY_amount_paid) || 0), 0).toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
