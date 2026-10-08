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
# Doména pro canonical, OG a sitemap: SITE_URL > site.json (produkční doména).
# Náhledová nasazení Vercelu (VERCEL_ENV=preview) dostanou vlastní adresu, ať náhledy nesdílí canonical s produkcí.
if os.environ.get("SITE_URL"):
    SITE["domain"] = os.environ["SITE_URL"].rstrip("/")
elif os.environ.get("VERCEL_ENV") == "preview" and os.environ.get("VERCEL_URL"):
    SITE["domain"] = "https://" + os.environ["VERCEL_URL"].rstrip("/")
PAGES = ["index", "strechy", "fotovoltaika", "fotovoltaika-rodinne-domy", "fotovoltaika-firmy", "dotace", "o-nas", "kontakt", "blog", "ochrana-osobnich-udaju", "dekujeme", "404"]
SLUG = {"uvod": "index"}
ASSETS = ["site.css", "site.js", "motion.js", "lp-consent.js", "fonts", "brand", "brands", "img/web", "img/swatch", "img/og.png", "img/og.jpg", "img/og-prooze-2026.jpg", "video/frames", "img/og",
          "old/partner-aiko.png", "old/partner-goodwe.png", "old/partner-longi.svg", "old/partner-solaredge.svg", "old/partner-solax.png",
          "old/partner-trina.svg", "old/pavel-koci-ceo.jpg"]
PRELOAD = ('<link rel="preload" as="image" type="image/webp" imagesrcset="{{root}}assets/img/web/hero-back-1280.webp 1280w, '
           '{{root}}assets/img/web/hero-back-1920.webp 1920w, {{root}}assets/img/web/hero-back-2880.webp 2880w" imagesizes="100vw" fetchpriority="high">\n')


_HASH = {}


def asset_hash(rel):
    if rel not in _HASH:
        import hashlib
        _HASH[rel] = hashlib.md5((ROOT / rel).read_bytes()).hexdigest()[:8]
    return _HASH[rel]


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
    if MESTA:
        business["areaServed"] = [{"@type": "City", "name": m["nazev"]} if m["slug"] != "praha-zapad" else {"@type": "AdministrativeArea", "name": "okres Praha-západ"}
                                  for m in MESTA.values()]
    blocks = [business]
    if page not in ("index", "404"):
        items = [{"@type": "ListItem", "position": 1, "name": "Úvod", "item": f"{d}/"}]
        if meta.get("parent"):
            items.append({"@type": "ListItem", "position": 2, "name": meta["parent_name"], "item": f"{d}{page_path(meta['parent'])}"})
        items.append({"@type": "ListItem", "position": len(items) + 1, "name": meta.get("crumb", meta["title"].split("|")[0].strip()), "item": f"{d}{page_path(page)}"})
        blocks.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items})
    if page.startswith("clanek-"):
        post = POSTS[page]
        blocks.append({"@context": "https://schema.org", "@type": "BlogPosting", "headline": plain(post["h1"]), "description": post["description"],
                       "image": f"{d}/assets/img/web/{post['obrazek']}-1600.jpg", "datePublished": post["datum"], "dateModified": post.get("upraveno", post["datum"]),
                       "inLanguage": "cs-CZ", "mainEntityOfPage": f"{d}{page_path(page)}",
                       "author": {"@type": "Person", "name": "Pavel Kočí", "url": f"{d}/o-nas/"},
                       "publisher": {"@type": "Organization", "name": "PROOZE", "logo": {"@type": "ImageObject", "url": f"{d}/assets/brand/icon-512.png"}}})
    if page.startswith("mesto-"):
        m = MESTA[page]
        area = {"@type": "City", "name": m["nazev"]} if m["slug"] != "praha-zapad" else {"@type": "AdministrativeArea", "name": "okres Praha-západ"}
        blocks.append({"@context": "https://schema.org", "@type": "Service", "name": f"Střechy a fotovoltaika {m['v']}",
                       "serviceType": ["Pokrývačské a klempířské práce", "Fotovoltaické elektrárny"], "provider": {"@id": f"{d}/#firma"},
                       "areaServed": area, "url": f"{d}{page_path(page)}"})
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


def source(page):
    if page.startswith("clanek-"):
        return article_page(POSTS[page])
    if page.startswith("mesto-"):
        meta, body = mesto_page(MESTA[page])
    else:
        meta, body = meta_and_body(SRC / "pages" / f"{page}.html")
    body = body.replace("{{mesta:mapa}}", mesta_section())
    if "{{blog:index}}" in body:
        body = body.replace("{{blog:index}}", blog_index())
    body = re.sub(r"\{\{blog:latest(?::([\w-]+))?\}\}", lambda m: blog_latest(m.group(1)), body)
    return meta, body


