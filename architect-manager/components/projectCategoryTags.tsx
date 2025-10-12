// ProjectCategoryTags.tsx
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface Category {
  id: number
  name: string
}

interface ProjectCategoryTagsProps {
  categories: Category[]
  onRemove: (id: number) => void
  onAddClick: () => void
}

export function ProjectCategoryTags({
  categories,
  onRemove,
  onAddClick,
}: ProjectCategoryTagsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {categories.map(cat => (
        <span
          key={cat.id}
          className="flex items-center bg-[#eaf5d1] text-[#486b00] px-3 py-1 rounded-full text-sm font-medium border border-[#a2c523]/40"
        >
          {cat.name}
          <button
            type="button"
            className="ml-2 text-[#a2c523] hover:text-red-500"
            onClick={() => onRemove(cat.id)}
            aria-label={`Quitar ${cat.name}`}
          >
            <X size={16} />
          </button>
        </span>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-[#a2c523] text-[#486b00] hover:bg-[#c9e077]/20 flex items-center gap-1"
        onClick={onAddClick}
      >
        <Plus size={16} /> Agregar categoría
      </Button>
    </div>
  )
}