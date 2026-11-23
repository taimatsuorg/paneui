"""Writes the colour tokens of the default style (Warm Stone) and everything that mirrors them:

- packages/tokens/styles/globals.css: the colour mappings in `@theme inline`, the `:root` / `.dark` token blocks,
  and the `html[data-accent]` preset blocks (between `gen-theme` markers);
- packages/tokens/styles/theme-accents.css (the runtime preset bundle);
- apps/docs/components/docs/accent-presets.generated.ts and the preset CSS inside packages/ui/src/components/accent-picker.tsx;
- packages/registry/registry.json: the `theme` item (cssVars, css, version) and the `theme-<accent>` items.

Run through `pnpm tokens:gen`. Values live here; never edit the generated blocks by hand.
"""
import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from theme_color import Ok, hex_to_oklch, ratio, solve_alpha  # noqa: E402
from theme_roles import TAGS, accent_roles, status_roles, solid_for, tag_roles  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
GLOBALS = ROOT / "packages/tokens/styles/globals.css"
ACCENTS_CSS = ROOT / "packages/tokens/styles/theme-accents.css"
PRESETS_TS = ROOT / "apps/docs/components/docs/accent-presets.generated.ts"
PICKER = ROOT / "packages/ui/src/components/accent-picker.tsx"
REGISTRY = ROOT / "packages/registry/registry.json"
THEME_VERSION = "2.6"

WHITE, BLACK = Ok(1), Ok(0)
PAGE = {"light": Ok(0.965, 0.007, 82), "dark": Ok(0.175, 0.007, 70)}
CARD = {"light": Ok(0.992, 0.004, 85), "dark": Ok(0.22, 0.008, 70)}
POPOVER = {"light": Ok(0.996, 0.002, 85), "dark": Ok(0.255, 0.008, 70)}
SHELL = {"light": Ok(0.935, 0.009, 80), "dark": Ok(0.14, 0.007, 70)}
CODE = {"light": Ok(0.942, 0.007, 82), "dark": Ok(0.20, 0.007, 70)}
# The Paper page is also checked so shared accent and status presets read cleanly on both styles.
PAPER_PAGE = {"light": Ok(0.99, 0.002, 234.82), "dark": Ok(0.195, 0.004, 289.15)}
PAPER_POPOVER = {"light": Ok(0.998, 0.001, 234.82), "dark": Ok(0.255, 0.004, 289.15)}


def ink_ok(alpha, dark=False):
    return Ok(0.945, 0.008, 82, alpha) if dark else Ok(0.20, 0.01, 65, alpha)


def ink(alpha, dark=False):
    return ink_ok(alpha, dark).css()


def solve_ink(target, dark, pages, under):
    return solve_alpha(lambda a: ink_ok(a, dark), lambda c: all(ratio(c, p, under) >= target for p in pages), 0.02, 1)


def hue(h):
    L, C, H = hex_to_oklch(h)
    return L, C, H


# ───────────────────────────── neutrals ─────────────────────────────
def neutrals(mode):
    dark = mode == "dark"
    page = PAGE[mode]
    fg = ink_ok(1.0, dark)
    fill_hover = ink_ok(0.075 if dark else 0.065, dark)
    fill_active = ink_ok(0.12 if dark else 0.11, dark)
    fill_strong = ink_ok(0.17 if dark else 0.16, dark)
    muted_alpha = max(
        0.68,
        solve_ink(4.7, dark, [page, CARD[mode], POPOVER[mode], SHELL[mode], fill_hover, fill_active], page),
    )
    tert_alpha = solve_ink(3.2, dark, [page, CARD[mode]], page)
    border_control = solve_ink(3.15, dark, [page, CARD[mode]], page)
    return {
        # Surfaces: Warm Stone page, warm white/lifted card and popover, opaque.
        "background": page,
        "card": CARD[mode],
        "popover": POPOVER[mode],
        "surface-sunken": Ok(0, 0, 0, 0.32) if dark else ink_ok(0.06, False),
        "surface-standout": Ok(0.945, 0.008, 82) if dark else Ok(0.22, 0.01, 65),
        "standout-foreground": Ok(0.175, 0.007, 70) if dark else Ok(0.98, 0.004, 85),
        # Text: primary, secondary (≥ 4.5:1), tertiary (≥ 3:1: meta, placeholders), disabled. Warm translucent ink.
        "foreground": fg,
        "card-foreground": fg,
        "popover-foreground": fg,
        "muted-foreground": ink_ok(muted_alpha, dark),
        "fg-tertiary": ink_ok(tert_alpha, dark),
        "fg-disabled": ink_ok(round(tert_alpha * 0.68, 3), dark),
        # Fills, translucent ink: hover (rest of a filled control), active (pressed, open, selected), strong (pressed on hover).
        "fill-hover": fill_hover,
        "fill-active": fill_active,
        "fill-strong": fill_strong,
        # The shadcn names read the fills.
        "secondary": "var(--fill-hover)",
        "secondary-foreground": fg,
        "muted": "var(--fill-hover)",
        "accent": "var(--fill-active)",
        "accent-foreground": fg,
        # Borders: subtle (separators), default (cards, outline buttons), strong (hover, emphasis), control (≥ 3:1 edge).
        "border": ink_ok(0.12 if dark else 0.13, dark),
        "border-subtle": ink_ok(0.07, dark),
        "border-strong": ink_ok(0.22 if dark else 0.24, dark),
        "border-control": ink_ok(border_control, dark),
        "input": ink_ok(0.15 if dark else 0.16, dark),
    }


