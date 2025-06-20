"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText, ImageIcon, File, Download, Eye, Trash2, X, Plus, Paperclip } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  category: "plano" | "permiso" | "contrato" | "foto" | "otro"
  url?: string
}

interface DocumentManagerProps {
  documents: Document[]
  onDocumentsChange: (documents: Document[]) => void
  canEdit?: boolean
  showUpload?: boolean
  title?: string
}

const documentIcons = {
  "application/pdf": FileText,
  "image/jpeg": ImageIcon,
  "image/png": ImageIcon,
  "image/jpg": ImageIcon,
  "application/msword": FileText,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileText,
  default: File,
}

const categoryColors = {
  plano: "bg-blue-500",
  permiso: "bg-green-500",
  contrato: "bg-purple-500",
  foto: "bg-orange-500",
  otro: "bg-gray-500",
}

const categoryLabels = {
  plano: "Plano",
  permiso: "Permiso",
  contrato: "Contrato",
  foto: "Fotografía",
  otro: "Otro",
}

export function DocumentManager({
  documents,
  onDocumentsChange,
  canEdit = true,
  showUpload = true,
  title = "Documentos",
}: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    const IconComponent = documentIcons[type as keyof typeof documentIcons] || documentIcons.default
    return IconComponent
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)

    // Simular carga de archivos
    const newDocuments: Document[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simular carga

      const newDoc: Document = {
        id: `doc_${Date.now()}_${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString().split("T")[0],
        category: file.type.startsWith("image/") ? "foto" : "otro",
        url: URL.createObjectURL(file), // En producción sería la URL del servidor
      }
      newDocuments.push(newDoc)
    }

    onDocumentsChange([...documents, ...newDocuments])
    setIsUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeDocument = (docId: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== docId))
  }

  const downloadDocument = (doc: Document) => {
    // Simular descarga
    const link = document.createElement("a")
    link.href = doc.url || "#"
    link.download = doc.name
    link.click()
  }

  const previewDoc = (doc: Document) => {
    setPreviewDocument(doc)
  }

  return (
    <Card className="border-[#a2c523]/20">
      <CardHeader>
        <CardTitle className="text-[#2e4600] flex items-center">
          <Paperclip className="mr-2 h-5 w-5" />
          {title} ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zona de carga */}
        {showUpload && canEdit && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver
                ? "border-[#486b00] bg-[#c9e077]/10"
                : "border-[#a2c523]/30 hover:border-[#486b00] hover:bg-[#c9e077]/5"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-8 w-8 text-[#486b00] mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isUploading}
              className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#486b00] mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Seleccionar Archivos
                </>
              )}
            </Button>
          </div>
        )}

        {/* Lista de documentos */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {documents.map((doc, index) => {
            const IconComponent = getFileIcon(doc.type)
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-[#c9e077]/30 rounded-lg hover:bg-[#c9e077]/5 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <IconComponent className="h-5 w-5 text-[#486b00] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                  <Badge className={`${categoryColors[doc.category]} text-white text-xs flex-shrink-0`}>
                    {categoryLabels[doc.category]}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => previewDoc(doc)} className="hover:bg-[#c9e077]/20">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadDocument(doc)}
                    className="hover:bg-[#c9e077]/20"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay documentos adjuntos</p>
            {showUpload && canEdit && (
              <p className="text-sm">Arrastra archivos o usa el botón de arriba para agregar</p>
            )}
          </div>
        )}

        {/* Estadísticas */}
        {documents.length > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-[#c9e077]/20">
            <span>Total: {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}</span>
            <span>
              {documents.filter((d) => d.category === "plano").length} planos,{" "}
              {documents.filter((d) => d.category === "foto").length} fotos
            </span>
          </div>
        )}

        {/* Dialog de vista previa */}
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh]">
            {previewDocument && (
              <div className="space-y-4">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-[#2e4600]">{previewDocument.name}</DialogTitle>
                      <DialogDescription>
                        {formatFileSize(previewDocument.size)} • {previewDocument.uploadDate}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(previewDocument)}
                        className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setPreviewDocument(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-auto border border-[#c9e077]/20 rounded-lg">
                  {previewDocument.type.startsWith("image/") ? (
                    <img
                      src={previewDocument.url || "/placeholder.svg"}
                      alt={previewDocument.name}
                      className="w-full h-auto"
                    />
                  ) : previewDocument.type === "application/pdf" ? (
                    <div className="p-8 text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-[#486b00]" />
                      <p className="text-lg font-medium mb-2">Vista previa de PDF</p>
                      <p className="text-muted-foreground mb-4">La vista previa completa de PDF requiere descarga</p>
                      <Button
                        onClick={() => downloadDocument(previewDocument)}
                        className="gradient-primary text-white hover:opacity-90"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar para ver
                      </Button>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <File className="h-16 w-16 mx-auto mb-4 text-[#486b00]" />
                      <p className="text-lg font-medium mb-2">Archivo no previsualizable</p>
                      <p className="text-muted-foreground mb-4">
                        Este tipo de archivo requiere descarga para visualización
                      </p>
                      <Button
                        onClick={() => downloadDocument(previewDocument)}
                        className="gradient-primary text-white hover:opacity-90"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
