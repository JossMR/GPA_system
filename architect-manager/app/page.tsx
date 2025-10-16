"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users, Building, DollarSign, FileText } from "lucide-react"
import { GPAProject } from "@/models/GPA_project"
import { GPAClient } from "@/models/GPA_client"
import { GPAPayment } from "@/models/GPA_payment"

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

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [projects, setProjects] = useState<GPAProject[]>([])
  const [clients, setClients] = useState<GPAClient[]>([])
  const [payments, setPayments] = useState<GPAPayment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [projectsRes, clientsRes, paymentsRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/clientes"),
          fetch("/api/payments"),
        ])
        
        const projectsData = await projectsRes.json()
        const clientsData = await clientsRes.json()
        const paymentsData = await paymentsRes.json()
        
        console.log("Payments data:", paymentsData)
        console.log("Payments array:", paymentsData.payments)
        
        setProjects(projectsData.projects || [])
        setClients(clientsData.clients || [])
        setPayments(paymentsData.payments || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projectImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Calculate real stats
  const totalClients = clients.length
  const activeProjects = projects.filter((p) => 
    p.PRJ_state !== "Completed" && 
    p.PRJ_state !== "Logbook Closed" && 
    p.PRJ_state !== "Rejected" && 
    p.PRJ_state !== "Professional Withdrawal"
  ).length
  
  const totalRevenue = payments.reduce((sum, p) => {
    const amount = Number(p.PAY_amount_paid)
    console.log("Payment amount:", amount, "from:", p.PAY_amount_paid)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)
  
  console.log("Total revenue calculated:", totalRevenue)
  console.log("Payments count:", payments.length)

  const stats = [
    { 
      title: "Total Clientes", 
      value: loading ? "..." : totalClients.toString(), 
      icon: Users, 
      color: "text-primary-medium",
      percentage: 100
    },
    { 
      title: "Proyectos Activos", 
      value: loading ? "..." : activeProjects.toString(), 
      icon: Building, 
      color: "text-primary-light",
      percentage: projects.length > 0 ? Math.round((activeProjects / projects.length) * 100) : 0
    },
    { 
      title: "Ingresos Totales", 
      value: loading ? "..." : `₡${totalRevenue.toLocaleString("es-CR", { maximumFractionDigits: 0 })}`, 
      icon: DollarSign, 
      color: "text-green-600",
      percentage: 85
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projectImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projectImages.length) % projectImages.length)
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
                <div className="overflow-hidden rounded-t-2xl">
                  <div
                    className="flex transition-all duration-700 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {projectImages.map((project) => (
                      <div key={project.id} className="w-full flex-shrink-0 relative">
                        <div className="aspect-[21/9] relative overflow-hidden">
                          <img
                            src={project.image || "/placeholder.svg"}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-8 left-8 text-white max-w-md">
                            <h3 className="text-3xl font-bold mb-2 animate-slide-in-left">{project.title}</h3>
                            <p className="text-lg opacity-90 animate-slide-in-left" style={{ animationDelay: "0.1s" }}>
                              {project.description}
                            </p>
                          </div>
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
                    {projectImages.map((_, index) => (
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
              </div>
            </Card>
          </div>
        </section>
        {/* Stats Section */}
        <section className="py-16 lg:py-16">
          <div className="container">
            <div className="grid-responsive-auto">
              {stats.map((stat, index) => (
                <div
                  key={stat.title}
                  className="card-interactive bg-white/80 dark:bg-card/80 backdrop-blur-sm animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-light/20 to-primary-medium/20">
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary-dark">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.title}</div>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-full transition-all duration-1000"
                        style={{ width: `${stat.percentage}%`, animationDelay: `${index * 0.2}s` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
