"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { X, MapPin, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import { GPAProject } from "@/models/GPA_project"
import { GPADocument } from "@/models/GPA_document"
import { GPAtype } from "@/models/GPA_type"
import { GPAcategory } from "@/models/GPA_category"
import { formatCurrency } from "@/lib/formatters"

interface ProjectWithImages extends GPAProject {
  promotionImages: GPADocument[]
}

const projectStates = [
  "Document Collection",
  "Technical Inspection",
  "Document Review",
  "Plans and Budget",
  "Entity Review",
  "APC and Permits",
  "Disbursement",
  "Under Construction",
  "Completed",
  "Logbook Closed",
  "Rejected",
  "Professional Withdrawal",
  "Conditioned"
]

const stateColors: Record<string, string> = {
  "Document Collection": "bg-gray-500",
  "Technical Inspection": "bg-yellow-500",
  "Document Review": "bg-orange-500",
  "Plans and Budget": "bg-purple-500",
  "Entity Review": "bg-pink-500",
  "APC and Permits": "bg-indigo-500",
  "Disbursement": "bg-teal-500",
  "Under Construction": "bg-blue-500",
  "Completed": "bg-green-500",
  "Logbook Closed": "bg-emerald-500",
  "Rejected": "bg-red-500",
  "Professional Withdrawal": "bg-slate-500",
  "Conditioned": "bg-amber-500"
}

