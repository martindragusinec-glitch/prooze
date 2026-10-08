#!/usr/bin/env python3
"""Sestaví web ze src/ (partials + pages) do dvou výstupů:

  dist/     čisté URL (strechy/index.html …), sitemap, robots, 404 – pro nasazení (Vercel)
  preview/  ploché soubory (strechy.html …), formulář v ukázkovém režimu – pro lokální náhled

  python3 tools/build.py

Šablona: {{title}} {{description}} {{root}} {{link:slug}} {{cur:slug}} {{> partial}} {{tone}} {{preload}}
         {{canonical}} {{domain}} {{robots}} {{tracking}} {{jsonld}} {{endpoint}} {{consent_link}}
Hlavička stránky v src/pages/*.html je HTML komentář s řádky „klíč: hodnota“
(title, description, nav, tone, preload, crumb, noindex).
Nastavení webu (doména, GTM, endpoint formuláře, kontakty) je v src/site.json.
"""
import datetime
import html as htmlmod
import json
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
SITE = json.loads((SRC / "site.json").read_text())
# Doména pro canonical, OG a sitemap: SITE_URL > produkční doména projektu na Vercelu > site.json.
# VERCEL_PROJECT_PRODUCTION_URL je nejkratší vlastní doména projektu, bez ní adresa *.vercel.app.
if os.environ.get("SITE_URL"):
    SITE["domain"] = os.environ["SITE_URL"].rstrip("/")
elif os.environ.get("VERCEL_PROJECT_PRODUCTION_URL"):
    SITE["domain"] = "https://" + os.environ["VERCEL_PROJECT_PRODUCTION_URL"].rstrip("/")
PAGES = ["index", "strechy", "fotovoltaika", "fotovoltaika-rodinne-domy", "fotovoltaika-firmy", "dotace", "o-nas", "kontakt", "ochrana-osobnich-udaju", "dekujeme", "404"]
SLUG = {"uvod": "index"}
ASSETS = ["site.css", "site.js", "motion.js", "lp-consent.js", "fonts", "brand", "brands", "img/web", "img/swatch", "img/og.png", "img/og.jpg", "video/frames",
          "old/partner-aiko.png", "old/partner-goodwe.png", "old/partner-longi.svg", "old/partner-solaredge.svg", "old/partner-solax.png",
          "old/partner-trina.svg", "old/pavel-koci-ceo.jpg"]
PRELOAD = ('<link rel="preload" as="image" type="image/webp" imagesrcset="{{root}}assets/img/web/hero-back-1280.webp 1280w, '
           '{{root}}assets/img/web/hero-back-1920.webp 1920w, {{root}}assets/img/web/hero-back-2880.webp 2880w" imagesizes="100vw" fetchpriority="high">\n')


def partial(name):
    return (SRC / "partials" / f"{name}.html").read_text()


def meta_and_body(path):
    text = path.read_text()
    m = re.match(r"\s*<!--(.*?)-->\s*", text, re.S)
    meta = dict(re.findall(r"^\s*([\w-]+):\s*(.+?)\s*$", m.group(1), re.M))
    return meta, text[m.end():]


PATHS = {}  # stránka → URL cesta bez lomítek (z hlavičky „path:“, jinak název souboru)


def page_path(page):
    """URL cesta stránky v produkci."""
    return "/" if page == "index" else ("/404.html" if page == "404" else f"/{PATHS.get(page, page)}/")


def plain(s):
    return htmlmod.unescape(re.sub(r"<[^>]+>", "", s)).replace("\xa0", " ").strip()


