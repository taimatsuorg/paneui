"""Writes the colour tokens of the default style and everything that mirrors them:

- packages/tokens/styles/globals.css: the colour mappings in `@theme inline`, the `:root` / `.dark` token blocks,
  the wide-gamut chart block and the `html[data-accent]` preset blocks (between `gen-theme` markers);
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
from theme_color import Ok, hex_to_oklch, ratio, solve_alpha, solve_L  # noqa: E402
from theme_roles import TAGS, accent_roles, status_roles, solid_for, tag_roles, states  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
GLOBALS = ROOT / "packages/tokens/styles/globals.css"
ACCENTS_CSS = ROOT / "packages/tokens/styles/theme-accents.css"
PRESETS_TS = ROOT / "apps/docs/components/docs/accent-presets.generated.ts"
PICKER = ROOT / "packages/ui/src/components/accent-picker.tsx"
REGISTRY = ROOT / "packages/registry/registry.json"
THEME_VERSION = "2.5"

WHITE, BLACK = Ok(1), Ok(0)
PAGE = {"light": Ok(1), "dark": Ok(0.15)}
CARD = {"light": Ok(1), "dark": Ok(0.1776)}  # #111
POPOVER = {"light": Ok(1), "dark": Ok(0.252)}
# The Paper page is the lightest dark page and the darkest light page the presets meet; text roles clear both.
PAPER_PAGE = {"light": Ok(0.99, 0.002, 234.82), "dark": Ok(0.195, 0.004, 289.15)}
PAPER_POPOVER = {"light": Ok(0.998, 0.001, 234.82), "dark": Ok(0.255, 0.004, 289.15)}


def ink(alpha, white=False):
    """Pure black (white in dark) at an alpha, as #rrggbbaa."""
    return ("#ffffff" if white else "#000000") + f"{round(alpha * 255):02x}"


def ink_ok(alpha, white=False):
    return Ok(1 if white else 0, 0, 0, alpha)


def solve_ink(target, white, pages):
    return solve_alpha(lambda a: ink_ok(a, white), lambda c: all(ratio(c, p) >= target for p in pages), 0.02, 1)


def hue(h):
    L, C, H = hex_to_oklch(h)
    return L, C, H


# ───────────────────────────── neutrals ─────────────────────────────
def neutrals(mode):
    dark = mode == "dark"
    w = dark
    page = PAGE[mode]
    border_control = solve_ink(3.1, w, [page, CARD[mode]])
    muted_alpha = 0.6 if dark else 0.608
    return {
        # Surfaces: page, container (card) and modal (popover), opaque; raised surfaces step lighter in dark.
        "background": "oklch(15% 0 0)" if dark else "#fff",
        "card": "#111" if dark else "#fff",
        "popover": "oklch(25.2% 0 0)" if dark else "#fff",
        "surface-sunken": "#0006" if dark else "#0000000d",
        "surface-standout": "#222" if dark else "#202020",
        "standout-foreground": "#ffffffed" if dark else "#fff",
        # Text: primary, secondary (≥ 4.5:1, ~6–7.5:1), tertiary (≥ 3:1: meta, placeholders), disabled. Translucent ink.
        "foreground": ink(0.93, w) if dark else "#000000df",
        "card-foreground": ink(0.93, w) if dark else "#000000df",
        "popover-foreground": ink(0.93, w) if dark else "#000000df",
        "muted-foreground": ink(muted_alpha, w),
        "fg-tertiary": "#ffffff64" if dark else "#00000072",
        "fg-disabled": "#fff5" if dark else "#0004",
        # Fills, translucent ink: hover (rest of a filled control), active (pressed, open, selected), strong (pressed on hover).
        "fill-hover": ink(0.07, w) if dark else "#0000000f",
        "fill-active": ink(0.106, w) if dark else "#00000017",
        "fill-strong": ink(0.16, w) if dark else ink(0.15),
        # The shadcn names read the fills.
        "secondary": "var(--fill-hover)",
        "secondary-foreground": ink(0.93, w) if dark else "#000000df",
        "muted": "var(--fill-hover)",
        "accent": "var(--fill-active)",
        "accent-foreground": ink(0.93, w) if dark else "#000000df",
        # Borders: subtle (separators), default (cards, fields, outline buttons), strong (hover, emphasis), control (≥ 3:1 edge).
        "border": ink(0.106, w) if dark else "#00000017",
        "border-subtle": ink(0.06, w) if dark else ink(0.05),
        "border-strong": ink(0.2, w) if dark else ink(0.18),
        "border-control": ink(border_control, w),
        "input": ink(0.106, w) if dark else "#00000017",
    }


