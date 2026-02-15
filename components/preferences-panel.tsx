"use client"

import { Settings, X, Smartphone, Monitor, LayoutGrid } from "lucide-react"
import { useState } from "react"
import { usePreferences, type BlockSize } from "@/lib/preferences"

const SIZE_OPTIONS: { value: BlockSize; label: string; desc: string }[] = [
  { value: "compact", label: "Compact", desc: "Smaller blocks, fits more" },
  { value: "default", label: "Default", desc: "Balanced sizing" },
  { value: "large", label: "Large", desc: "Touch-friendly, easier to tap" },
]

const COLUMN_OPTIONS: { value: 1 | 2 | 3; label: string; icon: typeof LayoutGrid }[] = [
  { value: 1, label: "1 col", icon: Smartphone },
  { value: 2, label: "2 col", icon: Monitor },
  { value: 3, label: "3 col", icon: LayoutGrid },
]

export function PreferencesButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-[var(--radius-md)] p-2 transition-colors hover:bg-white/40"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Preferences"
      >
        <Settings className="h-4 w-4" />
      </button>

      {open && <PreferencesDialog onClose={() => setOpen(false)} />}
    </>
  )
}

function PreferencesDialog({ onClose }: { onClose: () => void }) {
  const { blockSize, setBlockSize, cardColumns, setCardColumns } = usePreferences()

  return (
    <div
      className="overlay-blur fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div
        className="glass-dialog w-full max-w-sm rounded-b-none p-5 sm:rounded-b-[var(--radius-2xl)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Display Preferences
          </h2>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-sm)] p-1 transition-colors hover:bg-white/40"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Block Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBlockSize(opt.value)}
                  className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] p-3 text-center transition-all"
                  style={{
                    background: blockSize === opt.value ? 'var(--primary-wash)' : 'rgba(255,255,255,0.5)',
                    border: blockSize === opt.value ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    color: blockSize === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Scenario Cards
            </label>
            <div className="flex gap-2">
              {COLUMN_OPTIONS.map((opt) => {
                const IconComp = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => setCardColumns(opt.value)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-md)] py-2.5 text-xs font-medium transition-all"
                    style={{
                      background: cardColumns === opt.value ? 'var(--primary-wash)' : 'rgba(255,255,255,0.5)',
                      border: cardColumns === opt.value ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      color: cardColumns === opt.value ? 'var(--primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <IconComp className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <p className="mt-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Saved automatically in your browser
        </p>
      </div>
    </div>
  )
}