def render(page, mode):
    meta, body = source(page)
    html = partial("head") + '<body data-page="{{nav}}">\n' + '<a class="skip" href="#obsah">Přeskočit na obsah</a>\n' + partial("defs") + partial("header") + \
        '<main id="obsah">\n' + body + "</main>\n\n" + partial("footer")
    for _ in range(3):  # vnořené partials
        html = re.sub(r"\{\{> ([\w-]+)\}\}", lambda m: partial(m.group(1)), html)
    html = html.replace("{{mesta:odkazy}}", mesta_links())
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
    og = meta.get("og") or "assets/img/og-prooze-2026.jpg"
    html = html.replace("{{og_image}}", f'{SITE["domain"]}/{og}')
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
    # otisk obsahu u stylů a skriptů: po změně si prohlížeč (i z mezipaměti) stáhne novou verzi
    html = re.sub(r'(assets/(?:site\.css|site\.js|motion\.js))"', lambda m: f'{m.group(1)}?v={asset_hash(m.group(1))}"', html)
    # cesty k assetům ve stránkách (assets/…) → s prefixem
    html = re.sub(r'(src|href|srcset|imagesrcset|poster|data-src)="assets/', lambda m: f'{m.group(1)}="{root}assets/', html)
    html = re.sub(r'(, )assets/', lambda m: f"{m.group(1)}{root}assets/", html)
    if mode == "preview":
        # náhled nemá serverovou funkci: mapa jako zástupný blok, formulář v ukázkovém režimu
        html = re.sub(r'<iframe title="Mapa[^>]*></iframe>', '<div class="map__ph"><p>Tomanova 1630, 274 01 Slaný</p></div>', html)
    left = re.findall(r"\{\{[^}]+\}\}", html)
    assert not left, f"{page}: {left[:5]}"
    return html, meta


# ---------------------------------------------------------------- blog
KATEGORIE = {"strechy": "Střechy", "fotovoltaika": "Fotovoltaika", "dotace": "Dotace a úvěry", "strecha-fve": "Střecha + FVE"}
POSTS = {}
MESICE = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"]


def cz_date(iso):
    y, m, d = (int(x) for x in iso.split("-"))
    return f"{d}.&nbsp;{MESICE[m - 1]} {y}"


def slugify(t):
    import unicodedata
    t = unicodedata.normalize("NFKD", plain(t)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:60]


def post_key(p):
    """Řazení: nejnovější datum první, při shodě nižší „poradi“ dřív."""
    return (p["datum"], -int(p.get("poradi", 99)))


def load_blog():
    """src/blog/<slug>.html (soubory s _ na začátku se přeskočí) → POSTS a cesty /blog/<slug>/."""
    POSTS.clear()
    for f in sorted((SRC / "blog").glob("*.html")):
        if f.name.startswith("_"):
            continue
        meta, body = meta_and_body(f)
        slug = f.stem
        page = f"clanek-{slug}"
        words = len(plain(body).split())
        POSTS[page] = {**meta, "slug": slug, "page": page, "body": body, "minuty": max(3, round(words / 190))}
        PATHS[page] = f"blog/{slug}"
    order = sorted(POSTS.values(), key=post_key, reverse=True)
    for p in order:
        if p["page"] not in PAGES:
            PAGES.insert(PAGES.index("ochrana-osobnich-udaju"), p["page"])


CTA = {
    "strecha": ("Nevíte, jestli střechu opravit, nebo měnit?", "Přijedeme, prolezeme ji a řekneme vám to na rovinu. Prohlídka i nabídka jsou zdarma.", "Objednat prohlídku zdarma", "strecha", "i-roof"),
    "fve": ("Spočítáme, jak velkou elektrárnu potřebujete", "Z vašich vyúčtování navrhneme výkon i baterii a ukážeme, kolik ušetříte. Nezávazně a zdarma.", "Chci výpočet zdarma", "fve", "i-pv"),
    "oboji": ("Měníte střechu? Dejte na ni rovnou panely", "Jedno lešení, jedna smlouva, jedna záruka. Spočítáme obojí najednou.", "Chci nabídku na střechu i FVE", "oboji", "i-both"),
    "dotace": ("Na co dosáhnete z Nové zelené úsporám?", "Ověříme nárok na bezúročný úvěr nebo dotaci a žádost připravíme za vás.", "Ověřit nárok zdarma", "fve", "i-check"),
    "firma": ("Elektrárna pro firmu, obec nebo SVJ", "Z vaší skutečné spotřeby spočítáme výkon a návratnost, než cokoli podepíšete.", "Chci firemní kalkulaci", "fve", "i-pv"),
}


