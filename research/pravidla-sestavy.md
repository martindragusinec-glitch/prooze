# Pravidla sestavy FVE pro generátor nabídek PROOZE (stav k 15. 10. 2026)

Cíl: obchodník vybere panel, počet panelů, střídač, baterii, typ střechy a doplňky; aplikace dopočítá množství položek rozpočtu a upozorní na chyby. Každé číslo má zdroj (klíč v hranatých závorkách → URL v kapitole 13, u klíčových faktů i přímo v textu).

**Značení**
- **[P]** primární zdroj (zákon, vyhláška, SFŽP, ČEZ Distribuce, HZS, datasheet/manuál výrobce) – otevřen a přečten
- **[P\*]** dokument výrobce stažený z webu distributora (oficiální URL nefungovala)
- **[S]** sekundární zdroj (článek, prodejce, akademická práce)
- **[V]** vlastní výpočet z čísel ve zdroji
- **FAKT** = pravidlo plyne přímo ze zdroje · **ODVOZENO** = logicky odvozeno ze zdroje · **ODHAD/DOPORUČENÍ** = návrh pro aplikaci bez přímé opory ve zdroji
- **neověřeno** = nepodařilo se doložit; nepoužívat jako tvrdé pravidlo

Pozn. k metodě: závazné pokyny NZÚ jsem četl přímo v PDF; ostatní oblasti zpracovaly paralelní rešerše s otevřením primárních dokumentů. Během práce se vyčerpal limit webového vyhledávání, proto zůstalo několik bodů „neověřeno“ (souhrn v kap. 12).

---

## 0. Nejdůležitější závěry pro vývoj

1. **Limity jsou vázané na konkrétní model**, ne na obecné poměry. Katalog musí u každého střídače, panelu a baterie nést technické parametry (kap. 11), jinak kontroly nejdou udělat.
2. **DC/AC strop podle výrobce:** GoodWe ET PLUS+ 150 %, GoodWe ET G2 až 160 % (ne trvale), SolaX X3-Hybrid G4 200 %. Běžná praxe 1,13–1,30. Pravidlo „DC/AC > 1,5 = chyba“ tedy platí jen pro GoodWe ET PLUS+.
3. **NZÚ úvěr:** min. 3 kWp, třífázové připojení, nová lithiová baterie s **jmenovitou kapacitou v kWh ≥ kWp**, střídač dle EN 50549-1, panely s účinností ≥ 18 %, jen nový systém. Úvěr = 25 000 Kč/kWp + 15 000 Kč/kWh, max. 400 000 Kč.
4. **Požár:** TOTAL STOP (vypínací prvek dle ČSN 73 0848) patří ke **každé** FVE na budově. Bezpečné DC napětí (≤ 120 V v každé části DC rozvodu, tj. Tigo TS4-A-F/2F na všech panelech + RSS, nebo jiné řešení) je **povinné u RD nad 10 kWp**; do 10 kWp jen doporučené.
5. **Připojení k DS:** zjednodušené připojení i připojení na oznámení jen do **10,8 kW**; instalovaný výkon = součet kWp, u hybridu vyšší z (kWp, výkon střídače). Typický RD nad 10,8 kW jde standardní žádostí. Jednofázová výrobna max. **3,7 kVA na fázi**.
6. **Konstrukce:** žádný výrobce (K2, Schletter, Renusol) neuvádí pevný počet háků na panel – vždy podle statického výpočtu. Aplikace může počítat jen orientačně a musí to v nabídce napsat.
7. **Pozor na kombinaci GoodWe ET + Tigo TS4-A-F/2F:** prohlášení o kompatibilitě GoodWe–Tigo (11/2025) tyto typy neuvádí, partnerská stránka Tigo ano → ověřit dřív, než se z toho udělá standardní sestava.

---

## 1. Výkon FVE a poměr DC/AC

**Definice výkonu (FAKT):** instalovaný výkon FVE = součet jmenovitých výkonů všech modulů při STC (u bifaciálních jen z čelní strany), v kWp. [NZU-U, kap. Definice; VYHL16 § 2 písm. f)]
→ `kWp = počet panelů × Wp / 1000`

**Poměr DC/AC** = kWp / jmenovitý AC výkon střídače.

### 1.1 Limity výrobců hybridních střídačů

| Střídač | Jmen. AC | Max. DC výkon FV pole | Max. DC/AC | Zdroj |
|---|---|---|---|---|
| GoodWe GW5K-ET (ET PLUS+) | 5 000 W | 7 500 W | 150 % | [G1] [P], „150% DC oversizing“ [G4] [P] |
| GoodWe GW6.5K-ET | 6 500 W | 9 700 W | ≈ 149 % [V] | [G1] [P] |
| GoodWe GW8K-ET | 8 000 W | 12 000 W | 150 % | [G1] [P] |
| GoodWe GW10K-ET | 10 000 W | 15 000 W | 150 % | [G1] [P] |
| GoodWe ET PLUS+ 16A (GW5KN…10KN-ET) | jako výše | jako výše | 150 % | [G2] [P] |
| GoodWe ET G2: GW6000 / GW8000 / GW10K-ET-20 | 6 / 8 / 10 kW | 9 600 / 12 800 / 16 000 W | „up to 160 %“, ne trvale | [G5] [P] |
| SolaX X3-Hybrid-5.0 / 6.0 / 8.0 / 10.0-D G4 | 5 / 6 / 8 / 10 kW | max. doporučené FV pole 10 / 12 / 16 / 20 kWp | „200 % PV oversizing“ | [S1] [P] |

Pozn.: model „GW6K-ET“ v řadě ET PLUS+ neexistuje (řada je 5K / 6.5K / 8K / 10K). [G1]

**Běžná praxe:** poměr DC/AC (ILR) „usually between 1.13 and 1.30“; průměr systémů do 1 MW v USA 1,17. [E1] [S] (U.S. EIA, 16. 3. 2018 – americký trh, pro ČR jen orientačně)

**Pravidla pro aplikaci**
- kWp > max. DC výkon střídače → **CHYBA** (FAKT, [G1] [G5] [S1])
- DC/AC > 1,30 → **INFO** „nad běžnou praxí, počítat s ořezem výkonu v poledne“ (ODHAD opřený o [E1])
- DC/AC < 0,8 → **INFO** „střídač zbytečně velký“ (ODHAD, bez zdroje)

---

## 2. Stringy – napětí a proudy

### 2.1 Vzorec (FAKT)
- **Max. počet panelů ve stringu:** `n_max = floor( U_DC,max / (Voc × (1 + β_Voc/100 × (T_min − 25))) )`
  Zdroj: Trina User Manual UM-M-0002 (06/2023), s. 27–28: vzorec „Max System Voltage ≥ N × Voc × [1 + TC_Voc × (Tmin − 25)]“, Tmin = minimální teplota okolí [TR-M] [P\*]. Česky totéž ve VUT práci (2018, kap. 6.3) [VUT] [S].
- Když chybí β_Voc: korekční faktor Canadian Solar −6 až −10 °C → 1,14; −11 až −15 °C → 1,16; −16 až −20 °C → 1,18; −21 až −25 °C → 1,20 [CS] [P].
- **Min. počet panelů:** `n_min = ceil( U_MPPT,min / (Vmp × (1 + γ/100 × (70 − 25))) )` – Vmp při 70 °C; použití γ_Pmax místo (neuváděného) koeficientu Vmp je přiblížení [VUT] [S].

### 2.2 Návrhové teploty
- Fronius: „module temperature limits established on the market are −10 °C and +70 °C“ [FR-D] [P] (20. 11. 2024); zmírnění na 0 °C / 60 °C povoluje jen pro vyjmenované země – **ČR mezi nimi není**. Fronius Solar.configurator počítá Voc při −10 °C a Vmp při 70 °C [FR-C] [P\*].
- Oficiální návrhová minimální teplota pro ČR (TLEO dle IEC 62738 / IEC 62548): **neověřeno**.
- **DOPORUČENÍ:** výchozí T_min = −20 °C (konzervativnější než trh), nastavitelné v administraci; T_max článku 70 °C. Rozdíl mezi −10 a −25 °C mění n_max u dnešních panelů nejvýš o 1 panel [V].

### 2.3 Parametry dnešních panelů (STC) – proč brát čísla z konkrétního datasheetu

| Panel | Voc | Vmp | Isc | β_Voc | γ_Pmax | Zdroj |
|---|---|---|---|---|---|---|
| Trina TSM-440NEG9R.28 (144 článků) | 52,2 V | 44,0 V | 10,67 A | −0,24 %/°C | −0,30 %/°C | [TR-D] [P\*] |
| JA Solar JAM54D40-440/LB | 38,90 V | 32,47 V | 14,31 A (15,46 A s 10% ziskem zadní strany) | −0,250 %/°C | −0,290 %/°C | [JA-D] [P\*] |
| Aiko A450-MAH54Db (Neostar 2S+) | 40,94 V | 34,50 V | 14,12 A | −0,22 %/°C | −0,26 %/°C | [AI-D] [P\*] |
| LONGi LR7-54HVH-475M (Hi-MO X10) | 40,18 V | 33,16 V | 15,03 A | −0,200 %/°C | −0,260 %/°C | [LO-D] [P\*] |

Panely 440–450 W mají Voc od ~39 V (JA) po 52 V (Trina) → jednotné „pravidlo palce“ by bylo chybné.

### 2.4 Napěťová a proudová okna střídačů

