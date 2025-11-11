import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const countryCodes = [
  { code: "+506", name: "Costa Rica" },
  { code: "+1", name: "USA/Canada" },
  { code: "+34", name: "Spain" },
  { code: "+52", name: "Mexico" },
  { code: "+54", name: "Argentina" },
  { code: "+55", name: "Brazil" },
  { code: "+56", name: "Chile" },
  { code: "+57", name: "Colombia" },
  { code: "+58", name: "Venezuela" },
  { code: "+593", name: "Ecuador" },
  { code: "+595", name: "Paraguay" },
  { code: "+598", name: "Uruguay" }
]

export function PhoneInput({ value, onChange }: { value?: string, onChange?: (val: string) => void }) {
  const [countryCode, setCountryCode] = useState(value?.split("-")[0]||"+506")
  const [phone, setPhone] = useState(value?.split("-")[1]||"")
  
  const handlePhoneChange = (val: string) => {
    setPhone(val)
    onChange?.(`${countryCode}${"-"}${val}`)
  }
  const handleCodeChange = (val: string) => {
    setCountryCode(val)
    onChange?.(`${val}${"-"}${phone}`)
  }

  return (
    <div className="flex gap-2 items-end">
      <div className="w-32 space-y-2">
        <Label htmlFor="countryCode" className="text-[#2e4600] font-medium">Código ciudad *</Label>
        <Select value={countryCode} onValueChange={handleCodeChange}>
          <SelectTrigger id="countryCode" name="countryCode" className="border-[#a2c523]/30 focus:border-[#486b00] rounded px-3 py-2 w-full">
            <SelectValue placeholder="Code" />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map(c => (
              <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="phone" className="text-[#2e4600] font-medium">Numero telefono *</Label>
        <Input
          id="phone"
          name="phone"
          maxLength={30}
          placeholder="Numero de telefono"
          className="border-[#a2c523]/30 focus:border-[#486b00]"
          value={phone}
          onChange={e => handlePhoneChange(e.target.value)}
          required
        />
      </div>
    </div>
  )
}