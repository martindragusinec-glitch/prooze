# Starý web prooze.cz – vytěžený obsah (stav k 8. 10. 2026)

Zdroj: https://www.prooze.cz/ (přesměruje na https://www.prooze.cz/cs/). Vytěženo přes curl (HTML, CSS, JS) + vestavěný prohlížeč (computed styles, screenshot). Vše níže je 1:1 z webu; co na webu není, je označeno „neuvedeno“. Údaje z jiného zdroje než web jsou výslovně označeny.

---

## 0. Rozsah a struktura webu

- Web je malý, jednojazyčný (jen `/cs/`), 4 stránky. Žádný blog, žádný ceník, žádné reference, žádná stránka „O nás“, žádná samostatná stránka Kontakt (kontakt je sekce s formulářem na konci každé stránky, kotva `#formular`).
- `robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://www.prooze.cz/cs/sitemap.xml`
- `sitemap.xml` (https://www.prooze.cz/cs/sitemap.xml) obsahuje přesně 4 URL:
  1. https://www.prooze.cz/cs/
  2. https://www.prooze.cz/cs/fotovoltaika-pro-domacnosti/
  3. https://www.prooze.cz/cs/fotovoltaika-pro-firmy/
  4. https://www.prooze.cz/cs/fotovoltaika-pro-obce/
- (`https://www.prooze.cz/sitemap.xml` vrací 404 stránku hostingu „WEBLANTIS – Tuto stránku se nám nepodařilo najít.“)

### Menu (hlavička, desktop i mobil stejné)
`Domů` (/cs/) · `Rodinné domy` (/cs/fotovoltaika-pro-domacnosti) · `Firmy` (/cs/fotovoltaika-pro-firmy) · `Pro obce` (/cs/fotovoltaika-pro-obce) · tlačítko `Nezávazná nabídka` (/cs/#formular). Vlevo logo (odkaz na /cs/).

### Patička (na všech stránkách stejná)
- Logo (stejné SVG jako v hlavičce)
- Text: „Jsme spolehlivým partnerem pro vaše energetická řešení. Nabízíme komplexní služby v oblasti fotovoltaických systémů a úspor energií.“
- „© 2025 Vaše firma. Všechna práva vyhrazena.“ (placeholder „Vaše firma“ je skutečně na webu)
- „Tomanova 1630, 274 01 Slaný“ · „IČO 88327078“
- Odkaz „Zásady ochrany osobních údajů (GDPR)“ – href je `javascript:void(0)/` (nevede nikam, žádný text zásad na webu není)
- „Made with ♥ by Weblantis“ (odkaz https://www.weblantis.cz)
- Žádné odkazy na sociální sítě, žádné `tel:`/`mailto:` odkazy (telefon i e-mail jsou jen text).

### Meta (title / description)
| Stránka | `<title>` | meta description |
|---|---|---|
| /cs/ | PROOZE.CZ - Fotovoltaické elektrárny pro domácnosti a firmy | Kvalitní fotovoltaika, vyřešíme dotace a veškerou administrativu. |
| /cs/fotovoltaika-pro-domacnosti/ | Fotovoltaika pro domácnosti | Fotovoltaika pro domácnosti |
| /cs/fotovoltaika-pro-firmy/ | Fotovoltaika pro firmy | Fotovoltaika pro firmy |
| /cs/fotovoltaika-pro-obce/ | Fotovoltaika pro obce | Fotovoltaika pro obce |

og:title a og:description = totéž jako title/description. og:image neuvedeno. Canonical = vlastní URL každé stránky.

---

## 1. Firma

| Položka | Hodnota na webu |
|---|---|
| Název (logo / title) | PROOZE (logo), „PROOZE.CZ“ (title). Přesný obchodní název/právní forma na webu **neuvedeno** (v patičce je jen placeholder „Vaše firma“). |
| IČO | 88327078 |
| DIČ | neuvedeno |
| Sídlo | Tomanova 1630, 274 01 Slaný |
| Provozovny / pobočky | neuvedeno |
| Telefon | +420 773 898 698 (u kontaktní osoby Pavel Kočí, CEO) |
| E-mail | info@prooze.cz |
| Kontaktní osoba | Pavel Kočí, „CEO“ (fotka 200×200) |
| Otevírací doba | neuvedeno |
| Sociální sítě | neuvedeno |
| Region působnosti | neuvedeno (formulář sbírá PSČ, region nikde není vyjmenován) |
| Počet let na trhu / počet realizací | neuvedeno |

**Mimo web – veřejný rejstřík ARES (IČO 88327078, stav dat aktualizace 2025-03-20):** obchodní jméno „Pavel Kočí“, právní forma 101 (fyzická osoba podnikající dle živnostenského zákona), sídlo Tomanova 1630, 27401 Slaný (okres Kladno, Středočeský kraj), datum vzniku 2011-12-12; CZ-NACE: 471, 261, 43210, 952, 00; registrace v DPH rejstříku v ARES: neexistující (DIČ v ARES neuvedeno). Toto NENÍ z webu, jen ověření IČO.

---

## 2. Služby FVE

Web nabízí **tři segmenty** (Rodinné domy / Firmy / Obce). **Žádná cena v Kč není uvedena nikde na webu** (ani s DPH, ani bez, ani s dotací). Žádné konkrétní balíčky pro domácnosti (kWp, počet panelů, model střídače, kapacita baterie) – neuvedeno. Žádný wallbox, žádný ohřev vody – neuvedeno.

### 2.1 Rodinné domy (/cs/fotovoltaika-pro-domacnosti/)
- H1: „Fotovoltaika pro vaši domácnost“ + podtitul „s dotací až 147 000 Kč“
- Lead: „Získejte vlastní zdroj energie, snižte účty za elektřinu až o 70 % a zajistěte si energetickou nezávislost s návratností již od 5 let.“
- CTA: „Získejte nabídku na míru“ (→ #formular)
- Hero badges: „Dotace až 147 000 Kč“ · „98 % spokojených zákazníků“ · „25 let záruka“
- Sekce „PROČ SI POŘÍDIT SOLÁRNÍ PANELY?“ / H2 „Výhody fotovoltaiky pro rodinný dům“:
  - **Soběstačnost** – „S bateriovým úložištěm budete mít dostatek energie i během výpadku elektřiny či špatného počasí. Zvýšíte si komfort a nezávislost.“
  - **Energetická nezávislost** – „Investice do solárního systému vás ochrání před neustálým zdražováním od dodavatelů energie a zajistí vám dlouhodobé úspory.“
  - **Čistá energie** – „Fotovoltaika přeměňuje sluneční energii na elektřinu bez emisí, přispívá k ochraně klimatu a snižuje závislost na fosilních palivech.“
  - CTA „Nezávazná poptávka“
- Sekce „Získejte to nejlepší“ (viz 2.4)
- Časová osa procesu (viz 2.5), partneři (viz 4), formulář.
- Dotace: pouze „až 147 000 Kč“ v H1 a badge; název programu (NZÚ apod.) na webu **neuvedeno**.

### 2.2 Firmy (/cs/fotovoltaika-pro-firmy/)
- H1: „Fotovoltaika pro firmy s dotací až 50 % a bezúročným úvěrem“
- Lead: „Získejte vlastní zdroj energie, snižte účty za elektřinu až o 70 % a zajistěte si energetickou nezávislost s návratností již od 2 let.“
- CTA: „Získejte nabídku na míru“
- Hero badges: „Vysoké dotace dle rozsahu zakázky“ · „99,9% spokojených zákazníků“ · „25 let záruka“
- Sekce „ŘEŠENÍ PRO VAŠI FIRMU“ / H2 „Fotovoltaické elektrárny pro vaše podnikání“: „Vyberte si optimální řešení podle vašich energetických potřeb a dostupné plochy. Nabízíme fotovoltaické systémy s vysokou účinností a spolehlivostí.“

**Tři „sestavy“ FVE pro firmy (jediné konkrétní produkty na webu; cena neuvedeno u všech):**

| | FVE - 20 kWp | FVE - 50 kWp (štítek „Nejprodávanější“) | FVE - 100 kWp |
|---|---|---|---|
| Popis | „Ideální řešení pro menší podnikání nebo provozovny s nižší spotřebou energie.“ | „Optimální řešení pro středně velké firmy s vyvážením investičních nákladů a výrobní kapacity.“ | „Výkonné řešení pro větší společnosti s vysokou spotřebou energie a dostatečnou plochou pro instalaci.“ |
| Výkon | 20 kWp | 50 kWp | 100 kWp |
| Roční výroba | až 20 000 kWh | až 50 000 kWh | až 100 000 kWh |
| Plocha instalace | cca 110 m² | cca 270 m² | cca 550 m² |
| Ušetřené emise CO₂ | 9 tun ročně | 22 tun ročně | 45 tun ročně |
| Vhodné pro | menší provozovny, obchody | výrobní podniky, sklady | průmyslové objekty, logistická centra |
| Cena | neuvedeno | neuvedeno | neuvedeno |
| Panely / střídač / baterie | neuvedeno | neuvedeno | neuvedeno |
| CTA | „Získat nabídku“ (odkaz vede na /cs/fotovoltaika-pro-obce/#formular – chyba odkazu na webu) | „Získat nabídku“ (/cs/fotovoltaika-pro-firmy/#formular) | „Získat nabídku“ (/cs/fotovoltaika-pro-firmy/#formular) |

**Dotační sekce firmy** – štítek „DOTAČNÍ PROGRAMY“, H2 „Nová dotace na fotovoltaiku s bezúročným úvěrem“:
„Nová výzva zajišťující dotace pro FVE do 50 kWp vám poskytne finance až na 30 % z ceny fotovoltaiky a až na 50 % z ceny bateriového úložiště. Zbytek až do výše 90 % výdajů projektu se zaplatí ze zvýhodněného bezúročného úvěru.“
Tři čísla: „30%“ Dotace na fotovoltaiku · „50%“ Dotace na baterie · „0%“ Úrok na financování. CTA „Získat nabídku s dotací“. Název programu (např. NZÚ, OP TAK, Modernizační fond) na webu **neuvedeno**.

**Výhody firmy** (štítek „PROČ SI POŘÍDIT FOTOVOLTAIKU PRO FIRMU?“, H2 „Výhody fotovoltaiky pro firmy“):
- Komplexní služby – „Fotovoltaické elektrárny navrhujeme na míru a o vše se staráme od A do Z. Od návrhu přes instalaci, vyřízení dotací až po servis a údržbu.“
- Bezpečná investice – „Pořízení solárních technologií vám nejen přináší ušetřené náklady na energie, ale také dlouhodobě zvyšuje hodnotu vaší nemovitosti.“
- Ověřená kvalita – „Jsme držiteli certifikátů ISO 9001 pro kvalitu, CFA pro udržitelnost a AAA certifikátu pro finanční stabilitu.“
- Tým profesionálů – „Náš tým tvoří experti v oboru, kteří se pravidelně vzdělávají, následují světové novinky a trendy a přináší ta nejlepší řešení.“
- Konzultace a podpora – „Staráme se o vše. Od úvodní konzultace přes individuální návrh, pomoc s administrací a dotacemi až po instalaci a servis.“
- Nadstandardní servis – „Nejsme jen dodavatelé fotovoltaiky a instalační firma. Jsme partneři, kteří o své klienty dlouhodobě pečují a zaručují jim maximální podporu.“
- CTA „Získat nabídku zdarma“

### 2.3 Obce (/cs/fotovoltaika-pro-obce/)
- H1: „Moderní řešení pro energetickou soběstačnost obcí“
- Podtitul: „Zajistěte své obci stabilní a ekologický zdroj energie – pro úřady, školy, sportovní areály i veřejné osvětlení.“
- CTA: „Získejte nabídku na míru“
- Hero badges: „Dotace až 90 % nákladů“ · „98 % spokojených zákazníků“ · „25 let záruka“
- H2 „Výhody pro vaši obec“ (4 karty):
  - „Dotace až 90 %“ – „z celkových nákladů v rámci programů 2025“
  - „Rychlá návratnost investice“ – „už od 5 let“
  - „Ekologický přínos“ – „snížení emisí CO₂, energetická nezávislost“
  - „Dlouhodobá stabilita“ – „servis, monitoring a podpora 24/7“
  - CTA „Získat nabídku pro obec“
- Žádné sestavy/ceny pro obce – neuvedeno.

### 2.4 Sekce „Získejte to nejlepší“ (homepage + stránka domácností) – technologie
H2: „Získejte to nejlepší“. Text: „Komponenty do našich fotovoltaických systémů vybíráme pečlivě podle přísných kritérií kvality a efektivity. Využíváme nejnovější technologie na trhu, které vám zajistí spolehlivý a výkonný zdroj energie s minimální údržbou po mnoho let.“
3 odrážky (ikona zaškrtnutí): „Roční úspora až 70 % nákladů“ (na stránce domácností: „Roční průměrná úspora až 70 % nákladů“) · „Dlouhé záruky až 25 let“ · „Inovativní řešení s umělou inteligencí“. CTA „Nezávazná poptávka →“.
Obrázek: 3 černé panely + bílý střídač + 2 bílé baterie. Na obrázku jsou viditelné popisky „SOLAX POWER“ (střídač) a „TRIPLE POWER“ (baterie); v textu webu není žádný model uveden.

### 2.5 Časová osa procesu (homepage, domácnosti, obce)
01 **Nezávazná konzultace** – „Seznámíme vás s možnostmi a pomůžeme s výběrem optimálního řešení pro váš domov nebo firmu.“
02 **Návrh a kalkulace** – „Připravíme detailní projektovou dokumentaci a přesnou cenovou kalkulaci s návratností investice.“
03 **Vyřízení dotací** – „Kompletně za vás vyřídíme veškerou administrativu spojenou se získáním dotace.“
04 **Realizace a předání** – „Provedeme profesionální instalaci, zaškolíme vás a předáme funkční systém s veškerou dokumentací.“

### 2.6 Záruky (jediné uvedené – homepage)
„Nabízíme až 25letou záruku na panely, 10letou záruku na baterie, až 20letou záruku na střídače s 24/7 monitoringem celého systému.“ Dále „25 let záruka“ v hero badge všech stránek, „Záruka 25 let na panely“ (karta Rodinné domy).

### 2.7 Co je „v ceně“ (explicitně uvedeno)
- „Chytré řízení v ceně“ (karta Rodinné domy na homepage)
- „Monitoring výkonu v ceně“ (karta Firmy)
- „Individuální kalkulace zdarma“ (Firmy) · „Dotační konzultace zdarma“ (Obce) · „Nezávazná kalkulace zdarma“ (homepage)
- Vyřízení dotací, povolení a administrativy – „Služby na klíč“ (viz níže)
- Cena samotná: neuvedeno.

---

## 3. Služby střechy

**Neuvedeno.** Web nenabízí žádné střechy (krytiny, opravy, rekonstrukce, klempířinu, zateplení). Jediná souvislost: fotky FVE na střechách (alt „Fotovoltaika na střeše firmy“ u fotky v dotační sekci firem) a texty „Plocha instalace: cca … m²“.

---

## 4. Reference, recenze, certifikace, partneři, čísla

- **Reference / realizace:** neuvedeno (žádná stránka, žádná místa, žádné výkony realizací). Fotky na webu nejsou nikde označeny jako reference ani nemají popis místa (původ neuveden; vzhledově stock / počítačové vizualizace, viz bod 8 a seznam souborů).
- **Recenze / Google hodnocení / hvězdičky:** neuvedeno (žádný widget, žádné citace zákazníků).
- **Certifikace:** „Jsme držiteli certifikátů ISO 9001 pro kvalitu, CFA pro udržitelnost a AAA certifikátu pro finanční stabilitu.“ (jen na stránce Firmy, bez log a bez čísel certifikátů). Dále „Špičkové technologie: … s evropskými certifikacemi“ a „Naši certifikovaní technici“ (bez konkrétností).
- **Partneři (výrobci)** – H2 „Spolupracujeme s předními výrobci“; text „Pro naše zákazníky vybíráme pouze prověřené kvalitní komponenty od renomovaných světových výrobců, které zaručují spolehlivost a dlouhou životnost.“ Loga v tomto pořadí: **Aiko, Trina, Longi, Solax, GoodWe, SolarEdge**. Žádné modely panelů/střídačů/baterií a žádné Wp neuvedeno.
- **Čísla a procenta na webu (doslovně):**
  - „98 % spokojených zákazníků“ (homepage, domácnosti, obce); „99,9% spokojených zákazníků“ (firmy)
  - „25 let záruka“ (všude); „až 25letou záruku na panely, 10letou na baterie, až 20letou na střídače“
  - „Úspora až 70 % nákladů na energii ročně“ / „Snižte provozní náklady až o 70 %“ / „až 70%“
  - Návratnost: homepage „v rozmezí 2–8 let“ a „návratnost investice již od 6 let“; domácnosti „již od 5 let“; firmy „již od 2 let“; obce „už od 5 let“
  - Dotace: domácnosti „až 147 000 Kč“; firmy „až 50 %“ (30 % FVE, 50 % baterie, zbytek do 90 % výdajů bezúročný úvěr); obce „až 90 %“ (homepage „Dotace až 90% hodnoty“)
  - „Od poptávky k dokončení instalace vše zvládneme do 2-3 měsíců.“
  - „Průměrná fotovoltaická elektrárna ušetří až 4 tuny CO² ročně“
  - „Ozveme se vám do 24 hodin“
  - „100% jistota“, „0 emisí“
  - Počet realizací / let na trhu: neuvedeno

---

## 5. Texty doslovně – homepage (/cs/)

**Hero** (H1): „Fotovoltaika pro vaši budoucnost“
Lead: „Zvyšte hodnotu své nemovitosti a přestaňte platit vysoká vyúčtování za energie. Vše pro Vás velmi rychle zajistíme a Vy budete bez starostí.“
CTA: „Získat nabídku zdarma“ (→ /cs/#formular). Badges: „Prozákaznický přístup“ · „98 % spokojených zákazníků“ · „25 let záruka“. Odkaz „Posunout dolů“.

**Sekce výběru** – H1 „Energetická řešení pro všechny“, podtitul „Vyberte si energetické řešení na míru pro váš domov, firmu nebo obec“. Tři karty:
1. **Pro rodinné domy** – „Energetická nezávislost velmi rychle a bez starostí.“ · ✓ „Úspora až 70% nákladů na energii ročně“ · ✓ „Vyřízení dotací“ · ✓ „Záruka 25 let na panely“ · řádek „Chytré řízení“ = „v ceně“ · tlačítko „NEZÁVAZNÁ NABÍDKA“
2. **Pro firmy** (štítek „Nejoblíbenější“) – „Snižte provozní náklady až o 70% a získejte stabilní ceny energií.“ · ✓ „Velmi rychlá návratnost investice“ · ✓ „Vyšší marže pro váš bussines“ (překlep na webu) · ✓ „Monitoring výkonu v ceně“ · řádek „Individuální kalkulace“ = „zdarma“ · tlačítko „ZÍSKAT FIREMNÍ NABÍDKU“
3. **Pro obce** – „Ekologické řešení pro veřejné budovy s využitím dotačních programů.“ · ✓ „Dotace až 90% hodnoty“ · ✓ „Komplexní dotační poradenství“ · ✓ „Možnost komunitní energetiky“ · řádek „Dotační konzultace“ = „zdarma“ · tlačítko „NEZÁVAZNÁ KONZULTACE“

**Výhody naší firmy** (štítek „VÝHODY NAŠÍ FIRMY“) – H2 „Profesionální řešení, která se vyplatí“: „Naše solární systémy nejen šetří vaše náklady na energii, ale také zvyšují hodnotu nemovitosti a zajišťují energetickou nezávislost. Nabízíme řešení pro domácnosti, firmy i obce s garancí spolehlivosti a kvality.“ + tlačítko „Nezávazná nabídka“. Čtyři karty:
- **Odhad návratnosti** – „Na základě detailní finanční analýzy vám pomůžeme odhadnout návratnost investice do fotovoltaických systémů v rozmezí 2–8 let.“
- **Služby na klíč** – „Od konzultace až po instalaci a servis - včetně vyřízení dotací, povolení a všech administrativních úkonů.“
- **Nadstandardní záruka** – „Nabízíme až 25letou záruku na panely, 10letou záruku na baterie, až 20letou záruku na střídače s 24/7 monitoringem celého systému.“
- **Špičkové technologie** – „Používáme pouze prověřené komponenty nejvyšší kvality s evropskými certifikacemi a nejnovějšími technologiemi.“

Časová osa 01–04 (viz 2.5). Sekce „Získejte to nejlepší“ (viz 2.4).

**Sekce „VÝHODY FOTOVOLTAIKY“** – H2 „Úspory a výhody solárních řešení“: „Fotovoltaické elektrárny přinášejí nejen významné finanční úspory, ale i energetickou nezávislost a ekologické benefity. Zjistěte, jak můžete profitovat z přechodu na solární energii.“
- **Finanční úspora – „až 70%“**: „Snížení měsíčních nákladů na elektřinu díky vlastní výrobě. S aktuálními cenami energií je návratnost investice již od 6 let.“
- **Energetická nezávyslost (překlep na webu) – „100% jistota“**: „Ochrana před růstem cen energií a výpadky sítě. S bateriovým úložištěm získáte energetickou samostatnost po celý rok.“
- **Ekologické řešení – „0 emisí“**: „Výroba energie bez znečištění a emisí CO². Průměrná fotovoltaická elektrárna ušetří až 4 tuny CO² ročně oproti energii z fosilních paliv.“
- **Proč si vybrat naše řešení** (6 bodů):
  - Špičkové komponenty – „Používáme pouze kvalitní panely a měniče s dlouhou životností a nadstandardními zárukami.“
  - Profesionální instalace – „Naši certifikovaní technici zajistí precizní montáž a bezproblémové zapojení systému.“
  - Komplexní servis – „Postaráme se o projektovou dokumentaci, vyřízení dotace i pravidelnou údržbu.“
  - Moderní monitoring – „Sledujte výkon své elektrárny v reálném čase přes mobilní aplikaci kdekoliv a kdykoliv.“
  - Pomoc s dotacemi – „Zajistíme kompletní administraci dotačních programů.“
  - Rychlá realizace – „Od poptávky k dokončení instalace vše zvládneme do 2-3 měsíců.“
- Závěrečný blok: „Získejte nezávaznou kalkulaci zdarma“ – „Kontaktujte nás pro individuální návrh fotovoltaické elektrárny šité na míru vašim potřebám. Připravíme vám detailní projekt včetně výpočtu návratnosti a potenciálních úspor.“ Tlačítko „Kontaktovat“.

**Formulářová sekce** (na všech stránkách): H2 „Chcete nezávaznou konzultaci?“ · „Ozveme se vám do 24 hodin“ · „Vyplňte kontaktní formulář a náš odborník se vám co nejdříve ozve. Nezávazně probereme vaše požadavky a navrhneme optimální řešení přímo pro vás.“ · Pavel Kočí / CEO / +420 773 898 698 / info@prooze.cz

**FAQ:** na webu neuvedeno. **Claimy/USP shrnutí z webu:** „Prozákaznický přístup“, „25 let záruka“, „Služby na klíč“, „Vyřízení dotací“, „Chytré řízení v ceně“, „Monitoring výkonu v ceně“, „Inovativní řešení s umělou inteligencí“, „Ozveme se vám do 24 hodin“, „do 2-3 měsíců“.

---

## 6. Formuláře

Jediný formulář (`#contactForm`, sekce „Chcete nezávaznou konzultaci?“, kotva `#formular`), stejný na všech 4 stránkách. Pole (všechna povinná):
1. Jméno a příjmení (`name`, placeholder „Vaše jméno a příjmení“)
2. Emailová adresa (`email`, placeholder „vaše@email.cz“)
3. PSČ (`psc`, placeholder „000 00“)
4. Telefon (`phone`, `tel`, placeholder „+420 …“)
5. Vaše zpráva (`message`, textarea, placeholder „Sem napište poznámku nebo dotaz…“)
6. Checkbox „Souhlasím se zpracováním osobních údajů“ (`consent`)
7. Tlačítko „ODESLAT“
Žádný výběr typu zákazníka / spotřeby / typu střechy / kvíz – neuvedeno. Skrytě se připojí pole „Odesláno z“ = URL stránky.

Kam vede: AJAX POST na `https://admin.weblantis.cz/api/contact-form/NYqEZygsFPGXnc63dNTCVDJD` (Weblantis admin – CMS posílá e-mail/lead majiteli). Do POSTu se přidává `event_source_url`, `gclid` (pokud existuje), `fbp`/`fbc` (cookie `_fbp`/`_fbc`). Zpětná vazba po odeslání – modální okno: nadpis „Odeslaný formulář“, text „Vaše zpráva byla úspěšně odeslána. Brzy se Vám ozveme.“ (chyba: „Vaší zprávu se nepodařilo odeslat, zkuste to prosím znovu.“), tlačítko „Zavřít“. Thank-you stránka neexistuje. Po úspěchu se do `dataLayer` pošle `{event: "form_submit", formId: "form", user_data: {email, phone}, timestamp}`. Google reCAPTCHA je v kódu připravená, ale konkrétní site key v HTML není.
Další tlačítka CTA vedou jen na kotvu `#formular` (telefon ani e-mail nejsou klikací).

---

## 7. Tracking a technologie

- **CMS / hosting:** Weblantis (weblantis.cz; admin `admin.weblantis.cz`, creator ID 133; „Weblantis Hosting“ na 404). Statické bloky + vlastní HTML sekce. Knihovny: jQuery 3.6.0, Bootstrap 5.3 (bundle), Popper, wow.js, slick-carousel 1.8.1, ionicons, Font Awesome 6.4.0, @dotlottie/player, baguetteBox. Google Fonts (Montserrat, Roboto, Lato, Poppins, Nunito na 404). PHP session cookie `PHPSESSID`.
- **GTM / GA4 / Meta Pixel / Google Ads / Sklik / Clarity / Hotjar:** v HTML ani ve skriptech **žádné ID není**. Weblantis načítá trackovací kódy z pole `cookie_consent = []` (na webu prázdné) přes `/cookie-consent/trackingCodes.js`; podporuje události pageview / click (`data-tracking-click`) / scroll % / inviewport. V tomto stavu se nic nespustí. Připravená je jen proměnná pro `gclid`, `fbp`, `fbc` a Google Consent Mode v2 (volání `gtag('consent', …)`, `url_passthrough: true` v `/cookie-consent/cookieBar.js`; kategorie: funkční, analytické, marketingové, uživatelské preference = `ad_user_data`, personalizační data = `ad_personalization`).
- **Cookie lišta (Weblantis):** „Souhlas s cookies“ – tlačítka „Odmítnout vše“ / „Přijmout vše“ / „Podrobné nastavení kategorií“; cookie `wl_cookies`.
- **Google Maps:** skript s prázdným API klíčem (`key=`), mapa se na webu nezobrazuje.
- Favicon: zelený symbol loga 32×32 px.

---

## 8. Vizuál starého webu

### Logo
SVG 231×53 (viewBox 0 0 231 53), všech 5 výskytů (hlavička + 4× patička) je identický soubor. Symbol: bílý plný kruh uprostřed obklopený 12 zelenými (#06BD57) lístkovitými/paprskovitými tvary v kruhu (slunce/květ/turbína), vedle slovo „PRO**OZE**“ – „PRO“ bílé tenčí, „OZE“ zelené (#06BD57) tučnější; písmo ve tvaru bezpatkové (geometrické, zaoblené). Logo je určené na tmavé pozadí (bílá + zelená). Jiné varianty (barevná na světlém, jen symbol, monochrom) – neuvedeno / neexistují.

### Barvy (z CSS)
- Hlavní zelená „Sea Green“ `#2E8B57` (tlačítka, odznaky, ikony, nadpisové akcenty) – `--primary-green`, rgb(46,139,87)
- Tmavší zelená (hover/gradient/sekce formuláře) `#216B43` rgb(33,107,67)
- Nejtmavší zelená (patička, hero gradient) `#1A4630` rgb(26,70,48)
- Světle zelená pozadí `#EAF5F0`
- Další zelené: `#3F9C74`, `#2E9E5B` (přepínač cookie), logo `#06BD57`
- Akcentní žlutá `#F4B400` (hover `#E0A600`) – definována v CSS, na hlavních sekcích prakticky nepoužita
- Tmavý text `#1F1F1F` / `#333333`, šedý text `#666666` / `#999999`
- Pozadí sekcí: bílá `#FFFFFF`, `#F8F9FA`, `#F7F9FB`; modrozelená `#103849` v CSS (menší použití)
- Hero overlay: `linear-gradient(90deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.75) 35%, rgba(0,0,0,.4) 80%)` přes fotku panelů; sekce časové osy: `linear-gradient(135deg, #216B43 0%, #2E8B57 100%)` + jemná mřížka (1px, bílá 10 %)
- Cookie lišta: tmavé tlačítko `#1D2129`

### Písma
- Nadpisy a hero: **Montserrat** (H1 hero 48 px / 800, nadpisy sekcí 40 px / 700, H2 karet 28 px / 700, H3 20,8 px / 600; lead 20 px / 300; CTA tlačítka 15,2 px / 600 verzálky)
- Menu, body, formulář: **Segoe UI → Roboto → sans-serif** (menu 15 px / 500, tlačítko v menu 14 px / 600)
- Texty v sekcích výhod: **Roboto**
- Bootstrap základ: Arial, sans-serif (body font-weight 500)
- Poloměry: tlačítka 6–8 px, karty zaoblené, tlačítko v menu 6 px; zelené plné tlačítko s bílým textem, verzálky.

### Popis homepage (desktop 1440×900)
Horní lišta je tmavě zelená poloprůhledná (výška cca 70 px): vlevo logo, vpravo menu „Domů · Rodinné domy · Firmy · Pro obce“ (bílý text) a zelené tlačítko „Nezávazná nabídka“. Hero na celou výšku okna: fotka velkých tmavě modrých FVE panelů (pole panelů, modrá obloha) ztmavená gradientem zleva (téměř černá vlevo, průhlednější vpravo). Vlevo bílý tučný H1 „Fotovoltaika pro vaši budoucnost“ (2 řádky), pod ním lead, zelené tlačítko „ZÍSKAT NABÍDKU ZDARMA“ a 3 průsvitné pilulky s ikonkami (Prozákaznický přístup, 98 % spokojených zákazníků, 25 let záruka); dole „Posunout dolů“ se šipkou. Pod hero bílá sekce se třemi bílými kartami (foto domu se střechou s FVE / budovy s FVE / střechy školy s FVE, nadpis, krátký text, 3 odrážky se zelenými fajfkami, šedozelený řádek „Chytré řízení – v ceně“, zelené plné tlačítko), prostřední karta má zelený štítek „Nejoblíbenější“. Následuje šedá sekce „Výhody naší firmy“ (zelený verzálkový štítek, tučný H2, vlevo text + tlačítko, vpravo 2×2 bílé karty s ikonami v zelených kruzích), pak plnošířková zelená sekce (gradient) s časovou osou 01–04 (bílá čísla v poloprůhledných čtvercích, bílý text), bílá sekce s produktovým obrázkem (panely + střídač + baterie) vlevo a zeleným zaškrtávacím seznamem vpravo, světle šedá sekce „Úspory a výhody“ se 3 velkými bílými kartami (zelené kulaté ikony, velká čísla „až 70%“, „100% jistota“, „0 emisí“) a šedým boxem s 6 body 2×3, pruh s logy partnerů (6 log), tmavě zelená sekce s formulářem (vlevo nadpis, kontakt Pavel Kočí s kulatou fotkou, vpravo bílá karta s formulářem 2×2 pole + zpráva + souhlas + zelené „ODESLAT“) a tmavě zelená patička. Cookie lišta (bílá karta s ikonou sušenky) vyskakuje uprostřed dole. Délka stránky na desktopu cca 6 800–7 800 px.

### Fotky a grafika na webu (rozbor)
- Původ fotek (autor/zdroj/místo realizace) není na webu nikde uveden. Vizuální obsah: hero homepage = pole FVE panelů v krajině; hero Firmy = technik v oranžové helmě a kostkované košili s deskami před panely; hero Obce = letecký snímek ploché střechy školní budovy s řadami panelů; karty homepage: Rodinné domy = dřevěný dům s černými panely na střeše, Firmy = komerční budova s panely na střeše a okolní zelení, Obce = letecký záběr areálu budov s panely na ploché střeše.
- Hero Domácnosti a obrázky sestav 20/50/100 kWp: bílý dům v krajině s černými panely (hero) a stejná průmyslová budova s 20 / 50 / 100 kWp modrými panely na šikmé střeše (sestavy; obrázky vypadají jako počítačové vizualizace, ne fotografie reálných realizací; na webu nejsou jako vizualizace označeny).
- Obrázek „Získejte to nejlepší“: produktový záběr panelů (černé), střídače SOLAX POWER a baterií TRIPLE POWER na průhledném pozadí.
- Ikony (SVG) a partnerská loga – viz seznam.

---

## 9. Stažené soubory (assets/old/)

Umístění: `/Users/martinwork/Downloads/lp-tracking-standard/prooze-web/assets/old/`
(Ikony a drobné SVG ikony vynechány. Soubory „firmy-dotace“ a „hero-firmy“ jsou na webu tentýž obrázek – stažen jednou.)

Všechny soubory jsou originály z úložiště CMS (`admin.weblantis.cz/storage/creator/133/…`), tedy nejvyšší dostupné rozlišení (web zobrazuje tytéž soubory, jen zmenšené). Rozměry v px (SVG = viewBox).

| Soubor | Rozměr | Velikost | Použití na webu |
|---|---|---|---|
| logo.svg | SVG 231×53 | 7 KB | Logo v hlavičce (desktop + mobilní menu) a v patičce všech 4 stránek (5 identických souborů; bílá + zelená #06BD57, pro tmavé pozadí) |
| favicon.png | 32×32 | 0,8 KB | Favicon |
| hero-home.jpg | 1500×1000 | 296 KB | Hero pozadí homepage (pole FVE panelů; pod tmavým gradientem) |
| hero-domacnosti.png | 1536×1024 | 3,0 MB | Hero stránky Rodinné domy (bílý dům s černými panely v krajině – vizualizace) |
| hero-firmy.jpg | 1800×1200 | 260 KB | Hero stránky Firmy (technik v helmě před panely) + stejný soubor v dotační sekci firem (alt „Fotovoltaika na střeše firmy“) |
| hero-obce.jpg | 1603×1200 | 310 KB | Hero stránky Pro obce (střecha školy s panely, letecký záběr) |
| karta-rodinne-domy.jpg | 1800×900 | 201 KB | Karta „Pro rodinné domy“ na homepage (dřevěný dům s FVE) |
| karta-firmy.jpg | 1800×1200 | 299 KB | Karta „Pro firmy“ na homepage (komerční budova s FVE) |
| karta-obce.jpg | 1800×1013 | 402 KB | Karta „Pro obce“ na homepage (areál budov s FVE, letecký záběr) |
| fve-20kwp.png | 1536×1024 | 3,4 MB | Karta „FVE - 20 kWp“ na stránce Firmy (vizualizace budovy s 20 kWp) |
| fve-50kwp.png | 1536×1024 | 3,5 MB | Karta „FVE - 50 kWp“ na stránce Firmy |
| fve-100kwp.png | 1024×1024 | 2,5 MB | Karta „FVE - 100 kWp“ na stránce Firmy |
| solarni-technologie-panely.png | 1304×1200 | 1,0 MB | Sekce „Získejte to nejlepší“ (homepage + Rodinné domy): průhledné pozadí, černé panely + střídač SOLAX POWER + baterie TRIPLE POWER |
| pavel-koci-ceo.jpg | 200×200 | 5 KB | Kulatá fotka kontaktní osoby Pavla Kočího (CEO) u formuláře (nízké rozlišení) |
| partner-aiko.png | 500×300 | 3 KB | Logo partnera Aiko (pruh „Naši partneři“) |
| partner-trina.svg | SVG 250,8×58,1 | 5 KB | Logo partnera Trina |
| partner-longi.svg | SVG 293,8×110 | 1 KB | Logo partnera Longi |
| partner-solax.png | 536×212 | 14 KB | Logo partnera Solax |
| partner-goodwe.png | 1800×268 | 29 KB | Logo partnera GoodWe |
| partner-solaredge.svg | SVG 173,5×36,8 | 6 KB | Logo partnera SolarEdge |

Celkem 20 souborů: 1 logo SVG + favicon, 12 fotek/vizualizací (3 hero fotky, 1 hero vizualizace, 3 karty, 3 sestavy, 1 produktový obrázek, 1 portrét) a 6 log partnerů.
Nestaženo (záměrně): ~35 drobných SVG ikon (karty výhod, kontaktní ikony, ikony kroků).
Reference / fotky skutečných realizací: na webu neexistují – žádný soubor tohoto typu nebyl ke stažení.
