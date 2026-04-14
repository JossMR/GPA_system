"use client"

import { useEffect, useId, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GPAObservation } from "@/models/GPA_observation"
import { useToast } from "@/hooks/use-toast"

type ObservationOrderDir = "ASC" | "DESC"

interface ProjectObservationsProps {
    projectId: string
}

export function ProjectObservations({ projectId }: ProjectObservationsProps) {
    const { toast } = useToast()
    const orderSelectId = useId()
    const contentInputId = useId()
    const observationContentLimit = 500

    const [observations, setObservations] = useState<GPAObservation[]>([])
    const [observationsPage, setObservationsPage] = useState(1)
    const [observationsTotalPages, setObservationsTotalPages] = useState(0)
    const [observationsTotal, setObservationsTotal] = useState(0)
    const [observationsOrderDir, setObservationsOrderDir] = useState<ObservationOrderDir>("DESC")
    const [newObservationContent, setNewObservationContent] = useState("")
    const [observationContentError, setObservationContentError] = useState<string | null>(null)
    const [savingObservation, setSavingObservation] = useState(false)
    const observationsPerPage = 5

    const fetchObservations = async (targetPage = 1, targetOrderDir: ObservationOrderDir = observationsOrderDir) => {
        const params = new URLSearchParams({
            project_id: projectId,
            page: String(targetPage),
            limit: String(observationsPerPage),
            orderDir: targetOrderDir,
        })

        const observationsRes = await fetch(`/api/observations?${params.toString()}`)
        if (!observationsRes.ok) {
            return
        }

        const observationsData = await observationsRes.json()
        setObservations(observationsData.observations || [])
        setObservationsPage(observationsData.page || targetPage)
        setObservationsTotalPages(observationsData.totalPages || 0)
        setObservationsTotal(observationsData.totalObservations || 0)
    }

    useEffect(() => {
        setObservationsOrderDir("DESC")
        fetchObservations(1, "DESC")
    }, [projectId])

    const handleCreateObservation = async () => {
        const content = newObservationContent.trim()
        if (!content) {
            setObservationContentError(null)
            toast({
                title: "Error",
                description: "Debe escribir una observación.",
                variant: "destructive",
            })
            return
        }

        if (newObservationContent.length > observationContentLimit) {
            const message = `La observación no puede superar los ${observationContentLimit} caracteres.`
            setObservationContentError(message)
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            })
            return
        }

        const numericProjectId = Number(projectId)
        if (Number.isNaN(numericProjectId)) {
            toast({
                title: "Error",
                description: "No se pudo identificar el proyecto.",
                variant: "destructive",
            })
            return
        }

        setSavingObservation(true)
        try {
            const response = await fetch("/api/observations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    OST_project_id: numericProjectId,
                    OST_content: content,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                const errorMessage = errorData?.error || "No se pudo guardar la observación."
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })
                return
            }

            setNewObservationContent("")
            setObservationContentError(null)
            setObservationsOrderDir("DESC")
            await fetchObservations(1, "DESC")

            toast({
                title: "Observación creada",
                description: "La observación se guardó correctamente.",
                variant: "success",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "No se pudo guardar la observación.",
                variant: "destructive",
            })
        } finally {
            setSavingObservation(false)
        }
    }

    const observationCharacterCount = newObservationContent.length
    const observationIsOverLimit = observationCharacterCount > observationContentLimit

    return (
        <Card className="border-[#486b00]/20">
            <CardHeader className="gradient-primary text-white rounded-t-lg">
                <div>
                    <CardTitle>Observaciones</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[900px] overflow-hidden flex flex-col">
                <div className="rounded-md border border-dashed border-[#a2c523]/50 p-4 bg-[#c9e077]/10">
                    <Label htmlFor={contentInputId} className="text-base text-[#2e4600] font-medium">
                        Agregar nueva observación
                    </Label>
                    <Textarea
                        id={contentInputId}
                        value={newObservationContent}
                        onChange={(e) => {
                            const value = e.target.value
                            setNewObservationContent(value)
                            setObservationContentError(
                                value.length > observationContentLimit
                                    ? `La observación no puede superar los ${observationContentLimit} caracteres.`
                                    : null
                            )
                        }}
                        placeholder="Escribe una observación del proyecto..."
                        className={`mt-3 min-h-[140px] border-[#a2c523]/40 focus:border-[#486b00] text-base ${observationIsOverLimit ? "border-red-500 focus:border-red-500" : ""}`}
                            aria-invalid={observationIsOverLimit}
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                        <p className={`text-xs ${observationIsOverLimit ? "text-red-600" : "text-muted-foreground"}`}>
                            {observationCharacterCount}/{observationContentLimit} caracteres
                        </p>
                        <Button
                            type="button"
                            onClick={handleCreateObservation}
                            disabled={savingObservation || observationIsOverLimit}
                            className="gradient-primary text-white hover:opacity-90"
                        >
                            {savingObservation ? "Guardando..." : "Agregar"}
                        </Button>
                    </div>
                    {observationContentError && (
                        <p className="mt-2 text-sm text-red-600">
                            {observationContentError}
                        </p>
                    )}
                </div>

                <div className="max-w-full">
                    <Label htmlFor={orderSelectId} className="text-base">Orden por fecha</Label>
                    <div className="flex gap-2">
                        <select
                            id={orderSelectId}
                            value={observationsOrderDir}
                            onChange={(e) => setObservationsOrderDir(e.target.value as ObservationOrderDir)}
                            className="w-full px-4 py-2 border border-input rounded-md text-base bg-background"
                        >
                            <option value="DESC">Más recientes</option>
                            <option value="ASC">Más antiguas</option>
                        </select>
                        <Button
                            type="button"
                            variant="secondary"
                            className="btn-secondary" 
                            onClick={() => fetchObservations(1)}
                        >
                            Filtrar
                        </Button>
                    </div>
                </div>

                <div className="space-y-3 mt-4 border-t border-[#a2c523]/30 pt-4 flex-1 overflow-y-auto pr-2">
                    {observations.length === 0 ? (
                        <div className="rounded-md border border-dashed border-[#a2c523]/40 p-4 text-base text-muted-foreground">
                            No hay observaciones registradas para este proyecto.
                        </div>
                    ) : (
                        observations.map((obs) => (
                            <div key={obs.OST_id} className="bg-[#c9e077]/10 p-4 rounded-md border border-[#a2c523]/20">
                                <p className="mt-2 w-full max-w-full min-w-0 text-base text-foreground whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                    {obs.OST_content}
                                </p>
                                <p className="text-sm text-muted-foreground mt-3">
                                    {new Date(obs.OST_date).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {observationsTotalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => fetchObservations(Math.max(1, observationsPage - 1))}
                            disabled={observationsPage === 1}
                        >
                            Anterior
                        </Button>

                        {Array.from({ length: observationsTotalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <Button
                                key={pageNumber}
                                variant={pageNumber === observationsPage ? "secondary" : "outline"}
                                size="sm"
                                type="button"
                                onClick={() => fetchObservations(pageNumber)}
                            >
                                {pageNumber}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => fetchObservations(Math.min(observationsTotalPages, observationsPage + 1))}
                            disabled={observationsPage === observationsTotalPages}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}

                <div className="text-center text-xs text-muted-foreground">
                    Mostrando {observations.length} de {observationsTotal} observaciones
                </div>
            </CardContent>
        </Card>
    )
}