# ───────────────────────────── status ─────────────────────────────
def status(mode):
    pages = [PAGE[mode], CARD[mode], POPOVER[mode], PAPER_PAGE[mode], PAPER_POPOVER[mode]]
    out = {}
    for name, hx in [("destructive", "#e54d2e"), ("success", "#30a46c")]:
        L, C, H = hue(hx)
        solid = solid_for(WHITE, H, C, L)
        out.update(status_roles(name, solid, WHITE, pages, mode))
    # Warning keeps its vivid solid and takes dark text.
    L, C, H = hue("#f76b15")
    fg = Ok(0.22, 0.04, H)
    out.update(status_roles("warning", solid_for(fg, H, C, L), fg, pages, mode))
    # Info is a fixed blue: it never follows the accent.
    L, C, H = hue("#0090ff")
    out.update(status_roles("info", solid_for(WHITE, H, C, L), WHITE, pages, mode))
    return out


# ───────────────────────────── accents ─────────────────────────────
PRESET_ORDER = ["neutral", "blue", "green", "orange", "rose", "violet"]
PRESET_HEX = {"blue": "#0090ff", "green": "#30a46c", "orange": "#f76b15", "rose": "#e93d82", "violet": "#6e56cf"}
ACC = ["primary", "primary-hover", "primary-active", "primary-foreground", "primary-subtle", "primary-subtle-hover", "primary-border", "primary-text", "ring", "selection"]


def neutral_preset(mode):
    dark = mode == "dark"
    page = PAGE[mode]
    ring = solve_ink(3.2, dark, [page, PAPER_PAGE[mode]])
    return {
        "primary": ink(0.95, dark),
        "primary-hover": ink(0.8, dark),
        "primary-active": ink(0.7, dark),
        "primary-foreground": "#000" if dark else "#fff",
        "primary-subtle": ink(0.07, dark) if dark else ink(0.06),
        "primary-subtle-hover": ink(0.106, dark) if dark else ink(0.09),
        "primary-border": ink(0.17, dark) if dark else ink(0.15),
        "primary-text": ink(0.93, dark) if dark else "#000000df",
        "ring": ink(ring, dark),
        "selection": ink(0.24, dark) if dark else ink(0.16),
    }


def preset(name, mode):
    if name == "neutral":
        return neutral_preset(mode)
    L, C, H = hue(PRESET_HEX[name])
    pages = [PAGE[mode], CARD[mode], POPOVER[mode], PAPER_PAGE[mode], PAPER_POPOVER[mode]]
    # Every accent darkens until white text reaches AA. Orange moves its hue to 40 there: at that lightness hue 45
    # only holds a muted, brownish chroma, while 40 keeps a clear orange.
    if name == "orange":
        H, C = 40.0, 0.22
    solid = solid_for(WHITE, H, C, L)
    fg = WHITE
    return accent_roles(solid, fg, PAGE[mode], pages, mode)


def charts(mode):
    if mode == "dark":
        return {"chart-1": "#0090ff", "chart-2": "#f76b15", "chart-3": "#6e56cf", "chart-4": "#30a46c", "chart-5": "#d6409f", "chart-6": "#ffc53d", "chart-7": "#00a2c7", "chart-8": "#6e6e6e"}
    # chart-7 (cyan) is darkened just enough to keep 3:1 on the Paper page as well as on white.
    L, C, H = hue("#00a2c7")
    c7 = Ok(solve_L(lambda L: Ok(L, C, H), lambda c: ratio(c, PAPER_PAGE["light"]) >= 3.05, 0.3, L, prefer="high"), C, H)
    return {"chart-1": "#0090ff", "chart-2": "#ef5f00", "chart-3": "#6e56cf", "chart-4": "#30a46c", "chart-5": "#d6409f", "chart-6": "#ab6400", "chart-7": c7, "chart-8": "#8d8d8d"}


def tags(mode):
    dark = mode == "dark"
    pages = [PAGE[mode], CARD[mode], POPOVER[mode]]
    return tag_roles(mode, pages, Ok(1, 0, 0, 0.93) if dark else Ok(0, 0, 0, 0.875), ink_ok(0.12 if dark else 0.07, dark), 0, 0)


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
            "code": "#191919" if dark else "#f9f9f9",
            "scrollbar": "var(--fill-strong)",
            "scrollbar-hover": "#fff5" if dark else "#0004",
            "shell": "#000" if dark else "oklch(97.3% 0 0)",
            "shell-border": "oklch(100% 0 0 / 9%)" if dark else "oklch(0% 0 0 / 10%)",
        }
    )
    d.update(tags(mode))
    return {k: s(v) for k, v in d.items()}


LIGHT, DARK = tokens("light"), tokens("dark")
PRESETS = {n: {m: {k: s(v) for k, v in preset(n, m).items()} for m in ("light", "dark")} for n in PRESET_ORDER}

