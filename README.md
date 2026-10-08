# PROOZE – nový web (střechy + fotovoltaika)

Redesign webu prooze.cz včetně nového loga. Statický vícestránkový web bez frameworku.

## Struktura

- `src/partials/*.html` – společné části (hlavička, patička, formulář, krytiny, dotace, bento „Na co se můžete spolehnout“, postup, závěrečná výzva)
- `src/pages/*.html` – stránky: úvod, střechy, fotovoltaika, konfigurátor, dotace, o nás, kontakt, ochrana osobních údajů (hlavička stránky = HTML komentář s `title`, `description`, `nav`, `tone`)
- `assets/site.css`, `assets/site.js` – styly a skripty (kvíz, záložky, kalkulačka úvěru NZÚ, mobilní menu)
- `assets/brand/` – nové logo (SVG: `logo.svg`, `logo-bila.svg`, `logo-na-zlute.svg`, `symbol.svg`, `favicon.svg`)
- `assets/brands/` – oficiální loga výrobců krytin (Tondach, Bramac, KM Beta, Satjam, Comax, Prefa), zdroje v `brands.json`
- `assets/img/gen/` – vygenerované fotky (GPT Image 2.5 přes Higgsfield), `assets/img/web/` – zmenšené pro web
- `research/` – rešerše: starý web, design reference, CRO + konkurence + dotace 2026, koncepty loga

## Příkazy

```bash
python3 tools/images.py      # assets/img/gen → assets/img/web (webp/jpg)
python3 tools/hero_mask.py   # vrstvy hero (obloha + výřez domu pro nápis za střechou)
python3 tools/swatches.py    # kruhové vzorky krytin
python3 tools/build.py       # src → dist/ (čisté URL) a preview/ (ploché soubory)
node tools/serve.cjs 8801    # lokální náhled dist/ (launch config „prooze“)
node tools/shot.mjs <url> <out.png> [w] [h] [full]
```

## Design

- Barvy: slunce `#FFC83A`, jedle `#0F3A2E` (navazuje na zelenou PRO OZE), mlha `#F1F4EE`, bílá.
- Písmo: Funnel Display (nadpisy) + Funnel Sans (text), Google Fonts, plná čeština.
- Logo „Hřeben“: levý svah = krytina, pravý svah = tři solární moduly. Wordmark převedený do křivek.
- Hero: fotka v zaobleném rámu, obří nápis „STŘECHY A FVE“ zajíždí za střechu (výřez popředí), při načtení vyjede zpoza hřebene.
- Copy: pozicování „Pokrývači, kteří umí i fotovoltaiku“ místo „pořádně, rychle, levně“.

## Nasazení na Vercel

1. Vercel → Add New Project → import repa `martindragusinec-glitch/prooze`. Framework: **Other**. Build i výstup se načtou z `vercel.json` (`python3 tools/build.py` → `dist/`), nic dalšího nenastavovat.
2. Settings → Environment Variables (Production):
   - `RESEND_API_KEY` – klíč z resend.com (v Resendu ověřit doménu prooze.cz, jinak e-maily neodejdou)
   - `POPTAVKY_FROM` – např. `Web PROOZE <web@prooze.cz>`
   - `POPTAVKY_TO` – kam chodí poptávky, výchozí `info@prooze.cz` (víc adres oddělte čárkou)
   - volitelně `POPTAVKY_WEBHOOK` – Make/CRM, dostane poptávku jako JSON
   - volitelně `SITE_URL` – vynutí doménu pro canonical/OG/sitemap; jinak se bere produkční doména projektu (po připojení prooze.cz automaticky ta)
3. Settings → Domains → přidat `prooze.cz` a `www.prooze.cz` a nastavit DNS podle Vercelu. **Po připojení domény spustit Redeploy**, aby se canonical, OG obrázek a sitemap přepsaly na prooze.cz.
4. Staré adresy `/cs/...` se přesměrují 301 na nové stránky (`vercel.json`).
5. Měření: do `src/site.json` doplnit `gtm_id` → build sám přidá cookie lištu (Consent Mode v2) a GTM. Konverze = dataLayer `form_sent` (`form: poptavka | zavolat`), dále `cta_click`, `contact_click`, `begin_form`, `form_step`, `view_form`, a stránka `/dekujeme/` (noindex).

OG obrázek: `assets/img/og.jpg` (1200×630, 100 kB), zdroj `brand/bannery/og-1200x630`. Ověření po nasazení: https://developers.facebook.com/tools/debug/ (Scrape Again).

## Interaktivní prvky

