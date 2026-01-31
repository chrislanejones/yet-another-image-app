import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ExportFormat = "jpeg" | "webp" | "avif"

interface SelectProps {
  value: ExportFormat
  onValueChange: (value: ExportFormat) => void
  className?: string
}

const formatLabels: Record<ExportFormat, string> = {
  jpeg: "JPEG",
  webp: "WebP",
  avif: "AVIF",
}

export function Select({ value, onValueChange, className }: SelectProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex h-9 w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:ring-offset-2 focus:ring-offset-theme-sidebar",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer text-center",
            "bg-theme-primary text-theme-secondary",
            className
          )}
        >
          {formatLabels[value]}
          <ChevronDown className="ml-2 h-4 w-4 text-black" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-0 w-[var(--radix-dropdown-menu-trigger-width)]">
        {(Object.keys(formatLabels) as ExportFormat[]).map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={() => onValueChange(format)}
            className="cursor-pointer justify-center"
          >
            {formatLabels[format]}
            {value === format && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { formatLabels }