def cta_card(kind):
    if kind == "zavolat":
        return ('<aside class="pcta pcta--call"><div><p class="pcta__h">Raději to probrat po telefonu?</p>'
                '<p>Zavolejte na <a href="tel:+420773898698">773&nbsp;898&nbsp;698</a>, nebo nám nechte číslo a ozveme se.</p></div>'
                '<button class="btn btn--sun" type="button" data-callback-open>Zavolejte mi</button></aside>')
    h, p, b, pick, ic = CTA[kind]
    return (f'<aside class="pcta pcta--{kind}"><span class="pcta__ic" aria-hidden="true"><svg><use href="#{ic}"/></svg></span>'
            f'<div class="pcta__txt"><p class="pcta__h">{h}</p><p>{p}</p></div>'
            f'<a class="btn btn--sun" href="#formular" data-pick="{pick}" data-cta="blog-{kind}">{b}</a></aside>')


def picture(name, alt, sizes="100vw", lazy=True):
    l = ' loading="lazy"' if lazy else ' fetchpriority="high"'
    return (f'<picture><source type="image/webp" srcset="assets/img/web/{name}-800.webp 800w, assets/img/web/{name}-1600.webp 1600w" sizes="{sizes}">'
            f'<img src="assets/img/web/{name}-1600.jpg" alt="{alt}"{l} width="1600" height="1000"></picture>')


def card(p, big=False):
    kat = p["kategorie"]
    badge = f'<span class="bcard__badge">{p["stitek"]}</span>' if p.get("stitek") else ""
    return (f'<a class="bcard{" bcard--big" if big else ""}" href="{{{{link:{p["page"]}}}}}" data-kat="{kat}">'
            f'<span class="bcard__img">{picture(p["obrazek"], "", "(max-width: 760px) 100vw, 50vw" if big else "(max-width: 760px) 100vw, 33vw")}'
            f'<span class="bcard__over"><span class="bcard__top"><span class="bcard__kat">{KATEGORIE[kat]}</span><span class="bcard__min">{p["minuty"]}&nbsp;min</span></span>'
            f'{badge}<span class="bcard__h">{p["h1"]}</span></span></span>'
            f'<span class="bcard__body"><span class="bcard__mh"><span class="bcard__mk">{KATEGORIE[kat]} · {p["minuty"]}&nbsp;min</span>'
            f'<span class="bcard__mt">{p["h1"]}</span>{f"""<span class="bcard__mb">{p["stitek"]}</span>""" if p.get("stitek") else ""}</span>'
            f'<span class="bcard__p">{p["perex"]}</span><span class="bcard__more">Číst článek</span></span></a>')


def blog_index():
    posts = sorted(POSTS.values(), key=post_key, reverse=True)
    if not posts:
        return '<p class="wrap">Články připravujeme.</p>'
    chips = '<button type="button" class="bchip" aria-pressed="true" data-kat="">Vše</button>' + "".join(
        f'<button type="button" class="bchip" aria-pressed="false" data-kat="{k}">{v}</button>' for k, v in KATEGORIE.items() if any(p["kategorie"] == k for p in posts))
    rest = "".join(card(p) for p in posts[1:])
    return (f'<div class="wrap blog"><div class="bchips" role="group" aria-label="Témata" data-bchips>{chips}</div>'
            f'{card(posts[0], True)}<div class="bgrid" data-bgrid>{rest}</div></div>')


def blog_latest(kat=None):
    """Sekce „Z poradny“: 3 nejnovější články (případně z kategorie)."""
    posts = sorted(POSTS.values(), key=post_key, reverse=True)
    if kat:
        posts = sorted(posts, key=lambda p: p["kategorie"] != kat and not (kat == "fotovoltaika" and p["kategorie"] == "dotace"))
    posts = posts[:3]
    if not posts:
        return ""
    return (f'<section class="sec blatest" aria-labelledby="blatest-h"><div class="wrap"><header class="head">'
            f'<h2 id="blatest-h" class="h2">Z poradny</h2><p class="head__sub">Ceny, dotace a rady k výběru. Píšeme z praxe, s čísly.</p></header>'
            f'<div class="bgrid">{"".join(card(p) for p in posts)}</div>'
            f'<div class="more"><a class="btn btn--line" href="{{{{link:blog}}}}">Všechny články</a></div></div></section>')


def toc_and_ids(body):
    items = []

    def add_id(m):
        attrs, text = m.group(1), m.group(2)
        hid = re.search(r'id="([^"]+)"', attrs)
        hid = hid.group(1) if hid else slugify(text)
        items.append((hid, plain(text)))
        attrs = re.sub(r'\s*id="[^"]+"', "", attrs)
        return f'<h2{attrs} id="{hid}">{text}</h2>'
    body = re.sub(r"<h2([^>]*)>(.*?)</h2>", add_id, body, flags=re.S)
    toc = "".join(f'<li><a href="#{i}">{t}</a></li>' for i, t in items)
    return body, toc


