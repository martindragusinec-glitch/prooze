#!/usr/bin/env python3
"""Vzorky krytin (kruhové výřezy textur) z vygenerovaných fotek → assets/img/swatch/*.webp"""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/img/gen"
OUT = ROOT / "assets/img/swatch"
# název: (soubor, střed x, střed y, velikost) v relativních souřadnicích fotky
CROPS = {
    "palena": ("03-taska-palena-detail.png", .42, .45, .30),
    "betonova": ("06-beton-rd.png", .30, .31, .07),
    "plech": ("12-plech-taskova-tabule.png", .40, .26, .10),
    "hlinik": ("13-prefa-sablony.png", .30, .62, .22),
    "sindel": ("05-sindel-chata.png", .52, .22, .06),
}
OUT.mkdir(parents=True, exist_ok=True)
for name, (f, cx, cy, s) in CROPS.items():
    im = Image.open(SRC / f).convert("RGB")
    w, h = im.size
    side = int(min(w, h) * s / min(1, h / w) if False else w * s)
    x0, y0 = int(w * cx - side / 2), int(h * cy - side / 2)
    im.crop((x0, y0, x0 + side, y0 + side)).resize((160, 160), Image.LANCZOS).save(OUT / f"{name}.webp", "WEBP", quality=82)
print("ok")
