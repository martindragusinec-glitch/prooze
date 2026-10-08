# PROOZE – audit webu z pohledu poptávek

Stav k 8. 10. 2026, http://localhost:8801/. Testováno v Chrome (playwright-core) na 1440×900 a 390×844, axe-core (wcag2a/aa, wcag21aa, wcag22aa, best-practice), průchod klávesnicí, kvíz, kalkulačka, konfigurátor. Skripty a screenshoty jsou v `scratchpad/audit/` (`scan.mjs`, `interact.mjs`, `check2.mjs`).

Pozor: web se během auditu paralelně měnil (přibyl callback modal, `/dekujeme/`, JSON-LD, canonical). Nálezy odpovídají stavu v době testu. Seznam DOPLNIT z README jsem neřešil.

**Co je v pořádku:** axe na desktopu hlásí 0 nálezů, na mobilu 2. Každá stránka má právě jeden H1. Funguje skip link, viditelný focus (3px), záložky se šipkami, FAQ přes `<details>`, Esc zavírá menu. Nikde nevzniká horizontální scroll. Délky title (31–64 znaků) i description (118–155 znaků) jsou v normě.

**Hlavní ztráty poptávek:** dvě chyby kvízu, které zastaví vyplňování (jedna právě v cestě z kalkulačky), mobilní CTA přistane mimo kvíz, web neukazuje žádný ověřitelný důkaz ani cenu a dotační sliby jsou silnější, než co program NZÚ 2026 nabízí.

---

## P1 – opravit hned

### 1. Kvíz se zasekne na předvyplněné odpovědi (kalkulačka → poptávka, tlačítko Zpět)
- **Kde:** formulář `#poptavka` na všech stránkách, `site.js`, posluchač `quiz.addEventListener('change', …)`.
- **Problém:** krok se posune jen při události `change`. Ověřený postup na /fotovoltaika/: kalkulačka 5 000 Kč → „Chci přesný výpočet zdarma“ → krok „O jakou stavbu jde?“ → v kroku „Kolik teď platíte“ je pásmo 4 000–7 000 Kč už vybrané. Klik na ně nic neudělá, protože `change` nevznikne, a tlačítko „Další“ ve formuláři chybí. Člověk z nejteplejšího vstupu uvízne. Stejně se formulář chová po „Zpět“: když znovu kliknete na stejnou volbu, nic se nestane.
- **Oprava:** krok posouvat při `click` na `label.opt`, který nastane i u už zaškrtnuté volby. Předvyplněné kroky přeskočit: z kalkulačky jde rovnou objekt → kontakt. Pokud je v kroku něco vybrané, zobrazit tlačítko „Pokračovat“.

### 2. Kvíz z klávesnice sám přeskakuje kroky
- **Kde:** stejný posluchač, `setTimeout(next, 220)`.
- **Problém:** šipka v radio skupině volbu rovnou vybere a krok odešle. Jedna šipka dolů tak odešle „Fotovoltaiku“. Dvě rychlé šipky vyberou „Obojí“ a zavolají `next()` dvakrát: formulář přeskočí krok „O jakou stavbu jde?“ a skončí na „Krok 3 z 5“ bez vyplněného objektu (ověřeno). Do CRM pak přijde neúplná poptávka. Jde o porušení WCAG 3.2.2 (On Input).
- **Oprava:** automaticky posouvat jen po kliknutí myší nebo prstem (`pointerdown`/`click` s `e.detail > 0`). Pro klávesnici posouvat Enterem nebo tlačítkem „Pokračovat“. Před každým novým `setTimeout` zrušit ten předchozí, aby se `next()` nespustil dvakrát.

### 3. Na mobilu přistane CTA nad kvízem, ne na něm
- **Kde:** volby v hero („Střechu / Fotovoltaiku / Obojí“), dock „Chci nabídku“, hlavička. Všechny vedou na `#poptavka`. Screenshot `m-pick-landing.png`.
- **Problém:** na 390×844 zabere po kliknutí celou obrazovku úvod formuláře (nadpis, odstavec, 3 odrážky a karta s Pavlem). Otázka začíná až kolem y ≈ 680 px a vidět je jen 1 ze 4 možností. Uživatel kliknul „chci“ a nevidí, co má dělat dál.
- **Oprava:** na šířce ≤ 860 px skrolovat na `.quiz`, ne na začátek sekce (`scroll-margin-top` = výška hlavičky). Případně na mobilu přesunout `.lead__trust` a `.lead__call` pod kvíz a odstavec zkrátit na „Pár otázek a kontakt. Zdarma a nezávazně.“

