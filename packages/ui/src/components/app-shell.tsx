"use client"

import * as React from "react"
import { useLocale } from "@paneui/ui/components/locale-provider"

import { ChevronsUpDownIcon, MenuIcon, SidebarIcon } from "@paneui/ui/icons"
import { cn } from "@paneui/ui/lib/utils"
import { Sidebar, SidebarProvider, useSidebar, type SidebarProps } from "@paneui/ui/components/animated-sidebar"
import { Drawer, DrawerContent, DrawerTitle } from "@paneui/ui/components/drawer"
import { Menu, MenuContent, MenuTrigger } from "@paneui/ui/components/menu"
import { Separator } from "@paneui/ui/components/separator"

/*
 * App chrome on one grid: a shell-coloured band holds the rail sidebar (and an optional
 * header row), and the content is an inset panel beside them.
 *
 * Sidebar first: the sidebar runs the full height, the panel carries its own header.
 *
 *   <AppShell>
 *     <AppShellSidebar>                       ← rail on desktop, drawer below lg
 *       <SidebarHeader><AppShellSwitcher …/></SidebarHeader>
 *       <SidebarContent>…</SidebarContent>
 *       <SidebarFooter><UserMenu …/></SidebarFooter>
 *     </AppShellSidebar>
 *     <AppShellMain>                          ← inset panel
 *       <AppShellInsetHeader>breadcrumb</AppShellInsetHeader>   ← trigger + divider first
 *       …
 *     </AppShellMain>
 *   </AppShell>
 *
 * Header first: a direct <AppShellHeader> child spans the top and the sidebar starts below it.
 *
 *   <AppShell>
 *     <AppShellHeader>                 ← leading slot holds <AppShellTrigger /> by default
 *       brand, nav, actions            ← start on the sidebar's label column
 *     </AppShellHeader>
 *     <AppShellSidebar>…</AppShellSidebar>
 *     <AppShellMain>…</AppShellMain>
 *   </AppShell>
 *
 * Shared geometry, all derived from the sidebar's own variables:
 *   --sidebar-width-icon        rail width; the header's leading column is exactly this wide,
 *                               so the trigger centres on the rail icons in both states.
 *   --app-shell-label-inset     where header content starts: half the rail plus half an icon
 *                               plus the icon-label gap, i.e. the sidebar's label column.
 *   --app-shell-header-height   the header row; sticky offsets read it.
 *   --app-shell-top             the header row when there is one, else 0.
 *   --app-shell-gap             the band above the panel when there is no header row (3px), else 0.
 */

/** The band between the panels and the window edge (`*-0.75`). */
const GUTTER = "0.1875rem"

const MOBILE_QUERY = "(width < 64rem)"