def table_cards(body):
    """Tabulky se 3+ sloupci dostanou data-label u buněk; na mobilu se z řádků stanou karty (CSS .tbl--cards)."""
    def one(m):
        t = m.group(1)
        head = re.search(r"<thead>(.*?)</thead>", t, re.S)
        labels = [plain(x) for x in re.findall(r"<th[^>]*>(.*?)</th>", head.group(1), re.S)] if head else []
        if len(labels) < 3:
            return m.group(0)

        def row(rm):
            col = 0

            def cell(cm):
                nonlocal col
                tag, attrs = cm.group(1), cm.group(2)
                span = int((re.search(r'colspan="(\d+)"', attrs) or [0, 1])[1])
                covered = labels[col:col + span]
                col += span
                if span >= 3 or not covered:
                    return f'<{tag}{attrs} class="tbl__wide">'
                return f'<{tag}{attrs} data-label="{htmlmod.escape(" / ".join(covered))}">'
            return "<tr>" + re.sub(r"<(td|th)([^>]*)>", cell, rm.group(1)) + "</tr>"
        t = re.sub(r"(<tbody>.*?</tbody>)", lambda bm: re.sub(r"<tr>(.*?)</tr>", row, bm.group(1), flags=re.S), t, flags=re.S)
        return f'<div class="tbl tbl--cards">{t}</div>'
    return re.sub(r'<div class="tbl">(.*?)</div>', one, body, flags=re.S)


def article_page(p):
    body = p["body"]
    body = re.sub(r"\{\{cta:([\w-]+)\}\}", lambda m: cta_card(m.group(1)), body)
    body = re.sub(r'<a href="(https?://[^"]+)"(?![^>]*target=)', r'<a href="\1" target="_blank" rel="noopener"', body)  # zdroje mimo web
    # odkaz na článek, který ještě není publikovaný (soubor s _), zůstane jen jako text
    body = re.sub(r'<a href="/blog/([\w-]+)/">(.*?)</a>', lambda m: m.group(0) if f"clanek-{m.group(1)}" in POSTS else m.group(2), body, flags=re.S)
    body = body.replace("{{kalkulacka}}", '<div class="post__calc">{{> calc-box}}</div>')
    body = table_cards(body)
    body, toc = toc_and_ids(body)
    kat = p["kategorie"]
    side_kind = {"strechy": "strecha", "fotovoltaika": "fve", "dotace": "dotace", "strecha-fve": "oboji"}[kat]
    h, para, b, pick, _ = CTA[side_kind]
    related = [x for x in sorted(POSTS.values(), key=post_key, reverse=True) if x["page"] != p["page"]]
    related = sorted(related, key=lambda x: x["kategorie"] != kat)[:3]
    rel = (f'<section class="sec sec--mist brel" aria-labelledby="rel-h"><div class="wrap"><h2 id="rel-h" class="h2 brel__h">Mohlo by vás zajímat</h2>'
           f'<div class="bgrid">{"".join(card(x) for x in related)}</div></div></section>') if related else ""
    upd = p.get("upraveno", p["datum"])
    html = f"""<article class="post" data-post>
  <div class="post__progress" aria-hidden="true"><i data-progress></i></div>
  <header class="post__hero">
    <div class="post__frame">
      {picture(p["obrazek"], p.get("obrazek_alt", ""), "100vw", lazy=False)}
      <div class="post__in">
        <p class="crumbs"><a href="{{{{link:uvod}}}}">Úvod</a><span aria-hidden="true">/</span><a href="{{{{link:blog}}}}">Poradna</a><span aria-hidden="true">/</span><span>{KATEGORIE[kat]}</span></p>
        <div class="post__tags"><span class="post__kat">{KATEGORIE[kat]}</span>{f'<span class="post__badge">{p["stitek"]}</span>' if p.get("stitek") else ""}</div>
        <h1 class="post__h1">{p["h1"]}</h1>
        <p class="post__perex">{p["perex"]}</p>
        <div class="post__meta"><img src="assets/old/pavel-koci-ceo.jpg" alt="" width="40" height="40"><span><b>Pavel Kočí</b>, PROOZE</span><span>Aktualizováno {cz_date(upd)}</span><span>{p["minuty"]}&nbsp;min čtení</span></div>
      </div>
    </div>
  </header>
  <div class="wrap post__grid">
    <div class="post__main"><div class="prose">
{body}
    </div>
      <div class="post__author"><img src="assets/old/pavel-koci-ceo.jpg" alt="Pavel Kočí" width="64" height="64" loading="lazy"><div><p><b>Pavel Kočí</b>, PROOZE, Slaný</p><p>Střechy a fotovoltaika od jedné party. Máte otázku k článku? Zavolejte na <a href="tel:+420773898698">773&nbsp;898&nbsp;698</a>.</p></div></div>
    </div>
    <aside class="post__side">
      <nav class="toc" aria-label="Obsah článku"><details open data-toc-box><summary class="toc__h">Obsah článku</summary><ol data-toc>{toc}</ol></details></nav>
      <div class="side-cta"><p class="side-cta__h">{h}</p><p>{para}</p><a class="btn btn--sun btn--block" href="#formular" data-pick="{pick}" data-cta="blog-side">{b}</a><a class="side-cta__tel" href="tel:+420773898698"><svg><use href="#i-phone"/></svg>773&nbsp;898&nbsp;698</a></div>
    </aside>
  </div>
</article>
{{{{> lead}}}}
{rel}
"""
    meta = {"title": p["title"], "description": p["description"], "nav": "blog", "tone": "light", "crumb": plain(p["h1"]),
            "og": f"assets/img/og/blog-{p['slug']}.jpg" if (ROOT / f"assets/img/og/blog-{p['slug']}.jpg").exists() else "",
            "parent": "blog", "parent_name": "Poradna", "pick": pick}
    return meta, html