# ───────────────────────────── globals.css ─────────────────────────────
GROUPS = [
    ("Surfaces: page, container (card) and modal (popover), opaque; in dark each raised level is lighter.", ["background", "card", "popover"]),
    ("Sunken wells, and the inverted standout surface (dark callouts, toasts).", ["surface-sunken", "surface-standout", "standout-foreground"]),
    ("Text: primary, secondary (≥ 4.5:1), tertiary (≥ 3:1, meta and placeholders) and disabled. Translucent ink, so it sits on any surface.", ["foreground", "card-foreground", "popover-foreground", "muted-foreground", "fg-tertiary", "fg-disabled"]),
    ("Accent: solid, hover, active and its label (≥ 4.5:1), subtle fills, border, text (links, active items: ≥ 4.5:1 on the page and the subtle fill), focus ring (≥ 3:1) and text selection. Presets swap these ten.", ACC),
    ("Fills, translucent ink: hover (a filled control at rest, hovered rows), active (pressed, open, selected), strong (pressed on hover). Never surfaces.", ["fill-hover", "fill-active", "fill-strong"]),
    ("The shadcn fill names read the fills above.", ["secondary", "secondary-foreground", "muted", "accent", "accent-foreground"]),
    ("Status: solid, hover, label on the solid (≥ 4.5:1), subtle fill, border and text (≥ 4.5:1 on the page and the subtle fill). Warning takes dark text on its vivid solid; info is a fixed blue.", [f"{n}{r}" for n in ("destructive", "success", "warning", "info") for r in ("", "-hover", "-foreground", "-subtle", "-border", "-text")]),
    ("Borders: subtle (separators), default (cards, fields, outline buttons, the raised ring), strong (hover, emphasis), control (≥ 3:1, edges that must be found). input = border.", ["border", "border-subtle", "border-strong", "border-control", "input"]),
    ("Charts: chart-1…8 = blue, orange, violet, green, pink, amber, cyan, gray, each ≥ 3:1 on the page. Never follow the accent.", [f"chart-{i}" for i in range(1, 9)]),
    ("Code well; scrollbar thumb at rest and hovered.", ["code", "scrollbar", "scrollbar-hover"]),
    ("Shell band (window chrome, rail sidebar) and the inset panel hairline.", ["shell", "shell-border"]),
    ("Tags and highlights: per colour, text, a highlight background and a pill fill; text is ≥ 4.5:1 on all three. They never follow the accent.", [f"tag-{t}-{r}" for t in TAGS for r in ("text", "bg", "fill")]),
]
assert sorted(k for _, ks in GROUPS for k in ks) == sorted(LIGHT), set(LIGHT) ^ {k for _, ks in GROUPS for k in ks}

SHADOWS = {
    "light": """
  /* Shadow scale: border ring, default (resting), lg (menus, popovers), xl (dialogs). */
  --shadow-border: 0 0 0 1px #00000017;
  --shadow-default: 0 0 0 0.5px #0000 inset, 0 0 0 1px #00000017, 0 1px 1px -1px #0000001a, 0 1px 2px 0 #0000000d;
  --shadow-lg: 0 0 0 0.5px #0000000f, 0 2px 3px -2px #0000000f, 0 3px 12px -4px #0000001a, 0 4px 16px -8px #0000000d;
  --shadow-xl: 0 0 0 0.5px #0000 inset, 0 0 0 0.5px #0000000f, 0 8px 40px 0 #0000000d, 0 12px 32px -16px #00000026;
  /* Named elevation (components use these), restated in .dark so they resolve per mode. */
  --skeuo-raised: var(--shadow-default);
  --skeuo-raised-hover: 0 0 0 0.5px #0000 inset, 0 0 0 1px #00000026, 0 1px 1px -1px #0000001a, 0 1px 2px 0 #0000000d;
  --skeuo-pressed: var(--shadow-border);
  --skeuo-primary: 0 1px 2px #0000000d;
  --skeuo-well: inset 0 0 0 1px var(--input);
  --skeuo-surface: var(--shadow-lg);
  --skeuo-chip: var(--shadow-border);
""",
    "dark": """
  /* Shadow scale: border ring, default (resting), lg (menus, popovers), xl (dialogs). */
  --shadow-border: 0 0 0 1px #ffffff1b;
  --shadow-default: 0 0 0 1px #ffffff1b inset, 0 0 0 1px #0000, 0 1px 1px -1px #0000, 0 1px 2px 0 #0000;
  --shadow-lg: 0 0 0 1px #ffffff2c, 0 2px 3px -2px #00000026, 0 3px 8px -2px #0006, 0 4px 12px -4px #00000080;
  --shadow-xl: 0 0 0 0.5px #ffffff12 inset, 0 0 0 0.5px #0000, 0 8px 40px 0 #0000000d, 0 12px 32px -16px #00000026;
  /* Named elevation (components use these), restated in .dark so they resolve per mode. */
  --skeuo-raised: var(--shadow-default);
  --skeuo-raised-hover: 0 0 0 1px #ffffff2c inset, 0 0 0 1px #0000, 0 1px 1px -1px #0000, 0 1px 2px 0 #0000;
  --skeuo-pressed: var(--shadow-border);
  --skeuo-primary: 0 0 0 0 transparent;
  --skeuo-well: inset 0 0 0 1px var(--input);
  --skeuo-surface: var(--shadow-lg);
  --skeuo-chip: var(--shadow-border);
""",
}

