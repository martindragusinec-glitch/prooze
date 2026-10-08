# Zadání pro psaní článků Poradny PROOZE

Web: https://www.prooze.cz – šikmé střechy (oprava, výměna krytiny, rekonstrukce, nová střecha; pálená a betonová taška, plech, hliník Prefa, kanadský šindel) a fotovoltaika (RD s baterií, firmy, obce, SVJ). Sídlo Slaný, Středočeský kraj. Hlavní odlišení: střecha i panely od jedné firmy (jedno lešení, jedna smlouva, jedna záruka). Kontakt 773 898 698, info@prooze.cz.

## Cíl
Každý článek má (1) vyhrát ve vyhledávání na svůj hlavní dotaz a (2) přivést čtenáře k poptávce. Píšeme pro majitele domů, ne pro odborníky.

## Soubor a hlavička
Článek = `prooze-web/src/blog/<slug>.html` (slug bez diakritiky, s pomlčkami). Na začátku HTML komentář:

```
<!--
title: <SEO titulek do 60 znaků, hlavní KW na začátku> | PROOZE
description: <meta description 140–158 znaků, hlavní KW + přínos + výzva>
h1: <nadpis článku, může být delší a lidštější než title>
perex: <1–2 věty, co se čtenář dozví; obsahuje hlavní KW>
kategorie: strechy | fotovoltaika | dotace | strecha-fve
obrazek: <jeden z: beton-rd bytovy-dum hala-fve konzultace montaz-fve plech-falc plech-taskova-tabule pokryvaci-palena prefa-sablony rd-fve-hero rekonstrukce-leseni sindel-chata strecha-kontrola stridac-baterie taska-palena-detail>
obrazek_alt: <popis fotky>
datum: 2026-10-08
poradi: <číslo článku v plánu, 1–15>
stitek: <volitelné: krátké klíčové číslo do štítku na fotce, např. „2 000–4 500 Kč/m²“ nebo „až 400 000 Kč“ – jen ověřené číslo z textu>
-->
```
Tělo je čisté HTML (bez `<html>`, `<body>`). Nadpisy sekcí `<h2>` (bez id, doplní se samo do obsahu článku), podsekce `<h3>`.

## Povinná stavba (pořadí volně, ale tohle musí být)
1. **Ve zkratce** hned na začátku – přímá odpověď na hlavní dotaz (featured snippet):
   `<div class="tldr"><p>Ve zkratce</p><ul><li>…</li><li>…</li><li>…</li></ul></div>`
2. Úvodní odstavec, který potvrdí, že čtenář je na správném místě (hlavní KW v první větě).
3. 4–7 sekcí `<h2>` podle záměru hledání. Vedlejší klíčová slova přirozeně v nadpisech a textu. Žádné vycpávky, krátké odstavce (2–4 věty).
4. Aspoň jedna **tabulka** (ceny, srovnání, parametry): `<div class="tbl"><table>…</table></div>` s `<thead>`.
5. **Konverzní prvky** (placeholdery, build je nahradí kartami):
   - `{{cta:strecha}}` – prohlídka střechy zdarma
   - `{{cta:fve}}` – výpočet fotovoltaiky zdarma
   - `{{cta:oboji}}` – střecha + panely najednou
   - `{{cta:dotace}}` – ověření nároku na NZÚ
   - `{{cta:firma}}` – firmy, obce, SVJ
   - `{{cta:zavolat}}` – zavolejte mi
   - `{{kalkulacka}}` – interaktivní kalkulačka úspory FVE (jen u článků o FVE)
   Dej 2–3 CTA na článek: jedno po první třetině (tam, kde čtenář zjistí, že „to záleží“ – nabídni, že to spočítáme), jedno před FAQ, a podle tématu `{{cta:zavolat}}` nebo `{{kalkulacka}}`. Nikdy dvě CTA za sebou.