# ───────────────────────────── status ─────────────────────────────
def status(mode):
    pages = [PAGE[mode], CARD[mode], POPOVER[mode], PAPER_PAGE[mode], PAPER_POPOVER[mode]]
    dark = mode == "dark"
    out = {}
    for name, hx in [("destructive", "#d13f26"), ("success", "#188653"), ("info", "#066bb8")]:
        L, C, H = hue(hx)
        if dark:
            fg = Ok(0.20, 0.02, H)
            solid = solid_for(fg, H, min(C, 0.145), 0.73)
            out.update(status_roles(name, solid, fg, pages, mode, text_chroma=0.95, text_start=solid.L))
        else:
            solid = solid_for(WHITE, H, C, L)
            out.update(status_roles(name, solid, WHITE, pages, mode))
    L, C, H = hue("#e06d14")
    fg = Ok(0.20, 0.03, H)
    if dark:
        solid = solid_for(fg, H, C, max(L, 0.76))
        out.update(status_roles("warning", solid, fg, pages, mode, text_chroma=0.95, text_start=solid.L))
    else:
        out.update(status_roles("warning", solid_for(fg, H, C, L), fg, pages, mode))
    return out


# ───────────────────────────── accents ─────────────────────────────
PRESET_ORDER = ["blue", "neutral", "green", "orange", "rose", "violet"]
PRESET_LIGHT = {
    "blue": (0.52, 0.145, 250.0),
    "green": (0.52, 0.125, 158.0),
    "orange": (0.57, 0.175, 40.0),
    "rose": (0.56, 0.19, 3.0),
    "violet": (0.53, 0.165, 286.0),
}
PRESET_DARK = {
    "blue": (0.72, 0.125, 245.0),
    "green": (0.73, 0.115, 158.0),
    "orange": (0.75, 0.145, 45.0),
    "rose": (0.73, 0.145, 3.0),
    "violet": (0.73, 0.135, 286.0),
}
ACC = ["primary", "primary-hover", "primary-active", "primary-foreground", "primary-subtle", "primary-subtle-hover", "primary-border", "primary-text", "ring", "selection"]


def neutral_preset(mode):
    if mode == "light":
        ring = solve_ink(3.2, False, [PAGE["light"], CARD["light"], PAPER_PAGE["light"]], PAGE["light"])
        return {
            "primary": Ok(0.20, 0.01, 65),
            "primary-hover": Ok(0.27, 0.01, 65),
            "primary-active": Ok(0.33, 0.01, 65),
            "primary-foreground": Ok(0.98, 0.004, 85),
            "primary-subtle": ink_ok(0.07, False),
            "primary-subtle-hover": ink_ok(0.11, False),
            "primary-border": ink_ok(0.2, False),
            "primary-text": Ok(0.20, 0.01, 65),
            "ring": ink_ok(ring, False),
            "selection": ink_ok(0.18, False),
        }
    ring = solve_ink(3.2, True, [PAGE["dark"], CARD["dark"], PAPER_PAGE["dark"]], PAGE["dark"])
    return {
        "primary": Ok(0.945, 0.008, 82),
        "primary-hover": Ok(0.88, 0.008, 82),
        "primary-active": Ok(0.82, 0.008, 82),
        "primary-foreground": Ok(0.175, 0.007, 70),
        "primary-subtle": ink_ok(0.08, True),
        "primary-subtle-hover": ink_ok(0.12, True),
        "primary-border": ink_ok(0.2, True),
        "primary-text": Ok(0.945, 0.008, 82),
        "ring": ink_ok(ring, True),
        "selection": ink_ok(0.26, True),
    }


