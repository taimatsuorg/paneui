import type * as React from "react"

import { Card, CardDescription, CardTitle } from "@paneui/ui/components/card"
import { T } from "@/lib/site-locale"

import { Code } from "./guide-page"
import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@paneui/ui/components/simple-table"

/** Variable → utility → consumer, one row per kind of token in packages/tokens/styles/globals.css. */
const LAYERS: {
  variable: string
  value: React.ReactNode
  utility: React.ReactNode
  usedBy: { en: string; zh: string }
}[] = [
  {
    variable: "--background",
    value: "#fff",
    utility: <Code>bg-background</Code>,
    usedBy: { en: "Page canvas", zh: "页面画布" },
  },
  {
    variable: "--primary",
    value: "#0090ff",
    utility: (
      <>
        <Code>bg-primary</Code> <Code>text-primary-foreground</Code>
      </>
    ),
    usedBy: { en: "Filled buttons, switches, checks, selection", zh: "填充按钮、开关、勾选、选中状态" },
  },
  {
    variable: "--border",
    value: "#00000017",
    utility: <Code>border-border</Code>,
    usedBy: { en: "Every divider and edge", zh: "所有分隔线和边缘" },
  },
  {
    variable: "--radius",
    value: "0.5rem",
    utility: <Code>rounded-sm … rounded-3xl</Code>,
    usedBy: { en: "All corners", zh: "所有圆角" },
  },
  {
    variable: "--shadow-default",
    value: <T en="hairline + 1px drop" zh="细线 + 1px 投影" />,
    utility: <Code>shadow-raised</Code>,
    usedBy: { en: "Resting cards and controls", zh: "静止状态的卡片和控件" },
  },
  {
    variable: "--text-ui",
    value: "0.8125rem",
    utility: <Code>text-ui</Code>,
    usedBy: { en: "Buttons, inputs, menus, nav", zh: "按钮、输入框、菜单、导航" },
  },
]

const STEPS: { title: { en: string; zh: string }; body: React.ReactNode }[] = [
  {
    title: { en: "Map each mode", zh: "为每种模式映射值" },
    body: (
      <T
        en={
          <>
            Put light values on <Code>:root</Code> and dark values on <Code>.dark</Code>, under the same names.
          </>
        }
        zh={
          <>
            把浅色值放在 <Code>:root</Code>，深色值放在 <Code>.dark</Code>，并使用相同的名称。
          </>
        }
      />
    ),
  },
  {
    title: { en: "Use semantic utilities", zh: "使用语义化工具类" },
    body: (
      <T
        en={
          <>
            Write <Code>bg-card</Code> or <Code>text-muted-foreground</Code>, never palette colours or hex.
          </>
        }
        zh={
          <>
            使用 <Code>bg-card</Code> 或 <Code>text-muted-foreground</Code>，不要使用调色板颜色或十六进制值。
          </>
        }
      />
    ),
  },
  {
    title: { en: "Keep it central", zh: "保持集中" },
    body: (
      <T
        en={
          <>
            Skip <Code>dark:</Code> colour overrides in components, so a theme change stays one edit in one file.
          </>
        }
        zh={
          <>
            不要在组件中写 <Code>dark:</Code> 颜色覆盖，这样换主题只需改动一个文件的一处。
          </>
        }
      />
    ),
  },
]

const EXTRAS: { name: React.ReactNode; body: { en: string; zh: string } }[] = [
  {
    name: <Code>--radius</Code>,
    body: {
      en: "One base that every corner multiplies, so nested corners stay concentric.",
      zh: "所有圆角都由同一个基准值相乘得到，因此嵌套圆角保持同心。",
    },
  },
  {
    name: <Code>text-ui-*</Code>,
    body: { en: "The type scale for text inside components.", zh: "组件内部文字的字体层级。" },
  },
  {
    name: <Code>--shadow-*</Code>,
    body: {
      en: "Four shadow levels behind shadow-xs to shadow-xl and the named elevation.",
      zh: "shadow-xs 到 shadow-xl 背后的四级阴影，以及具名高度。",
    },
  },
  {
    name: <Code>--font-*</Code>,
    body: { en: "The UI, code and reading font stacks.", zh: "界面、代码和阅读的字体栈。" },
  },
  {
    name: <Code>--shell</Code>,
    body: { en: "Colours for app chrome around the content panel.", zh: "内容面板周围应用外框的颜色。" },
  },
  {
    name: <Code>--scrollbar</Code>,
    body: { en: "Scrollbar thumb colours.", zh: "滚动条滑块的颜色。" },
  },
]

