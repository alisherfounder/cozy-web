"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DayPicker } from "react-day-picker"
import { api, type UtilityMeterResponse, type UtilityBillResponse, type UtilityStatsResponse } from "@/lib/api"
import {
  ArrowLeft, CreditCard, Loader2, Droplet, Zap as Lightning,
  Flame, Plus, FileText, CheckCircle2, Clock, AlertCircle, Trash2, Calendar
} from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { ConfirmDialog } from "@/components/confirm-dialog"
import "react-day-picker/style.css"

const METER_TYPES = [
  { value: "electricity", label: "Электричество" },
  { value: "water", label: "Вода" },
  { value: "gas", label: "Газ" },
]

function getMeterIcon(meterType: string) {
  switch (meterType) {
    case "electricity": return Lightning
    case "water": return Droplet
    case "gas": return Flame
    default: return FileText
  }
}

function dateToYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function getMeterLabel(meterType: string) {
  return METER_TYPES.find((t) => t.value === meterType)?.label ?? meterType
}

function getBillStatusIcon(status: string) {
  switch (status) {
    case "paid": return CheckCircle2
    case "pending": return Clock
    case "overdue": return AlertCircle
    default: return FileText
  }
}

function getBillStatusLabel(status: string) {
  switch (status) {
    case "paid": return "Оплачен"
    case "pending": return "Ожидает"
    case "overdue": return "Просрочен"
    default: return status
  }
}

function getBillStatusColor(status: string) {
  switch (status) {
    case "paid": return "#51cf66"
    case "pending": return "#fab005"
    case "overdue": return "#ff6b6b"
    default: return "var(--text-muted)"
  }
}