def preset(name, mode):
    if name == "neutral":
        return neutral_preset(mode)
    pages = [PAGE[mode], CARD[mode], POPOVER[mode], PAPER_PAGE[mode], PAPER_POPOVER[mode]]
    if mode == "light":
        L, C, H = PRESET_LIGHT[name]
        solid = solid_for(WHITE, H, C, L)
        return accent_roles(solid, WHITE, PAGE[mode], pages, mode)
    L, C, H = PRESET_DARK[name]
    fg = Ok(0.20, 0.02, H)
    solid = solid_for(fg, H, C, L)
    return accent_roles(solid, fg, PAGE[mode], pages, mode, text_chroma=0.95, text_start=solid.L)


def charts(mode):
    if mode == "dark":
        return {
            "chart-1": "#4ea4eb",
            "chart-2": "#f2833c",
            "chart-3": "#9988f0",
            "chart-4": "#42b883",
            "chart-5": "#e472b2",
            "chart-6": "#f2be49",
            "chart-7": "#3ec0db",
            "chart-8": "#969089",
        }
    return {
        "chart-1": "#066bb8",
        "chart-2": "#c84709",
        "chart-3": "#6757c5",
        "chart-4": "#007d4d",
        "chart-5": "#be347c",
        "chart-6": "#9c5e00",
        "chart-7": "#007c96",
        "chart-8": "#6d6862",
    }


def tags(mode):
    dark = mode == "dark"
    pages = [PAGE[mode], CARD[mode], POPOVER[mode]]
    return tag_roles(
        mode,
        pages,
        ink_ok(1.0, dark),
        ink_ok(0.13 if dark else 0.09, dark),
        75,
        0.008,
        light_bg_L=0.94,
        light_fill_L=0.895,
    )


def s(v):
    return v.css() if isinstance(v, Ok) else v


def tokens(mode):
    dark = mode == "dark"
    acc = preset("blue", mode)
    d = {}
    d.update(neutrals(mode))
    d.update({k: acc[k] for k in ACC})
    d.update(status(mode))
    d.update(charts(mode))
    d.update(
        {
            "code": CODE[mode],
            "scrollbar": ink_ok(0.2, dark),
            "scrollbar-hover": ink_ok(0.34, dark),
            "shell": SHELL[mode],
            "shell-border": ink_ok(0.1 if dark else 0.12, dark),
        }
    )
    d.update(tags(mode))
    return {k: s(v) for k, v in d.items()}


LIGHT, DARK = tokens("light"), tokens("dark")
PRESETS = {n: {m: {k: s(v) for k, v in preset(n, m).items()} for m in ("light", "dark")} for n in PRESET_ORDER}

# ───────────────────────────── globals.css ─────────────────────────────
GROUPS = [
    ("Surfaces: Warm Stone page, warm white/lifted container (card) and modal (popover), opaque.", ["background", "card", "popover"]),
    ("Sunken wells, and the inverted standout surface (warm dark callouts, toasts).", ["surface-sunken", "surface-standout", "standout-foreground"]),
    ("Text: primary, secondary (≥ 4.5:1), tertiary (≥ 3:1, meta and placeholders) and disabled. Warm translucent ink.", ["foreground", "card-foreground", "popover-foreground", "muted-foreground", "fg-tertiary", "fg-disabled"]),
    ("Accent: solid, hover, active and its label (≥ 4.5:1), subtle fills, border, text (links, active items: ≥ 4.5:1 on the page and the subtle fill), focus ring (≥ 3:1) and text selection. Presets swap these ten.", ACC),
    ("Fills, translucent ink: hover (a filled control at rest, hovered rows), active (pressed, open, selected), strong (pressed on hover). Never surfaces.", ["fill-hover", "fill-active", "fill-strong"]),
    ("The shadcn fill names read the fills above.", ["secondary", "secondary-foreground", "muted", "accent", "accent-foreground"]),
    ("Status: solid, hover, label on the solid (≥ 4.5:1), subtle fill, border and text (≥ 4.5:1 on the page and the subtle fill). Dark mode uses luminous solids with dark ink labels; info is a fixed blue.", [f"{n}{r}" for n in ("destructive", "success", "warning", "info") for r in ("", "-hover", "-foreground", "-subtle", "-border", "-text")]),
    ("Borders: subtle (separators), default (cards, outline buttons, the raised ring), strong (hover, emphasis), control (≥ 3:1, edges that must be found), input (field ring).", ["border", "border-subtle", "border-strong", "border-control", "input"]),
    ("Charts: chart-1…8 = blue, orange, violet, green, pink, amber, cyan, gray, each ≥ 3:1 on the page and card. Never follow the accent.", [f"chart-{i}" for i in range(1, 9)]),
    ("Code well; scrollbar thumb at rest and hovered.", ["code", "scrollbar", "scrollbar-hover"]),
    ("Shell band (window chrome, rail sidebar) and the inset panel hairline.", ["shell", "shell-border"]),
    ("Tags and highlights: per colour, text, a highlight background and a pill fill; text is ≥ 4.5:1 on all three. They never follow the accent.", [f"tag-{t}-{r}" for t in TAGS for r in ("text", "bg", "fill")]),
]
assert sorted(k for _, ks in GROUPS for k in ks) == sorted(LIGHT), set(LIGHT) ^ {k for _, ks in GROUPS for k in ks}

