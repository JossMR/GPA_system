"use client"

import { useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type CostaRicaData = {
  [province: string]: {
    [canton: string]: string[]
  }
}

const data: CostaRicaData = {
  "San José": {
    "San José": [
      "Carmen", "Merced", "Hospital", "Catedral", "Zapote",
      "San Francisco de Dos Ríos", "Uruca", "Mata Redonda",
      "Pavas", "Hatillo", "San Sebastián"
    ],
    "Escazú": [
      "Escazú", "San Antonio", "San Rafael"
    ],
    "Desamparados": [
      "Desamparados", "San Miguel", "San Juan de Dios",
      "San Rafael Arriba", "San Antonio", "Frailes",
      "Patarrá", "San Cristóbal", "Rosario", "Damas",
      "San Rafael Abajo", "Gravilias", "Los Guido"
    ],
    "Puriscal": [
      "Santiago", "Mercedes Sur", "Barbacoas", "Grifo Alto",
      "San Rafael", "Candelarita", "Desamparaditos",
      "San Antonio", "Chires"
    ],
    "Tarrazú": [
      "San Marcos", "San Lorenzo", "San Carlos"
    ],
    "Aserrí": [
      "Aserrí", "Tarbaca", "Vuelta de Jorco", "San Gabriel",
      "Legua", "Monterrey", "Salitrillos"
    ],
    "Mora": [
      "Colón", "Guayabo", "Tabarcia", "Piedras Negras",
      "Picagres", "Jaris", "Quitirrisí"
    ],
    "Goicoechea": [
      "Guadalupe", "San Francisco", "Calle Blancos",
      "Mata de Plátano", "Ipís", "Rancho Redondo", "Purral"
    ],
    "Santa Ana": [
      "Santa Ana", "Salitral", "Pozos", "Uruca", "Piedades", "Brasil"
    ],
    "Alajuelita": [
      "Alajuelita", "San Josecito", "San Antonio", "Concepción", "San Felipe"
    ],
    "Vázquez de Coronado": [
      "San Isidro", "San Rafael", "Dulce Nombre de Jesús",
      "Patalillo", "Cascajal"
    ],
    "Acosta": [
      "San Ignacio", "Guaitil", "Palmichal", "Cangrejal", "Sabanillas"
    ],
    "Tibás": [
      "San Juan", "Cinco Esquinas", "Anselmo Llorente",
      "León XIII", "Colima"
    ],
    "Moravia": [
      "San Vicente", "San Jerónimo", "La Trinidad"
    ],
    "Montes de Oca": [
      "San Pedro", "Sabanilla", "Mercedes", "San Rafael"
    ],
    "Turrubares": [
      "San Pablo", "San Pedro", "San Juan de Mata", "San Luis", "Carara"
    ],
    "Dota": [
      "Santa María", "Jardín", "Copey"
    ],
    "Curridabat": [
      "Curridabat", "Granadilla", "Sánchez", "Tirrases"
    ],
    "Pérez Zeledón": [
      "San Isidro de El General", "El General", "Daniel Flores",
      "Rivas", "San Pedro", "Platanares", "Pejibaye", "Cajón",
      "Barú", "Río Nuevo", "Páramo", "La Amistad"
    ],
    "León Cortés Castro": [
      "San Pablo", "San Andrés", "Llano Bonito", "San Isidro",
      "Santa Cruz", "San Antonio"
    ]
  },
  "Alajuela": {
    "Alajuela": [
      "Alajuela", "San José", "Carrizal", "San Antonio",
      "Guácima", "San Isidro", "Sabanilla", "San Rafael",
      "Río Segundo", "Desamparados", "Turrúcares", "Tambor",
      "Garita", "Sarapiquí"
    ],
    "San Ramón": [
      "San Ramón", "Santiago", "San Juan", "Piedades Norte",
      "Piedades Sur", "San Rafael", "San Isidro", "Ángeles",
      "Alfaro", "Volio", "Concepción", "Zapotal", "Peñas Blancas",
      "San Lorenzo"
    ],
    "Grecia": [
      "Grecia", "San Isidro", "San José", "San Roque",
      "Tacares", "Puente de Piedra", "Bolívar"
    ],
    "San Mateo": [
      "San Mateo", "Desmonte", "Jesús María", "Labrador"
    ],
    "Atenas": [
      "Atenas", "Jesús", "Mercedes", "San Isidro", "Concepción",
      "San José", "Santa Eulalia", "Escobal"
    ],
    "Naranjo": [
      "Naranjo", "San Miguel", "San José", "Cirrí Sur",
      "San Jerónimo", "San Juan", "El Rosario", "Palmitos"
    ],
    "Palmares": [
      "Palmares", "Zaragoza", "Buenos Aires", "Santiago",
      "Candelaria", "Esquipulas", "La Granja"
    ],
    "Poás": [
      "San Pedro", "San Juan", "San Rafael", "Carrillos", "Sabana Redonda"
    ],
    "Orotina": [
      "Orotina", "El Mastate", "Hacienda Vieja", "Coyolar", "La Ceiba"
    ],
    "San Carlos": [
      "Quesada", "Florencia", "Buenavista", "Aguas Zarcas",
      "Venecia", "Pital", "La Fortuna", "La Tigra", "La Palmera",
      "Venado", "Cutris", "Monterrey", "Pocosol"
    ],
    "Zarcero": [
      "Zarcero", "Laguna", "Tapesco", "Guadalupe", "Palmira",
      "Zapote", "Brisas"
    ],
    "Sarchí": [
      "Sarchí Norte", "Sarchí Sur", "Toro Amarillo", "San Pedro", "Rodríguez"
    ],
    "Upala": [
      "Upala", "Aguas Claras", "San José O Pizote", "Bijagua",
      "Delicias", "Dos Ríos", "Yolillal", "Canalete"
    ],
    "Los Chiles": [
      "Los Chiles", "Caño Negro", "El Amparo", "San Jorge"
    ],
    "Guatuso": [
      "San Rafael", "Buenavista", "Cote", "Katira"
    ],
    "Río Cuarto": [
      "Río Cuarto", "Santa Rita", "Santa Isabel"
    ]
  },
  "Cartago": {
    "Cartago": [
      "Oriental", "Occidental", "Carmen", "San Nicolás",
      "Aguacaliente o San Francisco", "Guadalupe o Arenilla",
      "Corralillo", "Tierra Blanca", "Dulce Nombre",
      "Llano Grande", "Quebradilla"
    ],
    "Paraíso": [
      "Paraíso", "Santiago", "Orosi", "Cachí",
      "Llanos de Santa Lucía", "Birrisito"
    ],
    "La Unión": [
      "Tres Ríos", "San Diego", "San Juan", "San Rafael",
      "Concepción", "Dulce Nombre", "San Ramón", "Río Azul"
    ],
    "Jiménez": [
      "Juan Viñas", "Tucurrique", "Pejibaye", "La Victoria"
    ],
    "Turrialba": [
      "Turrialba", "La Suiza", "Peralta", "Santa Cruz",
      "Santa Teresita", "Pavones", "Tuis", "Tayutic",
      "Santa Rosa", "Tres Equis", "La Isabel", "Chirripó"
    ],
    "Alvarado": [
      "Pacayas", "Cervantes", "Capellades"
    ],
    "Oreamuno": [
      "San Rafael", "Cot", "Potrero Cerrado", "Cipreses", "Santa Rosa"
    ],
    "El Guarco": [
      "El Tejar", "San Isidro", "Tobosi", "Patio de Agua"
    ]
  },
  "Heredia": {
    "Heredia": [
      "Heredia", "Mercedes", "San Francisco", "Ulloa", "Varablanca"
    ],
    "Barva": [
      "Barva", "San Pedro", "San Pablo", "San Roque",
      "Santa Lucía", "San José de la Montaña", "Puente Salas"
    ],
    "Santo Domingo": [
      "Santo Domingo", "San Vicente", "San Miguel", "Paracito",
      "Santo Tomás", "Santa Rosa", "Tures", "Pará"
    ],
    "Santa Bárbara": [
      "Santa Bárbara", "San Pedro", "San Juan", "Jesús",
      "Santo Domingo", "Purabá"
    ],
    "San Rafael": [
      "San Rafael", "San Josecito", "Santiago", "Ángeles", "Concepción"
    ],
    "San Isidro": [
      "San Isidro", "San José", "Concepción", "San Francisco"
    ],
    "Belén": [
      "San Antonio", "La Ribera", "La Asunción"
    ],
    "Flores": [
      "San Joaquín", "Barrantes", "Llorente"
    ],
    "San Pablo": [
      "San Pablo", "Rincón de Sabanilla"
    ],
    "Sarapiquí": [
      "Puerto Viejo", "La Virgen", "Las Horquetas",
      "Llanuras del Gaspar", "Cureña"
    ]
  },
  "Guanacaste": {
    "Liberia": [
      "Liberia", "Cañas Dulces", "Mayorga", "Nacascolo", "Curubandé"
    ],
    "Nicoya": [
      "Nicoya", "Mansión", "San Antonio", "Quebrada Honda",
      "Sámara", "Nosara", "Belén de Nosarita"
    ],
    "Santa Cruz": [
      "Santa Cruz", "Bolsón", "Veintisiete de Abril", "Tempate",
      "Cartagena", "Cuajiniquil", "Diriá", "Cabo Velas", "Tamarindo"
    ],
    "Bagaces": [
      "Bagaces", "La Fortuna", "Mogote", "Río Naranjo"
    ],
    "Carrillo": [
      "Filadelfia", "Palmira", "Sardinal", "Belén"
    ],
    "Cañas": [
      "Cañas", "Palmira", "San Miguel", "Bebedero", "Porozal"
    ],
    "Abangares": [
      "Las Juntas", "Sierra", "San Juan", "Colorado"
    ],
    "Tilarán": [
      "Tilarán", "Quebrada Grande", "Tronadora", "Santa Rosa",
      "Líbano", "Tierras Morenas", "Arenal", "Cabeceras"
    ],
    "Nandayure": [
      "Carmona", "Santa Rita", "Zapotal", "San Pablo", "Porvenir", "Bejuco"
    ],
    "La Cruz": [
      "La Cruz", "Santa Cecilia", "La Garita", "Santa Elena"
    ],
    "Hojancha": [
      "Hojancha", "Monte Romo", "Puerto Carrillo", "Huacas", "Matambú"
    ]
  },
  "Puntarenas": {
    "Puntarenas": [
      "Puntarenas", "Pitahaya", "Chomes", "Lepanto", "Paquera",
      "Manzanillo", "Guacimal", "Barranca", "Isla del Coco",
      "Cóbano", "Chacarita", "Chira", "Acapulco", "El Roble", "Arancibia"
    ],
    "Esparza": [
      "Espíritu Santo", "San Juan Grande", "Macacona",
      "San Rafael", "San Jerónimo", "Caldera"
    ],
    "Buenos Aires": [
      "Buenos Aires", "Volcán", "Potrero Grande", "Boruca",
      "Pilas", "Colinas", "Chánguena", "Biolley", "Brunka"
    ],
    "Montes de Oro": [
      "Miramar", "La Unión", "San Isidro"
    ],
    "Osa": [
      "Puerto Cortés", "Palmar", "Sierpe", "Bahía Ballena",
      "Piedras Blancas", "Bahía Drake"
    ],
    "Quepos": [
      "Quepos", "Savegre", "Naranjito"
    ],
    "Golfito": [
      "Golfito", "Guaycará", "Pavón"
    ],
    "Coto Brus": [
      "San Vito", "Sabalito", "Aguabuena", "Limoncito",
      "Pittier", "Gutiérrez Braun"
    ],
    "Parrita": [
      "Parrita"
    ],
    "Corredores": [
      "Corredor", "La Cuesta", "Canoas", "Laurel"
    ],
    "Garabito": [
      "Jacó", "Tárcoles", "Lagunillas"
    ],
    "Monteverde": [
      "Monteverde"
    ],
    "Puerto Jiménez": [
      "Puerto Jiménez"
    ]
  },
  "Limón": {
    "Limón": [
      "Limón", "Valle La Estrella", "Río Blanco", "Matama"
    ],
    "Pococí": [
      "Guápiles", "Jiménez", "Rita", "Roxana", "Cariari",
      "Colorado", "La Colonia"
    ],
    "Siquirres": [
      "Siquirres", "Pacuarito", "Florida", "Germania",
      "El Cairo", "Alegría", "Reventazón"
    ],
    "Talamanca": [
      "Bratsi", "Sixaola", "Cahuita", "Telire"
    ],
    "Matina": [
      "Matina", "Batán", "Carrandí"
    ],
    "Guácimo": [
      "Guácimo", "Mercedes", "Pocora", "Río Jiménez"
    ]
  }
}

const provinces = Object.keys(data)

export function CostaRicaLocationSelect(
  {
    province,
    setProvince,
    canton,
    setCanton,
    district,
    setDistrict,
  }:{
  province: string
  setProvince: (val: string) => void
  canton: string
  setCanton: (val: string) => void
  district: string
  setDistrict: (val: string) => void
  }
) {
  // Get cantons for selected province
  const cantons = province ? Object.keys(data[province]) : []
  // Get districts for selected canton
  const districts = province && canton ? data[province][canton] : []

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Province */}
      <div className="space-y-2">
        <Label htmlFor="province" className="text-[#2e4600] font-medium">
          Provincia
        </Label>
        <Select
          value={province}
          onValueChange={value => {
            setProvince(value)
            setCanton("")
            setDistrict("")
          }}
        >
          <SelectTrigger
            id="province"
            className={`border-[#a2c523]/30 focus:border-[#486b00] rounded px-3 py-2 w-full ${
              !province ? ' border-yellow-400 ring-2 ring-yellow-400/50' : ''
            }`}
          >
            <SelectValue placeholder="Selecciona una provincia" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!province && (
          <p className="text-yellow-600 text-sm font-medium">
            ⚠️ Debes elegir una provincia
          </p>
        )}
        {/* Input oculto para validación */}
        <input 
          name="province"
          onChange={() => {}}
          type="text" 
          value={province}
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

      {/* Canton */}
      <div className="space-y-2">
        <Label htmlFor="canton" className="text-[#2e4600] font-medium">
          Cantón
        </Label>
        <Select
          value={canton}
          onValueChange={value => {
            setCanton(value)
            setDistrict("")
          }}
          disabled={!province}
        >
          <SelectTrigger
            id="canton"
            className={`border-[#a2c523]/30 focus:border-[#486b00] rounded px-3 py-2 w-full ${
              province && !canton ? 'border-yellow-400 ring-2 ring-yellow-400/50' : ''
            } ${!province ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <SelectValue placeholder={province ? "Selecciona un cantón" : "Selecciona provincia primero"} />
          </SelectTrigger>
          <SelectContent>
            {cantons.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {province && !canton && (
          <p className="text-yellow-600 text-sm font-medium">
            ⚠️ Debes elegir un cantón
          </p>
        )}
        {/* Input oculto para validación */}
        <input 
          name="canton"
          onChange={() => {}}
          type="text" 
          value={canton}
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

      {/* District */}
      <div className="space-y-2">
        <Label htmlFor="district" className="text-[#2e4600] font-medium">
          Distrito
        </Label>
        <Select
          value={district}
          onValueChange={setDistrict}
          disabled={!canton}
        >
          <SelectTrigger
            id="district"
            className={`border-[#a2c523]/30 focus:border-[#486b00] rounded px-3 py-2 w-full ${
              canton && !district ? 'border-yellow-400 ring-2 ring-yellow-400/50' : ''
            } ${!canton ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <SelectValue placeholder={canton ? "Selecciona un distrito" : "Selecciona cantón primero"} />
          </SelectTrigger>
          <SelectContent>
            {districts.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canton && !district && (
          <p className="text-yellow-600 text-sm font-medium">
            ⚠️ Debes elegir un distrito
          </p>
        )}
        {/* Input oculto para validación */}
        <input 
          name="district"
          onChange={() => {}}
          type="text" 
          value={district}
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