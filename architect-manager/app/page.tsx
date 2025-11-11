"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users, Building, DollarSign, FileText } from "lucide-react"
import { GPADocument } from "@/models/GPA_document"

interface PromotionImage {
  DOC_id: number
  DOC_file_path: string
  DOC_name: string
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [promotionImages, setPromotionImages] = useState<PromotionImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromotionImages()
  }, [])

  async function fetchPromotionImages() {
    try {
      setLoading(true)
      const projectsRes = await fetch("/api/projects?include=all")
      const projectsData = await projectsRes.json()
      
      const allPromotionImages: PromotionImage[] = []
      
      for (const project of projectsData.projects || []) {
        const docsRes = await fetch(`/api/documents?project_id=${project.PRJ_id}`)
        const docs = await docsRes.json()
        
        const projectPromotionImages = docs
          .filter((doc: GPADocument) => doc.DOC_image_for_promotion === "Y")
          .map((doc: GPADocument) => ({
            DOC_id: doc.DOC_id,
            DOC_file_path: doc.DOC_file_path,
            DOC_name: doc.DOC_name
          }))
        
        allPromotionImages.push(...projectPromotionImages)
      }
      
      // Mezclar aleatoriamente y tomar entre 4 y 7 imágenes
      const shuffled = allPromotionImages.sort(() => Math.random() - 0.5)
      const selectedCount = Math.min(Math.max(4, Math.floor(Math.random() * 4) + 4), shuffled.length, 7)
      setPromotionImages(shuffled.slice(0, selectedCount))
    } catch (error) {
      console.error("Error fetching promotion images:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (promotionImages.length === 0) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotionImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [promotionImages])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotionImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotionImages.length) % promotionImages.length)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-lighter/10 via-background to-primary-light/5">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-10">
          <div className="absolute inset-0 bg-gradient-mesh opacity-10"></div>
          <div className="container relative z-10">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="animate-fade-in">
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-primary-dark to-primary-light bg-clip-text text-transparent leading-tight">
                  Gestor de Proyectos
                  <span className="block text-accent-color">Arquitectónicos</span>
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Project Showcase */}
        <section className="py-16 lg:py-10 bg-muted/30">
          <div className="container">
            <Card className="card-modern overflow-hidden animate-slide-up">
              <div className="relative">
                {loading ? (
                  <div className="aspect-[21/9] flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Cargando imágenes...</p>
                  </div>
                ) : promotionImages.length === 0 ? (
                  <div className="aspect-[21/9] flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">No hay imágenes de promoción disponibles</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-hidden rounded-t-2xl">
                      <div
                        className="flex transition-all duration-700 ease-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                      >
                        {promotionImages.map((image) => (
                          <div key={image.DOC_id} className="w-full flex-shrink-0 relative">
                            <div className="aspect-[21/9] relative overflow-hidden">
                              <img
                                src={image.DOC_file_path}
                                alt={image.DOC_name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg"
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 glass hover:bg-white/20 text-white border-white/20 h-12 w-12"
                      onClick={prevSlide}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 glass hover:bg-white/20 text-white border-white/20 h-12 w-12"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>

                    {/* Enhanced Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                      <div className="flex space-x-3">
                        {promotionImages.map((_, index) => (
                          <button
                            key={index}
                            className={`transition-all duration-300 rounded-full ${index === currentSlide
                                ? "w-12 h-3 bg-white"
                                : "w-3 h-3 bg-white/50 hover:bg-white/70"
                              }`}
                            onClick={() => setCurrentSlide(index)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </section>
        {/* Quick Actions */}
        <section className="py-16 lg:py-20">
          <div className="container">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary-dark mb-4">Acciones Rápidas</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Accede rápidamente a las funciones más utilizadas
              </p>
            </div>

            <div className="grid-responsive-2">
              <Link href="/clientes/nuevo" className="group">
                <div className="card-interactive h-full p-8 text-center space-y-6 animate-slide-up bg-gradient-to-br from-primary-lighter/20 to-primary-light/10">
                  <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-medium mb-2">Nuevo Cliente</h3>
                    <p className="text-muted-foreground text-lg">Registra un nuevo cliente en el sistema de manera rápida y sencilla</p>
                  </div>
                  <div className="pt-4">
                    <span className="inline-flex items-center text-primary-medium font-medium group-hover:gap-2 transition-all duration-300">
                      Comenzar
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/proyectos/nuevo" className="group">
                <div className="card-interactive h-full p-8 text-center space-y-6 animate-slide-up bg-gradient-to-br from-accent-color/10 to-primary-medium/10" style={{ animationDelay: "0.1s" }}>
                  <div className="mx-auto w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-accent-color mb-2">Nuevo Proyecto</h3>
                    <p className="text-muted-foreground text-lg">Crea un nuevo proyecto arquitectónico con todos los detalles</p>
                  </div>
                  <div className="pt-4">
                    <span className="inline-flex items-center text-accent-color font-medium group-hover:gap-2 transition-all duration-300">
                      Crear Proyecto
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/reportes" className="group">
                <div className="card-interactive h-full p-8 text-center space-y-6 animate-slide-up bg-gradient-to-br from-primary-medium/10 to-primary-dark/10" style={{ animationDelay: "0.2s" }}>
                  <div className="mx-auto w-16 h-16 rounded-2xl gradient-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-primary-dark" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-dark mb-2">Ver Reportes</h3>
                    <p className="text-muted-foreground text-lg">Consulta estadísticas detalladas y reportes de rendimiento</p>
                  </div>
                  <div className="pt-4">
                    <span className="inline-flex items-center text-primary-dark font-medium group-hover:gap-2 transition-all duration-300">
                      Ver Reportes
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </Link>

              <Link href="/pagos" className="group">
                <div className="card-interactive h-full p-8 text-center space-y-6 animate-slide-up bg-gradient-to-br from-green-100/50 to-green-200/30 dark:from-green-900/20 dark:to-green-800/10" style={{ animationDelay: "0.3s" }}>
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Gestionar Pagos</h3>
                    <p className="text-muted-foreground text-lg">Administra los pagos de tus proyectos y clientes</p>
                  </div>
                  <div className="pt-4">
                    <span className="inline-flex items-center text-green-700 dark:text-green-400 font-medium group-hover:gap-2 transition-all duration-300">
                      Ir a Pagos
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>          </div>
        </section>
      </div>
    </MainLayout>
  )
}
