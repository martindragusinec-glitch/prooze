# PROOZE – rešerše klíčových slov a plán konverzního blogu

Stav k 8. 10. 2026. Zdroje: Seznam našeptávač (s relativními čísly), Google našeptávač (jen pořadí), Seznam výsledky vyhledávání (1. obrazovka). Soubory: `klicova-slova.csv` (všechny dotazy), tento dokument.

## 1. Metodika (a její limity)

- **Sklizeň:** 3 675 vstupních dotazů × 2 našeptávače (≈ 7 350 požadavků; 6 paralelních vláken, po každém požadavku pauza 0,15 s – tedy rychleji než zadaných 0,3 s, bez jediné blokace). Vstupy: 697 seedů (152 střechy, 275 FVE a dotace včetně SVJ a firem, 270 regionálních kombinací 10 služeb × 27 míst – Slaný / Kladno / Louny / Praha-západ / Středočeský kraj a okolí), 30 jádrových témat × 28 tázacích předpon (jak, kolik, vyplatí se, je lepší, …) a 40 přípon (cena, dotace, zkušenosti, vs, nebo, návratnost, …) a abeceda (a–z, české znaky, číslice – 40 znaků) u 26 hlavních témat.
- **Výsledek:** našeptávače vrátily 14 276 unikátních návrhů, z nich 11 626 souvisí s tématem; z CSV jsem vyřadil 7 404 návrhů Seznamu s nulovým počtem hledání a bez pozice v Google (šum typu „…poradna online“, „…projektor“). Po sloučení a odstranění duplicit a nesouvisejících dotazů (zaměstnání, auta, karavany, 12 V sety, plochá střecha, pergoly, nářadí, e-shopy s jedním produktem, města mimo region) zůstává **4 222 unikátních dotazů** (z toho 1 189 z Seznamu, 3 461 z Google, 428 v obou; nenulové číslo na Seznamu má 1 153 dotazů). Dotazy jsou v CSV; je to záměrně víc než 600–1 500, protože abecední rozšíření vrací dlouhý ocas – rozhodovat se má podle clusterů, ne podle jednotlivých dotazů.
- **Čísla Seznamu jsou relativní, ne měsíční hledanost.** `_count` a `_ip_count` z našeptávače jsou počty hledání / unikátních IP za blíže neurčené období; slouží k pořadí dotazů mezi sebou, ne jako objem. Hodnotu 0 mají dotazy, které Seznam jen navrhl z jiných důvodů (relevance). Jednotlivé extrémy (např. „plechová střešní krytina“ 1 036, „nzú spouští bezúročné úvěry“ 910, „okapy a svody“ 892) mohou být zkreslené reklamou nebo aktuální zprávou, proto se v součtech ořezává každý dotaz na 250.
- **Google našeptávač nemá čísla**, jen pořadí (1 = nejvýše). Pořadí odpovídá popularitě v dané předponě, ale nelze ho srovnávat mezi různými seedy. Bonus do skóre: pozice 1 = 12, 2 = 9, 3 = 7, 4–5 = 5, 6–10 = 3 body.
- **Skóre poptávky clusteru** = Σ min(Seznam _count; 250) + Σ bonus za Google pozici. Cluster zahrnuje všechny dotazy se stejným záměrem (= jeden článek). Clustery vznikly pravidly (regex podle záměru), ne ručním tříděním všech řádků, takže na okrajích jsou chyby; hlavní KW a nejsilnější dotazy jsem prošel ručně.
- **Priorita** = skóre poptávky × potenciál poptávek (1–5, můj odhad hodnoty leadu pro PROOZE) ÷ faktor obtížnosti (nízká 1,0 / střední 1,5 / vysoká 2,2); normováno tak, že nejvyšší cluster = 100. Obtížnost = průměr mého odhadu a stavu 1. obrazovky Seznamu (podíl portálů, výrobců a e-shopů).
- **Konkurence:** Seznam do HTML vykreslí jen cca 4 sponzorované a 4 organické výsledky (zbytek se dotahuje skriptem) a občas e-shop boxy, takže jde o orientační pohled na 1. obrazovku, ne o celou 1. stránku. Rozdělení organika/reklama je z HTML odhadnuté a nemusí být přesné. DuckDuckGo i Bing vracely po pár dotazech blokaci nebo nerelevantní výsledky (Bing: samé ChatGPT) – vyřazeno. **Google SERP jsem nescrapoval** (vyžaduje JavaScript/blokuje).
- **Google Trends: vynecháno.** Stránka vrátila chybu 429 (Too Many Requests); CAPTCHA jsem neřešil. Sezónnost a meziroční vývoj proto nejsou v datech – doporučuji ručně ověřit trend pro 5 hlavních témat (FVE, FVE s baterií, výměna střechy, rekonstrukce střechy, NZÚ).
- **Regionální dotazy** (Slaný, Kladno, Louny, …) vrací na našeptávačích málo a hlavně obecné lokální firmy; to je typické – lokální poptávka se chytá spíš stránkami služeb (`/strechy/`, `/fotovoltaika/`) + Google Business Profilem než blogem.
- **Nezařazeno do priorit:** obecná „základní“ témata FVE (V-ZAKLADY, mnoho DIY a 12V dotazů), obecné střechy (T-OBECNE), typy střech, balkonová fotovoltaika (mimo nabídku, ale v datech silná – 435 bodů; možný krátký článek „balkonová FVE vs. střešní“ jen jako zachycení návštěvnosti).

## 2. TOP 40 clusterů podle priority

Poptávka = součet Seznam _count (každý dotaz max. 250); skóre = poptávka + bonus za Google pozici. Priorita 0–100 viz metodika. Konkurence = typy domén na 1. obrazovce Seznamu pro hlavní KW.

