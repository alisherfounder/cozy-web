"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type DeviceResponse } from "@/lib/api"
import {
  ArrowLeft,
  Camera,
  Video,
  Loader2,
  Power,
  PowerOff,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react"
import { LiveCameraStream } from "@/components/live-camera-stream"
import { MobileNav } from "@/components/mobile-nav"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function CamerasPage() {
  const router = useRouter()
  const [cameras, setCameras] = useState<DeviceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [controllingId, setControllingId] = useState<number | null>(null)
  const [streamingCameras, setStreamingCameras] = useState<Set<number>>(new Set())

  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createLocation, setCreateLocation] = useState("")
  const [createIp, setCreateIp] = useState("")
  const [creating, setCreating] = useState(false)

  const [editingCamera, setEditingCamera] = useState<DeviceResponse | null>(null)
  const [editName, setEditName] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [updating, setUpdating] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadCameras()
  }, [])

  const loadCameras = async () => {
    try {
      const devices = await api.devices.list()
      const cameraDevices = devices.filter((d) => d.device_type === "camera")
      setCameras(cameraDevices)
    } catch (error) {
      console.error("Failed to load cameras:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!createName.trim()) return
    setCreating(true)
    try {
      const device = await api.devices.create({
        name: createName.trim(),
        device_type: "camera",
        location: createLocation.trim() || undefined,
      })
      if (createIp.trim()) {
        const cleanIp = createIp.trim().split(":")[0]
        await api.devices.update(device.id, {
          state: {
            mac_stream_url: `http://${cleanIp}:5003/stream`,
            on: false,
            streaming: false,
          },
        })
      }
      await loadCameras()
      setShowCreate(false)
      setCreateName("")
      setCreateLocation("")
      setCreateIp("")
    } catch (error) {
      console.error("Failed to create camera:", error)
      alert(`Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`)
    } finally {
      setCreating(false)
    }
  }

  const openEdit = (camera: DeviceResponse) => {
    setEditingCamera(camera)
    setEditName(camera.name)
    setEditLocation(camera.location ?? "")
  }

  const handleUpdate = async () => {
    if (!editingCamera) return
    setUpdating(true)
    try {
      await api.devices.update(editingCamera.id, {
        name: editName.trim() || editingCamera.name,
        location: editLocation.trim() || null,
      })
      await loadCameras()
      setEditingCamera(null)
    } catch (error) {
      console.error("Failed to update camera:", error)
      alert(`Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await api.devices.delete(deleteId)
      setStreamingCameras((prev) => {
        const next = new Set(prev)
        next.delete(deleteId)
        return next
      })
      await loadCameras()
      setDeleteId(null)
    } catch (error) {
      console.error("Failed to delete camera:", error)
      alert(`Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`)
    } finally {
      setDeleting(false)
    }
  }

  const toggleCamera = async (camera: DeviceResponse) => {
    setControllingId(camera.id)
    try {
      const isOn = (camera.state?.on as boolean) ?? false
      await api.devices.control(camera.id, {
        action: isOn ? "turn_off" : "turn_on",
        parameters: {},
      })
      await loadCameras()
    } catch (error) {
      console.error("Failed to control camera:", error)
      alert(`Ошибка управления камерой: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`)
    } finally {
      setControllingId(null)
    }
  }

  const startStreaming = async (camera: DeviceResponse) => {
    try {
      await api.cameras.startStream(camera.id)
      setStreamingCameras((prev) => new Set(prev).add(camera.id))
      await loadCameras()
    } catch (error) {
      console.error("Failed to start stream:", error)
      alert(`Ошибка запуска стрима: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`)
    }
  }

  const stopStreaming = async (camera: DeviceResponse) => {
    try {
      await api.cameras.stopStream(camera.id)
      setStreamingCameras((prev) => {
        const next = new Set(prev)
        next.delete(camera.id)
        return next
      })
      await loadCameras()
    } catch (error) {
      console.error("Failed to stop stream:", error)
    }
  }

  const primaryButtonStyle = {
    background: "var(--primary)",
    color: "white",
    boxShadow: "0 4px 14px rgba(174, 87, 72, 0.25)",
  }
  const secondaryButtonStyle = {
    background: "var(--primary-wash)",
    color: "var(--primary)",
  }
  const dangerSolidStyle = {
    background: "#b91c1c",
    color: "white",
  }

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
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: "var(--primary-wash)" }}
            >
              <Video className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-base font-semibold tracking-tight sm:text-xl" style={{ color: "var(--foreground)" }}>
              Камеры
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] sm:px-4"
            style={primaryButtonStyle}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Добавить камеру</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 sm:px-6 md:py-8 md:pb-8">
        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary-lighter)" }} />
          </div>
        ) : cameras.length === 0 ? (
          <div className="glass-card flex h-[50vh] flex-col items-center justify-center gap-3">
            <Camera className="h-12 w-12" style={{ color: "var(--primary-lightest)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Нет подключенных камер
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-1 rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={primaryButtonStyle}
            >
              Добавить камеру
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {cameras.map((camera) => {
              const isOn = (camera.state?.on as boolean) ?? false
              const isControlling = controllingId === camera.id
              const isStreaming =
                streamingCameras.has(camera.id) || ((camera.state?.streaming as boolean) ?? false)

              return (
                <div key={camera.id} className="glass-card overflow-hidden" style={{ padding: 0 }}>
                  <div className="relative" style={{ aspectRatio: "16/9" }}>
                    {isStreaming ? (
                      <LiveCameraStream
                        streamUrl={api.cameras.getStreamUrl(camera.id)}
                        cameraName={camera.name}
                        autoStart={true}
                        onError={(err) => console.error("Stream error:", err)}
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{
                          background: isOn
                            ? "linear-gradient(135deg, rgba(174,87,72,0.08) 0%, rgba(174,87,72,0.04) 100%)"
                            : "var(--primary-wash)",
                        }}
                      >
                        {isOn ? (
                          <div className="flex flex-col items-center gap-2">
                            <Video
                              className="h-10 w-10 sm:h-12 sm:w-12"
                              style={{ color: "var(--primary-lighter)" }}
                            />
                            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                              Готово к трансляции
                            </span>
                          </div>
                        ) : (
                          <Camera
                            className="h-10 w-10 sm:h-12 sm:w-12"
                            style={{ color: "var(--primary-lightest)" }}
                          />
                        )}

                        <div
                          className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background: camera.status === "online" ? "#51cf66" : "var(--text-muted)",
                            color: "white",
                          }}
                        >
                          {camera.status === "online" ? "Онлайн" : "Офлайн"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="mb-2.5 flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          {camera.name}
                        </h3>
                        {camera.location && (
                          <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-muted)" }}>
                            {camera.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => openEdit(camera)}
                          className="rounded-[var(--radius-sm)] p-1.5 transition-colors hover:bg-white/40"
                          style={{ color: "var(--text-secondary)" }}
                          aria-label="Настройки"
                        >
                          <SettingsIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(camera.id)}
                          className="rounded-[var(--radius-sm)] p-1.5 transition-colors hover:bg-white/40"
                          style={{ color: "var(--text-muted)" }}
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleCamera(camera)}
                      disabled={isControlling || camera.status !== "online"}
                      className="w-full rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-all disabled:opacity-50 sm:py-2.5"
                      style={
                        isOn
                          ? { ...secondaryButtonStyle, color: "white", background: "var(--primary)" }
                          : secondaryButtonStyle
                      }
                    >
                      {isControlling ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {isOn ? (
                            <PowerOff className="h-3.5 w-3.5" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}
                          {isOn ? "Выключить" : "Включить"}
                        </div>
                      )}
                    </button>

                    <div className="mt-2 flex gap-2">
                      {isStreaming ? (
                        <button
                          onClick={() => stopStreaming(camera)}
                          className="flex-1 rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-all hover:opacity-90 sm:py-2.5"
                          style={dangerSolidStyle}
                        >
                          Остановить стрим
                        </button>
                      ) : (
                        <button
                          onClick={() => startStreaming(camera)}
                          disabled={camera.status !== "online"}
                          className="flex-1 rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-all disabled:opacity-50 hover:opacity-90 sm:py-2.5"
                          style={primaryButtonStyle}
                        >
                          Запустить стрим
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <div
          className="overlay-blur fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowCreate(false)
            setCreateName("")
            setCreateLocation("")
            setCreateIp("")
          }}
        >
          <div
            className="glass-dialog w-full max-w-md rounded-[var(--radius-2xl)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Добавить камеру
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              Зарегистрировать новую камеру в системе
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Название
                </label>
                <input
                  autoFocus
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Например: Кухня"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Расположение <span style={{ color: "var(--text-muted)" }}>(необязательно)</span>
                </label>
                <input
                  value={createLocation}
                  onChange={(e) => setCreateLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Комната или зона"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  IP-адрес <span style={{ color: "var(--text-muted)" }}>(необязательно)</span>
                </label>
                <input
                  value={createIp}
                  onChange={(e) => setCreateIp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="192.168.1.1 или 192.168.1.1:5003"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreate(false)
                  setCreateName("")
                  setCreateLocation("")
                  setCreateIp("")
                }}
                className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors hover:bg-white/40"
                style={{ color: "var(--text-secondary)" }}
              >
                Отмена
              </button>
              <button
                onClick={handleCreate}
                disabled={!createName.trim() || creating}
                className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                style={primaryButtonStyle}
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCamera && (
        <div
          className="overlay-blur fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingCamera(null)}
        >
          <div
            className="glass-dialog w-full max-w-md rounded-[var(--radius-2xl)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              Редактировать камеру
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {editingCamera.name}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Название
                </label>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  placeholder="Название камеры"
                  className="glass-input h-11 w-full px-3 text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Расположение
                </label>
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
              <button
                onClick={() => setEditingCamera(null)}
                className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors hover:bg-white/40"
                style={{ color: "var(--text-secondary)" }}
              >
                Отмена
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                style={primaryButtonStyle}
              >
                {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить камеру"
        message={`Удалить камеру "${cameras.find((c) => c.id === deleteId)?.name ?? ""}"? Устройство будет отключено от системы.`}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        loading={deleting}
      />

      <MobileNav />
    </div>
  )
}
