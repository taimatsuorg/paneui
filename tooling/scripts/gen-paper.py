# Writes packages/tokens/styles/theme-paper.css (Paper style). Re-run after changing values here.
from pathlib import Path
import json
import math
import sys
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from theme_color import Ok, ratio, solve_alpha  # noqa: E402
from theme_roles import accent_roles, status_roles, solid_for, tag_roles  # noqa: E402
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'packages/tokens/styles/theme-paper.css'
ANCHORS = json.loads((ROOT / 'tooling/fixtures/paper-anchors.json').read_text())
def lch(hex_value):
    rgb = [int(hex_value[i:i+2], 16)/255 for i in (1,3,5)]
    r,g,b = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    l,m,s = [(a*r+b1*g+c*b)**(1/3) for a,b1,c in [(0.4122214708,0.5363325363,0.0514459929),(0.2119034982,0.6806995451,0.1073969566),(0.0883024619,0.2817188376,0.6299787005)]]
    L = .2104542553*l + .793617785*m - .0040720468*s
    a = 1.9779984951*l - 2.428592205*m + .4505937099*s
    b = .0259040371*l + .7827717662*m - .808675766*s
    return L, math.hypot(a,b), math.degrees(math.atan2(b,a)) % 360
def anchor(key):
    L,c,h = lch(ANCHORS[key]['hex'])
    return round(h,2), round(min(c,.14),4)

W=round(lch(ANCHORS['neutral']['hex'])[2],2)
def ink(a, L=0.30, C=0.004): return f"oklch({L*100:g}% {C:g} {W} / {a:g})"
def ivory(a, L=0.97, C=0.003): return f"oklch({L*100:g}% {C:g} {W} / {a:g})"
def shadow_l(*layers): return ', '.join(layers)

SURF_H = round(lch(ANCHORS['surface']['hex'])[2], 2)
PAGE = {'light': Ok(0.99, 0.002, SURF_H), 'dark': Ok(0.195, 0.004, W)}
PAGES = {'light': [PAGE['light'], Ok(0.998, 0.001, SURF_H)], 'dark': [PAGE['dark'], Ok(0.225, 0.004, W), Ok(0.255, 0.004, W)]}
WHITE = Ok(1)
INK = lambda a: Ok(0.30, 0.004, W, a)
IVORY = lambda a: Ok(0.97, 0.003, W, a)
def solve_ink(make, target, mode):
    return solve_alpha(make, lambda c: all(ratio(c, p, PAGE[mode]) >= target for p in PAGES[mode]), 0.02, 1)
def css(d): return {k: (v.css() if isinstance(v, Ok) else v) for k, v in d.items()}

# Status: dusty solids with white text on paper (warning: a vivid amber with ink text), pastel solids with ink text in dark.
LIGHT_ALPHA = {'subtle': 0.11, 'border': 0.3}
DARK_ALPHA = {'subtle': 0.14, 'border': 0.32}
def status_light():
    out = {}
    for name, key in (('destructive', 'rose'), ('success', 'green'), ('info', 'blue')):
        h, c = anchor(key)
        out.update(status_roles(name, solid_for(WHITE, h, c, 0.54), WHITE, PAGES['light'], 'light', LIGHT_ALPHA))
    h, c = anchor('orange')
    fg = Ok(0.21, 0.02, h)
    out.update(status_roles('warning', solid_for(fg, h, c, 0.74), fg, PAGES['light'], 'light', LIGHT_ALPHA))
    return css(out)
def status_dark():
    out = {}
    for name, key, L in (('destructive', 'rose', 0.76), ('success', 'green', 0.76), ('warning', 'orange', 0.8), ('info', 'blue', 0.76)):
        h, c = anchor(key)
        fg = Ok(0.21, 0.02, h)
        # In dark the pastel solid is light enough to be its own text colour.
        out.update(status_roles(name, solid_for(fg, h, c, L), fg, PAGES['dark'], 'dark', DARK_ALPHA, text_chroma=1, text_start=L))
    return css(out)