| Parametr | GoodWe ET PLUS+ (K / KN) | GoodWe ET G2 | SolaX X3-Hybrid G4 |
|---|---|---|---|
| Max. DC napětí | 1 000 V; pro 1000V systém max. provozní 950 V | 1 000 V (975–1 000 V → standby) | 1 000 V |
| Rozsah MPPT / start | 200–850 V / 180 V | 120–850 V / 150 V | 180–950 V / 200 V |
| MPPT pro jmenovitý výkon | 5K 240–850 · 6.5K 310–850 · 8K 380–850 · 10K 460–850 V [G3] | neověřeno | neověřeno |
| Počet MPPT / stringů na MPPT | 2 / 1 | 6–8 kW: 2 / 1; 10 kW: 3 / 1 | 5–6 kW: 2 (1/1); 8–15 kW: 2 (2/1) |
| Max. vstupní proud na MPPT | 12,5 A (K) / 16 A (KN) | 16 A | 16/16 A (5–6 kW); 28/16 A (8–15 kW; s 1 stringem na PV1 20 A) |
| Max. zkratový proud na MPPT | 15,2 A (K) / 21,2 A (KN) | 24 A | 20/20 A; 35/20 A |
| Zdroj | [G1] [G2] [G3] [P] | [G5] [G6] [P] | [S1] [P] |

### 2.5 Pravidla pro aplikaci
| Kontrola | Závažnost | Typ |
|---|---|---|
| n × Voc(T_min) > 1 000 V | CHYBA (poškození střídače) | FAKT [TR-M] [G1] [S1] |
| GoodWe: n × Voc(T_min) > 950 V | CHYBA (střídač nebude pracovat) | FAKT [G1] [G5] |
| n × Vmp(70 °C) < dolní mez MPPT (GoodWe 200 V, ET G2 120 V, SolaX 180 V) | CHYBA | FAKT (meze) + přiblížení [VUT] |
| GoodWe ET PLUS+: n × Vmp(70 °C) < MPPT pro jmenovitý výkon (240/310/380/460 V) | VAROVÁNÍ „v horku nedosáhne plného výkonu“ | FAKT (meze [G3]) + přiblížení |
| n × Vmp(T_min) > horní mez MPPT (850 / 950 V) | VAROVÁNÍ (ztráta výnosu) | ODHAD |
| Isc panelu × paralelní stringy (u bifaciálních × zisk zadní strany) > max. zkratový proud MPPT | CHYBA | FAKT (limity [G1] [G2] [G5] [S1]) |
| Imp × paralelní stringy > max. vstupní proud MPPT | VAROVÁNÍ „ořezání proudu“ | FAKT (limity) |
| Počet stringů > počet vstupů (2 nebo 3 dle modelu) | CHYBA | FAKT [G1] [G5] [S1] |
| Paralelní stringy na jednom MPPT mají různý počet panelů / různou orientaci | VAROVÁNÍ | ODHAD (obecná praxe, bez zdroje) |

**Důležitý příklad [V]:** GoodWe GWxK-ET (12,5 A / Isc 15,2 A) + JA 440/LB (Isc 14,31 A, s bifaciálním ziskem 15,46 A) → CHYBA zkratového proudu; řešením je varianta KN (16 A / 21,2 A). Aiko 450 (Isc 14,12 A, Imp ≈ 450/34,5 = 13,0 A) na modelu K projde zkratovým limitem, ale proud se ořízne na 12,5 A → VAROVÁNÍ.

---

## 3. Baterie a kompatibilita

### 3.1 Kompatibilita (FAKT)
- **GoodWe ET 5–10 kW (ET PLUS+ i 16A)** – oficiální matice GoodWe 20260910-V029.1 [G7] [P]:
  - kompatibilní: Lynx Home F LX F6.6 / 9.8 / 13.1 / 16.4-H (FW ARM ≥ 19); Lynx Home F G2 LX F9.6 / 12.8 / 16.0 / 19.2 / 22.4 / 25.6-H-20 (ARM ≥ 25, DSP ≥ 09); Lynx D LXD5.0-10; BYD HVS 5.1–12.8, HVM 11.0–22.1
  - **nekompatibilní:** Lynx F G2 LX F6.4-H-20 a LX F28.8-H-20; Lynx D G2; BYD HVM 8.3, HVM+, HVB, HVS+
- **GoodWe ET G2:** kompatibilní Lynx Home F 6.6–16.4, Lynx F G2 F9.6–F28.8, Lynx D a D G2, BYD HVS/HVM (od 11.0)/HVM+/HVB/HVS+; nekompatibilní LX F6.4-H-20 [G7] [P].
- **SolaX X3-Hybrid G4 + T58 (T-BAT H 5.8):** „can connect at least 2 pcs T58 and up to 4 pcs“ [S2] [P]; systém T-BAT V1/V2 = 1× master + max. 3× slave HV11550 [S3] [P] → 2–4 moduly = 11,5 / 17,3 / 23,0 kWh. Kompatibilita T58 V3 s X3 G4: **neověřeno**. T30: min. 2, max. 4 [S2]; kapacita T30 neověřeno.

### 3.2 Parametry baterií
| Baterie | Modul | Počet modulů | Kapacita (dle výrobce) | Napětí | Zdroj |
|---|---|---|---|---|---|
| GoodWe Lynx Home F | LX F3.3-H, 3,27 kWh | 2–5 | 6,55 / 9,83 / 13,10 / 16,38 kWh („usable“ při 100 % DOD) | 204,8–512 V jmen. | [G9] [P\*] |
| GoodWe Lynx F G2 | LX F3.2-20, 3,2 kWh | 2–9 + PCU | 6,4–28,8 kWh po 3,2 kWh | 128–576 V jmen. | [G8] [P] |
| SolaX T58 V1/V2 | 5,8 kWh, 115,2 V | 2–4 u X3 G4 | 11,5 / 17,3 / 23,0 kWh; DOD 90 % | 200–524 V (dle počtu) | [S3] [P] |
| SolaX T58 V3 | 5,8 kWh | BMS + 1–5 | jmen. 5,8–34,6 kWh; usable 5,5–32,9 kWh (95 % DOD) | – | [S4] [P] |

Rozsah napětí baterie na střídači: ET PLUS+ 180–600 V, max. 25 A [G1]; ET G2 150–720 V, 30/40 A [G5]; SolaX G4 120–800 V, max. 30 A [S1] (vše [P]).

### 3.3 Pravidla
- Kombinace střídač + baterie mimo oficiální matici → **CHYBA** (FAKT [G7] [S2]).
- Počet modulů mimo min./max. (SolaX < 2 nebo > 4 T58) → **CHYBA** (FAKT [S2] [S3]).
- Napětí baterie mimo rozsah střídače → **CHYBA** (FAKT [G1] [G5] [S1]).
- Výkon baterie = min(max. nabíjecí výkon střídače; max. proud střídače × jmen. napětí baterie; jmen. výkon baterie) – zobrazit v nabídce (ODVOZENO z [G1] [G9]). Příklad [V]: LX F9.6-H-20 (192 V) × 25 A ≈ 4,8 kW na ET PLUS+.
- Do kontroly NZÚ vstupuje **jmenovitá kapacita deklarovaná výrobcem** (ne snížená vybíjecími cykly) [NZU-U 3.2.3.2 e)] [P]. U GoodWe Lynx je deklarovaná hodnota „usable“ (6,55 / 9,83 / 13,10 / 16,38 kWh), u SolaX T58 jmenovitá 5,8 kWh/modul. Že se pro NZÚ u GoodWe bere právě tato hodnota: ODVOZENO, ověřit u SFŽP při nejasnosti.

---

## 4. Tigo – odpojovače, optimizéry, řízení

### 4.1 Typy (FAKT)
| Typ | Moduly na kus | Max. výkon modulu | Max. napětí / proud | Potřebuje | Zdroj |
|---|---|---|---|---|---|
| TS4-A-F (Rev 3.5) | 1 | 700 W | max. vstup 80 V; Imp/Isc 15/20 A nebo 20/25 A | RSS Transmitter | [T1] [P] |
| TS4-A-F (725 W) | 1 | 725 W | VMP 12–80 V; 16/22 A; max. Voc neověřeno | RSS (bezdrátově volitelně TAP + CCA) | [T2] [P] |
| TS4-A-2F | 2 | 500 nebo 700 W na vstup | 80 V na vstup; 15/20 nebo 20/25 A | RSS Transmitter | [T3] [P] |
| TS4-A-O (725 W) – optimizér | 1 | 725 W | VMP 12–80 V; 16/22 A | TAP + CCA | [T4] [P] |

- TS4-A-F/2F: „Each module in a string must have its own TS4-A-F or share a TS4-A-2F with another module“ [T7] [P] → osazení **všech** panelů ve stringu.
- RSS Transmitter: 1 jádro = max. 10 stringů, 2 jádra = max. 20 stringů; max. 30 modulů na string; jádrem vedou jen záporné vodiče [T6] [P\*] [T7] [P].
- „Any built-in inverter PLC transmitters not used by the Tigo RSS system must be disabled.“ [T7] [P]
- TAP: až 300 TS4, nejbližší TS4 max. 10 m, nejvzdálenější max. 35 m [T8] [P]; CCA: až 900 TS4 přes až 7 TAP [T9] [P]. TS4-A-F/2F TAP ani CCA nepotřebují [T8] [T11].
- TS4-A-O: záruka 5 let, 25 let jen při trvalém připojení TS4 + TAP + CCA ke cloudu [T4] [P]. Pravidla „selective deployment“ (osazení jen části panelů): **neověřeno**.