### 4. Žádný ověřitelný důkaz a na web ani není kam ho dát
- **Kde:** všechny stránky.
- **Problém:** reference a recenze jsou známé DOPLNIT. Kromě nich ale chybí i struktura, kam je dát, a další signály důvěry, které na seznamu nejsou: pojištění odpovědnosti, oprávnění §10d (podmínka NZÚ), platební podmínky (záloha nebo platba po etapách) a počet hotových zakázek. Fotky jsou generované AI, přitom alt texty i kontext je podávají jako vlastní práci („Dva pokrývači pokládají novou pálenou krytinu“). Po pádu Woltairu je trh na důvěru citlivý (viz rešerše).
- **Oprava:**
  - Hned teď připravit sekci „Naše realizace“ pod bento na úvodu a na /strechy/ a /fotovoltaika/. Karta obsahuje obec, rok, krytinu nebo kWp, foto a jednu větu zákazníka, plus CTA „Chci podobnou střechu“ s `data-pick`.
  - Do hero proof a k formuláři přidat místo pro hodnocení: „4,9 ★ · XX recenzí na Google“.
  - Do bento nebo do údajů o firmě doplnit, co platí: „Pojištění odpovědnosti do X mil. Kč“, „Oprávnění k instalacím s podporou NZÚ (§10d)“, „Platba po etapách, žádná velká záloha“.
  - Dokud nejsou reálné fotky, nedávat k AI fotkám popisky typu „naše zakázka“.

### 5. Bez cenové kotvy
- **Kde:** FAQ „Kolik stojí…“ na úvodu i na /strechy/, sekce FVE, formulář „Zjistěte, kolik to bude stát“.
- **Problém:** formulář slibuje „kolik to bude stát“, ale web nedá ani rozpětí. FAQ odpovídá „až po prohlídce“, a to je typické místo, kde lidé odcházejí. Podle rešerše konkurence u střech ceny nemá vůbec a u FVE je ukazuje jako „od“ (INER, Solar Baron). Je to nejlevnější způsob, jak se odlišit.
- **Oprava:** cenová čísla dodá klient. Na /strechy/ dát tabulku „Orientační ceny“ s cenou za m² s DPH (výměna krytiny podle typu, oprava od X Kč, nová střecha od X Kč) a pod ni větu „Přesnou cenu dostanete po zaměření, zdarma“. Na /fotovoltaika/ 3 balíčky pro RD, například 5 kWp + 5 kWh, 7 kWp + 7 kWh a 10 kWp + 10 kWh, s cenou „od … Kč s DPH“ a výší úvěru NZÚ. Do FAQ nová odpověď: „Výměna krytiny vychází obvykle na X–Y Kč/m² podle typu, elektrárna 7 kWp s baterií od X Kč. Přesnou cenu spočítáme po prohlídce, zdarma.“

### 6. Dotační sliby jsou silnější než realita NZÚ 2026
- **Kde:** hero proof, odrážky u formuláře na každé stránce, blok grant, úvodní sekce FVE, meta description úvodu.
- **Problém:** většina RD dostane jen bezúročný úvěr přes banku a bonitu posuzuje banka. „Dotaci vyřídíme za vás“ a „Stát přidá“ slibují přímé peníze. Při prvním telefonátu vznikne zklamání a hrozí i reklamační riziko (rešerše, bod 2.7).
- **Oprava (nové texty):**
  - Hero proof „Dotaci vyřídíme za vás“ → **„Pomůžeme s úvěrem i dotací NZÚ“**
  - Odrážka u formuláře „Dotace vyřídíme za vás“ → **„Žádost o úvěr nebo dotaci NZÚ připravíme za vás“**
  - Grant H2 „Stát přidá. Papíry vyřídíme my.“ → **„Úroky zaplatí stát. Papíry vyřídíme my.“**
  - Podnadpis grantu „…a žádost podáme za vás. Vy jen podepíšete.“ → **„…a připravíme žádost i podklady pro banku. O úvěru rozhoduje banka, o dotaci SFŽP.“**
  - Úvod, sekce FVE: „Účty za elektřinu klesnou až o 70 %.“ → **„Za elektřinu ze sítě zaplatíte až o 70 % méně.“** (Stálé platby za jistič a distribuci zůstávají.)
  - NZÚ Light „Peníze dostanete předem, ještě před začátkem prací.“ → **„Dotace se vyplácí zálohově po schválení žádosti, takže nemusíte všechno předfinancovat.“** (Výši zálohy rešerše neověřila.)
  - Meta description úvodu „panely s baterií a dotací“ → **„panely s baterií a bezúročným úvěrem NZÚ“**

