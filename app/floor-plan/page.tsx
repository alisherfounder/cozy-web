"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { api, type FloorPlanUploadResponse } from "@/lib/api"
import { MarkdownMessage } from "@/components/markdown-message"
import {
  ArrowLeft, Map, Upload, Loader2, Image as ImageIcon,
  Sparkles, Send, MessageCircle
} from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export default function FloorPlanPage() {
  const router = useRouter()
  const [floorPlans, setFloorPlans] = useState<FloorPlanUploadResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<FloorPlanUploadResponse | null>(null)

  // Chat state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [imageError, setImageError] = useState(false)
  const [previewZoom, setPreviewZoom] = useState(1)

  useEffect(() => {
    loadFloorPlans()
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedPlan) return
    setMessages([])
    loadChatForPlan(selectedPlan)
  }, [selectedPlan?.id])

  useEffect(() => {
    setImageError(false)
    setPreviewZoom(1)
  }, [selectedPlan?.id])

  const loadFloorPlans = async () => {
    try {
      const plans = await api.chat.floorPlans()
      setFloorPlans(plans)
      if (plans.length > 0 && !selectedPlan) {
        setSelectedPlan(plans[0])
      }
    } catch (error) {
      console.error('Failed to load floor plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatForPlan = async (plan: FloorPlanUploadResponse) => {
    try {
      const history = await api.chat.floorPlanChatHistory(plan.id)
      if (history.length > 0) {
        setMessages(history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })))
        return
      }
    } catch {
      /* ignore */
    }
    const analysis = plan.ai_analysis as Record<string, unknown> | null
    const content =
      (typeof analysis?.summary === 'string' && analysis.summary) ||
      (typeof analysis?.analysis === 'string' && analysis.analysis) ||
      (typeof analysis?.response === 'string' && analysis.response) ||
      (typeof analysis?.text === 'string' && analysis.text) ||
      ''
    setMessages(content ? [{ role: 'assistant', content }] : [])
  }

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setSelectedFile(null)
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const newPlan = await api.chat.uploadFloorPlan(selectedFile, selectedFile.name)
      setFloorPlans(prev => [newPlan, ...prev])
      setSelectedPlan(newPlan)
      setSelectedFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      setMessages([])
      setPreviewZoom(1)
    } catch (error) {
      console.error('Failed to upload floor plan:', error)
      alert(`Ошибка загрузки планировки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedPlan) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setSendingMessage(true)

    try {
      const response = await api.chat.floorPlanChat(selectedPlan.id, userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего сообщения.'
      }])
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
              <Map className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="font-logo text-xl tracking-tight" style={{ color: "var(--primary)" }}>
              Планировка дома
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 sm:px-6 md:py-8 md:pb-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="glass-card" style={{ padding: 20 }}>
              <div className="mb-4 flex items-center gap-2">
                <Upload className="h-4 w-4" style={{ color: "var(--primary)" }} />
                <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Загрузить план
                </h2>
              </div>

              <div
                className="relative mb-4 flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed transition-colors hover:border-[var(--primary)]"
                style={{
                  borderColor: selectedFile ? "var(--primary)" : "var(--border)",
                  background: "var(--surface-muted)",
                  minHeight: 200,
                  padding: 20
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex h-full min-h-[180px] w-full flex-col items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Превью"
                        className="max-h-[160px] w-auto max-w-full rounded-[var(--radius-sm)] object-contain"
                      />
                    ) : (
                      <ImageIcon className="mx-auto mb-2 h-8 w-8" style={{ color: "var(--primary)" }} />
                    )}
                    <p className="mt-2 text-xs font-medium" style={{ color: "var(--foreground)" }}>
                      {selectedFile.name}
                    </p>
                    <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-2 h-10 w-10" style={{ color: "var(--text-muted)" }} />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Нажмите для выбора файла
                    </p>
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      PNG, JPG до 10 МБ
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full rounded-[var(--radius-md)] py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "var(--primary)" }}
              >
                {uploading ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  'Загрузить и проанализировать'
                )}
              </button>
            </div>
          </div>

          {/* Preview & Chat Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="glass-card flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary-lighter)" }} />
              </div>
            ) : !selectedPlan ? (
              <div className="glass-card flex h-[60vh] flex-col items-center justify-center gap-3">
                <ImageIcon className="h-16 w-16" style={{ color: "var(--primary-lightest)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Загрузите план помещения для анализа
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Plan Preview - kept after upload, interactive */}
                <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
                  <div
                    className="relative flex min-h-[200px] items-center justify-center overflow-auto p-4"
                    style={{
                      background: "var(--surface-muted)",
                      maxHeight: 320,
                    }}
                  >
                    {imageError ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-8">
                        <ImageIcon className="h-12 w-12" style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Не удалось загрузить изображение
                        </p>
                      </div>
                    ) : (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/chat/floor-plan/${selectedPlan.id}/image`}
                        alt={selectedPlan.name}
                        className="cursor-grab select-none object-contain transition-transform active:cursor-grabbing"
                        style={{
                          transform: `scale(${previewZoom})`,
                          maxHeight: 280,
                        }}
                        draggable={false}
                        onError={() => setImageError(true)}
                      />
                    )}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.25))}
                        className="rounded-[var(--radius-sm)] bg-black/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/30"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewZoom((z) => Math.min(2, z + 0.25))}
                        className="rounded-[var(--radius-sm)] bg-black/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Chat */}
                <div className="glass-card flex flex-col" style={{ padding: 0, height: 500 }}>
                  {/* Chat Header */}
                  <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
                    <Sparkles className="h-4 w-4" style={{ color: "var(--primary)" }} />
                    <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      AI Консультант
                    </h2>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: 400 }}>
                    {messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center gap-3">
                        <MessageCircle className="h-8 w-8" style={{ color: "var(--primary-lightest)" }} />
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          AI анализирует планировку...
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className="max-w-[80%] rounded-[var(--radius-md)] px-3 py-2 text-xs [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-4 [&_ol]:pl-4 [&_p]:my-1 [&_strong]:font-semibold"
                            style={{
                              background: msg.role === 'user' ? "var(--primary)" : "var(--surface-muted)",
                              color: msg.role === 'user' ? "white" : "var(--foreground)",
                            }}
                          >
                            {msg.role === "user" ? (
                              msg.content
                            ) : (
                              <MarkdownMessage content={msg.content} />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Спросите об автоматизации вашего дома..."
                        disabled={sendingMessage}
                        className="flex-1 rounded-[var(--radius-md)] px-3 py-2 text-xs outline-none transition-colors"
                        style={{
                          background: "var(--surface-muted)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)"
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || sendingMessage}
                        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-white transition-all disabled:opacity-50"
                        style={{ background: "var(--primary)" }}
                      >
                        {sendingMessage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
