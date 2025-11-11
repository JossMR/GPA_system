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

  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true)
      try {
        const response = await fetch("/api/clients")
        const data = await response.json()
        const requestedClients: GPAClient[] = data.clients
        setClients(requestedClients)
      } catch (error) {
        setClients([])
      } finally {
        setClientsLoading(false)
      }
    }
    if (open) fetchClients()
  }, [open])

  const filteredClients = clients.filter(
    (c) =>
      c.CLI_name.toLowerCase().includes(clientFilter.toLowerCase()) ||
      c.CLI_f_lastname?.toLowerCase().includes(clientFilter.toLowerCase()) ||
      c.CLI_s_lastname?.toLowerCase().includes(clientFilter.toLowerCase()) ||
      c.CLI_identification.toLowerCase().includes(clientFilter.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seleccionar Cliente</DialogTitle>
          <DialogDescription>
            Seleccione un cliente de la lista o filtre por nombre o cédula.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <Input
            placeholder="Filtrar por nombre o cédula"
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="mb-2 text-[#2e4600] dark:text-[#c9e077] placeholder:text-muted-foreground"
          />
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
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted-foreground">
                      No hay clientes que coincidan.
                    </td>
                  </tr>
                ) : (
                  filteredClients
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