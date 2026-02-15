"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Trash2,
  Play,
  Zap,
  ChevronRight,
  LayoutGrid,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { api } from "@/lib/api"
import type { ScenarioResponse, ScenarioCreate } from "@/lib/api"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PreferencesButton } from "@/components/preferences-panel"
import { usePreferences } from "@/lib/preferences"
import { MobileNav } from "@/components/mobile-nav"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const GRID_CLASS: Record<number, string> = {
  1: "grid grid-cols-1 gap-4",
  2: "grid grid-cols-1 gap-4 sm:grid-cols-2",
  3: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
}

export default function ScenariosPage() {
  const router = useRouter()
  const { cardColumns } = usePreferences()
  const [scenarios, setScenarios] = useState<ScenarioResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    loadScenarios()
  }, [])

  async function loadScenarios() {
    try {
      const data = await api.scenarios.list()
      setScenarios(data)
    } catch {
      // handle silently
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const scenario = await api.scenarios.create({
        name: newName,
        description: newDesc || undefined,
        blocks: [],
        connections: [],
      })
      router.push(`/scenarios/${scenario.id}`)
    } catch (error) {
      console.error("Failed to create scenario:", error)
      setCreating(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await api.scenarios.delete(id)
      setScenarios((prev) => prev.filter((s) => s.id !== id))
      setConfirmDeleteId(null)
    } catch {
      // handle silently
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-mesh-gradient min-h-screen">
      <header className="sticky top-0 z-40 glass-heavy" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] transition-all hover:bg-white/60"
              style={{ color: 'var(--primary)' }}
              aria-label="Назад на главную"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]" style={{ background: 'var(--primary-wash)' }}>
              <Zap className="h-4 w-4" style={{ color: 'var(--primary)' }} />
            </div>
            <h1 className="font-logo text-xl tracking-tight" style={{ color: 'var(--primary)' }}>
              Cozy
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <PreferencesButton />
            <button
              onClick={() => setShowCreate(true)}
              className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium text-white transition-all hover:shadow-lg active:scale-[0.98] sm:px-4"
              style={{ background: 'var(--primary)', boxShadow: '0 4px 14px rgba(174, 87, 72, 0.25)' }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Scenario</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 pb-24 sm:px-6 md:py-8 md:pb-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--primary-lighter)' }} />
          </div>
        ) : scenarios.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)]"
              style={{ background: 'var(--primary-wash)' }}
            >
              <LayoutGrid className="h-7 w-7" style={{ color: 'var(--primary-lighter)' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                No scenarios yet
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Create your first automation scenario
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-2 flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]"
              style={{ background: 'var(--primary)', boxShadow: '0 4px 14px rgba(174, 87, 72, 0.25)' }}
            >
              <Plus className="h-4 w-4" />
              Create Scenario
            </button>
          </div>
        ) : (
          <div className={GRID_CLASS[cardColumns]}>
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => router.push(`/scenarios/${scenario.id}`)}
                className="glass-card group cursor-pointer p-4 sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${scenario.is_active ? "shadow-[0_0_8px_rgba(16,185,129,0.4)]" : ""}`}
                      style={{ background: scenario.is_active ? '#51cf66' : 'var(--primary-lightest)' }}
                    />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {scenario.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDeleteId(scenario.id)
                    }}
                    disabled={deletingId === scenario.id}
                    className="rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {deletingId === scenario.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {scenario.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {scenario.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {scenario.is_template && (
                      <span
                        className="rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: 'var(--primary-wash)', color: 'var(--primary)' }}
                      >
                        Template
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(scenario.created_at)}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--primary-lightest)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div
          className="overlay-blur fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => { setShowCreate(false); setNewName(""); setNewDesc("") }}
        >
          <div
            className="glass-dialog w-full max-w-md rounded-[var(--radius-2xl)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              New Scenario
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create an automation scenario from scratch
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Name
                </label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Morning Routine"
                  className="glass-input h-11 w-full px-3 text-sm sm:h-10"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Description
                  <span className="ml-1" style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What does this scenario do?"
                  rows={3}
                  className="glass-input w-full px-3 py-2.5 text-sm"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreate(false)
                  setNewName("")
                  setNewDesc("")
                }}
                className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors hover:bg-white/40 sm:h-9"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 active:scale-[0.98] sm:h-9 sm:px-4"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 14px rgba(174, 87, 72, 0.25)' }}
              >
                {creating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
        title="Delete scenario"
        message={`Are you sure you want to delete "${scenarios.find((s) => s.id === confirmDeleteId)?.name ?? "this scenario"}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deletingId !== null}
      />

      <MobileNav />
    </div>
  )
}