/** "How the system works" for the Theming page: two layers, two modes, one accent. */
export function ThemingSystem() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground">
        <T
          en={
            <>
              The theme has two layers. <strong className="font-medium text-foreground">Values</strong> are CSS
              variables in <Code>globals.css</Code>, named for what a colour is for, such as <Code>--card</Code>.{" "}
              <strong className="font-medium text-foreground">Utilities</strong> map each variable to a class in{" "}
              <Code>@theme inline</Code>, so <Code>--card</Code> becomes <Code>bg-card</Code>. Components use only the
              utilities, so changing a value restyles every component without touching its file.
            </>
          }
          zh={
            <>
              主题分为两层。<strong className="font-medium text-foreground">值</strong>是 <Code>globals.css</Code> 中的
              CSS 变量，按颜色的用途命名，例如 <Code>--card</Code>。
              <strong className="font-medium text-foreground">工具类</strong>在 <Code>@theme inline</Code>{" "}
              中把每个变量映射为一个类，因此 <Code>--card</Code> 变为 <Code>bg-card</Code>。
              组件只使用这些工具类，所以修改变量值会重新设置每个组件的样式，而无需改动其文件。
            </>
          }
        />
      </p>

      <SimpleTable className="min-w-xl">
          <SimpleTableHeader>
            <SimpleTableRow>
              <SimpleTableHead>
                <T en="Variable" zh="变量" />
              </SimpleTableHead>
              <SimpleTableHead>
                <T en="Utility" zh="工具类" />
              </SimpleTableHead>
              <SimpleTableHead>
                <T en="Read by" zh="使用方" />
              </SimpleTableHead>
            </SimpleTableRow>
          </SimpleTableHeader>
          <SimpleTableBody>
            {LAYERS.map((l) => (
              <SimpleTableRow key={l.variable}>
                <SimpleTableCell>
                  <span className="flex flex-col gap-0.5">
                    <code className="font-mono text-xs text-foreground">{l.variable}</code>
                    <span className="font-mono text-ui-xs whitespace-nowrap text-muted-foreground">{l.value}</span>
                  </span>
                </SimpleTableCell>
                <SimpleTableCell>{l.utility}</SimpleTableCell>
                <SimpleTableCell>
                  <T en={l.usedBy.en} zh={l.usedBy.zh} />
                </SimpleTableCell>
              </SimpleTableRow>
            ))}
          </SimpleTableBody>
        </SimpleTable>

      <p className="text-muted-foreground">
        <T
          en={
            <>
              Dark mode works the same way. <Code>.dark</Code> on <Code>&lt;html&gt;</Code> points the same variables at
              dark values, so a component written once is right in both modes. The accent is ten of those variables,{" "}
              <Code>--primary</Code> to <Code>--selection</Code>, which a preset swaps together.
            </>
          }
          zh={
            <>
              深色模式同理。在 <Code>&lt;html&gt;</Code> 上加上 <Code>.dark</Code> 会让相同的变量指向深色值，因此只写
              一次的组件在两种模式下都正确。主题色是其中十个变量，从 <Code>--primary</Code> 到 <Code>--selection</Code>，
              由预设一起替换。
            </>
          }
        />
      </p>

      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <Card key={s.title.en} render={<li />} className="gap-1.5 px-4">
            <span aria-hidden className="font-mono text-ui-xs text-muted-foreground tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <CardTitle>
              <T en={s.title.en} zh={s.title.zh} />
            </CardTitle>
            <CardDescription className="text-sm">{s.body}</CardDescription>
          </Card>
        ))}
      </ol>

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground">
          <T en="The same file also holds these tokens." zh="同一个文件还包含以下变量。" />
        </p>
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {EXTRAS.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span data-md-after=":" className="w-24 shrink-0">
                {e.name}
              </span>
              <span>
                <T en={e.body.en} zh={e.body.zh} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