---

## P2 – důležité

### 7. Konfigurátor na mobilu: dock zakrývá CTA a konfiguraci nepřenese
- **Kde:** /konfigurator/ a úvod, 390×844. Screenshoty `m-konf-sticky1.png` a `m-konf-sticky2.png`.
- **Problém:** dock „Chci nabídku“ leží přes „Chci nabídku na tuhle střechu“. Dock má jen `data-cta="dock"` bez předvyplnění, takže kdo klikne na něj, ztratí poskládanou střechu. Sticky 3D náhled (232 px), hlavička (72 px) a dock (70 px) zaberou 44 % výšky. Volby podjíždějí pod náhled a v mezeře mezi hlavičkou a náhledem jsou vidět useknuté chipy.
- **Oprava:** dock skrýt, i když je na obrazovce `[data-konf]` (stejný IntersectionObserver jako u formuláře). Na šířce ≤ 560 px zmenšit náhled na zhruba 170 px výšky a mezeru mezi hlavičkou a náhledem zavřít (`top: var(--top-h)` a pozadí `--mist`).

### 8. Konfigurátor: „Větší – 22 panelů“ na valbě dá stejný výsledek jako „Střední“
- **Kde:** /konfigurator/ s valbovou střechou a volbou „Větší“. Screenshot `konf-valba22-d.png`.
- **Problém:** chip „22 panelů, 9,9 kWp“ zůstane vybraný, ale 3D model i souhrn ukážou 14 panelů a 6,3 kWp. Uživatel neví proč a výsledek působí jako chyba.
- **Oprava:** pod volbou zobrazit hlášku: **„Na valbovou střechu tohoto domu se vejde 14 panelů (6,3 kWp). Větší výkon navrhneme po zaměření, třeba i na garáž nebo pergolu.“** Popisky chipů přepočítat podle tvaru střechy, nebo nedostupnou volbu zneplatnit.

### 9. Úvodní stránka je moc dlouhá a formulář je až ve ¾ délky
- **Kde:** úvod. 13 sekcí, 13 400 px na desktopu a 17 500 px na mobilu.
- **Problém:** krytiny se ukazují 3× (karta v hero, záložky, pás log). Grant, servis i konfigurátor jsou na úvodu v plné délce. Formulář leží až za 10 sekcemi.
- **Oprava, navržené pořadí:** hero → slib (bento) → realizace (nové, bod 4) → střechy (bez boxu „Děláme střechy na“) → **combo** (bod 10) → segmenty FVE → kalkulačka → postup → formulář → FAQ → závěrečná výzva.
  - Pás `brands` z úvodu vyřadit (loga jsou v záložkách).
  - `servis` nechat jen na /fotovoltaika/.
  - Konfigurátor nahradit kartou s náhledem a odkazem „Poskládat si střechu“. Úvod pak nebude načítat Three.js.
  - Grant zkrátit na jednu kartu „až 400 000 Kč bez úroků“ s odkazem na /dotace/.

### 10. Hlavní USP nemá na úvodu vlastní sekci
- **Kde:** úvod. Hero slibuje „Jedno lešení, jedna smlouva, jedna záruka“ a třetí volba kvízu je „Obojí najednou“.
- **Problém:** blok `combo` („Měníte střechu? Dejte na ni rovnou panely.“) je jen na /strechy/, /fotovoltaika/ a /konfigurator/. Hero tak na úvodu nic nerozvádí.
- **Oprava:** vložit `{{> combo}}` na úvod hned za sekci FVE. Do combo přidat jedno číslo, například „Jedno lešení ušetří obvykle X Kč“ (dodá klient).