export default function BillsPage() {
  const router = useRouter()
  const [meters, setMeters] = useState<UtilityMeterResponse[]>([])
  const [bills, setBills] = useState<UtilityBillResponse[]>([])
  const [stats, setStats] = useState<UtilityStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"bills" | "meters">("bills")

  const [payingBillId, setPayingBillId] = useState<number | null>(null)

  const [showCreateMeter, setShowCreateMeter] = useState(false)
  const [newMeterType, setNewMeterType] = useState("electricity")
  const [newMeterNumber, setNewMeterNumber] = useState("")
  const [newMeterLocation, setNewMeterLocation] = useState("")
  const [creatingMeter, setCreatingMeter] = useState(false)

  const [deleteMeterId, setDeleteMeterId] = useState<number | null>(null)
  const [deletingMeter, setDeletingMeter] = useState(false)

  const [showCreateBill, setShowCreateBill] = useState(false)
  const [calcMeterId, setCalcMeterId] = useState<number | null>(null)
  const [calcPeriodStart, setCalcPeriodStart] = useState("")
  const [calcPeriodEnd, setCalcPeriodEnd] = useState("")
  const [calcRate, setCalcRate] = useState("")
  const [calcAmount, setCalcAmount] = useState("")
  const [creatingBill, setCreatingBill] = useState(false)

  const [deleteBillId, setDeleteBillId] = useState<number | null>(null)
  const [deletingBill, setDeletingBill] = useState(false)

  const [showReading, setShowReading] = useState(false)
  const [readingMeterId, setReadingMeterId] = useState<number | null>(null)
  const [readingValue, setReadingValue] = useState("")
  const [submittingReading, setSubmittingReading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [metersData, billsData, statsData] = await Promise.all([
        api.utilities.meters(),
        api.utilities.bills(),
        api.utilities.stats(),
      ])
      setMeters(metersData)
      setBills(billsData)
      setStats(statsData)
    } catch (e) {
      console.error("loadData", e)
    } finally {
      setLoading(false)
    }
  }

  async function handlePayBill(billId: number) {
    setPayingBillId(billId)
    try {
      await api.utilities.payBill(billId, { payment_method: "card" })
      await loadData()
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось оплатить"}`)
    } finally {
      setPayingBillId(null)
    }
  }

  async function handleDeleteBill() {
    if (deleteBillId === null) return
    setDeletingBill(true)
    try {
      await api.utilities.deleteBill(deleteBillId)
      setBills((prev) => prev.filter((b) => b.id !== deleteBillId))
      setDeleteBillId(null)
      await loadData()
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось удалить счёт"}`)
    } finally {
      setDeletingBill(false)
    }
  }

  async function handleCreateMeter() {
    const meter_number = newMeterNumber.trim()
    if (!meter_number) return
    setCreatingMeter(true)
    try {
      const meter = await api.utilities.createMeter({
        meter_type: newMeterType,
        meter_number,
        location: newMeterLocation.trim() || undefined,
      })
      setMeters((prev) => [...prev, meter])
      setShowCreateMeter(false)
      setNewMeterNumber("")
      setNewMeterLocation("")
      await loadData()
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось добавить"}`)
    } finally {
      setCreatingMeter(false)
    }
  }

  async function handleDeleteMeter() {
    if (deleteMeterId === null) return
    setDeletingMeter(true)
    try {
      await api.utilities.deleteMeter(deleteMeterId)
      setMeters((prev) => prev.filter((m) => m.id !== deleteMeterId))
      setDeleteMeterId(null)
      await loadData()
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось удалить"}`)
    } finally {
      setDeletingMeter(false)
    }
  }

  async function handleCreateBill() {
    if (calcMeterId == null || !calcPeriodStart || !calcPeriodEnd || !calcRate.trim()) return
    const rate = parseFloat(calcRate.replace(",", "."))
    if (Number.isNaN(rate) || rate < 0) return
    setCreatingBill(true)
    try {
      const start = new Date(calcPeriodStart).toISOString()
      const end = new Date(calcPeriodEnd).toISOString()
      const bill = await api.utilities.calculateBill({
        meter_id: calcMeterId,
        period_start: start,
        period_end: end,
        rate_per_unit: rate,
      })
      const parsed = parseFloat(calcAmount.replace(",", "."))
      const amountToSave = calcAmount.trim() ? (Number.isNaN(parsed) ? bill.amount : parsed) : bill.amount
      await api.utilities.updateBill(bill.id, { amount: amountToSave })
      const updated = { ...bill, amount: amountToSave }
      setBills((prev) => [updated, ...prev])
      setShowCreateBill(false)
      setCalcMeterId(null)
      setCalcPeriodStart("")
      setCalcPeriodEnd("")
      setCalcRate("")
      setCalcAmount("")
      await loadData()
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось рассчитать счёт"}`)
    } finally {
      setCreatingBill(false)
    }
  }

  async function handleSubmitReading() {
    if (readingMeterId == null || readingValue.trim() === "") return
    const value = parseFloat(readingValue.replace(",", "."))
    if (Number.isNaN(value) || value < 0) return
    setSubmittingReading(true)
    try {
      await api.utilities.submitReading({ meter_id: readingMeterId, reading_value: value })
      setShowReading(false)
      setReadingMeterId(null)
      setReadingValue("")
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось внести показания"}`)
    } finally {
      setSubmittingReading(false)
    }
  }

  const primaryBtn = { background: "var(--primary)", color: "white" }

  return (
    <div className="bg-mesh-gradient flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-40 glass-heavy"
        style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-white/60"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]" style={{ background: "var(--primary-wash)" }}>
              <CreditCard className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="font-logo text-xl tracking-tight" style={{ color: "var(--primary)" }}>
              Оплата счетов
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 sm:px-6 md:py-8 md:pb-8">
        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary-lighter)" }} />
          </div>
        ) : (
          <div className="space-y-6">
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <div className="glass-card" style={{ padding: 16 }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Счетчиков</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>{stats.total_meters}</p>
                </div>
                <div className="glass-card" style={{ padding: 16 }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>К оплате</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "#fab005" }}>{stats.total_pending_amount.toFixed(2)} ₸</p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>{stats.pending_bills} счетов</p>
                </div>
                <div className="glass-card" style={{ padding: 16 }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Оплачено</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "#51cf66" }}>{stats.total_paid_amount.toFixed(2)} ₸</p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>{stats.paid_bills} счетов</p>
                </div>
                <div className="glass-card" style={{ padding: 16 }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Всего счетов</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>{stats.total_bills}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("bills")}
                className="rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold transition-all"
                style={{ background: activeTab === "bills" ? "var(--primary)" : "var(--surface-muted)", color: activeTab === "bills" ? "white" : "var(--text-secondary)" }}
              >
                Счета
              </button>
              <button
                onClick={() => setActiveTab("meters")}
                className="rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold transition-all"
                style={{ background: activeTab === "meters" ? "var(--primary)" : "var(--surface-muted)", color: activeTab === "meters" ? "white" : "var(--text-secondary)" }}
              >
                Счетчики
              </button>
            </div>

            {activeTab === "bills" && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowCreateBill(true)
                      setCalcMeterId(meters[0]?.id ?? null)
                      setCalcPeriodStart("")
                      setCalcPeriodEnd("")
                      setCalcRate("")
                    }}
                    disabled={meters.length === 0}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    style={primaryBtn}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Рассчитать счёт
                  </button>
                </div>
                {bills.length === 0 ? (
                  <div className="glass-card flex h-[40vh] flex-col items-center justify-center gap-3">
                    <FileText className="h-12 w-12" style={{ color: "var(--primary-lightest)" }} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Нет счетов</p>
                    <button
                      onClick={() => setShowCreateBill(true)}
                      disabled={meters.length === 0}
                      className="rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
                      style={primaryBtn}
                    >
                      Рассчитать счёт
                    </button>
                  </div>
                ) : (
                  bills.map((bill) => {
                    const StatusIcon = getBillStatusIcon(bill.status)
                    const meter = meters.find((m) => m.id === bill.meter_id)
                    return (
                      <div key={bill.id} className="glass-card" style={{ padding: 16 }}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                {meter ? getMeterLabel(meter.meter_type) : "Счет"}
                              </h3>
                              <span
                                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{ background: `${getBillStatusColor(bill.status)}20`, color: getBillStatusColor(bill.status) }}
                              >
                                <StatusIcon className="h-2.5 w-2.5" />
                                {getBillStatusLabel(bill.status)}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Период: {new Date(bill.period_start).toLocaleDateString("ru-RU")} — {new Date(bill.period_end).toLocaleDateString("ru-RU")}
                              </p>
                              {meter && (
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Счетчик: {meter.meter_number}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <div className="sm:text-right">
                              <p className="text-xl font-bold sm:text-2xl" style={{ color: "var(--foreground)" }}>
                                {bill.amount.toFixed(2)} ₸
                              </p>
                              {bill.paid_at && (
                                <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                                  Оплачен {new Date(bill.paid_at).toLocaleDateString("ru-RU")}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {bill.status === "pending" && (
                                <button
                                  onClick={() => handlePayBill(bill.id)}
                                  disabled={payingBillId === bill.id}
                                  className="rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50"
                                  style={{ background: "#51cf66" }}
                                >
                                  {payingBillId === bill.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Оплатить"}
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteBillId(bill.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-red-500/20"
                                style={{ color: "var(--text-muted)" }}
                                title="Удалить счёт"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === "meters" && (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowCreateMeter(true)
                      setNewMeterType("electricity")
                      setNewMeterNumber("")
                      setNewMeterLocation("")
                    }}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold text-white"
                    style={primaryBtn}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Добавить счетчик
                  </button>
                </div>
                {meters.length === 0 ? (
                  <div className="glass-card flex h-[40vh] flex-col items-center justify-center gap-3">
                    <FileText className="h-12 w-12" style={{ color: "var(--primary-lightest)" }} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Нет счетчиков</p>
                    <button
                      onClick={() => setShowCreateMeter(true)}
                      className="mt-1 flex items-center gap-1 rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-white"
                      style={primaryBtn}
                    >
                      <Plus className="h-3 w-3" />
                      Добавить счетчик
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {meters.map((meter) => {
                      const Icon = getMeterIcon(meter.meter_type)
                      return (
                        <div key={meter.id} className="glass-card" style={{ padding: 16 }}>
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]" style={{ background: "var(--primary-wash)" }}>
                              <Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setReadingMeterId(meter.id)
                                  setReadingValue("")
                                  setShowReading(true)
                                }}
                                className="rounded-[var(--radius-sm)] py-2 px-2 text-xs font-medium transition-colors hover:bg-white/40"
                                style={{ color: "var(--primary)" }}
                              >
                                Показания
                              </button>
                              <button
                                onClick={() => setDeleteMeterId(meter.id)}
                                className="rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-red-50"
                                style={{ color: "#ff6b6b" }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                            {getMeterLabel(meter.meter_type)}
                          </h3>
                          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>№ {meter.meter_number}</p>
                          {meter.location && (
                            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{meter.location}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {showCreateMeter && (
        <div className="overlay-blur fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateMeter(false)}>
          <div className="glass-dialog w-full max-w-md rounded-[var(--radius-2xl)] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Добавить счетчик</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Тип</label>
                <select
                  value={newMeterType}
                  onChange={(e) => setNewMeterType(e.target.value)}
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  {METER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Номер счетчика</label>
                <input
                  value={newMeterNumber}
                  onChange={(e) => setNewMeterNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateMeter()}
                  placeholder="Например: 12345678"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Расположение</label>
                <input
                  value={newMeterLocation}
                  onChange={(e) => setNewMeterLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateMeter()}
                  placeholder="Квартира, адрес"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreateMeter(false)} className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium hover:bg-white/40" style={{ color: "var(--text-secondary)" }}>Отмена</button>
              <button onClick={handleCreateMeter} disabled={!newMeterNumber.trim() || creatingMeter} className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white disabled:opacity-50" style={primaryBtn}>
                {creatingMeter ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateBill && (
        <div className="overlay-blur fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateBill(false)}>
          <div className="glass-dialog w-full max-w-lg rounded-[var(--radius-2xl)] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Рассчитать счёт</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Счёт по счётчику за период</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Счетчик</label>
                <select
                  value={calcMeterId ?? ""}
                  onChange={(e) => setCalcMeterId(e.target.value ? Number(e.target.value) : null)}
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  {meters.map((m) => (
                    <option key={m.id} value={m.id}>{getMeterLabel(m.meter_type)} — {m.meter_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Период</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date()
                        const start = new Date(now.getFullYear(), now.getMonth(), 1)
                        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                        setCalcPeriodStart(start.toISOString().slice(0, 10))
                        setCalcPeriodEnd(end.toISOString().slice(0, 10))
                      }}
                      className="text-[11px] font-medium transition-colors hover:opacity-80"
                      style={{ color: "var(--primary)" }}
                    >
                      Этот месяц
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date()
                        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                        const end = new Date(now.getFullYear(), now.getMonth(), 0)
                        setCalcPeriodStart(start.toISOString().slice(0, 10))
                        setCalcPeriodEnd(end.toISOString().slice(0, 10))
                      }}
                      className="text-[11px] font-medium transition-colors hover:opacity-80"
                      style={{ color: "var(--primary)" }}
                    >
                      Прошлый
                    </button>
                  </div>
                </div>
                <div className="rdp-wrapper rounded-[var(--radius-md)] border p-3" style={{ background: "var(--background-warm)", borderColor: "var(--border)" }}>
                  <DayPicker
                    mode="range"
                    defaultMonth={calcPeriodStart ? new Date(calcPeriodStart + "T12:00:00") : new Date()}
                    selected={{
                      from: calcPeriodStart ? new Date(calcPeriodStart + "T12:00:00") : undefined,
                      to: calcPeriodEnd ? new Date(calcPeriodEnd + "T12:00:00") : undefined,
                    }}
                    disabled={{ after: (() => {
                      const t = new Date()
                      return new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)
                    })() }}
                    onSelect={(range) => {
                      const fromStr = range?.from ? dateToYYYYMMDD(range.from) : ""
                      const toStr = range?.to ? dateToYYYYMMDD(range.to) : ""
                      const hasFullRange = !!(calcPeriodStart && calcPeriodEnd)
                      const newIsPartial = !!(fromStr && !toStr) || (fromStr && toStr && fromStr === toStr)
                      if (hasFullRange && newIsPartial) {
                        const a = calcPeriodStart!
                        const b = calcPeriodEnd!
                        const low = a <= b ? a : b
                        const high = a <= b ? b : a
                        const clicked = fromStr
                        if (clicked >= low && clicked <= high) return
                      }
                      if (range?.from) setCalcPeriodStart(fromStr)
                      else setCalcPeriodStart("")
                      if (range?.to) setCalcPeriodEnd(toStr)
                      else setCalcPeriodEnd(range?.from ? fromStr : "")
                    }}
                  />
                </div>
                {(calcPeriodStart || calcPeriodEnd) && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Calendar className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span>
                      {calcPeriodStart && new Date(calcPeriodStart + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                      {calcPeriodStart && calcPeriodEnd && " — "}
                      {calcPeriodEnd && new Date(calcPeriodEnd + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Тариф (₸ за ед.)</label>
                <input
                  value={calcRate}
                  onChange={(e) => setCalcRate(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateBill()}
                  placeholder="Например: 25.5"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Сумма к оплате (₸)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateBill()}
                  placeholder="Опционально — иначе из расчёта"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCreateBill(false)} className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium hover:bg-white/40" style={{ color: "var(--text-secondary)" }}>Отмена</button>
              <button
                onClick={handleCreateBill}
                disabled={!calcMeterId || !calcPeriodStart || !calcPeriodEnd || !calcRate.trim() || creatingBill}
                className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white disabled:opacity-50"
                style={primaryBtn}
              >
                {creatingBill ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Рассчитать"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReading && readingMeterId != null && (
        <div className="overlay-blur fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowReading(false)}>
          <div className="glass-dialog w-full max-w-md rounded-[var(--radius-2xl)] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Внести показания</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {getMeterLabel(meters.find((m) => m.id === readingMeterId)?.meter_type ?? "")}
            </p>
            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Показание</label>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitReading()}
                placeholder="Например: 1234.5"
                className="glass-input h-11 w-full px-3 text-sm"
                style={{ color: "var(--foreground)" }}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowReading(false)} className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium hover:bg-white/40" style={{ color: "var(--text-secondary)" }}>Отмена</button>
              <button onClick={handleSubmitReading} disabled={!readingValue.trim() || submittingReading} className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white disabled:opacity-50" style={primaryBtn}>
                {submittingReading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Внести"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteMeterId !== null}
        onClose={() => setDeleteMeterId(null)}
        onConfirm={handleDeleteMeter}
        title="Удалить счетчик"
        message={`Удалить счетчик "${meters.find((m) => m.id === deleteMeterId)?.meter_number ?? ""}"?`}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        loading={deletingMeter}
      />

      <ConfirmDialog
        open={deleteBillId !== null}
        onClose={() => setDeleteBillId(null)}
        onConfirm={handleDeleteBill}
        title="Удалить счёт"
        message={deleteBillId != null ? `Удалить счёт на ${(bills.find((b) => b.id === deleteBillId)?.amount ?? 0).toFixed(2)} ₸?` : ""}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        loading={deletingBill}
      />

      <MobileNav />
    </div>
  )
}