# ---------------------------------------------------------------- místní stránky (/strechy/<město>/)
# Data: src/mesta.json – tvary názvu, vzdálenost a čas ze sídla (OSRM), trasa, výroba FVE (PVGIS 5.2,
# jih 35°, ztráty 14 %), okolní obce (Overpass), městské památkové zóny (seznam MPZ ČR).
MESTA = {}
HQ = (SITE["lng"], SITE["lat"])
MAP_BOX = (13.62, 14.62, 49.92, 50.42)  # lon0, lon1, lat0, lat1
MAP_W = 640
PX_KM = MAP_W / ((MAP_BOX[1] - MAP_BOX[0]) * 111.32 * 0.6405)  # px na km (cos 50,17°)
PRAHA = (14.4205, 50.0875)


def load_mesta():
    MESTA.clear()
    for m in json.loads((SRC / "mesta.json").read_text()):
        page = f"mesto-{m['slug']}"
        MESTA[page] = {**m, "page": page}
        PATHS[page] = f"strechy/{m['slug']}"
        if page not in PAGES:
            PAGES.insert(PAGES.index("blog"), page)


def nbsp(t):
    """Nezlomitelné mezery po jednopísmenných předložkách a spojkách."""
    return re.sub(r"(?<![\w&;])([vkszouaiVKSZOUAI]) ", r"\1&nbsp;", t)


def cislo(n):
    return f"{n:,}".replace(",", "&nbsp;")


def proj(lon, lat):
    lon0, lon1, lat0, lat1 = MAP_BOX
    k = MAP_W / ((lon1 - lon0) * 0.6405)
    return round((lon - lon0) * 0.6405 * k, 1), round((lat1 - lat) * k, 1)


def mapa_svg(active=None):
    """Mapa dojezdu ze sídla ve Slaném: kruhy 20/40 km, místa s odkazy, u aktivního města trasa po silnici."""
    h = round((MAP_BOX[3] - MAP_BOX[2]) / ((MAP_BOX[1] - MAP_BOX[0]) * 0.6405) * MAP_W)
    hx, hy = proj(*HQ)
    out = [f'<svg class="lmap__svg" viewBox="0 0 {MAP_W} {h}" role="img" aria-labelledby="lmap-t"><title id="lmap-t">'
           + (f'Mapa: trasa ze Slaného {MESTA[active]["do"]}, {MESTA[active]["km"]} km' if active and active != "mesto-slany" else "Mapa míst, kam jezdíme ze Slaného")
           + '</title><defs><pattern id="lm-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1"/></pattern></defs>'
           f'<rect class="lm-grid" width="{MAP_W}" height="{h}" fill="url(#lm-grid)"/>']
    for km in (20, 40):
        r = round(km * PX_KM, 1)
        out.append(f'<circle class="lm-ring" cx="{hx}" cy="{hy}" r="{r}"/><text class="lm-km" x="{round(hx + r * .7071 + 6, 1)}" y="{round(hy - r * .7071 - 6, 1)}">{km} km</text>')
    px, py = proj(*PRAHA)
    out.append(f'<g class="lm-praha"><rect x="{px - 5}" y="{py - 5}" width="10" height="10" rx="2"/><text x="{px + 12}" y="{py + 6}">Praha</text></g>')
    if active and active != "mesto-slany":
        pts = " ".join(f"{x},{y}" for x, y in (proj(*c) for c in MESTA[active]["trasa"]))
        out.append(f'<polyline class="lm-case" points="{pts}"/><polyline class="lm-route" points="{pts}" pathLength="1"/>')
    for page, m in MESTA.items():
        if page == "mesto-slany":
            continue
        x, y = proj(m["lon"], m["lat"])
        on = page == active
        anchor, dx = ("end", -14) if m["popisek"] == "l" else ("start", 14)
        out.append(f'<a href="{{{{link:{page}}}}}" class="lm-pt{" is-on" if on else ""}" aria-label="Střechy a fotovoltaika {m["v"]}">'
                   f'<circle class="lm-halo" cx="{x}" cy="{y}" r="{16 if on else 0}"/><circle class="lm-dot" cx="{x}" cy="{y}" r="{8 if on else 5}"/>'
                   f'<text x="{x + dx}" y="{y + 6}" text-anchor="{anchor}">{m["mapa"]}</text></a>')
    on = active == "mesto-slany"
    out.append(f'<a href="{{{{link:mesto-slany}}}}" class="lm-hq{" is-on" if on else ""}" aria-label="Střechy a fotovoltaika ve Slaném">'
               f'<circle class="lm-halo" cx="{hx}" cy="{hy}" r="22"/><circle class="lm-hqdot" cx="{hx}" cy="{hy}" r="10"/><circle class="lm-hqin" cx="{hx}" cy="{hy}" r="4"/>'
               f'<text x="{hx - 18}" y="{hy - 4}" text-anchor="end">Slaný</text><text class="lm-sub" x="{hx - 18}" y="{hy + 16}" text-anchor="end">naše sídlo</text></a>')
    return "".join(out) + "</svg>"


