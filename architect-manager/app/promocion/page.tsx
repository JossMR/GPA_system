"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"

const mockImages = [
  {
    id: 1,
    title: "Villa Moderna - Exterior",
    category: "residencial",
    image: "/placeholder.svg?height=300&width=400",
    description: "Vista exterior de villa contemporánea con líneas limpias",
  },
  {
    id: 2,
    title: "Oficina Corporativa - Lobby",
    category: "comercial",
    image: "/placeholder.svg?height=300&width=400",
    description: "Lobby principal con diseño minimalista",
  },
  {
    id: 3,
    title: "Casa Familiar - Cocina",
    category: "residencial",
    image: "/placeholder.svg?height=300&width=400",
    description: "Cocina moderna con isla central",
  },
  {
    id: 4,
    title: "Restaurante - Comedor",
    category: "comercial",
    image: "/placeholder.svg?height=300&width=400",
    description: "Área de comedor con iluminación cálida",
  },
  {
    id: 5,
    title: "Residencia Ecológica",
    category: "sustentable",
    image: "/placeholder.svg?height=300&width=400",
    description: "Construcción con materiales ecológicos",
  },
  {
    id: 6,
    title: "Loft Industrial",
    category: "residencial",
    image: "/placeholder.svg?height=300&width=400",
    description: "Espacio abierto con elementos industriales",
  },
  {
    id: 7,
    title: "Centro Comercial",
    category: "comercial",
    image: "/placeholder.svg?height=300&width=400",
    description: "Atrio principal con luz natural",
  },
  {
    id: 8,
    title: "Casa Pasiva",
    category: "sustentable",
    image: "/placeholder.svg?height=300&width=400",
    description: "Vivienda de bajo consumo energético",
  },
]

const categories = [
  { value: "todos", label: "Todos", count: mockImages.length },
  {
    value: "residencial",
    label: "Residencial",
    count: mockImages.filter((img) => img.category === "residencial").length,
  },
  { value: "comercial", label: "Comercial", count: mockImages.filter((img) => img.category === "comercial").length },
  {
    value: "sustentable",
    label: "Sustentable",
    count: mockImages.filter((img) => img.category === "sustentable").length,
  },
]

const categoryColors = {
  residencial: "bg-primary-light",
  comercial: "bg-primary-medium",
  sustentable: "bg-accent",
}

export default function PromocionPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["todos"])
  const [selectedImage, setSelectedImage] = useState<any>(null)

  const filteredImages =
    selectedCategories.includes("todos") || selectedCategories.length === 0
      ? mockImages
      : mockImages.filter((img) => selectedCategories.includes(img.category))

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary-dark">Galería de Proyectos</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra colección de proyectos arquitectónicos organizados por categorías
          </p>
        </div>

        {/* Filtros por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
            <CardDescription>Filtra los proyectos por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={category.value}
                    checked={selectedCategories.includes(category.value)}
                    onChange={(e) => {
                      if (category.value === "todos") {
                        setSelectedCategories(e.target.checked ? ["todos"] : [])
                      } else {
                        setSelectedCategories((prev) => {
                          const newCategories = prev.filter((cat) => cat !== "todos")
                          if (e.target.checked) {
                            return [...newCategories, category.value]
                          } else {
                            return newCategories.filter((cat) => cat !== category.value)
                          }
                        })
                      }
                    }}
                    className="rounded border-[#a2c523]/30 text-[#486b00] focus:ring-[#486b00]"
                  />
                  <label htmlFor={category.value} className="text-sm font-medium cursor-pointer">
                    {category.label}
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Galería de Imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <Card
              key={image.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={image.image || "/placeholder.svg"}
                  alt={image.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Badge
                  className={`absolute top-2 right-2 ${categoryColors[image.category as keyof typeof categoryColors]} text-white`}
                >
                  {image.category}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-medium transition-colors">
                  {image.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{image.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal para Imagen Ampliada */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl w-full p-0">
            {selectedImage && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={selectedImage.image || "/placeholder.svg"}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="p-6 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
                    <Badge
                      className={`${categoryColors[selectedImage.category as keyof typeof categoryColors]} text-white`}
                    >
                      {selectedImage.category}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedImage.description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de la Galería</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-medium">{mockImages.length}</div>
                <div className="text-sm text-muted-foreground">Total de Imágenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-light">
                  {mockImages.filter((img) => img.category === "residencial").length}
                </div>
                <div className="text-sm text-muted-foreground">Proyectos Residenciales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-medium">
                  {mockImages.filter((img) => img.category === "comercial").length}
                </div>
                <div className="text-sm text-muted-foreground">Proyectos Comerciales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {mockImages.filter((img) => img.category === "sustentable").length}
                </div>
                <div className="text-sm text-muted-foreground">Proyectos Sustentables</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