### 11. Chybové hlášky formuláře
- **Kde:** krok „Komu máme zavolat?“. Screenshot `quiz-err-d.png`.
- **Problém:** pod tlačítkem je jen jedna souhrnná věta („Zkontrolujte prosím: jméno, telefon (9 číslic), PSČ (5 číslic).“). Pole nemají vlastní text ani `aria-describedby`. Telefon ve tvaru `00420 777 123 456` formulář odmítne.
- **Oprava:** hlášku dát pod každé pole a propojit ji přes `aria-describedby`:
  - Jméno: „Napište, jak vám máme říkat.“
  - Telefon: „Telefon zadejte jako 9 číslic, třeba 777 123 456.“
  - PSČ: „PSČ má 5 číslic, třeba 274 01.“
  
  Regex telefonu změnit na `^(\+|00)?(420)?\d{9}$`. Po chybě odeslání se tlačítko přejmenuje na „Odeslat poptávku“; vracet místo toho původní text „Chci nabídku zdarma“.

### 12. Povinné PSČ zbytečně brzdí
- **Kde:** pole „PSČ stavby“ (`required`, regex na 5 číslic).
- **Problém:** kdo PSČ chalupy nebo stavby nezná, formulář neodešle. Pro kvalifikaci stačí obec.
- **Oprava:** pole přejmenovat na **„Obec nebo PSČ stavby“** a jako jedinou podmínku nechat aspoň 2 znaky.

### 13. Po odeslání: nesoulad v době odezvy a chybí další krok
- **Kde:** potvrzení „Hotovo, poptávka je u nás“, callback modal, všechny texty „do 24 hodin“ (12 výskytů).
- **Problém:** potvrzení říká „Do 24 hodin vám zavoláme“, modal „Obvykle ještě týž den“. O víkendu nesplnitelné. Potvrzení navíc nedá člověku nic, co by mohl udělat dál.
- **Oprava:** všude sjednotit na **„Ozveme se nejpozději další pracovní den, obvykle ještě týž den.“** Do potvrzení přidat: **„Mezitím nám můžete poslat fotky střechy nebo vyúčtování za elektřinu na info@prooze.cz. Nabídku pak připravíme rychleji.“**

### 14. Kalkulačka a konfigurátor posílají do zbytečně dlouhého kvízu
- **Kde:** `prefill()` v `site.js`.
- **Problém:** konfigurátor přepne na „Krok 2 z 5“ a znovu se ptá na stav střechy i na spotřebu, i když poznámku s konfigurací už má. Kalkulačka se znovu ptá na spotřebu, kterou zná (a právě tam vzniká zaseknutí z bodu 1).
- **Oprava:** po předvyplnění zobrazit jen krok objekt a pak kontakt. Odpovědi z kalkulačky nebo konfigurátoru ukázat jako shrnutí nad poli („Vaše volba: FVE 7 kWp + baterie, rodinný dům“).

### 15. Mrtvé CTA na stránce Ochrana osobních údajů
- **Kde:** /ochrana-osobnich-udaju/, tlačítko „Chci nabídku“ v hlavičce, v mobilním menu a v docku.
- **Problém:** všechna vedou na `#poptavka`, který na stránce není, takže se nic nestane.
- **Oprava:** na stránkách bez formuláře odkazovat na `/kontakt/#poptavka`, nebo stránku doplnit o `{{> lead}}`.

### 16. Mobilní ikona telefonu nemá přístupný název
- **Kde:** `.top__tel` na všech 8 stránkách, axe **serious** `link-name`.
- **Problém:** `<span>` s číslem má pod 640 px `display:none`, takže odkaz nemá text.
- **Oprava:** na odkaz přidat `aria-label="Zavolat 773 898 698"`.

### 17. Termín bez měřitelného slibu
- **Kde:** dlaždice bento „Termíny, které platí“.
- **Problém:** nadpis tvrdí „platí“, ale nic nezaručuje. Podle rešerše zabírá měřitelná garance (Solar Brothers: 60 dní, 1 000 Kč/den).
- **Oprava (jen pokud klient potvrdí):** **„Termín píšeme do smlouvy. Když ho kvůli nám nestihneme, dostanete slevu X Kč za každý den zpoždění.“** U FVE upravit „do 2–3 měsíců“ na **„obvykle do 2–3 měsíců, podle toho, jak rychle připojí distributor“**.

