#!/usr/bin/env python3
"""Kontrola článků Poradny: python3 tools/blog_qa.py (po python3 tools/build.py)

Hlídá stavbu podle research/blog-brief.md, délky title/description, odkazy, typografii.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
import build  # noqa: E402

build.load_blog()
DIST = ROOT / "dist"
problems = 0
rows = []


def plain(s):
    return build.plain(s)


for page, p in sorted(build.POSTS.items(), key=lambda kv: int(kv[1].get("poradi", 99))):
    body = p["body"]
    issues = []
    words = len(plain(body).split())
    title_core = p["title"].replace(" | PROOZE", "")
    if len(title_core) > 62:
        issues.append(f"title {len(title_core)} znaků")
    if not 120 <= len(p["description"]) <= 160:
        issues.append(f"description {len(p['description'])} znaků")
    if 'class="tldr"' not in body:
        issues.append("chybí Ve zkratce")
    if "<table" not in body:
        issues.append("chybí tabulka")
    ctas = len(re.findall(r"\{\{(cta:[\w-]+|kalkulacka)\}\}", body))
    if ctas < 2:
        issues.append(f"jen {ctas} CTA")
    if re.search(r"\{\{(?:cta:[\w-]+|kalkulacka)\}\}\s*\{\{(?:cta:[\w-]+|kalkulacka)\}\}", body):
        issues.append("dvě CTA za sebou")
    faq = len(re.findall(r"<details><summary>", body))
    if faq < 4:
        issues.append(f"FAQ jen {faq}")
    if 'class="zdroje"' not in body:
        issues.append("chybí zdroje")
    links = re.findall(r'href="(/[^"#]*)"', body)
    internal = [l for l in links if not l.startswith("//")]
    if len(internal) < 2:
        issues.append(f"vnitřní odkazy {len(internal)}")
    for l in internal:
        target = DIST / l.strip("/") / "index.html" if l != "/" else DIST / "index.html"
        if not target.exists():
            issues.append(f"mrtvý odkaz {l}")
    # jednopísmenné předložky a spojky bez nezlomitelné mezery (jen text mimo tagy)
    text = re.sub(r"<[^>]+>", " ", body)
    loose = re.findall(r"(?<![\w&;])([vkszouaiVKSZOUAI]) (?=\w)", text)
    if len(loose) > 3:
        issues.append(f"{len(loose)}× předložka bez &nbsp;")
    if p.get("obrazek") and not (ROOT / f"assets/img/web/{p['obrazek']}-1600.jpg").exists():
        issues.append(f"neexistující obrázek {p['obrazek']}")
    problems += len(issues)
    rows.append((p.get("poradi", "?"), p["slug"], words, ctas, faq, "; ".join(issues) or "OK"))

w = max((len(r[1]) for r in rows), default=10)
print(f"{'#':>2}  {'slug':<{w}}  slov  CTA  FAQ  nálezy")
for r in rows:
    print(f"{r[0]:>2}  {r[1]:<{w}}  {r[2]:>4}  {r[3]:>3}  {r[4]:>3}  {r[5]}")
print(f"\n{len(rows)} článků, {problems} nálezů")