def mpz_text(m):
    if m.get("mpz"):
        return ("Památková zóna", f"Historické centrum {m['gen']} je od roku {m['mpz']} městská památková zóna. Na střechu domu v&nbsp;zóně, i&nbsp;na údržbu, "
                "potřebujete předem závazné stanovisko památkářů z&nbsp;úřadu obce s&nbsp;rozšířenou působností. Počítejte s&nbsp;tím při plánování termínu.")
    if m.get("mpz_okoli"):
        zony = " a&nbsp;".join(f"{n} ({r})" for n, r in m["mpz_okoli"])
        return ("Památkové zóny v okolí", f"V&nbsp;okolí jsou městské památkové zóny {zony}. Pokud tam dům stojí, potřebujete k&nbsp;práci na střeše, i&nbsp;k&nbsp;údržbě, "
                "předem závazné stanovisko památkářů z&nbsp;úřadu obce s&nbsp;rozšířenou působností.")
    return None


def distributor_text(m):
    if m["distributor"] == "pre-roztoky":
        return "Většinu obcí okresu zásobuje ČEZ Distribuce, Roztoky patří do sítě PREdistribuce. Žádost o&nbsp;připojení, revizi i&nbsp;uvedení do provozu vyřídíme u&nbsp;té správné za vás."
    return "Síť tu provozuje ČEZ Distribuce. Žádost o&nbsp;připojení, revizi i&nbsp;uvedení do provozu vyřídíme za vás, jsou součástí dodávky."


def mesto_desc(m, dlouhy):
    sluzby = "opravy, výměna krytiny, nové střechy i panely s baterií" if dlouhy else "opravy i výměna krytiny a panely s baterií"
    konec = ("Sídlíme přímo ve Slaném. Prohlídka a nabídka zdarma." if m["slug"] == "slany"
             else f"{m['do'][0].upper() + m['do'][1:]} to máme ze Slaného {m['km']} km. Prohlídka zdarma.")
    return f"Střechy a fotovoltaika {m['v']}: {sluzby}. {konec}"


