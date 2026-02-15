import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Box } from "lucide-react"
import { getBlockIcon, CATEGORY_COLORS, CATEGORY_NAMES, BLOCK_DEFS } from "@/lib/blocks"
import { usePreferences, BLOCK_SIZE_CONFIG } from "@/lib/preferences"

function formatBlockType(type: string) {
  const def = BLOCK_DEFS[type]
  if (def) return def.name
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function BlockNodeComponent({ data, selected }: NodeProps) {
  const { blockSize } = usePreferences()
  const cfg = BLOCK_SIZE_CONFIG[blockSize]

  const { block_type, category } = data as {
    block_type: string
    category: string
    config: Record<string, unknown>
  }

  const color = CATEGORY_COLORS[category] || "#8B8B99"
  const Icon = getBlockIcon(block_type, category) || Box

  return (
    <div
      className="frosted-glass-block relative transition-all"
      style={{
        minWidth: cfg.minWidth,
        borderRadius: cfg.radius,
        border: selected ? `2px solid ${color}` : "1px solid rgba(255,255,255,0.65)",
        borderLeftWidth: 3,
        borderLeftColor: color,
        boxShadow: selected
          ? `0 8px 24px ${color}25, 0 0 0 1px ${color}30, 0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.04) inset`
          : undefined,
      }}
    >
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        className="!-left-[5px]"
      />

      <div className={`relative z-[1] flex items-center ${cfg.gap} ${cfg.px} ${cfg.py}`}>
        <div
          className={`flex ${cfg.iconSize} shrink-0 items-center justify-center`}
          style={{ borderRadius: 'var(--radius-sm)', backgroundColor: color + "15" }}
        >
          <Icon className={cfg.iconInner} style={{ color }} />
        </div>
        <div className="min-w-0">
          <div className={`truncate ${cfg.textSize} font-medium`} style={{ color: 'var(--foreground)' }}>
            {formatBlockType(block_type)}
          </div>
          <div className={`${cfg.subSize}`} style={{ color: 'var(--text-muted)' }}>
            {CATEGORY_NAMES[category] || category}
          </div>
        </div>
      </div>

      <Handle
        id="output"
        type="source"
        position={Position.Right}
        className="!-right-[5px]"
      />
    </div>
  )
}

export const BlockNode = memo(BlockNodeComponent)
