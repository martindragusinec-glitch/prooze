# Software na nabídky FVE a střech: rešerše pro PROOZE

Stav k 15. 10. 2026. U každého faktu je zdroj. „Neověřeno“ znamená, že jsem informaci nenašel, ne že funkce chybí.

Ceny jsou převzaté ze stránek výrobců. Kde DPH nebo způsob placení (měsíčně, ročně) není uvedený, píšu to výslovně. Při rešerši se vyčerpal limit vyhledávání, takže některé body zůstaly neověřené. Seznam je v kapitole 7.

## 1. Výchozí stav PROOZE

Zdroj je kód `src/interni/nabidka/app.js`.

- Všechno běží v prohlížeči a data jsou jen v localStorage (`prooze-nabidky`, `prooze-sablony`). Sdílení mezi obchodníky ani záloha nejsou.
- Šablony položek existují pro plech, tašku, opravu a FVE. Položka má kategorii, popis, jednotku, množství a cenu. Nákupní cena, marže ani vazba na katalog nejsou.
- Sleva je jedna procentní za celou nabídku. DPH jde nastavit na 12 %, 21 %, 0 % nebo neplátce, k tomu zaokrouhlení.
- Stavy nabídky: rozpracovaná, odeslaná, přijatá, odmítnutá.
- PDF vzniká tiskem z prohlížeče (`window.print`). Varianty A/B/C, verze ani online akceptace nejsou.
- Web běží na Vercelu se serverless API (`api/poptavka.js`), databázi ale nemá.

**Klíčový požadavek:** PROOZE dělá v jedné nabídce **střechu i FVE**. Žádný z prověřených nástrojů prokazatelně neumí obojí, viz kapitolu 3.

## 2. Srovnávací tabulka

Legenda: ✓ = doloženo zdrojem, ~ = částečně nebo s omezením, ? = neověřeno, – = nástroj to neřeší. Zdroje jsou v kapitole 3.

### 2.1 Mezinárodní nástroje pro FVE

| Nástroj | (a) katalog, nákup/prodej, marže | (b) kompatibilita | (c) auto BOM | (d) šablony, varianty, verze | (e) online akceptace | (f) role, slevy | (g) mobil | (h) integrace | (i) cena | CZ / CZK |
|---|---|---|---|---|---|---|---|---|---|---|
| **Reonic** (DE) | ✓ 150 000+ položek, vlastní komponenty, právo na nákupní ceny | ~ jen proud stringu vs. MPPT | ~ balíčky s pevnými množstvími | ✓ varianty, podepsaná se zamkne, změna forkem | ✓ odkaz, tablet | ✓ 3 role + asi 20 práv, šablony slev | ~ app na prohlídku, nabídka jen na webu | ✓ HubSpot, Pipedrive, Hero, Lexoffice, API | nezveřejněno | CZ web ano, CZ UI ?, CZK ? |
| **OpenSolar** (AU) | ✓ COGS, práce, 4 cenová schémata, marže jen pro oprávněné | ✓ Voc/Vmp, DC/AC, MPPT (varování) | ~ BOS z šablon, konstrukce Esdec jen UK | ✓ víc systémů v projektu, PDF „vše/vybrané“ | ✓ vlastní HTML smlouva, DocuSign, PandaDoc | ✓ asi 10 rolí + vlastní, právo na slevy | ~ iOS app | ~ API, HubSpot přes třetí stranu | zdarma | 13 jazyků bez CZ, CZK ? |
| **Aurora Solar** (US) | ~ jen prodejní ceny z DB, přirážky | ✓ AutoStringer, AC/DC baterie vs. střídač | ~ CSV, konstrukce přes partnery | ✓ víc šablon a návrhů | ~ DocuSign, jen Enterprise | ✓ až 10 vlastních rolí, limity pro dealery | ~ tablet, survey beta | ~ API jen Enterprise | 159 $/uživ./měs. (Basic), 259 $ (Premium) | DE/FR/ES/IT, bez CZ |
| **Solargraf** (Enphase) | ~ katalog Solargrafu, upravit jde jen prodejní cena | ~ panel + mikrostřídač Enphase | ~ jen Enphase, konstrukce IronRidge CSV | ✓ Good/Better/Best, max 3 v nabídce | ✓ podpis, DocuSign | ✓ 4 role + vlastní | ? | ~ API, webhooky | 2 799–12 999 $ ročně podle tarifu | ČR není v seznamu trhů |
| **Pylon** (AU) | ✓ prodejní i nákupní cena, ceníky s verzemi (beta AU) | ~ rady ke stringům | ~ ceny po W, kW, kWh | ✓ až 5 návrhů na projekt | ✓ 0,80 za projekt | ✓ RBAC | ~ web, mobil od 5/2026 | ~ Xero, API | 4–10 € za projekt, CRM od 49/uživ./měs. | ČR není mezi trhy |
| **EasySolar** (PL) | ~ katalog dodavatele se kopíruje do vlastního ceníku | ? | ~ panely z layoutu, zbytek ručně | ~ vlastní šablony až v Enterprise+ | ~ tlačítko „Přijmout“, e-podpis ve vyšším tarifu | ~ uživatel/admin | ✓ mobilní prohlížeč | ~ API, Zapier, Make | 69 €/měs. + 20 € za dalšího uživatele | CZ web ano, CZK ? |
| **SolarEdge Designer** | ~ jen produkty SolarEdge | ✓ stringy podle pravidel SolarEdge | ~ BOM report | ~ nabídka, verze ? | – | ~ víc uživatelů | ? | – | zdarma | ? |

### 2.2 Nástroje z EU a DACH

| Nástroj | (a) | (b) | (c) | (d) | (e) | (f) | (g) | (h) | (i) cena | CZ / CZK |
|---|---|---|---|---|---|---|---|---|---|---|
| **Solar-Planit** (BayWa r.e.) | ~ sortiment a ceny BayWa | ✓ napříč výrobci, baterie ke střídači | ✓ konstrukce novotegra, zatížení větrem a sněhem | ~ PDF report, orientační cenová nabídka | ? | ~ sdílení v týmu | – jen PC | ✓ košík e-shopu BayWa | zdarma | CZ ? |
| **Eturnity** (CH, od 2026 s Solar Monkey) | ✓ cena dodavatele, montáž, marže, DPH u komponenty | ✓ stringy, MPPT, baterie | ✓ konstrukce přes K2, Clenergy a další | ✓ PDF, datasheety, online nabídka | ✓ online potvrzení, e-podpis | ? | ? | ~ Zapier, Make, webhooky | nezveřejněno | bez CZ |
| **HERO Software** (DE, řemeslníci) | ✓ nákup + přirážka v % nebo €, výjimka u řádku | – (návrh přes Solar Monkey) | ~ výkon = materiál + práce + stroj | ~ šablony, textové bloky | ~ podpis jen na zařízení | ~ licence Standard a App | ✓ iOS a Android, zaměření | ✓ Datanorm, IDS Connect, GAEB, Lexware, DATEV jen CSV | 69–299 €/měs. + licence | CZ ? |
| **OpusFlow** (NL, ERP pro FVE a TČ) | ✓ ceníky, marže z BOM | ? | ✓ BOM → objednávky podle dodavatele, rezervace skladu | ~ firemní PDF | ✓ e-podpis, sledování otevření | ~ správa rolí | ✓ app | ✓ Exact, Google, M365, API | 99 €/uživ./měs. ročně, min. 3 licence + onboarding od 1 500 € | CZ ? |
| enerix (DE franšíza) | Od 2025 používá Reonic. Není to produkt na prodej. | | | | | | | | | |