STATE_L = status_light()
STATE_D = status_dark()
light = {
 'radius-note': None,
 'background': 'oklch(99% 0.002 255)',
 'card': 'oklch(99.8% 0.001 255)',
 'popover': 'oklch(99.8% 0.001 255)',
 'surface-sunken': ink(0.05),
 'surface-standout': 'oklch(26% 0.004 285)',
 'standout-foreground': 'oklch(98% 0.002 255)',
 'foreground': 'oklch(23% 0.004 285)',
 'card-foreground': 'oklch(23% 0.004 285)',
 'popover-foreground': 'oklch(23% 0.004 285)',
 'muted-foreground': ink(0.71, 0.24, 0.004),
 'fg-tertiary': ink(0.52, 0.26, 0.004),
 'fg-disabled': ink(0.34, 0.28, 0.004),
 'fill-hover': ink(0.06),
 'fill-active': ink(0.1),
 'fill-strong': ink(0.16),
 'secondary': 'var(--fill-hover)',
 'secondary-foreground': 'oklch(23% 0.004 285)',
 'muted': 'var(--fill-hover)',
 'accent': 'var(--fill-active)',
 'accent-foreground': 'oklch(23% 0.004 285)',
 'border': ink(0.12),
 'border-subtle': ink(0.06),
 'border-strong': ink(0.22),
 'border-control': ink(solve_ink(INK, 3.1, 'light')),
 'input': ink(0.14),
 'code': 'oklch(97.5% 0.003 255)',
 'scrollbar': ink(0.18),
 'scrollbar-hover': ink(0.3),
 'shell': 'oklch(97% 0.003 255)',
 'shell-border': ink(0.1),
 'shadow-border': f"0 0 0 1px {ink(0.1)}",
 'shadow-default': shadow_l(f"0 0 0 1px {ink(0.075)}", f"0 1px 2px {ink(0.05)}", f"0 4px 14px -4px {ink(0.08)}"),
 'shadow-lg': shadow_l(f"0 0 0 1px {ink(0.07)}", f"0 4px 10px -3px {ink(0.07)}", f"0 18px 40px -10px {ink(0.14)}"),
 'shadow-xl': shadow_l(f"0 0 0 1px {ink(0.06)}", f"0 12px 28px -8px {ink(0.1)}", f"0 32px 72px -16px {ink(0.2)}"),
 'skeuo-raised': 'var(--shadow-default)',
 'skeuo-raised-hover': shadow_l(f"0 0 0 1px {ink(0.12)}", f"0 2px 4px {ink(0.06)}", f"0 8px 20px -6px {ink(0.12)}"),
 'skeuo-pressed': 'var(--shadow-border)',
 'skeuo-primary': shadow_l(f"0 1px 2px {ink(0.1)}", f"0 4px 12px -4px {ink(0.14)}"),
 'skeuo-well': 'inset 0 0 0 1px var(--input)',
 'skeuo-surface': 'var(--shadow-lg)',
 'skeuo-chip': 'var(--shadow-border)',
 'image-outline': ink(0.1),
}
light.update(STATE_L)
light.pop('radius-note')
light.update(css(tag_roles('light', PAGES['light'], Ok(0.23, 0.004, W), INK(0.08), W)))
DK=lambda a: f"oklch(0% 0 0 / {a:g})"
dark = {
 'background': 'oklch(19.5% 0.004 285)',
 'card': 'oklch(22.5% 0.004 285)',
 'popover': 'oklch(25.5% 0.004 285)',
 'surface-sunken': DK(0.25),
 'surface-standout': 'oklch(30% 0.004 285)',
 'standout-foreground': 'oklch(95% 0.003 255)',
 'foreground': 'oklch(94% 0.003 255)',
 'card-foreground': 'oklch(94% 0.003 255)',
 'popover-foreground': 'oklch(94% 0.003 255)',
 'muted-foreground': ivory(0.66),
 'fg-tertiary': ivory(0.46),
 'fg-disabled': ivory(0.32),
 'fill-hover': ivory(0.07),
 'fill-active': ivory(0.11),
 'fill-strong': ivory(0.16),
 'secondary': 'var(--fill-hover)',
 'secondary-foreground': 'oklch(94% 0.003 255)',
 'muted': 'var(--fill-hover)',
 'accent': 'var(--fill-active)',
 'accent-foreground': 'oklch(94% 0.003 255)',
 'border': ivory(0.11),
 'border-subtle': ivory(0.06),
 'border-strong': ivory(0.2),
 'border-control': ivory(solve_ink(IVORY, 3.1, 'dark')),
 'input': ivory(0.12),
 'code': 'oklch(21.5% 0.004 285)',
 'scrollbar': ivory(0.18),
 'scrollbar-hover': ivory(0.3),
 'shell': 'oklch(16.5% 0.004 285)',
 'shell-border': ivory(0.09),
 'shadow-border': f"0 0 0 1px {ivory(0.1)}",
 'shadow-default': shadow_l(f"0 0 0 1px {ivory(0.085)} inset", f"0 1px 2px {DK(0.2)}", f"0 6px 16px -6px {DK(0.35)}"),
 'shadow-lg': shadow_l(f"0 0 0 1px {ivory(0.12)}", f"0 4px 10px -3px {DK(0.3)}", f"0 18px 40px -10px {DK(0.5)}"),
 'shadow-xl': shadow_l(f"0 0 0 1px {ivory(0.1)} inset", f"0 12px 28px -8px {DK(0.35)}", f"0 32px 72px -16px {DK(0.6)}"),
 'skeuo-raised': 'var(--shadow-default)',
 'skeuo-raised-hover': shadow_l(f"0 0 0 1px {ivory(0.14)} inset", f"0 2px 4px {DK(0.25)}", f"0 8px 20px -6px {DK(0.4)}"),
 'skeuo-pressed': 'var(--shadow-border)',
 'skeuo-primary': '0 0 0 0 transparent',
 'skeuo-well': 'inset 0 0 0 1px var(--input)',
 'skeuo-surface': 'var(--shadow-lg)',
 'skeuo-chip': 'var(--shadow-border)',
 'image-outline': ivory(0.1),
}
dark.update(STATE_D)
dark.update(css(tag_roles('dark', PAGES['dark'], Ok(0.94, 0.003, SURF_H), IVORY(0.12), W)))
# accents: (hue, chroma)
ACC = {key:anchor(key) for key in ['blue','green','orange','rose','violet']}
LIGHT_ACC = {'subtle': 0.12, 'subtle-hover': 0.18, 'border': 0.32, 'selection': 0.22}
DARK_ACC = {'subtle': 0.14, 'subtle-hover': 0.2, 'border': 0.32, 'selection': 0.32}
def acc_light(h,c):
    return css(accent_roles(solid_for(WHITE, h, c, 0.54), WHITE, PAGE['light'], PAGES['light'], 'light', LIGHT_ACC))