SHADOWS = {
    "light": """
  /* Shadow scale: border ring, default (resting), lg (menus, popovers), xl (dialogs). */
  --shadow-border: 0 0 0 1px oklch(20% 0.01 65 / 0.13);
  --shadow-default: 0 0 0 1px oklch(20% 0.01 65 / 0.11), 0 1px 2px oklch(20% 0.01 65 / 0.07);
  --shadow-lg: 0 0 0 1px oklch(20% 0.01 65 / 0.11), 0 4px 12px -3px oklch(20% 0.01 65 / 0.12), 0 16px 32px -12px oklch(20% 0.01 65 / 0.16);
  --shadow-xl: 0 0 0 1px oklch(20% 0.01 65 / 0.1), 0 12px 28px -8px oklch(20% 0.01 65 / 0.16), 0 28px 60px -16px oklch(20% 0.01 65 / 0.22);
  /* Named elevation (components use these), restated in .dark so they resolve per mode. */
  --skeuo-raised: var(--shadow-default);
  --skeuo-raised-hover: 0 0 0 1px oklch(20% 0.01 65 / 0.18), 0 2px 4px oklch(20% 0.01 65 / 0.09);
  --skeuo-pressed: inset 0 1px 2px oklch(20% 0.01 65 / 0.14), 0 0 0 1px oklch(20% 0.01 65 / 0.15);
  --skeuo-primary: 0 1px 2px oklch(20% 0.01 65 / 0.12);
  --skeuo-well: inset 0 0 0 1px var(--input);
  --skeuo-surface: var(--shadow-lg);
  --skeuo-chip: var(--shadow-border);
""",
    "dark": """
  /* Shadow scale: border ring, default (resting), lg (menus, popovers), xl (dialogs). */
  --shadow-border: 0 0 0 1px oklch(94.5% 0.008 82 / 0.12);
  --shadow-default: 0 0 0 1px oklch(94.5% 0.008 82 / 0.1) inset, 0 1px 2px oklch(0% 0 0 / 0.32);
  --shadow-lg: 0 0 0 1px oklch(94.5% 0.008 82 / 0.14), 0 6px 14px -4px oklch(0% 0 0 / 0.42), 0 18px 36px -12px oklch(0% 0 0 / 0.56);
  --shadow-xl: 0 0 0 1px oklch(94.5% 0.008 82 / 0.12) inset, 0 12px 28px -8px oklch(0% 0 0 / 0.44), 0 32px 64px -16px oklch(0% 0 0 / 0.62);
  /* Named elevation (components use these), restated in .dark so they resolve per mode. */
  --skeuo-raised: var(--shadow-default);
  --skeuo-raised-hover: 0 0 0 1px oklch(94.5% 0.008 82 / 0.16) inset, 0 1px 3px oklch(0% 0 0 / 0.38);
  --skeuo-pressed: inset 0 1px 2px oklch(0% 0 0 / 0.5), 0 0 0 1px oklch(94.5% 0.008 82 / 0.1);
  --skeuo-primary: 0 0 0 0 transparent;
  --skeuo-well: inset 0 0 0 1px var(--input);
  --skeuo-surface: var(--shadow-lg);
  --skeuo-chip: var(--shadow-border);
""",
}