def mesto_page(m):
    slany = m["slug"] == "slany"
    v, do, nazev, km, mins, pv = nbsp(m["v"]), nbsp(m["do"]), m["nazev"], m["km"], m["min"], m["pv"]
    rocne = round(pv * 6, -2)
    if slany:
        dojezd = "Sídlíme přímo ve Slaném, v&nbsp;Tomanově ulici. Na prohlídku to máme pár minut."
    else:
        dojezd = f"{do[0].upper() + do[1:]} to máme ze Slaného {km}&nbsp;km, asi {mins}&nbsp;minut autem."
    okoli_links = []
    pages_by_name = {x["nazev"]: p for p, x in MESTA.items()}
    for o in m["okoli"]:
        p = pages_by_name.get(o)
        okoli_links.append(f'<a class="lchip lchip--link" href="{{{{link:{p}}}}}">{o}</a>' if p else f'<span class="lchip">{o}</span>')
    facts = []
    mpz = mpz_text(m)
    facts.append(("i-pv", "Kolik tu vyrobí panely", f"Jižní střecha se sklonem 35° tu podle evropského modelu PVGIS vyrobí ročně asi <strong>{cislo(pv)}&nbsp;kWh z&nbsp;každého kWp</strong>. Elektrárna 6&nbsp;kWp tedy kolem {cislo(int(rocne))}&nbsp;kWh za rok."))
    facts.append(("i-check", "Kdo vás připojí k síti", distributor_text(m)))
    if mpz:
        facts.append(("i-town", mpz[0], mpz[1]))
    facts.append(("i-pin", "Dojezd", f"{dojezd} Na prohlídku přivezeme vzorky krytin, prohlídka i&nbsp;nabídka jsou zdarma."))
    facts_html = "".join(f'<article class="lfact"><span class="lfact__ic" aria-hidden="true"><svg><use href="#{ic}"/></svg></span><h3>{t}</h3><p>{p}</p></article>' for ic, t, p in facts)
    sluzby = [
        ("i-drop", "Oprava střechy", "Zatéká, chybí taška, uvolnilo se oplechování? Najdeme příčinu a&nbsp;opravíme hřeben, úžlabí, komín i&nbsp;prostupy.", "strechy"),
        ("i-tiles", "Výměna krytiny", "Pálená a&nbsp;betonová taška, plech, hliník Prefa i&nbsp;šindel. Tondach, Bramac, KM Beta, Comax, Prefa a&nbsp;Satjam.", "strechy"),
        ("i-hammer", "Rekonstrukce a&nbsp;nová střecha", "Kontrola krovu, nové latě, pojistná fólie, zateplení a&nbsp;krytina. Rovnou připravené na panely.", "strechy"),
        ("i-pv", "Fotovoltaika s&nbsp;baterií", "Návrh z&nbsp;vaší spotřeby, montáž, připojení k&nbsp;síti a&nbsp;revize. Vyřídíme i&nbsp;bezúročný úvěr z&nbsp;Nové zelené úsporám.", "fotovoltaika-rodinne-domy"),
    ]
    svc_html = "".join(f'<li class="lsvc"><span class="lsvc__ic" aria-hidden="true"><svg><use href="#{ic}"/></svg></span><div><h3><a href="{{{{link:{l}}}}}">{t}</a></h3><p>{p}</p></div></li>' for ic, t, p, l in sluzby)
    cena = '<a href="{{link:clanek-vymena-strechy-cena}}">Kolik stojí výměna střechy</a>' if "clanek-vymena-strechy-cena" in POSTS else '<a href="{{link:strechy}}">Střechy</a>'
    povoleni = ' Kdy je potřeba ohlášení nebo povolení, rozebíráme v&nbsp;článku <a href="{{link:clanek-vymena-strechy-povoleni}}">Výměna střechy a&nbsp;povolení</a>.' if "clanek-vymena-strechy-povoleni" in POSTS else ""
    faq = [
        (f"Přijedete na prohlídku střechy i&nbsp;{do}?" if not slany else "Kde vás ve Slaném najdu?",
         dojezd + " Prohlídka i&nbsp;nabídka jsou zdarma a&nbsp;nezávazné." if not slany else f"V&nbsp;Tomanově ulici 1630. Na prohlídku přijedeme k&nbsp;vám, ve Slaném i&nbsp;v&nbsp;okolí, třeba {', '.join(m['okoli'][:3])}. Prohlídka i&nbsp;nabídka jsou zdarma."),
        (f"Kolik stojí oprava nebo výměna střechy {v}?",
         f"Záleží na ploše, tvaru střechy, krytině a&nbsp;stavu krovu. Orientační ceny trhu najdete v&nbsp;článku {cena}, přesnou cenu vám po prohlídce rozepíšeme položku po položce."),
    ]
    if m.get("mpz"):
        faq.append((f"Potřebuji povolení na střechu v&nbsp;centru {m['gen']}?", f"V&nbsp;městské památkové zóně ano: před prací na střeše, i&nbsp;před údržbou, si vyžádejte závazné stanovisko památkářů z&nbsp;úřadu obce s&nbsp;rozšířenou působností. Mimo zónu výměna krytiny obvykle povolení nepotřebuje, záleží na rozsahu.{povoleni}"))
    else:
        faq.append(("Potřebuji k&nbsp;výměně krytiny povolení?", f"Záleží na rozsahu prací a&nbsp;na tom, jestli se mění vzhled nebo konstrukce střechy. Rozdíl vám vysvětlíme na prohlídce.{povoleni}"))
    faq += [
        (f"Vyplatí se {v} fotovoltaika?", f"Podle PVGIS vyrobí 1&nbsp;kWp na jižní střeše se sklonem 35° {v} asi {cislo(pv)}&nbsp;kWh ročně. Kolik ušetříte, záleží hlavně na tom, kolik elektřiny spotřebujete doma. Spočítáme to zdarma z&nbsp;vašeho vyúčtování."),
        ("Kdo vyřídí připojení elektrárny k&nbsp;síti?", distributor_text(m)),
    ]
    faq_html = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in faq)
    dalsi = "".join(f'<a class="lchip lchip--link" href="{{{{link:{p}}}}}">{x["nazev"]}</a>' for p, x in MESTA.items() if p != m["page"])
    obrazek = m["obrazek"]
    lead = (f"Opravíme, přeložíme i&nbsp;postavíme šikmou střechu a&nbsp;dáme na ni panely. {dojezd}")
    html = f"""<section class="lhero" data-obec="{m['obec']}">
  <div class="lhero__frame">
    <div class="lhero__txt">
      <p class="crumbs"><a href="{{{{link:uvod}}}}">Úvod</a><span aria-hidden="true">/</span><a href="{{{{link:strechy}}}}">Střechy</a><span aria-hidden="true">/</span><span>{nazev}</span></p>
      <h1 class="lhero__h1">Střechy a&nbsp;fotovoltaika {v}</h1>
      <p class="lhero__lead">{lead}</p>
      <div class="phero__act"><a class="btn btn--sun" href="#formular" data-pick="strecha" data-cta="lhero">Objednat prohlídku zdarma</a><a class="btn btn--glass" href="tel:+420773898698"><svg><use href="#i-phone"/></svg>773 898 698</a></div>
    </div>
    <figure class="lmap">
      {mapa_svg(m["page"])}
      <figcaption class="lmap__stats">
        <span><b>{km}&nbsp;km</b>ze Slaného</span><span><b>{mins}&nbsp;min</b>autem</span><span><b>{cislo(pv)}&nbsp;kWh</b>z&nbsp;1&nbsp;kWp ročně</span>
      </figcaption>
    </figure>
  </div>
</section>

<section class="sec" aria-labelledby="lsvc-h">
  <div class="wrap lsvc-wrap">
    <div class="lsvc-media">{picture(obrazek, "", "(max-width: 960px) 100vw, 40vw")}</div>
    <div>
      <header class="head head--left">
        <h2 id="lsvc-h" class="h2">Co pro vás {v} uděláme</h2>
        <p class="head__sub">Jen šikmé střechy, zato všechny, a&nbsp;k&nbsp;nim fotovoltaika. Rodinné domy, bytové domy i&nbsp;firmy.</p>
      </header>
      <ul class="lsvcs">{svc_html}</ul>
    </div>
  </div>
</section>

<section class="sec sec--mist" aria-labelledby="lfacts-h">
  <div class="wrap">
    <header class="head head--left">
      <h2 id="lfacts-h" class="h2">Co je dobré vědět {v}</h2>
      <p class="head__sub">Místní podmínky, které ovlivní střechu i&nbsp;elektrárnu.</p>
    </header>
    <div class="lfacts">{facts_html}</div>
    <div class="lokoli"><p class="lokoli__h">Jezdíme i&nbsp;do okolí</p><div class="lchips">{"".join(okoli_links)}</div></div>
  </div>
</section>

{{{{> combo}}}}
{{{{> steps}}}}
{{{{> lead}}}}
{{{{blog:latest:strechy}}}}
<section class="sec" id="dotazy" aria-labelledby="faq-h">
  <div class="wrap faq">
    <header class="head head--left">
      <h2 id="faq-h" class="h2">Časté dotazy {v}</h2>
      <p class="head__sub">Nenašli jste odpověď? Zavolejte na <a href="tel:+420773898698">773 898 698</a>.</p>
    </header>
    <div class="faq__list">{faq_html}</div>
  </div>
</section>
<section class="sec sec--mist ldalsi" aria-labelledby="ldalsi-h">
  <div class="wrap"><h2 id="ldalsi-h" class="h3">Kam dál jezdíme</h2><div class="lchips">{dalsi}</div></div>
</section>
{{{{> final}}}}
"""
    if len(desc := mesto_desc(m, True)) > 160:
        desc = mesto_desc(m, False)
    meta = {"title": f"Pokrývač {nazev} – střechy, opravy i fotovoltaika | PROOZE",
            "description": desc,
            "nav": "strechy", "tone": "light", "crumb": nazev, "parent": "strechy", "parent_name": "Střechy", "pick": "strecha"}
    return meta, html


