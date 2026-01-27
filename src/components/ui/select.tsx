import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

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
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value as ExportFormat)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "appearance-none cursor-pointer",
          "bg-theme-accent text-theme-foreground"
        )}
      >
        {(Object.keys(formatLabels) as ExportFormat[]).map((format) => (
          <option key={format} value={format} className="bg-theme-popover text-theme-foreground">
            {formatLabels[format]}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
    </div>
  )
}

export { formatLabels }