"use client"

import type * as React from "react"

import { cn } from "@paneui/ui/lib/utils"
import { Badge } from "@paneui/ui/components/badge"
import { Card } from "@paneui/ui/components/card"

import { T } from "@/lib/site-locale"

import { ACCENT_VARS, PRESET_THEMES, type AccentVar } from "./accent-color"
import { useAccentState } from "./accent-store"
import { modeValue, type ParsedTheme, type TokenKind, type TokenRole } from "./theming-tokens"
import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@paneui/ui/components/simple-table"

/** Tokens the accent replaces. */
const isAccentToken = (name: string): name is AccentVar => (ACCENT_VARS as readonly string[]).includes(name)

/**
 * One mode's preview: a tile painted with that mode's own page background (so translucent
 * fills and hairlines read as they do in that mode, whatever mode the docs are in),
 * holding the token as a fill, as text, or as a line.
 */
function ModeSwatch({ kind, value, bg }: { kind: TokenKind; value: string; bg: string | undefined }) {
  const vars = { "--t-bg": bg, "--t-v": value } as React.CSSProperties
  return (
    <span
      aria-hidden
      style={vars}
      className="frame-md frame-p-1 flex h-8 w-11 shrink-0 bg-(--t-bg) shadow-chip"
    >
      {kind === "text" ? (
        <span className="grid flex-1 place-items-center text-ui font-semibold text-(--t-v)">Aa</span>
      ) : kind === "line" ? (
        <span className="grid flex-1 place-items-center">
          <span className="block h-full w-full rounded-inner border-2 border-(--t-v)" />
        </span>
      ) : (
        <span className="block flex-1 rounded-inner bg-(--t-v)" />
      )}
    </span>
  )
}

function ValueCell({ kind, value, bg, wrap = false }: { kind: TokenKind; value: string | undefined; bg: string | undefined; wrap?: boolean }) {
  if (!value) return <span className="text-muted-foreground">—</span>
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <ModeSwatch kind={kind} value={value} bg={bg} />
      <span className={cn("min-w-0 font-mono text-ui-xs text-muted-foreground", wrap ? "break-all" : "whitespace-nowrap")}>{value}</span>
    </span>
  )
}

/**
 * Token tables by role: token and Tailwind class, light and dark value with a live swatch each.
 * Values come from packages/tokens/styles/globals.css (parsed at build time); the ten accent roles follow the
 * accent you pick, in both modes, as resolved colours.
 */
export function ThemingTokenTable({ role, theme }: { role: TokenRole; theme: ParsedTheme }) {
  const { accent, custom } = useAccentState()
  const accentTheme = accent === "custom" ? custom : PRESET_THEMES[accent]
  const valueFor = (name: string, which: "light" | "dark") => {
    if (isAccentToken(name) && accentTheme) return accentTheme[which][name]
    return modeValue(theme, name, which)
  }

  return (
    <>
      {/* Phones: one entry per token, light and dark stacked, values wrapping inside the card. */}
      <Card data-md-skip render={<ul />} className="gap-0 py-0 sm:hidden">
        {role.tokens.map((t) => (
          <li key={t.name} className="flex min-w-0 flex-col gap-2 border-b px-4 py-3 text-sm last:border-b-0">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
              <code className="font-mono text-xs text-foreground">--{t.name}</code>
              {t.note === "accent" ? (
                <Badge variant="primary" size="sm">
                  <T en="accent" zh="主题色" />
                </Badge>
              ) : null}
              <code className="basis-full font-mono text-ui-xs break-all text-muted-foreground">{t.cls}</code>
            </span>
            {(["light", "dark"] as const).map((mode) => (
              <span key={mode} className="flex min-w-0 items-center gap-2.5">
                <span className="w-8 shrink-0 text-ui-xs text-muted-foreground capitalize">
                  <T en={mode} zh={mode === "light" ? "浅色" : "深色"} />
                </span>
                <ValueCell kind={t.kind} value={valueFor(t.name, mode)} bg={valueFor(t.on ?? "background", mode)} wrap />
              </span>
            ))}
          </li>
        ))}
      </Card>
    <SimpleTable containerClassName="max-sm:hidden" className="min-w-xl table-fixed">
        <SimpleTableHeader>
          <SimpleTableRow>
            <SimpleTableHead className="w-2/5">
              <T en="Token / class" zh="变量 / 类名" />
            </SimpleTableHead>
            <SimpleTableHead>
              <T en="Light" zh="浅色" />
            </SimpleTableHead>
            <SimpleTableHead>
              <T en="Dark" zh="深色" />
            </SimpleTableHead>
          </SimpleTableRow>
        </SimpleTableHeader>
        <SimpleTableBody>
          {role.tokens.map((t) => (
            <SimpleTableRow key={t.name}>
              <SimpleTableCell className="align-middle whitespace-nowrap">
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <code className="font-mono text-xs text-foreground">--{t.name}</code>
                    {t.note === "accent" ? (
                      <Badge variant="primary" size="sm">
                        <T en="accent" zh="主题色" />
                      </Badge>
                    ) : null}
                  </span>
                  <code className="font-mono text-ui-xs text-muted-foreground">{t.cls}</code>
                </span>
              </SimpleTableCell>
              <SimpleTableCell className="align-middle">
                <ValueCell kind={t.kind} value={valueFor(t.name, "light")} bg={valueFor(t.on ?? "background", "light")} />
              </SimpleTableCell>
              <SimpleTableCell className="align-middle">
                <ValueCell kind={t.kind} value={valueFor(t.name, "dark")} bg={valueFor(t.on ?? "background", "dark")} />
              </SimpleTableCell>
            </SimpleTableRow>
          ))}
        </SimpleTableBody>
      </SimpleTable>
    </>
  )
}
