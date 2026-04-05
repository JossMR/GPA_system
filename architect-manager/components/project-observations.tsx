"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { GPAObservation } from "@/models/GPA_observation"

type ObservationOrderDir = "ASC" | "DESC"

interface ProjectObservationsProps {
    projectId: string
}

export function ProjectObservations({ projectId }: ProjectObservationsProps) {
    const [observations, setObservations] = useState<GPAObservation[]>([])
    const [observationsPage, setObservationsPage] = useState(1)
    const [observationsTotalPages, setObservationsTotalPages] = useState(0)
    const [observationsTotal, setObservationsTotal] = useState(0)
    const [observationsOrderDir, setObservationsOrderDir] = useState<ObservationOrderDir>("DESC")
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

    return (
        <Card className="border-[#486b00]/20">
            <CardHeader>
                <div>
                    <CardTitle className="text-[#486b00]">Observaciones</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[520px] overflow-hidden flex flex-col">
                <div className="rounded-md border border-dashed border-[#a2c523]/50 p-3 bg-[#c9e077]/10">
                    <p className="text-sm text-[#2e4600] font-medium">Espacio de captura (placeholder)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Aqui se mostrara el formulario real para agregar observaciones del proyecto.
                    </p>
                </div>

                <div className="max-w-[320px]">
                    <Label htmlFor="observations-order">Orden por fecha</Label>
                    <div className="flex gap-2">
                        <select
                            id="observations-order"
                            value={observationsOrderDir}
                            onChange={(e) => setObservationsOrderDir(e.target.value as ObservationOrderDir)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
                        >
                            <option value="DESC">Más recientes</option>
                            <option value="ASC">Más antiguas</option>
                        </select>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => fetchObservations(1)}
                        >
                            Filtrar
                        </Button>
                    </div>
                </div>

                <div className="space-y-2 mt-2 border-t border-[#a2c523]/30 pt-4 flex-1 overflow-y-auto pr-1">
                    {observations.length === 0 ? (
                        <div className="rounded-md border border-dashed border-[#a2c523]/40 p-3 text-sm text-muted-foreground">
                            No hay observaciones registradas para este proyecto.
                        </div>
                    ) : (
                        observations.map((obs) => (
                            <div key={obs.OST_id} className="bg-[#c9e077]/10 p-3 rounded-md border border-[#a2c523]/20">
                                <p className="text-sm text-foreground mt-2">{obs.OST_content}</p>
                                <p className="text-xs text-muted-foreground mt-2">
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
