import * as React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@paneui/ui-native";
import { type ColorScheme } from "@paneui/tokens";
import { categories, components } from "./docs/registry";
import { guides } from "./docs/guides";
import { sources } from "./docs/sources.generated";
import "./docs/shell.css";
import { ExampleLanguage } from "./docs/language";
import { api } from "./docs/api.generated";
import { reference } from "./docs/reference";

type Language = "en" | "zh";
type Mode = ColorScheme | "system";
const base = process.env.EXPO_PUBLIC_NATIVE_BASE_PATH ?? "";
const href = (slug: string) => `${base}/${slug ? `${slug}/` : ""}`;
function currentRoute() {
  return (
    decodeURIComponent(location.pathname)
      .replace(new RegExp(`^${base}`), "")
      .replace(/^\/+|\/+$/g, "") || "introduction"
  );
}
function saved<T extends string>(
  key: string,
  values: readonly T[],
  fallback: T,
): T {
  try {
    const value = localStorage.getItem(key) as T;
    return values.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
function Logo() {
  const { colors } = useTheme();
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={colors.foreground}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="11.75" height="6.75" rx="1.25" />
      <rect
        x="15.25"
        y="2"
        width="6.75"
        height="11.75"
        rx="1.25"
        fill={colors.primary}
      />
      <rect x="10.25" y="15.25" width="11.75" height="6.75" rx="1.25" />
      <rect x="2" y="10.25" width="6.75" height="11.75" rx="1.25" />
    </svg>
  );
}

function Preview({
  slug,
  Example,
  zh,
}: {
  slug: string;
  Example: React.ComponentType;
  zh: boolean;
}) {
  const [tab, setTab] = React.useState("preview");
  const id = React.useId();
  return (
    <div className="example-frame">
      <div
        className="preview-toolbar"
        role="tablist"
        aria-label={zh ? "示例视图" : "Example view"}
      >
        {["preview", "code"].map((value) => (
          <button
            key={value}
            id={`${id}-${value}`}
            role="tab"
            aria-selected={tab === value}
            aria-controls={`${id}-panel`}
            onClick={() => setTab(value)}
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? "preview"
                    : event.key === "End"
                      ? "code"
                      : value === "preview"
                        ? "code"
                        : "preview";
                setTab(next);
                document.getElementById(`${id}-${next}`)?.focus();
              }
            }}
            tabIndex={tab === value ? 0 : -1}
          >
            {value === "preview"
              ? zh
                ? "预览"
                : "Preview"
              : zh
                ? "代码"
                : "Code"}
          </button>
        ))}
        <span className="preview-platform">Native</span>
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-${tab}`}
        tabIndex={0}
      >
        {tab === "preview" ? (
          <div className="live-preview">
            <Example />
          </div>
        ) : (
          <pre>
            <code>{sources[slug]}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function GalleryPreview({ Example }: { Example: React.ComponentType }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref}>{visible ? <Example /> : null}</div>;
}

function Docs({
  language,
  setLanguage,
  mode,
  setMode,
}: {
  language: Language;
  setLanguage: (v: Language) => void;
  mode: Mode;
  setMode: (v: Mode) => void;
}) {
  const { colors, scheme, radius, controlRadius, headingFont } = useTheme();
  const [route, setRoute] = React.useState(currentRoute);
  const [menu, setMenu] = React.useState(false);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const menuButton = React.useRef<HTMLButtonElement>(null);
  const zh = language === "zh";
  const t = (en: string, cn: string) => (zh ? cn : en);
  const index = zh ? 1 : 0;
  const item = components.find((entry) => entry.slug === route);
  const guide = guides.find((entry) => entry.slug === route);
  const overview = route === "components";
  const title =
    item?.name ??
    guide?.title[index] ??
    (overview ? t("Components", "组件") : t("Page not found", "未找到页面"));
  const sequence = [
    ...guides.map((entry) => ({ slug: entry.slug, name: entry.title[index] })),
    { slug: "components", name: t("Components", "组件") },
    ...components.map((entry) => ({ slug: entry.slug, name: entry.name })),
  ];
  const position = sequence.findIndex((entry) => entry.slug === route);
  const headings =
    guide?.sections.map((section) => ({
      id: section.id,
      title: section.title[index],
    })) ??
    (item
      ? [
          ...item.examples.map((example) => ({
            id: example.id,
            title: example.title[index],
          })),
          { id: "usage", title: t("Usage", "使用") },
          { id: "api", title: "API" },
          { id: "accessibility", title: t("Accessibility", "无障碍") },
        ]
      : []);
  React.useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    let active = true;
    if (id)
      void document.fonts.ready.then(() => {
        if (active) document.getElementById(id)?.scrollIntoView();
      });
    return () => {
      active = false;
    };
  }, [route]);
  React.useEffect(() => {
    const pop = () => {
      setRoute(currentRoute());
      setMenu(false);
    };
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, []);
  React.useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.documentElement.style.colorScheme = scheme;
    document.title = `${title} · PaneUI Native`;
    document.body.style.backgroundColor = colors.background;
  }, [language, scheme, title, colors.background]);
  React.useEffect(() => {
    if (menu) dialog.current?.showModal();
    else if (dialog.current?.open) dialog.current.close();
  }, [menu]);
  function navigate(event: React.MouseEvent<HTMLAnchorElement>, slug: string) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    event.preventDefault();
    history.pushState({}, "", href(slug));
    setRoute(slug);
    setMenu(false);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => document.getElementById("main")?.focus());
  }
  const link = (slug: string, label: string, extra?: string) => (
    <a
      key={slug}
      className={extra}
      href={href(slug)}
      onClick={(event) => navigate(event, slug)}
      aria-current={route === slug ? "page" : undefined}
    >
      {label}
    </a>
  );
  const navigation = (
    <nav aria-label={t("Native documentation", "原生文档")}>
      <h2>{t("Getting started", "开始使用")}</h2>
      {guides.map((entry) => link(entry.slug, entry.title[index]))}
      <h2>{t("Components", "组件")}</h2>
      {link("components", t("Overview", "概览"))}
      {Object.entries(categories).map(([category, labels]) => (
        <React.Fragment key={category}>
          <h3>{labels[index]}</h3>
          {components
            .filter((entry) => entry.category === category)
            .map((entry) => link(entry.slug, entry.name))}
        </React.Fragment>
      ))}
    </nav>
  );
  const vars = {
    "--font-heading": headingFont ?? "inherit",
    "--radius-control": `${controlRadius}px`,
    ...Object.fromEntries(
      Object.entries(colors).map(([name, value]) => [
        `--${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`,
        value,
      ]),
    ),
    ...Object.fromEntries(
      Object.entries(radius).map(([name, value]) => [
        `--radius-${name}`,
        `${value}px`,
      ]),
    ),
  } as React.CSSProperties;
  return (
    <ExampleLanguage.Provider value={language}>
      <div className="native-docs" style={vars}>
        <a className="skip-link" href="#main">
          {t("Skip to content", "跳至内容")}
        </a>
        <header className="site-header">
          <div className="header-brand">
            <button
              ref={menuButton}
              className="menu-button"
              aria-label={t("Open navigation", "打开导航")}
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              ☰
            </button>
            <a
              href={href("introduction")}
              onClick={(e) => navigate(e, "introduction")}
              className="wordmark"
            >
              <Logo />
              <span>paneui</span>
            </a>
          </div>
          <nav className="header-tabs" aria-label={t("Site", "站点")}>
            <a href="/docs/">{t("Docs", "文档")}</a>
            <a href="/docs/components/">{t("Components", "组件")}</a>
            <a
              href={href("introduction")}
              aria-current="page"
              onClick={(e) => navigate(e, "introduction")}
            >
              Native
            </a>
          </nav>
          <div className="header-actions">
            <button
              aria-label={t("Switch to Chinese", "切换到英文")}
              onClick={() => setLanguage(zh ? "en" : "zh")}
            >
              {zh ? "EN" : "中文"}
            </button>
            <label className="theme-label">
              <span className="sr-only">{t("Theme", "主题")}</span>
              <select
                aria-label={t("Theme", "主题")}
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
              >
                <option value="system">{t("System", "系统")}</option>
                <option value="light">{t("Light", "浅色")}</option>
                <option value="dark">{t("Dark", "深色")}</option>
              </select>
            </label>
            <a
              className="repo-link"
              href="https://github.com/taimatsuorg/paneui"
              aria-label={t("Source repository", "源码仓库")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={colors.foreground}
                aria-hidden="true"
              >
                <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.55v-2.14c-3.21.7-3.89-1.36-3.89-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.3-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.16c0 .3.21.66.79.55A11.5 11.5 0 0 0 12 .7Z" />
              </svg>
            </a>
          </div>
        </header>
        <div className="docs-layout">
          <aside className="sidebar">
            {navigation}
            <a className="back-web" href="/docs/">
              {t("Web docs ↗", "网页文档 ↗")}
            </a>
          </aside>
          <main id="main" tabIndex={-1} key={route}>
            <div className="page-heading">
              <p className="eyebrow">
                {item
                  ? categories[item.category][index]
                  : overview
                    ? "Native"
                    : t("Getting started", "开始使用")}
              </p>
              <h1>{title}</h1>
              <p className="lede">
                {item?.lede[index] ??
                  guide?.lede[index] ??
                  (overview
                    ? t(
                        "Choose a component to try it.",
                        "选择一个组件，试试它的用法。",
                      )
                    : t(
                        "Choose a page from the navigation.",
                        "请从导航中选择页面。",
                      ))}
              </p>
            </div>
            {guide?.sections.map((section) => (
              <section key={section.id}>
                <h2 id={section.id}>
                  <a href={`#${section.id}`}>
                    {section.title[index]}
                    <span aria-hidden="true"> #</span>
                  </a>
                </h2>
                <p>{section.body[index]}</p>
                {section.code && (
                  <pre>
                    <code>{section.code}</code>
                  </pre>
                )}
              </section>
            ))}
            {item && (
              <>
                {item.examples.map((example) => (
                  <section key={example.id}>
                    <h2 id={example.id}>
                      <a href={`#${example.id}`}>
                        {example.title[index]}
                        <span aria-hidden="true"> #</span>
                      </a>
                    </h2>
                    <Preview
                      slug={`${item.slug}/${example.id}`}
                      Example={example.Example}
                      zh={zh}
                    />
                  </section>
                ))}
                <section>
                  <h2 id="usage">
                    <a href="#usage">
                      {t("Usage", "使用")}
                      <span aria-hidden="true"> #</span>
                    </a>
                  </h2>
                  <pre>
                    <code>{reference[item.slug].usage[index]}</code>
                  </pre>
                  <p>
                    {t(
                      "Wrap your app in ThemeProvider to follow the theme.",
                      "用 ThemeProvider 包裹应用以跟随主题。",
                    )}{" "}
                    {link("installation", t("Installation guide", "安装指南"))}
                  </p>
                </section>
                <section>
                  <h2 id="api">
                    <a href="#api">
                      API<span aria-hidden="true"> #</span>
                    </a>
                  </h2>
                  <p>
                    {t(
                      "Required props are marked with *; — means no explicit default. Inherited props are accepted by each part.",
                      "必填属性标有 *；— 表示未指定默认值。各部分也接受继承的属性。",
                    )}
                  </p>
                  {api[item.slug as keyof typeof api]
                    ?.filter((group) => group.name !== "FieldState")
                    .map((group) => (
                      <div key={group.name}>
                        <h3>{group.name}</h3>
                        {group.extends && (
                          <p>
                            <code>{group.extends}</code>
                          </p>
                        )}
                        {group.props.length > 0 && (
                          <div
                            className="api-scroll"
                            tabIndex={0}
                            role="region"
                            aria-label={`${group.name} API`}
                          >
                            <table>
                              <thead>
                                <tr>
                                  {[
                                    t("Prop", "属性"),
                                    t("Type", "类型"),
                                    t("Default", "默认值"),
                                    t("Description", "说明"),
                                  ].map((label) => (
                                    <th key={label} scope="col">
                                      {label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {group.props.map((prop) => (
                                  <tr key={prop.name}>
                                    <th scope="row">
                                      <code>
                                        {prop.name}
                                        {prop.required ? " *" : ""}
                                      </code>
                                    </th>
                                    <td>
                                      <code>{prop.type}</code>
                                    </td>
                                    <td>
                                      <code>{prop.default}</code>
                                    </td>
                                    <td>{prop.description[index]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                </section>
                <section>
                  <h2 id="accessibility">
                    <a href="#accessibility">
                      {t("Accessibility", "无障碍")}
                      <span aria-hidden="true"> #</span>
                    </a>
                  </h2>
                  <p>{reference[item.slug].accessibility[index]}</p>
                </section>
              </>
            )}
            {overview && (
              <div className="component-grid">
                {components.map((entry) => (
                  <article className="component-card" key={entry.slug}>
                    <h2>{link(entry.slug, entry.name)}</h2>
                    <div className="card-preview">
                      <GalleryPreview Example={entry.examples[0].Example} />
                    </div>
                  </article>
                ))}
              </div>
            )}
            {!item &&
              !guide &&
              !overview &&
              link("introduction", t("Go to introduction", "前往简介"))}
            {position >= 0 && (
              <footer className="page-footer">
                {[sequence[position - 1], sequence[position + 1]].map(
                  (entry, i) =>
                    entry ? (
                      <a
                        key={entry.slug}
                        href={href(entry.slug)}
                        onClick={(event) => navigate(event, entry.slug)}
                      >
                        <span>
                          {i === 0
                            ? t("Previous", "上一页")
                            : t("Next", "下一页")}
                        </span>
                        <strong>
                          {i === 0 ? "← " : ""}
                          {entry.name}
                          {i === 1 ? " →" : ""}
                        </strong>
                      </a>
                    ) : (
                      <div key={i} />
                    ),
                )}
              </footer>
            )}
          </main>
          <aside className="toc" hidden={headings.length === 0}>
            <p>{t("On this page", "本页内容")}</p>
            {headings.map((heading) => (
              <a href={`#${heading.id}`} key={heading.id}>
                {heading.title}
              </a>
            ))}
          </aside>
        </div>
        <dialog
          ref={dialog}
          className="navigation-drawer"
          aria-label={t("Navigation", "导航")}
          onCancel={() => setMenu(false)}
          onClose={() => {
            setMenu(false);
            menuButton.current?.focus();
          }}
          onClick={(event) => {
            if (event.target === dialog.current) setMenu(false);
          }}
        >
          <div className="drawer-heading">
            <span>{t("Navigation", "导航")}</span>
            <button
              onClick={() => setMenu(false)}
              aria-label={t("Close navigation", "关闭导航")}
            >
              ×
            </button>
          </div>
          {navigation}
          <a className="back-web" href="/docs/">
            {t("Web docs ↗", "网页文档 ↗")}
          </a>
        </dialog>
      </div>
    </ExampleLanguage.Provider>
  );
}
export default function App() {
  const [language, setLanguage] = React.useState<Language>(() =>
    saved("native-docs-language", ["en", "zh"], "en"),
  );
  const [mode, setMode] = React.useState<Mode>(() =>
    saved("native-docs-theme", ["light", "dark", "system"], "system"),
  );
  React.useEffect(() => {
    try {
      localStorage.setItem("native-docs-language", language);
      localStorage.setItem("native-docs-theme", mode);
    } catch {
      /* Preferences still work when storage is unavailable. */
    }
  }, [language, mode]);
  return (
    <SafeAreaProvider>
      <ThemeProvider mode={mode === "system" ? undefined : mode}>
        <Docs
          language={language}
          setLanguage={setLanguage}
          mode={mode}
          setMode={setMode}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
