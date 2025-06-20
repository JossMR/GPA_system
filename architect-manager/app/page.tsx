"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users, Building, DollarSign, FileText } from "lucide-react"

const projectImages = [
  {
    id: 1,
    title: "Villa Moderna",
    image: "/placeholder.svg?height=400&width=600",
    description: "Diseño contemporáneo con líneas limpias",
  },
  {
    id: 2,
    title: "Casa Familiar",
    image: "/placeholder.svg?height=400&width=600",
    description: "Espacios amplios para la familia",
  },
  {
    id: 3,
    title: "Oficina Corporativa",
    image: "/placeholder.svg?height=400&width=600",
    description: "Ambiente profesional y funcional",
  },
  {
    id: 4,
    title: "Residencia Ecológica",
    image: "/placeholder.svg?height=400&width=600",
    description: "Construcción sustentable",
  },
]

const stats = [
  { title: "Clientes Activos", value: "24", icon: Users, color: "text-primary-medium" },
  { title: "Proyectos en Curso", value: "12", icon: Building, color: "text-primary-light" },
  { title: "Ingresos del Mes", value: "$45,000", icon: DollarSign, color: "text-accent" },
  { title: "Documentos Pendientes", value: "8", icon: FileText, color: "text-orange-500" },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projectImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projectImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projectImages.length) % projectImages.length)
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary-dark">Bienvenido al Gestor de Proyectos Arquitectónicos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Administra tus clientes, proyectos y pagos de manera eficiente
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={stat.title} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project Carousel */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Proyectos Destacados</CardTitle>
            <CardDescription>Explora algunos de nuestros proyectos más recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="overflow-hidden rounded-lg">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {projectImages.map((project) => (
                    <div key={project.id} className="w-full flex-shrink-0">
                      <div className="relative">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-xl font-bold">{project.title}</h3>
                          <p className="text-sm opacity-90">{project.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Indicators */}
              <div className="flex justify-center space-x-2 mt-4">
                {projectImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? "bg-primary-medium" : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer animate-slide-up">
            <CardHeader>
              <CardTitle className="text-primary-medium">Nuevo Cliente</CardTitle>
              <CardDescription>Registra un nuevo cliente en el sistema</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="text-primary-light">Nuevo Proyecto</CardTitle>
              <CardDescription>Crea un nuevo proyecto arquitectónico</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader>
              <CardTitle className="text-accent">Ver Reportes</CardTitle>
              <CardDescription>Consulta estadísticas y reportes</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