### 4.2 Kompatibilita se střídači
- **SolaX X3-Hybrid G4** (5.0–15.0): TS4-A-O, -S, -F, -2F potvrzeny – Tigo-SolaX Compatibility Letter, 18. 5. 2026 [T13] [P].
- **GoodWe ET / ET PLUS+ / ET G2:** Compatibility Letter 24. 11. 2025 uvádí jen TS4-O, TS4-S, TS4-A-O (UHD), TS4-A-S – **TS4-A-F/2F v něm nejsou** [T12] [P]; partnerská stránka Tigo u ET uvádí i F/2F [T14] [P] → **rozpor, ověřit u GoodWe/Tigo**.
- Integrovaný Tigo RSS přijímač/vysílač v GoodWe ET nebo SolaX G4: **neověřeno** → počítat s externím RSS Transmitterem.

---

## 5. NZÚ 2026 – podmínky ovlivňující sestavu

Zdroje: SFŽP, Závazné pokyny NZÚ – rodinné domy, bezúročný úvěr, verze 1.1 (platné od 24. 6. 2026) [NZU-U] [P]; Závazné pokyny NZÚ Light – rodinné domy, verze 1.1 [NZU-L] [P]. Čísla odpovídají článkům prooze-web/src/blog/dotace-fotovoltaika-2026.html a nzu-light-2026.html.

### 5.1 Bezúročný úvěr NZÚ (běžné domácnosti) – kap. 3.2.3, str. 21–22
| Podmínka | Hodnota | Místo v ZP |
|---|---|---|
| Max. úvěr | 25 000 Kč/kWp + 15 000 Kč/kWh lithiové baterie, max. 400 000 Kč | 3.2.3.1 |
| Min. výkon, připojení | 3 kWp, připojení k síti **3-fázové** | 3.2.3.2 a) |
| Jen nový systém | ne rozšíření/úprava stávajícího, ne dodatečná baterie | 3.2.3.2 b) |
| Střídač | splňuje podmínky PDS a **EN 50549-1:2019** | 3.2.3.2 c) |
| Účinnost panelů (STC, na celou plochu modulu) | ≥ 18 % (mono/multi Si, bifaciální při 0 % zisku); 12 % tenkovrstvé | 3.2.3.2 d) |
| Kapacita baterie | jmenovitá deklarovaná výrobcem (10h vybíjení nebo kratší) | 3.2.3.2 e) |
| Baterie povinná | nová, **kWh ≥ kWp**; jen lithiové; olovo, NiCd, NiMH vyloučeny | 3.2.3.2 f) |
| Umístění | na podporované nemovitosti / doplňkové stavbě / konstrukci na pozemku | 3.2.3.2 g) |
| Dobíjecí stanice | způsobilý výdaj, parkovací místo na pozemku žadatele | 3.2.3.2 h) |
| Zelený bonus | nelze, je-li v OM jiná FVE s podporou dle zák. 180/2005 Sb. | 3.2.3 |
| Stáří domu | kolaudace před 1. 1. 2023 | 3.2 a), str. 14 |
| Montážník | dodavatel s oprávněním dle § 10d zák. 406/2000 Sb. | čl. t), str. 10 |
| Min. výše úvěru | 100 000 Kč | čl. i), str. 6 |
| Nezpůsobilé | „navýšení kapacity jističe“ | 7.3 b), str. 37 |

Pozn. [V]: při splnění 3 kWp a baterie ≥ 3 kWh vychází úvěr vždy ≥ 120 000 Kč, takže podmínka 100 000 Kč u samotné FVE prakticky nehrozí.
Maximální výkon FVE závazné pokyny 2026 **nestanoví** (hledáno v textu). Zmínka o „omezení na 5 kW“ ve fakta.md (D4) pochází z článku oEnergetice z **19. 12. 2024** o tehdejších dotacích [OEN-24] [S] a pro NZÚ 2026 neplatí.

### 5.2 NZÚ Light – FVE s ohřevem vody (kap. 3.2.3, str. 17–18)
- Paušál 120 000 Kč za „základní systém min. 3 kWp“; připojení **3-fázové** [NZU-L 3.2.3.2 a)].
- Akumulační ohřev TV, ohřívač **≥ 190 l** [b)]; **ochrana proti opaření** [c)]; **automatické připojení bivalentního zdroje** ohřevu [d)].
- Střídač dle EN 50549-1:2019 [f)]; účinnost panelů ≥ 18 % [g)]; baterie **není podmínkou** (je ale způsobilým výdajem, vč. repasovaných s garancí dodavatele – kap. 7) [NZU-L] [P].
- Systémy bez propojení s DS nejsou podporovány.

---

## 6. Připojení k distribuční soustavě (ČEZ Distribuce) a licence ERÚ

### 6.1 Fakta (vše [P])
- **Instalovaný výkon** pro připojení = součet kWp panelů; u hybridu se společným střídačem vyšší z hodnot (součet panelů, výkon střídače). [VYHL16 § 2 písm. f)] [PPNN kap. 4]
- **Mikrozdroj:** nn, jmenovitý AC proud **≤ 16 A na fázi** a instalovaný výkon **≤ 10,8 kW** (dříve 10 kW; změna vyhl. 248/2024 Sb. od 1. 10. 2024). [VYHL16 § 2 písm. d)] PPDS příl. 4 (verze 2025) stále uvádí 10 kW – vyhláška má vyšší sílu. [PPDS4]
- **Zjednodušené připojení** (bez přetoku, RV = 0): mikrozdroj/úložiště ≤ 10,8 kW (součet v OM), impedance smyčky < 0,47 Ω (16 A) / < 0,75 Ω (10 A), technické zamezení přetoku; lhůty 8 + 10 pracovních dnů. [VYHL16 § 16, znění 302/2025 Sb. od 1. 10. 2025]
- **Připojení na oznámení** (s přetokem): ≤ 10,8 kW, v OM není jiná výrobna ani úložiště, beze změny jističe a rezervovaného příkonu, RV ≤ instalovaný výkon, akumulace jen přes **společný střídač**, oznámení až po dokončení, PDS může do 30 dnů odmítnout; ČEZd doporučuje raději standardní žádost předem. [EZ § 28 odst. 5] [CEZ-28]
- **Nad 10,8 kW:** standardní žádost o připojení; lhůty pro nn: studie do 15 prac. dnů, návrh smlouvy do 15 prac. dnů, přijetí do 30 dnů. [VYHL16 § 6 odst. 5, § 8 odst. 4, § 9 odst. 3] Podíl na nákladech nn: **800 Kč/A** (3f), 320 Kč/A (1f). [VYHL16 příl. 2, § 12]
- **Jednofázová výrobna:** max. **3,7 kVA na fázi** (výkon střídače); 1f odběrné místo max. jistič 1×25 A. [PPNN čl. 4.1.7, 3.4.1] Hodnoty 4,6 kVA / 3,68 kW se v dokumentech ČEZd nevyskytují.
- **RV** lze sjednat nejvýše do součtu jmenovitých výkonů střídačů. [VYHL16 § 3 odst. 3] Rezervovaný příkon na nn = jmenovitá hodnota hlavního jističe. [VYHL16 § 2 písm. a)] Pravidlo „RV ≤ RP“: **neověřeno**.
- **Seznam schválených střídačů ČEZd** (XLSX, stav 21. 8. 2026) – doporučený „tip“, ne povinná příloha. [CEZ-STR] Regulace pod 100 kW: HDO 0/100 %, aktivní Q(U) a P(U). [PPNN 4.1.3–4.1.4]
- **Licence ERÚ na výrobu** je nutná pro výrobnu **nad 100 kW**, nebo pokud je ve stejném OM **jiná výrobna**, nebo při podpoře dle zákona o POZE; do 100 kW včetně se neuděluje při spotřebě v místě nebo bezúplatném sdílení. [EZ § 3 odst. 3 a odst. 4 písm. e), ve znění zák. 87/2025 Sb., účinnost 1. 8. 2025] [ERU-100] Licence na ukládání: nad 100 kW nebo jiné úložiště v OM. [EZ § 3 odst. 3 písm. c), d)] Zda se 100 kW počítá z kWp, nebo z výkonu střídače: **neověřeno**.
- Středočeský kraj: PDS ověřit podle EAN (u hranice s Prahou může jít o PREdistribuci) – **neověřeno**.

---

## 7. Požární bezpečnost FVE na RD

