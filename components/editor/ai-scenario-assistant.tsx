"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, Loader2, X, RotateCcw } from "lucide-react"
import { api } from "@/lib/api"
import type { ScenarioBlockBase, ScenarioBlockConnection } from "@/lib/api"

type GeneratedScenario = {
  scenario_name: string
  scenario_description: string
  blocks: {
    id: string
    block_type: string
    category: string
    config: Record<string, unknown>
    position: { x: number; y: number }
  }[]
  connections: {
    from_block: string
    to_block: string
    from_port?: string
    to_port?: string
  }[]
  error?: string
  advice?: string
}

type AIScenarioAssistantProps = {
  onApply: (scenario: GeneratedScenario) => void
  onClose: () => void
  currentBlocks: ScenarioBlockBase[]
  currentConnections: ScenarioBlockConnection[]
}

export function AIScenarioAssistant({
  onApply,
  onClose,
  currentBlocks,
  currentConnections,
}: AIScenarioAssistantProps) {
  const [description, setDescription] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const hasBlocks = currentBlocks.length > 0

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationHistory])

  function handleClearChat() {
    setConversationHistory([])
    setDescription("")
    setError(null)
  }

  async function handleGenerate() {
    if (!description.trim()) return

    const currentDescription = description
    setDescription("") // Очищаем поле сразу
    setGenerating(true)
    setError(null)

    try {
      const generated = await api.chat.generateScenario(currentDescription, {
        existing_blocks: hasBlocks ? currentBlocks : undefined,
        existing_connections: hasBlocks ? currentConnections : undefined,
        conversation_history: conversationHistory,
      })

      if (generated.error) {
        setError(generated.error)
      } else {
        // Update conversation history
        if (generated.conversation_history) {
          setConversationHistory(generated.conversation_history)
        }

        // Автоматически применяем результат на канвас (если это не консультация)
        // Консультация = есть advice и нет блоков
        const isConsultation = generated.advice && generated.blocks.length === 0
        if (!isConsultation) {
          onApply(generated)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка генерации")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="glass-heavy flex h-full w-80 max-md:fixed max-md:inset-0 max-md:z-50 max-md:w-full flex-col" style={{ borderRadius: 0, borderTop: "none", borderBottom: "none", borderRight: "none" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center"
            style={{ borderRadius: "var(--radius-md)", background: "rgba(158, 123, 158, 0.1)" }}
          >
            <Sparkles className="h-4 w-4" style={{ color: "#9E7B9E" }} />
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
              AI-ассистент
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Генерация сценария
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {conversationHistory.length > 0 && (
            <button
              onClick={handleClearChat}
              className="rounded-[var(--radius-sm)] p-1 transition-colors hover:bg-white/40"
              style={{ color: "var(--text-muted)" }}
              title="Очистить чат"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-[var(--radius-sm)] p-1 transition-colors hover:bg-white/40"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Chat History */}
        {conversationHistory.length > 0 && (
          <div className="mb-4 space-y-2.5">
            {conversationHistory.map((msg, idx) => {
              if (msg.role === "user") {
                return (
                  <div key={idx} className="flex justify-end">
                    <div
                      className="max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-[11px] leading-relaxed"
                      style={{
                        background: "rgba(158, 123, 158, 0.15)",
                        border: "1px solid rgba(158, 123, 158, 0.25)",
                        color: "var(--foreground)",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              } else {
                // AI response
                try {
                  const parsed = JSON.parse(msg.content)
                  return (
                    <div key={idx} className="flex justify-start">
                      <div
                        className="max-w-[85%] rounded-[var(--radius-md)] px-3 py-2.5 text-[11px] leading-relaxed"
                        style={{
                          background: "rgba(81, 207, 102, 0.08)",
                          border: "1px solid rgba(81, 207, 102, 0.15)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {parsed.advice ? (
                          // Консультация
                          <div>
                            <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#51CF66" }}>
                              💡 Совет
                            </div>
                            <div>{parsed.advice}</div>
                          </div>
                        ) : (
                          // Действие
                          <div>
                            <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#51CF66" }}>
                              ✓ Выполнено
                            </div>
                            <div className="font-medium mb-1" style={{ color: "var(--foreground)" }}>
                              {parsed.scenario_name}
                            </div>
                            <div className="text-[10px]">{parsed.scenario_description}</div>
                            {parsed.blocks && parsed.blocks.length > 0 && (
                              <div className="mt-1.5 flex gap-2 text-[9px]" style={{ color: "var(--text-muted)" }}>
                                <span>Блоков: {parsed.blocks.length}</span>
                                <span>Связей: {parsed.connections?.length || 0}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                } catch {
                  return (
                    <div key={idx} className="flex justify-start">
                      <div
                        className="max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-[11px]"
                        style={{
                          background: "rgba(81, 207, 102, 0.08)",
                          border: "1px solid rgba(81, 207, 102, 0.15)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )
                }
              }
            })}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Description Input */}
        <div className="mb-3">
          <label className="mb-1.5 flex items-center justify-between text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            <span>Что сделать?</span>
            <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Cmd+Enter для отправки</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleGenerate()
              }
            }}
            placeholder={
              hasBlocks
                ? "Например: Добавь уведомление в конце, Проверь правильность схемы, Измени время на 9:00..."
                : "Опишите что должен делать сценарий..."
            }
            rows={4}
            className="glass-input w-full resize-none px-3 py-2.5 text-xs"
            style={{ color: "var(--foreground)" }}
            disabled={generating}
          />
        </div>

        {/* Suggestions */}
        {conversationHistory.length === 0 && !generating && (
          <div className="mb-4">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {hasBlocks ? "Можно попросить:" : "Примеры:"}
            </div>
            <div className="space-y-1.5">
              {(hasBlocks
                ? [
                    "Добавь отправку уведомления",
                    "Удали блок задержки",
                    "Проверь правильность схемы",
                    "Что можно улучшить?",
                  ]
                : [
                    "Утром в будни включай свет",
                    "При открытии двери включи свет",
                    "Когда жарко, включи кондиционер",
                  ]
              ).map((example) => (
                <button
                  key={example}
                  onClick={() => setDescription(example)}
                  className="glass-button w-full px-2.5 py-2 text-left text-[11px] leading-snug transition-all hover:scale-[1.01]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mb-3 rounded-[var(--radius-md)] p-3 text-[11px] leading-relaxed"
            style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#dc2626" }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleGenerate}
          disabled={!description.trim() || generating}
          className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50 active:scale-[0.98]"
          style={{
            borderRadius: "var(--radius-md)",
            background: "#9E7B9E",
            boxShadow: "0 4px 14px rgba(158, 123, 158, 0.25)",
          }}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Думаю...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Отправить
            </>
          )}
        </button>
      </div>
    </div>
  )
}