def token_block(sel, values, mode):
    lines = [f"{sel} {{"]
    if mode == "light":
        lines += ["  --radius: 0.5rem;", "  /* The largest radius any token reaches, whatever --radius is (the Customize slider stops at 1rem). */", "  --radius-max: 1rem;", ""]
    for _, (comment, keys) in enumerate(GROUPS):
        lines.append(f"  /* {comment} */")
        lines += [f"  --{k}: {values[k]};" for k in keys]
    return "\n".join(lines) + SHADOWS[mode].rstrip("\n") + "\n}\n"


def theme_inline():
    names = ["background", "foreground", "card", "card-foreground", "popover", "popover-foreground"]
    names += [k for k in ACC if k != "selection"] + ["selection"]
    names += ["fill-hover", "fill-active", "fill-strong", "secondary", "secondary-foreground", "muted", "muted-foreground", "fg-tertiary", "fg-disabled", "accent", "accent-foreground"]
    names += [f"{n}{r}" for n in ("destructive", "success", "warning", "info") for r in ("", "-hover", "-foreground", "-subtle", "-border", "-text")]
    names += ["surface-sunken", "surface-standout", "standout-foreground", "border", "border-subtle", "border-strong", "border-control", "input", "ring", "code"]
    names += [f"chart-{i}" for i in range(1, 9)]
    names += [f"tag-{t}-{r}" for t in TAGS for r in ("text", "bg", "fill")]
    out = [f"  --color-{n}: var(--{n});" for n in dict.fromkeys(names)]
    out += ["  /* App chrome: the window band/sidebar tone and the hairline of the inset content panel. */", "  --color-shell: var(--shell);", "  --color-shell-border: var(--shell-border);"]
    return "\n".join(out) + "\n"


def decls(d, indent):
    return "".join(f"{indent}--{k}: {v};\n" for k, v in d.items())


def replace_between(src, start, end, body):
    a, b = src.index(start), src.index(end)
    return src[: a + len(start)] + "\n" + body + src[b:]