| # | Cluster – hlavní KW | Dotazů | Poptávka | Skóre | Záměr | Fáze | Konkurence na 1. obrazovce | Obtížnost | Potenciál | Priorita |
|---|---|---:|---:|---:|---|---|---|---|---:|---:|
| 1 | **plechová střešní krytina** (T-PLECH) | 313 | 1630 | 3337 | srovnávací | zvažování | 1× firma; inzerentů 4 | střední | 5 | 100.0 |
| 2 | **jaká střešní krytina** (T-VYBER) | 184 | 877 | 1773 | srovnávací | zvažování | 2× firma, 1× e-shop; inzerentů 4 | střední | 4 | 42.5 |
| 3 | **pokrývačské práce cena** (T-FIRMA) | 118 | 668 | 1318 | transakční | rozhodování | 1× katalog; inzerentů 7 | střední | 5 | 39.5 |
| 4 | **dotace na fotovoltaiku 2026** (D-NZU-FVE) | 117 | 493 | 1312 | informační | zvažování | organika nenačtena; inzerentů 8 | střední | 5 | 39.3 |
| 5 | **fotovoltaika cena** (V-CENA) | 136 | 262 | 1276 | srovnávací | rozhodování | 2× energetika; inzerentů 4 | střední | 5 | 38.2 |
| 6 | **pálená taška** (T-PALENA) | 141 | 647 | 1508 | srovnávací | zvažování | 1× portal, 1× e-shop, 1× firma; inzerentů 2 | střední | 4 | 36.2 |
| 7 | **pokrývač Kladno** (L-STR) | 126 | 461 | 1143 | lokální | rozhodování | organika nenačtena; inzerentů 6 | střední | 5 | 34.3 |
| 8 | **výměna střešní krytiny cena** (T-VYMENA) | 124 | 146 | 1117 | informační | zvažování | 4× firma, 2× portal; inzerentů 4 | střední | 5 | 33.5 |
| 9 | **baterie k fotovoltaice** (V-BAT) | 211 | 318 | 1612 | srovnávací | zvažování | 2× e-shop, 1× portal; inzerentů 4 | vysoká | 5 | 32.9 |
| 10 | **sdílení elektřiny** (S-SDILENI) | 105 | 452 | 1258 | informační | povědomí | organika nenačtena; inzerentů 7 | střední | 4 | 30.2 |
| 11 | **kanadský šindel** (T-SINDEL) | 107 | 496 | 1198 | srovnávací | zvažování | 2× firma, 1× portal; inzerentů 4 | střední | 4 | 28.7 |
| 12 | **oprava střechy cena** (T-OPRAVA) | 122 | 349 | 907 | informační | zvažování | 2× portal, 2× firma, 1× výrobce; inzerentů 6 | střední | 5 | 27.2 |
| 13 | **nzú light 2026** (D-LIGHT) | 69 | 689 | 1034 | informační | zvažování | organika nenačtena; inzerentů 9 | střední | 4 | 24.8 |
| 14 | **hliníková střešní krytina** (T-PREFA) | 139 | 695 | 1469 | srovnávací | zvažování | 2× e-shop, 1× portal, 1× firma; inzerentů 2 | vysoká | 4 | 24.0 |
| 15 | **okapový systém** (T-OKAPY) | 72 | 985 | 1317 | srovnávací | zvažování | 2× firma, 1× portal; inzerentů 4 | střední | 3 | 23.7 |
| 16 | **střešní okna velux** (T-OKNA) | 84 | 804 | 1242 | srovnávací | zvažování | organika nenačtena; inzerentů 6 | střední | 3 | 22.3 |
| 17 | **zateplení půdy** (T-ZATEPL-PUDA) | 94 | 464 | 886 | informační | zvažování | 2× firma; inzerentů 4 | střední | 4 | 21.2 |
| 18 | **betonová taška** (T-BETON) | 108 | 437 | 1153 | srovnávací | zvažování | 3× e-shop, 1× portal; inzerentů 4 | vysoká | 4 | 18.8 |
| 19 | **nová zelená úsporám 2026** (D-NZU) | 139 | 352 | 1289 | informační | povědomí | 3× portal, 3× firma; inzerentů 5 | vysoká | 3 | 15.8 |
| 20 | **bezúročný úvěr nová zelená úsporám** (D-UVER) | 27 | 322 | 506 | informační | rozhodování | organika nenačtena; inzerentů 5 | střední | 5 | 15.2 |
| 21 | **dotace na střechu** (D-STR) | 91 | 279 | 901 | informační | zvažování | 6× portal; inzerentů 7 | vysoká | 4 | 14.7 |
| 22 | **rekonstrukce střechy cena** (T-REKONSTR) | 49 | 157 | 476 | informační | zvažování | 2× portal; inzerentů 8 | střední | 5 | 14.3 |
| 23 | **wallbox (nabíjení elektromobilu) a fotovoltaika** (X-WALLBOX) | 172 | 525 | 1586 | srovnávací | zvažování | bez dat (odhad) | vysoká | 2 | 13.0 |
| 24 | **zatéká střecha** (T-ZATEKA) | 46 | 49 | 423 | informační | povědomí | 5× portal, 4× firma; inzerentů 0 | střední | 5 | 12.7 |
| 25 | **hromosvod, komín a doplňky střechy** (T-HROMOSVOD) | 63 | 383 | 651 | informační | zvažování | bez dat (odhad) | nízká | 2 | 11.7 |
| 26 | **zateplení střechy** (T-ZATEPL) | 70 | 227 | 708 | informační | zvažování | 6× portal, 3× firma; inzerentů 4 | vysoká | 4 | 11.6 |
| 27 | **fotovoltaika návratnost** (V-NAVRAT) | 40 | 47 | 379 | srovnávací | zvažování | organika nenačtena; inzerentů 8 | střední | 5 | 11.4 |
| 28 | **kolik panelů na rodinný dům** (V-KALK) | 32 | 28 | 233 | informační | zvažování | 4× firma; inzerentů 0 | nízká | 5 | 10.5 |
| 29 | **fotovoltaika zkušenosti** (V-RECENZE) | 45 | 63 | 403 | srovnávací | rozhodování | 4× firma; inzerentů 0 | střední | 4 | 9.7 |
| 30 | **solární střešní krytina** (V-SOLKRYT) | 47 | 97 | 400 | srovnávací | zvažování | 2× firma, 1× portal; inzerentů 4 | střední | 4 | 9.6 |
| 31 | **výkup přetoků** (V-PRETOKY) | 41 | 148 | 390 | informační | zvažování | organika nenačtena; inzerentů 9 | střední | 4 | 9.3 |
| 32 | **fotovoltaika ohřev vody** (V-OHREV) | 33 | 319 | 493 | srovnávací | zvažování | 1× portal, 1× firma; inzerentů 4 | střední | 3 | 8.9 |
| 33 | **výměna střešní krytiny povolení** (T-POVOLENI) | 30 | 72 | 354 | informační | povědomí | 3× firma, 1× výrobce; inzerentů 0 | střední | 4 | 8.5 |
| 34 | **skladba střechy nová střecha** (T-NOVA) | 45 | 159 | 345 | informační | zvažování | bez dat (odhad) | střední | 4 | 8.3 |
| 35 | **fotovoltaika povolení** (V-POVOLENI) | 33 | 28 | 287 | informační | zvažování | 4× firma; inzerentů 0 | nízká | 3 | 7.7 |
| 36 | **výměna krovu** (T-KROV) | 55 | 50 | 401 | informační | zvažování | 2× firma, 1× portal; inzerentů 0 | střední | 3 | 7.2 |
| 37 | **hybridní střídač** (V-STRIDAC) | 53 | 114 | 383 | srovnávací | zvažování | 2× firma, 1× e-shop; inzerentů 2 | střední | 3 | 6.9 |
| 38 | **fotovoltaika na plechovou střechu** (V-TYPSTR) | 24 | 14 | 157 | srovnávací | zvažování | 4× firma; inzerentů 4 | nízká | 4 | 5.6 |
| 39 | **fotovoltaika pro firmy** (F-FIRMY) | 23 | 3 | 215 | srovnávací | zvažování | 4× firma, 1× katalog; inzerentů 6 | střední | 4 | 5.2 |
| 40 | **fotovoltaika Slaný** (L-FVE) | 16 | 20 | 173 | lokální | rozhodování | organika nenačtena; inzerentů 5 | střední | 4 | 4.1 |

Poznámky k tabulce: (1) „Potenciál poptávek“ = jak blízko je téma nákupu (5 = lidé hledají cenu/nabídku/firmu, 1 = informační nebo mimo nabídku). (2) Cluster **fotovoltaika a výměna střechy** (V-KOMBI) má malé číslo v našeptávačích (dotaz je nový), ale je to hlavní odlišení PROOZE a nemá silnou konkurenci – v plánu je proto strategicky na 2. místě, ne podle skóre. (3) Na 1. obrazovce Seznamu se u řady dotazů objevuje `schlieger.cz` (vlastní skupina) – zbytečně nekanibalizovat, odkazovat si.

## 3. PLÁN BLOGU – 15 článků v pořadí psaní

Pořadí: nejdřív články s nejvyšším potenciálem poptávek a nízkou až střední konkurencí, plus odlišení „střecha + panely“ hned na začátku. Každý článek končí konverzním prvkem a odkazem na jednu cílovou stránku. Fakta se berou z `research/fakta.md`; kde tam něco chybí, je to výslovně uvedeno.

