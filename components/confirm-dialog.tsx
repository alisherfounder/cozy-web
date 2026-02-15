"use client"

import { AlertTriangle, Trash2 } from "lucide-react"

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning"
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null

  const Icon = variant === "danger" ? Trash2 : AlertTriangle

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="overlay-blur absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="glass-dialog relative w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: variant === "danger" ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
            }}
          >
            <Icon
              className="h-5 w-5"
              style={{ color: variant === "danger" ? "#ef4444" : "#f59e0b" }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-9 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors hover:bg-white/50 disabled:opacity-50"
            style={{ color: 'var(--text-secondary)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex h-9 items-center gap-2 px-4 text-sm font-medium text-white transition-all disabled:opacity-50 active:scale-[0.98] ${
              variant === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
            style={{ borderRadius: 'var(--radius-md)', boxShadow: variant === "danger" ? '0 4px 14px rgba(239, 68, 68, 0.25)' : '0 4px 14px rgba(245, 158, 11, 0.25)' }}
          >
            {loading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