def jsonld(page, meta, body):
    d = SITE["domain"]
    business = {
        "@context": "https://schema.org",
        "@type": "RoofingContractor",
        "@id": f"{d}/#firma",
        "name": SITE["name"],
        "legalName": SITE["legal_name"],
        "url": f"{d}/",
        "logo": f"{d}/assets/brand/icon-512.png",
        "image": f"{d}/assets/img/og.png",
        "telephone": SITE["phone"],
        "email": SITE["email"],
        "taxID": SITE["ico"],
        "address": {"@type": "PostalAddress", "streetAddress": SITE["street"], "addressLocality": SITE["city"],
                    "postalCode": SITE["zip"], "addressRegion": SITE["region"], "addressCountry": "CZ"},
        "geo": {"@type": "GeoCoordinates", "latitude": SITE["lat"], "longitude": SITE["lng"]},
        "description": "Šikmé střechy všech typů a fotovoltaika pro rodinné domy, bytové domy i firmy.",
        "knowsAbout": ["Šikmé střechy", "Pálená taška", "Betonová taška", "Plechová krytina", "Kanadský šindel", "Fotovoltaika", "Bateriová úložiště"],
    }
    blocks = [business]
    if page not in ("index", "404"):
        blocks.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Úvod", "item": f"{d}/"},
            {"@type": "ListItem", "position": 2, "name": meta.get("crumb", meta["title"].split("|")[0].strip()), "item": f"{d}{page_path(page)}"},
        ]})
    faqs = re.findall(r"<details><summary>(.*?)</summary><p>(.*?)</p></details>", body, re.S)
    if faqs:
        blocks.append({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": plain(q), "acceptedAnswer": {"@type": "Answer", "text": plain(a)}} for q, a in faqs]})
    return "".join(f'<script type="application/ld+json">{json.dumps(b, ensure_ascii=False)}</script>\n' for b in blocks)


def tracking(root):
    gtm = SITE.get("gtm_id", "").strip()
    if not gtm:
        return ""
    return (f'<script>window.LP_CONSENT_CONFIG={{brand_color:"#0F3A2E",privacy_url:"{root}ochrana-osobnich-udaju/"}};</script>\n'
            f'<script src="{root}assets/lp-consent.js"></script>\n'
            "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});"
            "var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;"
            f"j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}})(window,document,'script','dataLayer','{gtm}');</script>\n")


def render(page, mode):
    meta, body = meta_and_body(SRC / "pages" / f"{page}.html")
    html = partial("head") + '<body data-page="{{nav}}">\n' + '<a class="skip" href="#obsah">Přeskočit na obsah</a>\n' + partial("defs") + partial("header") + \
        '<main id="obsah">\n' + body + "</main>\n\n" + partial("footer")
    for _ in range(3):  # vnořené partials
        html = re.sub(r"\{\{> ([\w-]+)\}\}", lambda m: partial(m.group(1)), html)
    if mode == "dist" and page == "404":
        root = "/"
    else:
        depth = 0 if (mode == "preview" or page == "index") else PATHS.get(page, page).count("/") + 1
        root = "../" * depth

    def link(slug):
        slug = SLUG.get(slug, slug)
        if mode == "preview":
            return "./" if slug == "index" else f"{slug}.html"
        return root + ("" if slug == "index" else f"{PATHS.get(slug, slug)}/") or "./"

    nav = meta.get("nav", page)
    noindex = meta.get("noindex") == "true"
    html = html.replace("{{preload}}", PRELOAD if meta.get("preload") == "hero" else "")
    html = html.replace("{{robots}}", '<meta name="robots" content="noindex, follow">\n' if noindex else "")
    html = html.replace("{{canonical}}", SITE["domain"] + page_path(page)).replace("{{domain}}", SITE["domain"])
    html = html.replace("{{tracking}}", tracking(root) if mode == "dist" else "")
    html = html.replace("{{jsonld}}", jsonld(page, meta, body) if not noindex else "")
    html = html.replace("{{endpoint}}", SITE["form_endpoint"] if mode == "dist" else "")
    html = html.replace("{{consent_link}}", ' <a href="#" data-consent-open>Nastavení cookies</a>' if (mode == "dist" and SITE.get("gtm_id")) else "")
    if "data-quiz" not in html:  # stránka bez formuláře: CTA vedou na kontakt
        html = html.replace('href="#formular"', 'href="{{link:kontakt}}#formular"')
    if meta.get("pick"):
        html = html.replace('data-cta="header"', f'data-pick="{meta["pick"]}" data-cta="header"').replace('data-cta="dock"', f'data-pick="{meta["pick"]}" data-cta="dock"')
    html = re.sub(r"\{\{link:([\w-]+)\}\}", lambda m: link(m.group(1)) or "./", html)
    html = re.sub(r"\{\{cur:([\w-]+)\}\}", lambda m: ' aria-current="page"' if (m.group(1) == nav or nav.startswith(m.group(1) + "-")) else "", html)
    html = html.replace("{{title}}", meta["title"]).replace("{{description}}", meta["description"])
    html = html.replace("{{nav}}", nav)
    html = html.replace("{{tone}}", meta.get("tone", "light")).replace("{{root}}", root)
    # cesty k assetům ve stránkách (assets/…) → s prefixem
    html = re.sub(r'(src|href|srcset|imagesrcset|poster|data-src)="assets/', lambda m: f'{m.group(1)}="{root}assets/', html)
    html = re.sub(r'(, )assets/', lambda m: f"{m.group(1)}{root}assets/", html)
    if mode == "preview":
        # náhled nemá serverovou funkci: mapa jako zástupný blok, formulář v ukázkovém režimu
        html = re.sub(r'<iframe title="Mapa[^>]*></iframe>', '<div class="map__ph"><p>Tomanova 1630, 274 01 Slaný</p></div>', html)
    left = re.findall(r"\{\{[^}]+\}\}", html)
    assert not left, f"{page}: {left[:5]}"
    return html, meta


def copy_assets(out):
    for a in ASSETS:
        src = ROOT / "assets" / a
        dst = out / "assets" / a
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.is_dir():
            shutil.copytree(src, dst, dirs_exist_ok=True)
        else:
            shutil.copy2(src, dst)


def main():
    today = datetime.date.today().isoformat()
    for page in PAGES:
        meta, _ = meta_and_body(SRC / "pages" / f"{page}.html")
        if meta.get("path"):
            PATHS[page] = meta["path"].strip("/")
    for mode in ("dist", "preview"):
        out = ROOT / mode
        if out.exists():
            shutil.rmtree(out)
        out.mkdir()
        urls = []
        for page in PAGES:
            html, meta = render(page, mode)
            if mode == "dist" and page not in ("index", "404"):
                target = out / PATHS.get(page, page) / "index.html"
            else:
                target = out / f"{page}.html"
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(html)
            if meta.get("noindex") != "true":
                urls.append(SITE["domain"] + page_path(page))
        copy_assets(out)
        shutil.copy2(SRC / "site.webmanifest", out / "site.webmanifest")
        if mode == "dist":
            (out / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
                                             "".join(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n")
            (out / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /dekujeme/\n\nSitemap: {SITE['domain']}/sitemap.xml\n")
        print(mode, "ok", len(PAGES), "stránek")


if __name__ == "__main__":
    main()
