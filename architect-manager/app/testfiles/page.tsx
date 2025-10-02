"use client"

import { MainLayout } from "@/components/main-layout"
import { useEffect, useState } from "react";
import { GPAProject } from "@/models/GPA_project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, Download, Trash2, File } from "lucide-react";

interface FileInfo {
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadDate: string;
    lastModified: string;
}

export default function TestFiles() {
    const [projects, setProjects] = useState<GPAProject[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [projectFiles, setProjectFiles] = useState<FileInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingFiles, setIsLoadingFiles] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<{
        type: 'success' | 'error' | null,
        message: string
    }>({ type: null, message: '' })

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true)
                const response = await fetch("/api/projects")
                const data = await response.json()
                console.log("Projects data:", data)
                
                // El endpoint devuelve directamente el array de proyectos
                const projectsArray: GPAProject[] = Array.isArray(data) ? data : []
                setProjects(projectsArray)
            } catch (error) {
                console.error("Error fetching projects:", error)
                setUploadStatus({
                    type: 'error',
                    message: 'Error al cargar los proyectos'
                })
            } finally {
                setIsLoading(false)
            }
        }
        fetchProjects()
    }, [])

    // Efecto para cargar archivos cuando cambia el proyecto seleccionado
    useEffect(() => {
        if (selectedProjectId) {
            fetchProjectFiles(selectedProjectId)
        } else {
            setProjectFiles([])
        }
    }, [selectedProjectId])

    const fetchProjectFiles = async (projectId: string) => {
        try {
            setIsLoadingFiles(true)
            const response = await fetch(`/api/upload/${projectId}`)
            const data = await response.json()
            
            if (response.ok) {
                setProjectFiles(data.files || [])
            } else {
                console.error("Error fetching files:", data.error)
                setProjectFiles([])
            }
        } catch (error) {
            console.error("Error fetching project files:", error)
            setProjectFiles([])
        } finally {
            setIsLoadingFiles(false)
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setUploadStatus({ type: null, message: '' })
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !selectedProjectId) {
            setUploadStatus({
                type: 'error',
                message: 'Por favor selecciona un proyecto y un archivo'
            })
            return
        }

        try {
            setIsLoading(true)
            const formData = new FormData()
            formData.append('file', selectedFile)

            const response = await fetch(`/api/upload/${selectedProjectId}`, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (response.ok) {
                setUploadStatus({
                    type: 'success',
                    message: `Archivo subido exitosamente: ${result.fileName}`
                })
                setSelectedFile(null)
                // Reset file input
                const fileInput = document.getElementById('file-input') as HTMLInputElement
                if (fileInput) fileInput.value = ''
                
                // Recargar la lista de archivos del proyecto
                await fetchProjectFiles(selectedProjectId)
            } else {
                setUploadStatus({
                    type: 'error',
                    message: result.error || 'Error al subir el archivo'
                })
            }
        } catch (error) {
            console.error("Upload error:", error)
            setUploadStatus({
                type: 'error',
                message: 'Error de conexión al subir el archivo'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = (filePath: string, fileName: string) => {
        // Crear enlace de descarga
        const link = document.createElement('a')
        link.href = filePath + '?download=true'
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleDelete = async (fileName: string) => {
        if (!selectedProjectId) return
        
        if (!confirm(`¿Estás seguro de que quieres eliminar el archivo "${fileName}"?`)) {
            return
        }

        try {
            const response = await fetch(`/api/upload/${selectedProjectId}/${fileName}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (response.ok) {
                setUploadStatus({
                    type: 'success',
                    message: `Archivo eliminado exitosamente: ${fileName}`
                })
                // Recargar la lista de archivos
                await fetchProjectFiles(selectedProjectId)
            } else {
                setUploadStatus({
                    type: 'error',
                    message: result.error || 'Error al eliminar el archivo'
                })
            }
        } catch (error) {
            console.error("Delete error:", error)
            setUploadStatus({
                type: 'error',
                message: 'Error de conexión al eliminar el archivo'
            })
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

    const selectedProject = projects.find(p => p.PRJ_id?.toString() === selectedProjectId)

    return (
        <MainLayout>
            <div className="container mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Subir Documentos por Proyecto
                        </CardTitle>
                        <CardDescription>
                            Selecciona un proyecto y sube documentos asociados
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Selector de Proyecto */}
                        <div className="space-y-2">
                            <Label htmlFor="project-select">Seleccionar Proyecto</Label>
                            <Select
                                value={selectedProjectId}
                                onValueChange={setSelectedProjectId}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="project-select">
                                    <SelectValue placeholder="Selecciona un proyecto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem 
                                            key={project.PRJ_id} 
                                            value={project.PRJ_id?.toString() || ''}
                                        >
                                            {project.PRJ_case_number} - {project.PRJ_id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Información del Proyecto Seleccionado */}
                        {selectedProject && (
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">ID:</span> {selectedProject.PRJ_id}
                                        </div>
                                        <div>
                                            <span className="font-medium">Caso:</span> {selectedProject.PRJ_case_number}
                                        </div>
                                        <div>
                                            <span className="font-medium">Estado:</span> {selectedProject.PRJ_state}
                                        </div>
                                        <div>
                                            <span className="font-medium">Cliente ID:</span> {selectedProject.PRJ_client_id}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Selector de Archivo */}
                        <div className="space-y-2">
                            <Label htmlFor="file-input">Seleccionar Archivo</Label>
                            <Input
                                id="file-input"
                                type="file"
                                onChange={handleFileChange}
                                disabled={isLoading || !selectedProjectId}
                                accept="*/*"
                            />
                            {selectedFile && (
                                <div className="text-sm text-muted-foreground">
                                    Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                            )}
                        </div>

                        {/* Botón de Subida */}
                        <Button
                            onClick={handleUpload}
                            disabled={isLoading || !selectedFile || !selectedProjectId}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir Archivo
                                </>
                            )}
                        </Button>

                        {/* Estado de la Subida */}
                        {uploadStatus.type && (
                            <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}>
                                {uploadStatus.type === 'success' ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <AlertDescription>
                                    {uploadStatus.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Documentos Existentes del Proyecto */}
                        {selectedProjectId && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">
                                        Documentos del Proyecto ({projectFiles.length})
                                    </Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchProjectFiles(selectedProjectId)}
                                        disabled={isLoadingFiles}
                                    >
                                        {isLoadingFiles ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Actualizar'
                                        )}
                                    </Button>
                                </div>

                                <Card className="max-h-80 overflow-y-auto">
                                    <CardContent className="p-4">
                                        {isLoadingFiles ? (
                                            <div className="flex items-center justify-center p-8">
                                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                                Cargando documentos...
                                            </div>
                                        ) : projectFiles.length === 0 ? (
                                            <div className="text-center text-muted-foreground p-8">
                                                <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                                <p>No hay documentos en este proyecto</p>
                                                <p className="text-sm">Sube el primer documento usando el formulario arriba</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {projectFiles.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                            <File className="h-8 w-8 text-blue-500 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">
                                                                    {file.fileName}
                                                                </p>
                                                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                                    <span>{formatFileSize(file.fileSize)}</span>
                                                                    <span>Subido: {formatDate(file.uploadDate)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDownload(file.filePath, file.fileName)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(file.fileName)}
                                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Lista de Proyectos */}
                        <div className="space-y-2">
                            <Label>Proyectos Disponibles ({projects.length})</Label>
                            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                                {isLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Cargando proyectos...
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="text-center text-muted-foreground p-4">
                                        No hay proyectos disponibles
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {projects.map((project) => (
                                            <div
                                                key={project.PRJ_id}
                                                className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                                                    selectedProjectId === project.PRJ_id?.toString()
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'hover:bg-muted'
                                                }`}
                                                onClick={() => setSelectedProjectId(project.PRJ_id?.toString() || '')}
                                            >
                                                <div className="font-medium">
                                                    {project.PRJ_case_number} (ID: {project.PRJ_id})
                                                </div>
                                                <div className="text-xs opacity-70">
                                                    Estado: {project.PRJ_state} | Cliente: {project.PRJ_client_id}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}