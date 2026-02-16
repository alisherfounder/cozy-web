"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, type DeviceResponse, type EventLogResponse } from "@/lib/api"
import {
  ArrowLeft, Settings as SettingsIcon, Loader2, Wifi, WifiOff,
  Smartphone, Bell, Lock, User, Trash2, Edit3, Plus, FileText, Send, ExternalLink, Map
} from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

const DEVICE_TYPES = [
  { value: "light", label: "Свет" },
  { value: "camera", label: "Камера" },
  { value: "switch", label: "Выключатель" },
  { value: "thermostat", label: "Термостат" },
  { value: "sensor", label: "Датчик" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<DeviceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'devices' | 'notifications' | 'account' | 'logs'>('devices')

  const [editingDevice, setEditingDevice] = useState<DeviceResponse | null>(null)
  const [editName, setEditName] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [updating, setUpdating] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState("light")
  const [newLocation, setNewLocation] = useState("")
  const [creating, setCreating] = useState(false)

  const [logs, setLogs] = useState<EventLogResponse[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsLimit] = useState(100)

  useEffect(() => {
    loadDevices()
  }, [])

  useEffect(() => {
    if (activeSection !== 'logs') return
    loadLogs(false)
    const interval = setInterval(() => loadLogs(true), 5000)
    return () => clearInterval(interval)
  }, [activeSection])

  async function loadLogs(silent = false) {
    if (!silent) setLogsLoading(true)
    try {
      const data = await api.events.recent(logsLimit)
      setLogs(data)
    } catch (e) {
      console.error("loadLogs", e)
      setLogs([])
    } finally {
      if (!silent) setLogsLoading(false)
    }
  }

  async function loadDevices() {
    try {
      const data = await api.devices.list()
      setDevices(data)
    } catch (e) {
      console.error("loadDevices", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(deviceId: number) {
    if (!confirm("Удалить это устройство?")) return
    try {
      await api.devices.delete(deviceId)
      setDevices((prev) => prev.filter((d) => d.id !== deviceId))
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось удалить"}`)
    }
  }

  function openEdit(device: DeviceResponse) {
    setEditingDevice(device)
    setEditName(device.name)
    setEditLocation(device.location ?? "")
  }

  async function handleUpdate() {
    if (!editingDevice) return
    const name = editName.trim()
    if (!name) return
    setUpdating(true)
    try {
      await api.devices.update(editingDevice.id, {
        name,
        location: editLocation.trim() || null,
      })
      setDevices((prev) =>
        prev.map((d) =>
          d.id === editingDevice.id
            ? { ...d, name, location: editLocation.trim() || null }
            : d
        )
      )
      setEditingDevice(null)
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось сохранить"}`)
    } finally {
      setUpdating(false)
    }
  }

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const device = await api.devices.create({
        name,
        device_type: newType,
        location: newLocation.trim() || undefined,
      })
      setDevices((prev) => [...prev, device])
      setShowCreate(false)
      setNewName("")
      setNewType("light")
      setNewLocation("")
    } catch (e) {
      alert(`Ошибка: ${e instanceof Error ? e.message : "Не удалось добавить"}`)
    } finally {
      setCreating(false)
    }
  }

  const sections = [
    { id: 'devices' as const, label: 'Устройства', icon: Smartphone },
    { id: 'notifications' as const, label: 'Уведомления', icon: Bell },
    { id: 'account' as const, label: 'Аккаунт', icon: User },
    { id: 'logs' as const, label: 'Журнал событий', icon: FileText },
  ]

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
              <SettingsIcon className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="font-logo text-xl tracking-tight" style={{ color: "var(--primary)" }}>
              Настройки
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 sm:px-6 md:py-8 md:pb-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card" style={{ padding: 16 }}>
              <nav className="space-y-1">
                {sections.map(section => {
                  const Icon = section.icon
                  const isActive = activeSection === section.id

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm transition-colors"
                      style={{
                        background: isActive ? "var(--primary-wash)" : "transparent",
                        color: isActive ? "var(--primary)" : "var(--text-secondary)",
                        fontWeight: isActive ? 600 : 400
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {(loading && activeSection === 'devices') || (logsLoading && activeSection === 'logs') ? (
              <div className="glass-card flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary-lighter)" }} />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Devices Section */}
                {activeSection === 'devices' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                          Устройства
                        </h2>
                        <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          Управление подключенными устройствами
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-xs font-semibold text-white"
                        style={{ background: "var(--primary)" }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Добавить
                      </button>
                    </div>

                    <div className="space-y-3">
                      {devices.map(device => (
                        <div key={device.id} className="glass-card" style={{ padding: 16 }}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                  {device.name}
                                </h3>
                                <div
                                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                  style={{
                                    background: device.status === 'online' ? '#51cf6620' : 'var(--surface-muted)',
                                    color: device.status === 'online' ? '#51cf66' : 'var(--text-muted)'
                                  }}
                                >
                                  {device.status === 'online' ? (
                                    <Wifi className="h-2.5 w-2.5" />
                                  ) : (
                                    <WifiOff className="h-2.5 w-2.5" />
                                  )}
                                  {device.status === 'online' ? 'Онлайн' : 'Офлайн'}
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                  Тип: {device.device_type}
                                </p>
                                {device.location && (
                                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Локация: {device.location}
                                  </p>
                                )}
                                {device.gpio_pin && (
                                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    GPIO: {device.gpio_pin}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEdit(device)}
                                className="rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-white/40"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(device.id)}
                                className="rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-red-50"
                                style={{ color: "#ff6b6b" }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {devices.length === 0 && (
                        <div className="glass-card flex h-[40vh] flex-col items-center justify-center gap-3">
                          <Smartphone className="h-12 w-12" style={{ color: "var(--primary-lightest)" }} />
                          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Нет подключенных устройств
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                        Уведомления
                      </h2>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        Настройка push-уведомлений и оповещений
                      </p>
                    </div>

                    <div className="glass-card" style={{ padding: 20 }}>
                      <a
                        href="https://t.me/cozy_smart_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] px-3 py-3 transition-colors hover:bg-white/40"
                        style={{ marginBottom: 16 }}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                            style={{ background: "var(--primary-wash)" }}
                          >
                            <Send className="h-5 w-5" style={{ color: "var(--primary)" }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                              Telegram-бот
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                              Уведомления и управление домом через @cozy_smart_bot
                            </p>
                          </div>
                        </div>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium" style={{ color: "var(--primary)" }}>
                          Перейти в бот
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      </a>

                      <div className="space-y-4">
                        {[
                          { label: 'Push-уведомления', description: 'Получать уведомления на телефон', enabled: true },
                          { label: 'Email-уведомления', description: 'Получать уведомления на почту', enabled: false },
                          { label: 'Критичные события', description: 'Оповещения о критичных событиях', enabled: true },
                          { label: 'Звуковые оповещения', description: 'Звуковое сопровождение уведомлений', enabled: true },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                                {item.label}
                              </p>
                              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                                {item.description}
                              </p>
                            </div>
                            <button
                              className="relative h-6 w-11 rounded-full transition-colors"
                              style={{ background: item.enabled ? "var(--primary)" : "var(--surface-muted)" }}
                            >
                              <div
                                className="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform"
                                style={{ transform: item.enabled ? 'translateX(22px)' : 'translateX(4px)' }}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Logs Section */}
                {activeSection === 'logs' && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                        Журнал событий
                      </h2>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        Последние события в системе (обновляется автоматически)
                      </p>
                    </div>

                    <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {logs.length === 0 && !logsLoading ? (
                          <div className="flex flex-col items-center justify-center gap-3 py-12">
                            <FileText className="h-10 w-10" style={{ color: "var(--primary-lightest)" }} />
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                              Нет записей
                            </p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-black/5 dark:divide-white/5">
                            {logs.map((log) => (
                              <li key={log.id} className="px-4 py-3 text-left">
                                <div className="flex flex-wrap items-baseline gap-2">
                                  <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
                                    {new Date(log.timestamp).toLocaleString("ru", { timeZone: "Asia/Almaty" })}
                                  </span>
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                                    style={{
                                      background: log.status === "success" ? "#51cf6620" : log.status === "error" ? "#ff6b6b20" : "var(--surface-muted)",
                                      color: log.status === "success" ? "#51cf66" : log.status === "error" ? "#ff6b6b" : "var(--text-muted)",
                                    }}
                                  >
                                    {log.status}
                                  </span>
                                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                                    {log.event_category}
                                  </span>
                                  {log.event_type && (
                                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                      {log.event_type}
                                    </span>
                                  )}
                                  {log.event_action && (
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                      · {log.event_action}
                                    </span>
                                  )}
                                </div>
                                {(log.description ?? log.target_name ?? log.error_message) && (
                                  <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                                    {log.description ?? log.target_name ?? log.error_message}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Section */}
                {activeSection === 'account' && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                        Аккаунт
                      </h2>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        Управление учетной записью и безопасностью
                      </p>
                    </div>

                    <div className="glass-card" style={{ padding: 20 }}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                            style={{ background: "var(--primary)", color: "white" }}
                          >
                            П
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                              Пользователь
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                              user@cozy.home
                            </p>
                            <Link
                              href="/floor-plan"
                              className="mt-2 flex items-center gap-2 text-xs font-medium transition-colors hover:opacity-80"
                              style={{ color: "var(--primary)" }}
                            >
                              <Map className="h-3.5 w-3.5" />
                              План помещений
                            </Link>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4">
                          {[
                            { label: 'Изменить пароль', icon: Lock },
                            { label: 'Двухфакторная аутентификация', icon: Smartphone },
                            { label: 'Выйти из аккаунта', icon: User },
                          ].map((item) => {
                            const Icon = item.icon
                            return (
                              <button
                                key={item.label}
                                className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-colors hover:bg-white/40"
                              >
                                <Icon className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
                                <span className="text-sm" style={{ color: "var(--foreground)" }}>
                                  {item.label}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {editingDevice && (
        <div
          className="overlay-blur fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingDevice(null)}
        >
          <div
            className="glass-dialog w-full max-w-md rounded-[var(--radius-2xl)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Редактировать устройство
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {editingDevice.device_type}
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Название</label>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  placeholder="Название"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Расположение</label>
                <input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  placeholder="Комната или зона"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingDevice(null)} className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium hover:bg-white/40" style={{ color: "var(--text-secondary)" }}>Отмена</button>
              <button onClick={handleUpdate} disabled={updating} className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white disabled:opacity-50" style={{ background: "var(--primary)" }}>
                {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div
          className="overlay-blur fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => { setShowCreate(false); setNewName(""); setNewType("light"); setNewLocation("") }}
        >
          <div
            className="glass-dialog w-full max-w-md rounded-[var(--radius-2xl)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Добавить устройство</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Новое устройство в системе</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Название</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Например: Свет в кухне"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Тип</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  {DEVICE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Расположение</label>
                <input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Комната или зона"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowCreate(false); setNewName(""); setNewType("light"); setNewLocation("") }} className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium hover:bg-white/40" style={{ color: "var(--text-secondary)" }}>Отмена</button>
              <button onClick={handleCreate} disabled={!newName.trim() || creating} className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white disabled:opacity-50" style={{ background: "var(--primary)" }}>
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  )
}
