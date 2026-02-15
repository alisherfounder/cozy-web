'''ts

"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { api, type FloorPlanUploadResponse, type ChatMessageResponse } from "@/lib/api"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import {
  Zap, ArrowLeft, Map, Upload, Loader2, Image as ImageIcon,
  Sparkles, Home, Send, MessageCircle, X
} from "lucide-react"

export default function FloorPlanPage() {
  const router = useRouter()
  const [floorPlans, setFloorPlans] = useState<FloorPlanUploadResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<FloorPlanUploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Chat state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadFloorPlans()
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // When a new plan is selected, initialize chat with AI greeting
    if (selectedPlan && messages.length === 0) {
      initializeChatForPlan(selectedPlan)
    }
  }, [selectedPlan])

  const loadFloorPlans = async () => {
    try {
      const plans = await api.chat.floorPlans()
      setFloorPlans(plans)
      if (plans.length > 0 && !selectedPlan) {
        setSelectedPlan(plans[0])
      }
    } catch (error) {
      console.error('Failed to load floor plans:', error)
      setError(`Failed to load floor plans: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const initializeChatForPlan = async (plan: FloorPlanUploadResponse) => {
    // const roomsCount = plan.rooms && Array.isArray(plan.rooms) ? plan.rooms.length : 0
    // const roomsList = plan.rooms && Array.isArray(plan.rooms)
    //   ? plan.rooms.map(r => typeof r === 'string' ? r : (r as Record<string, unknown>).name).join(', ')
    //   : 'не определены'

    // Get analysis data
    // const analysis = plan.ai_analysis as Record<string, unknown> | null
    // const automationTips = analysis?.automation_tips as string[] | undefined
    // const suggestedScenarios = analysis?.suggested_scenarios as Array<{name: string, description: string}> | undefined

    // let greeting = `Привет! Я проанализировал вашу планировку дома "${plan.name}".

// 📊 Обнаружено помещений: ${roomsCount}
// 🏠 Помещения: ${roomsList}

// `

    // Add automation tips if available
    // if (automationTips && automationTips.length > 0) {
    //   greeting += `**Рекомендации по автоматизации:**\n\n`
    //   automationTips.forEach((tip, idx) => {
    //     greeting += `${idx + 1}. ${tip}\n`
    //   })
    //   greeting += '\n'
    // } else {
    //   greeting += `**Рекомендации по автоматизации:**

// 1. **Датчики движения** - установите в коридорах и ванной для автоматического включения света
// 2. **Умное освещение** - в спальнях можно настроить сценарий "Доброе утро" с плавным включением
// 3. **Климат-контроль** - датчики температуры помогут поддерживать комфорт в каждой комнате
// 4. **Безопасность** - датчики на дверях и окнах для контроля периметра

// `
    // }

    // Add suggested scenarios if available
    // if (suggestedScenarios && suggestedScenarios.length > 0) {
    //   greeting += `**Предложенные сценарии:**\n\n`
    //   suggestedScenarios.slice(0, 3).forEach(scenario => {
    //     greeting += `• **${scenario.name}**: ${scenario.description}\n`
    //   })
    //   greeting += '\n'
    // }

    // greeting += `Задайте мне любые вопросы о том, как лучше автоматизировать ваш дом!`

    setMessages([]) // Start with no initial messages
  }

  useEffect(() => {
    // Clean up preview URL when component unmounts or selectedFile changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file)) // Create new preview URL
    } else {
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null) // Clear previous errors
    try {
      const newPlan = await api.chat.uploadFloorPlan(selectedFile, selectedFile.name)
      setFloorPlans(prev => [newPlan, ...prev])
      setSelectedPlan(newPlan)
      setSelectedFile(null)
      setMessages([]) // Reset messages for new plan
    } catch (error) {
      console.error('Failed to upload floor plan:', error)
      setError(`Failed to upload floor plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      // Send message with floor plan context
      const context = {
        floor_plan_id: selectedPlan.id,
        floor_plan_name: selectedPlan.name,
        rooms: selectedPlan.rooms,
        ai_analysis: selectedPlan.ai_analysis
      }

      const response = await api.chat.sendMessage({
        message: userMessage,
        context
      })

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

  const handleDelete = async (planId: number) => {
    if (!window.confirm("Are you sure you want to delete this floor plan?")) {
      return
    }
    try {
      await api.chat.deleteFloorPlan(planId)
      setFloorPlans(prev => prev.filter(p => p.id !== planId))
      if (selectedPlan?.id === planId) {
        // Select the next available plan or null if no plans are left
        const remainingPlans = floorPlans.filter(p => p.id !== planId)
        setSelectedPlan(remainingPlans.length > 0 ? remainingPlans[0] : null)
      }
    } catch (error) {
      console.error('Failed to delete floor plan:', error)
      setError(`Failed to delete floor plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
              <Map className="h-4 w-4" style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="font-logo text-xl tracking-tight" style={{ color: "var(--primary)" }}>
              Планировка дома
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-8">
        {error && (
          <div
            className="mb-4 rounded-[var(--radius-md)] p-3 text-sm"
            style={{ background: "var(--red-wash)", color: "var(--red)" }}
          >
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-6">
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

                {selectedFile && previewUrl ? (
                  <div className="text-center">
                    <img src={previewUrl} alt="File Preview" className="mx-auto mb-2 h-24 w-auto object-contain" />
                    <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8" style={{ color: "var(--text-muted)" }} />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Нажмите для выбора файла
                    </p>
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)"}>
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
            {/* Previous Plans */}
            {floorPlans.length > 0 && (
              <div className="glass-card" style={{ padding: 20 }}>
                <h3 className="mb-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Предыдущие планы ({floorPlans.length})
                </h3>
                <div className="space-y-2">
                  {floorPlans.map(plan => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between rounded-[var(--radius-sm)] p-2 transition-colors hover:bg-white/40"
                      style={{
                        background: selectedPlan?.id === plan.id ? "var(--primary-wash)" : "transparent",
                        border: selectedPlan?.id === plan.id ? "1px solid var(--primary)" : "1px solid transparent"
                      }}
                    >
                      <button
                        onClick={() => {
                          setSelectedPlan(plan)
                          setMessages([]) // Reset chat for new plan
                        }}
                        className="flex-1 text-left"
                      >
                        <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                          {plan.name}
                        </p>
                        <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {new Date(plan.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview & Chat Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="glass-card flex h-[60vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary-lighter)" }} />
              </div>
            ) : !selectedPlan ? (
              <div className="glass-card flex h-[60vh] flex-col items-center justify-center gap-3">
                <Home className="h-12 w-12" style={{ color: "var(--primary-lightest)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Загрузите план помещения для анализа
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Plan Image */}
                <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
                  <div
                    className="relative"
                    style={{
                      background: "var(--surface-muted)",
                      minHeight: 300
                    }}
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/floor-plan/${selectedPlan.id}/image`}
                      alt={selectedPlan.name}
                      className="h-full w-full object-contain"
                      style={{ maxHeight: 500 }}
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          const icon = document.createElement('div')
                          icon.className = 'flex h-full items-center justify-center'
                          icon.innerHTML = '<svg class="h-12 w-12" style="color: var(--text-muted)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                          parent.insertBefore(icon, e.currentTarget)
                        }
                      }}
                    />
                    <div className="absolute bottom-3 left-3">
                      <div
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{ background: "var(--primary)", color: "white" }}
                      >
                        {selectedPlan.name}
                      </div>
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
                            className="max-w-[80%] rounded-[var(--radius-md)] px-3 py-2 text-xs"
                            style={{
                              background: msg.role === 'user' ? "var(--primary)" : "var(--surface-muted)",
                              color: msg.role === 'user' ? "white" : "var(--foreground)",
                            }}
                          >
                            <MarkdownRenderer content={msg.content} />
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
    </div>
  )
}

'''