function subscribeMobile(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

/** True below the lg breakpoint, where the sidebar becomes a drawer. False on the server. */
function useIsMobileShell() {
  return React.useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
}

type AppShellLayout = "inset" | "sidebar" | "floating"

type AppShellContextValue = {
  variant: "page" | "window"
  layout: AppShellLayout
  isMobile: boolean
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null)

function useAppShellContext() {
  const ctx = React.useContext(AppShellContext)
  if (!ctx) throw new Error("AppShell parts must be used inside <AppShell>")
  return ctx
}

/** Shell state plus the sidebar's own (`open`, `toggle`, …). */
function useAppShell() {
  const shell = useAppShellContext()
  const sidebar = useSidebar()
  return { ...sidebar, variant: shell.variant, layout: shell.layout, isMobile: shell.isMobile, mobileOpen: shell.mobileOpen, setMobileOpen: shell.setMobileOpen }
}

type AppShellProps = React.ComponentProps<"div"> & {
  /**
   * `page`: fills the viewport; header and rail stick while the page scrolls.
   * `window`: a bounded, rounded frame whose panel scrolls on its own (give it a height).
   */
  variant?: "page" | "window"
  /**
   * `inset`: the page sits in a rounded panel on the band.
   * `sidebar`: flush; a hairline under the header and beside the rail.
   * `floating`: the rail is a rounded panel of its own beside the page.
   * Leave out `AppShellSidebar` for a header-only shell.
   */
  layout?: AppShellLayout
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** ⌘/Ctrl key that toggles the rail. `null` turns it off. */
  shortcut?: string | null
}

function AppShell({
  variant = "page",
  layout = "inset",
  open,
  defaultOpen = true,
  onOpenChange,
  shortcut = "b",
  className,
  style,
  ...props
}: AppShellProps) {
  const isMobile = useIsMobileShell()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // A drawer left open while the window grows past the breakpoint would reappear later.
  React.useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  const ctx = React.useMemo(
    () => ({ variant, layout, isMobile, mobileOpen, setMobileOpen }),
    [variant, layout, isMobile, mobileOpen]
  )

  return (
    <AppShellContext.Provider value={ctx}>
      <SidebarProvider
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        shortcut={shortcut}
        data-slot="app-shell"
        data-variant={variant}
        data-layout={layout}
        style={
          {
            "--app-shell-header-height": "3rem",
            // floating: the rail panel sits one gutter in, so the header's columns move with it
            "--app-shell-shift": layout === "floating" ? GUTTER : "0px",
            "--app-shell-label-inset": "calc(var(--sidebar-width-icon) / 2 + 1.0625rem + var(--app-shell-shift))",
            // the rail widths as set here, for the floating rail to add its gutter to
            "--app-shell-rail": "var(--sidebar-width-icon)",
            "--app-shell-rail-full": "var(--sidebar-width)",
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)] bg-shell text-foreground",
          // No header row: the sidebar runs the full height and the panel sits one gutter below the top.
          layout === "sidebar" ? "[--app-shell-gap:0px]" : "[--app-shell-gap:0.1875rem]",
          "[--app-shell-top:0px]",
          // With a header row (a direct child): the sidebar and the panel start below it, and the header
          // closes the gap. These selectors outrank the defaults above and the parts' own placement.
          "[&:has(>[data-slot=app-shell-header])]:[--app-shell-top:var(--app-shell-header-height)] [&:has(>[data-slot=app-shell-header])]:[--app-shell-gap:0px]",
          "[&:has(>[data-slot=app-shell-header])>[data-slot=sidebar]]:row-span-1 [&:has(>[data-slot=app-shell-header])>[data-slot=sidebar]]:row-start-2",
          "[&:has(>[data-slot=app-shell-header])>[data-slot=app-shell-main]]:row-span-1 [&:has(>[data-slot=app-shell-header])>[data-slot=app-shell-main]]:row-start-2",
          // Header-only shell: with no rail the panel takes the band's left gutter too.
          "[&:not(:has(>[data-slot=sidebar]))>[data-slot=app-shell-main]]:ms-0.75",
          variant === "page"
            ? "min-h-svh grid-rows-[auto_1fr]"
            : // window corners: the panel sits 3px in from the bottom-right edge, so it follows the frame
              // sidebar rows sit 8px in from the window's left corners
              "frame-3xl frame-inset-0.75 grid-rows-[auto_minmax(0,1fr)] overflow-hidden shadow-raised [--sidebar-item-radius:calc(var(--radius-3xl)-var(--spacing)*2)]",
          className
        )}
        {...props}
      />
    </AppShellContext.Provider>
  )
}

type AppShellHeaderProps = React.ComponentProps<"header"> & {
  /** Content of the rail-wide leading column. Defaults to `<AppShellTrigger />`; `null` leaves it empty. */
  leading?: React.ReactNode
}

function AppShellHeader({ leading = <AppShellTrigger />, className, children, ...props }: AppShellHeaderProps) {
  const { variant, layout } = useAppShellContext()
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        "col-span-full flex h-(--app-shell-header-height) min-w-0 items-center bg-shell pe-3",
        variant === "page" && "sticky top-0 z-40",
        layout === "sidebar" && "border-b border-border",
        className
      )}
      {...props}
    >
      {/* The slot ends on the label column; the trigger is centred in a rail-wide box inside it. */}
      <div data-slot="app-shell-header-leading" className="relative h-full w-(--app-shell-label-inset) shrink-0">
        <div className="absolute inset-y-0 start-(--app-shell-shift) grid w-(--sidebar-width-icon) place-items-center">{leading}</div>
      </div>
      <div data-slot="app-shell-header-content" className="flex h-full min-w-0 flex-1 items-center gap-1.5">
        {children}
      </div>
    </header>
  )
}

