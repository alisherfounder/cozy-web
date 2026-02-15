import { createCozyClient } from "./client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = createCozyClient(API_URL)

export * from "./types"
export { CozyApiError } from "./client"
export type { CozyClient } from "./client"
