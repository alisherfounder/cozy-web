"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  ArrowLeft,
  Save,
  Play,
  Loader2,
  PanelLeftOpen,
  PanelLeftClose,
  Trash2,
  X,
  Plus,
  Box,
  RefreshCw,
} from "lucide-react"
import { api } from "@/lib/api"
import type {
  ScenarioResponse,
  ScenarioBlockBase,
  ScenarioBlockConnection,
  DeviceResponse,
} from "@/lib/api"
import {
  BLOCK_DEFS,
  CATEGORY_COLORS,
  getBlockIcon,
  getDefaultConfig,
  type BlockParam,
} from "@/lib/blocks"
import { BlockNode } from "./block-node"
import { BlocksPanel } from "./blocks-panel"
import { ConfirmDialog } from "../confirm-dialog"
import { PreferencesButton } from "../preferences-panel"
import { AIScenarioAssistant } from "./ai-scenario-assistant"
import { Sparkles } from "lucide-react"

const nodeTypes: NodeTypes = { block: BlockNode }

const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "#D89A90", strokeWidth: 2 },
}

function parseScenarioData(scenario: ScenarioResponse) {
  const raw = scenario.blocks
  let blocks: ScenarioBlockBase[] = []
  let connections: ScenarioBlockConnection[] = []

  if (Array.isArray(raw)) {
    blocks = raw as ScenarioBlockBase[]
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>
    blocks = Array.isArray(obj.blocks)
      ? (obj.blocks as ScenarioBlockBase[])
      : []
    connections = Array.isArray(obj.connections)
      ? (obj.connections as ScenarioBlockConnection[])
      : []
  }

  const rawConn = (scenario as Record<string, unknown>).connections
  if (Array.isArray(rawConn)) connections = rawConn as ScenarioBlockConnection[]

  return { blocks, connections }
}

function blocksToNodes(blocks: ScenarioBlockBase[]): Node[] {
  return blocks.map((b) => ({
    id: b.id,
    type: "block",
    position: { x: b.position?.x || 0, y: b.position?.y || 0 },
    data: {
      block_type: b.block_type,
      category: b.category,
      config: b.config || {},
    },
  }))
}

function connectionsToEdges(connections: ScenarioBlockConnection[]): Edge[] {
  return connections.map((c, i) => ({
    id: `e-${c.from_block}-${c.to_block}-${i}`,
    source: c.from_block,
    target: c.to_block,
    sourceHandle: c.from_port || "output",
    targetHandle: c.to_port || "input",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#D89A90", strokeWidth: 2 },
  }))
}