### 2.3 Česká CRM a nástroje

| Nástroj | (a) | (b) | (c) | (d) | (e) | (f) | (g) | (h) | (i) cena | CZ / CZK |
|---|---|---|---|---|---|---|---|---|---|---|
| **Wue** (Brno) | ? | ? | ? | ✓ nabídky FVE a TČ, smlouvy, podklady NZÚ | ? | ? | ✓ web i mobil | ✓ SOLSOL, Make | 650 Kč/uživ./měs. (roční závazek) | ✓ |
| **FreshFlow** | ✓ ceníky, produkty, nákladové položky | ? | ? | ✓ nabídky z obchodního případu | ? | ? | ✓ app | ? | 290 Kč/uživ./měs. bez DPH | ✓ |
| **Raynet CRM** | ~ produkty a ceníky, nákup/marže ? | – | – | ✓ šablony .docx/PDF | ✓ doplněk od 250 Kč za 15 dokumentů | ~ role | ✓ iOS a Android | ✓ API, Money S5, Fakturoid přes partnera | 449 / 949 / 1 199 Kč/uživ./měs. | ✓ |
| **Pipedrive** | ~ cena + informativní „Náklad“, cenové varianty | – | – | ~ Smart Docs (zdroje si odporují) | ✓ Premium a vyšší | ✓ oprávnění (Premium) | ? | ? | 14–79 €/uživ./měs. ročně bez DPH | CZ UI ✓, CZK ? |
| **Caflou** | ~ nabídky, objednávky, faktury | – | – | ? | ? | ? | ✓ app | ✓ API, Make | kreditní model, příklad 10 uživatelů = 80 €/měs. | ✓ |

### 2.4 Střechy

| Nástroj | (a) | (c) auto BOM | (d) | (e) | (f) | (i) cena | CZ |
|---|---|---|---|---|---|---|---|
| **Roofr** (US) | ✓ katalog povinný, marže nebo přirážka | ✓ množství z měření střechy | ✓ víc možností v nabídce, šablony | ✓ na místě i odkazem | ✓ role podle tarifu, sedadla zdarma | 249 $ / 349 $ měsíčně paušálně | jen US |
| **KM BETA KALKULÁTOR** | ~ ceníky KM Beta, nastavitelná sleva | ✓ materiál střechy | ? | – | – | zdarma | ✓ |
| **Bramac konfigurátor + Scan** | – | ✓ výpočet materiálu z projektu nebo leteckého zaměření | – | – | – | zdarma (služba) | ✓ |

## 3. Detail po nástrojích

### 3.1 Reonic (DACH; CRM, plánování a nabídky)