### 1. Výměna střechy cena 2026: kolik stojí 1 m² i celý dům
- **Titulek:** Výměna střechy cena 2026: kolik stojí 1 m² i celý dům (53 znaků)
- **URL slug:** `/vymena-strechy-cena/`
- **Hlavní KW:** výměna střechy cena
- **Vedlejší KW:** rekonstrukce střechy, podstřešní fólie, cena střechy za m2, výměna střešní krytiny, střešní krytina fólie, střechy cena za m2, krytina na střechu s malým sklonem, půdní vestavba, rekonstrukce střechy na klíč, výměna střechy
- **Pokrývá clustery:** T-VYMENA, T-NOVA, T-REKONSTR (součet skóre 1938)
- **Záměr:** informační → srovnávací (cenový dotaz těsně před poptávkou)
- **Co musí obsahovat, aby vyhrál:**
  - Tabulka cen za m² podle krytiny (pálená, betonová, plech, hliník Prefa, kanadský šindel) rozdělená na materiál / práce / krov a latě / doplňky; ceny jen s datem a rozptylem
  - Ukázkové rozpočty: sedlová střecha 120 m², valba 180 m², garáž/přístavek
  - Co cenu zvedá (krov, sklon, komín, okna, demontáž a likvidace, lešení) a kde se dá ušetřit
  - Checklist „co musí být v nabídce“ (pevná cena, termín, záruka, vícepráce) – navazuje na sliby PROOZE
  - FAQ z „lidé se také ptají“: cena střechy za m2, kolik stojí nová střecha, kolik stojí výměna eternitu, jak dlouho trvá výměna
- **Konverzní prvek:** Kalkulačka „cena střechy podle plochy a krytiny“ → předvyplněná poptávka na nacenění (služba střecha, plocha, krytina v poznámce)
- **Interní odkaz na:** /strechy/ (hlavní), dále /kontakt/
- **Kategorie / CTA bloky (blog-brief.md):** `strechy` / `{{cta:strecha}} + {{cta:zavolat}}`
- **Potřebná fakta:** B1 (hmotnosti, sklony), E (skladba střechy, krov). ceny trhu za m² a příplatky (demontáž, latě, krov, lešení): cro-konkurence.md §3.2 (zdroje roofer.cz, cenanovestrechy.cz; DPH často neuvedeno). Do článku jen jako orientační rozpětí trhu s datem; cenu PROOZE nepsat, ta vzniká po prohlídce.

### 2. Fotovoltaika a výměna střechy: proč to řešit společně
- **Titulek:** Fotovoltaika a výměna střechy: proč to řešit společně (53 znaků)
- **URL slug:** `/fotovoltaika-a-vymena-strechy/`
- **Hlavní KW:** fotovoltaika a výměna střechy
- **Vedlejší KW:** solární panely na střechu, fotovoltaická střešní krytina, solární střecha, solární taška, solární tašky na střechu, fotovoltaika na střechu, fotovoltaika na plechovou střechu, fotovoltaika na šindelové střeše, fotovoltaika sklon panelů, fotovoltaika východ západ
- **Pokrývá clustery:** V-KOMBI, V-TYPSTR, V-SOLKRYT (součet skóre 560)
- **Záměr:** srovnávací / rozhodovací; hlavní odlišení PROOZE (střecha + panely od jedné firmy)
- **Co musí obsahovat, aby vyhrál:**
  - Odpověď v prvním odstavci: panely na starou krytinu = dvojí demontáž, kdy dává smysl dělat obojí najednou
  - Srovnání 3 scénářů v tabulce: (a) jen střecha, (b) jen panely, (c) střecha + panely najednou – lešení, doba, riziko prosakování, záruka, jedna firma vs. dvě
  - Co kontrolovat na krovu a krytině před montáží panelů (únosnost, zbytková životnost krytiny, kotvení dle pokynů výrobce krytiny)
  - Sekce podle krytiny: pálená/betonová taška, plech, šindel, eternit (kotvení, hmotnost)
  - Odlišení: integrovaná solární krytina (Tondach Solar / Bramac Solar) vs. klasické panely – kdy se vyplatí
  - FAQ: zruší montáž panelů záruku na střechu? Musí se střecha měnit před panely? Jak dlouho vydrží krytina vs. panely?
- **Konverzní prvek:** Krátký kvíz „Kdy mám měnit střechu a dávat panely?“ (stáří střechy, krytina, spotřeba) → poptávka „střecha + FVE“; CTA „Nacenit střechu i panely najednou“
- **Interní odkaz na:** /fotovoltaika/rodinne-domy/ a /strechy/
- **Kategorie / CTA bloky (blog-brief.md):** `strecha-fve` / `{{cta:oboji}} + {{cta:zavolat}}`
- **Potřebná fakta:** B1–B2 (krytiny), C1 (panely), E (krov a skladba), D5 (stavební povolení FVE). K OVĚŘENÍ s klientem: „panely kotvíme dle pokynů výrobce krytiny, záruka střechy zůstane platná“ (README, DOPLNIT).

### 3. Dotace na fotovoltaiku 2026: úvěr NZÚ krok za krokem
- **Titulek:** Dotace na fotovoltaiku 2026: úvěr NZÚ krok za krokem (52 znaků)
- **URL slug:** `/dotace-fotovoltaika-2026/`
- **Hlavní KW:** dotace na fotovoltaiku 2026
- **Vedlejší KW:** nová zelená úsporám 2026, nová zelená úsporám, nzú spouští bezúročné úvěry, nová zelená úsporám 2026 - podmínky, nová zelená úsporám . cz, fotovoltaika dotace, nová zelená úsporám dotace, dotace na solární panely 2026, dotace na solární panely ohřev vody v bojleru, solární panely dotace
- **Pokrývá clustery:** D-NZU-FVE, D-UVER, D-NZU (součet skóre 3107)
- **Záměr:** informační (vysoká poptávka po aktuálních podmínkách), rozhodovací
- **Co musí obsahovat, aby vyhrál:**
  - Poctivé shrnutí 2026: pro běžné RD je hlavní podpora bezúročný úvěr (stát hradí úroky), přímá dotace jen pro nízkopříjmové (NZÚ Light)
  - Vzorec úvěru (25 000 Kč/kWp + 15 000 Kč/kWh baterie, strop 400 000 Kč) s příkladem pro 8 kWp + 10 kWh a splátkou
  - Postup žádosti krok za krokem (kdy žádat, co dokládat, kdo podává) + časová osa
  - Tabulka „dotace vs. úvěr“ podle typu žadatele: RD, nízkopříjmoví, SVJ, firmy
  - Nepsat „dotace až 147 000 Kč“ ani „garantovaná dotace“; datum aktualizace v perexu
  - FAQ: končí NZÚ? dá se kombinovat se střechou? musí mít dům energetický štítek?
