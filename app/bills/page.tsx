"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type UtilityMeterResponse, type UtilityBillResponse, type UtilityStatsResponse } from "@/lib/api"
import {
  Zap, ArrowLeft, CreditCard, Loader2, Droplet, Zap as Lightning,
  Flame, Plus, FileText, CheckCircle2, Clock, AlertCircle
} from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export default function BillsPage() {
  const router = useRouter()
  const [meters, setMeters] = useState<UtilityMeterResponse[]>([])
  const [bills, setBills] = useState<UtilityBillResponse[]>([])
  const [stats, setStats] = useState<UtilityStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [payingBillId, setPayingBillId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'bills' | 'meters'>('bills')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [metersData, billsData, statsData] = await Promise.all([
        api.utilities.meters(),
        api.utilities.bills(),
        api.utilities.stats()
      ])
      setMeters(metersData)
      setBills(billsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayBill = async (billId: number) => {
    setPayingBillId(billId)
    try {
      await api.utilities.payBill(billId, { payment_method: 'card' })
      await loadData()
    } catch (error) {
      console.error('Failed to pay bill:', error)
      alert(`Ошибка оплаты: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setPayingBillId(null)
    }
  }

  const getMeterIcon = (meterType: string) => {
    switch (meterType) {
      case 'electricity':
        return Lightning
      case 'water':
        return Droplet
      case 'gas':
        return Flame
      default:
        return FileText
    }
  }

  const getMeterLabel = (meterType: string) => {
    switch (meterType) {
      case 'electricity':
        return 'Электричество'
      case 'water':
        return 'Вода'
      case 'gas':
        return 'Газ'
      default:
        return meterType
    }
  }

  const getBillStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return CheckCircle2
      case 'pending':
        return Clock
      case 'overdue':
        return AlertCircle
      default:
        return FileText
    }
  }

  const getBillStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Оплачен'
      case 'pending':
        return 'Ожидает'
      case 'overdue':
        return 'Просрочен'
      default:
        return status
    }
  }

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#51cf66'
      case 'pending':
        return '#fab005'
      case 'overdue':
        return '#ff6b6b'
      default:
        return 'var(--text-muted)'
    }
  }

  return (
    <div className="bg-mesh-gradient flex min-h-screen flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-40 glass-heavy"
        style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] transition-colors hover:bg-white/60"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: "var(--primary-wash)" }}
            >
              <CreditCard className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="font-logo text-xl tracking-tight" style={{ color: "var(--primary)" }}>
              Оплата счетов
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 sm:px-6 md:py-8 md:pb-8">
        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary-lighter)" }} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <div className="glass-card" style={{ padding: 16 }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Счетчиков</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                    {stats.total_meters}
                  </p>
                </div>
                <div className="glass-card" style={{ padding: 16 }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>К оплате</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "#fab005" }}>
                    {stats.total_pending_amount.toFixed(2)} ₽
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {stats.pending_bills} счетов
                  </p>
                </div>
                <div className="glass-card" style={{ padding: 16 }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Оплачено</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "#51cf66" }}>
                    {stats.total_paid_amount.toFixed(2)} ₽
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {stats.paid_bills} счетов
                  </p>
                </div>
                <div className="glass-card" style={{ padding: 16 }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Всего счетов</p>
                  <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                    {stats.total_bills}
                  </p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('bills')}
                className="rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold transition-all"
                style={{
                  background: activeTab === 'bills' ? "var(--primary)" : "var(--surface-muted)",
                  color: activeTab === 'bills' ? "white" : "var(--text-secondary)"
                }}
              >
                Счета
              </button>
              <button
                onClick={() => setActiveTab('meters')}
                className="rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold transition-all"
                style={{
                  background: activeTab === 'meters' ? "var(--primary)" : "var(--surface-muted)",
                  color: activeTab === 'meters' ? "white" : "var(--text-secondary)"
                }}
              >
                Счетчики
              </button>
            </div>

            {/* Bills Tab */}
            {activeTab === 'bills' && (
              <div className="space-y-3">
                {bills.length === 0 ? (
                  <div className="glass-card flex h-[40vh] flex-col items-center justify-center gap-3">
                    <FileText className="h-12 w-12" style={{ color: "var(--primary-lightest)" }} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Нет счетов
                    </p>
                  </div>
                ) : (
                  bills.map(bill => {
                    const StatusIcon = getBillStatusIcon(bill.status)
                    const meter = meters.find(m => m.id === bill.meter_id)

                      return (
                      <div key={bill.id} className="glass-card" style={{ padding: 16 }}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                {meter ? getMeterLabel(meter.meter_type) : 'Счет'}
                              </h3>
                              <div
                                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{
                                  background: `${getBillStatusColor(bill.status)}20`,
                                  color: getBillStatusColor(bill.status)
                                }}
                              >
                                <StatusIcon className="h-2.5 w-2.5" />
                                {getBillStatusLabel(bill.status)}
                              </div>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Период: {new Date(bill.period_start).toLocaleDateString('ru-RU')} - {new Date(bill.period_end).toLocaleDateString('ru-RU')}
                              </p>
                              {meter && (
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                  Счетчик: {meter.meter_number}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <div className="sm:text-right">
                              <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                                {bill.amount.toFixed(2)} ₽
                              </p>
                              {bill.paid_at && (
                                <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                                  Оплачен {new Date(bill.paid_at).toLocaleDateString('ru-RU')}
                                </p>
                              )}
                            </div>

                            {bill.status === 'pending' && (
                              <button
                                onClick={() => handlePayBill(bill.id)}
                                disabled={payingBillId === bill.id}
                                className="rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50"
                                style={{ background: "#51cf66" }}
                              >
                                {payingBillId === bill.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Оплатить'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Meters Tab */}
            {activeTab === 'meters' && (
              <div className="space-y-3">
                {meters.length === 0 ? (
                  <div className="glass-card flex h-[40vh] flex-col items-center justify-center gap-3">
                    <FileText className="h-12 w-12" style={{ color: "var(--primary-lightest)" }} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Нет счетчиков
                    </p>
                    <button
                      className="mt-1 rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-white"
                      style={{ background: "var(--primary)" }}
                    >
                      <Plus className="mr-1 inline h-3 w-3" />
                      Добавить счетчик
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {meters.map(meter => {
                      const Icon = getMeterIcon(meter.meter_type)

                      return (
                        <div key={meter.id} className="glass-card" style={{ padding: 16 }}>
                          <div className="mb-3 flex items-start justify-between">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
                              style={{ background: "var(--primary-wash)" }}
                            >
                              <Icon className="h-5 w-5" style={{ color: "var(--primary)" }} />
                            </div>
                            <div
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{ background: "#51cf66", color: "white" }}
                            >
                              Активен
                            </div>
                          </div>

                          <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                            {getMeterLabel(meter.meter_type)}
                          </h3>
                          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                            № {meter.meter_number}
                          </p>
                          {meter.location && (
                            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                              {meter.location}
                            </p>
                          )}

                          <button
                            className="mt-3 w-full rounded-[var(--radius-sm)] py-2 text-xs font-medium transition-colors hover:bg-white/40"
                            style={{ color: "var(--primary)" }}
                          >
                            Внести показания
                          </button>
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

      <MobileNav />
    </div>
  )
}
