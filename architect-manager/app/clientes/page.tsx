"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Eye, Phone, Mail, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { GPAClient } from '@/models/GPA_client';

export default function clientsPage() {
  const { isAdmin } = useAuth()
  const [clients, setClients] = useState<GPAClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const filteredClients = clients.filter(
    (client) =>
      client.CLI_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.CLI_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.CLI_identification.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true)
      const response = await fetch("/api/clients")
      const data = await response.json()
      const requestedClients: GPAClient[] = data.clients
      setClients(requestedClients)
      setLoading(false)
    }
    fetchClients()
  }, [])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#486b00] mr-4" />
          <span className="text-muted-foreground">Cargando información de clientes...</span>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-lighter/5 via-background to-primary-light/5">
        {/* Header Section */}
        <section className="py-12 lg:py-16">
          <div className="container">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-dark to-primary-medium bg-clip-text text-transparent">
                  Clientes
                </h1>
                <p className="text-xl text-muted-foreground">
                  Gestiona tu cartera de clientes de manera eficiente
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-3">
                  <Link href="/clientes/nuevo">
                    <Button size="lg" className="btn-primary">
                      <Plus className="mr-2 h-5 w-5" />
                      Nuevo Cliente
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card-modern p-6 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{filteredClients.filter(c => c.CLI_isperson).length}</div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Personas Cliente</div>
              </div>
              <div className="card-modern p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{filteredClients.reduce((acc, c) => acc + c.CLI_projects_amount, 0) }</div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Proyectos</div>
              </div>
              <div className="card-modern p-6 text-center bg-gradient-to-br from-primary-lighter/50 to-primary-light/30 border-primary-light/30">
                <div className="text-3xl font-bold text-primary-dark">{filteredClients.length}</div>
                <div className="text-sm text-primary-dark/80 font-medium">Total Clientes</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="pb-8">
          <div className="container">
            <div className="card-modern p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium text-muted-foreground mb-2 block">
                    Buscar clientes
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre, email o número de cédula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-modern pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={searchTerm ? "secondary" : "ghost"}
                    onClick={() => setSearchTerm("")}
                    disabled={!searchTerm}
                    className="btn-ghost"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clients Grid */}
        <section className="pb-16">
          <div className="container">
            {filteredClients.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-muted-foreground mb-2">No se encontraron clientes</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer cliente"}
                </p>
                {isAdmin && !searchTerm && (
                  <Link href="/clientes/nuevo">
                    <Button className="btn-primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Cliente
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid-responsive-auto">
                {filteredClients.map((client, index) => (
                  <div
                    key={client.CLI_id}
                    className="card-interactive group animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-lg">
                            {client.CLI_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-primary-dark">{client.CLI_name+" "+client.CLI_f_lastname+" "+client.CLI_s_lastname}</h3>
                            <p className="text-sm text-muted-foreground">{client.CLI_identification}</p>
                          </div>
                        </div>
                        <div className={`status-${client.CLI_civil_status}`}>
                          {/*client.CLI_civil_status === 'activo' ? 'Activo' : 'Inactivo'*/}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{client.CLI_email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{client.CLI_phone}</span>
                        </div>
                      </div>

                      {/* Projects */}
                      <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">Proyectos</span>
                        <Badge className="gradient-secondary text-primary-dark">
                          {client.CLI_projects_amount}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/clientes/${client.CLI_id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full btn-ghost">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link href={`/clientes/${client.CLI_id}/editar`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full btn-secondary">
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}