### 18. H1 a lokální SEO
- **Kde:** /strechy/ a úvod.
- **Problém:** H1 na /strechy/ („Střechy, na kterých se dá stavět“) je stejný jako H2 na úvodu a nemá klíčová slova. H1 úvodu nemá lokalitu, Slaný je jen v title.
- **Oprava:**
  - H1 na /strechy/ → **„Šikmé střechy: oprava, výměna krytiny i nová střecha“**. Současný claim přesunout do perexu.
  - Skrytá část H1 na úvodu (sr-only) → **„Střechy a fotovoltaika, Slaný a okolí.“**
  - Podnadpis na /fotovoltaika/ doplnit o „…pro rodinné domy ve Středních Čechách“, jakmile bude potvrzená oblast působnosti.

### 19. Čísla na stránce O nás
- **Kde:** pás „PROOZE v číslech“.
- **Problém:**
  - „25 let – záruka na panely“ je záruka výrobce, ne firmy.
  - „6 výrobců krytin“ neříká nic o kvalitě.
  - „24 h – a ozveme se vám“ je nesmyslný tvar.
- **Oprava:**
  - **„2011 / na trhu od roku“**
  - **„XX / střech a elektráren hotových za posledních 5 let“** (dodá klient)
  - **„X lidí / v partě, žádní subdodavatelé na střeše“** (jen pokud platí)
  - **„24 h / nejpozději se vám ozveme“**

### 20. Kalkulačka v krajních hodnotách
- **Kde:** blok `#kalkulacka`, posuvník 800–12 000 Kč. Screenshoty `calc-800-d.png` a `calc-12000-d.png`.
- **Problém:**
  - **12 000 Kč** → „15 kWp + baterie 15 kWh, 34 panelů, 75 m²“. U RD je to nereálné (připojení i plocha střechy). Úspora 67 500 Kč (47 %) navíc nesedí s „až 70 %“ hned vedle.
  - **800 Kč** → 3 kWp na spotřebu 1 600 kWh/rok, tedy elektrárna vyrobí 2× víc, než dům spotřebuje.
- **Oprava:**
  - Doporučení omezit na 10 kWp. Nad touto hranicí zobrazit **„Při takové spotřebě (tepelné čerpadlo, elektrokotel) navrhneme elektrárnu individuálně.“**
  - Pod 1 500 Kč/měsíc zobrazit **„Při nízké spotřebě se často víc vyplatí fotovoltaika na ohřev vody. Rádi spočítáme obojí.“**
  - Poznámku pod kalkulačkou změnit na „úspora na elektřině ze sítě až 70 %“.

---

## P3 – doladit

### 21. axe `region`: dock je mimo landmark
- **Kde:** `.dock`, všechny stránky na mobilu.
- **Oprava:** obalit do `<nav aria-label="Rychlý kontakt">`.

### 22. 3D konfigurátor nemá textovou alternativu
- **Problém:** SVG s `<title>` se po načtení 3D schová (`visibility:hidden`) a `<canvas>` nemá popis.
- **Oprava:** canvas dostane `role="img"` a `aria-label` s textem z `data-k-sum`. Zařídí to stejný kód, který dnes plní `data-k-alt`.

### 23. Záložky podle vzoru WAI-ARIA
- **Problém:** chybí Home/End. Záložky krytin jsou na desktopu svislé, ale fungují jen šipky ←/→.
- **Oprava:** přidat Home/End, u `.mats__tabs` nastavit `aria-orientation="vertical"` a přidat šipky ↑/↓.

### 24. „Krok 1 z 4“ → „Krok 1 ze 4“
- **Problém:** HTML má správně „ze 4“, ale `show()` v `site.js` píše vždy „z“.
- **Oprava:** `` `Krok ${i + 1} ${f.length === 4 ? 'ze' : 'z'} ${f.length}` ``.

### 25. Nezlomitelné mezery
- **Problém:** na mobilu se láme „773 / 898 698“ (podnadpis FAQ) a „Do 24 / hodin“ (úvod formuláře). Souhrn konfigurátoru generovaný v JS píše „s baterií“ s obyčejnou mezerou.
- **Oprava:** všude `773&nbsp;898&nbsp;698` a `24&nbsp;hodin`. V `site.js` použít `s baterií`. Ostatní jednopísmenné předložky v HTML jsou ošetřené.

