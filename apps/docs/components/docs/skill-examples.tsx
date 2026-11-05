import type * as React from "react"
import { siGithub, siVercel } from "simple-icons"

import {
  CalendarDaysIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  InboxFilledIcon,
  InboxIcon,
  RefreshIcon,
  ServerIcon,
  TerminalIcon,
  TerminalSquareIcon,
  UserIcon,
  UsersIcon,
} from "@paneui/ui/icons"
import { Avatar, AvatarFallback } from "@paneui/ui/components/avatar"
import { Badge } from "@paneui/ui/components/badge"
import { BrandIcon } from "@paneui/ui/components/brand-icon"
import { Button } from "@paneui/ui/components/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@paneui/ui/components/card"
import { FileTree } from "@paneui/ui/components/file-tree"
import { IconChip } from "@paneui/ui/components/icon-chip"
import { Input } from "@paneui/ui/components/input"
import { Switch } from "@paneui/ui/components/switch"

import { SKILL_CODE } from "./skill-example-code"

/* eslint-disable shadcn/no-inline-styles -- the Avoid previews use inline values on purpose, where a class would be the thing the rule bans */

/*
 * Recommended / Avoid pairs for /docs/skill, keyed by the rule title's slug in
 * skills/paneui-design/SKILL.md. Pairs shown as code come from skill-example-code.ts, which has no
 * React, so the page frontmatter (src/pages/docs/skill.astro) can highlight them at build time.
 * "Avoid" previews break the rules on purpose, with inline styles where a class would be the very
 * thing the rule bans; the design check allow-lists this file.
 */

export type SkillExample =
  | { kind: "live"; good: React.ReactNode; bad: React.ReactNode }
  | { kind: "code"; lang: string; good: string; bad: string }

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex flex-wrap items-center gap-3">{children}</div>

