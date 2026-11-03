"use client"

import { T } from "@/lib/site-locale"

import type { TocEntry } from "@/components/docs/doc-toc"
import { Code, GuideH2, GuideH3, GuidePage, GuideStep, TextLink } from "@/components/docs/guide-page"
import { CLI_NAME, InstallCommand } from "@/components/docs/install-command"
import { REGISTRY_NAME, REGISTRY_URL, SITE_URL } from "@/lib/site-constants"
import { StaticCode } from "@/components/site/static-code"
import { SiteRoot, type SiteProps } from "@/components/site/site-root"
import type { DocNav } from "@/lib/doc-types"
import {
  SimpleTable,
  SimpleTableBody,
  SimpleTableCell,
  SimpleTableHead,
  SimpleTableHeader,
  SimpleTableRow,
} from "@paneui/ui/components/simple-table"

export type CliData = {
  nav: DocNav
  code: { config: string; item: string; upgradeCheck: string }
  /** Item JSON file name in the code block title bar, e.g. `paneui.dev/r/button.json`. */
  itemFilename: string
}

export default function CliPage({ site, data }: { site: SiteProps; data: CliData }) {
  const ns = `@${REGISTRY_NAME}`
  const templateUrl = (name: string) => REGISTRY_URL.replace("{name}", name)
  const templates: { name: string; what: { en: string; zh: string }; routes: string[] }[] = [
    { name: "saas", what: { en: "Marketing pages, sign-in and a dashboard", zh: "营销页面、登录页和一个仪表盘" }, routes: ["app/page.tsx", "app/not-found.tsx", "app/pricing", "app/changelog", "app/(auth)", "app/dashboard"] },
    { name: "vscode", what: { en: "A code editor with a shared workspace and terminals", zh: "带共享工作区和终端的代码编辑器" }, routes: ["app/page.tsx"] },
    { name: "agent-workspace", what: { en: "The agent workspace with its ACP bridge server", zh: "带 ACP 桥接服务器的 agent 工作区" }, routes: ["app/page.tsx", "server/acp-bridge.mjs"] },
    { name: "docs", what: { en: "A docs site", zh: "一个文档站点" }, routes: ["app/docs/page.tsx"] },
    { name: "blog", what: { en: "A blog with a post page", zh: "带文章页的博客" }, routes: ["app/blog"] },
    { name: "team-chat", what: { en: "Team chat with channels and threads", zh: "带频道和话题串的团队聊天" }, routes: ["app/page.tsx"] },
  ]
  const migrations: { version: string; changed: React.ReactNode; todo: React.ReactNode }[] = [
    {
      version: "2.3",
      changed: (
        <T
          en={
            <>
              The frame inputs (<Code>--frame-r</Code>, <Code>--frame-p</Code>, <Code>--frame-b</Code>) reset on every element in{" "}
              <Code>@layer base</Code> instead of <Code>@property</Code>, so reinstalling the theme leaves the stylesheet unchanged.
            </>
          }
          zh={
            <>
              框架输入（<Code>--frame-r</Code>、<Code>--frame-p</Code>、<Code>--frame-b</Code>）现在在{" "}
              <Code>@layer base</Code> 中为每个元素重置，而不再使用 <Code>@property</Code>，所以重新安装主题后样式表保持不变。
            </>
          }
        />
      ),
      todo: (
        <T
          en={<>Reinstall the theme, then run the upgrade check with <Code>--fix</Code> to delete the old <Code>@property</Code> rules.</>}
          zh={<>重新安装主题，然后用 <Code>--fix</Code> 运行升级检查，删除旧的 <Code>@property</Code> 规则。</>}
        />
      ),
    },
    {
      version: "2.2",
      changed: (
        <T
          en={
            <>
              Every radius token stops at <Code>--radius-max</Code> (16px), and the supported <Code>--radius</Code> range is 0
              to 1rem. Old <Code>rounded-4xl</Code> and <Code>rounded-5xl</Code> corners come out at 16px.
            </>
          }
          zh={
            <>
              每个圆角变量上限为 <Code>--radius-max</Code>（16px），支持的 <Code>--radius</Code> 范围是 0 到 1rem。旧的{" "}
              <Code>rounded-4xl</Code> 和 <Code>rounded-5xl</Code> 圆角现在输出为 16px。
            </>
          }
        />
      ),
      todo: (
        <T
          en={<>Reinstall the theme. The upgrade check flags a stylesheet without the cap or a base above 1rem.</>}
          zh={<>重新安装主题。升级检查会标记缺少上限或基准值大于 1rem 的样式表。</>}
        />
      ),
    },
    {
      version: "2.1",
      changed: (
        <T
          en={
            <>
              Wide-gamut colours and the layered popover shadow now apply. Older installs wrote them without the leading{" "}
              <Code>--</Code>, so browsers ignored them.
            </>
          }
          zh={
            <>
              广色域颜色和分层的 popover 阴影现在已生效。旧版本安装时写入它们缺少开头的 <Code>--</Code>，因此浏览器会忽略。
            </>
          }
        />
      ),
      todo: (
        <T
          en={<>Reinstall the theme, then run the upgrade check with <Code>--fix</Code> to delete the broken lines.</>}
          zh={<>重新安装主题，然后用 <Code>--fix</Code> 运行升级检查，删除损坏的行。</>}
        />
      ),
    },
    {
      version: "2",
      changed: (
        <T
          en={
            <>
              New foundation. The <Code>--accent-50</Code> to <Code>--accent-950</Code> ramp is replaced by eight role tokens;{" "}
              <Code>--radius</Code> goes from 0.625rem to 0.5rem; alpha grey text and borders; four shadow levels; Inter,
              JetBrains Mono and Newsreader font stacks; <Code>frame-*</Code> and <Code>rounded-inner</Code> utilities.
            </>
          }
          zh={
            <>
              全新的基础。原来的 <Code>--accent-50</Code> 到 <Code>--accent-950</Code> 色阶被八个角色变量取代；
              <Code>--radius</Code> 从 0.625rem 变为 0.5rem；半透明灰色文字和边框；四级阴影；Inter、JetBrains Mono 和
              Newsreader 字体栈；<Code>frame-*</Code> 和 <Code>rounded-inner</Code> 工具类。
            </>
          }
        />
      ),
      todo: (
        <T
          en={
            <>
              Move <Code>accent-*</Code> classes to <Code>primary</Code> roles, then delete the ramp (<Code>--fix</Code>). Keep
              0.625rem with <Code>--radius: 0.625rem</Code> if you prefer it. Install <Code>fonts</Code> to self-host the fonts.
              Reinstall components so nested corners use the frame utilities.
            </>
          }
          zh={
            <>
              把 <Code>accent-*</Code> 类改为 <Code>primary</Code> 角色，然后删除色阶（<Code>--fix</Code>）。如果更喜欢
              0.625rem，可用 <Code>--radius: 0.625rem</Code> 保留它。安装 <Code>fonts</Code> 以自托管字体。重新安装组件，让嵌套圆角使用
              frame 工具类。
            </>
          }
        />
      ),
    },
    {
      version: "1.x",
      changed: (
        <T
          en={
            <>
              <Code>size</Code> on <Code>Input</Code> and <Code>NativeSelect</Code> became the control size; the native
              attribute moved to <Code>htmlSize</Code>.
            </>
          }
          zh={
            <>
              <Code>Input</Code> 和 <Code>NativeSelect</Code> 上的 <Code>size</Code> 现在表示控件尺寸；原生属性改名为{" "}
              <Code>htmlSize</Code>。
            </>
          }
        />
      ),
      todo: (
        <T
          en={
            <>
              Rename numeric <Code>size</Code> props to <Code>htmlSize</Code>. The upgrade check lists each one.
            </>
          }
          zh={
            <>
              将数字形式的 <Code>size</Code> 属性改名为 <Code>htmlSize</Code>。升级检查会逐项列出。
            </>
          }
        />
      ),
    },
  ]
  const cliCommands: { usage: string; what: React.ReactNode }[] = [
    { usage: "add <items...>", what: <T en={<>Adds items and records them in <Code>paneui.json</Code>.</>} zh={<>添加条目并记录在 <Code>paneui.json</Code> 中。</>} /> },
    { usage: "search [query]", what: <T en={<>Finds items by name, title, description or category. <Code>list</Code> shows them all.</>} zh={<>按名称、标题、描述或分类查找条目。<Code>list</Code> 会显示全部。</>} /> },
    { usage: "info <item>", what: <T en="Lists an item's dependencies and files, and where the files go." zh="列出条目的依赖和文件，以及文件的写入位置。" /> },
    { usage: "update", what: <T en="Reinstalls the theme and every installed item, then your accent, radius and icon style." zh="重新安装主题和所有已安装条目，然后是主题色、圆角和图标风格。" /> },
    { usage: "theme [accent]", what: <T en={<>Reinstalls the theme with an accent and <Code>--radius</Code>. <Code>--list</Code> shows the choices.</>} zh={<>用主题色和 <Code>--radius</Code> 重新安装主题。<Code>--list</Code> 显示可选值。</>} /> },
  ]
  const toc: TocEntry[] = [
    { id: "templates", title: "Templates in one command" },
    { id: "new-project", title: "New project", depth: 2 },
    { id: "existing-project", title: "Existing project", depth: 2 },
    { id: "the-registry", title: "The registry" },
    { id: "own-cli", title: { en: `The ${CLI_NAME} CLI`, zh: `${CLI_NAME} 命令行工具` } },
    { id: "shadcn-commands", title: { en: "shadcn CLI commands", zh: "shadcn CLI 命令" } },
    { id: "add", title: "add", depth: 2 },
    { id: "view", title: "view", depth: 2 },
    { id: "search", title: "search", depth: 2 },
    { id: "by-url", title: "Install by URL", depth: 2 },
    { id: "updating", title: "Updating" },
    { id: "upgrading", title: "Upgrading after a theme change" },
    { id: "migrations", title: "Migrations", depth: 2 },
    { id: "cli-limits", title: "What the CLI merges", depth: 2 },
    { id: "icon-style", title: "Switch the icon style" },
    { id: "item-types", title: "Item types" },
  ]
  return (
    <SiteRoot {...site}>
    <GuidePage href="/docs/cli" nav={data.nav} toc={toc}>
      <section className="flex flex-col gap-4">
        <GuideH2 id="templates">Templates in one command</GuideH2>
        <p className="text-muted-foreground">
          <T
            en="Templates install by URL. Pick the path that matches where you start."
            zh="模板通过 URL 安装。选择与你当前情况相符的路径。"
          />
        </p>
        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="new-project">New project</GuideH3>
          <p className="text-muted-foreground">
            <T
              en={<>Use <Code>init</Code> when you&apos;re starting from nothing. It creates the Next.js app with the theme and every component the template needs, so there is nothing to set up first.</>}
              zh={<>如果是从零开始，请使用 <Code>init</Code>。它会创建 Next.js 应用，并带上主题和模板需要的所有组件，因此无需事先配置。</>}
            />
          </p>
          <InstallCommand args={`init -d -n my-saas ${templateUrl("saas")}`} />
          <p className="text-muted-foreground">
            <T
              en={<>Then run <Code>cd my-saas</Code> and <Code>pnpm dev</Code>.</>}
              zh={<>然后运行 <Code>cd my-saas</Code> 和 <Code>pnpm dev</Code>。</>}
            />
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="existing-project">Existing project</GuideH3>
          <p className="text-muted-foreground">
            <T
              en={<>Use <Code>add</Code> when the app is already set up and you want the template&apos;s pages next to your own.</>}
              zh={<>如果应用已经搭建好，而你想把模板的页面放在自己的页面旁边，请使用 <Code>add</Code>。</>}
            />
          </p>
          <InstallCommand args={`add ${templateUrl("saas")}`} />
          <p className="text-muted-foreground">
            <T en="Before you run it, check these." zh="运行之前，请先确认以下几点。" />
          </p>
          <ul className="flex list-disc flex-col gap-2 ps-5 text-muted-foreground marker:text-border">
            <li>
              <T
                en={<>The app uses the App Router and Tailwind CSS 4. If it has no <Code>components.json</Code>, the CLI offers to create one first.</>}
                zh={<>应用使用 App Router 和 Tailwind CSS 4。如果没有 <Code>components.json</Code>，CLI 会先提示创建一个。</>}
              />
            </li>
            <li>
              <T
                en={<>Your work is committed, so you can review the diff afterwards. Add <Code>--dry-run</Code> to list the files without writing them.</>}
                zh={<>你的工作已提交，方便之后查看差异。加上 <Code>--dry-run</Code> 可以只列出文件而不写入。</>}
              />
            </li>
            <li>
              <T
                en={<>Nothing you need lives at the template&apos;s routes (table below). The CLI asks before replacing an existing file; <Code>--overwrite</Code> replaces it without asking.</>}
                zh={<>模板的路由位置上没有你需要的文件（见下表）。CLI 在替换已有文件前会询问；<Code>--overwrite</Code> 会直接替换而不询问。</>}
              />
            </li>
            <li>
              <T
                en={<>The theme rewrites its variables in your global CSS, so custom values under the same names are replaced. Re-apply them after.</>}
                zh={<>主题会重写全局 CSS 中的变量，因此同名下的自定义值会被替换。请在之后重新应用。</>}
              />
            </li>
          </ul>
          <p className="text-muted-foreground">
            <T
              en={<>The notion-editor and email-editor blocks install the same way, for example{" "}<Code>add {templateUrl("notion-editor")}</Code>.</>}
              zh={<>notion-editor 和 email-editor 区块的安装方式相同，例如{" "}<Code>add {templateUrl("notion-editor")}</Code>。</>}
            />
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="template-list">Pick a template</GuideH3>
          <p className="text-muted-foreground">
            <T
              en={<>Swap <Code>saas</Code> in either command for another name. Each one also adds its parts under <Code>components/&lt;name&gt;/</Code>.</>}
              zh={<>在任一命令中把 <Code>saas</Code> 换成其他名称即可。每个模板还会把它的部件添加到 <Code>components/&lt;name&gt;/</Code> 下。</>}
            />
          </p>
          <SimpleTable className="min-w-xl">
              <SimpleTableHeader>
                <SimpleTableRow>
                  <SimpleTableHead><T en="Template" zh="模板" /></SimpleTableHead>
                  <SimpleTableHead><T en="You get" zh="你将获得" /></SimpleTableHead>
                  <SimpleTableHead><T en="Writes to" zh="写入位置" /></SimpleTableHead>
                </SimpleTableRow>
              </SimpleTableHeader>
              <SimpleTableBody>
                {templates.map((t) => (
                  <SimpleTableRow key={t.name}>
                    <SimpleTableCell variant="code">{t.name}</SimpleTableCell>
                    <SimpleTableCell><T en={t.what.en} zh={t.what.zh} /></SimpleTableCell>
                    <SimpleTableCell>
                      <span className="flex flex-wrap gap-1">
                        {t.routes.map((r) => (
                          <Code key={r}>{r}</Code>
                        ))}
                      </span>
                    </SimpleTableCell>
                  </SimpleTableRow>
                ))}
              </SimpleTableBody>
            </SimpleTable>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="the-registry">The registry</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={<>PaneUI is published as one static JSON file per item at <Code>{SITE_URL}/r/&lt;name&gt;.json</Code>. Register the namespace so every command below accepts short names like <Code>{ns}/button</Code>.</>}
            zh={<>PaneUI 以每个条目一个静态 JSON 文件的形式发布在 <Code>{SITE_URL}/r/&lt;name&gt;.json</Code>。注册命名空间后，下面所有命令都可以使用像 <Code>{ns}/button</Code> 这样的短名称。</>}
          />
        </p>
        <StaticCode html={data.code.config} filename="components.json" language="json" />
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="own-cli"><T en={`The ${CLI_NAME} CLI`} zh={`${CLI_NAME} 命令行工具`} /></GuideH2>
        <p className="text-muted-foreground">
          <T
            en="Runs the shadcn CLI for you and records what it installs, so one command updates every item and the theme. Both CLIs write the same files; use either."
            zh="它替你运行 shadcn CLI 并记录安装内容，因此一条命令即可更新所有条目和主题。两个 CLI 写入相同的文件；任选其一。"
          />
        </p>
        <InstallCommand cli="paneui" args="init" />
        <p className="text-muted-foreground">
          <T
            en={<>Registers the namespace above in <Code>components.json</Code>, running <Code>shadcn init</Code> first if there is none, and installs the theme.</>}
            zh={<>在上面的 <Code>components.json</Code> 中注册命名空间，如果没有则先运行 <Code>shadcn init</Code>，并安装主题。</>}
          />
        </p>
        <SimpleTable className="min-w-xl">
          <SimpleTableHeader>
            <SimpleTableRow>
              <SimpleTableHead><T en="Command" zh="命令" /></SimpleTableHead>
              <SimpleTableHead><T en="What it does" zh="作用" /></SimpleTableHead>
            </SimpleTableRow>
          </SimpleTableHeader>
          <SimpleTableBody>
            {cliCommands.map((cmd) => (
              <SimpleTableRow key={cmd.usage}>
                <SimpleTableCell variant="code">{cmd.usage}</SimpleTableCell>
                <SimpleTableCell>{cmd.what}</SimpleTableCell>
              </SimpleTableRow>
            ))}
          </SimpleTableBody>
        </SimpleTable>
        <p className="text-muted-foreground">
          <T
            en={<><Code>update</Code> replaces files whole, so commit first and preview with <Code>--dry-run</Code>. It also finds items you added with the shadcn CLI. Templates are skipped unless you pass <Code>--templates</Code>, because reinstalling one replaces its routes.</>}
            zh={<><Code>update</Code> 会整体替换文件，所以请先提交，并用 <Code>--dry-run</Code> 预览。它也会找到你用 shadcn CLI 添加的条目。模板默认跳过，除非传入 <Code>--templates</Code>，因为重新安装模板会替换其路由。</>}
          />
        </p>
        <InstallCommand cli="paneui" args="update --dry-run" />
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="shadcn-commands">
          <T en="shadcn CLI commands" zh="shadcn CLI 命令" />
        </GuideH2>
        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="add">add</GuideH3>
          <p className="text-muted-foreground">
            <T
              en={<>Copies one or more items into your project, along with their <Code>registryDependencies</Code> (other{" "}<Code>{ns}</Code> items) and npm <Code>dependencies</Code>.</>}
              zh={<>将一个或多个条目复制到你的项目，并带上它们的 <Code>registryDependencies</Code>（其他{" "}<Code>{ns}</Code> 条目）和 npm <Code>dependencies</Code>。</>}
            />
          </p>
          <InstallCommand args={`add ${ns}/date-range-picker ${ns}/tool-result`} />
          <p className="text-muted-foreground">
            <T
              en={<>Add <Code>--dry-run</Code> to preview the files without writing them, or <Code>--diff &lt;path&gt;</Code> to see what would change in a file you already have. Use <Code>--overwrite</Code> to replace existing files and{" "}<Code>--path</Code> to choose where they go.</>}
              zh={<>加上 <Code>--dry-run</Code> 可以预览文件而不写入，或用 <Code>--diff &lt;path&gt;</Code> 查看已有文件中将发生的变化。使用 <Code>--overwrite</Code> 替换已有文件，用 <Code>--path</Code> 指定写入位置。</>}
            />
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="view">view</GuideH3>
          <p className="text-muted-foreground">
            <T en="Prints an item's metadata and source before you install it." zh="在安装前打印条目的元数据和源码。" />
          </p>
          <InstallCommand args={`view ${ns}/prompt-bar`} />
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="search">search</GuideH3>
          <p className="text-muted-foreground">
            <T
              en={<>Lists the items in the registry, optionally filtered with <Code>-q</Code>. <Code>list</Code> is an alias.</>}
              zh={<>列出组件库中的条目，可用 <Code>-q</Code> 过滤。<Code>list</Code> 是它的别名。</>}
            />
          </p>
          <InstallCommand args={`search ${ns} -q "chart"`} />
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="by-url">Install by URL</GuideH3>
          <p className="text-muted-foreground">
            <T
              en={<>Any command also takes an item&apos;s URL in place of its name. Keep the namespace registered anyway, because items depend on other <Code>{ns}</Code> items such as the theme.</>}
              zh={<>任何命令都可以用条目 URL 代替名称。请仍然注册命名空间，因为条目依赖其他 <Code>{ns}</Code> 条目，例如主题。</>}
            />
          </p>
          <InstallCommand args={`add ${REGISTRY_URL.replace("{name}", "button")}`} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="updating">Updating</GuideH2>
        <p className="text-muted-foreground">
          <T
            en={<>Installed files are yours, so nothing updates on its own. To pull a newer version of an item, compare first with <Code>--diff</Code>, then re-add it with <Code>--overwrite</Code> and re-apply any local edits. Check the <TextLink href="/docs/changelog">Changelog</TextLink> for what moved.</>}
            zh={<>已安装的文件属于你，不会自动更新。要获取条目的新版本，先用 <Code>--diff</Code> 比较，再用 <Code>--overwrite</Code> 重新添加并重新应用你的本地修改。查看 <TextLink href="/docs/changelog">更新日志</TextLink> 了解变更。</>}
          />
        </p>
        <InstallCommand args={`add ${ns}/button --diff components/ui/button.tsx`} />
        <p className="text-muted-foreground">
          <T
            en={<>To update everything at once, run <Code>update</Code> from the <TextLink href="#own-cli">{CLI_NAME} CLI</TextLink>.</>}
            zh={<>要一次性更新所有内容，请运行 <TextLink href="#own-cli">{CLI_NAME} CLI</TextLink> 中的 <Code>update</Code>。</>}
          />
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="upgrading">Upgrading after a theme change</GuideH2>
        <p className="text-muted-foreground">
          <T
            en="When a release changes the theme, update it first, then the components that use it. Commit before you start so you can review every change."
            zh="当某个版本更改了主题时，先更新主题，再更新使用它的组件。开始前请先提交，以便查看每一处改动。"
          />
        </p>
        <div className="flex flex-col gap-8 pt-2">
          <GuideStep n={1} id="upgrade-theme" title={<T en="Reinstall the theme" zh="重新安装主题" />}>
            <p className="text-muted-foreground">
              <T
                en={<><Code>--overwrite</Code> is required. The theme also ships <Code>packages/ui/src/lib/utils.ts</Code>, and without it a non-interactive run stops at that question before the stylesheet is touched.</>}
                zh={<><Code>--overwrite</Code> 是必需的。主题还会附带 <Code>packages/ui/src/lib/utils.ts</Code>，没有它时，非交互运行会在触及样式表之前停在这个问题上。</>}
              />
            </p>
            <InstallCommand args={`add ${ns}/theme --overwrite`} />
          </GuideStep>
          <GuideStep n={2} id="upgrade-presets" title={<T en="Reinstall your presets" zh="重新安装预设" />}>
            <p className="text-muted-foreground">
              <T
                en="If you use accent or radius presets, reinstall them so they apply on top of the new theme."
                zh="如果你使用主题色或圆角预设，重新安装它们，让它们应用在新主题之上。"
              />
            </p>
          </GuideStep>
          <GuideStep n={3} id="upgrade-check" title={<T en="Run the upgrade check" zh="运行升级检查" />}>
            <p className="text-muted-foreground">
              <T
                en={<>It lists tokens the release removed, broken rules from older installs and code that uses a changed API, with a fix for each. <Code>--fix</Code> cleans the stylesheet, then checks again and lists only what is left; it never edits your source.</>}
                zh={<>它会列出该版本移除的变量、旧安装产生的损坏规则以及使用已变更 API 的代码，并为每项给出修复方法。<Code>--fix</Code> 会清理样式表，然后再次检查并只列出剩余问题；它从不修改你的源码。</>}
              />
            </p>
            <InstallCommand args={`add ${ns}/upgrade-check`} />
            <StaticCode html={data.code.upgradeCheck} language="bash" lineNumbers={false} />
          </GuideStep>
          <GuideStep n={4} id="upgrade-components" title={<T en="Re-add your components" zh="重新添加组件" />}>
            <p className="text-muted-foreground">
              <T
                en={<>Re-add the components you use with <Code>--overwrite</Code>, a few at a time, and re-apply local edits from the diff.</>}
                zh={<>用 <Code>--overwrite</Code> 分批重新添加你使用的组件，并根据差异重新应用本地修改。</>}
              />
            </p>
          </GuideStep>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="migrations">Migrations</GuideH3>
          <p className="text-muted-foreground">
            <T en="Newest first. Each step lists only what needs your attention." zh="最新的在前。每一步只列出需要你处理的内容。" />
          </p>
          <SimpleTable className="min-w-xl">
              <SimpleTableHeader>
                <SimpleTableRow>
                  <SimpleTableHead><T en="Theme" zh="主题" /></SimpleTableHead>
                  <SimpleTableHead><T en="What changed" zh="变更内容" /></SimpleTableHead>
                  <SimpleTableHead><T en="What to do" zh="需要做什么" /></SimpleTableHead>
                </SimpleTableRow>
              </SimpleTableHeader>
              <SimpleTableBody>
                {migrations.map((m) => (
                  <SimpleTableRow key={m.version}>
                    <SimpleTableCell variant="code">{m.version}</SimpleTableCell>
                    <SimpleTableCell>{m.changed}</SimpleTableCell>
                    <SimpleTableCell>{m.todo}</SimpleTableCell>
                  </SimpleTableRow>
                ))}
              </SimpleTableBody>
            </SimpleTable>
          <p className="text-muted-foreground">
            <T
              en={<>The installed version is <Code>meta.version</Code> in <Code>{ns}/theme</Code>; <Code>view {ns}/theme</Code>{" "}prints the current one.</>}
              zh={<>已安装的版本是 <Code>{ns}/theme</Code> 中的 <Code>meta.version</Code>；<Code>view {ns}/theme</Code> 会打印当前版本。</>}
            />
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-2">
          <GuideH3 id="cli-limits">What the CLI merges</GuideH3>
          <ul className="flex list-disc flex-col gap-2 ps-5 text-muted-foreground marker:text-border">
            <li>
              <T
                en={<>Variables in <Code>:root</Code>, <Code>.dark</Code> and <Code>@theme</Code> are added or updated in place, so new values replace old ones under the same name.</>}
                zh={<><Code>:root</Code>、<Code>.dark</Code> 和 <Code>@theme</Code> 中的变量会就地添加或更新，因此新值会替换同名旧值。</>}
              />
            </li>
            <li>
              <T
                en={<>Nothing is ever removed. A token a release drops stays in your stylesheet, along with any utility it generates; the upgrade check finds them.</>}
                zh={<>永远不会删除任何内容。某个版本移除的变量会留在你的样式表中，连同它生成的工具类；升级检查会找到它们。</>}
              />
            </li>
            <li>
              <T
                en={<>Rules inside <Code>@supports</Code> and <Code>@media</Code> blocks merge by selector and property, the same as variables.</>}
                zh={<><Code>@supports</Code> 和 <Code>@media</Code> 块中的规则按选择器和属性合并，与变量相同。</>}
              />
            </li>
            <li>
              <T
                en={<><Code>@property</Code> rules are appended again on every reinstall, so the theme ships none. Copies left by theme 2.2 and earlier are harmless; the upgrade check removes them.</>}
                zh={<><Code>@property</Code> 规则会在每次重新安装时再次追加，因此主题自身不附带任何 <Code>@property</Code> 规则。主题 2.2 及更早版本留下的副本无碍；升级检查会移除它们。</>}
              />
            </li>
            <li>
              <T
                en={<>Files with a <Code>~/</Code> target, such as the design skill and the upgrade check, land at the project root even when your components live under <Code>src/</Code>.</>}
                zh={<>目标带 <Code>~/</Code> 的文件（例如设计技能和升级检查）会落在项目根目录，即使你的组件位于 <Code>src/</Code> 下。</>}
              />
            </li>
            <li>
              <T
                en={<>Component files are replaced whole with <Code>--overwrite</Code>, or skipped after a prompt without it. Use{" "}<Code>--diff</Code> or <Code>--dry-run</Code> first; there is no three-way merge of your edits.</>}
                zh={<>组件文件在 <Code>--overwrite</Code> 下整体替换，否则在提示后跳过。请先用 <Code>--diff</Code> 或 <Code>--dry-run</Code>；不会对你的修改做三方合并。</>}
              />
            </li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="icon-style">Switch the icon style</GuideH2>
        <p className="text-muted-foreground">
          <T
            en="The icon set comes in two styles with the same exports, and both install to the same file. Replace it to switch the icons in every component."
            zh="图标集有两种风格，导出相同，且都安装到同一个文件。替换它即可切换所有组件中的图标。"
          />
        </p>
        <InstallCommand args={`add ${templateUrl("icons-emoji")} --overwrite`} />
        <p className="text-muted-foreground">
          <T en="To go back to the default rounded set, run this." zh="要回到默认的圆角图标集，请运行这条命令。" />
        </p>
        <InstallCommand args={`add ${templateUrl("icons")} --overwrite`} />
        <p className="text-muted-foreground">
          <T
            en={<>When you later add an item that uses icons, the CLI asks before overwriting <Code>components/icons.tsx</Code>. Answer no to keep your style. A non-interactive run stops at that question. If you add with <Code>--overwrite</Code>, the rounded set comes back, so run your style&apos;s command again. Compare the styles on{" "}<TextLink href="/docs/icons#icon-styles">Icons</TextLink>.</>}
            zh={<>之后添加使用图标的条目时，CLI 会在覆盖 <Code>components/icons.tsx</Code> 前询问。回答否以保留你的风格。非交互运行会停在这个问题。如果使用 <Code>--overwrite</Code> 添加，圆角图标集会回来，因此请再次运行你的风格对应命令。在<TextLink href="/docs/icons#icon-styles">图标</TextLink>页面比较各风格。</>}
          />
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <GuideH2 id="item-types">Item types</GuideH2>
        <ul className="flex list-disc flex-col gap-2 ps-5 text-muted-foreground marker:text-border">
          <li>
            <T
              en={<><Code>registry:ui</Code> is a component, installed to your <Code>ui</Code> alias.</>}
              zh={<><Code>registry:ui</Code> 是组件，安装到你的 <Code>ui</Code> 别名。</>}
            />
          </li>
          <li>
            <T
              en={<><Code>registry:block</Code> is a block or template, which can ship several files including a{" "}<Code>page.tsx</Code>.</>}
              zh={<><Code>registry:block</Code> 是区块或模板，可以包含多个文件，其中包括 <Code>page.tsx</Code>。</>}
            />
          </li>
          <li>
            <T
              en={<><Code>registry:theme</Code> is the theme or an accent preset, which writes CSS variables rather than files (see{" "}<TextLink href="/docs/theming">Theming</TextLink>).</>}
              zh={<><Code>registry:theme</Code> 是主题或主题色预设，它写入 CSS 变量而不是文件（参见<TextLink href="/docs/theming">主题</TextLink>）。</>}
            />
          </li>
          <li>
            <T
              en={<><Code>registry:lib</Code> and <Code>registry:component</Code> are shared files such as <Code>{ns}/utils</Code>{" "}and <Code>{ns}/icons</Code>.</>}
              zh={<><Code>registry:lib</Code> 和 <Code>registry:component</Code> 是共享文件，例如 <Code>{ns}/utils</Code>{" "}和 <Code>{ns}/icons</Code>。</>}
            />
          </li>
        </ul>
        <p className="text-muted-foreground">
          <T en="This is a trimmed item file as the CLI receives it." zh="这是 CLI 收到的条目文件（已精简）。" />
        </p>
        <StaticCode html={data.code.item} filename={data.itemFilename} language="json" />
      </section>
    </GuidePage>
    </SiteRoot>
  )
}