function EditorInner({ scenarioId }: { scenarioId: number }) {
  const router = useRouter()
  const { screenToFlowPosition } = useReactFlow()

  const [scenario, setScenario] = useState<ScenarioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])
  const [saving, setSaving] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [showPanel, setShowPanel] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true)
  const [scenarioName, setScenarioName] = useState("")
  const [scenarioDesc, setScenarioDesc] = useState("")
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [devices, setDevices] = useState<DeviceResponse[]>([])
  const [loadingDevices, setLoadingDevices] = useState(false)

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true)
    try {
      const devicesData = await api.devices.list()
      setDevices(devicesData)
    } catch {
      // handle silently
    } finally {
      setLoadingDevices(false)
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [scenarioData, devicesData] = await Promise.all([
          api.scenarios.get(scenarioId),
          api.devices.list(),
        ])

        setScenario(scenarioData)
        setScenarioName(scenarioData.name)
        setScenarioDesc(scenarioData.description || "")
        setDevices(devicesData)

        const { blocks, connections } = parseScenarioData(scenarioData)
        setNodes(blocksToNodes(blocks))
        setEdges(connectionsToEdges(connections))
      } catch {
        router.back()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [scenarioId, router, setNodes, setEdges])

  // Reload devices when window gains focus (user returns from another tab/page)
  useEffect(() => {
    const handleFocus = () => {
      loadDevices()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadDevices])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds))
    },
    [setEdges]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const raw = event.dataTransfer.getData("application/cozy-block")
      if (!raw) return

      const data = JSON.parse(raw) as {
        block_type: string
        category: string
      }
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `block_${Date.now()}`,
        type: "block",
        position,
        data: {
          block_type: data.block_type,
          category: data.category,
          config: getDefaultConfig(data.block_type),
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [screenToFlowPosition, setNodes]
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const blocks: ScenarioBlockBase[] = nodes.map((n) => ({
        id: n.id,
        block_type: (n.data as Record<string, unknown>).block_type as string,
        category: (n.data as Record<string, unknown>).category as string,
        config:
          ((n.data as Record<string, unknown>).config as Record<
            string,
            unknown
          >) || {},
        position: {
          x: Math.round(n.position.x),
          y: Math.round(n.position.y),
        },
      }))

      const connections: ScenarioBlockConnection[] = edges.map((e) => ({
        from_block: e.source,
        to_block: e.target,
        from_port: e.sourceHandle || "output",
        to_port: e.targetHandle || "input",
      }))

      await api.scenarios.update(scenarioId, {
        name: scenarioName,
        description: scenarioDesc || undefined,
        blocks,
        connections,
      })
    } catch {
      // handle silently
    } finally {
      setSaving(false)
    }
  }

  async function handleExecute() {
    setExecuting(true)
    try {
      await api.scenarios.execute({
        scenario_id: scenarioId,
        trigger_type: "manual",
      })
    } catch {
      // handle silently
    } finally {
      setExecuting(false)
    }
  }

  function handleDeleteNode() {
    if (!selectedNodeId) return
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId))
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      )
    )
    setSelectedNodeId(null)
    setConfirmDeleteBlock(false)
  }

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  )

  function updateNodeConfig(key: string, value: unknown) {
    if (!selectedNodeId) return
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== selectedNodeId) return n
        const config = {
          ...((n.data as Record<string, unknown>).config as Record<
            string,
            unknown
          >),
          [key]: value,
        }
        return { ...n, data: { ...n.data, config } }
      })
    )
  }

  function handleApplyAI(generatedScenario: {
    scenario_name: string
    scenario_description: string
    blocks: ScenarioBlockBase[]
    connections: ScenarioBlockConnection[]
  }) {
    // Update scenario name and description
    setScenarioName(generatedScenario.scenario_name)
    setScenarioDesc(generatedScenario.scenario_description)

    // Convert and apply blocks
    const newNodes = blocksToNodes(generatedScenario.blocks)
    const newEdges = connectionsToEdges(generatedScenario.connections)

    setNodes(newNodes)
    setEdges(newEdges)
  }

  // Convert current nodes/edges to blocks/connections format
  const currentBlocks: ScenarioBlockBase[] = nodes.map((n) => ({
    id: n.id,
    block_type: (n.data as Record<string, unknown>).block_type as string,
    category: (n.data as Record<string, unknown>).category as string,
    config:
      ((n.data as Record<string, unknown>).config as Record<string, unknown>) || {},
    position: {
      x: Math.round(n.position.x),
      y: Math.round(n.position.y),
    },
  }))

  const currentConnections: ScenarioBlockConnection[] = edges.map((e) => ({
    from_block: e.source,
    to_block: e.target,
    from_port: e.sourceHandle || "output",
    to_port: e.targetHandle || "input",
  }))

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: '#ffffff' }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--primary-lighter)' }} />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col" style={{ background: '#ffffff' }}>
      {/* Toolbar */}
      <div className="glass-heavy flex h-12 shrink-0 items-center justify-between px-3" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-[var(--radius-sm)] p-1.5 transition-colors hover:bg-white/40"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="mx-0.5 md:mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />

          <button
            onClick={() => setShowPanel((p) => !p)}
            className="rounded-[var(--radius-sm)] p-1.5 transition-colors hover:bg-white/40"
            style={{ color: 'var(--text-secondary)' }}
          >
            {showPanel ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>

          <div className="mx-0.5 md:mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />

          {editingName ? (
            <input
              autoFocus
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              className="glass-input h-7 w-24 md:w-auto px-2 text-xs md:text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="max-w-[120px] md:max-w-none truncate rounded-[var(--radius-sm)] px-1.5 md:px-2 py-1 text-xs md:text-sm font-medium transition-colors hover:bg-white/40"
              style={{ color: 'var(--foreground)' }}
            >
              {scenarioName}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-1.5">
          <button
            onClick={() => setShowAI(true)}
            className="flex h-8 items-center gap-1.5 px-2 md:px-3 text-xs font-medium transition-all active:scale-[0.98]"
            style={{
              borderRadius: 'var(--radius-md)',
              background: 'rgba(158, 123, 158, 0.1)',
              border: '1px solid rgba(158, 123, 158, 0.2)',
              color: '#9E7B9E'
            }}
            title="AI-ассистент"
          >
            <Sparkles className="h-3.5 w-3.5 md:h-3 md:w-3" />
            <span className="hidden md:inline">AI-ассистент</span>
          </button>
          <div className="mx-0.5 h-4 w-px hidden md:block" style={{ background: 'var(--border)' }} />
          <span className="hidden md:inline"><PreferencesButton /></span>
          <button
            onClick={handleExecute}
            disabled={executing}
            className="glass-button flex h-8 items-center gap-1.5 px-2 md:px-3 text-xs font-medium disabled:opacity-50"
            style={{ color: 'var(--text-secondary)' }}
            title="Выполнить"
          >
            {executing ? (
              <Loader2 className="h-3.5 w-3.5 md:h-3 md:w-3 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 md:h-3 md:w-3" />
            )}
            <span className="hidden md:inline">Execute</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-8 items-center gap-1.5 px-2.5 md:px-3 text-xs font-medium text-white transition-all disabled:opacity-50 active:scale-[0.98]"
            style={{ borderRadius: 'var(--radius-md)', background: 'var(--primary)', boxShadow: '0 4px 14px rgba(174, 87, 72, 0.25)' }}
            title="Сохранить"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 md:h-3 md:w-3 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 md:h-3 md:w-3" />
            )}
            <span className="hidden md:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex flex-1 overflow-hidden">
        {showPanel && (
          <BlocksPanel
            onClose={() => setShowPanel(false)}
            onAddBlock={(blockType, category) => {
              const newNode: Node = {
                id: `block_${Date.now()}`,
                type: "block",
                position: {
                  x: 100 + Math.random() * 200,
                  y: 100 + nodes.length * 80,
                },
                data: {
                  block_type: blockType,
                  category,
                  config: getDefaultConfig(blockType),
                },
              }
              setNodes((nds) => [...nds, newNode])
              if (window.innerWidth < 768) setShowPanel(false)
            }}
          />
        )}

        <div className="relative flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            colorMode="light"
            fitView
            proOptions={{ hideAttribution: true }}
            deleteKeyCode={["Backspace", "Delete"]}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.2}
              color="#C4956A"
            />
            <Controls
              showInteractive={false}
              className="!border-[var(--border)] !bg-white/60 !backdrop-blur-xl [&>button]:!border-[var(--border)] [&>button]:!bg-white/60 [&>button]:!fill-[var(--text-secondary)] [&>button:hover]:!bg-white/80"
            />
            <MiniMap
              className="!border-[var(--border)] !bg-white/40 !backdrop-blur-xl"
              nodeColor="var(--minimap-node)"
              maskColor="var(--minimap-mask)"
            />

            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="mt-20 md:mt-32 text-center px-4">
                  <p className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
                    Перетащите блоки из панели на канвас
                  </p>
                  <button
                    onClick={() => setShowPanel(true)}
                    className="mt-3 md:hidden rounded-[var(--radius-md)] px-4 py-2 text-xs font-medium text-white"
                    style={{ background: 'var(--primary)' }}
                  >
                    Открыть блоки
                  </button>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            devices={devices}
            loadingDevices={loadingDevices}
            onRefreshDevices={loadDevices}
            onUpdateConfig={updateNodeConfig}
            onDelete={() => setConfirmDeleteBlock(true)}
            onClose={() => setSelectedNodeId(null)}
          />
        )}

        {showAI && (
          <AIScenarioAssistant
            onApply={handleApplyAI}
            onClose={() => setShowAI(false)}
            currentBlocks={currentBlocks}
            currentConnections={currentConnections}
          />
        )}

        <ConfirmDialog
          open={confirmDeleteBlock}
          onClose={() => setConfirmDeleteBlock(false)}
          onConfirm={handleDeleteNode}
          title="Delete block"
          message="Are you sure you want to remove this block? Any connections will be removed."
          confirmLabel="Delete"
        />
      </div>
    </div>
  )
}

