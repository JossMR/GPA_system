import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GPAClient } from '@/models/GPA_client'

interface ClientSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (client: GPAClient) => void
  selectedId?: number | null
}

export function ClientSelector({ open, onOpenChange, onSelect, selectedId }: ClientSelectorProps) {
  const [clients, setClients] = useState<GPAClient[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [clientFilter, setClientFilter] = useState("")
  const [appliedFilter, setAppliedFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalClients, setTotalClients] = useState(0)
  const clientsPerPage = 10

  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(clientsPerPage),
          search: appliedFilter,
          orderBy: "CLI_name",
          orderDir: "ASC",
        })
        const response = await fetch(`/api/clients?${params.toString()}`)
        const data = await response.json()
        const requestedClients: GPAClient[] = data.clients || []
        setClients(requestedClients)
        setTotalPages(data.totalPages || 0)
        setTotalClients(data.totalClients || 0)
      } catch (error) {
        setClients([])
        setTotalPages(0)
        setTotalClients(0)
      } finally {
        setClientsLoading(false)
      }
    }
    if (open) fetchClients()
  }, [open, page, appliedFilter])

  useEffect(() => {
    if (!open) {
      setClientFilter("")
      setAppliedFilter("")
      setPage(1)
      setTotalPages(0)
      setTotalClients(0)
      setClients([])
    }
  }, [open])

  const handleApplyFilter = () => {
    setPage(1)
    setAppliedFilter(clientFilter.trim())
  }

  const handleClearFilter = () => {
    if (!clientFilter && !appliedFilter && page === 1) return
    setClientFilter("")
    setAppliedFilter("")
    setPage(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Cliente</DialogTitle>
          <DialogDescription>
            Seleccione un cliente de la lista. Puede buscar por nombre, apellidos o cédula.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <div className="mb-3 flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Buscar por nombre, apellidos o cédula"
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleApplyFilter()
                }
              }}
              className="text-[#2e4600] dark:text-[#c9e077] placeholder:text-muted-foreground"
            />
            <Button type="button" variant="secondary" onClick={handleApplyFilter}>
              Buscar
            </Button>
            <Button type="button" variant="ghost" onClick={handleClearFilter}>
              Limpiar
            </Button>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#232d1c]">
                  <th className="px-3 py-2 border text-[#2e4600] dark:text-[#c9e077]">Nombre</th>
                  <th className="px-3 py-2 border text-[#2e4600] dark:text-[#c9e077]">Apellidos</th>
                  <th className="px-3 py-2 border text-[#2e4600] dark:text-[#c9e077]">Cédula</th>
                </tr>
              </thead>
              <tbody>
                {clientsLoading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted-foreground">
                      Cargando clientes...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted-foreground">
                      No hay clientes que coincidan.
                    </td>
                  </tr>
                ) : (
                  clients
                    .filter((c) => typeof c.CLI_id === "number")
                    .map((c) => (
                      <tr
                        key={c.CLI_id}
                        onClick={() => {
                          onSelect(c)
                          onOpenChange(false)
                        }}
                        className={
                          "cursor-pointer transition-colors " +
                          (selectedId === c.CLI_id
                            ? "bg-[#e6f4d7] dark:bg-[#384d2b]"
                            : "hover:bg-[#f5fbe9] dark:hover:bg-[#2e3a23]") +
                          " text-[#2e4600] dark:text-[#c9e077]"
                        }
                      >
                        <td className="px-3 py-2 border">{c.CLI_name}</td>
                        <td className="px-3 py-2 border">{`${c.CLI_f_lastname ?? ""} ${c.CLI_s_lastname ?? ""}`.trim()}</td>
                        <td className="px-3 py-2 border">{c.CLI_identification}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <span>
              Mostrando {clients.length} de {totalClients} cliente{totalClients === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || clientsLoading}
              >
                Anterior
              </Button>
              <span className="min-w-[120px] text-center">
                Página {totalPages === 0 ? 0 : page} de {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={clientsLoading || page >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}