/** A small panel to put rows in, so examples read like a real surface. */
const Panel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex w-56 flex-col bg-card shadow-raised frame-xl frame-p-1 ${className}`}>{children}</div>
)

const NavRow = ({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) => (
  <div
    data-active={active || undefined}
    className="flex h-8 items-center gap-2 rounded-inner px-2 text-ui text-muted-foreground data-active:bg-foreground/6 data-active:text-foreground [&_svg]:size-4"
  >
    {icon}
    {label}
  </div>
)

export const SKILL_EXAMPLES: Record<string, SkillExample> = {
  "colour-with-theme-tokens": {
    kind: "live",
    good: (
      <Row>
        <Badge variant="success">Deployed</Badge>
        <span className="text-ui text-muted-foreground">2 minutes ago</span>
      </Row>
    ),
    bad: (
      <Row>
        <span className="inline-flex h-6 items-center rounded-full px-2 text-ui-sm" style={{ background: "#dcfce7", color: "#15803d" }}>
          Deployed
        </span>
        <span className="text-ui" style={{ color: "#6b7280" }}>
          2 minutes ago
        </span>
      </Row>
    ),
  },
  "put-text-on-a-solid-in-its-foreground-token": {
    kind: "live",
    good: (
      <div className="rounded-xl bg-surface-standout px-4 py-3 text-ui text-standout-foreground">Changes saved</div>
    ),
    bad: <div className="rounded-xl bg-surface-standout px-4 py-3 text-ui text-foreground">Changes saved</div>,
  },
  "fill-for-state-surface-for-panels": {
    kind: "live",
    good: <FloatingPanel surface="bg-popover" />,
    bad: <FloatingPanel surface="bg-secondary" />,
  },
  "elevate-with-shadow-tokens-not-borders-plus-shadows": {
    kind: "live",
    good: (
      <Card className="w-56">
        <CardHeader>
          <CardTitle>Workers</CardTitle>
          <CardDescription>Deployed 4 minutes ago</CardDescription>
        </CardHeader>
      </Card>
    ),
    bad: (
      <div className="flex w-56 flex-col gap-1 rounded-xl border bg-card p-4" style={{ boxShadow: "0 12px 32px rgb(0 0 0 / 0.22)" }}>
        <span className="text-ui-lg font-semibold">Workers</span>
        <span className="text-ui text-muted-foreground">Deployed 4 minutes ago</span>
      </div>
    ),
  },
  "keep-series-on-the-chart-palette": {
    kind: "live",
    good: (
      <Legend
        items={[
          ["Requests", "bg-chart-1"],
          ["Errors", "bg-chart-2"],
          ["Cache", "bg-chart-3"],
          ["Bots", "bg-chart-4"],
        ]}
        swatch="rounded-full"
      />
    ),
    bad: (
      <Legend
        items={[
          ["Requests", "bg-primary"],
          ["Errors", "bg-primary/70"],
          ["Cache", "bg-primary/45"],
          ["Bots", "bg-primary/25"],
        ]}
        swatch="rounded-none"
      />
    ),
  },
  "keep-nested-radii-concentric": {
    kind: "live",
    good: (
      <div className="flex w-48 flex-col bg-popover shadow-surface frame-2xl frame-p-1">
        {["Rename", "Duplicate", "Archive"].map((r, i) => (
          <div key={r} data-active={i === 0 || undefined} className="flex h-7 items-center rounded-inner px-2 text-ui data-active:bg-secondary">
            {r}
          </div>
        ))}
      </div>
    ),
    bad: (
      <div data-slot="skill-avoid" className="flex w-48 flex-col rounded-2xl bg-popover p-1 shadow-surface">
        {["Rename", "Duplicate", "Archive"].map((r, i) => (
          <div
            key={r}
            data-active={i === 0 || undefined}
            className="flex h-7 items-center px-2 text-ui data-active:bg-secondary"
            style={{ borderRadius: 2 }}
          >
            {r}
          </div>
        ))}
      </div>
    ),
  },
  "stay-at-or-under-16px": {
    kind: "live",
    good: (
      <div className="flex w-60 flex-col gap-3 rounded-3xl bg-popover p-4 shadow-xl">
        <span className="text-ui-lg font-semibold">Invite people</span>
        <Input placeholder="name@company.com" aria-label="Email" />
      </div>
    ),
    bad: (
      <div className="flex w-60 flex-col gap-3 bg-popover p-4 shadow-xl" style={{ borderRadius: 32 }}>
        <span className="text-ui-lg font-semibold">Invite people</span>
        <input placeholder="name@company.com" aria-label="Email" className="h-8 bg-card px-3 text-ui shadow-well outline-none" style={{ borderRadius: 999 }} />
      </div>
    ),
  },
  "derive-every-radius-from-the-base-radius": { kind: "code", ...SKILL_CODE["derive-every-radius-from-the-base-radius"] },
  "use-the-ui-type-scale": {
    kind: "live",
    good: (
      <div className="flex flex-col gap-0.5">
        <span className="text-ui-lg font-semibold">Billing</span>
        <span className="text-ui text-muted-foreground">Next invoice on 1 November</span>
        <span className="text-ui-xs text-fg-tertiary">Updated 2 hours ago</span>
      </div>
    ),
    bad: (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold" style={{ fontSize: 17 }}>
          Billing
        </span>
        <span className="text-muted-foreground" style={{ fontSize: 15 }}>
          Next invoice on 1 November
        </span>
        <span className="text-fg-tertiary" style={{ fontSize: 9 }}>
          Updated 2 hours ago
        </span>
      </div>
    ),
  },
  "semibold-titles-medium-labels": {
    kind: "live",
    good: (
      <div className="flex w-56 flex-col gap-2">
        <span className="text-ui-lg font-semibold">Account settings</span>
        <span className="text-ui font-medium">Display name</span>
        <Input defaultValue="Qinyang" aria-label="Display name" />
      </div>
    ),
    bad: (
      <div className="flex w-56 flex-col gap-2">
        <span className="text-ui-lg font-bold">Account settings</span>
        <span className="text-ui font-bold">Display name</span>
        <Input defaultValue="Qinyang" aria-label="Display name" />
      </div>
    ),
  },
  "keep-the-font-s-tracking": {
    kind: "live",
    good: (
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-semibold tracking-tight text-balance">Usage this month</span>
        <span className="text-ui text-muted-foreground">Across all projects</span>
      </div>
    ),
    bad: (
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-semibold tracking-widest">Usage this month</span>
        <span className="text-ui tracking-tight text-muted-foreground">Across all projects</span>
      </div>
    ),
  },
  "use-tabular-numbers-for-numbers-that-change-or-align": {
    kind: "live",
    good: <Prices tabular />,
    bad: <Prices />,
  },
  "size-controls-for-desktop-density": {
    kind: "live",
    good: (
      <Row>
        <Input placeholder="Search" aria-label="Search" className="w-40" />
        <Button>Search</Button>
      </Row>
    ),
    bad: (
      <Row>
        <input placeholder="Search" aria-label="Search" className="w-40 rounded-lg bg-card px-4 shadow-well outline-none" style={{ height: 44, fontSize: 16 }} />
        <button type="button" className="rounded-lg bg-primary px-6 font-medium text-primary-foreground" style={{ height: 44, fontSize: 16 }}>
          Search
        </button>
      </Row>
    ),
  },
  "space-related-things-closer": {
    kind: "live",
    good: (
      <div className="flex w-60 flex-col">
        <span className="text-ui-lg font-semibold">Web analytics</span>
        <span className="mt-1 text-ui text-pretty text-muted-foreground">Measure traffic without changing your code.</span>
        <Button variant="outline" size="sm" className="mt-4 self-start">
          Configure
        </Button>
      </div>
    ),
    bad: (
      <div className="flex w-60 flex-col gap-4">
        <span className="text-ui-lg font-semibold">Web analytics</span>
        <span className="text-ui text-pretty text-muted-foreground">Measure traffic without changing your code.</span>
        <Button variant="outline" size="sm" className="self-start">
          Configure
        </Button>
      </div>
    ),
  },
  "start-navigation-text-on-one-left-edge": {
    kind: "live",
    good: (
      <Panel>
        <span className="px-2 pt-1.5 pb-1 text-ui-sm font-medium text-muted-foreground">Components</span>
        {["Button", "Menu", "Tabs"].map((r, i) => (
          <div key={r} data-active={i === 1 || undefined} className="flex h-7 items-center rounded-inner px-2 text-ui text-muted-foreground data-active:bg-secondary data-active:text-foreground">
            {r}
          </div>
        ))}
      </Panel>
    ),
    bad: (
      <Panel>
        <span className="px-2 pt-1.5 pb-1 text-ui-sm font-medium text-muted-foreground">Components</span>
        <div className="ml-4 flex flex-col border-l pl-2">
          {["Button", "Menu", "Tabs"].map((r, i) => (
            <div key={r} data-active={i === 1 || undefined} className="flex h-7 items-center rounded-lg px-2 text-ui text-muted-foreground data-active:bg-secondary data-active:text-foreground">
              {r}
            </div>
          ))}
        </div>
      </Panel>
    ),
  },
  "compose-the-library-don-t-restyle-it": { kind: "code", ...SKILL_CODE["compose-the-library-don-t-restyle-it"] },
  "keep-a-menu-label-inside-its-group": { kind: "code", ...SKILL_CODE["keep-a-menu-label-inside-its-group"] },
  "chevrons-for-folders-file-icons-for-files": {
    kind: "live",
    good: (
      <div className="w-56">
        {/* Data instead of FileTreeFolder/FileTreeFile parts: this module renders on the server. */}
        <FileTree
          label="Project files"
          defaultExpanded={["app"]}
          items={[
            { name: "app", type: "folder", children: [{ name: "layout.tsx", type: "file" }, { name: "page.tsx", type: "file" }] },
            { name: "public", type: "folder", children: [] },
            { name: "package.json", type: "file" },
          ]}
        />
      </div>
    ),
    bad: (
      <Panel className="frame-p-2">
        {[
          { depth: 0, open: true, name: "app" },
          { depth: 1, name: "layout.tsx" },
          { depth: 1, name: "page.tsx" },
          { depth: 0, open: false, name: "public" },
          { depth: 0, name: "package.json" },
        ].map((n) => (
          <div key={n.name} className="flex h-6.5 items-center gap-1.5 px-1 text-ui text-muted-foreground [&_svg]:size-4" style={{ paddingLeft: 4 + n.depth * 22 }}>
            {"open" in n ? n.open ? <ChevronDownIcon /> : <ChevronRightIcon /> : null}
            {"open" in n ? <FolderIcon /> : <FileIcon />}
            {n.name}
          </div>
        ))}
      </Panel>
    ),
  },
  "draw-icons-from-one-family-per-group": {
    kind: "live",
    good: (
      <Panel>
        <NavRow icon={<InboxIcon />} label="Inbox" active />
        <NavRow icon={<CalendarDaysIcon />} label="Calendar" />
        <NavRow icon={<TerminalSquareIcon />} label="Terminal" />
      </Panel>
    ),
    bad: (
      <Panel>
        <NavRow icon={<InboxFilledIcon />} label="Inbox" active />
        <NavRow icon={<CalendarIcon />} label="Calendar" />
        <NavRow icon={<TerminalIcon />} label="Terminal" />
      </Panel>
    ),
  },
  "frame-title-icons-keep-nav-icons-bare": {
    kind: "live",
    good: (
      <div className="flex w-60 items-center gap-3 rounded-xl bg-card p-3 shadow-raised">
        <IconChip>
          <ServerIcon />
        </IconChip>
        <div className="flex min-w-0 flex-col">
          <span className="text-ui font-medium">Database</span>
          <span className="text-ui-xs text-muted-foreground">3 replicas</span>
        </div>
      </div>
    ),
    bad: (
      <div className="flex w-60 items-center gap-3 rounded-xl bg-card p-3 shadow-raised">
        <ServerIcon className="size-7 text-primary-text" />
        <div className="flex min-w-0 flex-col">
          <span className="text-ui font-medium">Database</span>
          <span className="text-ui-xs text-muted-foreground">3 replicas</span>
        </div>
      </div>
    ),
  },
  "use-real-brand-marks-for-other-products": {
    kind: "live",
    good: (
      <Row>
        <Button variant="outline">
          <BrandIcon icon={siGithub} />
          Continue with GitHub
        </Button>
        <BrandIcon icon={siVercel} color="brand" size={20} title="Vercel" />
      </Row>
    ),
    bad: (
      <Row>
        <Button variant="outline">
          <span className="grid size-4 place-items-center rounded-full bg-foreground text-ui-2xs font-bold text-background">G</span>
          Continue with GitHub
        </Button>
        <span className="grid size-5 place-items-center rounded-sm bg-foreground text-ui-2xs font-bold text-background">V</span>
      </Row>
    ),
  },
  "show-people-and-workspaces-as-avatars": {
    kind: "live",
    good: (
      <Row>
        <Avatar size="md">
          <AvatarFallback>QW</AvatarFallback>
        </Avatar>
        <Avatar size="md" shape="rounded">
          <AvatarFallback>N</AvatarFallback>
        </Avatar>
        <span className="text-ui">Northwind</span>
      </Row>
    ),
    bad: (
      <Row>
        <span className="grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground [&_svg]:size-4">
          <UserIcon />
        </span>
        <span className="grid size-8 place-items-center rounded-lg bg-secondary text-muted-foreground [&_svg]:size-4">
          <UsersIcon />
        </span>
        <span className="text-ui">Northwind</span>
      </Row>
    ),
  },
  "answer-a-press-with-a-fill": {
    kind: "live",
    good: (
      <Row>
        <Button variant="outline">
          <RefreshIcon />
          Press me
        </Button>
      </Row>
    ),
    bad: (
      <Row>
        <button
          type="button"
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-card px-3 text-ui font-medium shadow-raised transition-transform duration-150 active:scale-90 [&_svg]:size-4"
        >
          <RefreshIcon />
          Press me
        </button>
      </Row>
    ),
  },
  "transition-named-properties-briefly": { kind: "code", ...SKILL_CODE["transition-named-properties-briefly"] },
  "gate-movement-on-reduced-motion": { kind: "code", ...SKILL_CODE["gate-movement-on-reduced-motion"] },
  "show-a-ring-on-keyboard-focus": {
    kind: "live",
    good: (
      <Row>
        <Button variant="outline">Tab to me</Button>
        <span className="text-ui-xs text-muted-foreground">Focus ring</span>
      </Row>
    ),
    bad: (
      <Row>
        <button type="button" className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-card px-3 text-ui font-medium shadow-raised outline-none">
          Tab to me
        </button>
        <span className="text-ui-xs text-muted-foreground">No ring</span>
      </Row>
    ),
  },
  "let-the-preview-explain": {
    kind: "live",
    good: <PreviewCard name="Switch" />,
    bad: <PreviewCard name="Switch" text="A toggle in three sizes: sm, default and lg, with labels, descriptions and disabled states." />,
  },
  "keep-descriptions-to-one-plain-sentence": {
    kind: "live",
    good: <Lede title="Date Picker" text="Picks a single date or a range." />,
    bad: (
      <Lede
        title="Date Picker"
        text="A fully accessible picker with keyboard support, presets, ranges, time zones and min/max dates. Renders in a popover (rounded-2xl, 12px) and works in forms."
      />
    ),
  },
  "never-write-colon-lists-or-stacked-adjectives": {
    kind: "live",
    good: <Lede title="Button" text="Triggers an action or submits a form." />,
    bad: <Lede title="Button" text="A powerful, seamless button in six variants: default, secondary, outline, ghost, destructive and link." />,
  },
  "describe-what-it-does-not-where-it-came-from": {
    kind: "live",
    good: <Lede title="Block Editor" text="Edits documents in blocks with slash commands." />,
    bad: <Lede title="Block Editor" text="A port of the editor everyone knows, inspired by its slash menu." />,
  },
  "name-template-parts-apart-from-registry-items": { kind: "code", ...SKILL_CODE["name-template-parts-apart-from-registry-items"] },
  "run-the-upgrade-check-after-a-theme-update": { kind: "code", ...SKILL_CODE["run-the-upgrade-check-after-a-theme-update"] },
}

function FloatingPanel({ surface }: { surface: string }) {
  return (
    <div className="relative h-28 w-60">
      <div className="flex flex-col gap-1.5 text-ui text-muted-foreground" aria-hidden>
        <span className="font-medium text-foreground">Deploy logs</span>
        <span>Building 14 routes…</span>
        <span>Uploading assets to the edge</span>
        <span>Warming caches in 12 regions</span>
      </div>
      <div className={`absolute top-6 left-10 flex w-40 flex-col shadow-surface frame-2xl frame-p-1 ${surface}`}>
        {["Copy link", "Download", "Delete"].map((r, i) => (
          <div key={r} data-active={i === 0 || undefined} className="flex h-6.5 items-center rounded-inner px-2 text-ui data-active:bg-secondary">
            {r}
          </div>
        ))}
      </div>
    </div>
  )
}

function Legend({ items, swatch }: { items: [string, string][]; swatch: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-16 items-end gap-1.5" aria-hidden>
        {[0.55, 0.9, 0.7, 0.4].map((h, i) => (
          <div key={i} className="flex w-6 flex-col-reverse gap-px">
            {items.map(([label, color], j) => (
              <span key={label} className={`block w-full ${color}`} style={{ height: `${h * 16 * (1 - j * 0.18)}px` }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5 text-ui-xs text-muted-foreground">
            <span className={`block size-2 ${swatch} ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function Prices({ tabular }: { tabular?: boolean }) {
  return (
    <div className={`flex w-48 flex-col gap-1 text-ui ${tabular ? "tabular-nums" : ""}`}>
      {[
        ["Compute", "1,118.40"],
        ["Storage", "71.11"],
        ["Bandwidth", "910.07"],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between">
          <span className="text-muted-foreground">{k}</span>
          <span className="text-right">${v}</span>
        </div>
      ))}
    </div>
  )
}

function PreviewCard({ name, text }: { name: string; text?: string }) {
  return (
    <div className="flex w-56 flex-col gap-2 rounded-xl bg-card p-3 shadow-raised">
      <div className="grid h-16 place-items-center rounded-lg bg-secondary">
        <Switch defaultChecked aria-label={name} />
      </div>
      <span className="text-ui font-medium">{name}</span>
      {text && <span className="text-ui-sm text-muted-foreground">{text}</span>}
    </div>
  )
}

function Lede({ title, text }: { title: string; text: string }) {
  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{text}</CardDescription>
      </CardHeader>
    </Card>
  )
}

/** Slug of a rule title, the key into SKILL_EXAMPLES. */
/**
 * Rules whose Recommended / Avoid pair is the one the skill ships in
 * skills/paneui-design/examples/<dir>/{good,bad}.tsx (shown as code; the design check's
 * --self-test keeps them honest). Defined in skill-example-code.ts so the page frontmatter can
 * read it without loading React.
 */
export { SKILL_CODE, SKILL_EXAMPLE_FILES, ruleSlug } from "./skill-example-code"