### 26. Názvy CTA a terminologie
- CTA „Chci nabídku na FVE“ → **„Chci nabídku na fotovoltaiku“**. Laik zkratku nezná, FVE nechat jen v obřím nápisu.
- Menu „Dotace“ a v mobilu i patičce „Dotace 2026“: sjednotit na **„Dotace 2026“**.
- „Nezávazná poptávka“, „Chci nabídku zdarma“ a „Odeslat poptávku“ sjednotit na **„Chci nabídku zdarma“**.

### 27. CTA v hlavičce a docku na podstránkách nepředvyplní službu
- **Oprava:** na /strechy/ přidat `data-pick="strecha"`, na /fotovoltaika/ `data-pick="fve"`. Kvíz pak začne rovnou od 2. kroku.

### 28. Stránka Fotovoltaika míchá RD a firmy
- **Problém:** karty „Elektrárny pro firmy 20/50/100 kWp“ stojí před kalkulačkou pro RD. Štítek „Nejčastější volba“ u 50 kWp ničím nepodložený.
- **Oprava:** blok přesunout pod grant, nebo z něj udělat kotvu „Pro firmy“. Štítek odstranit.

### 29. Absolutní sliby
- „Pod panely nezateče“ → **„Pod panely nezateče. Ručíme za to zárukou na montáž.“** Platí jen s potvrzenou zárukou.

### 30. Interní prolinkování
- **Problém:** FAQ na /strechy/ odkazuje „podrobnosti najdete na stránce Dotace“ bez odkazu. Služby (oprava, rekonstrukce, výměna krytiny) nemají vlastní URL.
- **Oprava:** prolinkovat na /dotace/. Do budoucna zvážit podstránky typu `/strechy/vymena-krytiny/` pro long-tail hledání.

### 31. Patička
- **Problém:** nadpisy H2 „Kontakt / Sídlo / Web“ zaplňují osnovu stránky a chybí v ní oblast působnosti.
- **Oprava:** „Web“ → „Stránky“. Přidat řádek **„Působíme: Slaný, Kladno, Louny, Kralupy nad Vltavou, Praha-západ…“** (přesný seznam podle DOPLNIT).

### 32. Kontakt: slib přílohy, kterou formulář neumí
- **Problém:** u e-mailu stojí „Fotky střechy klidně přiložte“, ale formulář přílohu nepřijme a chybí i provozní doba.
- **Oprava:** přidat řádek **„Po–Pá 7–17 h, jinak nechte číslo a zavoláme“** (hodiny dodá klient). Do kvízu dát volitelné nahrání fotek, nebo odkaz na e-mail v potvrzení (bod 13).

### 33. Title stránky Dotace má 64 znaků
- **Oprava:** **„Dotace a bezúročný úvěr NZÚ 2026 na FVE a střechu | PROOZE“** (58 znaků).

### 34. Prázdné místo v kartě kvízu
- **Problém:** v 1. kroku je na desktopu pod volbami zhruba 140 px prázdné bílé plochy. Tvoří ji `min-height: 262px` na `.quiz__stage` a prázdná patička `.quiz__foot` (36 px), která v 1. kroku nemá obsah.
- **Oprava:** `.quiz__foot` v 1. kroku skrýt (`:empty` nebo `hidden`) a do patičky dát mikro-důvěru **„Zabere to 30 sekund. Nic neplatíte.“**

### 35. Krajní stavy kvízu
- **Problém:** v potvrzení zmizí „Vaše volba“ i „Zpět“, takže chybu v čísle nejde opravit.
- **Oprava:** do potvrzení přidat řádek **„Spletli jste se v čísle? Zavolejte na 773 898 698.“** Nebo použít callback modal.

### 36. Opakované věty napříč webem
- Věta „Výkon navrhneme podle vaší spotřeby, ne podle toho, co máme na skladě“ je 3× a „vyřídíme za vás“ 8×. Segmenty FVE na úvodu a na /fotovoltaika/ mají identický text.
- **Oprava:** na /fotovoltaika/ přepsat texty segmentů konkrétněji. Například u RD: **„Typicky 5–10 kWp s baterií. Navrhneme ji podle vašeho vyúčtování a výše úvěru NZÚ.“**
