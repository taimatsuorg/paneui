"""OKLCH and WCAG helpers shared by the theme generators (gen-theme.py, gen-paper.py)."""
import math


def _gamma(x):
    return 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055


def _linear(x):
    return x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4


def oklch_linear(L, C, H):
    a = C * math.cos(math.radians(H))
    b = C * math.sin(math.radians(H))
    l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s_ = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return (
        4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
        -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
        -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_,
    )


def in_gamut(L, C, H):
    return all(-0.0005 <= v <= 1.0005 for v in oklch_linear(L, C, H))


def fit(L, C, H):
    """Largest chroma up to C that stays inside sRGB at this lightness and hue."""
    if in_gamut(L, C, H):
        return C
    lo, hi = 0.0, C
    for _ in range(30):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if in_gamut(L, mid, H) else (lo, mid)
    return lo


def rgb(L, C, H):
    """sRGB 0..1 (gamma encoded), clipped."""
    return tuple(min(1, max(0, _gamma(min(1, max(0, v))))) for v in oklch_linear(L, C, H))


def hex_to_oklch(h):
    r, g, b = (_linear(int(h[i:i + 2], 16) / 255) for i in (1, 3, 5))
    l, m, s = (
        (a * r + b1 * g + c * b) ** (1 / 3)
        for a, b1, c in [
            (0.4122214708, 0.5363325363, 0.0514459929),
            (0.2119034982, 0.6806995451, 0.1073969566),
            (0.0883024619, 0.2817188376, 0.6299787005),
        ]
    )
    L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    return L, math.hypot(A, B), math.degrees(math.atan2(B, A)) % 360


def over(top, alpha, under):
    return tuple(t * alpha + u * (1 - alpha) for t, u in zip(top, under))


def luminance(c):
    r, g, b = (_linear(v) for v in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    x, y = sorted((luminance(a), luminance(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


class Ok:
    """An OKLCH colour with optional alpha; chroma is fitted to sRGB on creation."""

    def __init__(self, L, C=0.0, H=0.0, a=1.0):
        self.L, self.H, self.a = L, H, a
        self.C = fit(L, C, H) if C else 0.0

    def rgb(self, under=None):
        c = rgb(self.L, self.C, self.H)
        return over(c, self.a, under) if self.a < 1 and under is not None else c

    def css(self):
        ch = f"{round(self.C, 4):g}" if self.C >= 0.0005 else "0"
        hue = f"{round(self.H, 2):g}" if self.C >= 0.0005 else "0"
        base = f"oklch({round(self.L * 100, 2):g}% {ch} {hue}"
        return base + (f" / {round(self.a, 3):g})" if self.a < 1 else ")")

    def with_(self, **kw):
        d = dict(L=self.L, C=self.C, H=self.H, a=self.a)
        d.update(kw)
        return Ok(**d)

    __str__ = css


def ratio(fg, bg, page=None):
    """Contrast of fg on bg; alpha colours are composited (bg over the page, fg over bg)."""
    page_rgb = page.rgb() if page is not None else (1, 1, 1)
    b = bg.rgb(page_rgb) if bg.a < 1 else bg.rgb()
    f = fg.rgb(b) if fg.a < 1 else fg.rgb()
    return contrast(f, b)


def solve_L(make, ok, lo=0.0, hi=1.0, prefer="high"):
    """Lightness in [lo, hi] closest to the preferred end for which ok(make(L)) holds (scan in 0.5 steps)."""
    steps = [round(lo + i * 0.005, 4) for i in range(int((hi - lo) / 0.005) + 1)]
    if prefer == "high":
        steps.reverse()
    for L in steps:
        if ok(make(L)):
            return L
    raise ValueError("no lightness satisfies the constraint")


def solve_alpha(make, ok, lo=0.0, hi=1.0):
    """Smallest alpha (0.01 steps) for which ok(make(a)) holds."""
    a = lo
    while a <= hi + 1e-9:
        if ok(make(round(a, 3))):
            return round(a, 3)
        a += 0.01
    raise ValueError("no alpha satisfies the constraint")