- **(a) Katalog:** přes 150 000 položek od více než 2 000 výrobců ([reonic.com](https://reonic.com/en-gb/product/360h/planning/)). Každý workspace má vlastní katalog a vlastní komponenty smí přidávat jen ten, kdo má právo „Create custom components“. Prodejní cena se nastavuje u komponenty. Nákupní ceny smí upravovat jen ten, kdo má právo „Edit purchase (buy) prices“ ([uživatelé a týmy](https://docs.reonic.com/docs/en/settings-company-user-teams), [kusovník](https://docs.reonic.com/docs/en/offers-finalise-cat-parts-list)). Pravidla přirážek a import ceníků: neověřeno.
- **(b) Kompatibilita:** zdokumentované je jen varování, když proud stringu překročí limit MPP trackeru ([docs](https://docs.reonic.com/docs/en/offers-plan-pv-inverter-micro-inverter)). Kontrola baterie vůči střídači: neověřeno.
- **(c) BOM:** skládá se ze tří vrstev:
  - plánovací balíčky: kusovníky s cenou, které nahrazují obsah kategorie,
  - šablony nabídek: jeden balíček na kategorii,
  - plánovací šablony: doplňky, které se přičítají.
  
  Množství v balíčcích jsou pevná („linked amounts“). Škálování podle počtu panelů: neověřeno. Data o střeše jde exportovat do K2 Base ([balíčky](https://docs.reonic.com/docs/en/settings-planning-and-offer-planning-packages-and-templates), [linked amounts](https://docs.reonic.com/docs/en/offers-plan-pv-linked-amounts), [K2](https://docs.reonic.com/docs/en/settings-integrations-k2)).
- **(d) Nabídky:** PDF šablona je zvlášť pro Residential a Commercial. Jedna nabídka může mít víc variant. Podepsaná varianta se zamkne a změna se dělá forkem. Ceny jdou zobrazit po položkách, po skupinách nebo celkem ([nastavení](https://docs.reonic.com/docs/en/settings-planning-and-offer-angebot), [vlastnosti](https://docs.reonic.com/docs/en/offers-overview-overview-offer-characteristics)).
- **(e) Akceptace:** zákazník dostane veřejný odkaz, vybere variantu a podepíše klepnutím nebo kreslením. Do PDF se přidá stránka s ověřením. Platnost odkazu se nastavuje. Podepsat jde i na tabletu na místě ([docs](https://docs.reonic.com/docs/en/offers-finalise-cat-preview-variants-legal-texts-offer-link-validity)).
- **(f) Role:** Viewer, Editor a Admin a asi 20 jednotlivých práv. Existují šablony slev a volné slevy hlídá právo „Custom discounts“ ([šablony slev](https://docs.reonic.com/docs/en/settings-planning-and-offer-rabattvorlagen)). Schvalovací workflow: neověřeno.
- **(g) Mobil:** aplikace na projekty, fotky a checklisty (offline), LiDAR sken. Nabídky se tvoří jen na webu ([docs](https://docs.reonic.com/docs/en/app-overview-navigation)).
- **(h) Integrace:** Lexoffice, Sevdesk, Bexio, HubSpot, Pipedrive, Bitrix, WeClapp, Hero, REST API, webhooky, SSO. České účetnictví ani velkoobchody v seznamu nejsou ([integrace](https://docs.reonic.com/docs/en/category/settings-integrations)).
- **(i) Cena a ČR:** cena není zveřejněná. Reonic má český web ([reonic.com/cs-cz](https://reonic.com/cs-cz/)). Čeština v UI ani CZK nejsou výslovně uvedené ([profil](https://docs.reonic.com/docs/en/settings-my-user-profile)), tedy neověřeno.
- Franšíza enerix (115+ partnerů v DE a AT) používá od dubna 2025 Reonic ([pv-magazine.de](https://www.pv-magazine.de/unternehmensmeldungen/photovoltaik-und-waermepumpenauslegung-in-einem-schritt/)).

### 3.2 OpenSolar (zdarma, financovaný partnery)

- **(a) Katalog a ceny:**
  - Globální databázi spravuje OpenSolar a firma si položky přidá do vlastního seznamu. U komponenty jsou pole pro COGS, práci a úpravu ceny za kus, za W nebo za panel ([support](https://support.opensolar.com/hc/en-us/articles/12363053307663)).
  - Cenová schémata jsou čtyři: cena za W, cena za W podle velikosti, přirážka v % a pevná cena. Automaticky se aplikují podle regionu nebo velikosti a nastavuje je jen admin ([support](https://support.opensolar.com/hc/en-us/articles/12519221319311)).
  - Nákladové schéma pokrývá práci, akvizici a realizaci a přidává příplatky za typ střechy, počet podlaží a sklon. Marže = cena − náklady a vidí ji jen oprávnění, v nabídce se nikdy neukáže. Po opuštění fáze návrhu se cena zamkne ([support](https://support.opensolar.com/hc/en-us/articles/17378693408271), [support](https://support.opensolar.com/hc/en-us/articles/17378717682191)).
  - Příplatky („adders“) mohou být pevné, za W, za panel nebo v %. Automaticky se přidávají podle kódu komponenty, velikosti, střechy nebo sklonu. Přepínač „Only Admins can remove“ je zamkne pro obchodníky ([support](https://support.opensolar.com/hc/en-us/articles/13294907030927), [support](https://support.opensolar.com/hc/en-us/articles/4416751335449)).
- **(b) Kompatibilita:** kontrola stringů podle teplotně korigovaných Voc a Vmp, poměru DC/AC a vstupů MPPT. Při překročení limitu se ukáže červené varování ([support](https://support.opensolar.com/hc/en-us/articles/12382487281935)). Baterie vůči střídači: neověřeno.
- **(c) BOM:** šablony automatického návrhu přidají BOS (svorky, odpojovače, štítky) a preferovanou konstrukci ([opensolar.com](https://www.opensolar.com/?p=14624)). Konstrukce Esdec „Get BOM“ funguje jen ve Velké Británii ([support](https://support.opensolar.com/hc/en-us/articles/5066443212303)).
- **(d) Nabídky:** víc systémů a platebních možností v jednom projektu. PDF ukáže všechny nebo jen vybrané ([support](https://support.opensolar.com/hc/en-us/articles/12343205311375)). Verze: neověřeno.
- **(e) Podpis:** vlastní HTML smlouva s proměnnými a podmíněnými sekcemi, nebo DocuSign či PandaDoc ([support](https://support.opensolar.com/hc/en-us/articles/13727179956495), [support](https://support.opensolar.com/hc/en-us/articles/15166040343055)).
- **(f) Role:** asi 10 předdefinovaných rolí a vlastní role s právy zobrazit, vytvořit, upravit a smazat. Ceny a náklady vidí výchozí jen Admin a General Manager. Existuje samostatné právo na slevy ([support](https://support.opensolar.com/hc/en-us/articles/12299933220111)). Schvalování slev: neověřeno.
- **(g) Mobil:** iOS aplikace ([App Store](https://apps.apple.com/us/app/opensolar/id1410085935)).
- **(h) Integrace:** API ([opensolar.com](https://www.opensolar.com/?p=874)). HubSpot jen přes třetí stranu ([Snapfrozen](https://www.snapfrozen.com.au/open-solar-integrations/)). Objednávky u distributorů jen v AU, UK a US ([support](https://support.opensolar.com/hc/en-us/articles/13692484814223)).
- **(i) Cena a ČR:** zdarma, platí partneři ([support](https://support.opensolar.com/hc/en-us/articles/4410441718297)). Nabídky jsou ve 13 jazycích včetně DE a PL, čeština chybí, šablonu jde přeložit ručně ([support](https://support.opensolar.com/hc/en-us/articles/5552233154575)). CZK: neověřeno.

### 3.3 Aurora Solar

- **(a) Katalog a ceny:** databázi spravuje Aurora a admin povoluje modely. Vlastní komponenty jsou na vyžádání ([help](https://help.aurorasolar.com/hc/en-us/articles/6964101736083)). Cena = výchozí částka plus jedna z metod: po komponentách, paušál, nebo za W. Změna výchozího nastavení platí jen pro nové návrhy ([help](https://help.aurorasolar.com/hc/en-us/articles/6828599323155)). Pole pro náklady a marži: neověřeno. Příplatky a slevy mohou být paušální, za W, za panel nebo v % ([help](https://help.aurorasolar.com/hc/en-us/articles/4411766313235)). Automatické příplatky obchodník nemůže odebrat, jsou jen v Enterprise ([help](https://help.aurorasolar.com/hc/en-us/articles/19843311586323)).
- **(b) Kompatibilita:** AutoStringer barevně značí délku stringu vůči napěťovému oknu střídače ([help](https://help.aurorasolar.com/hc/en-us/articles/13139582090131)). AC baterie vyžaduje bateriový střídač, DC baterie hybridní střídač a nekompatibilní spojení se odstraní ([help](https://help.aurorasolar.com/hc/en-us/articles/51222623384851)).
- **(c) BOM:** export do CSV. Konstrukce jen přes partnerské aplikace (Unirac, K2 a další) a po změně návrhu se musí přepočítat ručně ([help](https://help.aurorasolar.com/hc/en-us/articles/28454358892947)).
- **(d) Nabídky:** víc šablon, web i PDF, víc návrhů na projekt ([help](https://help.aurorasolar.com/hc/en-us/articles/27042589123731)).
- **(e) Podpis:** Contract Manager přes DocuSign, doplněk k Enterprise ([help](https://help.aurorasolar.com/hc/en-us/articles/49176456030099)).
- **(f) Role:** až 10 vlastních rolí s přepínačem úprav ceny ([help](https://help.aurorasolar.com/hc/en-us/articles/11459813328787)). Pro dealery jdou nastavit mantinely ceny za W, příplatků a slev ([blog](https://aurorasolar.com/blog/aurora-q3-2023-updates-flexible-pricing-dealer-customizations-and-post-sales-plan-sets/)).
- **(g) Mobil:** prohlídka přes integraci SiteCapture (beta) ([help](https://help.aurorasolar.com/hc/en-us/articles/31181595019155)).
- **(h) Integrace:** API a webhooky v Enterprise ([help](https://help.aurorasolar.com/hc/en-us/articles/17426531448083)).
- **(i) Cena a ČR:** Basic 159 $ za uživatele měsíčně (135 $ při ročním placení), Premium 259 $ (220 $). Jedno místo pokrývá 50 projektů měsíčně ([pricing](https://aurorasolar.com/pricing)). EU weby ceny neuvádějí ([aurorasolar.com/eu](https://aurorasolar.com/eu/en/)). Jazyky DE, FR, ES a IT, čeština ne ([blog](https://aurorasolar.com/intersolar-europe-update-and-sneak-peek/)). Měna se nastavuje u organizace, CZK: neověřeno ([help](https://help.aurorasolar.com/hc/en-us/articles/13771692670355)).

### 3.4 Solargraf (Enphase)

- **(a) Katalog a ceny:** globální databázi spravuje Solargraf a chybějící položky doplní do 48 hodin. Vlastní materiály už nejdou založit, upravit jde jen prodejní cena, obrázek a záruka ([help](https://www.solargraf.com/help-center/article/manage-the-materials-database-in-solargraf)). Ceníkové tabulky dávají cenu za W v pásmech podle kW ([help](https://www.solargraf.com/help-center/article/how-to-set-up-solar-pricing-tables)). Druhá možnost je cena z BOM, tedy součet prodejní cena × množství ([help](https://www.solargraf.com/help-center/article/bom-based-pricing)). Příplatky a slevy jdou i za čtverec střechy nebo za běžnou stopu ([help](https://www.solargraf.com/help-center/article/discounts-and-extra-costs)).
- **(b) Kompatibilita:** výchozí párování panel–mikrostřídač ([help](https://www.solargraf.com/help-center/article/pairing-panels-with-a-default-microinverter-in-solargraf)).
- **(c) BOM:** elektro kusovník jen pro Enphase ([help](https://www.solargraf.com/help-center/article/bom-calculator)). Konstrukce IronRidge přes CSV ([help](https://www.solargraf.com/help-center/article/ironridge-racking-bill-of-materials)).
- **(d) Varianty:** Good/Better/Best, každá možnost má vlastní návrh, materiál a cenu. V nabídce jsou nejvýš 3 se srovnávacím grafem a jdou klonovat ([help](https://www.solargraf.com/help-center/article/good-better-best-creating-multiple-project-options)).
- **(e) Podpis:** pole pro podpis klienta i instalatéra, DocuSign ([help](https://www.solargraf.com/help-center/article/manage-signatures-on-solargraf)).
- **(f) Role:** 4 výchozí a vlastní role ([help](https://www.solargraf.com/help-center/article/roles-permissions)). Dealer má vlastní ceny a materiály ([help](https://www.solargraf.com/help-center/article/dealer-configurations-in-solargraf)).
- **(h) Integrace:** API a webhooky ([help](https://www.solargraf.com/help-center/subtopic/open-api)).
- **(i) Cena:** v USD, placeno ročně ([pricing](https://www.solargraf.com/pricing)):

  | Tarif | Cena za rok | Uživatelé | Projekty |
  |---|---|---|---|
  | Starter | 2 799 $ | 2 | 240 |
  | Small Business | 4 799 $ | 4 | 480 |
  | Teams | 6 399 $ | 6 | 720 |
  | Enterprise | 12 999 $ | neomezeně | 1 500 |

  Trhy US, CA, BR, DE, AT a NL, ČR není uvedena ([Enphase](https://investor.enphase.com/news-releases/news-release-details/enphase-energy-releases-its-solargraf-software-platform)).

### 3.5 Pylon (Austrálie)

- **(a) Katalog:** cenový záznam má prodejní i nákupní cenu bez daně a dodavatele. Záznam se needituje, každá změna vytvoří nový, takže zůstává historie ([API](https://app.getpylon.com/docs/api)). Ceníky (beta, zatím AU) mají regiony, verze s datem platnosti, import ceníků dodavatelů a minimální marže ([září 2026](https://getpylon.com/blog/september-2026-update-australia/)).
- **(c) Cenotvorba:** „Stacked Pricing Engine“ počítá položky z násobitelů po W, kW a kWh, i v pásmech ([blog](https://getpylon.com/blog/march-2025-update/)).
- **(d) Nabídky:** až 5 návrhů na projekt, srovnávací stránky. Řádky lze zákazníkovi skrýt ([pricing](https://getpylon.com/pricing/)).
- **(e) Podpis:** 0,80 za projekt (měna podle regionu), certifikát s IP adresou a sledování stavů ([e-signatures](https://www.getpylon.com/solutions/e-signatures/)).
- **(f) Role:** neomezený počet uživatelů a RBAC ([UK pricing](https://getpylon.com/uk/pricing/)).
- **(i) Cena:** Standard 4 € za projekt, Pro 10 € za projekt, CRM od 49 za uživatele měsíčně ([IE pricing](https://getpylon.com/ie/pricing/)). ČR není mezi trhy ([Capterra](https://www.capterra.co.uk/software/217697/pylon)).

### 3.6 EasySolar (Polsko, má český web)

- **(a) Katalog:** katalog dodavatele se kopíruje do vlastního ceníku firmy a ten lze synchronizovat z Google Sheets přes Zapier ([user guide](https://user-guide.easysolar.app/discover/warehouse/)). Nákupní cena a marže: neověřeno.
- **(c) BOM:** model a počet panelů se převezmou z layoutu, ostatní položky se přidávají ručně ([valuations](https://user-guide.easysolar.app/discover/valuations/)).
- **(d) Nabídky:** interaktivní odkaz a PDF. Vlastní šablony až v Enterprise+ ([CZ ceník](https://easysolar.app/cs/cenik-3/)).
- **(e) Akceptace:** tlačítko „Přijmout nabídku“. E-podpis je omezený nebo ve vyšším tarifu ([CZ ceník](https://easysolar.app/cs/cenik-3/)).
- **(f) Role:** uživatel a admin, pokročilé role až v Enterprise+ ([team](https://user-guide.easysolar.app/discover/team-management/)).
- **(h) Integrace:** API, Zapier, Make ([API](https://easysolar.app/api-webhooks/)).
- **(i) Cena:** Business+ 69 € měsíčně za 1 uživatele, každý další 20 €. Enterprise+ od 50 uživatelů ([CZ ceník](https://easysolar.app/cs/cenik-3/)).

### 3.7 SolarEdge Designer, Solar-Planit, Eturnity, HERO, OpusFlow

- **SolarEdge Designer:** je zdarma s účtem SolarEdge. Návrh je jen se střídači a optimizéry SolarEdge, stringy se automaticky ověřují podle pravidel SolarEdge a výstupem je BOM report a nabídka s 3D modelem. CRM ani e-podpis nemá ([solarpowerworldonline.com](https://www.solarpowerworldonline.com/2018/06/solaredge-web-based-design-tool-helps-installers-create-compelling-proposals/), [pv-tech.org](https://pv-tech.org/solaredge-bolsters-design-tool-to-streamline-ci-rooftop-planning-process), recenze konkurenta [heavengreenenergy.com](https://www.heavengreenenergy.com/blog/solaredge-designer-review)). Oficiální stránka vrátila chybu 403. Tigo v něm podle mě navrhnout nejde, protože je jen pro SolarEdge (vlastní úsudek).
- **Solar-Planit (BayWa r.e.):**
  - Funkce: zdarma, katalog a ceny BayWa podle zákazníka, kontrola kompatibility napříč výrobci včetně baterie ke střídači, výpočet konstrukce novotegra se zónami větru a sněhu, kompletní kusovník, který jde rovnou do košíku e-shopu BayWa ([solar-planit.com](https://solar-planit.com/), [baywa-re.lu](https://solar-distribution.baywa-re.lu/en/services/free-engineering-tool-solar-planit)).
  - Jazyky: DE, EN a FR. Čeština: neověřeno.
  - Riziko: BayWa od roku 2023 hledá kupce pro divizi Solar Trade ([solarserver.de](https://www.solarserver.de/2023/03/01/baywa-r-e-plant-verkauf-der-geschaeftseinheit-solar-trade/)).
- **Eturnity:**
  - Katalog: u komponenty se drží cena dodavatele, náklady na montáž, marže a DPH. Ukazatel ziskovosti ukáže, kolik zbývá prostoru pro slevu. Ceny se synchronizují s distributory ([angebote-vertrieb](https://www.eturnity.com/de/angebote-vertrieb)).
  - Návrh: stringy, MPPT a baterie podle norem ([technische-planung](https://www.eturnity.com/de/technische-planung)). Konstrukci počítají partneři K2, Clenergy a další ([partneři](https://www.eturnity.com/de/unsere-partner)).
  - Nabídka: k PDF se automaticky přikládají datasheety.
  - Firma se v březnu 2026 spojila se Solar Monkey ([netzwoche.ch](https://www.netzwoche.ch/news/2026-03-25/schweizer-tech-firma-eturnity-fusioniert-mit-solar-monkey)). Cena není zveřejněná a česká verze není ([eturnity.com](https://www.eturnity.com/de)).
- **HERO Software:**
  - Ceny: prodejní cena = nákup + přirážka v % nebo €, přirážku jde přepsat u řádku. Položka „výkon“ spojuje materiál, práci a stroj, takže funguje jako sada ([kalkulace](https://hero-software.de/features/kalkulationsprogramm)).
  - Import ceníků velkoobchodů: Datanorm, IDS Connect, UGL. DATEV jen jako CSV ([rozhraní](https://hero-software.de/features/schnittstellen)).
  - Podpis jen na zařízení, ne přes odkaz ([podpis](https://hero-software.de/features/digitale-unterschrift)).
  - Ceník (dvě čísla podle přepínače měsíční/roční platby) ([ceník](https://hero-software.de/preise)):

    | Tarif | Cena měsíčně | Další licence Standard | Licence App |
    |---|---|---|---|
    | Select | 69/79 € | – | 22/25 € |
    | OS | 119/135 € | 69/79 € | 22/25 € |
    | OS Plus | 299/345 € (+ placený onboarding) | 69/79 € | 22/25 € |

- **OpusFlow:**
  - Marže se počítá z BOM ještě před odesláním nabídky ([nabídky](https://opusflow.io/modules/quotations/)).
  - BOM se převádí na objednávky rozdělené podle dodavatele a sklad se rezervuje k projektu ([nákup a sklad](https://opusflow.io/modules/purchasing-stock/)).
  - E-podpis a sledování, kdy zákazník nabídku otevřel ([nabídky](https://opusflow.io/modules/quotations/)).
  - Cena: 99 € za uživatele měsíčně při roční platbě, 119 € měsíčně, minimálně 3 licence, onboarding od 1 500 € ([pricing](https://opusflow.io/pricing)).

### 3.8 Česká CRM a specializované nástroje

- **Wue** (Wue Technologies, Brno):
  - Funkce: nabídky FVE a tepelných čerpadel, CRM, smlouvy, předávací protokoly, podklady pro NZÚ, objednávky přes SOLSOL, Make, webová aplikace i na mobilu ([wue.cz](https://wue.cz/)).
  - Cena: 650 Kč za uživatele měsíčně při ročním nebo dvouletém závazku, DPH neuvedeno. Konfigurátor Fohet stojí 190 Kč za uživatele navíc. 14 dní zdarma ([wue.cz](https://wue.cz/)).
  - Do firmy vstoupily SOLSOL a Nay-Datart ([seznamzpravy.cz](https://www.seznamzpravy.cz/clanek/ekonomika-firmy-solsol-a-nay-datart-vstupuji-do-brnenskeho-softwaroveho-start-upu-wue-282727)).
  - Nákupní ceny a marže, kompatibilita, výpočet sestavy, role a e-podpis: neověřeno.
- **FreshFlow:** CRM pro FVE firmy s ceníky, produkty a nákladovými položkami, nabídky z obchodního případu, mobilní aplikace. 290 Kč za uživatele měsíčně bez DPH ([freshflow.app](https://freshflow.app/cs/crm-pro-fotovoltaicke-firmy/)). PDF, e-podpis, role a API: neověřeno.
- **Raynet CRM:**
  - Produkty a ceníky podle měny, skupiny zákazníků nebo pro slevy. Obsah nápovědy znám jen z indexu vyhledávače, stránky vracely chybu 403 ([produkty](https://support.raynetcrm.com/hc/en-us/articles/201803727-Using-Products), [ceníky](https://support.raynetcrm.com/hc/en-us/articles/201657546-Using-Price-Lists)).
  - Tiskové šablony .docx a PDF ([šablony](https://support.raynetcrm.com/hc/en-us/articles/7246834937489-10-Custom-Templates)).
  - E-podpis jako doplněk: 250 Kč za 15 dokumentů, 490 Kč za 35 dokumentů ([ceník](https://raynet.cz/cenik/)).
  - Cena: START 449 Kč, PROFESSIONAL 949 Kč, ULTIMATE 1 199 Kč za uživatele měsíčně. DPH na stránce není uvedené ([ceník](https://raynet.cz/cenik/)).
  - Raynet uvádí přes 130 FVE firem jako zákazníky. Oborovou nadstavbu dělají partneři: dokumenty pro NZÚ, ČEZ, PRE a EG.D ([raynet.cz/fve](https://raynet.cz/oborova-reseni/crm-pro-fotovoltaiky/)).
  - Partner Bubble Development napojuje Fakturoid, iDoklad a ABRA Flexi a účtuje 1 750 Kč za hodinu bez DPH ([crm-pro-fve](https://www.bubbledevelopment.cz/crm-pro-fve/), [ceník](https://www.bubbledevelopment.cz/cenik/)).
- **Pipedrive:**
  - Produkty mají cenu a informativní pole „Náklad“, cenu pro každou měnu a cenové varianty ([nápověda](https://support.pipedrive.com/cs/article/products)).
  - Nabídky s e-podpisem v Premium a Ultimate.
  - Cena: 14–79 € za uživatele měsíčně při roční platbě, bez DPH ([ceník](https://www.pipedrive.com/cs/pricing)). Zdroje si odporují v tom, od jakého tarifu jsou Smart Docs.
  - Čeština od roku 2022 ([destinationcrm.com](https://www.destinationcrm.com/Articles/CRM-News/CRM-Across-the-Wire/Pipedrive-CRM-Supports-4-New-Languages-153480.aspx)).
- **Caflou:** nabídky, objednávky a faktury, API a Make ([getapp.com](https://www.getapp.com/all-software/a/caflou/)). Platí se kreditem, příklad výrobce: 10 uživatelů = 80 € měsíčně bez DPH ([caflou.com](https://www.caflou.com/what-do-the-price-list-items-mean)).
- **Bezplatné konfigurátory výrobců a velkoobchodů:**
  - Fronius Solar.configurator: stringy, střídač, kompatibilní baterie, bez cen ([fronius.com](https://www.fronius.com/cs-cz/czech-republic/solarni-energie/instalacni-firmy-a-partneri/vyrobky-a-reseni/monitoring-a-digitalni-nastroje-pro-vas-fotovoltaicky-system/konfigurace-fotovoltaickeho-systemu-fronius-solarconfigurator)).
  - ifTECH Solar konfigurátor: konstrukce KRAJICZECH, ceny po přihlášení, výstup PDF nebo objednávka. Zdroj je sponzorovaný článek z roku 2023 ([tzb-info](https://oze.tzb-info.cz/fotovoltaika/25514-solar-konfigurator)).
  - DEKSOFT FVE: simulace výroby za 3 500 Kč ročně bez DPH ([deksoft.eu](http://deksoft.eu/fve)).
  - GVOLT B2B: katalog s cenami po přihlášení ([b2b.gvolt.eu](https://b2b.gvolt.eu/cz/)).
- **Rozpočtářský software:** KROS 4 ([urs.cz](https://www.urs.cz/software-a-data/kros-4-ocenovani-a-rizeni-stavebni-vyroby)), BUILDpower S ([rts.cz](https://www.rts.cz/)) a euroCALC ([callida.cz](https://www.callida.cz/)) jsou pro rozpočtáře. Ceny nezveřejňují. Úsudek: hodí se na položkový rozpočet stavby, ne na rychlé obchodní nabídky s katalogem FVE.

### 3.9 Střechy

- **Roofr:**
  - Položky musí být v katalogu, než jdou dát do šablony. Typ ziskovosti se volí u nabídky, tedy marže, nebo přirážka. Množství jde převzít z měření střechy. Položky lze zákazníkovi skrýt a v kalkulaci je přitom nechat. Podepsat jde na místě i odkazem ([help](https://help.roofr.com/en/articles/15525824-how-to-create-a-roofr-proposal)).
  - Jedna nabídka může mít víc možností a zákazník může přijmout i víc naráz ([šablony](https://help.roofr.com/en/articles/15588886-how-to-create-a-roofr-proposal-template), [roofr.com/proposals](https://roofr.com/proposals)).
  - Cena je paušál bez poplatků za uživatele: 249 $ (Essentials) a 349 $ (Scale) měsíčně ([pricing](https://roofr.com/pricing)).
- **KM BETA KALKULÁTOR:** výpočet materiálu a ceny střechy, online aktualizace ceníků, nastavitelná sleva, funguje offline, zdarma. Zdroj je propagační článek ([ceskestavby.cz](https://www.ceskestavby.cz/clanky/planujete-novou-strechu-spocitejte-si-naklady-za-par-minut-21843.html)).
- **Bramac:** výpočet materiálu z dokumentace zdarma přes konfigurátor. Bez dokumentace nabízí zaměření z leteckého snímku (Bramac Scan). Zdroj je sponzorovaný článek ([ceskestavby.cz](https://www.ceskestavby.cz/clanky/jak-snadno-a-rychle-spocitat-cenu-nove-stresni-krytiny-35902.html)).

### 3.10 Účetnictví a e-podpis v ČR

- **Pohoda:**
  - XML import pokrývá nabídky, poptávky, objednávky, faktury, zakázky, zásoby a adresy ([stormware.cz](https://www.stormware.cz/pohoda/xml/dokladyimport/)).
  - mServer je HTTP/XML server uvnitř Pohody. Potřebuje běžící instanci a výrobce ho doporučuje jen ve vnitřní síti ([mServer](https://www.stormware.cz/pohoda/xml/mserver/)).
- **Money S3:** API (GraphQL) stojí 4 990 Kč ročně bez DPH. Pokrývá faktury, objednávky, sklad a ceníky, nabídky ani zakázky nezmiňuje ([money.cz](https://www.money.cz/money-s3/api/)).
- **Money S4/S5:** mezi napojenými systémy uvádí Raynet. Veřejné API není popsané ([moneyerp.com](https://moneyerp.com/cs-cz/money-s5)).
- **Fakturoid API v3:** faktury, platby, kontakty, skladové položky, webhooky a OAuth 2 ([fakturoid.cz](https://www.fakturoid.cz/api/v3)).
- **Signi:**
  - Tarif Pay as you go: 38 Kč za dokument, 10 dokumentů měsíčně, DPH neuvedeno.
  - API od tarifu Scaleup, BankID Sign ([ceník](https://www.signi.com/cs/cenik/)).

## 4. Co z toho plyne

- Ve všech prověřených nástrojích jsou nabídky postavené na **katalogu s cenami**. Nákupní cenu s marží a právy na ni ale doložitelně drží jen Reonic, OpenSolar, Pylon, Eturnity, HERO a OpusFlow. Aurora a Solargraf drží jen prodejní cenu.
- **Kontroly kompatibility** jsou hlavně stringy vůči MPPT, a to jako varování. Párování baterie se střídačem doložila jen Aurora a Solar-Planit.
- **Kusovník konstrukce** si nástroje většinou nepočítají samy. Přebírají ho z konfigurátoru výrobce konstrukce (K2, Esdec, IronRidge, novotegra, KRAJICZECH).
- **Schvalování slev** jako workflow jsem nedoložil u žádného nástroje. Všude se to řeší oprávněními, šablonami slev a příplatky, které obchodník nesmí odebrat.
- **Čeština:** z FVE nástrojů ji doložitelně mají jen české produkty (Wue, FreshFlow, Raynet) a web EasySolar. OpenSolar, Aurora a Eturnity ji výslovně nemají.
- **Střecha a FVE v jedné nabídce:** to doložitelně neumí žádný nástroj.

## 5. Osvědčené postupy pro vlastní admin PROOZE

1. **Katalog je jediný zdroj cen.** Položka má výrobce, model, kategorii (panel, střídač, baterie, optimizér Tigo, wallbox, konstrukce, rozvaděč, řízení Infigy, krytina, klempířina, práce), jednotku, nákupní cenu, prodejní cenu nebo přirážku, dodavatele a datasheet. Ruční řádek je výjimka. Vzor: Roofr, Reonic, OpenSolar ([Roofr](https://help.roofr.com/en/articles/15525824-how-to-create-a-roofr-proposal), [OpenSolar](https://support.opensolar.com/hc/en-us/articles/12363053307663)).
2. **Prodejní cena = nákup + přirážka, výjimka u řádku.** Globální přirážka podle kategorie, u konkrétního řádku jde přepsat. Vzor: HERO ([kalkulace](https://hero-software.de/features/kalkulationsprogramm)).
3. **Ceny se needitují, ukládají se jako nové záznamy s datem platnosti.** Nabídka drží cenu z doby vytvoření a změny katalogu platí jen pro nové nabídky. Vzor: Pylon, Aurora, OpenSolar ([Pylon API](https://app.getpylon.com/docs/api), [Aurora](https://help.aurorasolar.com/hc/en-us/articles/6828599323155), [OpenSolar](https://support.opensolar.com/hc/en-us/articles/17378717682191)).
4. **Marži a nákup vidí jen oprávněná role, v nabídce se nikdy neukážou.** Obchodník vidí prodejní cenu a ukazatel, kolik prostoru na slevu ještě má (v PROOZE jako minimální marže). Vzor: OpenSolar, Reonic, Eturnity, Pylon ([OpenSolar](https://support.opensolar.com/hc/en-us/articles/12299933220111), [Reonic](https://docs.reonic.com/docs/en/settings-company-user-teams), [Eturnity](https://www.eturnity.com/de/angebote-vertrieb)).
5. **Slevy a příplatky jdou přes pravidla a práva, ne volný text.** Šablony slev, právo na volnou slevu a automatické příplatky (sklon, podlaží, typ střechy, velikost), které obchodník nesmí odebrat. Schválení slevy pod minimální marží si PROOZE může přidat jako jednoduchý krok navíc, hotové nástroje to doložitelně nemají. Vzor: OpenSolar a Aurora ([OpenSolar](https://support.opensolar.com/hc/en-us/articles/13294907030927), [Aurora](https://help.aurorasolar.com/hc/en-us/articles/19843311586323)).
6. **Sestavy se skládají z balíčků a doplňků.** Balíček („FVE 10 kWp hybrid“, „falcovaný plech“) nahradí obsah kategorie, doplněk (wallbox, Tigo, Infigy, sněhové zábrany) se přičte. Vzor: Reonic a HERO ([Reonic](https://docs.reonic.com/docs/en/settings-planning-and-offer-planning-packages-and-templates), [HERO](https://hero-software.de/features/kalkulationsprogramm)).
7. **Množství a práce se počítají z parametrů.** Za kWp, kWh, panel, m², bm nebo ks, i v pásmech. Vzor: Pylon, OpenSolar, Solargraf ([Pylon](https://getpylon.com/blog/march-2025-update/), [Solargraf](https://www.solargraf.com/help-center/article/how-to-set-up-solar-pricing-tables)).
8. **Kompatibilita jako varování.** Tabulka povolených kombinací baterie–střídač a střídač–optimizér plus kontrola napětí a proudu stringu. Nekompatibilní volba ukáže červené varování. Vzor: OpenSolar a Aurora ([OpenSolar](https://support.opensolar.com/hc/en-us/articles/12382487281935), [Aurora](https://help.aurorasolar.com/hc/en-us/articles/51222623384851)).
9. **Konstrukci nepočítat vlastními pravidly, převzít ji z konfigurátoru výrobce** (ifTECH/KRAJICZECH, K2) a do nabídky ji naimportovat. Vzor: Aurora, Eturnity, Solargraf ([Aurora](https://help.aurorasolar.com/hc/en-us/articles/28454358892947), [tzb-info](https://oze.tzb-info.cz/fotovoltaika/25514-solar-konfigurator)).
10. **Varianty A/B/C v jedné nabídce, nejvýš 3 se srovnáním.** Podepsaná varianta se zamkne a změna znamená novou verzi. Vzor: Solargraf a Reonic ([Solargraf](https://www.solargraf.com/help-center/article/good-better-best-creating-multiple-project-options), [Reonic](https://docs.reonic.com/docs/en/offers-overview-overview-offer-characteristics)).
11. **Online nabídka s přijetím přes odkaz.** Platnost odkazu, záznam času, IP a stavu (odesláno, otevřeno, přijato), podpis i na tabletu. Kvalifikovaný podpis jen tam, kde je potřeba, přes Signi. Vzor: Reonic, Pylon, OpusFlow ([Reonic](https://docs.reonic.com/docs/en/offers-finalise-cat-preview-variants-legal-texts-offer-link-validity), [Pylon](https://www.getpylon.com/solutions/e-signatures/), [Signi](https://www.signi.com/cs/cenik/)).
12. **U každého řádku jde nastavit, jestli ho zákazník vidí.** Rozpočet pak jde po položkách, po skupinách, nebo jen celkem. Vzor: Reonic, Pylon, Roofr.
13. **Datasheety komponent se k PDF přikládají automaticky.** Vzor: Eturnity ([angebote-vertrieb](https://www.eturnity.com/de/angebote-vertrieb)).
14. **Přijatá nabídka se mění na objednávky podle dodavatele a doklad do účetnictví.** U PROOZE to znamená XML import nabídky nebo zakázky do Pohody, případně API Fakturoidu nebo Money S3. Vzor: OpusFlow ([OpusFlow](https://opusflow.io/modules/purchasing-stock/), [Pohoda XML](https://www.stormware.cz/pohoda/xml/dokladyimport/), [Fakturoid](https://www.fakturoid.cz/api/v3)).
15. **Ceníky dodavatelů se importují, ne opisují.** CSV nebo XLSX v ČR, v DE standard Datanorm. Vzor: HERO, EasySolar, Pylon ([HERO](https://hero-software.de/features/schnittstellen), [EasySolar](https://user-guide.easysolar.app/discover/warehouse/)).

## 6. Stavět, nebo koupit

### Doporučení

**Postavit vlastní admin nabídek** jako rozšíření stávajícího generátoru o databázi, přihlášení a postupy z kapitoly 5. **Nestavět vlastní návrh panelů na střeše, simulaci výroby ani výpočet konstrukce.** Na to používat bezplatné nástroje výrobců (Fronius Solar.configurator, SolarEdge Designer, ifTECH) a výsledek přenášet do nabídky.

### Proč

1. **Střecha + FVE v jedné nabídce.** Žádný z prověřených nástrojů to doložitelně neumí. FVE nástroje by pokryly jen polovinu nabídek a střechy by dál běžely jinde.
2. **České nástroje nemají doložené klíčové funkce.** Wue a FreshFlow jsou česky a levné, ale nákupní cena s marží, kompatibilita a automatická sestava u nich nejsou doložené. Raynet je obecné CRM bez výpočtu sestavy.
3. **Zahraniční nástroje s nejlepší cenotvorbou nejsou česky.** OpenSolar, Aurora a Eturnity češtinu nemají a česká měna je neověřená. Reonic a Eturnity nezveřejňují cenu.
4. **Základ už existuje.** Šablony střech i FVE, PDF layout, stavy nabídek i Vercel API. Chybí databáze, přihlášení, katalog, balíčky, varianty a odkaz na přijetí.

### Kdy naopak koupit

- Pokud PROOZE nechce nic vyvíjet ani udržovat, je nejlepší kandidát z hlediska jazyka a trhu **Wue**. Nejdřív ale ověřit na demu nákupní ceny, marže, automatickou sestavu a střešní položky.
- Pro CRM bez nabídek je v CZ zavedený **Raynet** (130+ FVE firem podle výrobce). Nabídky pak může dělat vlastní admin a do Raynetu je posílat přes API.

### Hrubé náklady

Pro srovnání počítám s **5 obchodníky**, to je předpoklad. Výpočty vycházejí ze zveřejněných ceníků.

| Varianta | Měsíčně | Jednorázově | Poznámka |
|---|---|---|---|
| **Vlastní admin** (Supabase Pro + Vercel Pro) | cca 45 $ ([Supabase](https://supabase.com/pricing): od 25 $; [Vercel](https://vercel.com/pricing): 20 $ za vývojáře) + Signi 38 Kč za dokument, pokud bude potřeba ([Signi](https://www.signi.com/cs/cenik/)) | MVP **odhadem 120–250 h** práce | Hodiny jsou můj odhad, ne údaj z trhu. MVP = katalog, ceníky, balíčky, množství z parametrů, varianty a verze, role, PDF, odkaz na přijetí. Údržba ceníků zůstává na PROOZE. |
| Wue | 5 × 650 = 3 250 Kč (+ Fohet 5 × 190 Kč) | 0 | Roční závazek, DPH neuvedeno ([wue.cz](https://wue.cz/)). |
| FreshFlow | 5 × 290 = 1 450 Kč bez DPH | 0 | [freshflow.app](https://freshflow.app/cs/crm-pro-fotovoltaicke-firmy/) |
| Raynet PROFESSIONAL | 5 × 949 = 4 745 Kč + e-podpis od 250 Kč | Nadstavba přes partnera 1 750 Kč/h bez DPH | [raynet.cz](https://raynet.cz/cenik/), [bubbledevelopment.cz](https://www.bubbledevelopment.cz/cenik/) |
| EasySolar Business+ | 69 + 4 × 20 = 149 € | 0 | [CZ ceník](https://easysolar.app/cs/cenik-3/) |
| OpenSolar | 0 | 0 | Bez češtiny v nabídce ([support](https://support.opensolar.com/hc/en-us/articles/5552233154575)) |
| HERO OS | 119/135 € + 4 × 69/79 € = 395–451 € | 0 | [hero-software.de](https://hero-software.de/preise) |
| OpusFlow | 5 × 99 = 495 € (ročně) | onboarding od 1 500 € | [opusflow.io](https://opusflow.io/pricing) |
| Aurora Basic | 5 × 135 = 675 $ (ročně) | 0 | [aurorasolar.com](https://aurorasolar.com/pricing) |
| Solargraf Small Business | 4 799 $ ročně za 4 uživatele + 960–1 440 $ za pátého | 0 | [solargraf.com](https://www.solargraf.com/pricing) |
| Reonic, Eturnity | nezveřejněno | nezveřejněno | Jen přes obchod |

### Doporučené kroky

1. Za 1–2 týdny projít demo **Wue** a zkušební verzi **OpenSolar** (zdarma) jako měřítko cenotvorby. U Wue se ptát na nákupní ceny, marže, sestavy, střešní položky a export do účetnictví.
2. Když Wue klíčové funkce neumí, začít s vlastním MVP v tomto pořadí:
   1. katalog a ceníky,
   2. balíčky a výpočet množství,
   3. varianty a verze,
   4. role a minimální marže,
   5. odkaz na přijetí,
   6. export do Pohody nebo Fakturoidu.

## 7. Omezení rešerše

- Během rešerše se vyčerpal limit vyhledávání, některé body proto zůstaly neověřené:
  - eWay-CRM, Flowlu, Bitrix24,
  - nástroje distributorů Kesoft, Solar Distribution, Fenix a Sunnysun,
  - slovenské nástroje.
- Oficiální stránka SolarEdge Designer vrátila chybu 403. Část faktů je z recenzí, jedna z nich je od konkurenta.
- Nápověda Raynetu vracela chybu 403. Obsah je převzatý z indexu vyhledávače.
- Na stránce wue.cz byl text adresovaný AI asistentům s pokynem, co o produktu napsat. Nebral jsem ho jako zdroj informací ani jako instrukci. Fakta o Wue jsou jen z viditelného obsahu webu a z článku Seznam Zpráv.
