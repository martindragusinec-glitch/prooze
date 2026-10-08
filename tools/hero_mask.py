#!/usr/bin/env python3
"""Popředí hero fotky (dům + strom) pro efekt nápisu za střechou.

Spojí alfu z odstraňovače pozadí (dům) s vlastní maskou „všechno, co není obloha“
(obloha je hladký přechod, takže stačí porovnat pixel s barvou oblohy v daném řádku).
Výstup: assets/img/web/hero-front-{1280,1920,2880}.webp + hero-back-*.{webp,jpg}
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
src = Image.open(ROOT / "assets/img/hero-a.png").convert("RGB")
cut = Image.open(ROOT / "assets/img/hero-a-cut.png").convert("RGBA")
W, H = src.size
a = np.asarray(src).astype(np.float32)

# model oblohy: hladký polynom 3. stupně v (x, y) pro každý kanál, napasovaný na pixely,
# které odstraňovač označil jako pozadí (horních 58 % fotky); dvě iterace bez odlehlých bodů (strom)
ys, xs = np.mgrid[0:H:8, 0:W:8]
cut_a = np.asarray(cut)[::8, ::8, 3]
sample = (cut_a < 10) & (ys < H * .58)
def basis(x, y):
    x = x / W; y = y / H
    return np.stack([np.ones_like(x), x, y, x * x, x * y, y * y, x ** 3, x * x * y, x * y * y, y ** 3], -1)
px = a[::8, ::8, :]
m = sample.copy()
for _ in range(3):
    A = basis(xs[m].astype(np.float32), ys[m].astype(np.float32))
    coef, *_ = np.linalg.lstsq(A, px[m], rcond=None)
    pred = basis(xs.astype(np.float32), ys.astype(np.float32)) @ coef
    err = np.sqrt(((px - pred) ** 2).sum(-1))
    m = sample & (err < 18)
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
sky = basis(XX, YY) @ coef
dist = np.sqrt(((a - sky) ** 2).sum(axis=2))
own = (dist > 24).astype(np.float32)
own[int(H * .62):, :] = 1.0  # spodek fotky je celý popředí (tráva, plot)
own_img = Image.fromarray((own * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
alpha = np.maximum(np.asarray(own_img), np.asarray(cut)[:, :, 3])
front = src.copy()
front.putalpha(Image.fromarray(alpha.astype(np.uint8)))

out = ROOT / "assets/img/web"
out.mkdir(parents=True, exist_ok=True)
for w in (1280, 1920, 2880):
    h = round(H * w / W)
    front.resize((w, h), Image.LANCZOS).save(out / f"hero-front-{w}.webp", "WEBP", quality=82, method=6)
    back = src.resize((w, h), Image.LANCZOS)
    back.save(out / f"hero-back-{w}.webp", "WEBP", quality=80, method=6)
    if w == 1920:
        back.save(out / f"hero-back-{w}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
# kontrolní náhled na purpurové
prev = Image.new("RGBA", front.size, (255, 0, 200, 255)); prev.alpha_composite(front)
prev.convert("RGB").resize((960, 540)).save(ROOT / "research/hero-mask-check.jpg", quality=80)
print("ok")
