"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText, ImageIcon, File, Download, Eye, Trash2, X, Plus, Paperclip, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileInfo {
    docId: number
    fileName: string
    filePath: string
    documentName: string
    fileSize: number
    uploadDate: string
    lastModified: string
    filetypeId?: number
    filetypeName?: string
    isForPromotion?: 'Y' | 'N'
}

interface ProjectDocumentManagerProps {
    projectId: string | number | null | undefined
    canEdit?: boolean
    showUpload?: boolean
    title?: string
}

const documentIcons = {
    pdf: FileText,
    jpg: ImageIcon,
    jpeg: ImageIcon,
    png: ImageIcon,
    gif: ImageIcon,
    doc: FileText,
    docx: FileText,
    xls: FileText,
    xlsx: FileText,
    dwg: FileText,
    default: File,
}

const categoryColors = {
    pdf: "bg-red-500",
    jpg: "bg-blue-500",
    jpeg: "bg-blue-500",
    png: "bg-blue-500",
    gif: "bg-blue-500",
    doc: "bg-indigo-500",
    docx: "bg-indigo-500",
    xls: "bg-green-500",
    xlsx: "bg-green-500",
    dwg: "bg-purple-500",
    default: "bg-gray-500",
}

export function ProjectDocumentManager({
    projectId,
    canEdit = true,
    showUpload = true,
    title = "Documentos del Proyecto",
}: ProjectDocumentManagerProps) {
    const { toast } = useToast()
    const [documents, setDocuments] = useState<FileInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [previewDocument, setPreviewDocument] = useState<FileInfo | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [documentName, setDocumentName] = useState<string>("")
    const [isForPromotion, setIsForPromotion] = useState<boolean>(false)

    // Fetch documents when component mounts or projectId changes
    useEffect(() => {
        if (projectId) {
            fetchDocuments()
        } else {
            setDocuments([])
        }
    }, [projectId])

    const fetchDocuments = async () => {
        if (!projectId) return

        try {
            setIsLoading(true)
            const response = await fetch(`/api/upload/${projectId}`)
            const data = await response.json()

            if (response.ok) {
                setDocuments(data.files || [])
            } else {
                console.error("Error fetching files:", data.error)
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los documentos",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Error fetching project files:", error)
            toast({
                title: "Error",
                description: "Error de conexión al cargar documentos",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase() || 'default'
        const IconComponent = documentIcons[extension as keyof typeof documentIcons] || documentIcons.default
        return IconComponent
    }

    const getFileColor = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase() || 'default'
        return categoryColors[extension as keyof typeof categoryColors] || categoryColors.default
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            // Auto-fill document name with file name (without extension)
            const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
            setDocumentName(nameWithoutExtension)
            // Reset promotion checkbox
            setIsForPromotion(false)
        }
    }

    const handleFileUpload = async () => {
        if (!selectedFile || !projectId || !documentName.trim()) {
            toast({
                title: "Error",
                description: 'Por favor proporciona un nombre para el documento',
                variant: "destructive"
            })
            return
        }

        try {
            setIsUploading(true)
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('documentName', documentName.trim())
            formData.append('isForPromotion', isForPromotion ? 'Y' : 'N')

            const response = await fetch(`/api/upload/${projectId}`, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (response.ok) {
                toast({
                    title: "Documento subido",
                    description: `"${result.documentName}" se ha subido exitosamente`,
                    variant: "success"
                })
                setSelectedFile(null)
                setDocumentName("")
                setIsForPromotion(false)
                // Reset file input
                const fileInput = document.getElementById('file-upload-project') as HTMLInputElement
                if (fileInput) fileInput.value = ''

                // Reload documents
                await fetchDocuments()
            } else {
                toast({
                    title: "Error",
                    description: result.error || 'Error al subir el documento',
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Upload error:", error)
            toast({
                title: "Error",
                description: 'Error de conexión al subir el documento',
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            setSelectedFile(file)
            const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
            setDocumentName(nameWithoutExtension)
            setIsForPromotion(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
    }

    const removeDocument = async (fileName: string, docId: number) => {
        if (!projectId) return

        if (!confirm(`¿Estás seguro de que quieres eliminar el archivo "${fileName}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/upload/${projectId}/${fileName}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (response.ok) {
                toast({
                    title: "Documento eliminado",
                    description: `El archivo se eliminó exitosamente`,
                    variant: "success"
                })
                // Reload documents
                await fetchDocuments()
            } else {
                toast({
                    title: "Error",
                    description: result.error || 'Error al eliminar el archivo',
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Delete error:", error)
            toast({
                title: "Error",
                description: 'Error de conexión al eliminar el archivo',
                variant: "destructive"
            })
        }
    }

    const downloadDocument = (filePath: string, fileName: string, documentName?: string) => {
        // Create download link
        const link = document.createElement('a')
        link.href = filePath + '?download=true'
        link.download = documentName || fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const previewDoc = (doc: FileInfo) => {
        setPreviewDocument(doc)
    }

    return (
        <Card className="border-[#a2c523]/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[#2e4600] flex items-center">
                        <Paperclip className="mr-2 h-5 w-5" />
                        {title} ({documents.length})
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchDocuments}
                        disabled={isLoading || !projectId}
                        className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!projectId && (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Guarda el proyecto primero para poder subir documentos</p>
                    </div>
                )}

                {projectId && showUpload && canEdit && (
                    <>
                        {/* Zona de carga */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver
                                    ? "border-[#486b00] bg-[#c9e077]/10"
                                    : "border-[#a2c523]/30 hover:border-[#486b00] hover:bg-[#c9e077]/5"
                                }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <Upload className="mx-auto h-8 w-8 text-[#486b00] mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Arrastra archivos aquí o haz clic para seleccionar
                            </p>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload-project"
                                accept="*/*"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    document.getElementById("file-upload-project")?.click()
                                }}
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
                                        Seleccionar Archivo
                                    </>
                                )}
                            </Button>

                            {selectedFile && (
                                <div className="mt-4 text-sm text-muted-foreground">
                                    Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                            )}
                        </div>

                        {/* Document name input */}
                        {selectedFile && (
                            <div className="space-y-2">
                                <Label htmlFor="document-name-input">Nombre del Documento</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="document-name-input"
                                        type="text"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        placeholder="Ej: Planos arquitectónicos, Presupuesto inicial, etc."
                                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                                    />
                                    <Button
                                        onClick={handleFileUpload}
                                        disabled={isUploading || !documentName.trim()}
                                        className="gradient-primary text-white hover:opacity-90"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Subiendo...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4 mr-2" />
                                                Subir
                                            </>
                                        )}
                                    </Button>
                                </div>
                                {/* Checkbox para imágenes */}
                                {selectedFile && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(selectedFile.name) && (
                                    <div className="flex items-center space-x-2 pt-1">
                                        <Checkbox
                                            id="promo-checkbox"
                                            checked={isForPromotion}
                                            onCheckedChange={(checked) => setIsForPromotion(checked === true)}
                                            className="border-[#a2c523]"
                                        />
                                        <label
                                            htmlFor="promo-checkbox"
                                            className="text-sm text-muted-foreground cursor-pointer"
                                        >
                                            Usar esta imagen para promoción
                                        </label>
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                    Este nombre se usará para identificar el documento en la base de datos
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Lista de documentos */}
                {projectId && (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {isLoading && documents.length === 0 ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#486b00]" />
                                <span className="text-muted-foreground">Cargando documentos...</span>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No hay documentos en este proyecto</p>
                                {showUpload && canEdit && (
                                    <p className="text-sm">Usa el formulario arriba para agregar documentos</p>
                                )}
                            </div>
                        ) : (
                            documents.map((doc, index) => {
                                const IconComponent = getFileIcon(doc.fileName)
                                const colorClass = getFileColor(doc.fileName)
                                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(doc.fileName)
                                return (
                                    <div
                                        key={doc.docId}
                                        className="flex items-center justify-between p-3 border border-[#c9e077]/30 rounded-lg hover:bg-[#c9e077]/5 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <IconComponent className="h-5 w-5 text-[#486b00] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{doc.documentName}</p>
                                                    {isImage && doc.isForPromotion === 'Y' && (
                                                        <Badge className="bg-purple-500 text-white text-xs">
                                                            Promoción
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                    <span>{formatFileSize(doc.fileSize)}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(doc.uploadDate)}</span>
                                                    {doc.filetypeName && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{doc.filetypeName.toUpperCase()}</span>
                                                        </>
                                                    )}
                                                </div>
                                                {/* Checkbox para cambiar estado de promoción en imágenes */}
                                                {isImage && canEdit && (
                                                    <div className="flex items-center space-x-2 pt-1">
                                                        <Checkbox
                                                            id={`promo-doc-${doc.docId}`}
                                                            checked={doc.isForPromotion === 'Y'}
                                                            onCheckedChange={async (checked) => {
                                                                // Actualizar en la base de datos
                                                                try {
                                                                    const response = await fetch(`/api/documents/${doc.docId}`, {
                                                                        method: 'PUT',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({
                                                                            DOC_image_for_promotion: checked ? 'Y' : 'N'
                                                                        })
                                                                    })
                                                                    if (response.ok) {
                                                                        toast({
                                                                            title: "Estado actualizado",
                                                                            description: checked 
                                                                                ? "Imagen marcada para promoción" 
                                                                                : "Imagen desmarcada de promoción",
                                                                            variant: "success"
                                                                        })
                                                                        // Recargar documentos
                                                                        await fetchDocuments()
                                                                    } else {
                                                                        toast({
                                                                            title: "Error",
                                                                            description: "No se pudo actualizar el estado",
                                                                            variant: "destructive"
                                                                        })
                                                                    }
                                                                } catch (error) {
                                                                    toast({
                                                                        title: "Error",
                                                                        description: "Error de conexión",
                                                                        variant: "destructive"
                                                                    })
                                                                }
                                                            }}
                                                            className="border-[#a2c523]"
                                                        />
                                                        <label
                                                            htmlFor={`promo-doc-${doc.docId}`}
                                                            className="text-xs text-muted-foreground cursor-pointer"
                                                        >
                                                            Usar para promoción
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            <Badge className={`${colorClass} text-white text-xs flex-shrink-0`}>
                                                {doc.filetypeName?.toUpperCase() || 'FILE'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-1 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => previewDoc(doc)}
                                                className="hover:bg-[#c9e077]/20 h-8 w-8 p-0"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => downloadDocument(doc.filePath, doc.fileName, doc.documentName)}
                                                className="hover:bg-[#c9e077]/20 h-8 w-8 p-0"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDocument(doc.fileName, doc.docId)}
                                                    className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {/* Estadísticas */}
                {documents.length > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-[#c9e077]/20">
                        <span>Total: {formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0))}</span>
                        <span>{documents.length} documento{documents.length !== 1 ? 's' : ''}</span>
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
                                            <DialogTitle className="text-[#2e4600]">{previewDocument.documentName}</DialogTitle>
                                            <DialogDescription>
                                                {previewDocument.fileName} • {formatFileSize(previewDocument.fileSize)} • {formatDate(previewDocument.uploadDate)}
                                            </DialogDescription>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadDocument(previewDocument.filePath, previewDocument.fileName, previewDocument.documentName)}
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
                                    {previewDocument.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                        <img
                                            src={previewDocument.filePath}
                                            alt={previewDocument.documentName}
                                            className="w-full h-auto"
                                        />
                                    ) : previewDocument.fileName.match(/\.pdf$/i) ? (
                                        <div className="p-8 text-center">
                                            <FileText className="h-16 w-16 mx-auto mb-4 text-[#486b00]" />
                                            <p className="text-lg font-medium mb-2">Vista previa de PDF</p>
                                            <p className="text-muted-foreground mb-4">La vista previa completa de PDF requiere descarga</p>
                                            <Button
                                                onClick={() => downloadDocument(previewDocument.filePath, previewDocument.fileName, previewDocument.documentName)}
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
                                                onClick={() => downloadDocument(previewDocument.filePath, previewDocument.fileName, previewDocument.documentName)}
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
