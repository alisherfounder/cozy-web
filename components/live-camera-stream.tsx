"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"

interface LiveCameraStreamProps {
  streamUrl: string
  cameraName: string
  autoStart?: boolean
  onError?: (error: string) => void
}

export function LiveCameraStream({
  streamUrl,
  cameraName,
  autoStart = true,
  onError,
}: LiveCameraStreamProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!autoStart) return

    const img = imgRef.current
    if (!img) return

    const handleLoad = () => {
      setLoading(false)
      setError(null)
    }

    const handleError = () => {
      setLoading(false)
      const errMsg = "Не удалось загрузить стрим"
      setError(errMsg)
      onError?.(errMsg)
    }

    img.addEventListener("load", handleLoad)
    img.addEventListener("error", handleError)

    // Добавляем timestamp для предотвращения кеширования
    img.src = `${streamUrl}?t=${Date.now()}`

    return () => {
      img.removeEventListener("load", handleLoad)
      img.removeEventListener("error", handleError)
    }
  }, [streamUrl, autoStart, onError])

  return (
    <div className="relative w-full h-full bg-black rounded-[var(--radius-lg)] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/90 z-10">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <img
        ref={imgRef}
        alt={`Live stream from ${cameraName}`}
        className="w-full h-full object-contain"
        style={{ display: error ? "none" : "block" }}
      />

      {/* Recording indicator */}
      {!loading && !error && (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-500/90 px-2 py-1">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
          <span className="text-[10px] font-medium text-white">LIVE</span>
        </div>
      )}
    </div>
  )
}
