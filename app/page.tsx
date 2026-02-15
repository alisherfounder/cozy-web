"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Zap,
  ChevronRight,
  Loader2,
  LayoutGrid,
  Play,
  Pause,
  Thermometer,
  Sun,
  MessageCircle,
  Search,
  Maximize2,
  Pencil,
  X,
  Plus,
  Activity,
  Power,
  PowerOff,
  Lightbulb,
  TrendingUp,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Calendar,
  DoorOpen,
  DoorClosed,
  BarChart3,
  Sparkles,
  Plug,
  ScanLine,
  Camera,
  Lock,
  Tv,
  Volume2,
  ArrowUpDown,
  Fan,
  ShieldAlert,
  Box,
  Video,
  Map,
  CreditCard,
  Settings,
} from "lucide-react"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { api } from "@/lib/api"
import type { ScenarioResponse, DeviceResponse } from "@/lib/api"
import { usePreferences, type GridSize, GRID_SIZE_CONFIG } from "@/lib/preferences"
import { PreferencesButton } from "@/components/preferences-panel"
import { MobileNav } from "@/components/mobile-nav"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    month: "short",
    day: "numeric",
  })
}

const GRID_SIZES: GridSize[] = ["1x1", "2x1", "2x2"]

function getNextGridSize(current: GridSize): GridSize {
  const currentIndex = GRID_SIZES.indexOf(current)
  const nextIndex = (currentIndex + 1) % GRID_SIZES.length
  return GRID_SIZES[nextIndex]
}

