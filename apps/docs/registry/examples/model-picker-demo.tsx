"use client"

import * as React from "react"
import { ClaudeAI, Gemini, OpenAIDark, OpenAILight } from "@ridemountainpig/svgl-react"

import { ShieldIcon } from "@paneui/ui/icons"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { EffortPicker, ModelPicker, ModePicker } from "@paneui/ui/components/model-picker"

const MODELS = [
  { id: "gpt-6.1-sol", name: "GPT-6.1 Sol", provider: "OpenAI", icon: <BrandIcon icon={{ light: OpenAILight, dark: OpenAIDark }} color="brand" /> },
  { id: "gpt-6.1-mini", name: "GPT-6.1 Mini", provider: "OpenAI", icon: <BrandIcon icon={{ light: OpenAILight, dark: OpenAIDark }} color="brand" /> },
  { id: "sonnet-5.5", name: "Sonnet 5.5", provider: "Anthropic", icon: <BrandIcon icon={ClaudeAI} color="brand" /> },
  { id: "gemini-4-pro", name: "Gemini 4 Pro", provider: "Google", icon: <BrandIcon icon={Gemini} color="brand" /> },
]

const MODES = [
  { id: "ask", name: "Ask first", description: "Ask before edits and commands", icon: <ShieldIcon /> },
  { id: "auto", name: "Auto-edit", description: "Edit freely, ask before commands", icon: <ShieldIcon /> },
  { id: "full", name: "Full access", description: "Never ask", icon: <ShieldIcon />, tone: "warning" as const },
]

export default function ModelPickerDemo() {
  const [mode, setMode] = React.useState("full")
  const [model, setModel] = React.useState("gpt-6.1-sol")
  const [effort, setEffort] = React.useState("high")
  return (
    <div className="flex items-center gap-1 rounded-3xl bg-card p-2 shadow-raised">
      <ModePicker modes={MODES} value={mode} onValueChange={setMode} label="Access" side="bottom" />
      <ModelPicker models={MODELS} value={model} onValueChange={setModel} side="bottom" />
      <EffortPicker value={effort} onValueChange={setEffort} side="bottom" />
    </div>
  )
}
