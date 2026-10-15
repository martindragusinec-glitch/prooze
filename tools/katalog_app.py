#!/usr/bin/env python3
"""Katalog komponent pro generátor nabídek: research/katalog-komponenty.json → src/interni/nabidka/katalog.json

  python3 tools/katalog_app.py

Bez cen (ceny jsou vždy na míru a píšou se do nabídky ručně). Doplňuje údaje pro kontroly sestavy
(napěťová okna střídačů, teplotní koeficient Voc panelů) podle research/pravidla-sestavy.md
a krátké popisy do karet PDF. Obrázky: assets/img/komponenty/<id>.webp (oficiální obrázky výrobců).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "research" / "katalog-komponenty.json"
OUT = ROOT / "src" / "interni" / "nabidka" / "katalog.json"
IMG = ROOT / "assets" / "img" / "komponenty"
BEZ_OBRAZKU = {"baterie-byd-battery-box-premium-hvs", "wallbox-easee-charge-up"}  # nevhodné pozadí

KAT = {"panel": "panel", "stridac": "stridac", "baterie": "baterie", "optimizer": "tigo", "odpojovac": "tigo",
       "komunikace": "tigo", "wallbox": "wallbox", "rizeni": "rizeni", "bezpecnost": "bezpecnost", "prislusenstvi": "prislusenstvi"}

# Napěťová a proudová okna střídačů (pravidla-sestavy.md, kap. 2.4; datasheety výrobců)
STRIDAC_APP = {
    "stridac-goodwe-gw10k-et-20": {"udc_max": 975, "mppt_min": 120, "mppt_max": 850, "mppt": 3, "stringy": 3, "imax": 16, "iscmax": 24,
                                   "pozn": "ET G2: 975–1 000 V → standby, proto limit 975 V"},
    "stridac-solax-x3-hybrid-10-0-d": {"udc_max": 1000, "mppt_min": 180, "mppt_max": 950, "mppt": 2, "stringy": 3, "imax": 16, "iscmax": 20,
                                       "pozn": "MPPT1 až 2 stringy (28 A), MPPT2 1 string (16 A); kontrola počítá s 16 A na string"},
    "stridac-victron-multiplus-ii-48-8000": {"bez_fv_vstupu": True, "ks_3f": 3},
    "stridac-fronius-symo-gen24-10-0-plus": {"udc_max": 1000, "mppt": 2, "stringy": 3},
    "stridac-huawei-sun2000-10k-map0": {"udc_max": 1000, "mppt": 2, "stringy": 2},
    "stridac-sungrow-sh10t": {"udc_max": 1000, "mppt": 2, "stringy": 3},
}
# Teplotní koeficient Voc (%/°C) z datasheetů řad uvedených v pravidla-sestavy.md, kap. 2.3; jinde se použije faktor 1,18 (−20 °C)
BETA_VOC = {"panel-aiko-a450-neostar-2s": -0.22, "panel-aiko-a460-neostar-2s": -0.22, "panel-longi-470": -0.20,
            "panel-ja-solar-jam54d40-lr-470": -0.25, "panel-trina-vertex-s-plus-neg9r28-470": -0.24}

# Krátké názvy a řádky do karet „Použité technologie“
KRATCE = {
    "panel-aiko-a450-neostar-2s": "Aiko Neostar 2S 450 Wp", "panel-aiko-a460-neostar-2s": "Aiko Neostar 2S 460 Wp",
    "panel-longi-470": "LONGi EcoLife X10 470 Wp", "panel-ja-solar-jam54d40-lr-470": "JA Solar DeepBlue 4.0 Pro 470 Wp",
    "panel-jinko-tiger-neo-3-48ql6-db-470": "Jinko Tiger Neo 3.0 470 Wp", "panel-trina-vertex-s-plus-neg9r28-470": "Trina Vertex S+ 470 Wp",
    "stridac-goodwe-gw10k-et-20": "GoodWe GW10K-ET-20", "stridac-solax-x3-hybrid-10-0-d": "SolaX X3-Hybrid-10.0-D",
    "stridac-victron-multiplus-ii-48-8000": "Victron MultiPlus-II 48/8000", "stridac-fronius-symo-gen24-10-0-plus": "Fronius Symo GEN24 10.0 Plus",
    "stridac-huawei-sun2000-10k-map0": "Huawei SUN2000-10K-MAP0", "stridac-sungrow-sh10t": "Sungrow SH10T",
    "baterie-pylontech-force-h3": "Pylontech Force H3", "baterie-pylontech-us5000": "Pylontech US5000",
    "baterie-solax-t-bat-t58": "SolaX T-BAT T58", "baterie-byd-battery-box-premium-hvs": "BYD Battery-Box Premium HVS",
    "baterie-goodwe-lynx-home-f": "GoodWe Lynx Home F", "baterie-goodwe-lynx-home-f-g2": "GoodWe Lynx Home F G2",
    "baterie-huawei-luna2000-s1": "Huawei LUNA2000-S1",
    "wallbox-goodwe-hca-g2-11k": "GoodWe HCA G2 11 kW", "wallbox-solax-x3-hac-g2-11k": "SolaX Smart EV Charger G2 11 kW",
    "wallbox-easee-charge-up": "Easee Charge Up", "wallbox-fronius-wattpilot-flex-home-11": "Fronius Wattpilot Flex Home 11",
    "wallbox-victron-ev-charging-station-ns": "Victron EV Charging Station NS",
    "tigo-ts4-a-f": "Tigo TS4-A-F", "tigo-ts4-a-2f": "Tigo TS4-A-2F", "tigo-ts4-a-o": "Tigo TS4-A-O",
    "tigo-rss-transmitter": "Tigo RSS Transmitter", "tigo-cca": "Tigo CCA", "tigo-tap": "Tigo TAP",
    "rizeni-infigy": "Infigy", "bezpecnost-stop-tlacitko": "Bezpečnostní tlačítko STOP",
    "prislusenstvi-victron-cerbo-gx": "Victron Cerbo GX", "prislusenstvi-victron-energy-meter": "Victron Energy Meter VM-3P75CT",
    "prislusenstvi-uf-guard": "Ochrana rozhraní U/f",
}


def cz(n, d=1):
    s = f"{n:,.{d}f}".replace(",", " ").replace(".", ",")
    return s.rstrip("0").rstrip(",") if "," in s else s


def zaruka(z):
    p, v = z.get("produkt_let"), z.get("vykon_let")
    if p and v and v != p:
        return f"{p} let produkt, {v} let výkon"
    if p:
        return f"{p} let" if p >= 5 else f"{p} roky"
    return None


def radky(x):
    """Dva krátké řádky parametrů do karty."""
    p, k = x["parametry"], x["kategorie"]
    out = []
    if k == "panel":
        out.append(f"{p['vykon_wp']} Wp · účinnost {cz(p['ucinnost_pct'])} %")
        if p.get("typ_clanku"):
            out.append(p["typ_clanku"].split(",")[0][:48])
    elif k == "stridac":
        ac = p.get("ac_vykon_w")
        out.append(f"{cz(ac / 1000)} kW, {'třífázový' if p.get('faze') == 3 else 'jednofázový'}" + (" hybrid" if p.get("max_dc_vstup_wp") else " měnič"))
        if p.get("pocet_mppt"):
            out.append(f"{p['pocet_mppt']} MPPT · záložní výstup")
    elif k == "baterie":
        out.append(f"{cz(p['kapacita_modulu_kwh'], 2)} kWh na modul · {p.get('chemie', 'LFP')}")
        out.append(f"{p.get('moduly_min')}–{p.get('moduly_max')} modulů, {p.get('napeti_typ', '')}".strip(", "))
    elif k == "wallbox":
        out.append(f"nabíjecí výkon {cz(p['vykon_kw'])} kW")
    return out


def main():
    src = json.loads(SRC.read_text())
    out = []
    for x in src:
        if x["kategorie"] == "sada":
            continue
        kat = KAT[x["kategorie"]]
        p = x["parametry"]
        img = IMG / f"{x['id']}.webp"
        it = {
            "id": x["id"], "kat": kat, "vyrobce": x["vyrobce"], "model": x["model"],
            "nazev": x["nazev_do_nabidky"], "kratce": KRATCE.get(x["id"], x["nazev_do_nabidky"]),
            "img": f"img/komponenty/{x['id']}.webp" if img.exists() and x["id"] not in BEZ_OBRAZKU else None,
            "zaruka": zaruka(x["zaruka"]), "radky": radky(x), "kompat": x.get("kompatibilni_s") or [],
            "alt": bool(x.get("alternativa")), "overeno": bool(x.get("overeno")), "datasheet": x.get("datasheet_url"),
        }
        num = {k: v for k, v in p.items() if isinstance(v, (int, float)) and not isinstance(v, bool)}
        if kat == "panel":
            it["p"] = {k: num.get(k) for k in ("vykon_wp", "voc_v", "vmp_v", "isc_a", "imp_a", "ucinnost_pct", "teplotni_koef_pmax_pct_c")}
            it["p"]["beta_voc"] = BETA_VOC.get(x["id"])
        elif kat == "stridac":
            it["p"] = {k: num.get(k) for k in ("ac_vykon_w", "max_ac_zdanlivy_va", "max_dc_vstup_wp", "faze")}
            it["p"].update(STRIDAC_APP.get(x["id"], {}))
        elif kat == "baterie":
            mod = (p["kapacita_max_kwh"] / p["moduly_max"]) if p.get("kapacita_max_kwh") and p.get("moduly_max") else p.get("kapacita_modulu_kwh")
            it["p"] = {"kwh_modul": round(mod, 3), "moduly_min": p.get("moduly_min"), "moduly_max": p.get("moduly_max"),
                       "napeti": p.get("napeti_typ"), "chemie": p.get("chemie", "LFP")}
        elif kat == "wallbox":
            it["p"] = {"vykon_kw": num.get("vykon_kw")}
        elif kat == "tigo":
            it["p"] = {"panelu": num.get("panelu_na_jednotku")}
        out.append(it)
    order = ["panel", "stridac", "baterie", "tigo", "wallbox", "rizeni", "bezpecnost", "prislusenstvi"]
    out.sort(key=lambda i: (order.index(i["kat"]), i["alt"], i["kratce"]))
    data = {"verze": "2026-10-15", "polozky": out}
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    # totéž jako skript, ať generátor nemusí nic načítat asynchronně
    OUT.with_suffix(".js").write_text("/* vygenerováno tools/katalog_app.py, needitovat ručně */\nwindow.PROOZE_KATALOG = " + json.dumps(data, ensure_ascii=False) + ";\n")
    print(OUT.relative_to(ROOT), len(out), "položek,", sum(1 for i in out if i["img"]), "s obrázkem")


if __name__ == "__main__":
    main()
