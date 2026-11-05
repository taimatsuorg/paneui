"""Role derivations shared by the default style (gen-theme.py) and the Paper style (gen-paper.py).

Every rule here is a contrast rule, so both styles and every accent preset meet the same floor:
- a solid fill and its foreground: 4.5:1 (hover and active move away from the foreground, never towards it);
- a `-text` role: 4.5:1 on the page, the card and its own subtle fill (aimed at 5:1 for headroom);
- tag text: 4.5:1 on the page, its highlight background and its pill fill;
- the focus ring and the control edge: 3:1 on the page.
"""
from theme_color import Ok, ratio, solve_L

TEXT_TARGET = 5.0
SOLID_TARGET = 4.6


def solid_for(fg, H, C, L_start, page_ok=None, target=SOLID_TARGET):
    """The solid nearest L_start (moving away from fg) whose fg reaches the target."""
    light_fg = fg.L > 0.5
    if ratio(fg, Ok(L_start, C, H)) >= target:
        return Ok(L_start, C, H)
    if light_fg:
        L = solve_L(lambda L: Ok(L, C, H), lambda s: ratio(fg, s) >= target, 0, L_start, prefer="high")
    else:
        L = solve_L(lambda L: Ok(L, C, H), lambda s: ratio(fg, s) >= target, L_start, 1, prefer="low")
    return Ok(L, C, H)


def states(solid, fg, step=0.035):
    """Hover and active: further from the foreground (darker under white text, lighter under dark text)."""
    d = -step if fg.L > 0.5 else step
    return solid.with_(L=max(0, min(1, solid.L + d))), solid.with_(L=max(0, min(1, solid.L + 2 * d)))


def text_role(H, C, pages, subtle, mode, target=TEXT_TARGET, L_start=None):
    """Accent or status text: the hue, readable on every page surface and on its subtle fill."""
    def ok(t):
        return all(ratio(t, p) >= target for p in pages) and ratio(t, subtle, pages[0]) >= target - 0.4

    if mode == "light":
        return Ok(solve_L(lambda L: Ok(L, C, H), ok, 0.2, L_start or 0.62, prefer="high"), C, H)
    return Ok(solve_L(lambda L: Ok(L, C, H), ok, L_start or 0.72, 0.95, prefer="low"), C, H)


def ring_role(solid, text, page):
    """Focus ring: the solid when it clears 3:1 on the page, otherwise the text role."""
    return solid if ratio(solid, page) >= 3.2 else text


def accent_roles(solid, fg, page, pages, mode, alphas=None, text_chroma=0.9, text_start=None):
    """The ten accent roles of one preset in one mode."""
    a = alphas or ({"subtle": 0.1, "subtle-hover": 0.16, "border": 0.32, "selection": 0.22} if mode == "light" else {"subtle": 0.16, "subtle-hover": 0.24, "border": 0.42, "selection": 0.4})
    hover, active = states(solid, fg)
    subtle = solid.with_(a=a["subtle"])
    text = text_role(solid.H, solid.C * text_chroma, pages, subtle, mode, L_start=text_start)
    return {
        "primary": solid,
        "primary-hover": hover,
        "primary-active": active,
        "primary-foreground": fg,
        "primary-subtle": subtle,
        "primary-subtle-hover": solid.with_(a=a["subtle-hover"]),
        "primary-border": solid.with_(a=a["border"]),
        "primary-text": text,
        "ring": ring_role(solid, text, page),
        "selection": solid.with_(a=a["selection"]),
    }


def status_roles(name, solid, fg, pages, mode, alphas=None, text_chroma=0.9, text_start=None):
    a = alphas or ({"subtle": 0.1, "border": 0.3} if mode == "light" else {"subtle": 0.16, "border": 0.4})
    hover, _ = states(solid, fg)
    subtle = solid.with_(a=a["subtle"])
    return {
        name: solid,
        f"{name}-hover": hover,
        f"{name}-foreground": fg,
        f"{name}-subtle": subtle,
        f"{name}-border": solid.with_(a=a["border"]),
        f"{name}-text": text_role(solid.H, solid.C * text_chroma, pages, subtle, mode, L_start=text_start),
    }


# Tag colours: hue and the chroma of their text. "default" is the plain text colour on an ink pill.
TAG_HUES = {"gray": (None, 0.006), "brown": (48, 0.07), "orange": (55, 0.15), "yellow": (85, 0.13), "green": (155, 0.1), "blue": (245, 0.12), "purple": (305, 0.14), "pink": (350, 0.15), "red": (25, 0.17)}
TAGS = ["default", *TAG_HUES]


def tag_roles(mode, pages, foreground, ink_fill, gray_hue, gray_chroma=None):
    """text, highlight background (bg) and pill fill per tag colour; text reaches 4.5:1 on all three."""
    page = pages[0]
    out = {"tag-default-text": foreground, "tag-default-bg": "transparent", "tag-default-fill": ink_fill}
    for name, (h, c) in TAG_HUES.items():
        if name == "gray":
            h, c = gray_hue, (c if gray_chroma is None else gray_chroma)
        if mode == "light":
            bg = Ok(0.965, min(c * 0.18, 0.03), h)
            fill = Ok(0.93, min(c * 0.35, 0.06), h)
            start = 0.47 if name in ("orange", "yellow") else 0.49
        else:
            bg = Ok(0.27, min(c * 0.2, 0.03), h)
            fill = Ok(0.36, min(c * 0.55, 0.085), h)
            start = 0.77
        tc = c if mode == "light" else c * 0.8

        def ok(t):
            return all(ratio(t, s) >= 4.6 for s in (*pages, bg, fill))

        L = solve_L(lambda L: Ok(L, tc, h), ok, 0.2, start, prefer="high") if mode == "light" else solve_L(lambda L: Ok(L, tc, h), ok, start, 0.97, prefer="low")
        out[f"tag-{name}-text"] = Ok(L, tc, h)
        out[f"tag-{name}-bg"] = bg
        out[f"tag-{name}-fill"] = fill
    return out
