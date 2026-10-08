#!/usr/bin/env python3
"""Zmenšené fotky pro web: assets/img/gen/*.png → assets/img/web/<název>-<šířka>.{webp,jpg}

  python3 tools/images.py
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/img/gen"
OUT = ROOT / "assets/img/web"
WIDTHS = (800, 1600, 2400)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for src in sorted(SRC.glob("*.png")):
        name = src.stem.split("-", 1)[1]
        im = Image.open(src).convert("RGB")
        sizes[name] = [im.width, im.height]
        for w in WIDTHS:
            if w > im.width and w != WIDTHS[0]:
                continue
            r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if w < im.width else im
            r.save(OUT / f"{name}-{w}.webp", "WEBP", quality=78, method=6)
            if w == 1600:
                r.save(OUT / f"{name}-{w}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
    (OUT / "sizes.json").write_text(json.dumps(sizes, indent=2))
    print("hotovo:", len(sizes), "fotek")


if __name__ == "__main__":
    main()