def mesta_section():
    """Sekce s mapou všech míst (kontakt)."""
    rows = "".join(f'<li><a href="{{{{link:{p}}}}}"><b>{m["nazev"]}</b><span>{m["km"]}&nbsp;km · {m["min"]}&nbsp;min</span></a></li>'
                   for p, m in sorted(MESTA.items(), key=lambda kv: kv[1]["km"]))
    return (f'<section class="sec sec--pine lkde" id="kde-jezdime" aria-labelledby="lkde-h"><div class="wrap lkde__in">'
            f'<div><header class="head head--left"><h2 id="lkde-h" class="h2">Kam za vámi jezdíme</h2>'
            f'<p class="head__sub">Ze Slaného do celého okolí. Vzdálenosti i&nbsp;časy jsou po silnici. Jinde? Napište obec do poptávky, větší zakázky děláme i&nbsp;dál.</p></header>'
            f'<ul class="lkde__list">{rows}</ul></div><figure class="lmap lmap--wide">{mapa_svg()}</figure></div></section>')


def mesta_links():
    return " ".join(f'<a href="{{{{link:{p}}}}}">{m["nazev"]}</a>' for p, m in MESTA.items())


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
    load_blog()
    load_mesta()
    for page in PAGES:
        if page.startswith(("clanek-", "mesto-")):
            continue
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