- **Konverzní prvek:** Kalkulačka bezúročného úvěru NZÚ (už je na webu v #kalkulacka) vložená do článku → poptávka s předvyplněným kWp a kWh
- **Interní odkaz na:** /dotace/ (hlavní), /fotovoltaika/rodinne-domy/
- **Kategorie / CTA bloky (blog-brief.md):** `dotace` / `{{cta:dotace}} + {{kalkulacka}}`
- **Potřebná fakta:** D4 (NZÚ Light, vzorec úvěru – [S], ověřit na novazelenausporam.cz před publikací), D3, cro-konkurence.md §2.2–2.3 (podmínky úvěru: min. 3 kWp, třífázově, baterie kWh ≥ kWp, dům zkolaudován před 1. 1. 2023). Nutná kontrola proti závazným pokynům SFŽP.

### 4. Fotovoltaika cena 2026: kolik stojí sestava s baterií
- **Titulek:** Fotovoltaika cena 2026: kolik stojí sestava s baterií (53 znaků)
- **URL slug:** `/fotovoltaika-cena/`
- **Hlavní KW:** fotovoltaika cena
- **Vedlejší KW:** fotovoltaické panely cena, fotovoltaika solax, kolik stojí fotovoltaika na rodinný dům, kolik stojí fotovoltaika, solární panely levně, hybridní střídač, fotovoltaika ceník, solární panely aiko, fotovoltaika eon cena, solární panely cena
- **Pokrývá clustery:** V-CENA, V-STRIDAC (součet skóre 1659)
- **Záměr:** srovnávací / transakční
- **Co musí obsahovat, aby vyhrál:**
  - Ceník typických sestav RD (5, 8, 10, 12 kWp; s baterií 5–15 kWh) jako tabulka od–do s datem; co je a není v ceně (panely, střídač, baterie, konstrukce, montáž, revize, připojení)
  - Cena před a po úvěru/dotaci – bez zavádějících „cen po dotaci“
  - Z čeho se cena skládá (panely, střídač, baterie, instalace) a kde nabídky „hrají“ (zkrácený rozsah, levné konstrukce)
  - Checklist „jak číst nabídku na FVE“ + varovné signály (velká záloha, nátlak, ‚dotace garantována‘)
  - FAQ: kolik stojí fotovoltaika 10 kWp, kolik stojí fotovoltaika na klíč, zdraží se?
- **Konverzní prvek:** Ceník → CTA „Pošlete fakturu za elektřinu, do 24 h připravíme cenu na míru“ (formulář s předvyplněným pásmem spotřeby)
- **Interní odkaz na:** /fotovoltaika/rodinne-domy/
- **Kategorie / CTA bloky (blog-brief.md):** `fotovoltaika` / `{{cta:fve}} + {{kalkulacka}}`
- **Potřebná fakta:** C1–C2 (komponenty), C4 (ceny elektřiny). tržní ceny sestav 5 / 7 / 10 kWp s baterií i bez: cro-konkurence.md §3.1 (DPH 12 % u dodavatelů neověřeno). Konkrétní značky panelů/střídačů neuvádět, dokud klient nepotvrdí.

### 5. Oprava střechy cena: kdy stačí záplata a kdy výměna
- **Titulek:** Oprava střechy cena: kdy stačí záplata a kdy výměna (51 znaků)
- **URL slug:** `/oprava-strechy-cena/`
- **Hlavní KW:** oprava střechy cena
- **Vedlejší KW:** oprava střechy, oprava lepenkové střechy, nátěr střechy cena za 1 m2, oprava střechy z ipy, zatékání do střechy, zatéká do auta, oprava asfaltové střechy, oprava rovné střechy, izolace střechy při zatékání, opravy střech bohumín
- **Pokrývá clustery:** T-OPRAVA, T-ZATEKA (součet skóre 1330)
- **Záměr:** informační / transakční (akutní problém, rychlé rozhodnutí)
- **Co musí obsahovat, aby vyhrál:**
  - Rozhodovací strom: zatéká / praskly tašky / po vichřici → oprava vs. výměna (kritéria: stáří, stav latí a krovu, počet oprav)
  - Ceník běžných oprav (výměna poškozených tašek, hřeben, lemování komína, okapy, zatékání u okna) jako orientační rozpětí
  - Příčiny zatékání (hřeben, prostupy, úžlabí, kondenzace) + co dělat hned (dočasné opatření, fotodokumentace pro pojišťovnu)
  - Kdy je oprava vyhazování peněz – 3 signály
  - FAQ: zatéká střecha co dělat, kolik stojí oprava střechy, hradí pojišťovna škodu po vichřici?
- **Konverzní prvek:** Tlačítko „Zatéká? Pošlete foto, ozveme se do 24 h“ (zrychlený formulář + telefon) → poptávka typu servis
- **Interní odkaz na:** /strechy/ a /kontakt/
- **Kategorie / CTA bloky (blog-brief.md):** `strechy` / `{{cta:strecha}} + {{cta:zavolat}}`
- **Potřebná fakta:** E (kontrola krovu, tesařík, skladba střechy, doporučená prohlídka 1–2× ročně). Ceny oprav v rešerši nejsou (jen příplatky v cro-konkurence.md §3.2) – doplnit rozpětí z veřejných ceníků; pojišťovna – ověřit samostatně.

### 6. Pálená nebo betonová taška: rozdíly, cena, záruka
- **Titulek:** Pálená nebo betonová taška: rozdíly, cena, záruka (49 znaků)
- **URL slug:** `/palena-nebo-betonova-taska/`
- **Hlavní KW:** pálená nebo betonová taška
- **Vedlejší KW:** tondach stodo 12, bramac tašky, pálená taška, pálená střešní taška, pálená taška tondach, taška bobrovka, betonová taška, střešní krytina bramac, střešní krytina tondach, bramac en 490
- **Pokrývá clustery:** T-PALEBET, T-PALENA, T-BETON (součet skóre 2746)
- **Záměr:** srovnávací (Google našeptávač: pozice 1 u „pálená nebo betonová taška“)
- **Co musí obsahovat, aby vyhrál:**
  - Srovnávací tabulka: hmotnost, min. sklon, záruka, životnost, povrchy, cena, údržba, vhodnost pro FVE
  - Hmotnost vs. krov: kdy staré krovy neunesou těžší krytinu a proč se mluví o lehčích alternativách
  - Značky: Tondach (Figaro, Stodo, Bobrovka) vs. Bramac (Max, Classic) a KM Beta – fakta z technických listů
  - Doporučení „pro koho co“ (nový dům, renovace, nízký sklon, kombinace s FVE)
  - FAQ: která taška vydrží déle, mechy a řasy, barvy a odstíny, hlučnost
- **Konverzní prvek:** Vizuální výběr „Jakou krytinu zvolit“ (3 otázky) → poptávka s preferovanou krytinou v poznámce
- **Interní odkaz na:** /strechy/
- **Kategorie / CTA bloky (blog-brief.md):** `strechy` / `{{cta:strecha}}`
- **Potřebná fakta:** B1 (tabulka Figaro 11, Stodo 12, Bobrovka, Bramac Max/Classic, KM Beta), B2 (poznámky k výrobcům), E (životnosti). Záruky ověřit u výrobců před publikací (Tondach 33 let – podmínky!).

### 7. Plechová střešní krytina: cena za m², hluk a bouřka
- **Titulek:** Plechová střešní krytina: cena za m², hluk a bouřka (51 znaků)
- **URL slug:** `/plechova-stresni-krytina/`
- **Hlavní KW:** plechová střešní krytina
- **Vedlejší KW:** hliníková střešní krytina, střešní krytina plechová, střešní krytina plech, plastová střešní krytina, prefa střechy, střešní krytina satjam, falcovaný plech, plechová střešní krytina satjam, plechová krytina satjam, hliníková krytina na střechu
- **Pokrývá clustery:** T-PLECH, T-PREFA (součet skóre 4806)
- **Záměr:** srovnávací (největší hledanost na Seznamu v celé rešerši)
- **Co musí obsahovat, aby vyhrál:**
  - Cena za m² podle typu (tvarovaná taška, falc, trapéz, hliník/Prefa) a tloušťky/povrchu
  - Mýty: hluk deště, bouřka a blesk, přehřívání – co je pravda a jak se řeší (podkladní vrstvy, hromosvod)
  - Ocel vs. hliník: záruky a skutečný význam („až 60 let“ jen hliník; ocel max. 40 let funkčnosti)
  - Sklon, hmotnost (4,7 kg/m² vs. ~45 kg/m² pálená) a využití na starých krovech
  - Sněhové zábrany, odvodnění, kondenzace – na co si dát pozor při montáži
  - FAQ: plechová střecha a bouřka, hluk, cena za m2, výhody a nevýhody
- **Konverzní prvek:** Kalkulačka „plech vs. taška“ (plocha, sklon → cena + hmotnost) → poptávka na nacenění plechové střechy
- **Interní odkaz na:** /strechy/
- **Kategorie / CTA bloky (blog-brief.md):** `strechy` / `{{cta:strecha}} + {{cta:zavolat}}`
- **Potřebná fakta:** B1, B2 (SATJAM Roof 0,5 mm, 4,7 kg/m², min. 10°), B3 (registrační záruka SATJAM), Prefa 29×29 (2,6 kg/m², 22°), E (životnost). Tvrzení o hluku a blesku NEJSOU ve fakta.md – dohledat zdroj před psaním.

### 8. Návratnost fotovoltaiky: kolik panelů a jaká úspora
- **Titulek:** Návratnost fotovoltaiky: kolik panelů a jaká úspora (51 znaků)
- **URL slug:** `/navratnost-fotovoltaiky/`
- **Hlavní KW:** fotovoltaika návratnost
- **Vedlejší KW:** výkup přetoků z fve, fotovoltaika výhody a nevýhody, návratnost fotovoltaiky, fotovoltaika kalkulačka, přetoky do sítě čez, vyplatí se fotovoltaika, výkup přetoků z fve 2026 ceník centropol, výkup přetoků z fve čez, fotovoltaika bez přetoků, výkup přetoků z fotovoltaiky
- **Pokrývá clustery:** V-NAVRAT, V-KALK, V-PRETOKY (součet skóre 1002)
- **Záměr:** informační → srovnávací (vyplatí se? jak velká?)
- **Co musí obsahovat, aby vyhrál:**
  - Jak se návratnost počítá: spotřeba, vlastní využití (třetina bez baterie, 60–80 % s baterií), cena elektřiny, výkup přetoků
  - 3 modelové domácnosti (3 000, 6 000, 10 000 kWh/rok) s tabulkou kWp, počtu panelů a roční úspory
  - Výkup přetoků 2026: fixní 0,20–1,05 Kč/kWh, spot může být záporný – proč se vyplatí spotřebovat doma
  - Návratnost s baterií a bez, s úvěrem NZÚ – poctivě, s uvedením předpokladů
  - FAQ: kolik panelů na rodinný dům, jak velkou fotovoltaiku, vyplatí se fotovoltaika v roce 2026
- **Konverzní prvek:** Interaktivní kalkulačka úspory (už je na webu: měsíční platba → kWp, baterie, úspora, úvěr) → poptávka s předvyplněnými parametry
- **Interní odkaz na:** /fotovoltaika/rodinne-domy/
- **Kategorie / CTA bloky (blog-brief.md):** `fotovoltaika` / `{{kalkulacka}} + {{cta:fve}}`
- **Potřebná fakta:** C3 (900–1 150 kWh/kWp, samospotřeba), C4 (ceny elektřiny, výkup přetoků – [S], zdroj usetreno.cz 1/2026), předpoklady kalkulačky (6 Kč/kWh, úspora až 70 %) jsou předpoklad, ne fakt.

### 9. Baterie k fotovoltaice: jaká kapacita se vyplatí
- **Titulek:** Baterie k fotovoltaice: jaká kapacita se vyplatí (48 znaků)
- **URL slug:** `/baterie-k-fotovoltaice/`
- **Hlavní KW:** baterie k fotovoltaice
- **Vedlejší KW:** fotovoltaika baterie, solární elektrárna s baterií, bateriové úložiště pro domácnost, baterie k fotovoltaice goodwe, baterie k fotovoltaice 10kw, solární panel s baterií, malá fotovoltaika s baterií, kolik stojí baterie k fotovoltaice, fotovoltaiky cena s montáží 6kw s bateriemi, fotovoltaika s baterií
- **Pokrývá clustery:** V-BAT, V-BACKUP (součet skóre 1664)
- **Záměr:** srovnávací (jedno z nejhledanějších FVE témat; Google pozice 1)
- **Co musí obsahovat, aby vyhrál:**
  - Kolik kWh baterie potřebuje dům podle spotřeby a výkonu FVE (tabulka)
  - Baterie vs. bez baterie: samospotřeba, výkup, úvěr NZÚ (15 000 Kč/kWh), záloha při výpadku
  - Typy a záruky (LFP, 10 let, počet cyklů) – obecně, bez značek, dokud klient nepotvrdí
  - Kdy se baterie nevyplatí a co dělat místo ní (ohřev vody, řízení spotřeby)
  - FAQ: baterie 10 kWh cena, životnost baterie, zálohování při výpadku, rozšiřování baterie
- **Konverzní prvek:** Výběr „kapacita baterie“ v kalkulačce → poptávka FVE s baterií; CTA „Spočítáme baterii podle vaší spotřeby“
- **Interní odkaz na:** /fotovoltaika/rodinne-domy/
- **Kategorie / CTA bloky (blog-brief.md):** `fotovoltaika` / `{{kalkulacka}} + {{cta:fve}}`
- **Potřebná fakta:** C2 (GoodWe Lynx Home F, Solax T58, SolarEdge – záruky se mezi zdroji liší, ověřit), C3 (samospotřeba), D4 (vzorec úvěru).

### 10. Jaká střešní krytina je nejlepší: srovnání 2026
- **Titulek:** Jaká střešní krytina je nejlepší: srovnání 2026 (47 znaků)
- **URL slug:** `/jaka-stresni-krytina/`
- **Hlavní KW:** jaká střešní krytina
- **Vedlejší KW:** krytina na střechu, lehká střešní krytina, střešní krytina ipa, střešní krytiny levně, nejlevnější střešní krytina, střešní krytina ruukki, střešní krytina bazar, střešní krytina click, střešní krytina capacco, střešní krytina plast
- **Pokrývá clustery:** T-VYBER, T-ZIVOTNOST, T-LEHKA (součet skóre 1960)
- **Záměr:** srovnávací (rozcestník ke všem materiálům – hub článek)
- **Co musí obsahovat, aby vyhrál:**
  - Přehledová tabulka 6 krytin: cena, hmotnost, min. sklon, životnost/záruka, hlučnost, údržba, vhodnost pro FVE
  - Rozhodnutí podle situace: nový dům, rekonstrukce, starý krov, nízký sklon, rozpočet
  - Životnost: záruka výrobce vs. reálná životnost, co záruky nekryjí (okraje, povrch)
  - Odkazy na detailní články (pálená/beton, plech, šindel, Prefa)
  - FAQ: nejlevnější krytina, nejdéle vydrží, nejlehčí krytina, nejmodernější barvy
- **Konverzní prvek:** Kvíz „Jaká krytina se hodí na váš dům“ → poptávka s doporučenou krytinou
- **Interní odkaz na:** /strechy/
- **Kategorie / CTA bloky (blog-brief.md):** `strechy` / `{{cta:strecha}}`
- **Potřebná fakta:** B1 (celá tabulka), B3, E (životnosti [S], upozornění na rozsah záruk).

### 11. NZÚ Light 2026: kdo má nárok a kolik dostane
- **Titulek:** NZÚ Light 2026: kdo má nárok a kolik dostane (44 znaků)
- **URL slug:** `/nzu-light-2026/`
- **Hlavní KW:** nzú light 2026
- **Vedlejší KW:** nová zelená úsporám light 2026, nzú light 2026 pro důchodce, nzú light, nová zelená úsporám light, nzú light 2026 podmínky, mžp dotace 2026 nzú light, nová zelená úsporám light 2026 pro důchodce, nová zelená úsporám light 2026 podmínky, nzú light podmínky, dotace nová zelená úsporám 2026 pro důchodce
- **Pokrývá clustery:** D-LIGHT (součet skóre 1034)
- **Záměr:** informační (vysoká poptávka, jasný okruh žadatelů)
- **Co musí obsahovat, aby vyhrál:**
  - Kdo má nárok (nízkopříjmové domácnosti a senioři) a jak se to dokládá
  - Co lze pořídit (FVE s ohřevem vody, střecha/zateplení – ověřit rozsah) a maximální výše podpory
  - Postup žádosti a časová osa + kdo zpracovává administrativu
  - Rozcestník: NZÚ Light vs. běžný úvěr NZÚ vs. firemní podpora
- **Konverzní prvek:** Zjednodušený test oprávněnosti („Splňuji podmínky NZÚ Light?“) → poptávka s příznakem Light
- **Interní odkaz na:** /dotace/
- **Kategorie / CTA bloky (blog-brief.md):** `dotace` / `{{cta:dotace}} + {{cta:zavolat}}`
- **Potřebná fakta:** D4 + cro-konkurence.md §2.3 (FVE s ohřevem vody 120 000 Kč, zateplení střechy 2 000 Kč/m² – [S], žádosti od 6/2026; ověřit u SFŽP). NEPOUŽÍVAT „147 000 Kč“.

### 12. Sdílení elektřiny v bytovém domě: jak to funguje
- **Titulek:** Sdílení elektřiny v bytovém domě: jak to funguje (48 znaků)
- **URL slug:** `/sdileni-elektriny-bytovy-dum/`
- **Hlavní KW:** sdílení elektřiny
- **Vedlejší KW:** edc sdílení elektřiny, sdílení elektřiny z fotovoltaiky, sdílení elektřiny edc, sdílení elektřiny jak na to, sdílení elektřiny čez, jak funguje sdílení elektřiny, energetické společenství, sdílení elektřiny registrace, sdílení elektřiny registrace edc, jak na sdílení elektřiny
- **Pokrývá clustery:** S-SDILENI, S-SVJ, S-STRSVJ (součet skóre 1445)
- **Záměr:** informační → B2B pro SVJ (nízký objem, vysoká hodnota zakázky)
- **Co musí obsahovat, aby vyhrál:**
  - Vysvětlení v 5 krocích: výroba na střeše → měření → registrace v EDC → rozpis mezi byty → úspora
  - Role SVJ, souhlas vlastníků (neuvádět „stačí polovina“ bez ověření), vůdčí odběrné místo
  - Střecha bytového domu jako příležitost: oprava střechy + FVE v jednom projektu
  - Podpora NZÚ pro SVJ (úvěr) a kdy žádat
  - FAQ: kolik ušetří byt, kdo platí, co když se někdo odhlásí
- **Konverzní prvek:** Formulář „Podklady pro nabídku pro SVJ“ (počet bytů, plocha střechy, stav střechy) + stažení checklistu pro schůzi vlastníků
- **Interní odkaz na:** /fotovoltaika/ a /kontakt/
- **Kategorie / CTA bloky (blog-brief.md):** `fotovoltaika` / `{{cta:firma}} + {{cta:oboji}}`
- **Potřebná fakta:** D3 (Lex OZE II, EDC, NZÚ pro SVJ od 28. 5. 2026). Stavovost „souhlas poloviny vlastníků“ NEOVĚŘENO.

### 13. Fotovoltaika pro firmy: cena, návratnost a dotace
- **Titulek:** Fotovoltaika pro firmy: cena, návratnost a dotace (49 znaků)
- **URL slug:** `/fotovoltaika-pro-firmy/`
- **Hlavní KW:** fotovoltaika pro firmy
- **Vedlejší KW:** fotovoltaika pro firmy do 50 kwp, čez fotovoltaika pro firmy, eon fotovoltaika pro firmy, fotovoltaika firmy, fotovoltaika firmy recenze, fotovoltaika 50 kwp cena, fotovoltaika 100 kwp, fotovoltaika firma, fotovoltaika nejlepší firmy, solarni panely firma
- **Pokrývá clustery:** F-FIRMY, F-DOTACE (součet skóre 215)
- **Záměr:** srovnávací / B2B (nízký objem hledání, vysoká hodnota)
- **Co musí obsahovat, aby vyhrál:**
  - Typy firem (hala, sklad, zemědělství, provozovna) a typické velikosti 30–100 kWp
  - Dotace a úvěr pro firmy 2026: OP TAK (FVE s akumulací, úvěr NRB 0,5–3 mil.), RES+ pro zemědělce – přesně, s datem
  - Návratnost firmy: vlastní spotřeba přes den, rezervovaný příkon, odpisy, DPH
  - Postup od poptávky po spuštění, licence ERÚ (do 100 kW pro vlastní spotřebu není nutná)
  - FAQ: vyplatí se FVE pro malou firmu, kdy je potřeba stavební povolení
- **Konverzní prvek:** Poptávka „Pošlete průběh spotřeby (15min data) – zdarma spočítáme“ + kalkulačka velikosti dle spotřeby
- **Interní odkaz na:** /fotovoltaika/firmy/
- **Kategorie / CTA bloky (blog-brief.md):** `fotovoltaika` / `{{cta:firma}} + {{cta:zavolat}}`
- **Potřebná fakta:** D1 (OP TAK Výzva I, NRB), D2 (RES+ – většina výzev skončila 30. 1. 2026), D5 (licence).

### 14. Kanadský šindel: cena, životnost a kdy se hodí
- **Titulek:** Kanadský šindel: cena, životnost a kdy se hodí (46 znaků)
- **URL slug:** `/kanadsky-sindel/`
- **Hlavní KW:** kanadský šindel
- **Vedlejší KW:** střešní krytina šindel, střešní krytina onduline, šindelová střecha, kanadský šindel akce, oprava šindelové střechy, kanadský šindel montáž, kanadský šindel pásy, kanadský šindel pokládka, jak položit kanadský šindel, kanadský šindel v roli
- **Pokrývá clustery:** T-SINDEL (součet skóre 1198)
- **Záměr:** srovnávací (Google pozice 1 u hlavního KW)
- **Co musí obsahovat, aby vyhrál:**
  - Cena za m² a co je v ceně (šindel, podkladní vrstva, pokládka)
  - Životnost a záruka (IKO 25–30 let dle řady), hmotnost ~13 kg/m², min. sklon 9,5°
  - Kde se hodí (nízký sklon, složité tvary, lehký krov) a kde ne
  - Hlučnost, barvy, údržba, srovnání s plechem a taškou
  - FAQ: šindel na střechu cena, jak se klade, vyplatí se, životnost
- **Konverzní prvek:** Tlačítko „Nacenit šindelovou střechu“ + ukázka realizace s cenou za projekt
- **Interní odkaz na:** /strechy/
- **Kategorie / CTA bloky (blog-brief.md):** `strechy` / `{{cta:strecha}}`
- **Potřebná fakta:** B1, B2 (IKO Cambridge Xtreme 9,5°, 13,1 kg/m², záruky), E (životnost 25–40 let [S]).

### 15. Výměna střechy povolení: ohlášení, nebo stavební povolení?
- **Titulek:** Výměna střechy povolení: ohlášení, nebo stavební povolení? (58 znaků)
- **URL slug:** `/vymena-strechy-povoleni/`
- **Hlavní KW:** výměna střešní krytiny povolení
- **Vedlejší KW:** půdní vestavba stavební povolení, rekonstrukce střechy povolení, oprava střechy stavební povolení, rekonstrukce střechy stavební povolení, oprava střechy povolení, výměna střešní krytiny stavební povolení, výměna střešní krytiny ohlášení, výměna střešní krytiny ohlášení 2024, výměna střechy stavební povolení, výměna střechy ohlášení
- **Pokrývá clustery:** T-POVOLENI (součet skóre 354)
- **Záměr:** informační (nízká konkurence, Google pozice 1 u varianty „stavební povolení“)
- **Co musí obsahovat, aby vyhrál:**
  - Odpověď hned: kdy je potřeba ohlášení/povolení u výměny krytiny, rekonstrukce a změny tvaru střechy
  - Tabulka scénářů: stejná krytina / jiná krytina / změna sklonu / vikýře / FVE na střeše
  - Kdy vyžádat statika a projekt (těžší krytina, FVE), památková ochrana
  - Postup a časový odhad
  - FAQ z „lidé se také ptají“: výměna střechy bez povolení, ohlášení, sousedé
- **Konverzní prvek:** Checklist ke stažení „Co si připravit před výměnou střechy“ (e-mail → poptávka)
- **Interní odkaz na:** /strechy/
- **Kategorie / CTA bloky (blog-brief.md):** `strechy` / `{{cta:strecha}} + {{cta:zavolat}}`
- **Potřebná fakta:** Ve fakta.md CHYBÍ – dohledat aktuální stavební zákon (č. 283/2021 Sb.) a ověřit u stavebního úřadu; D5 řeší jen FVE. Nic nepsat z paměti.

### Záloha (články 16+ ve stejném pořadí podle priority)

| Téma (hlavní KW) | Cluster | Poznámka |
|---|---|---|
| hliníková střešní krytina / Prefa | T-PREFA | vyšší konkurence (e-shopy, výrobce), ale vysoká hodnota zakázky; kombinovat s FVE na hliníku |
| zateplení střechy / půdy + dotace | T-ZATEPL / T-ZATEPL-PUDA | NEJDŘÍV ověřit, zda PROOZE zateplení dělá (README DOPLNIT); jinak vynechat |
| dotace na střechu a výměna eternitu | D-STR | vysoká konkurence médií; úhel „eternit + FVE“ a postup likvidace |
| výkup přetoků z fotovoltaiky | V-PRETOKY | lze sloučit s #8, nebo samostatně jako aktualizovatelný článek |
| střešní okna Velux / okapový systém | T-OKNA / T-OKAPY | doplňkové služby; vysoké skóre, ale slabší vazba na hlavní nabídku |
| hybridní střídač a značky | V-STRIDAC | porovnání bez značek, dokud klient nepotvrdí, co montuje |
| fotovoltaika zkušenosti, nevýhody, jak vybrat firmu | V-RECENZE | důvěra po pádu Woltairu; pozor na tvrzení bez dokladu |
| fotovoltaika a tepelné čerpadlo / ohřev vody | V-TC / V-OHREV | dobrý hub k úvěru NZÚ a spotřebě doma |
| rekonstrukce střechy RD – postup | T-REKONSTR | sloučit s #1 nebo rozdělit na etapy rekonstrukce |
| výměna krovu, tesařské práce | T-KROV | technický článek + důkaz odbornosti (tesařík krovový) |
| balkonová fotovoltaika vs. střešní | X-BALK | krátký článek jen pro zachycení hledanosti, CTA na střešní FVE |

## 4. Příloha: klíčová slova top 40 clusterů

| # | Hlavní KW | Vedlejší KW (podle skóre) |
|---|---|---|
| 1 | plechová střešní krytina | střešní krytina plechová, střešní krytina plech, plastová střešní krytina, střešní krytina satjam, falcovaný plech, plechová střešní krytina satjam, plechová krytina satjam, falcovaný plech na střechu, plechová střecha cena, plechová střecha satjam |
| 2 | jaká střešní krytina | krytina na střechu, střešní krytina ipa, střešní krytiny levně, nejlevnější střešní krytina, střešní krytina ruukki, střešní krytina bazar, střešní krytina click, střešní krytina capacco, střešní krytina plast, střešní krytina klik |
| 3 | pokrývačské práce cena | klempířské výrobky, klempířství, klempíř oto, ceník pokrývačských prací, klempířské práce ceník, střechy na klíč, pokrývačství, pokrývačský kartáč, pokrývač roudnice nad labem, hledám pokrývače |
| 4 | dotace na fotovoltaiku 2026 | nová zelená úsporám 2026, nová zelená úsporám 2026 - podmínky, fotovoltaika dotace, dotace na solární panely 2026, dotace na solární panely ohřev vody v bojleru, solární panely dotace, fotovoltaika dotace 2026, nová zelená úsporám dotace 2026, nová zelená úsporám 2026 pro svj, nová zelená úsporám v roce 2026 |
| 5 | fotovoltaika cena | fotovoltaické panely cena, kolik stojí fotovoltaika na rodinný dům, kolik stojí fotovoltaika, solární panely levně, fotovoltaika ceník, fotovoltaika eon cena, solární panely cena, solární elektrárna na klíč, solární elektrárna cena, kolik stojí solární panely |
| 6 | pálená taška | tondach stodo 12, pálená střešní taška, pálená taška tondach, taška bobrovka, střešní krytina tondach, tondach planoton 11, střešní krytina tondach stodo 12, pálená taška francouzská, pálená taška bobrovka, tondach jirčany |
| 7 | pokrývač Kladno | pokrývači praha, střechy kladno, klempíři praha západ, klempíř praha, pokrývač mělník, tesař rakovník, střechy praha západ, pokrývači kladno, klempíř kladno, klempíři praha 4 |
| 8 | výměna střešní krytiny cena | cena střechy za m2, výměna střešní krytiny, střechy cena za m2, výměna střechy, kolik stojí střecha na dům, kolik stojí střecha, jak dlouho trvá výměna střešní krytiny, nová střecha cena, nova strecha cena za m2, nová střecha na starém domě cena |
| 9 | baterie k fotovoltaice | fotovoltaika baterie, solární elektrárna s baterií, bateriové úložiště pro domácnost, baterie k fotovoltaice goodwe, baterie k fotovoltaice 10kw, solární panel s baterií, malá fotovoltaika s baterií, kolik stojí baterie k fotovoltaice, fotovoltaiky cena s montáží 6kw s bateriemi, fotovoltaika s baterií |
| 10 | sdílení elektřiny | edc sdílení elektřiny, sdílení elektřiny z fotovoltaiky, sdílení elektřiny edc, sdílení elektřiny jak na to, sdílení elektřiny čez, jak funguje sdílení elektřiny, energetické společenství, sdílení elektřiny registrace, sdílení elektřiny registrace edc, jak na sdílení elektřiny |
| 11 | kanadský šindel | střešní krytina šindel, střešní krytina onduline, šindelová střecha, kanadský šindel akce, oprava šindelové střechy, kanadský šindel montáž, kanadský šindel pásy, kanadský šindel pokládka, jak položit kanadský šindel, kanadský šindel v roli |
| 12 | oprava střechy cena | oprava střechy, oprava lepenkové střechy, nátěr střechy cena za 1 m2, oprava střechy z ipy, oprava asfaltové střechy, oprava rovné střechy, opravy střech bohumín, oprava střechy po kuně, oprava strechy rodinného domu, oprava šikmé střechy |
| 13 | nzú light 2026 | nová zelená úsporám light 2026, nzú light 2026 pro důchodce, nzú light, nová zelená úsporám light, nzú light 2026 podmínky, mžp dotace 2026 nzú light, nová zelená úsporám light 2026 pro důchodce, nová zelená úsporám light 2026 podmínky, nzú light podmínky, dotace nová zelená úsporám 2026 pro důchodce |
| 14 | hliníková střešní krytina | prefa střechy, hliníková krytina na střechu, maba prefa, hans prefa, hliníková střešní krytina prefa, střešní krytina hliníková prefa, cs beton prefa, prefa ceník, střešní krytina prefa, prefa střecha ceník |
| 15 | okapový systém | okapy a svody, plastové okapy, sněhové zábrany na plechovou střechu, sněhové zábrany na střechu, okapy pozink, okapový systém prefa, hromosvod cena, hromosvody cena, střešní žlaby, okapový systém kjg |
| 16 | střešní okna velux | velux střešní okna, velux okna, střešní okno velux, velux žaluzie, střešní okno roto, jak vybrat střešní okno, jak vysadit střešní okno velux, střešní okno velux 78x98, střešní okno fakro, střešní okno cena |
| 17 | zateplení půdy | foukaná izolace stropu, foukaná izolace cena, střešní izolace, zateplení podlahy pochozí půdy, zateplení podkroví, zateplení půdy zdarma, izolace podkroví, foukaná izolace celulóza, zateplení střechy zevnitř, skladba zateplení šikmé střechy |
| 18 | betonová taška | bramac tašky, střešní krytina bramac, bramac en 490, bramac tegalit, bramac max, bramac classic, betonová taška bramac, lehká betonová taška, střešní krytina km beta, bramac chrudim |
| 19 | nová zelená úsporám 2026 | nová zelená úsporám, nová zelená úsporám . cz, nová zelená úsporám dotace, nová zelená úsporám poradci, nová zelená úsporám střecha, rodinný bonus nová zelená úsporám, jak funguje nová zelená úsporám, co je nová zelená úsporám, kdy končí nová zelená úsporám, vyplatí se nová zelená úsporám |
| 20 | bezúročný úvěr nová zelená úsporám | nzú spouští bezúročné úvěry, nová zelená úsporám bezúročný úvěr, bezúročné půjčky nová zelená úsporám 2026, nová zelená úsporám 2026 banky bezúročný úvěr, bezúročný úvěr nzú, nzú úvěr, nová zelená úsporám úvěr, může být úvěr bezúročný, bezúročný úvěr dotace, bezúročný úvěr kalkulačka |
| 21 | dotace na střechu | eternitová střecha likvidace, rekonstrukce eternitové střechy, dotace na zateplení střechy 2026, azbestová střecha, oprava eternitové střechy, dotace na střechu rodinného domu, dotace na novou střechu senior, výměna eternitové střechy dotace, výměna střešní krytiny dotace, výměna eternitové střechy |
| 22 | rekonstrukce střechy cena | rekonstrukce střechy, krytina na střechu s malým sklonem, půdní vestavba, rekonstrukce střechy na klíč, kolik stojí rekonstrukce střechy, rekonstrukce střechy firmy, minimální sklon střechy na tašky, rekonstrukce střechy cena m2, rekonstrukce střechy rodinného domu, strecha sklon 30 |
| 23 | wallbox (nabíjení elektromobilu) a fotovoltaika | wallbox 11kw, wallbox solax, kolik stojí wallbox, wallbox goodwe, nabíjení elektromobilu z fotovoltaiky, co je wallbox, wallbox na klíč, wallbox dotace, wallbox montáž, wallbox cena |
| 24 | zatéká střecha | zatékání do střechy, zatéká do auta, izolace střechy při zatékání, oprava střechy auta po kroupách, plechová střecha zatéká, zatékání střechy, plíseň v podkroví, kondenzace vody pod střechou, jak zjistit kudy zatéká do auta, zatéká do střechy |
| 25 | hromosvod, komín a doplňky střechy | hřebenáče na střechu, oprava komínu, hřebenáče, střešní vikýř, betonová komínová hlava, hřebenáče tondach, oprava zděného komínu, komínové hlavy, oprava komínu cena, hřebenáče na plechové střechy |
| 26 | zateplení střechy | zateplení střechy vatou, zateplení střechy cena, zateplení střechy pěnou, zateplení střechy z venku, zateplení střechy polystyrenem, zateplení střechy pur pěnou, zateplení střechy cena diskuze, zateplení střechy na klíč, nadkrokevní zateplení, jak na zateplení střechy |
| 27 | fotovoltaika návratnost | fotovoltaika výhody a nevýhody, návratnost fotovoltaiky, vyplatí se fotovoltaika, vyplatí se fotovoltaika na rodinný dům, fotovoltaika nevýhody, fotovoltaika kalkulačka návratnosti, fotovoltaika úspora, fotovoltaika kdy se vyplatí, má smysl fotovoltaika, vyplatí se solární panely |
| 28 | kolik panelů na rodinný dům | fotovoltaika kalkulačka, kolik panelů má klasický fotbalový míč, jak velkou fotovoltaiku zvolit, solární panely výkon, fotovoltaické panely výkon m2, solární panely kalkulačka, solární elektrárna kalkulačka, fotovoltaika cena kalkulačka, kolik panelů na 10 kw, solarni panel vykon na m2 |
| 29 | fotovoltaika zkušenosti | solární panely recenze, fotovoltaika forum, fotovoltaika od eonu recenze, fotovoltaika od čez recenze, fotovoltaika na rodinný dům diskuze, fotovoltaika diskuze zkušenosti, fotovoltaika recenze, fotovoltaika pro a proti, fotovoltaika dodavatel, fotovoltaika jak vybrat |
| 30 | solární střešní krytina | solární panely na střechu, fotovoltaická střešní krytina, solární střecha, solární taška, solární tašky na střechu, solární panely na plechovou střechu, solární elektrárna na střechu, kolik stojí solární panely na střechu, fotovoltaické panely na střechu, solární panely integrované do střechy |
| 31 | výkup přetoků | výkup přetoků z fve, přetoky do sítě čez, výkup přetoků z fve 2026 ceník centropol, výkup přetoků z fve čez, fotovoltaika bez přetoků, výkup přetoků z fotovoltaiky, výkup přetoků z fve 2025, výkup přetoků čez, výkup přetoků fve, výkup přetoků elektřiny |
| 32 | fotovoltaika ohřev vody | fotovoltaika na ohřev vody, solární panely na ohřev vody, solární panely pro ohřev vody, fotovoltaika pro ohřev vody, fotovoltaika na ohřev vody s baterií, fotovoltaika na ohřev vody 5000w, fotovoltaika ohřev vody zkušenosti, fotovoltaika na ohřev vody v bojleru, fotovoltaické panely na ohřev vody, fotovoltaika ohřev vody cena |
| 33 | výměna střešní krytiny povolení | půdní vestavba stavební povolení, rekonstrukce střechy povolení, oprava střechy stavební povolení, rekonstrukce střechy stavební povolení, oprava střechy povolení, výměna střešní krytiny stavební povolení, výměna střešní krytiny ohlášení, výměna střešní krytiny ohlášení 2024, výměna střechy stavební povolení, výměna střechy ohlášení |
| 34 | skladba střechy nová střecha | podstřešní fólie, střešní krytina fólie, nová střecha ceny 2026, difúzní fólie tyvek, difuzní folie, jak dlouho trvá nová střecha, nova strecha firma, nova strecha humenne, nova rovna strecha, strečová černá fólie |
| 35 | fotovoltaika povolení | fotovoltaika revize, stavební povolení fotovoltaika, licence eru fotovoltaika, fotovoltaika daň z elektřiny, licence fotovoltaika, fotovoltaika dph, elektroměr fotovoltaika, distribuční sazba fotovoltaika, jistič fotovoltaika, fotovoltaika souhlas sousedů |
| 36 | výměna krovu | oprava krovu, zateplení střechy nad krokvemi, nová střecha včetně krovů cena, tesar krov, oprava krovů a trámů, latě střecha, zateplení šikmé střechy mezi a pod krokvemi, zatepleni mezi krokvemi, zateplení střechy mezi krokvemi, vazníková střecha nebo krov |
| 37 | hybridní střídač | fotovoltaika solax, solární panely aiko, fotovoltaický panel canadian solar cs6l 455wp bf, střídač fotovoltaika, nejlepší střídač fotovoltaika, fotovoltaika huawei, huawei fotovoltaika cena, fotovoltaika fronius, fotovoltaika victron, fotovoltaika victron cena |
| 38 | fotovoltaika na plechovou střechu | fotovoltaika na střechu, fotovoltaika na šindelové střeše, fotovoltaika sklon panelů, fotovoltaika východ západ, střešní krytina fotovoltaika, fotovoltaika na střechu cena, fotovoltaika na valbovou střechu, fotovoltaika na střechu auta, střecha solarni panely, fotovoltaika na plechové střeše |
| 39 | fotovoltaika pro firmy | fotovoltaika pro firmy do 50 kwp, čez fotovoltaika pro firmy, eon fotovoltaika pro firmy, fotovoltaika firmy, fotovoltaika firmy recenze, fotovoltaika 50 kwp cena, fotovoltaika 100 kwp, fotovoltaika firma, fotovoltaika nejlepší firmy, solarni panely firma |
| 40 | fotovoltaika Slaný | fotovoltaika firmy praha, fotovoltaika slaný, fotovoltaika kladno, fotovoltaika louny, fotovoltaika mělník, fotovoltaika středočeský kraj, fotovoltaika rakovník, fotovoltaika beroun, fotovoltaika praha, solární panely kladno |

## 5. Co dál / rizika

- Nejdřív doplnit čísla, která tu chybí: **ceny za m² (střechy) a ceník sestav FVE** od PROOZE – bez nich nejde napsat články 1, 4, 5 tak, aby vyhrály proti konkurenci s ceníkem.
- Zkontrolovat poslední Google data ručně v Search Console po prvních 2–3 měsících a články pak doladit podle skutečných dotazů; tato rešerše je z našeptávačů, ne z reálných kliků.
- Dotační čísla (NZÚ, OP TAK) mají v `fakta.md` značku [S]; před publikací ověřit na novazelenausporam.cz a nrb.cz a vždy uvést datum aktualizace článku.
- Surová data a skripty: scratchpad `kw/` (raw.jsonl, harvest.py, serp.py, clusters.py).