function ScenarioCard({
  scenario,
  gridSize,
  onSizeChange,
  onClick,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  onToggle,
  isToggling,
}: {
  scenario: ScenarioResponse
  gridSize: GridSize
  onSizeChange: (size: GridSize) => void
  onClick: () => void
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
  onToggle?: () => void
  isToggling?: boolean
}) {
  const { w, h } = GRID_SIZE_CONFIG[gridSize]
  const isSmall = gridSize === "1x1"
  const isMedium = gridSize === "2x1"
  const isLarge = gridSize === "2x2"

  const handleSizeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSizeChange(getNextGridSize(gridSize))
  }

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle?.()
  }

  return (
    <div
      className="scenario-card-wrap relative shrink-0 sm:shrink-0"
      style={{
        width: w,
        height: h,
        transition: isDragging ? "none" : "width 0.3s cubic-bezier(.4,0,.2,1), height 0.3s cubic-bezier(.4,0,.2,1)",
        opacity: isDragging ? 0.5 : 1,
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        onDragStart?.()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragOver?.()
      }}
      onDragEnd={onDragEnd}
    >
      <div
        onClick={onClick}
        className="glass-card group relative flex h-full w-full flex-col overflow-hidden"
        style={{ padding: isLarge ? 24 : isSmall ? 16 : 20, cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="flex items-start justify-between">
          <button
            onClick={handleToggleClick}
            disabled={isToggling}
            className={`flex ${isLarge ? "h-12 w-12" : "h-9 w-9 sm:h-10 sm:w-10"} items-center justify-center rounded-[var(--radius-md)] transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{ background: scenario.is_active ? "var(--primary)" : "var(--primary-wash)" }}
            title={scenario.is_active ? "Остановить сценарий" : "Запустить сценарий"}
          >
            {isToggling ? (
              <Loader2 className={`${isLarge ? "h-5 w-5" : "h-4 w-4"} animate-spin`} style={{ color: scenario.is_active ? "white" : "var(--primary)" }} />
            ) : scenario.is_active ? (
              <Pause className={isLarge ? "h-5 w-5" : "h-4 w-4"} style={{ color: "white" }} />
            ) : (
              <Play className={isLarge ? "h-5 w-5" : "h-4 w-4"} style={{ color: "var(--primary)" }} />
            )}
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {scenario.is_template && (
              <span
                className={`rounded-[var(--radius-sm)] px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] ${isLarge ? "sm:text-xs" : ""} font-semibold`}
                style={{ background: "var(--primary-wash)", color: "var(--primary)" }}
              >
                Шаблон
              </span>
            )}
            <button
              onClick={handleSizeClick}
              className="hidden sm:block rounded-[var(--radius-sm)] p-1.5 transition-all hover:scale-110 hover:bg-white/60"
              style={{ color: "var(--primary)" }}
              title="Изменить размер"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <div
              className={`rounded-full ${isLarge ? "h-3 w-3" : "h-2 w-2 sm:h-2.5 sm:w-2.5"}`}
              style={{ background: scenario.is_active ? "#51cf66" : "var(--primary-lightest)" }}
            />
          </div>
        </div>

        <div className="mt-auto pt-2 sm:pt-3">
          <h3
            className={`font-semibold leading-tight text-xs sm:text-sm ${isLarge ? "sm:text-lg" : isMedium ? "sm:text-base" : ""}`}
            style={{ color: "var(--foreground)" }}
          >
            {scenario.name}
          </h3>
          {scenario.description && (
            <p className={`mt-1 sm:mt-2 line-clamp-2 text-[11px] sm:text-xs ${isLarge ? "sm:line-clamp-3 sm:text-sm" : ""} leading-relaxed`} style={{ color: "var(--text-muted)" }}>
              {scenario.description}
            </p>
          )}
          <div className="mt-2 sm:mt-3 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px]" style={{ color: "var(--text-muted)" }}>
              {formatDate(scenario.created_at)}
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5"
              style={{ color: "var(--primary-lightest)" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function DeviceControl({
  device,
  paramKey,
  label,
  icon: Icon,
  min,
  max,
  step,
  unit,
  color,
  editMode,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: {
  device: DeviceResponse
  paramKey: string
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  min: number
  max: number
  step: number
  unit: string
  color: string
  editMode?: boolean
  onRemove?: () => void
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
}) {
  const currentValue = (device.state?.[paramKey] as number) ?? min
  const [value, setValue] = useState(currentValue)
  const w = 267
  const h = 140

  useEffect(() => {
    setValue((device.state?.[paramKey] as number) ?? min)
  }, [device.state, paramKey, min])

  const handleChange = useCallback(async (newVal: number) => {
    setValue(newVal)
    try {
      await api.devices.control(device.id, {
        action: `set_${paramKey}`,
        parameters: { [paramKey]: newVal },
      })
    } catch {
      // silent
    }
  }, [device.id, paramKey])

  const displayValue = Math.round(value)
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div
      className="device-widget-wrap relative shrink-0 sm:shrink-0"
      style={{
        width: w,
        height: h,
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? "none" : "opacity 0.2s",
      }}
      draggable={editMode}
      onDragStart={(e) => {
        if (!editMode) return
        e.dataTransfer.effectAllowed = "move"
        onDragStart?.()
      }}
      onDragOver={(e) => {
        if (!editMode) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragOver?.()
      }}
      onDragEnd={onDragEnd}
    >
      <div
        className="glass-card flex h-full w-full flex-col justify-between overflow-hidden"
        style={{ padding: 16, cursor: editMode && !isDragging ? "grab" : editMode ? "grabbing" : "default" }}
      >
        {editMode && onRemove && (
          <button
            onClick={onRemove}
            className="absolute right-2 top-2 z-10 rounded-full p-1 transition-all hover:scale-110 hover:bg-red-50"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: color + "15" }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>{label}</div>
              <div className="truncate text-[10px] sm:text-[11px]" style={{ color: "var(--text-muted)" }}>{device.name}</div>
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1 shrink-0">
            <span className="font-bold tabular-nums text-xl sm:text-2xl" style={{ color }}>{displayValue}</span>
            <span className="font-medium text-[10px] sm:text-xs" style={{ color: "var(--text-muted)" }}>{unit}</span>
          </div>
        </div>
        <div className="relative mt-1 sm:mt-0">
          <div className="relative h-8 sm:h-10 flex items-center">
            <div className="h-1.5 sm:h-2 w-full rounded-full" style={{ background: "var(--primary-wash)" }}>
              <div className="h-full rounded-full transition-all duration-100" style={{ width: `${pct}%`, background: color }} />
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => handleChange(Number(e.target.value))}
              disabled={editMode}
              className="absolute inset-0 h-full w-full"
              style={{
                WebkitAppearance: "none",
                appearance: "none",
                background: "transparent",
                cursor: editMode ? "grab" : "pointer",
                pointerEvents: editMode ? "none" : "auto",
              }}
            />
          </div>
          <div className="flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span>{min}{unit}</span>
            <span>{max}{unit}</span>
          </div>
        </div>
      </div>
    </div>
  )
}


function SwitchControl({
  device,
  editMode,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: {
  device: DeviceResponse
  editMode?: boolean
  onRemove?: () => void
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
}) {
  const [isOn, setIsOn] = useState((device.state?.on as boolean) ?? false)
  const [loading, setLoading] = useState(false)
  const w = 267
  const h = 140

  const handleToggle = async () => {
    setLoading(true)
    try {
      console.log('Controlling device:', device.id, isOn ? 'turn_off' : 'turn_on')
      await api.devices.control(device.id, {
        action: isOn ? 'turn_off' : 'turn_on',
        parameters: {}
      })
      setIsOn(!isOn)
      console.log('Device controlled successfully')
    } catch (error) {
      console.error('Failed to control device:', error)
      alert(`Ошибка управления устройством: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="device-widget-wrap relative shrink-0 sm:shrink-0"
      style={{
        width: w,
        height: h,
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? "none" : "opacity 0.2s",
      }}
      draggable={editMode}
      onDragStart={(e) => {
        if (!editMode) return
        e.dataTransfer.effectAllowed = "move"
        onDragStart?.()
      }}
      onDragOver={(e) => {
        if (!editMode) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragOver?.()
      }}
      onDragEnd={onDragEnd}
    >
      <div
        className="glass-card flex h-full w-full flex-col justify-between overflow-hidden"
        style={{ padding: 16, cursor: editMode && !isDragging ? "grab" : editMode ? "grabbing" : "default" }}
      >
        {editMode && onRemove && (
          <button
            onClick={onRemove}
            className="absolute right-2 top-2 z-10 rounded-full p-1 transition-all hover:scale-110 hover:bg-red-50"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: isOn ? "#51cf6615" : "var(--primary-wash)" }}
            >
              <Plug className="h-4 w-4" style={{ color: isOn ? "#51cf66" : "var(--text-muted)" }} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {device.device_type === 'outlet' ? 'Розетка' : 'Выключатель'}
              </div>
              <div className="truncate text-[10px] sm:text-[11px]" style={{ color: "var(--text-muted)" }}>{device.name}</div>
            </div>
          </div>
          <div
            className={`rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${loading ? "animate-pulse" : ""}`}
            style={{ background: isOn ? "#51cf66" : "#94a3b8" }}
          />
        </div>

        <button
          onClick={handleToggle}
          disabled={editMode || loading}
          className="w-full rounded-[var(--radius-md)] py-2 sm:py-2.5 text-xs font-semibold transition-all disabled:opacity-50"
          style={{
            background: isOn ? "#51cf66" : "var(--primary-wash)",
            color: isOn ? "white" : "#51cf66"
          }}
        >
          {loading ? "..." : isOn ? "Выключить" : "Включить"}
        </button>
      </div>
    </div>
  )
}

function SensorStatus({
  device,
  editMode,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: {
  device: DeviceResponse
  editMode?: boolean
  onRemove?: () => void
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
}) {
  const value = device.state?.value !== undefined && device.state?.value !== null ? (device.state.value as number) : null
  const active = (device.state?.active as boolean) ?? false
  const w = 267
  const h = 140

  const getSensorIcon = () => {
    if (device.device_type === 'motion_sensor') return ScanLine
    if (device.device_type === 'door_sensor') return DoorOpen
    return Activity
  }

  const getSensorLabel = () => {
    if (device.device_type === 'motion_sensor') return 'Датчик движения'
    if (device.device_type === 'door_sensor') return 'Датчик двери'
    return 'Датчик'
  }

  const Icon = getSensorIcon()

  return (
    <div
      className="device-widget-wrap relative shrink-0 sm:shrink-0"
      style={{
        width: w,
        height: h,
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? "none" : "opacity 0.2s",
      }}
      draggable={editMode}
      onDragStart={(e) => {
        if (!editMode) return
        e.dataTransfer.effectAllowed = "move"
        onDragStart?.()
      }}
      onDragOver={(e) => {
        if (!editMode) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragOver?.()
      }}
      onDragEnd={onDragEnd}
    >
      <div
        className="glass-card flex h-full w-full flex-col justify-center overflow-hidden"
        style={{ padding: 16, cursor: editMode && !isDragging ? "grab" : editMode ? "grabbing" : "default" }}
      >
        {editMode && onRemove && (
          <button
            onClick={onRemove}
            className="absolute right-2 top-2 z-10 rounded-full p-1 transition-all hover:scale-110 hover:bg-red-50"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: active ? "#3b82f615" : "var(--primary-wash)" }}
            >
              <Icon className="h-4 w-4" style={{ color: active ? "#3b82f6" : "var(--text-muted)" }} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {getSensorLabel()}
              </div>
              <div className="truncate text-[10px] sm:text-[11px]" style={{ color: "var(--text-muted)" }}>
                {device.name}
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="font-bold tabular-nums text-xl sm:text-2xl" style={{ color: value !== null && active ? "#3b82f6" : "var(--text-muted)" }}>
              {value !== null ? value : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function GenericDeviceWidget({
  device,
  editMode,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: {
  device: DeviceResponse
  editMode?: boolean
  onRemove?: () => void
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
}) {
  const [isOn, setIsOn] = useState((device.state?.on as boolean) ?? false)
  const [controlling, setControlling] = useState(false)
  const w = 267
  const h = 140

  const getDeviceIcon = () => {
    switch (device.device_type) {
      case 'camera': return Camera
      case 'lock': return Lock
      case 'tv': return Tv
      case 'speaker': return Volume2
      case 'blinds': case 'curtains': return ArrowUpDown
      case 'fan': return Fan
      case 'alarm': return ShieldAlert
      default: return Box
    }
  }

  const getDeviceColor = () => {
    switch (device.device_type) {
      case 'camera': return '#8b5cf6'
      case 'lock': return '#f59e0b'
      case 'tv': return '#06b6d4'
      case 'speaker': return '#ec4899'
      case 'blinds': case 'curtains': return '#84cc16'
      case 'fan': return '#14b8a6'
      case 'alarm': return '#ef4444'
      default: return 'var(--primary)'
    }
  }

  const getDeviceLabel = () => {
    const labels: Record<string, string> = {
      camera: 'Камера',
      lock: 'Замок',
      tv: 'ТВ',
      speaker: 'Колонка',
      blinds: 'Жалюзи',
      curtains: 'Шторы',
      fan: 'Вентилятор',
      alarm: 'Сигнализация'
    }
    return labels[device.device_type] || device.device_type.charAt(0).toUpperCase() + device.device_type.slice(1)
  }

  const handleToggle = async () => {
    setControlling(true)
    try {
      console.log('Controlling device:', device.id, device.device_type, isOn ? 'turn_off' : 'turn_on')
      await api.devices.control(device.id, {
        action: isOn ? 'turn_off' : 'turn_on',
        parameters: {}
      })
      setIsOn(!isOn)
      console.log('Device controlled successfully')
    } catch (error) {
      console.error('Failed to control device:', error)
      alert(`Ошибка управления устройством: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setControlling(false)
    }
  }

  const Icon = getDeviceIcon()
  const color = getDeviceColor()

  return (
    <div
      className="device-widget-wrap relative shrink-0 sm:shrink-0"
      style={{
        width: w,
        height: h,
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? "none" : "opacity 0.2s",
      }}
      draggable={editMode}
      onDragStart={(e) => {
        if (!editMode) return
        e.dataTransfer.effectAllowed = "move"
        onDragStart?.()
      }}
      onDragOver={(e) => {
        if (!editMode) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragOver?.()
      }}
      onDragEnd={onDragEnd}
    >
      <div
        className="glass-card flex h-full w-full flex-col justify-between overflow-hidden"
        style={{ padding: 16, cursor: editMode && !isDragging ? "grab" : editMode ? "grabbing" : "default" }}
      >
        {editMode && onRemove && (
          <button
            onClick={onRemove}
            className="absolute right-2 top-2 z-10 rounded-full p-1 transition-all hover:scale-110 hover:bg-red-50"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: isOn ? color + '15' : 'var(--primary-wash)' }}
            >
              <Icon className="h-4 w-4" style={{ color: isOn ? color : 'var(--text-muted)' }} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {getDeviceLabel()}
              </div>
              <div className="truncate text-[10px] sm:text-[11px]" style={{ color: "var(--text-muted)" }}>
                {device.name}
              </div>
            </div>
          </div>
          <div
            className={`rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${controlling ? "animate-pulse" : ""}`}
            style={{ background: isOn ? color : "#94a3b8" }}
          />
        </div>
        <button
          onClick={handleToggle}
          disabled={controlling || editMode}
          className="flex w-full items-center justify-center rounded-[var(--radius-md)] py-2 sm:py-2.5 text-xs font-semibold transition-all disabled:opacity-50"
          style={{
            background: isOn ? color : "var(--primary-wash)",
            color: isOn ? "white" : color
          }}
        >
          {controlling ? 'Выполняется...' : isOn ? 'Выключить' : 'Включить'}
        </button>
      </div>
    </div>
  )
}

function DoorControl({
  editMode,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: {
  editMode?: boolean
  onRemove?: () => void
  onDragStart?: () => void
  onDragOver?: () => void
  onDragEnd?: () => void
  isDragging?: boolean
}) {
  const [status, setStatus] = useState<"opened" | "closed" | "loading">("closed")
  const [error, setError] = useState<string | null>(null)

  const handleOpen = async () => {
    setStatus("loading")
    setError(null)
    try {
      await api.servo.open()
      setStatus("opened")
    } catch (err) {
      setError("Не удалось открыть")
      setStatus("closed")
    }
  }

  const handleClose = async () => {
    setStatus("loading")
    setError(null)
    try {
      await api.servo.close()
      setStatus("closed")
    } catch (err) {
      setError("Не удалось закрыть")
      setStatus("opened")
    }
  }

  return (
    <div
      className="device-widget-wrap relative shrink-0 sm:shrink-0"
      style={{
        width: 267,
        height: 140,
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? "none" : "opacity 0.2s",
      }}
      draggable={editMode}
      onDragStart={(e) => {
        if (!editMode) return
        e.dataTransfer.effectAllowed = "move"
        onDragStart?.()
      }}
      onDragOver={(e) => {
        if (!editMode) return
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragOver?.()
      }}
      onDragEnd={onDragEnd}
    >
      <div
        className="glass-card flex h-full w-full flex-col justify-between overflow-hidden"
        style={{ padding: 16, cursor: editMode && !isDragging ? "grab" : editMode ? "grabbing" : "default" }}
      >
        {editMode && onRemove && (
          <button
            onClick={onRemove}
            className="absolute right-2 top-2 z-10 rounded-full p-1 transition-all hover:scale-110 hover:bg-red-50"
            style={{ background: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: "#3b82f615" }}
            >
              {status === "opened" ? (
                <DoorOpen className="h-4 w-4" style={{ color: "#3b82f6" }} />
              ) : (
                <DoorClosed className="h-4 w-4" style={{ color: "#3b82f6" }} />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Дверь
              </div>
              <div className="truncate text-[10px] sm:text-[11px]" style={{ color: "var(--text-muted)" }}>
                {status === "loading" ? "Выполняется..." : status === "opened" ? "Открыта" : "Закрыта"}
              </div>
            </div>
          </div>
          <div
            className={`rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${status === "loading" ? "animate-pulse" : ""}`}
            style={{ background: status === "opened" ? "#51cf66" : "#94a3b8" }}
          />
        </div>

        {error && (
          <div className="text-[10px] text-red-500">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleOpen}
            disabled={status === "loading" || editMode}
            className="flex-1 rounded-[var(--radius-md)] py-2 sm:py-2.5 text-xs font-semibold transition-all disabled:opacity-50"
            style={{
              background: status === "opened" ? "#3b82f6" : "var(--primary-wash)",
              color: status === "opened" ? "white" : "#3b82f6"
            }}
          >
            Открыть
          </button>
          <button
            onClick={handleClose}
            disabled={status === "loading" || editMode}
            className="flex-1 rounded-[var(--radius-md)] py-2 sm:py-2.5 text-xs font-semibold transition-all disabled:opacity-50"
            style={{
              background: status === "closed" ? "#64748b" : "var(--primary-wash)",
              color: status === "closed" ? "white" : "#64748b"
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

const AI_SUGGESTIONS = [
  "Открой дверь",
  "Включи свет в гостиной",
  "Установи температуру на 22 градуса",
  "Запусти сценарий Доброе утро",
]

type ChatMessageType = {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

function AiChatWidget() {
  const [query, setQuery] = useState("")
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const messagesEndRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const handleSend = useCallback(async (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessageType = {
      id: Date.now(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setSending(true)
    setQuery("")

    try {
      const res = await api.chat.sendMessage({ message })
      setMessages(prev => [...prev, res as ChatMessageType])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessageType = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Ошибка: ${error instanceof Error ? error.message : "Не удалось получить ответ"}`,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }, [])

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="flex flex-col gap-1.5 p-4"
        style={{
          maxHeight: messages.length > 0 ? "400px" : "auto",
          overflowY: messages.length > 0 ? "auto" : "visible"
        }}
      >
        {messages.length === 0 ? (
          <>
            {AI_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); handleSend(s) }}
                disabled={sending}
                className="cursor-pointer text-left text-sm rounded-[var(--radius-md)] border border-[rgba(174,87,72,0.15)] bg-white/70 px-3 py-2 transition-colors hover:bg-white/90 disabled:opacity-50"
                style={{ color: "var(--foreground)" }}
              >
                {s}
              </button>
            ))}
          </>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="rounded-[var(--radius-md)] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap max-w-[85%]"
                  style={{
                    background: msg.role === "user"
                      ? "var(--primary)"
                      : "rgba(255,255,255,0.7)",
                    color: msg.role === "user"
                      ? "white"
                      : "var(--foreground)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="px-4 pb-4">
        {messages.length > 0 && (
          <div className="mb-1.5 flex gap-1.5 overflow-x-auto pb-1.5">
            {AI_SUGGESTIONS.slice(0, 2).map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); handleSend(s) }}
                disabled={sending}
                className="shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-[rgba(174,87,72,0.15)] bg-white/70 px-2.5 py-1.5 text-xs transition-colors hover:bg-white/90 disabled:opacity-50"
                style={{ color: "var(--foreground)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div
          className="flex items-center overflow-hidden rounded-[var(--radius-md)] border border-[rgba(174,87,72,0.1)] bg-white/60"
        >
          <Search className="ml-3 h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend(query)
              }
            }}
            placeholder="Задайте любой вопрос..."
            disabled={sending}
            className="h-10 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50"
            style={{ color: "var(--foreground)" }}
          />
          {sending && <Loader2 className="mr-3 h-4 w-4 animate-spin" style={{ color: "var(--text-muted)" }} />}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const {
    getScenarioCardGridSize,
    setScenarioCardGridSize,
    scenarioOrder,
    setScenarioOrder,
    widgetOrder,
    setWidgetOrder,
    enabledWidgets,
    toggleWidget
  } = usePreferences()

  const [scenarios, setScenarios] = useState<ScenarioResponse[]>([])
  const [devices, setDevices] = useState<DeviceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedScenarioId, setDraggedScenarioId] = useState<number | null>(null)
  const [draggedWidgetKey, setDraggedWidgetKey] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [togglingScenarioId, setTogglingScenarioId] = useState<number | null>(null)
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [newDeviceName, setNewDeviceName] = useState("")
  const [newDeviceType, setNewDeviceType] = useState<string>("light")
  const [newDeviceLocation, setNewDeviceLocation] = useState("")
  const [newCameraMacIp, setNewCameraMacIp] = useState("")
  const [creatingDevice, setCreatingDevice] = useState(false)

  const handleToggleScenario = useCallback(async (scenarioId: number) => {
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (!scenario || togglingScenarioId === scenarioId) return

    setTogglingScenarioId(scenarioId)
    try {
      await api.scenarios.update(scenarioId, {
        is_active: !scenario.is_active
      })
      // Update local state
      setScenarios(prev => prev.map(s =>
        s.id === scenarioId ? { ...s, is_active: !s.is_active } : s
      ))
    } catch (error) {
      console.error('Failed to toggle scenario:', error)
    } finally {
      setTogglingScenarioId(null)
    }
  }, [scenarios, togglingScenarioId])

  const handleCreateDevice = useCallback(async () => {
    if (!newDeviceName.trim()) return

    setCreatingDevice(true)
    try {
      const newDevice = await api.devices.create({
        name: newDeviceName,
        device_type: newDeviceType,
        location: newDeviceLocation || undefined,
        capabilities: newDeviceType === 'light' || newDeviceType === 'lamp'
          ? { brightness: true }
          : newDeviceType === 'thermostat' || newDeviceType === 'climate'
          ? { temperature: true }
          : {}
      })

      // Если это камера и указан IP Mac, обновляем state с mac_stream_url
      if (newDeviceType === 'camera' && newCameraMacIp.trim()) {
        // Убираем порт если пользователь его указал (например 192.168.1.1:5003 -> 192.168.1.1)
        const cleanIp = newCameraMacIp.trim().split(':')[0]
        await api.devices.update(newDevice.id, {
          state: {
            mac_stream_url: `http://${cleanIp}:5003/stream`,
            on: false,
            streaming: false
          }
        })
        // Обновляем локальную копию устройства
        newDevice.state = {
          mac_stream_url: `http://${cleanIp}:5003/stream`,
          on: false,
          streaming: false
        }
      }

      setDevices(prev => [...prev, newDevice])

      // Automatically add the new device widget to the panel
      const getWidgetKey = (device: DeviceResponse) => {
        const dt = device.device_type
        if (dt === 'thermostat' || dt === 'climate') return `dev_temp_${device.id}`
        if (dt === 'light' || dt === 'lamp') return `dev_light_${device.id}`
        if (dt === 'switch' || dt === 'outlet') return `dev_switch_${device.id}`
        if (dt === 'sensor' || dt === 'motion_sensor' || dt === 'door_sensor') return `dev_sensor_${device.id}`
        return `dev_other_${device.id}`
      }

      const widgetKey = getWidgetKey(newDevice)
      toggleWidget(widgetKey)

      setShowAddDevice(false)
      setNewDeviceName("")
      setNewDeviceType("light")
      setNewDeviceLocation("")
      setNewCameraMacIp("")
    } catch (error) {
      console.error('Failed to create device:', error)
    } finally {
      setCreatingDevice(false)
    }
  }, [newDeviceName, newDeviceType, newDeviceLocation, newCameraMacIp, toggleWidget])

  useEffect(() => {
    async function load() {
      try {
        const [scenarioData, deviceData] = await Promise.all([
          api.scenarios.list(),
          api.devices.list(),
        ])
        setScenarios(scenarioData)
        setDevices(deviceData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Initialize order if empty
  useEffect(() => {
    if (scenarios.length > 0 && scenarioOrder.length === 0) {
      setScenarioOrder(scenarios.map(s => s.id))
    }
  }, [scenarios, scenarioOrder, setScenarioOrder])

  // Sort scenarios by saved order
  const sorted = [...scenarios].sort((a, b) => {
    const indexA = scenarioOrder.indexOf(a.id)
    const indexB = scenarioOrder.indexOf(b.id)
    if (indexA === -1 && indexB === -1) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  const handleScenarioDragStart = (id: number) => {
    setDraggedScenarioId(id)
  }

  const handleScenarioDragOver = (targetId: number) => {
    if (!draggedScenarioId || draggedScenarioId === targetId) return

    const currentOrder = scenarioOrder.length > 0 ? scenarioOrder : scenarios.map(s => s.id)
    const draggedIndex = currentOrder.indexOf(draggedScenarioId)
    const targetIndex = currentOrder.indexOf(targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newOrder = [...currentOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedScenarioId)
    setScenarioOrder(newOrder)
  }

  const handleScenarioDragEnd = () => {
    setDraggedScenarioId(null)
  }

  const temperatureDevices = devices.filter(
    (d) => d.capabilities?.temperature || d.device_type === "thermostat" || d.device_type === "climate"
  )
  const lightDevices = devices.filter(
    (d) => d.capabilities?.brightness || d.device_type === "light" || d.device_type === "lamp"
  )
  const switchDevices = devices.filter(
    (d) => d.device_type === "switch" || d.device_type === "outlet"
  )
  const sensorDevices = devices.filter(
    (d) => d.device_type === "sensor" || d.device_type === "motion_sensor" || d.device_type === "door_sensor"
  )
  const otherDevices = devices.filter(
    (d) => !temperatureDevices.includes(d) && !lightDevices.includes(d) && !switchDevices.includes(d) && !sensorDevices.includes(d)
  )

  // Initialize widget order and enabled widgets
  useEffect(() => {
    const allWidgetKeys = [
      'door_control',
      ...temperatureDevices.map(d => `dev_temp_${d.id}`),
      ...lightDevices.map(d => `dev_light_${d.id}`),
      ...switchDevices.map(d => `dev_switch_${d.id}`),
      ...sensorDevices.map(d => `dev_sensor_${d.id}`),
      ...otherDevices.map(d => `dev_other_${d.id}`)
    ]

    if (allWidgetKeys.length === 0) return

    // If empty, initialize with all keys
    if (widgetOrder.length === 0) {
      setWidgetOrder(allWidgetKeys)
      return
    }

    // Find new widgets that aren't in the order yet
    const newWidgets = allWidgetKeys.filter(key => !widgetOrder.includes(key))

    // Add new widgets to the end of the order
    if (newWidgets.length > 0) {
      console.log('📦 Adding new widgets to order:', newWidgets)
      setWidgetOrder([...widgetOrder, ...newWidgets])
    }

    // Remove widgets that no longer exist
    const validWidgets = widgetOrder.filter(key => allWidgetKeys.includes(key))
    if (validWidgets.length !== widgetOrder.length) {
      console.log('🗑️ Removing old widgets from order')
      setWidgetOrder(validWidgets)
    }
  }, [temperatureDevices, lightDevices, switchDevices, sensorDevices, otherDevices, widgetOrder, setWidgetOrder])

  const handleWidgetDragStart = (key: string) => {
    console.log('🎯 Drag START:', key)
    setDraggedWidgetKey(key)
  }

  const handleWidgetDragOver = (targetKey: string) => {
    if (!draggedWidgetKey || draggedWidgetKey === targetKey) return

    console.log('🎯 Drag OVER:', draggedWidgetKey, '→', targetKey)

    const allWidgetKeys = [
      'door_control',
      ...temperatureDevices.map(d => `dev_temp_${d.id}`),
      ...lightDevices.map(d => `dev_light_${d.id}`),
      ...switchDevices.map(d => `dev_switch_${d.id}`),
      ...sensorDevices.map(d => `dev_sensor_${d.id}`),
      ...otherDevices.map(d => `dev_other_${d.id}`)
    ]
    const currentOrder = widgetOrder.length > 0 ? widgetOrder : allWidgetKeys
    const draggedIndex = currentOrder.indexOf(draggedWidgetKey)
    const targetIndex = currentOrder.indexOf(targetKey)

    console.log('🎯 Indexes:', { draggedIndex, targetIndex, currentOrder })

    if (draggedIndex === -1 || targetIndex === -1) {
      console.log('❌ Index not found, exiting')
      return
    }

    const newOrder = [...currentOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedWidgetKey)
    console.log('✅ New order:', newOrder)
    setWidgetOrder(newOrder)
  }

  const handleWidgetDragEnd = () => {
    console.log('🎯 Drag END')
    setDraggedWidgetKey(null)
  }

  const handleRemoveWidget = useCallback((key: string) => {
    toggleWidget(key)
  }, [toggleWidget])

  // Sort widgets by saved order
  const allWidgets = [
    { type: 'door' as const, device: null as any, key: 'door_control' }, // Special door widget
    ...temperatureDevices.map(d => ({ type: 'temp' as const, device: d, key: `dev_temp_${d.id}` })),
    ...lightDevices.map(d => ({ type: 'light' as const, device: d, key: `dev_light_${d.id}` })),
    ...switchDevices.map(d => ({ type: 'switch' as const, device: d, key: `dev_switch_${d.id}` })),
    ...sensorDevices.map(d => ({ type: 'sensor' as const, device: d, key: `dev_sensor_${d.id}` })),
    ...otherDevices.map(d => ({ type: 'other' as const, device: d, key: `dev_other_${d.id}` }))
  ].sort((a, b) => {
    const indexA = widgetOrder.indexOf(a.key)
    const indexB = widgetOrder.indexOf(b.key)
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  // Convert enabledWidgets array to Set for faster lookup
  const enabledWidgetsSet = new Set(enabledWidgets)

  // Filter to show only enabled widgets (or temp/light/door by default)
  const displayedWidgets = enabledWidgets.length === 0
    ? allWidgets.filter(w => w.type === 'temp' || w.type === 'light' || w.type === 'door')
    : allWidgets.filter(w => enabledWidgetsSet.has(w.key))

  // Get available widgets to add (disabled widgets)
  const availableToAdd = allWidgets.filter(w => !enabledWidgetsSet.has(w.key) && enabledWidgets.length > 0)

  return (
    <div className="bg-mesh-gradient flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-40 glass-heavy"
        style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]"
              style={{ background: "var(--primary-wash)" }}
            >
              <Zap className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="font-logo text-xl tracking-tight" style={{ color: "var(--primary)" }}>
              Cozy
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => router.push('/cameras')}
              className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 transition-colors hover:bg-white/60"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Video className="h-4 w-4" />
              <span className="text-xs font-medium">Камеры</span>
            </button>
            <button
              onClick={() => router.push('/floor-plan')}
              className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 transition-colors hover:bg-white/60"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Map className="h-4 w-4" />
              <span className="text-xs font-medium">План</span>
            </button>
            <button
              onClick={() => router.push('/bills')}
              className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 transition-colors hover:bg-white/60"
              style={{ color: 'var(--text-secondary)' }}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-medium">Счета</span>
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3 transition-colors hover:bg-white/60"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs font-medium">Настройки</span>
            </button>
          </div>
          <div className="flex md:hidden items-center gap-1">
            <PreferencesButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 sm:px-6 md:py-8 md:pb-8">
        {/* Scenarios */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Сценарии
              </h2>
              {!loading && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: "var(--primary-wash)", color: "var(--primary)" }}
                >
                  {scenarios.length}
                </span>
              )}
            </div>
            <button
              onClick={() => router.push("/scenarios")}
              className="flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium transition-colors hover:bg-white/40"
              style={{ color: "var(--primary)" }}
            >
              Все
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary-lighter)" }} />
            </div>
          ) : sorted.length === 0 ? (
            <div className="glass-card flex h-[40vh] flex-col items-center justify-center gap-3">
              <LayoutGrid className="h-8 w-8" style={{ color: "var(--primary-lightest)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Нет сценариев
              </p>
              <button
                onClick={() => router.push("/scenarios")}
                className="mt-1 rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-white"
                style={{ background: "var(--primary)" }}
              >
                Создать
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 md:flex md:flex-wrap md:gap-3">
              {sorted.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  gridSize={getScenarioCardGridSize(scenario.id)}
                  onSizeChange={(size) => setScenarioCardGridSize(scenario.id, size)}
                  onClick={() => router.push(`/scenarios/${scenario.id}`)}
                  onToggle={() => handleToggleScenario(scenario.id)}
                  onDragStart={() => handleScenarioDragStart(scenario.id)}
                  onDragOver={() => handleScenarioDragOver(scenario.id)}
                  onDragEnd={handleScenarioDragEnd}
                  isDragging={draggedScenarioId === scenario.id}
                  isToggling={togglingScenarioId === scenario.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Device Controls */}
        {!loading && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" style={{ color: "var(--primary)" }} />
                <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Управление
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddDevice(true)}
                  className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium transition-all hover:bg-white/60"
                  style={{ color: 'var(--primary)' }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Добавить устройство</span>
                </button>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="rounded-[var(--radius-md)] p-2 transition-all"
                  style={{
                    color: editMode ? 'var(--primary)' : 'var(--text-secondary)',
                    background: editMode ? 'var(--primary-wash)' : 'transparent'
                  }}
                  aria-label="Редактировать виджеты"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 md:flex md:flex-wrap md:gap-3">
              {displayedWidgets.map((widget) => {
                if (widget.type === 'door') {
                  return (
                    <DoorControl
                      key={widget.key}
                      editMode={editMode}
                      onRemove={() => handleRemoveWidget(widget.key)}
                      onDragStart={() => handleWidgetDragStart(widget.key)}
                      onDragOver={() => handleWidgetDragOver(widget.key)}
                      onDragEnd={handleWidgetDragEnd}
                      isDragging={draggedWidgetKey === widget.key}
                    />
                  )
                }
                if (widget.type === 'switch') {
                  return (
                    <SwitchControl
                      key={widget.key}
                      device={widget.device}
                      editMode={editMode}
                      onRemove={() => handleRemoveWidget(widget.key)}
                      onDragStart={() => handleWidgetDragStart(widget.key)}
                      onDragOver={() => handleWidgetDragOver(widget.key)}
                      onDragEnd={handleWidgetDragEnd}
                      isDragging={draggedWidgetKey === widget.key}
                    />
                  )
                }
                if (widget.type === 'sensor') {
                  return (
                    <SensorStatus
                      key={widget.key}
                      device={widget.device}
                      editMode={editMode}
                      onRemove={() => handleRemoveWidget(widget.key)}
                      onDragStart={() => handleWidgetDragStart(widget.key)}
                      onDragOver={() => handleWidgetDragOver(widget.key)}
                      onDragEnd={handleWidgetDragEnd}
                      isDragging={draggedWidgetKey === widget.key}
                    />
                  )
                }
                if (widget.type === 'other') {
                  return (
                    <GenericDeviceWidget
                      key={widget.key}
                      device={widget.device}
                      editMode={editMode}
                      onRemove={() => handleRemoveWidget(widget.key)}
                      onDragStart={() => handleWidgetDragStart(widget.key)}
                      onDragOver={() => handleWidgetDragOver(widget.key)}
                      onDragEnd={handleWidgetDragEnd}
                      isDragging={draggedWidgetKey === widget.key}
                    />
                  )
                }
                return (
                  <DeviceControl
                    key={widget.key}
                    device={widget.device}
                    paramKey={widget.type === 'temp' ? 'temperature' : 'brightness'}
                    label={widget.type === 'temp' ? 'Температура' : 'Яркость'}
                    icon={widget.type === 'temp' ? Thermometer : Sun}
                    min={widget.type === 'temp' ? 16 : 0}
                    max={widget.type === 'temp' ? 30 : 100}
                    step={1}
                    unit={widget.type === 'temp' ? '°C' : '%'}
                    color={widget.type === 'temp' ? '#e8590c' : '#fab005'}
                    editMode={editMode}
                    onRemove={() => handleRemoveWidget(widget.key)}
                    onDragStart={() => handleWidgetDragStart(widget.key)}
                    onDragOver={() => handleWidgetDragOver(widget.key)}
                    onDragEnd={handleWidgetDragEnd}
                    isDragging={draggedWidgetKey === widget.key}
                  />
                )
              })}
              {editMode && availableToAdd.map((widget) => {
                const getWidgetIcon = () => {
                  if (widget.type === 'door') return DoorOpen
                  if (widget.type === 'temp') return Thermometer
                  if (widget.type === 'light') return Sun
                  if (widget.type === 'switch') return Plug
                  if (widget.type === 'sensor') return Activity
                  if (widget.type === 'other') {
                    const dt = widget.device.device_type
                    if (dt === 'camera') return Camera
                    if (dt === 'lock') return Lock
                    if (dt === 'tv') return Tv
                    if (dt === 'speaker') return Volume2
                    if (dt === 'blinds' || dt === 'curtains') return ArrowUpDown
                    if (dt === 'fan') return Fan
                    if (dt === 'alarm') return ShieldAlert
                    return Box
                  }
                  return Zap
                }
                const getWidgetColor = () => {
                  if (widget.type === 'door') return '#3b82f6'
                  if (widget.type === 'temp') return '#e8590c'
                  if (widget.type === 'light') return '#fab005'
                  if (widget.type === 'switch') return '#51cf66'
                  if (widget.type === 'sensor') return '#3b82f6'
                  if (widget.type === 'other') {
                    const dt = widget.device.device_type
                    if (dt === 'camera') return '#8b5cf6'
                    if (dt === 'lock') return '#f59e0b'
                    if (dt === 'tv') return '#06b6d4'
                    if (dt === 'speaker') return '#ec4899'
                    if (dt === 'blinds' || dt === 'curtains') return '#84cc16'
                    if (dt === 'fan') return '#14b8a6'
                    if (dt === 'alarm') return '#ef4444'
                    return 'var(--primary)'
                  }
                  return 'var(--primary)'
                }
                const getWidgetLabel = () => {
                  if (widget.type === 'door') return 'Дверь'
                  if (widget.type === 'temp') return 'Температура'
                  if (widget.type === 'light') return 'Яркость'
                  if (widget.type === 'switch') return widget.device.device_type === 'outlet' ? 'Розетка' : 'Выключатель'
                  if (widget.type === 'sensor') return 'Датчик'
                  if (widget.type === 'other') {
                    const labels: Record<string, string> = {
                      camera: 'Камера',
                      lock: 'Замок',
                      tv: 'ТВ',
                      speaker: 'Колонка',
                      blinds: 'Жалюзи',
                      curtains: 'Шторы',
                      fan: 'Вентилятор',
                      alarm: 'Сигнализация'
                    }
                    return labels[widget.device.device_type] || widget.device.device_type.charAt(0).toUpperCase() + widget.device.device_type.slice(1)
                  }
                  return 'Устройство'
                }

                const Icon = getWidgetIcon()
                const color = getWidgetColor()

                return (
                  <div key={widget.key} className="device-widget-wrap" style={{ width: 267, height: 140 }}>
                    <button
                      onClick={() => toggleWidget(widget.key)}
                      className="glass-card flex h-full w-full flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 transition-all hover:scale-105"
                      style={{ opacity: 0.7 }}
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]"
                        style={{ background: color + '15' }}
                      >
                        <Icon className="h-6 w-6" style={{ color }} />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                          {getWidgetLabel()}
                        </div>
                        {widget.device && (
                          <div className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {widget.device.name}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--primary)' }}>
                        <Plus className="h-3 w-3" />
                        Добавить на панель
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* AI Chat */}
        {!loading && (
          <section className="mt-8">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Спросить у ИИ
              </h2>
            </div>
            <AiChatWidget />
          </section>
        )}

        {/* Analytics */}
        {!loading && (
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" style={{ color: "var(--primary)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Аналитика
              </h2>
            </div>

            {/* AI Recommendations */}
            <div className="glass-card mb-4 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: "#9E7B9E" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Советы AI
                </h3>
              </div>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-3">
                <div
                  className="rounded-[var(--radius-md)] p-3"
                  style={{ background: "rgba(81, 207, 102, 0.08)", border: "1px solid rgba(81, 207, 102, 0.15)" }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" style={{ color: "#51CF66" }} />
                    <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      Экономия энергии
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Выключайте свет в спальне после 23:00 - сэкономите до 12% энергии в месяц
                  </p>
                </div>
                <div
                  className="rounded-[var(--radius-md)] p-3"
                  style={{ background: "rgba(196, 149, 106, 0.08)", border: "1px solid rgba(196, 149, 106, 0.15)" }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" style={{ color: "#C4956A" }} />
                    <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      Оптимизация расписания
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Обогрев можно включать на час позже - температура держится дольше обычного
                  </p>
                </div>
                <div
                  className="rounded-[var(--radius-md)] p-3"
                  style={{ background: "rgba(158, 123, 158, 0.08)", border: "1px solid rgba(158, 123, 158, 0.15)" }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5" style={{ color: "#9E7B9E" }} />
                    <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      Активность устройств
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Датчик движения в коридоре срабатывает реже обычного - проверьте батарейки
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {/* Energy Consumption */}
              <div className="glass-card p-4 sm:p-5">
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      Энергопотребление
                    </h3>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      За неделю
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>
                      24.5
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>кВт·ч</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart
                    data={[
                      { day: "Пн", energy: 3.2 },
                      { day: "Вт", energy: 2.8 },
                      { day: "Ср", energy: 4.1 },
                      { day: "Чт", energy: 3.5 },
                      { day: "Пт", energy: 3.8 },
                      { day: "Сб", energy: 4.2 },
                      { day: "Вс", energy: 2.9 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#AE5748" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#AE5748" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(174, 87, 72, 0.1)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#B69E99", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(174, 87, 72, 0.1)" }}
                    />
                    <YAxis
                      tick={{ fill: "#B69E99", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(174, 87, 72, 0.1)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(174, 87, 72, 0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="energy"
                      stroke="#AE5748"
                      strokeWidth={2}
                      fill="url(#energyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Temperature Chart */}
              <div className="glass-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      Температура
                    </h3>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      По часам
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold" style={{ color: "#e8590c" }}>
                      22.5
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>°C</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart
                    data={[
                      { hour: "00", temp: 21.2 },
                      { hour: "04", temp: 20.5 },
                      { hour: "08", temp: 22.1 },
                      { hour: "12", temp: 23.5 },
                      { hour: "16", temp: 24.2 },
                      { hour: "20", temp: 22.8 },
                      { hour: "24", temp: 21.5 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(174, 87, 72, 0.1)" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "#B69E99", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(174, 87, 72, 0.1)" }}
                    />
                    <YAxis
                      tick={{ fill: "#B69E99", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(174, 87, 72, 0.1)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(174, 87, 72, 0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#e8590c"
                      strokeWidth={2}
                      dot={{ fill: "#e8590c", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Device Activity */}
              <div className="glass-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      Активность устройств
                    </h3>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      За неделю
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold" style={{ color: "#51CF66" }}>
                      89
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>%</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart
                    data={[
                      { day: "Пн", activity: 85 },
                      { day: "Вт", activity: 92 },
                      { day: "Ср", activity: 78 },
                      { day: "Чт", activity: 88 },
                      { day: "Пт", activity: 95 },
                      { day: "Сб", activity: 82 },
                      { day: "Вс", activity: 90 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#51CF66" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#51CF66" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(174, 87, 72, 0.1)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#B69E99", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(174, 87, 72, 0.1)" }}
                    />
                    <YAxis
                      tick={{ fill: "#B69E99", fontSize: 11 }}
                      axisLine={{ stroke: "rgba(174, 87, 72, 0.1)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(174, 87, 72, 0.1)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="activity"
                      stroke="#51CF66"
                      strokeWidth={2}
                      fill="url(#activityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}
      </main>

      <MobileNav />

      {/* Add Device Modal */}
      {showAddDevice && (
        <div
          className="overlay-blur fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          onClick={() => {
            setShowAddDevice(false)
            setNewDeviceName("")
            setNewDeviceType("light")
            setNewDeviceLocation("")
            setNewCameraMacIp("")
          }}
        >
          <div
            className="glass-dialog w-full max-w-md rounded-b-none p-5 sm:rounded-b-[var(--radius-2xl)] sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Добавить устройство
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Настройте новое устройство для умного дома
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Название
                </label>
                <input
                  autoFocus
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder="Например: Свет в гостиной"
                  className="glass-input h-11 w-full px-3 text-sm sm:h-10"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Тип устройства
                </label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="glass-input h-11 w-full px-3 text-sm sm:h-10"
                  style={{ color: 'var(--foreground)' }}
                >
                  <optgroup label="Освещение">
                    <option value="light">Освещение (Light)</option>
                    <option value="lamp">Лампа (Lamp)</option>
                  </optgroup>
                  <optgroup label="Климат">
                    <option value="thermostat">Термостат (Thermostat)</option>
                    <option value="climate">Климат-контроль (Climate)</option>
                  </optgroup>
                  <optgroup label="Датчики">
                    <option value="sensor">Датчик (Sensor)</option>
                    <option value="motion_sensor">Датчик движения (Motion)</option>
                    <option value="door_sensor">Датчик двери (Door Sensor)</option>
                    <option value="temperature_sensor">Датчик температуры (Temp Sensor)</option>
                    <option value="humidity_sensor">Датчик влажности (Humidity)</option>
                  </optgroup>
                  <optgroup label="Управление">
                    <option value="switch">Выключатель (Switch)</option>
                    <option value="outlet">Розетка (Outlet)</option>
                    <option value="door">Дверь/Замок (Door Lock)</option>
                  </optgroup>
                  <optgroup label="Другое">
                    <option value="camera">Камера (Camera)</option>
                    <option value="speaker">Динамик (Speaker)</option>
                    <option value="tv">ТВ (TV)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Локация
                  <span className="ml-1" style={{ color: 'var(--text-muted)' }}>(опционально)</span>
                </label>
                <input
                  value={newDeviceLocation}
                  onChange={(e) => setNewDeviceLocation(e.target.value)}
                  placeholder="Например: Гостиная"
                  className="glass-input h-11 w-full px-3 text-sm sm:h-10"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>

              {/* Поле IP для камеры */}
              {newDeviceType === 'camera' && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    IP адрес Mac с камерой
                    <span className="ml-1" style={{ color: 'var(--text-muted)' }}>(опционально)</span>
                  </label>
                  <input
                    value={newCameraMacIp}
                    onChange={(e) => setNewCameraMacIp(e.target.value)}
                    placeholder="Например: 192.168.1.100"
                    className="glass-input h-11 w-full px-3 text-sm sm:h-10"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Укажите IP Mac, где запущен camera_server.py на порту 5003
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddDevice(false)
                  setNewDeviceName("")
                  setNewDeviceType("light")
                  setNewDeviceLocation("")
                  setNewCameraMacIp("")
                }}
                className="h-10 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors hover:bg-white/40 sm:h-9"
                style={{ color: 'var(--text-secondary)' }}
              >
                Отмена
              </button>
              <button
                onClick={handleCreateDevice}
                disabled={!newDeviceName.trim() || creatingDevice}
                className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 active:scale-[0.98] sm:h-9 sm:px-4"
                style={{ background: 'var(--primary)', boxShadow: '0 4px 14px rgba(174, 87, 72, 0.25)' }}
              >
                {creatingDevice ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
