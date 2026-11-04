# Writes packages/tokens/styles/theme-studio.css (Studio style). Re-run after changing values here.
#
# Studio: a white page (black in dark mode) with components set on soft grey tiles that carry no border
# or shadow. Neutral ink, a near-black primary from the neutral accent. Corners and controls follow the
# theme radius and its presets (no style default of its own), so the radius scale stays in order.
# Status colours and tag palettes are taken from the Paper style (already AA); everything that gives
# the style its look is solved here, every text role against every surface it sits on.
from pathlib import Path
import re
import sys
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).parent))
from theme_color import Ok, ratio, solve_alpha  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'packages/tokens/styles/theme-paper.css'
OUT = ROOT / 'packages/tokens/styles/theme-studio.css'

H = 265          # ink hue, near neutral
C = 0

def css(v): return v.css() if isinstance(v, Ok) else v

def surfaces(mode):
    if mode == 'light':
        return dict(bg=Ok(1, 0, 0), card=Ok(0.961, 0, 0), pop=Ok(1, 0, 0), shell=Ok(1, 0, 0), code=Ok(1, 0, 0))
    return dict(bg=Ok(0.1, 0, 0), card=Ok(0.2, 0, 0), pop=Ok(0.235, 0, 0), shell=Ok(0.1, 0, 0), code=Ok(0.1, 0, 0))

def solve(make, target, pages, under):
    return solve_alpha(make, lambda c: all(ratio(c, p, under) >= target for p in pages), 0.02, 1)

def mode_block(mode):
    s = surfaces(mode)
    pages = [s['bg'], s['card'], s['pop']]
    if mode == 'light':
        fg = Ok(0.205, 0.004, H)
        ink = lambda a: Ok(0.205, 0.004, H, a)
        hi = lambda a: Ok(1, 0, 0, a)
        shade = lambda a: Ok(0.2, 0.004, H, a)
    else:
        fg = Ok(0.97, 0, 0)
        ink = lambda a: Ok(0.97, 0, 0, a)
        hi = lambda a: Ok(1, 0, 0, a)
        shade = lambda a: Ok(0, 0, 0, a)
    muted = solve(ink, 4.6, pages, s['bg'])
    tert = solve(ink, 3.1, pages, s['bg'])
    ctrl = solve(ink, 3.05, pages, s['bg'])
    d = {
        '--heading-font': '"Noto Sans Variable", "Noto Sans", "Noto Sans SC Variable", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, "PingFang SC", sans-serif',
        '--heading-font-features': 'normal',
        '--background': s['bg'], '--card': s['card'], '--popover': s['pop'],
        '--surface-sunken': shade(0.06 if mode == 'light' else 0.28),
        '--surface-standout': Ok(0.205, 0.004, H) if mode == 'light' else Ok(0.97, 0, 0),
        '--standout-foreground': Ok(0.98, 0, 0) if mode == 'light' else Ok(0.15, 0, 0),
        '--foreground': fg, '--card-foreground': fg, '--popover-foreground': fg,
        '--muted-foreground': ink(muted), '--fg-tertiary': ink(tert), '--fg-disabled': ink(round(tert * 0.68, 3)),
        '--fill-hover': ink(0.05 if mode == 'light' else 0.07), '--fill-active': ink(0.08 if mode == 'light' else 0.11), '--fill-strong': ink(0.14),
        '--secondary': 'var(--fill-hover)', '--secondary-foreground': fg,
        '--muted': 'var(--fill-hover)', '--accent': 'var(--fill-active)', '--accent-foreground': fg,
        # Soft hairlines: tiles are drawn with fill, not lines.
        '--border': ink(0.1), '--border-subtle': ink(0.06), '--border-strong': ink(0.2),
        '--border-control': ink(ctrl), '--input': ink(0.12),
        '--code': s['code'],
        '--scrollbar': ink(0.2), '--scrollbar-hover': ink(0.34),
        '--shell': s['shell'], '--shell-border': ink(0.08),
        '--image-outline': ink(0.12),
    }
    if mode == 'light':
        cap = f"0 0 0 1px {css(shade(0.08))}, 0 1px 2px {css(shade(0.06))}"
        cap_hover = f"0 0 0 1px {css(shade(0.12))}, 0 1px 3px {css(shade(0.08))}"
        d.update({
            '--shadow-border': f"0 0 0 1px {css(shade(0.14))}",
            '--shadow-default': f"0 0 0 1px {css(shade(0.12))}, 0 1px 2px {css(shade(0.06))}",
            '--shadow-lg': f"0 0 0 1px {css(shade(0.12))}, 0 6px 14px -4px {css(shade(0.14))}, 0 18px 36px -12px {css(shade(0.18))}",
            '--shadow-xl': f"0 0 0 1px {css(shade(0.1))}, 0 12px 28px -8px {css(shade(0.16))}, 0 32px 64px -16px {css(shade(0.24))}",
            '--skeuo-raised': cap, '--skeuo-raised-hover': cap_hover,
            '--skeuo-pressed': f"inset 0 1px 2px {css(shade(0.16))}, 0 0 0 1px {css(shade(0.16))}",
            '--skeuo-primary': 'none',
            '--skeuo-well': 'inset 0 0 0 1px var(--input)',
            '--skeuo-surface': 'var(--shadow-lg)', '--skeuo-chip': 'var(--shadow-border)',
        })
    else:
        cap = f"inset 0 0 0 1px {css(ink(0.08))}"
        d.update({
            '--shadow-border': f"0 0 0 1px {css(ink(0.1))}",
            '--shadow-default': f"0 0 0 1px {css(ink(0.09))} inset, 0 1px 2px {css(shade(0.3))}",
            '--shadow-lg': f"0 0 0 1px {css(ink(0.12))}, 0 6px 14px -4px {css(shade(0.4))}, 0 18px 36px -12px {css(shade(0.55))}",
            '--shadow-xl': f"0 0 0 1px {css(ink(0.1))} inset, 0 12px 28px -8px {css(shade(0.4))}, 0 32px 64px -16px {css(shade(0.6))}",
            '--skeuo-raised': cap,
            '--skeuo-raised-hover': f"inset 0 0 0 1px {css(ink(0.12))}",
            '--skeuo-pressed': f"inset 0 1px 2px {css(shade(0.5))}, 0 0 0 1px {css(ink(0.08))}",
            '--skeuo-primary': 'none',
            '--skeuo-well': 'inset 0 0 0 1px var(--input)',
            '--skeuo-surface': 'var(--shadow-lg)', '--skeuo-chip': 'var(--shadow-border)',
        })
    return d, s, pages

