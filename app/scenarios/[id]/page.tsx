"use client"

import { useParams } from "next/navigation"
import dynamic from "next/dynamic"

const ScenarioEditor = dynamic(
  () => import("@/components/editor/scenario-editor"),
  { ssr: false }
)

export default function ScenarioEditorPage() {
  const params = useParams<{ id: string }>()
  const scenarioId = Number(params.id)

  if (isNaN(scenarioId)) return null

  return <ScenarioEditor scenarioId={scenarioId} />
}
