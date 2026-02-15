"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { getJsonCookie, setJsonCookie } from "./cookies"

export type BlockSize = "compact" | "default" | "large"
export type ScenarioWidgetSize = "small" | "medium" | "large"
export type ScenarioCardSize = "small" | "medium" | "large"
export type CardDimensions = { w: number; h: number }
export type GridSize = "1x1" | "2x1" | "2x2"

type Preferences = {
  blockSize: BlockSize
  cardColumns: 1 | 2 | 3
  scenarioWidgetSize: ScenarioWidgetSize
  scenarioCardSizes: Record<string, ScenarioCardSize>
  scenarioCardDimensions: Record<string, CardDimensions>
  scenarioCardGridSizes: Record<string, GridSize>
  widgetGridSizes: Record<string, GridSize>
  scenarioOrder: number[]
  widgetOrder: string[]
  enabledWidgets: string[]
}

type PreferencesCtx = Preferences & {
  setBlockSize: (s: BlockSize) => void
  setCardColumns: (c: 1 | 2 | 3) => void
  setScenarioWidgetSize: (s: ScenarioWidgetSize) => void
  setScenarioCardSize: (id: number, s: ScenarioCardSize) => void
  setScenarioCardDimensions: (id: number, d: CardDimensions) => void
  setWidgetDimensions: (key: string, d: CardDimensions) => void
  getWidgetDimensions: (key: string, fallback: CardDimensions) => CardDimensions
  setScenarioCardGridSize: (id: number, size: GridSize) => void
  getScenarioCardGridSize: (id: number) => GridSize
  setWidgetGridSize: (key: string, size: GridSize) => void
  getWidgetGridSize: (key: string) => GridSize
  setScenarioOrder: (order: number[]) => void
  setWidgetOrder: (order: string[]) => void
  setEnabledWidgets: (widgets: string[]) => void
  toggleWidget: (key: string) => void
}

const COOKIE_KEY = "cozy_prefs"

const DEFAULTS: Preferences = {
  blockSize: "default",
  cardColumns: 2,
  scenarioWidgetSize: "medium",
  scenarioCardSizes: {},
  scenarioCardDimensions: {},
  scenarioCardGridSizes: {},
  widgetGridSizes: {},
  scenarioOrder: [],
  widgetOrder: [],
  enabledWidgets: [],
}

