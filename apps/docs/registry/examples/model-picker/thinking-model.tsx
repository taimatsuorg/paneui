"use client"

import * as React from "react"
import { siClaude, siDeepseek, siGooglegemini } from "simple-icons"

import { markOpenai } from "@paneui/ui/lib/brand-marks"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { ThinkingModelPicker, type ModelOption } from "@paneui/ui/components/model-picker"

const MODELS: ModelOption[] = [
  { id: "openai/large-5", name: "OpenAI Large 5", provider: "OpenAI", icon: <BrandIcon icon={markOpenai} color="brand" /> },
  { id: "openai/mini-5", name: "OpenAI Mini 5", provider: "OpenAI", icon: <BrandIcon icon={markOpenai} color="brand" />, reasoning: false },
  { id: "anthropic/large-4", name: "Anthropic Large 4", provider: "Anthropic", icon: <BrandIcon icon={siClaude} color="brand" /> },
  { id: "google/pro-3", name: "Google Pro 3", provider: "Google", icon: <BrandIcon icon={siGooglegemini} color="brand" /> },
  { id: "deepseek/coder-4", name: "DeepSeek Coder 4", provider: "DeepSeek", icon: <BrandIcon icon={siDeepseek} color="brand" /> },
]

const LEVELS = [
  { value: "off", label: "Off" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "max", label: "Max" },
]

export default function ModelPickerThinkingModel() {
  const [model, setModel] = React.useState("openai/large-5")
  const [effort, setEffort] = React.useState("medium")
  return (
    <ThinkingModelPicker
      models={MODELS}
      value={model}
      onValueChange={setModel}
      levels={LEVELS}
      effort={effort}
      onEffortChange={setEffort}
      side="bottom"
      searchable
      searchPlaceholder="Search models"
    />
  )
}