# Wide-gamut charts (unchanged hues; chart-7 light is sRGB-only since it was darkened for contrast).
P3_CHARTS = {
    "light": {"chart-1": "color(display-p3 .247 .556 .969)", "chart-2": "color(display-p3 .87 .409 .164)", "chart-3": "color(display-p3 .417 .341 .784)", "chart-4": "color(display-p3 .332 .634 .442)", "chart-5": "color(display-p3 .775 .297 .61)", "chart-6": "color(display-p3 .64 .4 0)", "chart-8": "color(display-p3 .553 .553 .553)"},
    "dark": {"chart-1": "color(display-p3 .247 .556 .969)", "chart-2": "color(display-p3 .9 .45 .2)", "chart-3": "color(display-p3 .417 .341 .784)", "chart-4": "color(display-p3 .332 .634 .442)", "chart-5": "color(display-p3 .775 .297 .61)", "chart-6": "color(display-p3 1 .77 .26)", "chart-7": "color(display-p3 .282 .627 .765)", "chart-8": "color(display-p3 .431 .431 .431)"},
}


def token_block(sel, values, mode):
    lines = [f"{sel} {{"]
    if mode == "light":
        lines += ["  --radius: 0.5rem;", "  /* The largest radius any token reaches, whatever --radius is (the Customize slider stops at 1rem). */", "  --radius-max: 1rem;", ""]
    for i, (comment, keys) in enumerate(GROUPS):
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


css = GLOBALS.read_text()
M = {k: (f"/* gen-theme:{k}:start (tooling/scripts/gen-theme.py; do not edit) */", f"/* gen-theme:{k}:end */") for k in ("inline", "tokens", "accents")}
css = replace_between(css, M["inline"][0], "  " + M["inline"][1], theme_inline())
p3 = "@supports (color: color(display-p3 1 1 1)) {\n  @media (color-gamut: p3) {\n" + "".join(f"    {sel} {{\n{decls(P3_CHARTS[m], '      ')}    }}\n" for sel, m in ((":root", "light"), (".dark", "dark"))) + "  }\n}\n"
tok = token_block(":root", LIGHT, "light") + "\n" + token_block(".dark", DARK, "dark") + "\n/* Wide-gamut displays get the chart hues in display-p3. */\n" + p3
css = replace_between(css, M["tokens"][0], M["tokens"][1], tok)
acc_css = [
    "/*",
    " * Accent presets: `data-accent` on <html> swaps the ten accent roles (default, no attribute, is blue).",
    " * Every preset meets the same contrast floor: label on the solid, hover and active ≥ 4.5:1, primary-text ≥ 4.5:1 on",
    " * the page and the subtle fill, ring ≥ 3:1. Every coloured solid takes white text; neutral is the black / white",
    " * solid. The docs header persists the pick in localStorage[\"accent\"]; registry items theme-<name> ship the same values.",
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
P3_KEY, P3_MEDIA = "@supports (color: color(display-p3 1 1 1))", "@media (color-gamut: p3)"
theme["css"][P3_KEY] = {P3_MEDIA: {":root": {f"--{k}": v for k, v in P3_CHARTS["light"].items()}, ".dark": {f"--{k}": v for k, v in P3_CHARTS["dark"].items()}}}
base = theme["css"].setdefault("@layer base", {})
base["::selection"] = {"background-color": "var(--selection)"}
theme.setdefault("meta", {})["version"] = THEME_VERSION
for n in PRESET_ORDER:
    item = items[f"theme-{n}"]
    item["cssVars"] = {"light": PRESETS[n]["light"], "dark": PRESETS[n]["dark"]}
    item.pop("css", None)
REGISTRY.write_text(json.dumps(reg, indent=2, ensure_ascii=False) + "\n")
print(f"gen-theme: {len(LIGHT)} roles per mode, {len(PRESET_ORDER)} accent presets, theme v{THEME_VERSION}")