### 7.1 Povinné (vyhl. 114/2023 Sb. – ověřeno v textu) [L1] [P]
- **§ 2:** na budově jen panel s nehořlavou konstrukcí třídy A1/A2 (mimo fólie a izolační hmoty) a nosná konstrukce A1/A2.
- **§ 3 odst. 1:** odběrné místo odpojitelné od všech směrů napájení, označený vypínací prvek chráněný proti volné manipulaci (stačí v měřené části elektroměrového rozvaděče).
- **§ 3 odst. 2:** u výrobny na budově navíc vypínací prvek pro vypnutí el. zařízení v objektu dle **ČSN 73 0848**. Komentované znění MPO + GŘ HZS: „minimálně s funkcí TOTAL STOP“, u vstupu do objektu; u dodatečné instalace na stávající budovu lze samostatné tlačítko jen pro FVE vč. baterie, umístěné u hlavního vypínače a označené tabulkou. [Z2] [P] (komentář je právně nezávazný, HZS podle něj posuzuje). **Neplatí tu žádná výjimka pro malé výkony.**
- **§ 3 odst. 3:** bezpečná úroveň DC napětí v jakékoli části DC rozvodu; **výjimka: výrobna do 10 kW na stavbě rodinného domu**. Bezpečné = 120 V DC [Z2]; u baterie až po svorky baterie, spouštěné hlavním vypínačem / TOTAL STOP [Z3] [P]. Uznané cesty: rozpojení na části < 120 V, zkratování modulů, optimizéry s rapid shutdown, systém s malým napětím, jiné obvody určené výrobcem [Z2].
- **§ 4:** UV odolné venkovní kabely; rozvaděč, sběrač a střídač na konstrukci A1/A2 nebo na nehořlavé podložce **přesahující půdorys o ≥ 500 mm**; prostupy požárně dělicí konstrukcí utěsnit certifikovaným systémem dle ČSN 73 0810.
- Vyhláška je formálně pro výrobny do 50 kW; MMR (metodika 1/2026) ji vyžaduje u drobných staveb OZE do 100 kW. [L5] [P]
- Měnič s odpojovačem tak, aby DC část pod stálým napětím byla co nejkratší. [L2 příl. 3 bod 9] [P]
- Od 1. 1. 2026 je Central/Total stop požárně bezpečnostním zařízením (vyhl. 467/2025 Sb.) s roční kontrolou provozuschopnosti [L3] [P] [TZB-CS] [S]; zda se týká soukromého RD: **neověřeno**.

### 7.2 Doporučené / norma mimo závazné předpisy
- ČSN P 73 0847 (předběžná norma, účinná od 1. 6. 2024), příloha A „malý rozsah“ (FVE ≤ 10 kWp, baterie ≤ 20 kWh, OB1): v řadové zástavbě moduly ≥ 0,9 m od požárně dělicí stěny (0,3 m při BROOF(t3) a omezeném vývinu tepla); kabely nad hořlavou střechou v plných ocelových žlabech (výjimka B2ca + BROOF(t3)). [N1] [P – anotace] [EP-73] [S]
- Baterie nad 20 kWh = „složité podmínky pro zásah“. [Z3] [P] Baterii mimo únikovou cestu, na A1/A2 podklad, ideálně mimo obytný prostor. [Z5] [P] [EP-73] [S]
- Technický list FVE na dveřích elektroměrového rozvaděče, piktogram FVE. [Z3] [Z5] [P]
- Napětí stringu do 400 V doporučuje Solární asociace (technika jednotek PO). [Z5] [P] – DOPORUČENÍ, ne povinnost.
- HZS Pardubického kraje upozorňuje, že funkci optimizérů a odpojovačů za požáru nelze plně zaručit. [Z4] [P]

---

## 8. Konstrukce

### 8.1 Co říkají výrobci (FAKT)
- **Pevný počet háků/úchytů na panel neuvádí žádný z prověřených výrobců** – K2 (K2 Base vydá kusovník a statický posudek) [K2-SR] [K2-MR], Schletter („required number of roof hooks per square meter of module area“ ze statických tabulek; při velkém sněhu hák na každou krokev; v okrajové zóně na prvních dvou krokvích vždy) [SCH-TA] [P], Renusol (PV Configurator) [REN-VS] [P]. Statický výpočet dle místa (sníh, vítr) výrobci výslovně požadují [K2-SA] [SCH-R2] [P].
- **Svorky:** min. 4 na modul (Trina) [TR-M] [P\*]; Aiko min. 4, při vysokém zatížení min. 6 [AI-M] [P\*].
- **Kolejnice:** přesah za posledním hákem 50–300 mm (Renusol VS+) [REN-VS] [P]; K2 SingleRail: od konce kolejnice/spoje k rámu ≥ 50 mm, nejkratší řez ≥ 700 mm, spojka vždy mezi dvěma háky, tepelné dělení nejpozději po 17,6 m [K2-SR] [P].
- **Trapéz (K2 MultiRail):** plech ≥ 0,4 mm ocel / ≥ 0,5 mm hliník; počet krátkých kolejnic určuje K2 Base [K2-MR] [P].
- **Falc (K2):** odstup svorek od příponek ≥ 50 mm; tepelné dělení po 6,6 m (titanzinek/hliník 3,3 m) [K2-SS] [P].
- **Plochá střecha J / V-Z (K2 S-Dome 6 / D-Dome 6):** zátěž dle plánu K2 Base, na místo zátěže max. 108 kg (resp. 148 kg), od okraje střechy ≥ 600 mm [K2-DD] [K2-SD] [P]. Renusol FS Pro 10-S / 10-EW: systém ≈ 1,15 kg/m² + zátěž „project specific“, od okraje 0,6 m [REN-FS] [P]; Console+: od okraje 1,5 m, max. sníh 2,5 kN/m² [REN-CS] [P].
- **Taška:** úprava tašek u háku obvykle vede ke ztrátě záruky na krytinu (montážní návod Schletter Rapid2+, viz blog fotovoltaika-a-vymena-strechy.html) [SCH-R2]. Při velkém sněhu nahradit tašku pod hákem plechovou (K2) [K2-SR].
- České e-shopy prodávají „sady pro N panelů“ bez rozpisu kusů [SE] [S] → praktický poměr háků na panel **neověřeno**.

### 8.2 Návrh výpočtu pro aplikaci (ODVOZENO / ODHAD)
- Položka „Konstrukce (dle typu střechy)“ = **počet panelů (ks sady)** – odpovídá dosavadním rozpočtům.
- Uvnitř sady (pro interní kusovník, řada n panelů na výšku, šířka panelu w):
  - kolejnice = 2 × (n × (w + 0,02 m) + 2 × 0,10 m) na řadu (ODVOZENO; mezera 20 mm a přesah 0,10 m jsou ODHAD v mezích [REN-VS])
  - koncové svorky = 4 na řadu, středové = 2 × (n − 1) na řadu (ODVOZENO z min. 4 svorek/modul [TR-M])
  - háky na kolejnici = ceil(délka / rozteč) + 1, rozteč = rozteč krokví, při velkém sněhu každá krokev (ODHAD, princip [SCH-TA]) → u panelu 1 134 mm vychází zhruba 2–3 háky na panel [V]
  - trapéz s krátkými kolejnicemi: 2 × (n + 1) na řadu (ODVOZENO)
  - plochá střecha: zátěž nepočítat, položka „zátěž dle statického výpočtu“ (FAKT, že ji určuje software výrobce)
- Do každé nabídky: „Počet úchytů je orientační, finální podle statického výpočtu výrobce konstrukce.“ (FAKT – požadavek výrobců)

---

## 9. Hromosvod a přepěťové ochrany

### 9.1 Kdy upravit hromosvod
- Ochrana před bleskem se musí navrhnout tam, kde by blesk mohl ohrozit osoby, „zejména v případě staveb pro bydlení“, a je nutné posoudit a dodržet **dostatečnou vzdálenost** [L6 – vyhl. 146/2024 Sb. § 26] [P]. Zda musí mít hromosvod každý RD, nebo jen dle analýzy rizika (ČSN EN 62305-2): text nejednoznačný, **neověřeno**.
- **Samotná FVE riziko úderu nezvyšuje**; potřeba hromosvodu se nemá odvozovat jen z FVE, doporučena analýza rizika dle EN 62305-2 [V1 – DEHN WPX029] [P].
- **Dům má hromosvod, vzdálenost s dodržena:** FVE musí ležet v ochranném prostoru jímačů (případně doplnit jímací tyče); konstrukci jen funkčně pospojit (≥ 6 mm² Cu), **s hromosvodem nepropojovat**; odstup jímací tyče od modulu kvůli jádrovému stínu např. 1,08 m pro tyč Ø 10 mm [V1] [V4] [P].
- **Vzdálenost s dodržet nelze** (např. kovová střecha): propojit konstrukci s hromosvodem vodičem ≥ 16 mm² Cu a bleskové pospojení i pro DC vedení [V1] [V4] [P].
- **Dům bez hromosvodu:** konstrukci funkčně uzemnit/pospojit ≥ 6 mm² Cu [V1] [P].
- Upravený hromosvod musí mít revizi [L8 – NV 190/2022 Sb. § 6 odst. 4 písm. c)] [P] [Z5].

### 9.2 SPD (přepěťové ochrany) – podle výrobců [P]
| Situace | DC strana | AC strana | Zdroj |
|---|---|---|---|
| Bez hromosvodu | typ 2 na každém MPPT; při DC vedení > 10 m druhý typ 2 u modulů | SPD v hlavním rozvaděči, při > 10 m i u střídače | [V1] [V2] [V3] |
| Hromosvod, s dodržena | typ 2 (+ u modulů při > 10 m) | typ 1(+2) na vstupu do objektu | [V1] [V3] [V4] |
| Hromosvod, s nedodržena | typ 1+2 u střídače i u stringů | typ 1 na vstupu; další typ 1 při > 10 m | [V1] [V4] |

Uc,PV ≥ 1,2 × Uoc(STC) stringu [V2] [V4] [P]. Výběr DC SPD dle ČSN CLC/TS 51643-32 [V2] [V4].

---