6. Vnitřní odkazy (2–4) na stránky webu přirozeně v textu: `<a href="/strechy/">`, `/fotovoltaika/rodinne-domy/`, `/fotovoltaika/firmy/`, `/dotace/`, `/kontakt/`, a na jiné články Poradny `/blog/<slug>/`.
7. **Časté dotazy** jako `<h2>Časté dotazy</h2>` + 4–6× `<details><summary>Otázka?</summary><p>Odpověď.</p></details>` (každá odpověď v jednom `<p>`, 1–3 věty; generuje se z nich FAQ schema). Otázky ber z našeptávačů / „lidé se také ptají“.
8. **Zdroje** na konci: `<h2>Zdroje</h2><ol class="zdroje"><li><a href="URL">Název zdroje</a>, datum</li>…</ol>`.

Další povolené prvky: `<div class="note"><b>Pozor:</b> …</div>`, `<ol>`, `<ul>`, `<strong>`.

## Pravdivost (klient na tom trvá)
- Každé číslo (cena, dotace, záruka, výkon, sklon, hmotnost) musí mít zdroj: `prooze-web/research/fakta.md`, `prooze-web/research/cro-konkurence.md` (ceny trhu, dotace 2026) nebo vlastní ověření na webu (WebSearch/WebFetch) – zdroj pak uveď v Zdrojích.
- Ceny piš jako **orientační rozpětí trhu** („podle ceníků firem v ČR, 2026“), nikdy jako cenu PROOZE. PROOZE cenu stanoví po prohlídce zdarma – to je i přirozený přechod na CTA.
- Dotace 2026: běžné RD = bezúročný úvěr NZÚ (25 000 Kč/kWp + 15 000 Kč/kWh baterie, strop 400 000 Kč, baterie ≥ výkon, min. 3 kWp, třífázově, dům zkolaudovaný před 1. 1. 2023); NZÚ Light = přímá dotace pro seniory a nízkopříjmové (FVE s ohřevem vody 120 000 Kč, zateplení střechy 2 000 Kč/m²); samotná výměna krytiny dotaci nemá, zateplení střechy ano. Uveď „k říjnu 2026, podmínky ověřte“.
- O PROOZE nepiš nic, co není na webu: žádné počty realizací, roky v oboru (jen „podnikáme od roku 2011“), recenze, certifikace. Nepiš „jsme nejlepší/nejlevnější“.
- Žádné vymyšlené statistiky, citace ani zákazníky.
- **Necitovat konkurenci** (pokrývačské firmy, dodavatelé a montážníci FVE, energetické firmy prodávající FVE, poptávkové portály s řemeslníky) – ani jménem v textu, ani odkazem ve Zdrojích. Ceny z jejich ceníků piš jako „podle veřejných ceníků firem v oboru“ a do Zdrojů dej obecný řádek bez odkazu. Původní URL patří do `research/zdroje-ceniky-firem.md`. Výrobci (Tondach/Wienerberger, Bramac/BMI, KM Beta, Satjam, Prefa, IKO, výrobci panelů a střídačů), úřady, zákony a média citovat lze.

## Tón a jazyk
- Česky, vykáme, srozumitelně pro laika, konkrétně. Krátké věty. Odborný pojem hned vysvětli.
- Bez klišé („v dnešní době“, „není žádným tajemstvím“, „pořádně, rychle, levně“), bez em-pomlček jako vycpávky, bez řečnických otázek v každém odstavci.
- Typografie: nezlomitelná mezera po jednopísmenných předložkách a spojkách (`v&nbsp;`, `k&nbsp;`, `s&nbsp;`, `z&nbsp;`, `o&nbsp;`, `u&nbsp;`, `a&nbsp;`, `i&nbsp;`) a mezi číslem a jednotkou (`400&nbsp;000&nbsp;Kč`, `6,3&nbsp;kWp`).
- Rozsah 1 100–1 800 slov podle tématu (ceník a srovnání delší, krátké dotazy kratší).

## Fotky
Neobjednávej ani negeneruj nové obrázky. Vyber `obrazek` ze seznamu výše tak, aby k tématu seděl (střecha/krytina/FVE/konzultace).

## Kontrola před odevzdáním
- Hlavní KW: v title, h1, perexu, první větě, v jednom h2 a v description.
- 2–3 CTA placeholdery, tabulka, FAQ, zdroje, 2–4 vnitřní odkazy.
- Všechna čísla mají zdroj. Žádné tvrzení o PROOZE mimo povolené.
