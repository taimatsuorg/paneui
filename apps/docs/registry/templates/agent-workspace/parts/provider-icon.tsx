import { ClaudeAI, Gemini, OpenAIDark, OpenAILight } from "@ridemountainpig/svgl-react"

import { BotIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { BrandIcon, type BrandIconSource } from "@paneui/ui/components/brand-icon"

import type { AgentProvider } from "./agents"

const MARKS: Partial<Record<AgentProvider, BrandIconSource>> = {
  codex: { light: OpenAILight, dark: OpenAIDark },
  claude: ClaudeAI,
  gemini: Gemini,
}

/** Mark for an agent provider: the vendor's logo, or a neutral glyph for custom agents. */
export function ProviderIcon({ provider, className }: { provider: string | undefined; className?: string }) {
  const mark = MARKS[(provider ?? "custom") as AgentProvider]
  if (mark) return <BrandIcon icon={mark} color="brand" className={className} />
  return <BotIcon className={cn("text-muted-foreground", className)} />
}

/** Guesses the vendor from a model id or name when the agent sends no group. */
export function modelProvider(model: string): AgentProvider | undefined {
  const m = model.toLowerCase()
  if (/^(gpt|o\d|codex)/.test(m)) return "codex"
  if (/(claude|sonnet|opus|haiku)/.test(m)) return "claude"
  if (m.includes("gemini")) return "gemini"
  return undefined
}