## 10. Revize a ostatní položky
- **Výchozí revize FVE – povinná** (elektrická instalace je vyhrazené el. zařízení; revize před uvedením do provozu, zprávu předá dodavatel) [L8 § 3, § 6 odst. 2–3] [L9 § 20] [P]. Postup ČSN 33 2000-6 ed. 2 [N4]; ČSN EN 62446-1+A1 platí jen pro FV systémy bez úložiště [N5] [P – anotace]. Výchozí revize (vč. impedance smyčky nad 800 W) je i podkladem pro připojení k DS [VYHL16 příl. 4] [PPNN 4.1.9] [P].
- **Revize hromosvodu** po jeho úpravě – povinná [L8 § 6 odst. 4 c)] [P]. Pravidelná revize LPS 4 roky + vizuální kontrola ročně je povinnost pro firmy; pro soukromý RD doporučení (výklad) [L8 příl. 4] [L9].
- **Administrativa – připojení k DS:** dokumenty: technická zpráva, jednopólové schéma, výchozí revize, protokol nastavení ochran, instalační dokument A1/A2 + certifikát výrobního modulu, souhlas vlastníka [VYHL16 příl. 4] [CEZ-28] [PPNN 4.1.9] [P]. Cestu (zjednodušené / oznámení / standardní) volit dle kap. 6.
- **Infigy** = platforma řízení spotřeby (TČ, bojler, wallbox) podle výroby a spotových cen, HW vyrábí Geosun s.r.o.; cena 13 000–20 000 Kč dle rozsahu instalace (článek 23. 5. 2024) [INF] [S]. Kompatibilita se střídači GoodWe/SolaX: **neověřeno**.
- **Wallbox:** v NZÚ úvěru způsobilý výdaj, pokud je parkovací místo na pozemku žadatele [NZU-U 3.2.3.2 h), 7.3 b)] [P]. 3f wallbox 11 kW ≈ 15,9 A/fázi [V] – zkontrolovat hlavní jistič (ODHAD).
- **Elektromateriál AC/DC, Doprava, Práce:** žádné normativní pravidlo pro množství nenalezeno → obchodní parametry PROOZE (kap. 11.1).

---

## 11. Sada pravidel pro aplikaci

### 11.1 Vstup → výpočet → položka rozpočtu

| # | Vstup | Výpočet | Položka (jednotka) | Typ | Zdroj |
|---|---|---|---|---|---|
| 1 | panel, počet N | kWp = N × Wp / 1000 | Panely (ks) = N | FAKT (definice) | [NZU-U], [VYHL16 § 2 f)] |
| 2 | rozměry + Wp panelu | účinnost = Wp / (d × š × 1000 W/m²) | – (kontrola NZÚ ≥ 18 %) | FAKT | [NZU-U 3.2.3.2 d)] |
| 3 | střídač | DC/AC = kWp / P_AC; kontrola stropu | Střídač (ks) = 1 | FAKT (limity) | [G1] [G4] [G5] [S1] |
| 4 | N, počet stringů (auto/ručně) | n na string v ⟨n_min; n_max⟩, stringy ≤ vstupy | – (kontrola) | FAKT vzorec / ODHAD T_min −20 °C | [TR-M] [CS] [FR-D] [G1] [S1] |
| 5 | Tigo typ F | ks = N | Tigo TS4-A-F (ks) | FAKT | [T7] |
| 6 | Tigo typ 2F | ks 2F = Σ floor(n_i / 2), + Σ (n_i mod 2) ks TS4-A-F | Tigo TS4-A-2F (ks) [+ TS4-A-F] | ODVOZENO z [T7]; zda smí mít 2F jeden vstup volný: neověřeno | [T7] |
| 7 | Tigo F/2F | RSS = ceil(počet stringů / 10) | Řízení Tigo RSS Transmitter (ks), u RD = 1 | FAKT | [T6] [T7] |
| 8 | Tigo typ O | TAP = ceil(N / 300), CCA = 1 | Řízení Tigo TAP (ks) + CCA (ks) | FAKT | [T8] [T9] |
| 9 | baterie | moduly v mezích, jmen. kWh, kontrola matice | Baterie (ks věží/modulů dle ceníku) | FAKT | [G7] [S2] [S3] |
| 10 | typ střechy | sada = 1 na panel; interní kusovník kap. 8.2 | Konstrukce – sedlová/taška/plech/falc/šindel/rovná J/rovná V-Z (ks) = N | ODVOZENO / ODHAD | [K2-SR] [SCH-TA] [TR-M] |
| 11 | – (každá FVE na budově) | 1 | STOP tlačítko / TOTAL STOP (ks) = 1 | FAKT | [L1 § 3/2] [Z2] |
| 12 | RD a kWp > 10 | bezpečné DC napětí povinné | vynutit Tigo F/2F (nebo jiný rapid shutdown) | FAKT | [L1 § 3/3] [Z2] [Z3] |
| 13 | hromosvod ano/ne, s dodržena ano/ne | typ SPD dle tab. 9.2 | Rozvaděč DC (ks) = 1 s SPD T2 nebo T1+2; Rozvaděč AC (ks) = 1 | FAKT (typ SPD) / ODHAD (1 ks) | [V1] [V4] |
| 14 | Infigy ano/ne | 1 | Infigy (ks) | volba obchodníka | [INF] |
| 15 | hromosvod na domě = ano | 1 | Hromosvod – úprava zemnicí soustavy / jímačů (kpl) | DOPORUČENÍ (posouzení s je povinné dle [L6]) | [L6] [V1] |
| 16 | hromosvod upraven | 1 | Revize hromosvodu (ks) | FAKT | [L8 § 6/4 c)] |
| 17 | vzdálenost střecha → střídač L_DC, střídač → rozvaděč L_AC (m) | DC kabel = 2 × počet stringů × L_DC × 1,1; AC kabel = L_AC × 1,1; pospojení 6 nebo 16 mm² dle s | Elektromateriál DC / AC (kpl nebo m) | ODHAD (rezerva 10 %); průřezy pospojení FAKT | [V1] |
| 18 | – | paušál | Práce – montáž FVE (paušál) = 1 | obchodní | – |
| 19 | N | ks = N | Práce – montáž panelů (ks) = N | obchodní | – |
| 20 | wallbox ano/ne | 1 | Wallbox (ks) | volba; NZÚ způsobilé | [NZU-U 3.2.3.2 h)] |
| 21 | – | 1 | Doprava (paušál) | obchodní | – |
| 22 | – | 1 | Revize – výchozí revize FVE (ks) = 1 | FAKT (povinná) | [L8 § 6] [L9 § 20] |
| 23 | Pi = max(kWp; P_AC střídače) | ≤ 10,8 kW → zjednodušené / oznámení, jinak standardní žádost | Administrativa – připojení k DS (paušál) = 1 | FAKT (hranice) | [VYHL16 § 2 d), § 16] [EZ § 28/5] |
| 24 | program = NZÚ úvěr | úvěr = min(25 000 × kWp + 15 000 × kWh_jmen; 400 000) Kč | info do nabídky „max. úvěr NZÚ“ | FAKT | [NZU-U 3.2.3.1] |
| 25 | program = NZÚ Light | ohřívač ≥ 190 l + ochrana proti opaření + bivalentní zdroj | doplnit položky ohřevu TV (ks) | FAKT | [NZU-L 3.2.3.2] |
| 26 | podklad střídače/rozvaděče = dřevo/OSB | 1 | Nehořlavá podložka A1/A2, přesah ≥ 500 mm (ks) | FAKT | [L1 § 4 b)] |

### 11.2 Varování a chyby

CHYBA = nabídku nejde uložit bez potvrzení · VAROVÁNÍ = zobrazit obchodníkovi · INFO = poznámka do nabídky