/** Toggles the rail on desktop and opens the drawer below lg. */
function AppShellTrigger({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const l10n = useLocale().labels

  const { open, toggle, isMobile, mobileOpen, setMobileOpen } = useAppShell()
  const label = isMobile ? l10n.openNavigation : open ? l10n.collapseSidebar : l10n.expandSidebar
  return (
    <button
      type="button"
      data-slot="app-shell-trigger"
      data-state={open ? "expanded" : "collapsed"}
      aria-expanded={isMobile ? mobileOpen : open}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        // read the query at click time, so the first tap is right even before the store syncs
        if (window.matchMedia(MOBILE_QUERY).matches) setMobileOpen(true)
        else toggle()
      }}
      className={cn(
        "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground outline-none",
        "hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
        className
      )}
      {...props}
      aria-label={props["aria-label"] ?? label}
    >
      <SidebarIcon className="max-lg:hidden" />
      <MenuIcon className="lg:hidden" />
    </button>
  )
}

type AppShellSidebarProps = Omit<SidebarProps, "variant"> & {
  /** Title of the drawer the sidebar becomes below lg. Lead it with an 18px mark to land on the icon column. */
  mobileTitle?: React.ReactNode
}

function AppShellSidebar({
  mobileTitle,
  className,
  panelClassName,
  rail,
  children,
  "aria-label": ariaLabel,
  ...props
}: AppShellSidebarProps) {
  const l10n = useLocale().labels
  if (ariaLabel === undefined) ariaLabel = l10n.sidebar

  const { variant, layout, isMobile, mobileOpen, setMobileOpen } = useAppShellContext()
  return (
    <>
      <Sidebar
        variant="sidebar"
        aria-label={ariaLabel}
        panelClassName={cn(
          // inset: on the band with no seam, the page panel's hairline draws the edge. Logical
          // `border-e-0` so it replaces the flush panel's `border-e` (a physical `border-x-0` doesn't).
          layout === "inset" && "border-e-0",
          // floating: a panel shaped like the page panel; rows sit 8px in, so they follow its corner
          layout === "floating" &&
            cn(
              "border-e-0 bg-background inset-ring-[0.5px] inset-ring-shell-border",
              variant === "page"
                ? "rounded-shell [--frame-inner-1:max(calc(var(--radius-shell)-var(--spacing)*2),2px)]"
                : // the window's inner radius, written out: the panel re-publishes --frame-inner-1 for its rows
                  "rounded-[calc(var(--radius-3xl)-var(--spacing)*0.75)] [--frame-inner-1:max(calc(var(--radius-3xl)-var(--spacing)*2.75),2px)]"
            ),
          panelClassName
        )}
        className={cn(
          // full height unless the shell has a header row (AppShell moves it below the header)
          "col-start-1 row-span-2 row-start-1 max-lg:hidden",
          // floating: the rail grows by the gutter it sits in, so its panel keeps the full rail width
          // and the icons stay on the header trigger's column
          layout === "floating" &&
            // eslint-disable-next-line shadcn/no-arbitrary-values -- rail widths plus the 3px gutter
            "ps-0.75 pt-(--app-shell-gap) pb-0.75 [--sidebar-width-icon:calc(var(--app-shell-rail)+0.1875rem)] [--sidebar-width:calc(var(--app-shell-rail-full)+0.1875rem)]",
          variant === "page" &&
            // eslint-disable-next-line shadcn/no-arbitrary-values -- the viewport below the header row
            "sticky top-(--app-shell-top) h-[calc(100svh-var(--app-shell-top))] self-start",
          className
        )}
        rail={rail}
        {...props}
      >
        {children}
      </Sidebar>
      {isMobile && (
        <Drawer side="left" open={mobileOpen} onOpenChange={setMobileOpen}>
          {/* eslint-disable-next-line shadcn/no-arbitrary-values -- 20rem drawer that never exceeds the viewport minus a 1rem gutter */}
          <DrawerContent className="w-[min(20rem,calc(100vw-1rem))]">
            {/* The drawer is portalled out of the shell, so it opens its own provider for the sidebar variables. */}
            <SidebarProvider
              shortcut={null}
              className="min-h-0 flex-1 flex-col"
              style={{ "--sidebar-width": rail ? "calc(100% - var(--sidebar-rail-width))" : "100%" } as React.CSSProperties}
              // a link inside the drawer navigates, so the drawer has done its job
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a[href]")) setMobileOpen(false)
              }}
            >
              {/* Same height as the close button's band; an 18px mark leading the title centres on the icon column. */}
              {/* eslint-disable-next-line shadcn/no-arbitrary-values -- half the rail minus half the 18px mark */}
              <div className="flex h-16 shrink-0 items-center ps-[calc(var(--sidebar-width-icon)/2_-_0.5625rem)] pe-14">
                <DrawerTitle className="flex min-w-0 items-center gap-2 text-ui-lg font-semibold icon-bold">{mobileTitle ?? l10n.navigation}</DrawerTitle>
              </div>
              <Sidebar
                variant="sidebar"
                collapsible="none"
                aria-label={ariaLabel}
                className="min-h-0 flex-1"
                panelClassName="border-x-0 bg-transparent"
                rail={rail}
              >
                {children}
              </Sidebar>
            </SidebarProvider>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

/**
 * The inset panel. In `page` shells it scrolls with the page and a sticky cap redraws its
 * rounded top under the header; keep at least 1rem of top padding in your content.
 */
function AppShellMain({ className, children, ...props }: React.ComponentProps<"main">) {
  const { variant, layout } = useAppShellContext()
  const panel = layout !== "sidebar"
  return (
    <main
      data-slot="app-shell-main"
      className={cn(
        // The hairline is an inset ring, not a border: a 0.5px border is snapped to a whole pixel
        // in some browsers, which would shift the cap below off the panel's edge.
        // eslint-disable-next-line shadcn/no-arbitrary-values -- 0.5px hairline: one device pixel on high-density screens
        "relative col-start-2 row-span-2 row-start-1 min-w-0 bg-background",
        panel && "mt-(--app-shell-gap) me-0.75 mb-0.75 inset-ring-[0.5px] inset-ring-shell-border max-lg:ms-0.75",
        layout === "floating" && "lg:ms-0.75",
        variant === "window" && "overflow-y-auto overscroll-contain",
        // a sidebar-first panel's own header redraws the rounded top, so the cap steps aside
        "[&:has(>[data-slot=app-shell-inset-header])>[data-slot=app-shell-cap]]:hidden",
        panel && (variant === "page" ? "rounded-shell" : "rounded-inner"),
        className
      )}
      {...props}
    >
      {variant === "page" && panel && (
        // eslint-disable-next-line shadcn/no-arbitrary-values -- the panel's top edge: below the header row, or below the band's gap
        <div aria-hidden data-slot="app-shell-cap" className="pointer-events-none sticky top-[calc(var(--app-shell-top)+var(--app-shell-gap))] z-30 h-0">
          {/* The band colour fills the square corners (and, with no header row, the gap above the panel);
              the taller rounded face is clipped to the cap so its ring has no bottom edge. */}
          {/* eslint-disable-next-line shadcn/no-arbitrary-values -- the corner band plus the gap above it */}
          <div className="absolute inset-x-0 -top-(--app-shell-gap) h-[calc(1rem+var(--app-shell-gap))] overflow-hidden bg-shell">
            {/* eslint-disable-next-line shadcn/no-arbitrary-values -- the same 0.5px hairline as the panel */}
            <div className="mt-(--app-shell-gap) h-8 rounded-t-shell bg-background inset-ring-[0.5px] inset-ring-shell-border" />
          </div>
        </div>
      )}
      {children}
    </main>
  )
}

type AppShellInsetHeaderProps = React.ComponentProps<"header"> & {
  /** Lead with `<AppShellTrigger />` and a divider. Default true; turn off in a header-first shell. */
  trigger?: boolean
}

/**
 * The panel's own header for a sidebar-first shell: the trigger, a short divider, then your
 * breadcrumb or title. Sticks to the top of the panel and redraws the panel's rounded top and
 * hairline over the content scrolling under it.
 */
function AppShellInsetHeader({ trigger = true, className, children, ...props }: AppShellInsetHeaderProps) {
  const { variant, layout } = useAppShellContext()
  const panel = layout !== "sidebar"
  const row = (
    <div className={cn("flex h-12 min-w-0 items-center gap-2 px-3", className)}>
      {trigger && (
        <>
          <AppShellTrigger />
          {/* the separator's own vertical rule is self-stretch; these override it by the same variant */}
          <Separator orientation="vertical" className="me-1 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center" />
        </>
      )}
      {children}
    </div>
  )
  return (
    <header
      data-slot="app-shell-inset-header"
      className={cn(
        "z-30 shrink-0",
        // eslint-disable-next-line shadcn/no-arbitrary-values -- the panel's top edge: below the header row, or below the band's gap
        variant === "page" ? "sticky top-[calc(var(--app-shell-top)+var(--app-shell-gap))]" : "sticky top-0",
        // page shells: the band colour fills the square corners around the rounded face
        variant === "page" && panel && "bg-shell",
        !panel && "border-b border-border bg-background"
      )}
      {...props}
    >
      {panel ? (
        <>
          {/* the band's gap above the panel, so scrolled content never shows through it */}
          {variant === "page" && <div aria-hidden className="absolute inset-x-0 bottom-full h-(--app-shell-gap) bg-shell" />}
          {/* The face is taller than its clip, so its hairline draws the top and sides but no bottom edge. */}
          <div className="h-12 overflow-hidden">
            <div
              className={cn(
                // eslint-disable-next-line shadcn/no-arbitrary-values -- the same 0.5px hairline as the panel
                "h-16 bg-background inset-ring-[0.5px] inset-ring-shell-border",
                variant === "page" ? "rounded-t-shell" : "rounded-t-inner"
              )}
            >
              {row}
            </div>
          </div>
        </>
      ) : (
        row
      )}
    </header>
  )
}

type AppShellSwitcherProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** The current team or workspace. */
  name: React.ReactNode
  /** Second line: plan, role or URL. */
  description?: React.ReactNode
  /** A 32px `<Avatar shape="rounded">` (or mark); it sits on the rail's icon column. */
  avatar: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  /** Menu contents: the other teams, "New team". */
  children?: React.ReactNode
}

/**
 * The team or workspace at the top of the sidebar: its avatar, name and a second line, opening a
 * menu. In the icon rail only the avatar shows, centred on the icon column.
 */
function AppShellSwitcher({ name, description, avatar, side = "bottom", align = "start", children, className, ...props }: AppShellSwitcherProps) {
  return (
    <Menu>
      <MenuTrigger
        data-slot="app-shell-switcher"
        className={cn(
          // 6px in from the row: a 32px avatar centres on the rail's 18px icon column
          "flex h-12 w-full min-w-0 cursor-pointer items-center gap-2 rounded-inner px-1.5 text-start text-ui outline-none",
          "hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-secondary",
          className
        )}
        {...props}
      >
        <span className="flex shrink-0 items-center">{avatar}</span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight whitespace-nowrap transition-opacity duration-200 group-data-[state=collapsed]/sidebar:opacity-0">
          <span className="truncate font-semibold icon-bold">{name}</span>
          {description && <span className="truncate text-ui-xs text-muted-foreground">{description}</span>}
        </span>
        <ChevronsUpDownIcon aria-hidden className="size-3.5 shrink-0 text-muted-foreground transition-opacity duration-200 group-data-[state=collapsed]/sidebar:opacity-0" />
      </MenuTrigger>
      <MenuContent side={side} align={align} className="w-60">
        {children}
      </MenuContent>
    </Menu>
  )
}

export { AppShell, AppShellHeader, AppShellTrigger, AppShellSidebar, AppShellMain, AppShellInsetHeader, AppShellSwitcher, useAppShell }
export type { AppShellProps, AppShellLayout, AppShellHeaderProps, AppShellSidebarProps, AppShellInsetHeaderProps, AppShellSwitcherProps }
