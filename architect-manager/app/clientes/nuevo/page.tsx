"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, User, Building, Mail, Phone, MapPin } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { CostaRicaLocationSelect } from "@/components/ui/costarica-location-select"
import { PhoneInput } from "@/components/ui/phone-input"
import type { GPAClient } from "@/models/GPA_client"
import { useToast } from "@/hooks/use-toast"

export default function NewClientPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [identificationType, setIdentificationType] = useState("")
  const [phone, setPhone] = useState("")
  const [civilStatus, setCivilStatus] = useState<"Single" | "Married" | "Divorced" | "Widowed">("Single")
  const [province, setProvince] = useState("")
  const [canton, setCanton] = useState("")
  const [district, setDistrict] = useState("")
  const { toast } = useToast()

  if (!isAdmin) {
    router.push("/clientes")
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const newClient: GPAClient = {
      CLI_name: formData.get("name") as string,
      CLI_f_lastname: formData.get("flastname") as string,
      CLI_s_lastname: formData.get("slastname") as string,
      CLI_email: formData.get("email") as string,
      CLI_identificationtype: identificationType as GPAClient["CLI_identificationtype"],
      CLI_identification: formData.get("identification") as string,
      CLI_phone: phone,
      CLI_civil_status: civilStatus,
      CLI_province: province,
      CLI_canton: canton,
      CLI_district: district,
      CLI_neighborhood: formData.get("neighborhood") as string,
      CLI_additional_directions: formData.get("additionalDirections") as string,
      CLI_observations: formData.get("observations") as string,
      CLI_isperson: identificationType as GPAClient["CLI_identificationtype"] !== "entity",
      CLI_projects_amount: 0
    }
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClient),
      })
      if (!response.ok) {
        // Obtener el mensaje de error de la respuesta
        const errorData = await response.json()
        const errorMessage = errorData.error || "Error creating client"
        throw new Error(errorMessage)
      }
      toast({
        title: "Cliente Registrado",
        description: "El cliente fue registrado correctamente",
        variant: "success"
      })
      const data = await response.json()
      const registeredClient:GPAClient = data.client;
      console.log("Registered user", registeredClient)
      router.push("/clientes")
    } catch (error) {
      console.error(error instanceof Error ? error.message : "There was a problem creating the client.")
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el cliente.",
        variant: "success"
      })
    }
    setLoading(false)
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="hover:bg-[#c9e077]/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2e4600] to-[#486b00] bg-clip-text text-transparent">
              Nuevo Cliente
            </h1>
            <p className="text-muted-foreground">Registra un nuevo cliente en el sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            <Card className="card-hover border-[#a2c523]/20">
              <CardHeader className="gradient-light text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Información Personal
                </CardTitle>
                <CardDescription className="text-white/80">Datos básicos del cliente</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-[#2e4600] font-medium">
                        Nombre *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        maxLength={50}
                        placeholder="Ej: María"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flastname" className="text-[#2e4600] font-medium">
                        Primer apellido *
                      </Label>
                      <Input
                        id="flastname"
                        name="flastname"
                        maxLength={50}
                        placeholder="Ej: González"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slastname" className="text-[#2e4600] font-medium">
                        Segundo apellido *
                      </Label>
                      <Input
                        id="slastname"
                        name="slastname"
                        maxLength={50}
                        placeholder="Ej: Lopez"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#2e4600] font-medium">
                        Correo electrónico *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                        <Input
                          id="email"
                          name="email"
                          maxLength={150}
                          type="email"
                          placeholder="Ej: maria@email.com"
                          className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="identificationType" className="text-[#2e4600] font-medium">
                        Tipo de identificación *
                      </Label>
                      <Select
                        required
                        onValueChange={setIdentificationType}>
                        <SelectTrigger id="identificationType" name="identificationType" className="border-[#a2c523]/30 focus:border-[#486b00] rounded px-3 py-2 w-full">
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="national">Cedula Nacional</SelectItem>
                          <SelectItem value="dimex">Dimex</SelectItem>
                          <SelectItem value="passport">Pasaporte</SelectItem>
                          <SelectItem value="refugee">Refugiado</SelectItem>
                          <SelectItem value="nite">Nite</SelectItem>
                          <SelectItem value="entity">Entidad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="identification" className="text-[#2e4600] font-medium">
                        Identificación *
                      </Label>
                      <Input
                        id="identification"
                        name="identification"
                        maxLength={50}
                        placeholder="Ej: 165484154"
                        className="border-[#a2c523]/30 focus:border-[#486b00]"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <PhoneInput
                        onChange={setPhone}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="civilStatus" className="text-[#2e4600] font-medium">
                        Estado civil
                      </Label>
                      <Select
                        required
                        onValueChange={(value) => setCivilStatus(value as "Single" | "Married" | "Divorced" | "Widowed")}>
                        <SelectTrigger id="civilStatus" name="civilStatus" className="border-[#a2c523]/30 focus:border-[#486b00] rounded px-3 py-2 w-full">
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Soltero</SelectItem>
                          <SelectItem value="Married">Casado</SelectItem>
                          <SelectItem value="Divorced">Divorciado</SelectItem>
                          <SelectItem value="Widowed">Viudo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#2e4600] font-medium">
                      Ubicación *
                    </Label>
                    <CostaRicaLocationSelect
                      province={province}
                      setProvince={setProvince}
                      canton={canton}
                      setCanton={setCanton}
                      district={district}
                      setDistrict={setDistrict} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood" className="text-[#2e4600] font-medium">
                        Barrio
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#486b00]" />
                        <Input
                          id="neighborhood"
                          name="neighborhood"
                          maxLength={200}
                          placeholder="Barrio Santa Catalina"
                          className="pl-10 border-[#a2c523]/30 focus:border-[#486b00]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">

                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additionalDirections" className="text-[#2e4600] font-medium">
                      Direcciones Adicionales
                    </Label>
                    <Textarea
                      id="additionalDirections"
                      name="additionalDirections"
                      placeholder="Direcciones adicionales..."
                      className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observations" className="text-[#2e4600] font-medium">
                      Observaciones
                    </Label>
                    <Textarea
                      id="observations"
                      name="observations"
                      placeholder="Observaciones..."
                      className="border-[#a2c523]/30 focus:border-[#486b00] min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="gradient-primary text-white hover:opacity-90">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Crear Cliente
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <Card className="border-[#7d4427]/20">
              <CardHeader className="gradient-accent text-white rounded-t-lg">
                <CardTitle>Consejos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    Asegúrate de verificar el correo electrónico
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    El teléfono debe incluir código de país
                  </p>
                  <p className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-[#a2c523] mt-2 mr-2 flex-shrink-0"></span>
                    Las notas te ayudarán en futuros proyectos
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#c9e077]/30">
              <CardHeader>
                <CardTitle className="text-[#2e4600]">Próximos Pasos</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>1. Crear el cliente</p>
                  <p>2. Asignar primer proyecto</p>
                  <p>3. Configurar método de pago</p>
                  <p>4. Programar reunión inicial</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
