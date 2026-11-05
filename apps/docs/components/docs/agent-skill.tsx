"use client"

import { T, useT } from "@/lib/site-locale"

import * as React from "react"

import { CheckIcon, CopyIcon, DownloadIcon, FileIcon } from "@paneui/ui/icons"
import { CommandPill } from "@/components/docs/install-command"
import { ActionSwapBlurIcon } from "@paneui/ui/components/action-swap-blur"
import { Button } from "@paneui/ui/components/button"
import { CodeBlock } from "@paneui/ui/components/code-block"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@paneui/ui/components/collapsible"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
/**
 * Install command, copy/download and a collapsible preview of one of the repo's agent
 * skills. `SKILL.md` is served by app/skills/<name>/SKILL.md/route.ts from skills/<name>/SKILL.md;
 * `html` is the same text highlighted at build time.
 */
export function AgentSkill({ name, skill, html }: { name: string; skill: string; html: string }) {
  const t = useT()
  const skillUrl = `${BASE_PATH}/skills/${name}/SKILL.md`
  const install = `npx skills add taimatsuorg/paneui --skill ${name}`
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  return (
    <div className="flex flex-col gap-4">
      <CommandPill command={install} />
      <Collapsible>
        <div className="frame-xl frame-p-1 flex items-center gap-1 bg-card shadow-raised">
          <CollapsibleTrigger className="min-w-0 flex-1">
            <FileIcon className="text-muted-foreground" />
            <span className="truncate font-mono">SKILL.md</span>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="sm"
            aria-live="polite"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(skill)
                setCopied(true)
              } catch {
                // clipboard blocked: the download link still works
              }
            }}
          >
            <ActionSwapBlurIcon value={copied ? "copied" : "copy"}>
              {copied ? <CheckIcon data-icon="inline-start" className="text-success-text" /> : <CopyIcon data-icon="inline-start" />}
            </ActionSwapBlurIcon>
            {t(copied ? { en: "Copied", zh: "已复制" } : { en: "Copy", zh: "复制" })}
          </Button>
          <Button variant="ghost" size="sm" nativeButton={false} render={<a href={skillUrl} download="SKILL.md" />}>
            <DownloadIcon data-icon="inline-start" />
            <T en="Download" zh="下载" />
          </Button>
        </div>
        {/* The panel clips while it animates. The negative margin and matching padding give the
            sheet's outer hairline room inside that clip, so it keeps its edge on the page colour. */}
        <CollapsiblePanel className="-mx-1 -mb-1">
          <div className="px-1 pt-2 pb-1">
            <CodeBlock html={html} maxHeight={480} copyable={false} />
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  )
}