// ─── Config Panel ────────────────────────────────────

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

function ParamField({
  param,
  value,
  onChange,
  devices,
  loadingDevices,
  onRefreshDevices,
}: {
  param: BlockParam
  value: unknown
  onChange: (val: unknown) => void
  devices?: DeviceResponse[]
  loadingDevices?: boolean
  onRefreshDevices?: () => void
}) {
  switch (param.type) {
    case "device_select": {
      const deviceList = devices || []
      return (
        <div className="space-y-1.5">
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            className="glass-input h-8 w-full px-2 text-xs"
            style={{ color: 'var(--foreground)' }}
            disabled={loadingDevices}
          >
            <option value="">{param.placeholder || "Выберите устройство"}</option>
            {deviceList.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.device_type})
              </option>
            ))}
          </select>
          {onRefreshDevices && (
            <button
              onClick={onRefreshDevices}
              disabled={loadingDevices}
              className="flex h-6 w-full items-center justify-center gap-1.5 text-[10px] font-medium transition-colors disabled:opacity-50"
              style={{
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(174, 87, 72, 0.05)',
                border: '1px solid rgba(174, 87, 72, 0.1)',
                color: 'var(--text-muted)'
              }}
            >
              {loadingDevices ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              {loadingDevices ? 'Обновление...' : 'Обновить список'}
            </button>
          )}
        </div>
      )
    }

    case "select":
      return (
        <select
          value={String(value ?? param.defaultValue ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="glass-input h-8 w-full px-2 text-xs"
          style={{ color: 'var(--foreground)' }}
        >
          {param.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )

    case "number":
      return (
        <input
          type="number"
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
          min={param.min}
          max={param.max}
          step={param.step}
          placeholder={param.placeholder}
          className="glass-input h-8 w-full px-2.5 text-xs"
          style={{ color: 'var(--foreground)' }}
        />
      )

    case "time":
      return (
        <input
          type="time"
          value={String(value ?? param.defaultValue ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="glass-input h-8 w-full px-2.5 text-xs"
          style={{ color: 'var(--foreground)' }}
        />
      )

    case "color":
      return (
        <div className="flex gap-2">
          <input
            type="color"
            value={String(value ?? param.defaultValue ?? "#ffffff")}
            onChange={(e) => onChange(e.target.value)}
            className="glass-input h-8 w-10 cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={String(value ?? param.defaultValue ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#ffffff"
            className="glass-input h-8 flex-1 px-2.5 font-mono text-xs"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      )

    case "toggle":
      return (
        <button
          onClick={() => onChange(!value)}
          className="h-8 w-full text-xs font-medium transition-colors"
          style={{
            borderRadius: 'var(--radius-md)',
            background: value ? 'rgba(81, 207, 102, 0.08)' : 'rgba(255,255,255,0.5)',
            border: value ? '1px solid rgba(81, 207, 102, 0.2)' : '1px solid var(--border)',
            color: value ? '#3a9e50' : 'var(--text-secondary)',
          }}
        >
          {value ? "Enabled" : "Disabled"}
        </button>
      )

    case "weekdays": {
      const selected = Array.isArray(value) ? (value as number[]) : []
      return (
        <div className="flex gap-1">
          {WEEKDAY_LABELS.map((label, i) => {
            const day = i + 1
            const active = selected.includes(day)
            return (
              <button
                key={day}
                onClick={() =>
                  onChange(
                    active
                      ? selected.filter((d) => d !== day)
                      : [...selected, day].sort()
                  )
                }
                className="flex h-7 w-7 items-center justify-center text-[10px] font-semibold transition-colors"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  background: active ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                  border: active ? 'none' : '1px solid var(--border)',
                  color: active ? 'white' : 'var(--text-secondary)',
                  boxShadow: active ? '0 2px 8px rgba(174, 87, 72, 0.3)' : 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )
    }

    default:
      return (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          className="glass-input h-8 w-full px-2.5 text-xs"
          style={{ color: 'var(--foreground)' }}
        />
      )
  }
}

function ConfigPanel({
  node,
  devices,
  loadingDevices,
  onRefreshDevices,
  onUpdateConfig,
  onDelete,
  onClose,
}: {
  node: Node
  devices: DeviceResponse[]
  loadingDevices: boolean
  onRefreshDevices: () => void
  onUpdateConfig: (key: string, value: unknown) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [newKey, setNewKey] = useState("")
  const nodeData = node.data as {
    block_type: string
    category: string
    config: Record<string, unknown>
  }

  const blockDef = BLOCK_DEFS[nodeData.block_type]
  const color = CATEGORY_COLORS[nodeData.category] || "#8B8B99"
  const Icon = getBlockIcon(nodeData.block_type, nodeData.category) || Box

  const definedKeys = new Set(blockDef?.params.map((p) => p.key) ?? [])
  const extraKeys = Object.keys(nodeData.config).filter(
    (k) => !definedKeys.has(k)
  )

  return (
    <div className="glass-heavy flex h-full w-72 max-md:fixed max-md:inset-0 max-md:z-50 max-md:w-full flex-col" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderRight: 'none' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Configure
        </span>
        <button
          onClick={onClose}
          className="rounded-[var(--radius-sm)] p-1 transition-colors hover:bg-white/40"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            style={{ borderRadius: 'var(--radius-md)', backgroundColor: color + "15" }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              {blockDef?.name ??
                nodeData.block_type
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
            </div>
            <div className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>
              {nodeData.category}
            </div>
          </div>
        </div>

        {blockDef?.description && (
          <p className="mt-2 text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {blockDef.description}
          </p>
        )}

        {blockDef && blockDef.params.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="h-px" style={{ background: 'var(--border)' }} />
            {blockDef.params.map((param) => (
              <div key={param.key}>
                <label className="mb-1.5 block text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {param.label}
                </label>
                <ParamField
                  param={param}
                  value={nodeData.config[param.key]}
                  onChange={(val) => onUpdateConfig(param.key, val)}
                  devices={devices}
                  loadingDevices={loadingDevices}
                  onRefreshDevices={onRefreshDevices}
                />
              </div>
            ))}
          </div>
        )}

        {extraKeys.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="h-px" style={{ background: 'var(--border)' }} />
            <label className="block text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Custom Fields
            </label>
            {extraKeys.map((key) => (
              <div key={key}>
                <label className="mb-1 block text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {key}
                </label>
                <input
                  value={String(nodeData.config[key] ?? "")}
                  onChange={(e) => {
                    const v = e.target.value
                    onUpdateConfig(key, isNaN(Number(v)) ? v : Number(v))
                  }}
                  className="glass-input h-8 w-full px-2.5 text-xs"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <div className="h-px" style={{ background: 'var(--border)' }} />
          <div className="mt-3 flex gap-1.5">
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newKey.trim()) {
                  onUpdateConfig(newKey.trim(), "")
                  setNewKey("")
                }
              }}
              placeholder="Custom field..."
              className="glass-input h-7 flex-1 px-2 text-xs"
              style={{ color: 'var(--foreground)' }}
            />
            <button
              onClick={() => {
                if (newKey.trim()) {
                  onUpdateConfig(newKey.trim(), "")
                  setNewKey("")
                }
              }}
              className="glass-button flex h-7 items-center gap-1 px-2 text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onDelete}
          className="flex h-8 w-full items-center justify-center gap-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50/50"
          style={{ borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
        >
          <Trash2 className="h-3 w-3" />
          Delete Block
        </button>
      </div>
    </div>
  )
}

export default function ScenarioEditor({
  scenarioId,
}: {
  scenarioId: number
}) {
  return (
    <ReactFlowProvider>
      <EditorInner scenarioId={scenarioId} />
    </ReactFlowProvider>
  )
}
