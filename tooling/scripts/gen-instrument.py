# Writes packages/tokens/styles/theme-instrument.css (Instrument style). Re-run after changing values here.
#
# Instrument: an anodised aluminium faceplate. Grey ground, lighter module panels, crisp ink hairlines,
# small corners, raised key-cap controls and one signal-orange accent. Dark mode is black anodising.
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
OUT = ROOT / 'packages/tokens/styles/theme-instrument.css'

H = 255          # cool aluminium hue
C = 0.005        # barely tinted
SIG_H = 41       # signal orange

def css(v): return v.css() if isinstance(v, Ok) else v

def surfaces(mode):
    if mode == 'light':
        return dict(bg=Ok(0.925, C, H), card=Ok(0.972, 0.003, H), pop=Ok(0.988, 0.002, H), shell=Ok(0.895, 0.006, H), code=Ok(0.955, 0.004, H))
    return dict(bg=Ok(0.175, 0.004, H), card=Ok(0.212, 0.004, H), pop=Ok(0.245, 0.004, H), shell=Ok(0.145, 0.004, H), code=Ok(0.195, 0.004, H))

def solve(make, target, pages, under):
    return solve_alpha(make, lambda c: all(ratio(c, p, under) >= target for p in pages), 0.02, 1)

def mode_block(mode):
    s = surfaces(mode)
    pages = [s['bg'], s['card'], s['pop']]
    if mode == 'light':
        fg = Ok(0.19, 0.008, H)
        ink = lambda a: Ok(0.22, 0.01, H, a)
        hi = lambda a: Ok(1, 0, 0, a)
        shade = lambda a: Ok(0.2, 0.01, H, a)
    else:
        fg = Ok(0.95, 0.003, H)
        ink = lambda a: Ok(0.97, 0.003, H, a)
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
        '--surface-standout': Ok(0.2, 0.006, H) if mode == 'light' else Ok(0.3, 0.004, H),
        '--standout-foreground': Ok(0.96, 0.003, H),
        '--foreground': fg, '--card-foreground': fg, '--popover-foreground': fg,
        '--muted-foreground': ink(muted), '--fg-tertiary': ink(tert), '--fg-disabled': ink(round(tert * 0.68, 3)),
        '--fill-hover': ink(0.06 if mode == 'light' else 0.07), '--fill-active': ink(0.1 if mode == 'light' else 0.11), '--fill-strong': ink(0.16),
        '--secondary': 'var(--fill-hover)', '--secondary-foreground': fg,
        '--muted': 'var(--fill-hover)', '--accent': 'var(--fill-active)', '--accent-foreground': fg,
        # Hairlines are firmer than Paper's: the faceplate is drawn with them.
        '--border': ink(0.15 if mode == 'light' else 0.13), '--border-subtle': ink(0.08), '--border-strong': ink(0.28 if mode == 'light' else 0.24),
        '--border-control': ink(ctrl), '--input': ink(0.18 if mode == 'light' else 0.14),
        '--code': s['code'],
        '--scrollbar': ink(0.2), '--scrollbar-hover': ink(0.34),
        '--shell': s['shell'], '--shell-border': ink(0.14 if mode == 'light' else 0.1),
        '--image-outline': ink(0.12),
    }
    if mode == 'light':
        cap = f"inset 0 1px 0 {css(hi(0.75))}, 0 0 0 1px {css(shade(0.16))}, 0 1px 0 {css(shade(0.1))}, 0 2px 3px -1px {css(shade(0.14))}"
        cap_hover = f"inset 0 1px 0 {css(hi(0.85))}, 0 0 0 1px {css(shade(0.2))}, 0 1px 0 {css(shade(0.12))}, 0 3px 5px -2px {css(shade(0.16))}"
        d.update({
            '--shadow-border': f"0 0 0 1px {css(shade(0.14))}",
            '--shadow-default': f"0 0 0 1px {css(shade(0.12))}, 0 1px 2px {css(shade(0.06))}",
            '--shadow-lg': f"0 0 0 1px {css(shade(0.12))}, 0 6px 14px -4px {css(shade(0.14))}, 0 18px 36px -12px {css(shade(0.18))}",
            '--shadow-xl': f"0 0 0 1px {css(shade(0.1))}, 0 12px 28px -8px {css(shade(0.16))}, 0 32px 64px -16px {css(shade(0.24))}",
            '--skeuo-raised': cap, '--skeuo-raised-hover': cap_hover,
            '--skeuo-pressed': f"inset 0 1px 2px {css(shade(0.16))}, 0 0 0 1px {css(shade(0.16))}",
            '--skeuo-primary': f"inset 0 1px 0 {css(hi(0.35))}, 0 0 0 1px {css(Ok(0.45, 0.15, SIG_H, 0.5))}, 0 2px 3px -1px {css(Ok(0.45, 0.15, SIG_H, 0.35))}",
            '--skeuo-well': f"inset 0 1px 2px {css(shade(0.08))}, inset 0 0 0 1px var(--input)",
            '--skeuo-surface': 'var(--shadow-lg)', '--skeuo-chip': 'var(--shadow-border)',
        })
    else:
        cap = f"inset 0 1px 0 {css(hi(0.08))}, 0 0 0 1px {css(shade(0.6))}, 0 1px 0 {css(shade(0.5))}, 0 2px 4px -1px {css(shade(0.45))}"
        d.update({
            '--shadow-border': f"0 0 0 1px {css(ink(0.1))}",
            '--shadow-default': f"0 0 0 1px {css(ink(0.09))} inset, 0 1px 2px {css(shade(0.3))}",
            '--shadow-lg': f"0 0 0 1px {css(ink(0.12))}, 0 6px 14px -4px {css(shade(0.4))}, 0 18px 36px -12px {css(shade(0.55))}",
            '--shadow-xl': f"0 0 0 1px {css(ink(0.1))} inset, 0 12px 28px -8px {css(shade(0.4))}, 0 32px 64px -16px {css(shade(0.6))}",
            '--skeuo-raised': cap,
            '--skeuo-raised-hover': f"inset 0 1px 0 {css(hi(0.11))}, 0 0 0 1px {css(shade(0.6))}, 0 1px 0 {css(shade(0.5))}, 0 3px 6px -2px {css(shade(0.5))}",
            '--skeuo-pressed': f"inset 0 1px 2px {css(shade(0.5))}, 0 0 0 1px {css(ink(0.08))}",
            '--skeuo-primary': f"inset 0 1px 0 {css(hi(0.3))}, 0 2px 4px -1px {css(shade(0.5))}",
            '--skeuo-well': f"inset 0 1px 2px {css(shade(0.35))}, inset 0 0 0 1px var(--input)",
            '--skeuo-surface': 'var(--shadow-lg)', '--skeuo-chip': 'var(--shadow-border)',
        })
    return d, s, pages