def acc_dark(h,c):
    fg = Ok(0.21, 0.02, h)
    return css(accent_roles(solid_for(fg, h, round(c*0.72,3), 0.8), fg, PAGE['dark'], PAGES['dark'], 'dark', DARK_ACC, text_chroma=1, text_start=0.8))
neutral_light={'primary':'oklch(24% 0.004 285)','primary-hover':'oklch(31% 0.004 285)','primary-active':'oklch(38% 0.004 285)',
  'primary-foreground':'oklch(99% 0.002 255)','primary-subtle':ink(0.065),'primary-subtle-hover':ink(0.1),'primary-border':ink(0.2),
  'primary-text':'oklch(23% 0.004 285)','ring':ink(solve_ink(INK, 3.2, 'light')),'selection':ink(0.16)}
neutral_dark={'primary':'oklch(94% 0.003 255)','primary-hover':'oklch(88% 0.003 255)','primary-active':'oklch(82% 0.003 255)',
  'primary-foreground':'oklch(20% 0.004 285)','primary-subtle':ivory(0.075),'primary-subtle-hover':ivory(0.11),'primary-border':ivory(0.18),
  'primary-text':'oklch(94% 0.003 255)','ring':ivory(solve_ink(IVORY, 3.2, 'dark')),'selection':ivory(0.24)}