def parse_ok(v):
    m = re.match(r'oklch\(([\d.]+)% ([\d.]+) ([\d.]+)(?: / ([\d.]+))?\)', v)
    return Ok(float(m[1]) / 100, float(m[2]), float(m[3]), float(m[4] or 1)) if m else None

def fit_text_roles(d, s, pages):
    """Paper's coloured text was solved on a paler page; walk each -text role darker (light) or lighter (dark) until AA holds here."""
    step = -0.005 if s['bg'].L > 0.5 else 0.005
    for k, v in list(d.items()):
        c = parse_ok(v) if isinstance(v, str) and k.endswith('-text') else None
        if not c:
            continue
        while not all(ratio(c, p, s['bg']) >= 4.5 for p in pages):
            c = c.with_(L=round(c.L + step, 4))
        d[k] = c

def block(sel, d):
    body = '\n'.join(f"  {k}: {css(v)};" for k, v in d.items())
    return f"{sel} {{\n{body}\n}}\n"

def paper_vars(sel_start):
    """Status and tag variables from the Paper block that opens with `sel_start`."""
    text = SRC.read_text()
    i = text.index(sel_start)
    body = text[text.index('{', i) + 1:text.index('}', i)]
    keep = {}
    for k, v in re.findall(r'(--[\w-]+):\s*([^;]+);', body):
        if re.match(r'--(destructive|success|warning|info|tag)-?', k):
            keep[k] = v
    return keep

def main():
    out = ['/*\n * Generated by tooling/scripts/gen-studio.py. Do not edit.\n'
           ' * Studio style: a white page and borderless grey tiles. Corners follow the theme radius.\n'
           ' * Switched with data-style="studio" on <html> (or any element). Light and dark both apply.\n'
           ' * Import after the theme (and after theme-accents.css when you use it).\n */\n']
    report = []
    for mode, sel, psel in (
        ('light', 'html[data-style="studio"],\n[data-style="studio"]', 'html[data-style="paper"],'),
        ('dark', 'html[data-style="studio"].dark,\n.dark [data-style="studio"]', 'html[data-style="paper"].dark,'),
    ):
        d, s, pages = mode_block(mode)
        d.update(paper_vars(psel))
        fit_text_roles(d, s, pages)
        out.append(block(sel, d))
        report.append((mode, d['--muted-foreground'], d['--fg-tertiary'], d['--border-control']))
    OUT.write_text('\n'.join(out))
    for r in report:
        print(*(css(x) for x in r))
    print('wrote', OUT.relative_to(ROOT))

if __name__ == '__main__':
    main()