def signal(mode, s, pages):
    solid = Ok(0.685, 0.2, SIG_H)
    on = Ok(0.18, 0.03, SIG_H)
    assert ratio(on, solid) >= 4.5, ratio(on, solid)
    if mode == 'light':
        # Orange text on grey needs to come down in lightness to read.
        L = 0.6
        while not all(ratio(Ok(L, 0.17, SIG_H), p, s['bg']) >= 4.5 for p in pages):
            L -= 0.005
        text = Ok(round(L, 3), 0.17, SIG_H)
        ring = text
    else:
        text = Ok(0.74, 0.17, SIG_H)
        assert all(ratio(text, p, s['bg']) >= 4.5 for p in pages)
        ring = solid
    sub = 0.12 if mode == 'light' else 0.16
    return {
        '--primary': solid, '--primary-hover': solid.with_(L=0.715), '--primary-active': solid.with_(L=0.745, C=0.17),
        '--primary-foreground': on,
        '--primary-subtle': solid.with_(a=sub), '--primary-subtle-hover': solid.with_(a=sub + 0.06),
        '--primary-border': solid.with_(a=0.4), '--primary-text': text, '--ring': ring,
        '--selection': solid.with_(a=0.24 if mode == 'light' else 0.36),
    }

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
    out = ['/*\n * Generated by tooling/scripts/gen-instrument.py. Do not edit.\n'
           ' * Instrument style: an aluminium faceplate with key-cap controls and a signal-orange accent.\n'
           ' * Switched with data-style="instrument" on <html> (or any element). Light and dark both apply.\n'
           ' * Import after the theme (and after theme-accents.css when you use it).\n */\n']
    report = []
    for mode, sel, psel in (
        ('light', 'html[data-style="instrument"],\n[data-style="instrument"]', 'html[data-style="paper"],'),
        ('dark', 'html[data-style="instrument"].dark,\n.dark [data-style="instrument"]', 'html[data-style="paper"].dark,'),
    ):
        d, s, pages = mode_block(mode)
        d.update(paper_vars(psel))
        fit_text_roles(d, s, pages)
        out.append(block(sel, d))
        report.append((mode, d['--muted-foreground'], d['--fg-tertiary'], d['--border-control']))
        if mode == 'light':
            out.append('/* Small machined corners; controls follow the theme radius (no pills). A radius preset still wins. */\n'
                       + block('html[data-style="instrument"]:not([data-radius]),\nhtml:not([data-radius]) [data-style="instrument"]:not([data-radius])',
                               {'--radius': '0.375rem'}))
    out.append('/* Signal orange is the default accent (and what the orange preset means here); any other data-accent preset still wins. */\n')
    out.append(block('html[data-style="instrument"]:not([data-accent]),\n[data-style="instrument"]:not([data-accent]),\nhtml[data-style="instrument"][data-accent="orange"],\n[data-style="instrument"][data-accent="orange"]',
                     signal('light', *mode_block('light')[1:])))
    out.append(block('html[data-style="instrument"].dark:not([data-accent]),\n.dark [data-style="instrument"]:not([data-accent]),\nhtml[data-style="instrument"][data-accent="orange"].dark,\n.dark [data-style="instrument"][data-accent="orange"]',
                     signal('dark', *mode_block('dark')[1:])))
    OUT.write_text('\n'.join(out))
    for r in report:
        print(*(css(x) for x in r))
    print('wrote', OUT.relative_to(ROOT))

if __name__ == '__main__':
    main()
