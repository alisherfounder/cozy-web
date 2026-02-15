export type ScenarioBlockBase = {
  id: string
  block_type: string
  category: string
  config: Record<string, unknown>
  position: Record<string, number>
}

export type ScenarioBlockConnection = {
  from_block: string
  to_block: string
  from_port?: string | null
  to_port?: string | null
}

export type ScenarioCreate = {
  name: string
  description?: string | null
  blocks: ScenarioBlockBase[]
  connections: ScenarioBlockConnection[]
}

export type ScenarioUpdate = {
  name?: string | null
  description?: string | null
  blocks?: ScenarioBlockBase[] | null
  connections?: ScenarioBlockConnection[] | null
  is_active?: boolean | null
}

export type ScenarioResponse = {
  id: number
  name: string
  description: string | null
  blocks: unknown
  is_active: boolean
  is_template: boolean
  created_at: string
  updated_at: string | null
}

export type ScenarioExecuteRequest = {
  scenario_id: number
  trigger_type?: string | null
  trigger_data?: Record<string, unknown> | null
}

export type ScenarioExecutionResponse = {
  id: number
  scenario_id: number
  status: string
  trigger_type: string | null
  result: unknown | null
  started_at: string
  completed_at: string | null
}

export type DeviceCreate = {
  name: string
  device_type: string
  location?: string | null
  capabilities?: Record<string, boolean> | null
  gpio_pin?: number | null
}

export type DeviceUpdate = {
  name?: string | null
  location?: string | null
  state?: Record<string, unknown> | null
  status?: string | null
}

export type DeviceResponse = {
  id: number
  name: string
  device_type: string
  location: string | null
  status: string
  state: Record<string, unknown> | null
  capabilities: Record<string, boolean> | null
  created_at: string
  gpio_pin?: number | null
}

export type DeviceControlRequest = {
  action: string
  parameters?: Record<string, unknown> | null
}

export type SensorReadingResponse = {
  id: number
  device_id: number
  sensor_type: string
  value: number
  unit: string | null
  timestamp: string
}

export type ChatMessageRequest = {
  message: string
  context?: Record<string, unknown> | null
}

export type ChatMessageResponse = {
  id: number
  role: string
  content: string
  timestamp: string
}

export type FloorPlanUploadResponse = {
  id: number
  name: string
  image_path: string
  ai_analysis: Record<string, unknown> | null
  rooms: Record<string, unknown>[] | null
  created_at: string
}

export type UserPatternResponse = {
  id: number
  pattern_type: string
  pattern_data: Record<string, unknown>
  confidence: number | null
  last_detected: string
}

export type AIRecommendationResponse = {
  id: number
  recommendation_type: string
  title: string
  description: string | null
  suggested_scenario: Record<string, unknown> | null
  status: string
  created_at: string
}

export type RecommendationActionRequest = {
  action: string
}

export type ValidationError = {
  loc: (string | number)[]
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

export type HTTPValidationError = {
  detail?: ValidationError[]
}

export type ApiError = {
  status: number
  message: string
  detail?: ValidationError[]
}

// Utilities
export type UtilityMeterCreate = {
  meter_type: string  // electricity, water, gas
  meter_number: string
  location?: string | null
}

export type UtilityMeterResponse = {
  id: number
  meter_type: string
  meter_number: string
  location: string | null
  created_at: string
}

export type UtilityReadingCreate = {
  meter_id: number
  reading_value: number
  is_automatic?: boolean
}

export type UtilityReadingResponse = {
  id: number
  meter_id: number
  reading_value: number
  reading_date: string
  is_automatic: boolean
}

export type UtilityBillCalculate = {
  meter_id: number
  period_start: string
  period_end: string
  rate_per_unit: number
}

export type UtilityBillResponse = {
  id: number
  meter_id: number
  amount: number
  period_start: string
  period_end: string
  status: string  // pending, paid, overdue
  paid_at: string | null
  created_at: string
}

export type UtilityBillPayRequest = {
  payment_method?: string  // card, cash, bank_transfer
}

export type UtilityStatsResponse = {
  total_meters: number
  total_bills: number
  pending_bills: number
  paid_bills: number
  total_pending_amount: number
  total_paid_amount: number
}

// Cameras
export type CameraStreamStartResponse = {
  success: boolean
  device_id: number
}

export type CameraStreamStopResponse = {
  success: boolean
  device_id: number
}