def block(sel, d, indent=''):
    return f"{indent}{sel} {{\n"+''.join(f"{indent}  --{k}: {v};\n" for k,v in d.items())+f"{indent}}}\n"
P='html[data-style="paper"]'
E='[data-style="paper"]'
def sel(*xs): return ',\n'.join(xs)
ROLES=['primary','primary-hover','primary-active','primary-foreground','primary-subtle','primary-subtle-hover','primary-border','primary-text','ring','selection']
out=["""/*
 * Generated by tooling/scripts/gen-paper.py. Do not edit.
 * Paper style applies to a page or section.
 * Switched at runtime with data-style="paper" on <html> (no attribute = the default style); the attribute
 * also works on any element to give one section the style. Light and dark both apply.
 * Import after the theme (and after theme-accents.css when you use it).
 */

""",
f"""{sel(P, E)} {{
  /* Titles take the text serif; body text stays on --font-sans. */
  --heading-font: "Source Serif 4 Variable", "Source Serif 4", "Noto Serif SC Variable", "Noto Serif SC", ui-serif, Georgia, "Songti SC", serif;
  --heading-font-features: normal;
""" + ''.join(f"  --{k}: {v};\n" for k,v in light.items()) + "}\n\n",
f"/* Softer corners and pill controls (buttons, tabs, switches, badges) by default. A radius preset or a custom value\n * wins, and then controls follow --radius like every other corner. */\n{sel(P+':not([data-radius])', 'html:not([data-radius]) '+E+':not([data-radius])')} {{\n  --radius: 0.75rem;\n  --control-radius: 2rem;\n}}\n\n",
f"{sel('html[data-radius] '+E, E+'[data-radius]', E+' [data-radius]')} {{\n  --control-radius: var(--radius);\n}}\n\n",
block(sel(P+'.dark', '.dark '+E), dark), '\n',
"/* Accents: dusty solids with white text on paper, pastel solids with ink text in dark; text, ring and selection follow. Blue (no data-accent) is the default. */\n",
block(sel(P+':not([data-accent])', E+':not([data-accent])'), acc_light(*ACC['blue'])),
block(sel(P+'.dark:not([data-accent])', '.dark '+E+':not([data-accent])'), acc_dark(*ACC['blue'])),
]
for name in ['neutral','blue','green','orange','rose','violet']:
    l = neutral_light if name=='neutral' else acc_light(*ACC[name])
    d = neutral_dark if name=='neutral' else acc_dark(*ACC[name])
    a=f'[data-accent="{name}"]'
    out.append(block(sel(P+a, E+a, f'html{a} {E}:not([data-accent])', f'{P} {a}'), l))
    out.append(block(sel(P+a+'.dark', '.dark '+E+a, f'html.dark{a} {E}:not([data-accent])', f'{P}.dark {a}'), d))
out.append("/* A custom accent picked for the page carries into a Paper section. */\n")
out.append(block(f'html[data-accent="custom"] {E}:not([data-accent])', {k:'inherit' for k in ROLES}))
result = ''.join(out)
result = result.replace(' 255)', f" {lch(ANCHORS['surface']['hex'])[2]:.2f})")
result = result.replace(' 285)', f" {W})")
OUT.write_text(result)
print(OUT)
