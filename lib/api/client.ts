import type {
  ScenarioCreate,
  ScenarioUpdate,
  ScenarioResponse,
  ScenarioExecuteRequest,
  ScenarioExecutionResponse,
  DeviceCreate,
  DeviceUpdate,
  DeviceResponse,
  DeviceControlRequest,
  SensorReadingResponse,
  ChatMessageRequest,
  ChatMessageResponse,
  FloorPlanUploadResponse,
  FloorPlanChatResponse,
  UserPatternResponse,
  AIRecommendationResponse,
  RecommendationActionRequest,
  UtilityMeterCreate,
  UtilityMeterResponse,
  UtilityReadingCreate,
  UtilityReadingResponse,
  UtilityBillCalculate,
  UtilityBillResponse,
  UtilityBillUpdate,
  UtilityBillPayRequest,
  UtilityStatsResponse,
  CameraStreamStartResponse,
  CameraStreamStopResponse,
  EventLogResponse,
  ApiError,
} from "./types"

class CozyApiError extends Error {
  status: number
  detail?: unknown

  constructor(error: ApiError) {
    super(error.message)
    this.name = "CozyApiError"
    this.status = error.status
    this.detail = error.detail
  }
}

type RequestConfig = {
  baseUrl: string
  headers?: Record<string, string>
}

async function request<T>(
  config: RequestConfig,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.baseUrl}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new CozyApiError({
      status: res.status,
      message: body.detail?.[0]?.msg ?? res.statusText,
      detail: body.detail,
    })
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

async function requestFormData<T>(
  config: RequestConfig,
  path: string,
  body: FormData
): Promise<T> {
  const url = `${config.baseUrl}${path}`
  const res = await fetch(url, {
    method: "POST",
    body,
    headers: { ...config.headers },
  })

  if (!res.ok) {
    const resBody = await res.json().catch(() => ({}))
    throw new CozyApiError({
      status: res.status,
      message: resBody.detail?.[0]?.msg ?? res.statusText,
      detail: resBody.detail,
    })
  }

  return res.json()
}