def main():
    css = GLOBALS.read_text()
    M = {k: (f"/* gen-theme:{k}:start (tooling/scripts/gen-theme.py; do not edit) */", f"/* gen-theme:{k}:end */") for k in ("inline", "tokens", "accents")}
    css = replace_between(css, M["inline"][0], "  " + M["inline"][1], theme_inline())
    tok = token_block(":root", LIGHT, "light") + "\n" + token_block(".dark", DARK, "dark")
    css = replace_between(css, M["tokens"][0], M["tokens"][1], tok)
    acc_css = [
        "/*",
        " * Accent presets: `data-accent` on <html> swaps the ten accent roles (default, no attribute, is blue).",
        " * Every preset meets the same contrast floor: label on the solid, hover and active ≥ 4.5:1, primary-text ≥ 4.5:1 on",
        " * the page and the subtle fill, ring ≥ 3:1. Coloured solids take white text in light mode and dark ink text in dark mode;",
        " * neutral is the inverted espresso / ivory solid. The docs header persists the pick in localStorage[\"accent\"];",
        " * registry items theme-<name> ship the same values.",
        " */",
    ]
    for n in PRESET_ORDER:
        if n == "blue":
            continue
        acc_css.append(f'html[data-accent="{n}"] {{\n{decls(PRESETS[n]["light"], "  ")}}}')
        acc_css.append(f'html[data-accent="{n}"].dark {{\n{decls(PRESETS[n]["dark"], "  ")}}}')
    css = replace_between(css, M["accents"][0], M["accents"][1], "\n".join(acc_css) + "\n")
    GLOBALS.write_text(css)

    # ───────────────────────────── runtime bundles ─────────────────────────────
    bundle = ["/*\n * Accent presets, switched at runtime with data-accent on <html> (no attribute = blue).\n * The attribute also works on any element to give one section its own accent.\n * Generated by tooling/scripts/gen-theme.py from the theme-<name> registry items; import after the theme.\n */\n"]
    for n in PRESET_ORDER:
        bundle.append(f'html[data-accent="{n}"],\n[data-accent="{n}"] {{\n{decls(PRESETS[n]["light"], "  ")}}}\n')
        bundle.append(f'html[data-accent="{n}"].dark,\n.dark [data-accent="{n}"] {{\n{decls(PRESETS[n]["dark"], "  ")}}}\n')
    ACCENTS_CSS.write_text("\n".join(bundle))

    PRESETS_TS.write_text(
        "/* Generated by tooling/scripts/gen-theme.py (the html[data-accent] blocks in packages/tokens/styles/globals.css). Do not edit. */\n\n"
        + "export const PRESET_ROLES = "
        + json.dumps(PRESETS, indent=2)
        + " as const\n"
    )

    pick = " ".join(
        f'html[data-accent="{n}"] {{ ' + " ".join(f"--{k}: {v};" for k, v in PRESETS[n]["light"].items()) + " } "
        f'html[data-accent="{n}"].dark {{ ' + " ".join(f"--{k}: {v};" for k, v in PRESETS[n]["dark"].items()) + " }"
        for n in PRESET_ORDER
        if n != "blue"
    )
    src = PICKER.read_text()
    src = re.sub(r"(?m)^const PRESETS_CSS = `.*`$", lambda m: "const PRESETS_CSS = `" + pick + "`", src)
    swatch = {n: ("var(--foreground)" if n == "neutral" else PRESETS[n]["light"]["primary"]) for n in PRESET_ORDER}
    src = re.sub(r"const SWATCH: Record<Accent, string> = \{.*?\n\}", lambda m: "const SWATCH: Record<Accent, string> = {\n" + "".join(f'  {n}: "{swatch[n]}",\n' for n in PRESET_ORDER) + "}", src, flags=re.S)
    fg = {n: ("var(--background)" if n == "neutral" else PRESETS[n]["light"]["primary-foreground"]) for n in PRESET_ORDER}
    src = re.sub(r"const SWATCH_FG: Record<Accent, string> = \{.*?\n\}", lambda m: "const SWATCH_FG: Record<Accent, string> = {\n" + "".join(f'  {n}: "{fg[n]}",\n' for n in PRESET_ORDER) + "}", src, flags=re.S)
    PICKER.write_text(src)

    # ───────────────────────────── registry ─────────────────────────────
    def vars_of(body):
        body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
        return {m.group(1): re.sub(r"\s+", " ", m.group(2).strip()) for m in re.finditer(r"--([\w-]+):\s*(.*?);", body, re.S)}

    css = GLOBALS.read_text()
    root, dark = {}, {}
    for m in re.finditer(r"(?m)^:root \{\n(.*?)\n\}", css, re.S):
        root.update({k: v for k, v in vars_of(m.group(1)).items() if k not in root})
    for m in re.finditer(r"(?m)^\.dark \{\n(.*?)\n\}", css, re.S):
        dark.update({k: v for k, v in vars_of(m.group(1)).items() if k not in dark})
    inline = vars_of(re.search(r"@theme inline \{(.*?)\n\}", css, re.S).group(1))
    statics = {}
    for m in re.finditer(r"(?m)^@theme \{\n(.*?)\n\}", css, re.S):
        statics.update(vars_of(m.group(1)))
    STD = {"color-background", "color-foreground", "color-card", "color-card-foreground", "color-popover", "color-popover-foreground", "color-primary", "color-primary-foreground", "color-secondary", "color-secondary-foreground", "color-muted", "color-muted-foreground", "color-accent", "color-accent-foreground", "color-destructive", "color-border", "color-input", "color-ring"}
    reg = json.loads(REGISTRY.read_text())
    items = {i["name"]: i for i in reg["items"]}
    theme = items["theme"]
    theme["cssVars"] = {"theme": {**{k: v for k, v in inline.items() if k not in STD}, **statics, "radius": root["radius"]}, "light": root, "dark": dark}
    theme["css"].pop("@supports (color: color(display-p3 1 1 1))", None)
    theme["css"].pop("@supports (color: color-mix(in oklab, red, red))", None)
    base = theme["css"].setdefault("@layer base", {})
    base["::selection"] = {"background-color": "var(--selection)"}
    theme.setdefault("meta", {})["version"] = THEME_VERSION
    for n in PRESET_ORDER:
        item = items[f"theme-{n}"]
        item["cssVars"] = {"light": PRESETS[n]["light"], "dark": PRESETS[n]["dark"]}
        item.pop("css", None)
    REGISTRY.write_text(json.dumps(reg, indent=2, ensure_ascii=False) + "\n")
    print(f"gen-theme: {len(LIGHT)} roles per mode, {len(PRESET_ORDER)} accent presets, theme v{THEME_VERSION}")


if __name__ == "__main__":
    main()
