#!/usr/bin/env python3
"""Fotky realizací pro pás na úvodní stránce.

  python3 tools/realizace.py --import "<složka s fotkami od Pavla>"   # jednou: výběr, ořez, rozmazání SPZ → assets/photos/realizace/
  python3 tools/realizace.py                                           # webové velikosti → assets/img/real/<název>-{800,1600}.webp

Originály (assets/photos/) jsou mimo git. Popisy a pořadí zakázek jsou v src/realizace.json.
Fotky se ukládají bez EXIF (žádné GPS ani datum z telefonu).
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
ORIG = ROOT / "assets/photos/realizace"
OUT = ROOT / "assets/img/real"
WIDTHS = (800, 1600)

# číslo fotky (pořadí souborů ve složce, od 1) → název, ořez (l, t, r, b v poměru), rozmazat (boxy v poměru)
VYBER = {
    13: ("vila-1", None, None), 1: ("vila-pred", None, None), 5: ("vila-2", None, None), 8: ("vila-3", None, None),
    2: ("vila-4", None, None), 6: ("vila-5", None, None),
    39: ("stit-1", None, None), 36: ("stit-pred", None, None), 34: ("stit-pred2", None, None), 37: ("stit-2", None, None),
    38: ("stit-3", None, None), 40: ("stit-4", None, None), 46: ("stit-5", None, None),
    44: ("lodzie-1", None, None), 43: ("lodzie-behem", (0, 0, 1, .74), None), 49: ("lodzie-2", None, [(.271, .838, .299, .87)]),
    48: ("lodzie-3", None, None), 47: ("lodzie-4", None, None),
    18: ("okna-1", None, None), 20: ("okna-2", (0, 0, 1, .7), None), 19: ("okna-3", None, None),
    28: ("mansarda-1", None, None), 32: ("mansarda-pred", None, None), 33: ("mansarda-2", None, None), 17: ("mansarda-3", None, None),
    29: ("mansarda-4", None, None), 27: ("mansarda-5", None, None),
    24: ("plech-1", (0, 0, 1, .88), None), 25: ("plech-2", None, None), 31: ("plech-3", None, None),
    16: ("roubenka-1", None, None),
}
# před/po pro posuvník: stejný záběr, „před“ se dorovná na „po“ (SIFT + homografie), oříznout dodávku
POROVNANI = (21, 22, "okna-pred", "okna-po", (0, .12, 1, .78))


def soubory(slozka):
    return sorted(p for p in Path(slozka).iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png"))


def nacti(p):
    return ImageOps.exif_transpose(Image.open(p)).convert("RGB")


def orez(im, box):
    if not box:
        return im
    w, h = im.size
    return im.crop((round(box[0] * w), round(box[1] * h), round(box[2] * w), round(box[3] * h)))


def rozmazat(im, boxy):
    """Rozmaže SPZ s měkkým okrajem (bez viditelného obdélníku)."""
    from PIL import ImageDraw
    for b in boxy or []:
        w, h = im.size
        r = (round(b[0] * w), round(b[1] * h), round(b[2] * w), round(b[3] * h))
        mask = Image.new("L", im.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle(r, radius=4, fill=255)
        im = Image.composite(im.filter(ImageFilter.GaussianBlur(7)), im, mask.filter(ImageFilter.GaussianBlur(3)))
    return im


def importuj(slozka):
    import cv2
    import numpy as np
    f = soubory(slozka)
    ORIG.mkdir(parents=True, exist_ok=True)
    for n, (name, box, blur) in VYBER.items():
        im = rozmazat(orez(nacti(f[n - 1]), box), blur)
        im.save(ORIG / f"{name}.jpg", quality=93)  # bez exif
    a, b, na, nb, box = POROVNANI
    A = cv2.cvtColor(np.array(nacti(f[a - 1])), cv2.COLOR_RGB2BGR)
    B = cv2.cvtColor(np.array(nacti(f[b - 1])), cv2.COLOR_RGB2BGR)
    A = cv2.resize(A, (B.shape[1], B.shape[0]))
    sift = cv2.SIFT_create(8000)
    k1, d1 = sift.detectAndCompute(cv2.cvtColor(A, cv2.COLOR_BGR2GRAY), None)
    k2, d2 = sift.detectAndCompute(cv2.cvtColor(B, cv2.COLOR_BGR2GRAY), None)
    good = [x for x, y in cv2.BFMatcher().knnMatch(d1, d2, k=2) if x.distance < .7 * y.distance]
    H, _ = cv2.findHomography(np.float32([k1[x.queryIdx].pt for x in good]), np.float32([k2[x.trainIdx].pt for x in good]), cv2.RANSAC, 4.0)
    W = cv2.warpPerspective(A, H, (B.shape[1], B.shape[0]), borderMode=cv2.BORDER_REPLICATE)
    for arr, name in ((W, na), (B, nb)):
        orez(Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB)), box).save(ORIG / f"{name}.jpg", quality=93)
    print("import:", len(VYBER) + 2, "fotek →", ORIG.relative_to(ROOT))


def web():
    import json
    OUT.mkdir(parents=True, exist_ok=True)
    n, sizes = 0, {}
    for src in sorted(ORIG.glob("*.jpg")):
        im = Image.open(src).convert("RGB")
        sizes[src.stem] = [1600, round(im.height * 1600 / im.width)]
        for w in WIDTHS:
            r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if w < im.width else im
            r.save(OUT / f"{src.stem}-{w}.webp", "WEBP", quality=76, method=6)
        n += 1
    (OUT / "sizes.json").write_text(json.dumps(sizes, indent=1) + "\n")  # rozměry pro build (originály nejsou v gitu)
    print("web:", n, "fotek →", OUT.relative_to(ROOT))


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--import":
        importuj(sys.argv[2])
    web()
