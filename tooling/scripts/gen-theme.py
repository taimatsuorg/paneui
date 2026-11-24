"""Writes the colour tokens of the default neutral style and everything that mirrors them:

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
from theme_color import Ok, ratio, solve_alpha, solve_L  # noqa: E402
from theme_roles import TAGS, accent_roles, solid_for, states, tag_roles  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
GLOBALS = ROOT / "packages/tokens/styles/globals.css"
ACCENTS_CSS = ROOT / "packages/tokens/styles/theme-accents.css"
PRESETS_TS = ROOT / "apps/docs/components/docs/accent-presets.generated.ts"
PICKER = ROOT / "packages/ui/src/components/accent-picker.tsx"
REGISTRY = ROOT / "packages/registry/registry.json"
THEME_VERSION = "2.7"

WHITE, BLACK = Ok(1), Ok(0)
PAGE = {"light": Ok(1, 0, 0), "dark": Ok(0.2015, 0, 0)}
CARD = {"light": Ok(1, 0, 0), "dark": Ok(0.2219, 0, 0)}
POPOVER = {"light": Ok(1, 0, 0), "dark": Ok(0.2219, 0, 0)}
SHELL = {"light": Ok(0.985, 0, 0), "dark": Ok(0.1794, 0, 0)}
CODE = {"light": Ok(1, 0, 0), "dark": Ok(0.2219, 0, 0)}
# The Paper page is also checked so shared accent and status presets read cleanly on both styles.
PAPER_PAGE = {"light": Ok(0.99, 0.002, 234.82), "dark": Ok(0.195, 0.004, 289.15)}
PAPER_POPOVER = {"light": Ok(0.998, 0.001, 234.82), "dark": Ok(0.255, 0.004, 289.15)}


def ink_ok(alpha, dark=False):
    return Ok(1 if dark else 0, 0, 0, alpha)


def solve_ink(target, dark, pages, under):
    return solve_alpha(lambda a: ink_ok(a, dark), lambda c: all(ratio(c, p, under) >= target for p in pages), 0.02, 1)


# ───────────────────────────── neutrals ─────────────────────────────
def neutrals(mode):
    dark = mode == "dark"
    page = PAGE[mode]
    fg = Ok(0.97, 0, 0) if dark else Ok(0.269, 0, 0)
    fill_hover = ink_ok(0.04, dark)
    fill_active = ink_ok(0.07, dark)
    fill_strong = ink_ok(0.12, dark)
    if dark:
        surfs = [page, CARD[mode], POPOVER[mode], SHELL[mode], fill_hover, fill_active]
        muted_L = solve_L(lambda L: Ok(L, 0, 0), lambda c: all(ratio(c, p, page) >= 4.6 for p in surfs), 0.6037, 0.9, prefer="low")
        muted_fg = Ok(muted_L, 0, 0)
    else:
        muted_fg = Ok(0.516, 0, 0)
    tert_alpha = solve_ink(3.1, dark, [page, CARD[mode]], page)
    border_control = solve_ink(3.1, dark, [page, CARD[mode]], page)
    return {
        # Surfaces: clean neutral page, card, and popover, opaque.
        "background": page,
        "card": CARD[mode],
        "popover": POPOVER[mode],
        "surface-sunken": Ok(0, 0, 0, 0.28 if dark else 0.04),
        "surface-standout": Ok(0.97, 0, 0) if dark else Ok(0.269, 0, 0),
        "standout-foreground": Ok(0.269, 0, 0) if dark else Ok(0.985, 0, 0),
        # Text: primary, secondary (≥ 4.5:1), tertiary (≥ 3:1: meta, placeholders), disabled.
        "foreground": fg,
        "card-foreground": fg,
        "popover-foreground": fg,
        "muted-foreground": muted_fg,
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
        # Borders: translucent hairlines for crisp contrast and control edges.
        "border": ink_ok(0.06 if dark else 0.08, dark),
        "border-subtle": ink_ok(0.04 if dark else 0.06, dark),
        "border-strong": ink_ok(0.14 if dark else 0.16, dark),
        "border-control": ink_ok(border_control, dark),
        "input": ink_ok(0.08 if dark else 0.1, dark),
    }


# ───────────────────────────── status ─────────────────────────────
STATUS_SPEC = {
    "destructive": {
        "light": (WHITE, 25.331, 0.237, 0.637, Ok(0.505, 0.213, 27.518)),
        "dark": (Ok(0.145, 0, 0), 23.35, 0.2212, 0.6551, Ok(0.704, 0.191, 22.216)),
    },
    "success": {
        "light": (WHITE, 162.48, 0.17, 0.696, Ok(0.508, 0.118, 165.612)),
        "dark": (Ok(0.145, 0, 0), 162.48, 0.17, 0.696, Ok(0.765, 0.177, 163.223)),
    },
    "warning": {
        "light": (Ok(0.145, 0, 0), 70.08, 0.188, 0.769, Ok(0.555, 0.163, 48.998)),
        "dark": (Ok(0.145, 0, 0), 70.08, 0.188, 0.769, Ok(0.828, 0.189, 84.429)),
    },
    "info": {
        "light": (WHITE, 259.815, 0.214, 0.623, Ok(0.488, 0.243, 264.376)),
        "dark": (Ok(0.145, 0, 0), 259.815, 0.214, 0.623, Ok(0.707, 0.165, 254.624)),
    },
}


def status(mode):
    dark = mode == "dark"
    a = {"subtle": 0.16, "border": 0.4} if dark else {"subtle": 0.1, "border": 0.3}
    out = {}
    for name in ("destructive", "success", "warning", "info"):
        fg, H, C, L, text_c = STATUS_SPEC[name][mode]
        solid = solid_for(fg, H, C, L)
        hover, _ = states(solid, fg)
        out.update(
            {
                name: solid,
                f"{name}-hover": hover,
                f"{name}-foreground": fg,
                f"{name}-subtle": solid.with_(a=a["subtle"]),
                f"{name}-border": solid.with_(a=a["border"]),
                f"{name}-text": text_c,
            }
        )
    return out


# ───────────────────────────── accents ─────────────────────────────
PRESET_ORDER = ["neutral", "blue", "green", "orange", "rose", "violet"]
PRESET_LIGHT = {
    "blue": (0.623, 0.214, 259.815),
    "green": (0.696, 0.17, 162.48),
    "orange": (0.646, 0.222, 41.116),
    "rose": (0.586, 0.253, 17.585),
    "violet": (0.558, 0.288, 302.321),
}
PRESET_DARK = {
    "blue": (0.707, 0.165, 254.624),
    "green": (0.765, 0.177, 163.223),
    "orange": (0.75, 0.183, 55.934),
    "rose": (0.712, 0.194, 13.428),
    "violet": (0.714, 0.203, 305.504),
}
ACC = ["primary", "primary-hover", "primary-active", "primary-foreground", "primary-subtle", "primary-subtle-hover", "primary-border", "primary-text", "ring", "selection"]


def neutral_preset(mode):
    if mode == "light":
        ring_L = solve_L(lambda L: Ok(L, 0, 0), lambda c: all(ratio(c, p) >= 3.1 for p in [PAGE["light"], CARD["light"], PAPER_PAGE["light"]]), 0.4, 0.708, prefer="high")
        return {
            "primary": Ok(0.269, 0, 0),
            "primary-hover": Ok(0.32, 0, 0),
            "primary-active": Ok(0.37, 0, 0),
            "primary-foreground": Ok(0.985, 0, 0),
            "primary-subtle": ink_ok(0.04, False),
            "primary-subtle-hover": ink_ok(0.07, False),
            "primary-border": ink_ok(0.14, False),
            "primary-text": Ok(0.269, 0, 0),
            "ring": Ok(ring_L, 0, 0),
            "selection": ink_ok(0.14, False),
        }
    return {
        "primary": Ok(0.97, 0, 0),
        "primary-hover": Ok(0.91, 0, 0),
        "primary-active": Ok(0.85, 0, 0),
        "primary-foreground": Ok(0.269, 0, 0),
        "primary-subtle": ink_ok(0.06, True),
        "primary-subtle-hover": ink_ok(0.1, True),
        "primary-border": ink_ok(0.16, True),
        "primary-text": Ok(0.97, 0, 0),
        "ring": Ok(0.556, 0, 0),
        "selection": ink_ok(0.22, True),
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
    fg = Ok(0.145, 0, 0)
    solid = solid_for(fg, H, C, L)
    return accent_roles(solid, fg, PAGE[mode], pages, mode, text_chroma=0.95, text_start=solid.L)


def charts(mode):
    if mode == "dark":
        return {
            "chart-1": Ok(0.623, 0.214, 259.815),
            "chart-2": Ok(0.696, 0.17, 162.48),
            "chart-3": Ok(0.769, 0.188, 70.08),
            "chart-4": Ok(0.627, 0.265, 303.9),
            "chart-5": Ok(0.645, 0.246, 16.439),
            "chart-6": Ok(0.715, 0.143, 215.221),
            "chart-7": Ok(0.705, 0.213, 47.604),
            "chart-8": Ok(0.708, 0, 0),
        }
    return {
        "chart-1": Ok(0.646, 0.222, 41.116),
        "chart-2": Ok(0.60, 0.118, 184.704),
        "chart-3": Ok(0.398, 0.07, 227.392),
        "chart-4": Ok(0.555, 0.163, 48.998),
        "chart-5": Ok(0.59, 0.155, 65.0),
        "chart-6": Ok(0.558, 0.288, 302.321),
        "chart-7": Ok(0.586, 0.253, 17.585),
        "chart-8": Ok(0.556, 0, 0),
    }


def tags(mode):
    dark = mode == "dark"
    pages = [PAGE[mode], CARD[mode], POPOVER[mode]]
    fg = Ok(0.97, 0, 0) if dark else Ok(0.269, 0, 0)
    return tag_roles(mode, pages, fg, ink_ok(0.08 if dark else 0.06, dark), 0, 0)


def s(v):
    return v.css() if isinstance(v, Ok) else v


def tokens(mode):
    dark = mode == "dark"
    acc = preset("neutral", mode)
    d = {}
    d.update(neutrals(mode))
    d.update({k: acc[k] for k in ACC})
    d.update(status(mode))
    d.update(charts(mode))
    d.update(
        {
            "code": CODE[mode],
            "scrollbar": ink_ok(0.16, dark),
            "scrollbar-hover": ink_ok(0.28, dark),
            "shell": SHELL[mode],
            "shell-border": ink_ok(0.05 if dark else 0.06, dark),
        }
    )
    d.update(tags(mode))
    return {k: s(v) for k, v in d.items()}


LIGHT, DARK = tokens("light"), tokens("dark")
PRESETS = {n: {m: {k: s(v) for k, v in preset(n, m).items()} for m in ("light", "dark")} for n in PRESET_ORDER}

# ───────────────────────────── globals.css ─────────────────────────────
GROUPS = [
    ("Surfaces: pure neutral page, container (card) and modal (popover), opaque.", ["background", "card", "popover"]),
    ("Sunken wells, and the inverted standout surface (neutral callouts, toasts).", ["surface-sunken", "surface-standout", "standout-foreground"]),
    ("Text: primary, secondary (≥ 4.5:1), tertiary (≥ 3:1, meta and placeholders) and disabled.", ["foreground", "card-foreground", "popover-foreground", "muted-foreground", "fg-tertiary", "fg-disabled"]),
    ("Accent: solid, hover, active and its label (≥ 4.5:1), subtle fills, border, text (links, active items: ≥ 4.5:1 on the page and the subtle fill), focus ring (≥ 3:1) and text selection. Presets swap these ten.", ACC),
    ("Fills, translucent ink: hover (a filled control at rest, hovered rows), active (pressed, open, selected), strong (pressed on hover). Never surfaces.", ["fill-hover", "fill-active", "fill-strong"]),
    ("The shadcn fill names read the fills above.", ["secondary", "secondary-foreground", "muted", "accent", "accent-foreground"]),
    ("Status: solid, hover, label on the solid (≥ 4.5:1), subtle fill, border and text (≥ 4.5:1 on the page and the subtle fill).", [f"{n}{r}" for n in ("destructive", "success", "warning", "info") for r in ("", "-hover", "-foreground", "-subtle", "-border", "-text")]),
    ("Borders: translucent hairlines for dividers, cards, outline buttons, focusable edges and field rings.", ["border", "border-subtle", "border-strong", "border-control", "input"]),
    ("Charts: chart-1…8, each ≥ 3:1 on the page and card. Never follow the accent.", [f"chart-{i}" for i in range(1, 9)]),
    ("Code well; scrollbar thumb at rest and hovered.", ["code", "scrollbar", "scrollbar-hover"]),
    ("Shell band (sidebar chrome, rail, tile wells) and its hairline border.", ["shell", "shell-border"]),
    ("Tags and highlights: per colour, text, a highlight background and a pill fill; text is ≥ 4.5:1 on all three. They never follow the accent.", [f"tag-{t}-{r}" for t in TAGS for r in ("text", "bg", "fill")]),
]
assert sorted(k for _, ks in GROUPS for k in ks) == sorted(LIGHT), set(LIGHT) ^ {k for _, ks in GROUPS for k in ks}

SHADOWS = {
    "light": """
  /* Shadow scale: translucent border ring plus subtle bottom drop depth. */
  --shadow-border: 0 0 0 1px oklch(0% 0 0 / 0.08);
  --shadow-default: 0 0 0 1px oklch(0% 0 0 / 0.08), 0 1px 0 oklch(0% 0 0 / 0.04), 0 1px 2px oklch(0% 0 0 / 0.05);
  --shadow-lg: 0 0 0 1px oklch(0% 0 0 / 0.08), 0 1px 0 oklch(0% 0 0 / 0.04), 0 10px 15px -3px oklch(0% 0 0 / 0.05), 0 4px 6px -4px oklch(0% 0 0 / 0.05);
  --shadow-xl: 0 0 0 1px oklch(0% 0 0 / 0.08), 0 1px 0 oklch(0% 0 0 / 0.04), 0 20px 25px -5px oklch(0% 0 0 / 0.08), 0 8px 10px -6px oklch(0% 0 0 / 0.06);
  /* Named elevation (components use these), restated in .dark so they resolve per mode. */
  --skeuo-raised: var(--shadow-default);
  --skeuo-raised-hover: 0 0 0 1px oklch(0% 0 0 / 0.14), 0 1px 0 oklch(0% 0 0 / 0.05), 0 2px 4px oklch(0% 0 0 / 0.06);
  --skeuo-pressed: inset 0 1px 2px oklch(0% 0 0 / 0.1), 0 0 0 1px oklch(0% 0 0 / 0.12);
  --skeuo-primary: 0 1px 0 oklch(0% 0 0 / 0.08), 0 1px 2px oklch(0% 0 0 / 0.08);
  --skeuo-well: inset 0 0 0 1px var(--input);
  --skeuo-surface: var(--shadow-lg);
  --skeuo-chip: var(--shadow-border);
