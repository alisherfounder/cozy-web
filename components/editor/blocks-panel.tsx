"use client"

import { useState } from "react"
import { Search, X, ChevronDown, Box } from "lucide-react"
import {
  ALL_BLOCKS,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CATEGORY_NAMES,
  CATEGORY_ORDER,
  type BlockDefinition,
} from "@/lib/blocks"
import { usePreferences, BLOCK_SIZE_CONFIG } from "@/lib/preferences"

export function BlocksPanel({ onClose, onAddBlock }: { onClose: () => void; onAddBlock?: (blockType: string, category: string) => void }) {
  const { blockSize } = usePreferences()
  const cfg = BLOCK_SIZE_CONFIG[blockSize]
  const [search, setSearch] = useState("")
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = ALL_BLOCKS.filter(
    (b) =>
      !search ||
      b.type.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const items = filtered.filter((b) => b.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    },
    {} as Record<string, BlockDefinition[]>
  )

  function handleDragStart(e: React.DragEvent, block: BlockDefinition) {
    e.dataTransfer.setData(
      "application/cozy-block",
      JSON.stringify({ block_type: block.type, category: block.category })
    )
    e.dataTransfer.effectAllowed = "move"
  }

  function toggleCategory(cat: string) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const panelWidth = blockSize === "compact" ? "w-56" : blockSize === "large" ? "w-72" : "w-64"

  return (
    <div className={`glass-heavy flex h-full ${panelWidth} max-md:fixed max-md:inset-0 max-md:z-50 max-md:w-full flex-col`} style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Блоки
        </span>
        <button
          onClick={onClose}
          className="rounded-[var(--radius-sm)] p-1.5 transition-colors hover:bg-white/40"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск блоков..."
            className="glass-input h-9 w-full pl-8 pr-3 text-xs sm:h-8"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {Object.entries(grouped).map(([category, items]) => {
          const color = CATEGORY_COLORS[category] || "#8B8B99"
          const CatIcon = CATEGORY_ICONS[category] || Box
          const isCollapsed = collapsed[category]

          return (
            <div key={category} className="mt-2">
              <button
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center gap-2 px-2 py-2 text-left transition-colors hover:bg-white/40 sm:py-1.5"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <CatIcon className="h-3.5 w-3.5" style={{ color }} />
                <span className="flex-1 text-xs font-medium sm:text-[11px]" style={{ color: 'var(--foreground)' }}>
                  {CATEGORY_NAMES[category] || category}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {items.length}
                </span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                  style={{ color: 'var(--text-muted)' }}
                />
              </button>

              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {items.map((block) => {
                    const BlockIcon = block.icon
                    return (
                      <div
                        key={block.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block)}
                        onClick={() => {
                          if (onAddBlock) {
                            onAddBlock(block.type, block.category)
                          }
                        }}
                        className={`flex cursor-grab items-start ${cfg.gap} border border-transparent ${cfg.px} transition-all hover:border-[rgba(174,87,72,0.1)] hover:bg-white/50 hover:shadow-sm active:cursor-grabbing max-md:cursor-pointer`}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          paddingTop: blockSize === "compact" ? 6 : blockSize === "large" ? 10 : 8,
                          paddingBottom: blockSize === "compact" ? 6 : blockSize === "large" ? 10 : 8,
                        }}
                      >
                        <div
                          className={`mt-0.5 flex ${blockSize === "large" ? "h-7 w-7" : blockSize === "compact" ? "h-5 w-5" : "h-6 w-6"} shrink-0 items-center justify-center rounded`}
                          style={{ backgroundColor: color + "15" }}
                        >
                          <BlockIcon
                            className={blockSize === "large" ? "h-4 w-4" : "h-3 w-3"}
                            style={{ color }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className={`${cfg.textSize} font-medium`} style={{ color: 'var(--foreground)' }}>
                            {block.name}
                          </div>
                          <div className={`mt-0.5 ${cfg.subSize} leading-tight`} style={{ color: 'var(--text-muted)' }}>
                            {block.description}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="mt-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Блоки не найдены
          </div>
        )}
      </div>
    </div>
  )
}