| # | Podmínka | Hláška | Závaž. | Typ | Zdroj |
|---|---|---|---|---|---|
| W1 | kWp > max. DC výkon střídače | „Panely přesahují max. DC výkon střídače (X kW).“ | CHYBA | FAKT | [G1] [G5] [S1] |
| W2 | DC/AC > 1,30 | „Poměr DC/AC nad běžnou praxí 1,13–1,30, počítejte s ořezem výkonu.“ | INFO | ODHAD dle [E1] | [E1] |
| W3 | n × Voc(T_min) > 1 000 V (GoodWe > 950 V) | „String překročí max. napětí střídače v mrazu.“ | CHYBA | FAKT | [TR-M] [G1] [G5] |
| W4 | n × Vmp(70 °C) < dolní mez MPPT | „String je v horku pod pracovním napětím střídače.“ | CHYBA | FAKT meze / přiblížení | [G1] [S1] [VUT] |
| W5 | GoodWe ET PLUS+: n × Vmp(70 °C) < 240/310/380/460 V | „V horku nedosáhne jmenovitého výkonu.“ | VAROVÁNÍ | FAKT meze | [G3] |
| W6 | Isc × paralel. stringy (× bifaciální zisk) > Isc,max MPPT | „Zkratový proud panelu je nad limitem vstupu (zvažte GoodWe KN / jiný vstup).“ | CHYBA | FAKT | [G1] [G2] [S1] [JA-D] |
| W7 | Imp × paralel. stringy > I_max MPPT | „Proud panelu bude ořezán.“ | VAROVÁNÍ | FAKT | [G1] [S1] |
| W8 | stringů > vstupů | „Střídač nemá dost vstupů.“ | CHYBA | FAKT | [G1] [G5] [S1] |
| W9 | baterie mimo matici kompatibility / mimo počet modulů | „Nekompatibilní baterie (např. ET PLUS+ + LX F6.4-H-20; SolaX + 1× T58).“ | CHYBA | FAKT | [G7] [S2] [S3] |
| W10 | napětí baterie mimo rozsah střídače | „Napětí baterie mimo rozsah střídače.“ | CHYBA | FAKT | [G1] [G5] [S1] |
| W11 | NZÚ úvěr a kWh_jmen < kWp | „Baterie menší než výkon FVE – nesplní podmínku NZÚ.“ (např. 10,08 kWp + Lynx Home F 9.8 = 9,83 kWh [V]) | CHYBA | FAKT | [NZU-U 3.2.3.2 f)] |
| W12 | NZÚ a baterie není lithiová | „NZÚ započítá jen lithiové baterie.“ | CHYBA | FAKT | [NZU-U f)] |
| W13 | NZÚ / NZÚ Light a (kWp < 3 nebo připojení 1f) | „NZÚ vyžaduje min. 3 kWp a třífázové připojení.“ | CHYBA | FAKT | [NZU-U a)] [NZU-L a)] |
| W14 | NZÚ a účinnost panelu < 18 % | „Panel nesplní účinnost 18 % pro NZÚ.“ | CHYBA | FAKT | [NZU-U d)] |
| W15 | NZÚ a střídač bez doloženého EN 50549-1 | „Doložte certifikát EN 50549-1.“ (ET G2: neověřeno) | VAROVÁNÍ | FAKT | [NZU-U c)] [G3] [S1] |
| W16 | NZÚ a (rozšíření stávající FVE / dodatečná baterie / kolaudace od 1. 1. 2023 / v OM FVE se zeleným bonusem) | „Nesplní podmínky NZÚ.“ | CHYBA | FAKT | [NZU-U 3.2 a), 3.2.3, b)] |
| W17 | NZÚ a navýšení jističe v rozpočtu | „Navýšení jističe není způsobilý výdaj NZÚ.“ | INFO | FAKT | [NZU-U 7.3 b)] |
| W18 | NZÚ Light a chybí ohřívač ≥ 190 l / ochrana proti opaření / bivalentní zdroj | „Nesplní NZÚ Light.“ | CHYBA | FAKT | [NZU-L b)–d)] |
| W19 | Pi = max(kWp; P_AC) > 10,8 kW nebo AC proud > 16 A/fázi | „Nejde o mikrozdroj: standardní žádost o připojení, počítejte s lhůtami.“ | INFO | FAKT | [VYHL16 § 2 d), § 16] [EZ § 28/5] |
| W20 | 1f střídač > 3,7 kVA | „Jednofázová výrobna max. 3,7 kVA na fázi (ČEZd).“ | CHYBA | FAKT | [PPNN 4.1.7] |
| W21 | S_max střídače > 3 × 230 V × In hlavního jističe | „Výkon střídače přesahuje hlavní jistič – omezit přetok nebo navýšit jistič (800 Kč/A).“ | VAROVÁNÍ | ODHAD (výpočet); poplatek FAKT | [VYHL16 příl. 2] |
| W22 | v OM už je jiná výrobna / úložiště | „Druhá výrobna v OM = licence ERÚ a nelze oznámením; NZÚ nejde na rozšíření.“ | VAROVÁNÍ | FAKT | [EZ § 3 odst. 3 b), d)] [NZU-U b)] |
| W23 | Pi > 100 kW | „Licence ERÚ, dispečerské řízení.“ | CHYBA (mimo RD) | FAKT | [EZ § 3, § 23] |
| W24 | střídač není na seznamu ČEZd | „Ověřte certifikát / protokol A1–A2.“ | VAROVÁNÍ | FAKT (seznam existuje) | [CEZ-STR] |
| W25 | AC-coupled baterie (vlastní střídač) a cesta „oznámení“ | „Při oznámení musí baterie jít přes společný střídač.“ | CHYBA | FAKT | [CEZ-28] [PPDS4 4.6.1] |
| W26 | RD a kWp > 10 a není Tigo F/2F ani jiné řešení ≤ 120 V DC | „Nad 10 kWp na RD je povinné bezpečné DC napětí (rapid shutdown).“ | CHYBA | FAKT | [L1 § 3/3] [Z2] |
| W27 | RD a kWp ≤ 10 bez rapid shutdown | „Rapid shutdown doporučen (není povinný do 10 kWp).“ | INFO | FAKT/DOPORUČENÍ | [L1] [Z2] |
| W28 | chybí STOP tlačítko | „TOTAL STOP je povinný u každé FVE na budově.“ | CHYBA | FAKT (výklad MPO/HZS) | [L1 § 3/2] [Z2] |
| W29 | Tigo F/2F a panel bez TS4 ve stringu / Pmax > 700 (725) W / napětí > 80 V / Isc nad limitem varianty | „Tigo musí být na každém panelu a panel musí sedět do limitů TS4.“ | CHYBA | FAKT | [T1] [T2] [T3] [T7] |
| W30 | Tigo F/2F + GoodWe ET | „Kompatibilitu ověřte – prohlášení GoodWe–Tigo (11/2025) F/2F neuvádí.“ | VAROVÁNÍ | FAKT (rozpor zdrojů) | [T12] [T14] |
| W31 | Tigo typ O bez TAP + CCA | „Optimizéry TS4-A-O potřebují TAP a CCA; 25 let záruky jen s cloudem.“ | CHYBA | FAKT | [T4] [T8] [T9] |
| W32 | baterie > 20 kWh | „Složité podmínky pro zásah; umístění mimo únikovou cestu, ideálně mimo obytný prostor.“ | VAROVÁNÍ | FAKT [Z3] / DOPORUČENÍ | [Z3] [Z5] |
| W33 | moduly/konstrukce nejsou A1/A2 (fóliové, plastové) | „Nesplní vyhl. 114/2023 – nutné povolení a PBŘ.“ | VAROVÁNÍ | FAKT | [L1 § 2] [Z2] |
| W34 | řadový dům / dvojdům | „Moduly ≥ 0,9 m od požárně dělicí stěny.“ | VAROVÁNÍ | FAKT dle shrnutí normy | [EP-73] [N1] |
| W35 | dům má hromosvod | „Posoudit dostatečnou vzdálenost s; DC SPD T2 (s dodržena) / T1+2 (nedodržena); revize hromosvodu.“ | VAROVÁNÍ | FAKT dle výrobců | [L6] [V1] [V4] |
| W36 | plochá střecha | „Zátěž a okrajové odstupy (≥ 0,6 m) dle statického výpočtu výrobce.“ | INFO | FAKT | [K2-DD] [REN-FS] |
| W37 | taška | „Úprava tašek u háků může zrušit záruku krytiny.“ | INFO | FAKT | [SCH-R2] |
| W38 | každá nabídka | „Počet úchytů orientační, finální dle statiky.“ | INFO | FAKT | [K2-SR] [SCH-TA] [REN-VS] |

### 11.3 Příklad kontroly [V]
22 × Aiko A450 (9,9 kWp) + GoodWe GW10K-ET + Lynx Home F 13.1, T_min −20 °C:
- Voc(−20 °C) = 40,94 × (1 + 0,0022 × 45) = 44,99 V → **1 string × 22 = 990 V > 950 V → CHYBA W3**; 2 × 11 = 495 V → OK.
- Vmp(70 °C) = 34,50 × (1 − 0,0026 × 45) = 30,46 V → 11 × 30,46 = 335 V ≥ 200 V OK, ale < 460 V → **VAROVÁNÍ W5**.
- Imp ≈ 13,0 A > 12,5 A (model K) → **VAROVÁNÍ W7**; model KN (16 A) OK.
- DC/AC = 0,99; DC 9 900 W < 15 000 W OK.
- NZÚ: 13,10 kWh ≥ 9,9 kWp OK; úvěr = 247 500 + 196 500 = 444 000 → **strop 400 000 Kč**.
- Pi = max(9,9; 10) = 10 kW ≤ 10,8 kW; AC proud 11 000 VA / (√3 × 400 V) ≈ 15,9 A ≤ 16 A → mikrozdroj možný (max. AC proud z datasheetu neověřen).
- 9,9 kWp ≤ 10 → bezpečné DC napětí není povinné → **INFO W27**; TOTAL STOP povinný.

### 11.4 Data, která musí katalog nést
- **Panel:** Wp, rozměry (mm), Voc, Vmp, Isc, Imp, β_Voc, γ_Pmax, bifaciální ano/ne + zisk zadní strany, materiál/třída reakce na oheň (A1/A2), záruka.
- **Střídač:** P_AC jmen., S_max, počet fází, U_DC max, U max provozní, rozsah MPPT, MPPT pro jmenovitý výkon, startovací napětí, počet MPPT, stringy na MPPT, I_max a Isc_max na MPPT, max. DC výkon, rozsah napětí baterie, max. proud baterie, EN 50549-1 (doloženo ano/ne), na seznamu ČEZd ano/ne, kompatibilní baterie (+ min. FW), kompatibilní Tigo typy.
- **Baterie:** chemie, jmenovitá kWh (dle výrobce), usable kWh, napětí, min./max. modulů na střídač, jmen. výkon.
- **Tigo:** typ, Pmax, max. napětí, Isc max, potřebné řízení (RSS / TAP + CCA).
- **Zakázka:** typ střechy, RD/řadový/jiný, kolaudace, hromosvod ano/ne, s dodržena ano/ne/neví, hlavní jistič (A, 1f/3f), jiná výrobna/úložiště v OM, program (bez dotace / NZÚ úvěr / NZÚ Light), podklad pro střídač, vzdálenosti L_DC a L_AC.

---

## 12. Neověřeno a opravy k fakta.md

