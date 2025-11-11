import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GPAtype } from "@/models/GPA_type"
import { useToast } from "@/hooks/use-toast"

interface Props {
  value: number | null
  onChange: (id: number) => void
}

// Spinner simple (puedes reemplazarlo por un ícono si tienes uno)
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-[#486b00]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}

export function ProjectTypeManager({ value, onChange }: Props) {
  const [types, setTypes] = useState<GPAtype[]>([])
  const [newType, setNewType] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTypes = async () => {
      const res = await fetch("/api/types")
      const data = await res.json()
      setTypes(Array.isArray(data) ? data : [])
    }
    fetchTypes()
  }, [])

  const handleAddType = async () => {
    if (!newType.trim()) return
    setLoading(true)
    await fetch("/api/types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ TYP_name: newType }),
    })
    setNewType("")
    const typesRes = await fetch("/api/types")
    const typesData = await typesRes.json()
    setTypes(Array.isArray(typesData) ? typesData : [])
    setLoading(false)
    toast({
      title: "Tipo de proyecto guardado",
      description: "El tipo de proyecto fue guardado correctamente",
      variant: "success"
    })
  }

  return (
    <div className="flex gap-2 items-end">
      <Input
        placeholder="Nuevo tipo"
        value={newType}
        onChange={e => setNewType(e.target.value)}
        disabled={loading}
      />
      <Button
        onClick={handleAddType}
        disabled={loading || !newType.trim()}
        size="sm"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Guardando...
          </span>
        ) : (
          "Guardar"
        )}
      </Button>
      <div className="flex flex-col gap-1 w-full">
        <Select value={value ? String(value) : ""} onValueChange={v => onChange(Number(v))}>
          <SelectTrigger
            className={`border-[#a2c523]/30 focus:border-[#486b00] rounded px-3 py-2 w-full ${
              !value ? 'border-yellow-400 ring-2 ring-yellow-400/50' : ''
            }`}
          >
            <SelectValue placeholder="Seleccione un tipo de proyecto" />
          </SelectTrigger>
          <SelectContent>
            {types.map(type => (
              <SelectItem key={type.TYP_id} value={String(type.TYP_id)}>
                {type.TYP_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!value && (
          <p className="text-yellow-600 text-sm font-medium">
            ⚠️ Debe seleccionar un tipo de proyecto
          </p>
        )}
        {/* Input oculto para validación */}
        <input 
          name="projectType"
          onChange={() => {}}
          type="text" 
          value={value ? String(value) : ""}
          required
          style={{
            position: 'absolute',
            left: '-9999px',
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: 'none'
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}