function createScenarios(config: RequestConfig) {
  return {
    list: () =>
      request<ScenarioResponse[]>(config, "/api/scenarios/"),

    get: (scenarioId: number) =>
      request<ScenarioResponse>(config, `/api/scenarios/${scenarioId}`),

    create: (data: ScenarioCreate) =>
      request<ScenarioResponse>(config, "/api/scenarios/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (scenarioId: number, data: ScenarioUpdate) =>
      request<ScenarioResponse>(config, `/api/scenarios/${scenarioId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (scenarioId: number) =>
      request<void>(config, `/api/scenarios/${scenarioId}`, {
        method: "DELETE",
      }),

    execute: (data: ScenarioExecuteRequest) =>
      request<ScenarioExecutionResponse>(config, "/api/scenarios/execute", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    templates: () =>
      request<ScenarioResponse[]>(config, "/api/scenarios/templates"),
  }
}

function createDevices(config: RequestConfig) {
  return {
    list: () =>
      request<DeviceResponse[]>(config, "/api/devices/"),

    get: (deviceId: number) =>
      request<DeviceResponse>(config, `/api/devices/${deviceId}`),

    create: (data: DeviceCreate) =>
      request<DeviceResponse>(config, "/api/devices/", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (deviceId: number, data: DeviceUpdate) =>
      request<DeviceResponse>(config, `/api/devices/${deviceId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (deviceId: number) =>
      request<void>(config, `/api/devices/${deviceId}`, {
        method: "DELETE",
      }),

    control: (deviceId: number, data: DeviceControlRequest) =>
      request<void>(config, `/api/devices/${deviceId}/control`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    readings: (deviceId: number, limit?: number) => {
      const params = limit ? `?limit=${limit}` : ""
      return request<SensorReadingResponse[]>(
        config,
        `/api/devices/${deviceId}/readings${params}`
      )
    },
  }
}

function createChat(config: RequestConfig) {
  return {
    sendMessage: (data: ChatMessageRequest) =>
      request<ChatMessageResponse>(config, "/api/chat/message", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    history: (limit?: number) => {
      const params = limit ? `?limit=${limit}` : ""
      return request<ChatMessageResponse[]>(
        config,
        `/api/chat/history${params}`
      )
    },

    uploadFloorPlan: (file: File, name?: string) => {
      const formData = new FormData()
      formData.append("file", file)
      const params = name ? `?name=${encodeURIComponent(name)}` : ""
      return requestFormData<FloorPlanUploadResponse>(
        config,
        `/api/chat/floor-plan${params}`,
        formData
      )
    },

    floorPlans: () =>
      request<FloorPlanUploadResponse[]>(config, "/api/chat/floor-plans"),

    floorPlanChat: (planId: number, message: string) =>
      request<FloorPlanChatResponse>(config, `/api/chat/floor-plan/${planId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),

    floorPlanChatHistory: (planId: number) =>
      request<FloorPlanChatResponse[]>(config, `/api/chat/floor-plan/${planId}/chat-history`),

    generateScenario: (
      description: string,
      options?: {
        existing_blocks?: unknown[]
        existing_connections?: unknown[]
        conversation_history?: { role: string; content: string }[]
      }
    ) =>
      request<{
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
        conversation_history?: { role: string; content: string }[]
      }>(config, "/api/chat/generate-scenario", {
        method: "POST",
        body: JSON.stringify({
          description,
          existing_blocks: options?.existing_blocks,
          existing_connections: options?.existing_connections,
          conversation_history: options?.conversation_history,
        }),
      }),
  }
}

function createAnalytics(config: RequestConfig) {
  return {
    dashboard: () =>
      request<Record<string, unknown>>(config, "/api/analytics/dashboard"),

    patterns: () =>
      request<UserPatternResponse[]>(config, "/api/analytics/patterns"),

    recommendations: () =>
      request<AIRecommendationResponse[]>(
        config,
        "/api/analytics/recommendations"
      ),

    handleRecommendation: (
      recommendationId: number,
      data: RecommendationActionRequest
    ) =>
      request<void>(
        config,
        `/api/analytics/recommendations/${recommendationId}/action`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
  }
}

function createBlocks(config: RequestConfig) {
  return {
    list: () =>
      request<Record<string, unknown>[]>(config, "/api/blocks/"),

    byCategory: (category: string) =>
      request<Record<string, unknown>[]>(
        config,
        `/api/blocks/category/${encodeURIComponent(category)}`
      ),

    readyScenarios: () =>
      request<Record<string, unknown>[]>(config, "/api/blocks/ready-scenarios"),
  }
}

function createUtilities(config: RequestConfig) {
  return {
    // Meters
    meters: () =>
      request<UtilityMeterResponse[]>(config, "/api/utilities/meters"),

    getMeter: (meterId: number) =>
      request<UtilityMeterResponse>(config, `/api/utilities/meters/${meterId}`),

    createMeter: (data: UtilityMeterCreate) =>
      request<UtilityMeterResponse>(config, "/api/utilities/meters", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    deleteMeter: (meterId: number) =>
      request<{ success: boolean }>(config, `/api/utilities/meters/${meterId}`, {
        method: "DELETE",
      }),

    // Readings
    submitReading: (data: UtilityReadingCreate) =>
      request<UtilityReadingResponse>(config, "/api/utilities/readings", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    readings: (meterId: number, limit?: number) => {
      const params = limit ? `?limit=${limit}` : ""
      return request<UtilityReadingResponse[]>(
        config,
        `/api/utilities/readings/${meterId}${params}`
      )
    },

    latestReading: (meterId: number) =>
      request<UtilityReadingResponse>(
        config,
        `/api/utilities/readings/${meterId}/latest`
      ),

    // Bills
    calculateBill: (data: UtilityBillCalculate) =>
      request<UtilityBillResponse>(config, "/api/utilities/bills/calculate", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    bills: (params?: { meter_id?: number; status?: string; limit?: number }) => {
      const queryParams = new URLSearchParams()
      if (params?.meter_id) queryParams.set("meter_id", params.meter_id.toString())
      if (params?.status) queryParams.set("status", params.status)
      if (params?.limit) queryParams.set("limit", params.limit.toString())
      const query = queryParams.toString() ? `?${queryParams}` : ""
      return request<UtilityBillResponse[]>(config, `/api/utilities/bills${query}`)
    },

    getBill: (billId: number) =>
      request<UtilityBillResponse>(config, `/api/utilities/bills/${billId}`),

    updateBill: (billId: number, data: UtilityBillUpdate) =>
      request<UtilityBillResponse>(config, `/api/utilities/bills/${billId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    payBill: (billId: number, data: UtilityBillPayRequest) =>
      request<UtilityBillResponse>(config, `/api/utilities/bills/${billId}/pay`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    deleteBill: (billId: number) =>
      request<void>(config, `/api/utilities/bills/${billId}`, { method: "DELETE" }),

    stats: () =>
      request<UtilityStatsResponse>(config, "/api/utilities/stats"),
  }
}

function createServo(config: RequestConfig) {
  return {
    open: () =>
      request<void>(config, "/api/servo/open", { method: "POST" }),

    close: () =>
      request<void>(config, "/api/servo/close", { method: "POST" }),

    command: (cmd: string) =>
      request<void>(config, `/api/servo/command/${encodeURIComponent(cmd)}`, {
        method: "POST",
      }),

    status: () =>
      request<Record<string, unknown>>(config, "/api/servo/status"),
  }
}

function createEvents(config: RequestConfig) {
  return {
    list: (params?: {
      limit?: number
      offset?: number
      event_type?: string | null
      event_category?: string | null
      target_type?: string | null
      target_id?: number | null
      status?: string | null
      from_date?: string | null
      to_date?: string | null
    }) => {
      const search = new URLSearchParams()
      if (params?.limit != null) search.set("limit", params.limit.toString())
      if (params?.offset != null) search.set("offset", params.offset.toString())
      if (params?.event_type != null) search.set("event_type", params.event_type)
      if (params?.event_category != null) search.set("event_category", params.event_category)
      if (params?.target_type != null) search.set("target_type", params.target_type)
      if (params?.target_id != null) search.set("target_id", params.target_id.toString())
      if (params?.status != null) search.set("status", params.status)
      if (params?.from_date != null) search.set("from_date", params.from_date)
      if (params?.to_date != null) search.set("to_date", params.to_date)
      const query = search.toString() ? `?${search}` : ""
      return request<EventLogResponse[]>(config, `/api/events/${query}`)
    },

    recent: (limit?: number) => {
      const query = limit != null ? `?limit=${limit}` : ""
      return request<EventLogResponse[]>(config, `/api/events/recent${query}`)
    },

    today: () =>
      request<EventLogResponse[]>(config, "/api/events/today"),
  }
}

function createCameras(config: RequestConfig) {
  return {
    startStream: (deviceId: number) =>
      request<CameraStreamStartResponse>(
        config,
        `/api/cameras/${deviceId}/start-stream`,
        { method: "POST" }
      ),

    stopStream: (deviceId: number) =>
      request<CameraStreamStopResponse>(
        config,
        `/api/cameras/${deviceId}/stop-stream`,
        { method: "POST" }
      ),

    getStreamUrl: (deviceId: number) =>
      `${config.baseUrl}/api/cameras/${deviceId}/stream`,

    getSnapshotUrl: (deviceId: number) =>
      `${config.baseUrl}/api/cameras/${deviceId}/snapshot`,
  }
}

export function createCozyClient(baseUrl: string, headers?: Record<string, string>) {
  const config: RequestConfig = { baseUrl: baseUrl.replace(/\/$/, ""), headers }

  return {
    scenarios: createScenarios(config),
    devices: createDevices(config),
    chat: createChat(config),
    analytics: createAnalytics(config),
    blocks: createBlocks(config),
    utilities: createUtilities(config),
    servo: createServo(config),
    cameras: createCameras(config),
    events: createEvents(config),

    health: () => request<Record<string, unknown>>(config, "/health"),
    root: () => request<Record<string, unknown>>(config, "/"),
  }
}

export type CozyClient = ReturnType<typeof createCozyClient>

export { CozyApiError }