const Ctx = createContext<PreferencesCtx>({
  ...DEFAULTS,
  setBlockSize: () => {},
  setCardColumns: () => {},
  setScenarioWidgetSize: () => {},
  setScenarioCardSize: () => {},
  setScenarioCardDimensions: () => {},
  setWidgetDimensions: () => {},
  getWidgetDimensions: (_, fb) => fb,
  setScenarioCardGridSize: () => {},
  getScenarioCardGridSize: () => "1x1",
  setWidgetGridSize: () => {},
  getWidgetGridSize: () => "1x1",
  setScenarioOrder: () => {},
  setWidgetOrder: () => {},
  setEnabledWidgets: () => {},
  toggleWidget: () => {},
})

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = getJsonCookie<Partial<Preferences>>(COOKIE_KEY, {})
    setPrefs({ ...DEFAULTS, ...saved })
    setLoaded(true)
  }, [])

  const setBlockSize = useCallback((blockSize: BlockSize) => {
    setPrefs((p) => {
      const next = { ...p, blockSize }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const setCardColumns = useCallback((cardColumns: 1 | 2 | 3) => {
    setPrefs((p) => {
      const next = { ...p, cardColumns }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const setScenarioWidgetSize = useCallback((scenarioWidgetSize: ScenarioWidgetSize) => {
    setPrefs((p) => {
      const next = { ...p, scenarioWidgetSize }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const setScenarioCardSize = useCallback((id: number, size: ScenarioCardSize) => {
    setPrefs((p) => {
      const scenarioCardSizes = { ...p.scenarioCardSizes, [String(id)]: size }
      const next = { ...p, scenarioCardSizes }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const setScenarioCardDimensions = useCallback((id: number, dims: CardDimensions) => {
    setPrefs((p) => {
      const scenarioCardDimensions = { ...p.scenarioCardDimensions, [String(id)]: dims }
      const next = { ...p, scenarioCardDimensions }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const setWidgetDimensions = useCallback((key: string, dims: CardDimensions) => {
    setPrefs((p) => {
      const scenarioCardDimensions = { ...p.scenarioCardDimensions, [key]: dims }
      const next = { ...p, scenarioCardDimensions }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const getWidgetDimensions = useCallback((key: string, fallback: CardDimensions): CardDimensions => {
    return prefs.scenarioCardDimensions[key] || fallback
  }, [prefs.scenarioCardDimensions])

  const setScenarioCardGridSize = useCallback((id: number, size: GridSize) => {
    setPrefs((p) => {
      const scenarioCardGridSizes = { ...p.scenarioCardGridSizes, [String(id)]: size }
      const next = { ...p, scenarioCardGridSizes }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const getScenarioCardGridSize = useCallback((id: number): GridSize => {
    return prefs.scenarioCardGridSizes[String(id)] || "1x1"
  }, [prefs.scenarioCardGridSizes])

  const setWidgetGridSize = useCallback((key: string, size: GridSize) => {
    setPrefs((p) => {
      const widgetGridSizes = { ...p.widgetGridSizes, [key]: size }
      const next = { ...p, widgetGridSizes }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const getWidgetGridSize = useCallback((key: string): GridSize => {
    return prefs.widgetGridSizes[key] || "1x1"
  }, [prefs.widgetGridSizes])

  const setScenarioOrder = useCallback((scenarioOrder: number[]) => {
    setPrefs((p) => {
      const next = { ...p, scenarioOrder }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const setWidgetOrder = useCallback((widgetOrder: string[]) => {
    setPrefs((p) => {
      const next = { ...p, widgetOrder }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const setEnabledWidgets = useCallback((enabledWidgets: string[]) => {
    setPrefs((p) => {
      const next = { ...p, enabledWidgets }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  const toggleWidget = useCallback((key: string) => {
    setPrefs((p) => {
      const enabledWidgets = p.enabledWidgets.includes(key)
        ? p.enabledWidgets.filter(k => k !== key)
        : [...p.enabledWidgets, key]
      const next = { ...p, enabledWidgets }
      setJsonCookie(COOKIE_KEY, next)
      return next
    })
  }, [])

  if (!loaded) return <>{children}</>

  return (
    <Ctx.Provider value={{
      ...prefs,
      setBlockSize,
      setCardColumns,
      setScenarioWidgetSize,
      setScenarioCardSize,
      setScenarioCardDimensions,
      setWidgetDimensions,
      getWidgetDimensions,
      setScenarioCardGridSize,
      getScenarioCardGridSize,
      setWidgetGridSize,
      getWidgetGridSize,
      setScenarioOrder,
      setWidgetOrder,
      setEnabledWidgets,
      toggleWidget
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function usePreferences() {
  return useContext(Ctx)
}

export const BLOCK_SIZE_CONFIG = {
  compact: {
    minWidth: 140,
    px: "px-2.5",
    py: "py-2",
    iconSize: "h-5 w-5",
    iconInner: "h-3 w-3",
    textSize: "text-[11px]",
    subSize: "text-[9px]",
    gap: "gap-2",
    radius: "var(--radius-md)",
  },
  default: {
    minWidth: 180,
    px: "px-3.5",
    py: "py-3",
    iconSize: "h-7 w-7",
    iconInner: "h-3.5 w-3.5",
    textSize: "text-xs",
    subSize: "text-[10px]",
    gap: "gap-2.5",
    radius: "var(--radius-lg)",
  },
  large: {
    minWidth: 230,
    px: "px-4",
    py: "py-4",
    iconSize: "h-9 w-9",
    iconInner: "h-4.5 w-4.5",
    textSize: "text-sm",
    subSize: "text-[11px]",
    gap: "gap-3",
    radius: "var(--radius-xl)",
  },
} as const

export const SCENARIO_WIDGET_CONFIG = {
  small: { height: "h-[25vh]", cardPy: "py-3", cardPx: "px-3", textSize: "text-xs", subSize: "text-[10px]", gap: "gap-2" },
  medium: { height: "h-[33vh]", cardPy: "py-4", cardPx: "px-4", textSize: "text-sm", subSize: "text-xs", gap: "gap-3" },
  large: { height: "h-[45vh]", cardPy: "py-5", cardPx: "px-5", textSize: "text-base", subSize: "text-sm", gap: "gap-4" },
} as const

export const GRID_SIZE_CONFIG = {
  "1x1": { w: 267, h: 200, cols: 1, rows: 1 },
  "2x1": { w: 546, h: 200, cols: 2, rows: 1 },
  "2x2": { w: 546, h: 412, cols: 2, rows: 2 },
} as const
