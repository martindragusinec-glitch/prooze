#!/usr/bin/env python3
"""Balíček loga PROOZE: 4 uspořádání × 5 barevných variant → SVG (vektor, průhledné).

  python3 tools/logo_pack.py      → brand/logo-balicek/SVG/*.svg
  node tools/logo_pack.mjs        → PNG (průhledné, 2 velikosti) + PDF + náhled + zip

Zdroj geometrie: assets/brand/logo.svg (symbol „Hřeben“ + wordmark převedený do křivek).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "brand/logo-balicek/SVG"

src = (ROOT / "assets/brand/logo.svg").read_text()
WORD = re.search(r'<path fill="[^"]+" transform="translate\(([\d.]+),0\)" d="([^"]+)"', src)
WORD_D = WORD.group(2)

# Symbol v jednotkách 0–72 × 2–56 (viditelná výška 54)
SLOPE = '<polygon points="36,2 0,38 0,56 36,20"/>'
MODS = ('<polygon points="38.5,4.5 48.5,14.5 48.5,32.5 38.5,22.5"/>'
        '<polygon points="51.5,17.5 60,26 60,44 51.5,35.5"/>'
        '<polygon points="63,29 72,38 72,56 63,47"/>')
S = 15.1852               # měřítko symbolu ve vodorovném logu
WORD_BOX = (20, -612, 3842, 240)  # viditelný obrys nápisu (x0, y0, x1, y1), účaří y=0

VARIANTS = {
    "barevne": ("#0F3A2E", "#FFC83A"),    # na světlé pozadí
    "inverzni": ("#FFFFFF", "#FFC83A"),   # na tmavé pozadí a fotky
    "na-zlute": ("#0F3A2E", "#FFFFFF"),   # na žluté #FFC83A
    "cerne": ("#000000", "#000000"),      # jednobarevné (razítka, gravír, fax)
    "bile": ("#FFFFFF", "#FFFFFF"),       # jednobarevné bílé (výsek, polep)
}


def symbol(x, y, sc, ink, pv):
    """Symbol s viditelným levým horním rohem v (x, y)."""
    return (f'<g transform="translate({x:.2f},{y - 2 * sc:.2f}) scale({sc:.4f})">'
            f'<g fill="{ink}">{SLOPE}</g><g fill="{pv}">{MODS}</g></g>')


def word(x, ink):
    """Nápis posunutý tak, aby jeho viditelný levý okraj byl v x (účaří y=0)."""
    return f'<path fill="{ink}" transform="translate({x - WORD_BOX[0]:.2f},0)" d="{WORD_D}"/>'


def layout(name, ink, pv):
    w0, wy0, w1, wy1 = WORD_BOX
    ww = w1 - w0
    if name == "vodorovne":
        sh = 54 * S
        gap = 150
        parts = symbol(0, -sh, S, ink, pv) + word(72 * S + gap, ink)
        box = (0, -sh, 72 * S + gap + ww, wy1)
    elif name == "svisle":
        k = 1.6
        sc = S * k
        sw, sh = 72 * sc, 54 * sc
        gap = 300
        sx = (ww - sw) / 2
        sy = wy0 - gap - sh
        parts = symbol(sx, sy, sc, ink, pv) + word(0, ink)
        box = (0, sy, ww, wy1)
    elif name == "symbol":
        parts = symbol(0, 0, S, ink, pv)
        box = (0, 0, 72 * S, 54 * S)
    elif name == "napis":
        parts = word(0, ink)
        box = (0, wy0, ww, wy1)
    else:
        raise ValueError(name)
    x0, y0, x1, y1 = box
    pad = 0.04 * max(x1 - x0, y1 - y0) if name == "symbol" else 0.02 * (x1 - x0)
    vb = (x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]:.1f} {vb[1]:.1f} {vb[2]:.1f} {vb[3]:.1f}" '
            f'width="{vb[2] / 10:.1f}" height="{vb[3] / 10:.1f}" role="img" aria-label="PROOZE">{parts}</svg>\n')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    n = 0
    for lay in ("vodorovne", "svisle", "symbol", "napis"):
        for var, (ink, pv) in VARIANTS.items():
            (OUT / f"prooze-logo-{lay}-{var}.svg").write_text(layout(lay, ink, pv))
            n += 1
    print(n, "SVG")


if __name__ == "__main__":
    main()