**Neověřeno (nepoužívat jako tvrdé pravidlo):** návrhová T_min pro ČR; MPPT pro jmenovitý výkon u GoodWe ET G2 a SolaX; certifikát EN 50549-1 u ET G2 (u ET PLUS+ jen zmínka v manuálu); kompatibilita T58 V3 s X3 G4; kapacita T30; integrovaný Tigo vysílač ve střídačích; „selective deployment“ TS4-A-O; zda smí TS4-A-2F mít volný vstup; max. Voc Tigo 725 W; pevný počet háků na panel a rozpis sad e-shopů; pravidlo RV ≤ RP; zda se licenční limit 100 kW počítá z kWp či střídače; povinnost hromosvodu u každého RD; roční kontrola TOTAL STOP u soukromého RD; přesné články ČSN 73 0848 a ČSN P 73 0847; kompatibilita Infigy.

**Opravy k research/fakta.md:**
- D4: „plánované omezení podpory na 5 kW“ je z článku oEnergetice 19. 12. 2024 o tehdejších dotacích; závazné pokyny NZÚ 2026 horní limit kWp nemají [OEN-24] [NZU-U].
- D5: licenční limit 100 kW je nyní doložen primárně – EZ § 3 odst. 4 písm. e) ve znění zák. 87/2025 Sb., účinnost **1. 8. 2025** [EZ] [ZAK87]; licence je nutná i do 100 kW, pokud je v OM jiná výrobna.

---

## 13. Zdroje

**NZÚ / SFŽP**
- **NZU-U** [P] SFŽP, Závazné pokyny NZÚ – RD, bezúročný úvěr, v1.1, červen 2026: https://novazelenausporam.cz/files/documents/storage/2026/06/25/1782380387_NZU26_RD_uver_1.aktualizace_2026-06-24.pdf
- **NZU-L** [P] SFŽP, Závazné pokyny NZÚ Light – RD, v1.1, červen 2026: https://novazelenausporam.cz/files/documents/storage/2026/06/25/1782380299_NZU26_Light_RD_1.aktualizace_2026-06-24.pdf
- **OEN-24** [S] oEnergetice, 19. 12. 2024: https://oenergetice.cz/rychle-zpravy/zajem-o-solary-kvuli-uprave-dotaci-prudce-vzrostl-lide-chteli-stare-podminky

**Střídače a baterie**
- **G1** [P] GoodWe ET PLUS+ datasheet: https://en.goodwe.com/Ftp/EN/Downloads/Datasheet/GW_ET%20PLUS+_Datasheet-EN.pdf
- **G2** [P] GoodWe ET PLUS+ 16A datasheet: https://en.goodwe.com/Ftp/EN/Downloads/Datasheet/GW_ET%20PLUS+%20(16A)_Datasheet-EN.pdf
- **G3** [P] GoodWe manuál ET/ET Plus/BT 5–10 kW, V2.0-2026-09-20: https://en.goodwe.com/Skippower/downloadFileF?id=1750&mid=60
- **G4** [P] GoodWe ET PLUS+ produktová stránka: https://en.goodwe.com/et-plus-series-three-phase-hybrid-solar-inverter
- **G5** [P] GoodWe ET G2 datasheet: https://en.goodwe.com/Ftp/EN/Downloads/Datasheet/GW_ET-G2_Datasheet-EN.pdf
- **G6** [P] GoodWe ET G2 EMEA datasheet: https://emea.goodwe.com/Ftp/Downloads/Datasheet/EMEA/GW_ET-G2_Datasheet_EMEA-GR-EN.pdf
- **G7** [P] GoodWe Battery Compatibility Overview 20260910-V029.1: https://en.goodwe.com/Ftp/EN/Downloads/User%20Manual/GW_Battery%20Compatibility%20Overview-EN.pdf
- **G8** [P] GoodWe Lynx F G2 datasheet: https://en.goodwe.com/Skippower/downloadFileF?id=2030&mid=60
- **G9** [P\*] GoodWe Lynx Home F datasheet: https://solarics.de/cdn/shop/files/GOODWE_Lynx_Home_F_-_Datasheet.pdf
- **S1** [P] SolaX X3-Hybrid G4 datasheet V3.8: https://www.solaxpower.com/uploads/file/x3-hybrid-g4-datasheet-en.pdf
- **S2** [P] SolaX KB X1/X3 Hybrid G4 Battery Selection (2026-08-06): https://kb.solaxpower.com/solution/detail/2c9fa4148ceddee5018e94039f8026a0
- **S3** [P] SolaX T-BAT SYS-HV manuál: https://www.solaxpower.com/uploads/file/t-bat-sys-hv-5.8-user-manual-en.pdf
- **S4** [P] SolaX T-BAT H 5.8 V3 datasheet: https://www.solaxpower.com/uploads/file/t-bat-sys-hv-5.8-datasheet-en.pdf
- **E1** [S] U.S. EIA, Today in Energy, 16. 3. 2018: https://www.eia.gov/todayinenergy/detail.php?id=35372

