"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type DeviceResponse } from "@/lib/api"
import { Zap, ArrowLeft, Camera, Video, Loader2, Power, PowerOff, Settings as SettingsIcon } from "lucide-react"
import { LiveCameraStream } from "@/components/live-camera-stream"

export default function CamerasPage() {
  const router = useRouter()
  const [cameras, setCameras] = useState<DeviceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [controllingId, setControllingId] = useState<number | null>(null)
  const [streamingCameras, setStreamingCameras] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadCameras()
  }, [])

  const loadCameras = async () => {
    try {
      const devices = await api.devices.list()
      const cameraDevices = devices.filter(d => d.device_type === 'camera')
      setCameras(cameraDevices)
    } catch (error) {
      console.error('Failed to load cameras:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCamera = async (camera: DeviceResponse) => {
    setControllingId(camera.id)
    try {
      const isOn = (camera.state?.on as boolean) ?? false
      await api.devices.control(camera.id, {
        action: isOn ? 'turn_off' : 'turn_on',
        parameters: {}
      })
      // Reload cameras to get updated state
      await loadCameras()
    } catch (error) {
      console.error('Failed to control camera:', error)
      alert(`Ошибка управления камерой: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setControllingId(null)
    }
  }

  const startStreaming = async (camera: DeviceResponse) => {
    try {
      await api.cameras.startStream(camera.id)
      setStreamingCameras(prev => new Set(prev).add(camera.id))
      await loadCameras()
    } catch (error) {
      console.error('Failed to start stream:', error)
      alert(`Ошибка запуска стрима: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  const stopStreaming = async (camera: DeviceResponse) => {
    try {
      await api.cameras.stopStream(camera.id)
      setStreamingCameras(prev => {
        const newSet = new Set(prev)
        newSet.delete(camera.id)
        return newSet
      })
      await loadCameras()
    } catch (error) {
      console.error('Failed to stop stream:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--background)" }}>
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
              <Video className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="font-logo text-xl tracking-tight" style={{ color: "var(--primary)" }}>
              Камеры
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8">
        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary-lighter)" }} />
          </div>
        ) : cameras.length === 0 ? (
          <div className="glass-card flex h-[60vh] flex-col items-center justify-center gap-3">
            <Camera className="h-12 w-12" style={{ color: "var(--primary-lightest)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Нет подключенных камер
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-1 rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-white"
              style={{ background: "var(--primary)" }}
            >
              Добавить устройство
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cameras.map(camera => {
              const isOn = (camera.state?.on as boolean) ?? false
              const isControlling = controllingId === camera.id
              const isStreaming = streamingCameras.has(camera.id) || ((camera.state?.streaming as boolean) ?? false)

              return (
                <div
                  key={camera.id}
                  className="glass-card overflow-hidden"
                  style={{ padding: 0 }}
                >
                  {/* Camera Preview */}
                  <div
                    className="relative"
                    style={{ aspectRatio: '16/9' }}
                  >
                    {isStreaming ? (
                      <LiveCameraStream
                        streamUrl={api.cameras.getStreamUrl(camera.id)}
                        cameraName={camera.name}
                        autoStart={true}
                        onError={(err) => console.error('Stream error:', err)}
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{
                          background: isOn ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--surface-muted)',
                        }}
                      >
                        {isOn ? (
                          <div className="flex flex-col items-center gap-2">
                            <Video className="h-12 w-12 text-white/80" />
                            <span className="text-xs text-white/60">Готово к трансляции</span>
                          </div>
                        ) : (
                          <Camera className="h-12 w-12" style={{ color: "var(--text-muted)" }} />
                        )}

                        {/* Status badge */}
                        <div
                          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            background: camera.status === 'online' ? '#51cf66' : 'var(--text-muted)',
                            color: 'white'
                          }}
                        >
                          {camera.status === 'online' ? 'Онлайн' : 'Офлайн'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Camera Info */}
                  <div style={{ padding: 16 }}>
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          {camera.name}
                        </h3>
                        {camera.location && (
                          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                            {camera.location}
                          </p>
                        )}
                      </div>
                      <button
                        className="rounded-[var(--radius-sm)] p-1.5 transition-colors hover:bg-white/40"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <SettingsIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Control Button */}
                    <button
                      onClick={() => toggleCamera(camera)}
                      disabled={isControlling || camera.status !== 'online'}
                      className="w-full rounded-[var(--radius-md)] py-2.5 text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: isOn ? "#51cf66" : "var(--primary-wash)",
                        color: isOn ? "white" : "#51cf66"
                      }}
                    >
                      {isControlling ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {isOn ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                          {isOn ? 'Выключить' : 'Включить'}
                        </div>
                      )}
                    </button>

                    {/* Stream Control Buttons */}
                    <div className="mt-2 flex gap-2">
                      {isStreaming ? (
                        <button
                          onClick={() => stopStreaming(camera)}
                          className="flex-1 rounded-[var(--radius-md)] py-2.5 text-xs font-semibold"
                          style={{ background: "#ef4444", color: "white" }}
                        >
                          Остановить стрим
                        </button>
                      ) : (
                        <button
                          onClick={() => startStreaming(camera)}
                          disabled={camera.status !== 'online'}
                          className="flex-1 rounded-[var(--radius-md)] py-2.5 text-xs font-semibold disabled:opacity-50"
                          style={{ background: "#8b5cf6", color: "white" }}
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
    </div>
  )
}