""",
    "dark": """
  /* Shadow scale: translucent border ring plus subtle bottom drop depth. */
  --shadow-border: 0 0 0 1px oklch(100% 0 0 / 0.08);
  --shadow-default: 0 0 0 1px oklch(100% 0 0 / 0.08) inset, 0 1px 2px oklch(0% 0 0 / 0.28);
  --shadow-lg: 0 0 0 1px oklch(100% 0 0 / 0.1), 0 10px 15px -3px oklch(0% 0 0 / 0.4), 0 4px 6px -4px oklch(0% 0 0 / 0.3);
  --shadow-xl: 0 0 0 1px oklch(100% 0 0 / 0.1) inset, 0 20px 25px -5px oklch(0% 0 0 / 0.5), 0 8px 10px -6px oklch(0% 0 0 / 0.35);
  /* Named elevation (components use these), restated in .dark so they resolve per mode. */
  --skeuo-raised: var(--shadow-default);
  --skeuo-raised-hover: 0 0 0 1px oklch(100% 0 0 / 0.14) inset, 0 1px 3px oklch(0% 0 0 / 0.34);
  --skeuo-pressed: inset 0 1px 2px oklch(0% 0 0 / 0.45), 0 0 0 1px oklch(100% 0 0 / 0.08);
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
        " * Accent presets: `data-accent` on <html> swaps the ten accent roles (default, no attribute, is neutral).",
        " * Every preset meets the same contrast floor: label on the solid, hover and active ≥ 4.5:1, primary-text ≥ 4.5:1 on",
        " * the page and the subtle fill, ring ≥ 3:1. Coloured solids take white text in light mode and dark neutral ink in dark mode;",
        " * neutral is the inverted neutral-800 / neutral-100 solid. The docs header persists the pick in localStorage[\"accent\"];",
        " * registry items theme-<name> ship the same values.",
        " */",
    ]
    for n in PRESET_ORDER:
        if n == "neutral":
            continue
        acc_css.append(f'html[data-accent="{n}"] {{\n{decls(PRESETS[n]["light"], "  ")}}}')
        acc_css.append(f'html[data-accent="{n}"].dark {{\n{decls(PRESETS[n]["dark"], "  ")}}}')
    css = replace_between(css, M["accents"][0], M["accents"][1], "\n".join(acc_css) + "\n")
    GLOBALS.write_text(css)

    # ───────────────────────────── runtime bundles ─────────────────────────────
    bundle = ["/*\n * Accent presets, switched at runtime with data-accent on <html> (no attribute = neutral).\n * The attribute also works on any element to give one section its own accent.\n * Generated by tooling/scripts/gen-theme.py from the theme-<name> registry items; import after the theme.\n */\n"]
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
        if n != "neutral"
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
