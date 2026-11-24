"use client"

import * as React from "react"
import {
  ClaudeAI,
  DeepSeek,
  Gemini,
  Meta,
  MistralAI,
  OpenAIDark,
  OpenAILight,
  QwenDark,
  QwenLight,
  XAIDark,
  XAILight,
} from "@ridemountainpig/svgl-react"

import { BrandIcon, type BrandIconSource } from "@paneui/ui/components/brand-icon"
import { ModelPicker, type ModelOption } from "@paneui/ui/components/model-picker"

const PROVIDERS: [string, BrandIconSource][] = [
  ["Anthropic", ClaudeAI],
  ["DeepSeek", DeepSeek],
  ["Google", Gemini],
  ["Meta", Meta],
  ["Mistral", MistralAI],
  ["OpenAI", { light: OpenAILight, dark: OpenAIDark }],
  ["Qwen", { light: QwenLight, dark: QwenDark }],
  ["xAI", { light: XAILight, dark: XAIDark }],
]
const SIZES = ["Mini", "Small", "Medium", "Large", "Max", "Turbo", "Vision", "Coder"]

// A long catalogue, the shape a model router returns.
const MODELS: ModelOption[] = PROVIDERS.flatMap(([provider, mark]) =>
  SIZES.map((size, i) => ({
    id: `${provider.toLowerCase()}/${size.toLowerCase()}-${i + 2}`,
    name: `${provider} ${size} ${i + 2}`,
    provider,
    icon: <BrandIcon icon={mark} color="brand" />,
  }))
)

export default function ModelPickerSearchable() {
  const [model, setModel] = React.useState("openai/large-5")
  return <ModelPicker models={MODELS} value={model} onValueChange={setModel} side="bottom" searchable maxPerGroup={3} searchPlaceholder="Search models" />
}