const stateTranslations: Record<string, string> = {
  "Document Collection": "Recepción de Documentos",
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

export default function PromocionPage() {
  const [projects, setProjects] = useState<ProjectWithImages[]>([])
  const [allTypes, setAllTypes] = useState<GPAtype[]>([])
  const [allCategories, setAllCategories] = useState<GPAcategory[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<number[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedImage, setSelectedImage] = useState<{ document: GPADocument; project: ProjectWithImages; imageIndex: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return
      
      if (e.key === "ArrowLeft") {
        handlePreviousImage()
      } else if (e.key === "ArrowRight") {
        handleNextImage()
      } else if (e.key === "Escape") {
        setSelectedImage(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage])

  async function fetchData() {
    try {
      setLoading(true)
      
      const projectsRes = await fetch("/api/projects?include=all")
      const projectsData = await projectsRes.json()
      
      const [typesRes, categoriesRes] = await Promise.all([
        fetch("/api/types"),
        fetch("/api/categories")
      ])
      
      const typesData = await typesRes.json()
      const categoriesData = await categoriesRes.json()
      
      setAllTypes(typesData || [])
      setAllCategories(categoriesData || [])
      
      const projectsWithPromotion: ProjectWithImages[] = []
      
      for (const project of projectsData.projects || []) {
        const docsRes = await fetch(`/api/documents?project_id=${project.PRJ_id}`)
        const docs = await docsRes.json()
        
        const promotionImages = docs.filter((doc: GPADocument) => doc.DOC_image_for_promotion === "Y")
        
        if (promotionImages.length > 0) {
          projectsWithPromotion.push({
            ...project,
            promotionImages
          })
        }
      }
      
      setProjects(projectsWithPromotion)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const stateMatch = selectedStates.length === 0 || selectedStates.includes(project.PRJ_state)
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(project.PRJ_type_id)
    const categoryMatch = selectedCategories.length === 0 || 
      project.categories?.some(cat => cat.CAT_id && selectedCategories.includes(cat.CAT_id))
    
    return stateMatch && typeMatch && categoryMatch
  })

  const totalImages = filteredProjects.reduce((sum, p) => sum + p.promotionImages.length, 0)

  // Crear un array plano de todas las imágenes con su proyecto asociado
  const allImages = filteredProjects.flatMap(project =>
    project.promotionImages.map(doc => ({ document: doc, project }))
  )

  const handleNextImage = () => {
    if (!selectedImage) return
    const currentIndex = allImages.findIndex(
      img => img.document.DOC_id === selectedImage.document.DOC_id
    )
    const nextIndex = (currentIndex + 1) % allImages.length
    setSelectedImage({
      ...allImages[nextIndex],
      imageIndex: nextIndex
    })
  }

  const handlePreviousImage = () => {
    if (!selectedImage) return
    const currentIndex = allImages.findIndex(
      img => img.document.DOC_id === selectedImage.document.DOC_id
    )
    const prevIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1
    setSelectedImage({
      ...allImages[prevIndex],
      imageIndex: prevIndex
    })
  }

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return
      
      if (e.key === "ArrowLeft") {
        handlePreviousImage()
      } else if (e.key === "ArrowRight") {
        handleNextImage()
      } else if (e.key === "Escape") {
        setSelectedImage(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage, allImages])

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary-dark">Galería de Proyectos</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra colección de proyectos arquitectónicos con imágenes promocionales
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtra los proyectos por estado, tipo y categoría</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Por Estado del Proyecto</h3>
              <div className="flex flex-wrap gap-2">
                {projectStates.map((state) => {
                  const count = projects.filter(p => p.PRJ_state === state).length
                  if (count === 0) return null
                  
                  return (
                    <Badge
                      key={state}
                      variant={selectedStates.includes(state) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        selectedStates.includes(state) ? stateColors[state] + " text-white" : ""
                      }`}
                      onClick={() => {
                        setSelectedStates(prev =>
                          prev.includes(state)
                            ? prev.filter(s => s !== state)
                            : [...prev, state]
                        )
                      }}
                    >
                      {stateTranslations[state]} ({count})
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Por Tipo de Proyecto</h3>
              <div className="flex flex-wrap gap-2">
                {allTypes.map((type) => {
                  const count = projects.filter(p => p.PRJ_type_id === type.TYP_id).length
                  if (count === 0) return null
                  
                  return (
                    <Badge
                      key={type.TYP_id}
                      variant={selectedTypes.includes(type.TYP_id!) ? "default" : "outline"}
                      className="cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedTypes(prev =>
                          prev.includes(type.TYP_id!)
                            ? prev.filter(t => t !== type.TYP_id)
                            : [...prev, type.TYP_id!]
                        )
                      }}
                    >
                      {type.TYP_name} ({count})
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Por Categoría</h3>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => {
                  const count = projects.filter(p => 
                    p.categories?.some(c => c.CAT_id === category.CAT_id)
                  ).length
                  if (count === 0) return null
                  
                  return (
                    <Badge
                      key={category.CAT_id}
                      variant={selectedCategories.includes(category.CAT_id!) ? "default" : "outline"}
                      className="cursor-pointer transition-all"
                      onClick={() => {
                        setSelectedCategories(prev =>
                          prev.includes(category.CAT_id!)
                            ? prev.filter(c => c !== category.CAT_id)
                            : [...prev, category.CAT_id!]
                        )
                      }}
                    >
                      {category.CAT_name} ({count})
                    </Badge>
                  )
                })}
              </div>
            </div>

            {(selectedStates.length > 0 || selectedTypes.length > 0 || selectedCategories.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStates([])
                  setSelectedTypes([])
                  setSelectedCategories([])
                }}
              >
                Limpiar Filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando proyectos...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay proyectos con imágenes promocionales.</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const imageCount = project.promotionImages.length
            let gridCols = "grid-cols-1"
            if (imageCount === 2) gridCols = "sm:grid-cols-2"
            else if (imageCount === 3) gridCols = "sm:grid-cols-2 lg:grid-cols-3"
            else if (imageCount >= 4) gridCols = "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            
            return (
              <Card key={project.PRJ_id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">Proyecto #{project.PRJ_case_number}</CardTitle>
                      <Badge className={`${stateColors[project.PRJ_state]} text-white`}>
                        {stateTranslations[project.PRJ_state]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div><span className="font-medium">Cliente:</span> {project.client_name}</div>
                      {(project.type?.TYP_name || allTypes.find(t => t.TYP_id === project.PRJ_type_id)?.TYP_name) && (
                        <div>
                          <span className="font-medium">Tipo:</span>{" "}
                          {project.type?.TYP_name || allTypes.find(t => t.TYP_id === project.PRJ_type_id)?.TYP_name}
                        </div>
                      )}
                    {project.PRJ_area_m2 && (
                      <div><span className="font-medium">Área:</span> {Number(project.PRJ_area_m2).toLocaleString("es-CR")} m</div>
                    )}
                    {project.PRJ_budget && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">Presupuesto:</span> {formatCurrency(Number(project.PRJ_budget))}
                      </div>
                    )}
                  </div>
                  {project.categories && project.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.categories.map((cat) => (
                        <Badge key={cat.CAT_id} variant="secondary" className="text-xs">
                          {cat.CAT_name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className={`grid ${gridCols} gap-4`}>
                    {project.promotionImages.map((doc) => {
                      // Encontrar el índice global de esta imagen
                      const globalIndex = allImages.findIndex(
                        img => img.document.DOC_id === doc.DOC_id
                      )
                      return (
                        <Card
                          key={doc.DOC_id}
                          className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden max-w-md mx-auto w-full"
                          onClick={() => setSelectedImage({ document: doc, project, imageIndex: globalIndex })}
                        >
                          <div className="relative overflow-hidden aspect-video">
                          <img
                            src={doc.DOC_file_path}
                            alt={doc.DOC_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium line-clamp-2">{doc.DOC_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(doc.DOC_upload_date).toLocaleDateString("es-CR")}
                          </p>
                        </div>
                      </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-6xl w-full p-0">
            {selectedImage && (
              <div>
                <DialogTitle className="sr-only">
                  {selectedImage.document.DOC_name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Imagen promocional del proyecto #{selectedImage.project.PRJ_case_number}
                </DialogDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {/* Navegación - Botón Anterior */}
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    
                    {/* Navegación - Botón Siguiente */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
                
                <img
                  src={selectedImage.document.DOC_file_path}
                  alt={selectedImage.document.DOC_name}
                  className="w-full h-auto max-h-[70vh] object-contain bg-black"
                />
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedImage.document.DOC_name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedImage.document.DOC_upload_date).toLocaleDateString("es-CR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${stateColors[selectedImage.project.PRJ_state]} text-white`}>
                          {stateTranslations[selectedImage.project.PRJ_state]}
                        </Badge>
                        {allImages.length > 1 && (
                          <div className="text-xs text-muted-foreground">
                            Imagen {selectedImage.imageIndex + 1} de {allImages.length}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-semibold">Proyecto:</span> #{selectedImage.project.PRJ_case_number}</div>
                        <div><span className="font-semibold">Cliente:</span> {selectedImage.project.client_name}</div>
                        {(selectedImage.project.type?.TYP_name || allTypes.find(t => t.TYP_id === selectedImage.project.PRJ_type_id)?.TYP_name) && (
                          <div>
                            <span className="font-semibold">Tipo:</span>{" "}
                            {selectedImage.project.type?.TYP_name || allTypes.find(t => t.TYP_id === selectedImage.project.PRJ_type_id)?.TYP_name}
                          </div>
                        )}
                        {selectedImage.project.PRJ_area_m2 && (
                          <div><span className="font-semibold">Área:</span> {Number(selectedImage.project.PRJ_area_m2).toLocaleString("es-CR")} m</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de la Galería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-medium">{filteredProjects.length}</div>
                <div className="text-sm text-muted-foreground">Proyectos Mostrados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-light">{totalImages}</div>
                <div className="text-sm text-muted-foreground">Total de Imágenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Proyectos con Promoción</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {projects.reduce((sum, p) => sum + p.promotionImages.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Imágenes Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