**Tigo**
- **T1** [P] TS4-A-F Rev 3.5: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/6765c6cc2ff38084ffe95205_002-00093-00%203.5%20Datasheet%20TS4-A-F%2020241204%20-%20EN.pdf
- **T2** [P] TS4-A-F 725 W: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/688276b9f911953631c3be72_002-00222-00%201.1%20Datasheet%20TS4-A-F%20(725W)%2020250710%20-%20EN.pdf
- **T3** [P] TS4-A-2F Rev 2.9: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/69d7e7bd08dece46389c4cd5_002-00092-00%202.9%20Datasheet%20TS4-A-2F%2020260320%20-%20EN.pdf
- **T4** [P] TS4-A-O 725 W: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/6aa1951138adf7e073cb2792_002-00216-00%201.2%20Datasheet%20TS4-A-O%20(725W)%2020260824%20-%20EN.pdf
- **T6** [P] RSS Transmitter datasheet: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/680fae5df8b93aad651a7e39_002-00146-00%201.4%20Datasheet%20RSS%20w%20PCBA%2020250411%20-%20EN.pdf (kopie: https://ressupply.com/documents/tigo/RSS_Transmitter_Data_Sheet.pdf)
- **T7** [P] Instalační manuál TS4-A-F/2F a RSS: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/695ef87fae7d1880398c6541_002-00118-00%204.4%20IO%26M%20RSS%20Transmitter%20Installation%2020250825%20-%20EN.pdf
- **T8** [P] TAP: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/6a395a7de23884171b26d2c6_002-00050-00%201.4%20Datasheet%20TAP%2020260603%20-%20EN-compressed.pdf
- **T9** [P] CCA: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/66a17b6baf41d4b66e8f3209_002-00141-00%201.5%20Datasheet%20CCA%2020240625%20-%20EN.pdf
- **T11** [P] Tigo produktové stránky: https://www.tigoenergy.com/product/ts4-a-f · https://www.tigoenergy.com/product/ts4-a-2f · https://www.tigoenergy.com/product/ts4-a-o · https://www.tigoenergy.com/product/tigo-access-point
- **T12** [P] Tigo–GoodWe Compatibility Letter 24. 11. 2025: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/69443fd57a3519efc127c0a1_GoodWe%26Tigo%20Compatibility%20Letter%20(Nov24%202025).pdf
- **T13** [P] Tigo–SolaX Compatibility Letter 18. 5. 2026: https://cdn.prod.website-files.com/5fad551d7419c7a0e9e4aba4/6a3db191493eb9ffc7900b1d_Tigo-SolaX%20Compatibility%20Letter(May18%202026).pdf
- **T14** [P] Tigo partneři: https://www.tigoenergy.com/partners/goodwe · https://www.tigoenergy.com/partners/solax

**Stringy a panely**
- **TR-M** [P\*] Trina User Manual UM-M-0002 (06/2023): https://7sun.eu/wp-content/uploads/2025/08/manual-trina-vertex-s-tsm-440neg9r-28-bf.pdf
- **TR-D** [P\*] Trina TSM-440NEG9R.28 datasheet: https://7sun.eu/wp-content/uploads/2025/08/datasheet-trina-vertex-s-tsm-440neg9r-28-bf.pdf
- **JA-D** [P\*] JA Solar JAM54D40 LB datasheet: https://7sun.eu/wp-content/uploads/2026/06/JA-Solar-440-465W-JAM54D40-LB-Datasheet.pdf
- **AI-D** [P\*] Aiko A440–A470-MAH54Db datasheet: https://7sun.eu/wp-content/uploads/2025/07/AIKO-A440-MAH54Db-A470-MAH-54Db-Datasheet.pdf
- **AI-M** [P\*] Aiko manuál: https://7sun.eu/wp-content/uploads/2025/07/AIKO-A440-MAH54Db-A470-MAH-54Db-Manual.pdf
- **LO-D** [P\*] LONGi Hi-MO X10 LR7-54HVH-475M: https://liriksolar.com/image/uploads/LONGI%20Solar%20Hi-MO%20X10%20Explorer%20LR7-54HVH-475M%20Datasheet.pdf
- **CS** [P] Canadian Solar Installation Manual v2.4: https://static.csisolar.com/wp-content/uploads/2024/11/13111410/CS_Installation-Manual_PV-Modules_EN-v2.4-EN.pdf
- **FR-D** [P] Fronius, Recommendation on system design (20. 11. 2024): https://fronius.com/~/downloads/Solar%20Energy/Manufacturer%20Declarations/SE_MD_System_design_recommendations_Fronius_Eco_Fronius_Tauro_EN.pdf
- **FR-C** [P\*] Fronius Solar.configurator report: https://www.bimblesolar.com/docs/fronius%20Solar%20creator%20report%20(2).pdf
- **VUT** [S] VUT Brno, diplomová práce 2018: https://www.vut.cz/www_base/zav_prace_soubor_verejne.php?file_id=172595

**Konstrukce**
- **K2-SR** [P] K2 SingleRail roof hook assembly: https://catalogue.k2-systems.com/media/bd/b2/36/SingleRail-roof-hook-assembly-en.pdf
- **K2-MR** [P] K2 MultiRail assembly: https://catalogue.k2-systems.com/media/ce/ff/dc/MultiRail-assembly-en.pdf
- **K2-SS** [P] K2 Standing seam clamps: https://catalogue.k2-systems.com/media/a8/f1/b5/Standing-seam-clamps-assembly-en.pdf
- **K2-DD** [P] K2 D-Dome 6: https://catalogue.k2-systems.com/media/a0/ff/15/D-Dome-6-Classic-assembly-en.pdf
- **K2-SD** [P] K2 S-Dome 6: https://catalogue.k2-systems.com/media/49/c4/47/S-Dome-6-Classic-assembly-en.pdf
- **K2-SA** [P] K2 S-Dome 6 structural analysis: https://catalogue.k2-systems.com/media/7e/50/9c/S-Dome-6_structural-analysis_en.pdf
- **SCH-TA** [P] Schletter Technical Advice – roof hook installation: https://strapi.schletter-group.com/uploads/Schletter_Technical_Advice_Pitched_roof_systems_Roof_hook_installation_EN_b9f851732f.pdf
- **SCH-R2** [P] Schletter Rapid2+ montážní návod V1 05/2026: https://strapi.schletter-group.com/uploads/MA_Roof_hooks_Rapid2_Pro_models_and_Eco_Universal_EN_V1_f46780437a.pdf
- **REN-VS** [P] Renusol VS+ návod 12/2023: https://www.renusol.com/files/content/Downloads/Installationsanleitungen/VS/20231219_EN_VS%2B_InstallationGuide.pdf
- **REN-FS** [P] Renusol FS Pro 10-EW: https://www.renusol.com/files/content/Downloads/FS_Pro/System_Data_Sheet/10-EW/20240110_FS_PRO_10-EW_EN_System_Data_Sheet.pdf
- **REN-CS** [P] Renusol Console+: https://www.renusol.com/files/content/Downloads/Datenbl%C3%A4tter/CS/20240910_CS%2B_EN_System%20Datasheet.pdf
- **SE** [S] solar-eshop.cz, sada pro 8 panelů: https://www.solar-eshop.cz/p/nosna-konstrukce-pro-8-panelu-na-sikmou-taskovou-strechu/

**Připojení k DS a licence**
- **EZ** [P] Energetický zákon 458/2000 Sb.: https://www.zakonyprolidi.cz/cs/2000-458
- **ZAK87** [P] Zákon 87/2025 Sb. (Lex OZE III): https://www.zakonyprolidi.cz/cs/2025-87
- **VYHL16** [P] Vyhláška 16/2016 Sb. o podmínkách připojení (znění od 1. 4. 2026): https://www.zakonyprolidi.cz/cs/2016-16 ; novely https://www.zakonyprolidi.cz/cs/2024-248 · https://www.zakonyprolidi.cz/cs/2025-302
- **PPNN** [P] ČEZ Distribuce, Připojovací podmínky nn (od 1. 9. 2025): https://www.cezdistribuce.cz/file/edee/distribuce/ppnn/2026/pripojovaci_podminky_nn.pdf
- **PPDS4** [P] PPDS ČEZd 2025, příloha 4: https://www.cezdistribuce.cz/file/edee/distribuce/ppds/ppds-2025_priloha-4.pdf
- **CEZ-28** [P] ČEZd, připojení dle § 28 odst. 5: https://www.cezdistribuce.cz/cs/pro-zakazniky/potrebuji-vyresit/ceny-a-podminky/pripojovaci-podminky/pripojeni-dle-ss28-odst.-5-vety-druhe-energetickeho-zakona
- **CEZ-100** [P] ČEZd, připojení výrobny do 100 kW: https://www.cezdistribuce.cz/cs/pro-vyrobce/pripojeni-mikrozdroje-vyrobny-nebo-akumulace-spojene-s-vyrobnou-do-100-kw
- **CEZ-STR** [P] ČEZd, seznam schválených střídačů (21. 8. 2026): https://www.cezdistribuce.cz/file/edee/distribuce/legislativa/seznam_schvalenych_stridacu.xlsx
- **ERU-100** [P] ERÚ, 25. 9. 2025: https://eru.gov.cz/nove-je-mozne-provozovat-bez-licence-i-100kw-vyrobny-elektriny

**Požární bezpečnost, hromosvod, revize**
- **L1** [P] Vyhláška 114/2023 Sb.: https://www.tzb-info.cz/pravni-predpisy/vyhlaska-c-114-2023-sb-o-pozadavcich-na-bezpecnou-instalaci-vyrobny-elektriny-vyuzivajici-obnovitelne-zdroje-energie-s-instalovanym-vykonem-do-50-kw
- **Z1** [P] MV-GŘ HZS, Doporučené zásady pro FVE, 17. 4. 2023: https://hzscr.gov.cz/soubor/2023-04-17-zasady-pro-zhodnoceni-podminek-fve-pdf.aspx
- **Z2** [P] MPO + GŘ HZS, komentované znění vyhl. 114/2023 Sb. (22. 9. 2023): https://hzscr.gov.cz/soubor/komentovane-zneni-vyhlasky-c-114-2023-sb-o-pozadavcich-na-bezpecnou-instalaci-oze-s-vykonem-do-50-kw-pdf.aspx
- **Z3** [P] GŘ HZS, složité podmínky pro zásah – FVE (8. 8. 2024): https://hzscr.gov.cz/soubor/is-pre-a-izs-fve-slozite-podminky-pro-zasah-final-pdf.aspx
- **Z4** [P] HZS Pardubického kraje, leták FVE (2023): https://dh.cz/images/Dokumenty/prevence/testy_2025/HZS_PAK_letak_PBFVE.pdf
- **Z5** [P] Solární asociace, Protipožární bezpečnost střešních FVE, 2. vyd. 2026: https://solarniasociace.cz/wp-content/uploads/2026/06/Protipozarni_prirucka_2026.pdf
- **L2** [P] Vyhláška 23/2008 Sb.: https://www.zakonyprolidi.cz/cs/2008-23
- **L3** [P] Vyhláška 467/2025 Sb.: https://www.epravo.cz/top/zakony/sbirka-zakonu/sb/2025/467
- **L5** [P] MMR, Povolování OZE a baterií (1/2026): https://mmr.gov.cz/getattachment/Ministerstvo/Stavebni-pravo/Pravo-a-legislativa/Novy-stavebni-zakon/Metodiky/Obnovitelne-zdroje-energie/Povolovani-obnovitelnych-zdroju-energie-podle-nove/Dokumenty/Povolovani-OZE-podle-zakona-c-283-2021-Sb/Povolovani-OZE_baterie_MMR_12_1_2026.pdf.aspx?lang=cs-CZ&ext=.pdf
- **L6** [P] Vyhláška 146/2024 Sb. (§ 26 ochrana před bleskem): https://www.zakonyprolidi.cz/cs/2024-146
- **L8** [P] Nařízení vlády 190/2022 Sb.: https://www.zakonyprolidi.cz/cs/2022-190
- **L9** [P] Zákon 250/2021 Sb.: https://www.zakonyprolidi.cz/cs/2021-250
- **N1** [P – anotace] ČSN P 73 0847: https://www.tzb-info.cz/normy/csn-p-73-0847-2024-05
- **N4** [P – anotace] ČSN 33 2000-6 ed. 2: https://www.tzb-info.cz/normy/csn-33-2000-6-ed-2-2017-03
- **N5** [P – anotace] ČSN EN 62446-1+A1: https://www.tzb-info.cz/normy/csn-en-62446-1-a1-2023-07
- **TZB-CS** [S] tzb-info, Central stop a Total stop po novele (27. 4. 2026): https://www.tzb-info.cz/revize-a-kontroly/29739-problematika-central-stop-a-total-stop-po-novele-vyhlasky-o-pozarni-prevenci
- **EP-73** [S] ElektroPrůmysl.cz, požární bezpečnost FVE malého rozsahu (29. 1. 2025): https://www.elektroprumysl.cz/alternativni-energie/zasady-reseni-pozarni-bezpecnosti-fotovoltaickych-instalaci-maleho-rozsahu
- **V1** [P] DEHN WPX029, Lightning and surge protection for rooftop PV (04/2022): https://www.dehn.cz/sites/default/files/media/files/photovoltaic-wpx029-en.pdf
- **V2** [P] Hakel, FV systémy pro RD: https://www.hakel.com/solution-fotovoltaicke-systemy-pro-rodinne-domy-22922
- **V3** [P] OBO, fotovoltaika: https://www.obo.cz/oborova-reseni/fotovoltaika/
- **V4** [P] SALTEK, FV systémy – ochrana před přepětím (02/2024): https://fotovoltaika.sonepar.cz/wp-content/uploads/2024/02/SALTEK-Prirucka-FV-systemy-Ochrana-pred-prepetim.pdf

**Ostatní**
- **INF** [S] Energozrouti, Infigy (23. 5. 2024): https://energozrouti.cz/clanek/cesi-vytvorili-unikatni-aplikaci-pomuze-majitelum-fotovoltaiky-rychleji-vydelavat