- **Kalkulačka úspory** (`src/partials/calc.html`, `#kalkulacka`): měsíční platba → doporučená FVE (kWp + baterie stejné kapacity), roční úspora, bezúročný úvěr NZÚ. Předpoklady: 6 Kč/kWh, 1 kWp ≈ 1 000 kWh/rok, úspora až 70 %, panel 450 Wp, úvěr 25 000 Kč/kWp + 15 000 Kč/kWh, strop 400 000 Kč. CTA předvyplní poptávku (služba FVE, pásmo spotřeby, poznámka).
- **Konfigurátor (odložený, mimo build)** (`src/partials/konfig.html`, stránka v `src/_odlozene/`, stránka `/konfigurator/` + úvod): tvar střechy, krytina, barva, panely 8/14/22, baterie, wallbox, zateplení → 3D model domu (`assets/konfig3d.js`, Three.js r170 vendorovaný v `assets/vendor/three/`, načítá se líně, otáčení myší/prstem, textury krytin generované v kódu). Bez WebGL zůstane SVG ilustrace. Počet panelů určuje skutečné místo na střeše (valbová pojme méně). CTA vloží konfiguraci do poznámky poptávky.
- **Vrstvu po vrstvě** (`src/partials/skladba.html`, úvod + /strechy/): stavba střechy jako 80 snímků `assets/video/frames/000–079.webp` (960 px, 5 MB, z 15s videa: krov → fólie a latě → tašky → panely) kreslených do canvasu podle scrollu (`assets/motion.js`, initStory); načítají se postupně (každý 8., 4., 2., zbytek). Spolehlivější než převíjení videa (Safari, slabší PC). Zdrojové snímky stejného domu `assets/video/src/f0–f3*.png` (GPT Image 2.5, úpravy z jednoho výchozího snímku) a přechody FLUX 3 Video se start/end snímkem; spojení a kódování přes ffmpeg s klíčovým snímkem každé 3 snímky (plynulé převíjení). Plakát `stavba-start.jpg`, bez animací se ukáže `stavba-hotovo.jpg`.
- **Servis a monitoring** (`src/partials/servis.html`): ukázka aplikace je ilustrační (není to konkrétní aplikace výrobce).

## DOPLNIT / OVĚŘIT před spuštěním

Sliby a fakta, která jsem napsal a musí potvrdit PROOZE:

- [ ] „Pevná cena před podpisem“, „vícepráce jen s vaším souhlasem“, „termín písemně ve smlouvě“
- [ ] „Panely kotvíme podle pokynů výrobce krytiny, záruka střechy zůstane platná“, „panely montují pokrývači“
- [ ] Oblast působnosti (FAQ: „po celých Středních Čechách a do Prahy“ je odhad)
- [ ] Záruka na práci (střechy), délka výměny krytiny
- [ ] Zda děláte zateplení střech (vazba na NZÚ 3 500 Kč/m² úvěr a NZÚ Light 2 000 Kč/m²)
- [ ] Výrobci panelů/střídačů (Longi, Trina, Aiko, GoodWe, SolarEdge, Solax převzato ze starého webu)
- [ ] Záruky 25/20/10 let (převzato ze starého webu)
- [ ] „Podnikáme od roku 2011“ (datum vzniku IČO v ARES)
- [ ] Dotace: čísla NZÚ 2026 z rešerše (k 10/2026) nechat zkontrolovat proti závazným pokynům SFŽP; firemní dotace nejsou konkrétní
- [ ] Certifikace ISO 9001 / CFA / AAA ze starého webu jsem nepoužil (bez dokladu)
- [ ] Reálné reference a fotky realizací, Google recenze (zatím nejsou)
- [ ] Lepší portrét Pavla Kočího (současný má 200×200 px)
- [ ] Servis: „chybu elektrárny vidíme taky a ozveme se“ (vzdálený přístup k monitoringu), „při poruše přijedeme“, péče o střechu (kontrola po vichřici, čištění žlabů), revize
- [ ] Předpoklady kalkulačky (cena 6 Kč/kWh, úspora 70 %) a barvy krytin v konfigurátoru podle skutečné nabídky
- [ ] Endpoint formuláře: `window.PROOZE_FORM_ENDPOINT` (Make/e-mail/CRM). Bez něj se poptávka jen vypíše do konzole. dataLayer eventy: `cta_click`, `view_form`, `begin_form`, `form_step`, `form_sent`
- [ ] Měření (GTM/GA4/Meta) + cookie lišta; GDPR stránka zatím počítá jen s nutnými cookies
- [ ] Doména a hosting (dist/ jde nahrát na Vercel/Netlify/Cloudflare Pages)
