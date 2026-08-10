import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine,
} from "recharts";

// ═════════════════════════════════════════════════════════════════════════════
// THEME
// ═════════════════════════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    name: "Dunkel",
    bg:       "linear-gradient(160deg,#040c1a 0%,#081424 60%,#060e1c 100%)",
    bgSolid:  "#040c1a",
    card:     "#0a1628",
    cardBorder:"rgba(255,255,255,0.09)",
    cardAlt:  "#0d1f10",
    input:    "#050c16",
    inputBorder:"rgba(255,255,255,0.11)",
    header:   "rgba(0,229,160,0.04)",
    headerBorder:"rgba(0,229,160,0.13)",
    text:     "#e8f4ff",
    textSub:  "rgba(200,230,255,0.6)",
    textMuted:"rgba(200,230,255,0.4)",
    textFaint:"rgba(200,230,255,0.28)",
    divider:  "rgba(255,255,255,0.07)",
    rowHover: "#0d1520",
    infoBox:  "#091626",
    infoBoxGreen:"#0d2010",
    infoBoxAmber:"#1a1506",
    infoBoxBlue: "#0a1828",
    infoBoxOrange:"#1a1008",
    tabActive:"linear-gradient(135deg,#00e5a0,#00b4ff)",
    tabActiveTxt:"#04111f",
    tabInactive:"rgba(255,255,255,0.07)",
    tabInactiveTxt:"rgba(200,230,255,0.6)",
    chartGrid:"rgba(255,255,255,0.05)",
    chartTipBg:"#06101e",
    accent:   "#00e5a0",
    accent2:  "#00b4ff",
    secColor: "#00e5a0",
    resetBg:  "rgba(255,255,255,0.05)",
    resetBorder:"rgba(255,255,255,0.12)",
    resetTxt: "rgba(200,230,255,0.7)",
    toggleBg: "#0d1520",
    toggleBorder:"rgba(255,255,255,0.12)",
  },
  light: {
    name: "Hell",
    bg:       "linear-gradient(160deg,#f0f4ff 0%,#e8f0fc 60%,#f4f8ff 100%)",
    bgSolid:  "#f0f4ff",
    card:     "#ffffff",
    cardBorder:"rgba(0,0,0,0.08)",
    cardAlt:  "#f0faf5",
    input:    "#f5f8ff",
    inputBorder:"rgba(0,0,0,0.15)",
    header:   "rgba(0,180,120,0.06)",
    headerBorder:"rgba(0,180,120,0.18)",
    text:     "#0d1f35",
    textSub:  "rgba(15,40,80,0.7)",
    textMuted:"rgba(15,40,80,0.5)",
    textFaint:"rgba(15,40,80,0.35)",
    divider:  "rgba(0,0,0,0.08)",
    rowHover: "#f5f8ff",
    infoBox:  "#eef5ff",
    infoBoxGreen:"#e8faf2",
    infoBoxAmber:"#fdf8e8",
    infoBoxBlue: "#e8f4ff",
    infoBoxOrange:"#fff3e8",
    tabActive:"linear-gradient(135deg,#00b890,#0090d0)",
    tabActiveTxt:"#ffffff",
    tabInactive:"rgba(0,0,0,0.07)",
    tabInactiveTxt:"rgba(15,40,80,0.6)",
    chartGrid:"rgba(0,0,0,0.06)",
    chartTipBg:"#ffffff",
    accent:   "#00a878",
    accent2:  "#0090d0",
    secColor: "#00a878",
    resetBg:  "rgba(0,0,0,0.04)",
    resetBorder:"rgba(0,0,0,0.12)",
    resetTxt: "rgba(15,40,80,0.6)",
    toggleBg: "#ffffff",
    toggleBorder:"rgba(0,0,0,0.15)",
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// KONSTANTEN
// ═════════════════════════════════════════════════════════════════════════════
const NK_DEFAULT = {
  oel:          { wartung:300, schornstein:150, tankmiete:80, strom_pumpe:60, netzentgelt_aufschlag:0 },
  gas:          { wartung:200, schornstein:100, grundpreis:120, strom_pumpe:60, netzentgelt_aufschlag:0.012 },
  kohle:        { wartung:150, schornstein:180, strom_pumpe:30, netzentgelt_aufschlag:0 },
  nachtspeicher:{ wartung:80, schornstein:0, grundpreis:0, strom_pumpe:20, netzentgelt_aufschlag:0 },
  fernwaerme:   { wartung:60, schornstein:0, grundpreis:180, strom_pumpe:0, netzentgelt_aufschlag:0 },
  wp:           { wartung:300 },
};

const NK_FELDER = {
  oel:          [["wartung","Jährliche Wartung","€/J."],["schornstein","Schornsteinfeger","€/J."],["tankmiete","Tank­miete / -reinigung","€/J."],["strom_pumpe","Betriebsstrom Pumpen","€/J."]],
  gas:          [["wartung","Jährliche Wartung","€/J."],["schornstein","Schornsteinfeger","€/J."],["grundpreis","Netz-Grundpreis / Zähler","€/J."],["strom_pumpe","Betriebsstrom Pumpen","€/J."],["netzentgelt_aufschlag","Netzentgelt-Aufschlag","€/kWh"]],
  kohle:        [["wartung","Jährliche Wartung","€/J."],["schornstein","Schornsteinfeger / Kaminkehrer","€/J."],["strom_pumpe","Betriebsstrom Pumpen","€/J."]],
  nachtspeicher:[["wartung","Jährliche Wartung","€/J."],["strom_pumpe","Betriebsstrom Pumpen","€/J."]],
  fernwaerme:   [["grundpreis","Bereitstellungspreis / Grundpreis","€/J."],["wartung","Jährliche Wartung","€/J."]],
  wp:           [["wartung","WP-Jahreswartung","€/J."]],
};

const HEIZUNGEN = {
  gas:          { label:"Gas",          icon:"🔥", farbe:"#FF6B35", co2_kwh:0.201, einheit:"kWh",   kwh_faktor:1,  klimaFaehig:true,  klimaHinweis:"nur wenn ≥ 20 Jahre alt" },
  oel:          { label:"Heizöl",       icon:"🛢️", farbe:"#c0703a", co2_kwh:0.266, einheit:"Liter", kwh_faktor:10, klimaFaehig:true,  klimaHinweis:"unabhängig vom Alter" },
  kohle:        { label:"Kohle",        icon:"⬛",  farbe:"#5a5a6e", co2_kwh:0.340, einheit:"kWh",   kwh_faktor:1,  klimaFaehig:true,  klimaHinweis:"unabhängig vom Alter" },
  nachtspeicher:{ label:"Nachtspeicher",icon:"⚡", farbe:"#d4a800", co2_kwh:0.380, einheit:"kWh",   kwh_faktor:1,  klimaFaehig:true,  klimaHinweis:"unabhängig vom Alter" },
  fernwaerme:   { label:"Fernwärme",    icon:"🏭", farbe:"#9B59B6", co2_kwh:0.150, einheit:"kWh",   kwh_faktor:1,  klimaFaehig:true,  klimaHinweis:"Wärmenetzanschluss § KfW 458" },
};

// KfW 458 – Förderbasis-Staffelung (Stand 21.07.2026, BEG-Reform):
// WE 1: 28.000 € · WE 2–6: je 15.000 € · WE 7+: je 8.000 € · Deckel je WE: 80 %
// Effizienzbonus (5 %) und Emissionsminderungszuschlag (2.500 €) sind ersatzlos entfallen.
const WP_CO2_KWH   = 0.380;
const KFW_WE1      = 28000;
const KFW_WE2_6    = 15000;
const KFW_WE7PLUS  = 8000;
const KFW_CAP      = 80;

// Klimageschwindigkeitsbonus – gesetzlich festgelegter Abschmelzpfad ab 21.07.2026
const KLIMA_ZEITRAEUME = [
  { id:"p1", von:"2026-07-21", bis:"2027-01-31", satz:16, label:"21.07.2026 – 31.01.2027" },
  { id:"p2", von:"2027-02-01", bis:"2027-07-31", satz:12, label:"01.02.2027 – 31.07.2027" },
  { id:"p3", von:"2027-08-01", bis:"2028-01-31", satz:8,  label:"01.08.2027 – 31.01.2028" },
  { id:"p4", von:"2028-02-01", bis:"2028-07-31", satz:4,  label:"01.02.2028 – 31.07.2028" },
  { id:"p5", von:"2028-08-01", bis:null,          satz:0,  label:"ab 01.08.2028 (ausgelaufen)" },
];
function aktuellerKlimaZeitraum() {
  const heute = new Date().toISOString().slice(0,10);
  return KLIMA_ZEITRAEUME.find(z => heute >= z.von && (z.bis===null || heute <= z.bis)) || KLIMA_ZEITRAEUME[0];
}

// Einkommensbonus – gestaffelt ab 21.07.2026 (zu versteuerndes Haushaltseinkommen,
// pauschal −10.000 € wenn mind. 1 Kind < 18 Jahre im Haushalt lebt)
function einkommensbonusSatz(einkommen, kindImHaushalt) {
  const massgeblich = Math.max(0, (einkommen||0) - (kindImHaushalt ? 10000 : 0));
  if (massgeblich <= 30000) return 40;
  if (massgeblich <= 40000) return 30;
  if (massgeblich <= 50000) return 10;
  return 0;
}
const EINK_SZENARIEN = [
  { id:"D", label:"≤ 30.000 €",        satz:40, beispiel:25000 },
  { id:"C", label:"30.001–40.000 €",   satz:30, beispiel:35000 },
  { id:"B", label:"40.001–50.000 €",   satz:10, beispiel:45000 },
  { id:"A", label:"> 50.000 €",        satz:0,  beispiel:60000 },
];

// § 35c EStG – Steuerermäßigung für energetische Sanierungsmaßnahmen (Alternative zur KfW-458-Förderung,
// beide sind nicht kombinierbar). 20 % der Aufwendungen, gedeckelt auf max. 200.000 € Bemessungsgrundlage
// je begünstigtem Objekt, verteilt über 3 Steuerjahre: Jahr 1 + 2 je 7 % (max. 14.000 €/Jahr),
// Jahr 3: 6 % (max. 12.000 €/Jahr). Voraussetzung: Gebäude bei Beginn der Maßnahme älter als 10 Jahre,
// selbstgenutztes Wohneigentum, Ausführung durch Fachunternehmen mit Bescheinigung.
const STEUER_35C_MAX_BEMESSUNG = 200000;
const STEUER_35C_JAHRE = [
  { jahr:1, satz:7, deckel:14000 },
  { jahr:2, satz:7, deckel:14000 },
  { jahr:3, satz:6, deckel:12000 },
];

const fmt  = (v,d=0) => Number(v).toLocaleString("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:d});
const fmtN = (v,d=0) => Number(v).toLocaleString("de-DE",{maximumFractionDigits:d});

// ═════════════════════════════════════════════════════════════════════════════
// BERECHNUNGEN
// ═════════════════════════════════════════════════════════════════════════════
function getCO2Preis(jahr, start, ziel) {
  return start + (ziel - start) * (Math.min(jahr, 2030) - 2025) / 5;
}

function berechneJahr(year, heiztyp, verbrauchKwh, preise, steigerung, cop, co2Start, co2Ziel, nk, wpWartung) {
  const h   = HEIZUNGEN[heiztyp];
  const yr  = year - 2025;
  const co2t = getCO2Preis(year, co2Start, co2Ziel);
  const pE  = preise[heiztyp] * Math.pow(1 + steigerung[heiztyp] / 100, yr);
  const betrieb = (verbrauchKwh / h.kwh_faktor) * pE;
  let nebenk = 0;
  if (heiztyp === "oel")           nebenk = nk.oel.wartung + nk.oel.schornstein + nk.oel.tankmiete + nk.oel.strom_pumpe;
  if (heiztyp === "gas")           nebenk = nk.gas.wartung + nk.gas.schornstein + nk.gas.grundpreis + nk.gas.strom_pumpe + verbrauchKwh * nk.gas.netzentgelt_aufschlag;
  if (heiztyp === "kohle")         nebenk = (nk.kohle?.wartung||150) + (nk.kohle?.schornstein||180) + (nk.kohle?.strom_pumpe||30);
  if (heiztyp === "nachtspeicher") nebenk = nk.nachtspeicher.wartung + nk.nachtspeicher.strom_pumpe;
  if (heiztyp === "fernwaerme")    nebenk = nk.fernwaerme.grundpreis + nk.fernwaerme.wartung;
  const co2Abg   = (verbrauchKwh * h.co2_kwh / 1000) * co2t;
  const gesamtAlt = betrieb + nebenk + co2Abg;
  const pWP  = preise.wp_strom * Math.pow(1 + steigerung.wp_strom / 100, yr);
  const wpKwh = verbrauchKwh / cop;
  const gesamtWP = wpKwh * pWP + wpWartung + (wpKwh * WP_CO2_KWH / 1000) * co2t;
  return { year, gesamtAlt, gesamtWP, ersparnis: gesamtAlt - gesamtWP,
           detail: { betrieb, nebenk, co2Abg } };
}

// KfW 458 – Fördersatz einer einzelnen Wohneinheit (Stand 21.07.2026)
//  • Grundförderung 30 %       → ALLE Wohneinheiten (auch vermietete)
//  • Klimabonus (gestaffelt)   → NUR selbstgenutzte WE (pro WE max. einmal)
//  • Einkommensbonus 10–40 %   → NUR selbstgenutzte HAUPTwohneinheit, gestaffelt nach Haushaltseinkommen
//  • Deckel: max. 80 % je Wohneinheit
//  • Effizienzbonus und Emissionsminderungszuschlag sind ersatzlos entfallen
function calcWE({ basis, gasAlt, selbstgenutzt, istHauptwohnung, mitKlima, klimaSatz, einkommenSatz, heiztyp }) {
  const klimaBerechtigt = selbstgenutzt && HEIZUNGEN[heiztyp]?.klimaFaehig && mitKlima && (heiztyp !== "gas" || gasAlt);
  const grund = 30;
  const klima = klimaBerechtigt ? klimaSatz : 0;
  // Einkommensbonus ausschließlich für die selbstgenutzte Hauptwohneinheit
  const eink  = istHauptwohnung ? einkommenSatz : 0;
  const satz  = Math.min(grund + klima + eink, KFW_CAP);
  return { basis, grund, klima, eink, satz, zuschuss: basis * satz / 100, klimaBerechtigt, istHauptwohnung };
}

// KfW 458 Förderbasis je Wohneinheit (offiziell, Stand 2025):
// WE 1: 30.000 € | WE 2–6: je 15.000 € | ab WE 7: je 8.000 €
function kfwBasisFuerWE(weNummer) {
  if (weNummer === 1)       return KFW_WE1;
  if (weNummer <= 6)        return KFW_WE2_6;
  return KFW_WE7PLUS;
}

// Summierte förderfähige Kostenbasis für n Wohneinheiten
function kfwGesamtbasis(anzahlWE) {
  let summe = 0;
  for (let i = 1; i <= anzahlWE; i++) summe += kfwBasisFuerWE(i);
  return summe;
}

// ─────────────────────────────────────────────────────────────────────────────
// KfW 458 – ANTEILIGE Berechnung bei zentraler Heizung (offizielles KfW-Beispiel)
//
// Methode laut KfW (WEG-/MFH-Beispiel), Stand 21.07.2026:
//  1. Investitionskosten werden ANTEILIG auf die Wohneinheiten verteilt
//     (Standard: gleichmäßig je WE; alternativ nach Miteigentumsanteil).
//  2. Jeder WE-Anteil wird auf ihren KfW-Höchstbetrag gedeckelt
//     (WE1: 28.000 €, WE2–6: 15.000 €, WE7+: 8.000 €).
//  3. Auf jeden gedeckelten Anteil wird der für DIESE WE gültige Satz gerechnet:
//       • vermietet:      30 % Grund (keine weiteren Boni)
//       • selbstgenutzt:  30 % + Klimabonus (gestaffelt) + Einkommensbonus (10–40 %) → max. 80 %
//       • Einkommensbonus nur für die EINE selbstgenutzte Hauptwohneinheit
// ─────────────────────────────────────────────────────────────────────────────
function berechneKfW({ gebaeude, selbstgenutztWE, investition, anzahlWE,
                       gasAlt, mitKlima, klimaSatz, haushaltseinkommen, kindImHaushalt, heiztyp }) {
  const weAnzahl = gebaeude === "efh" ? 1 : (anzahlWE || 2);
  const einkommenSatz = einkommensbonusSatz(haushaltseinkommen, kindImHaushalt);

  // 1. Kostenanteil je WE — gleichmäßige Aufteilung
  const anteilProWE = investition / weAnzahl;

  // 2./3. Jede WE einzeln berechnen
  const weListe = [];
  let zuschussGes = 0;
  let gesamtBasis = 0;
  let rest = 0;

  for (let i = 1; i <= weAnzahl; i++) {
    const deckel = kfwBasisFuerWE(i);
    const basis  = Math.min(anteilProWE, deckel);     // Anteil, gedeckelt
    rest += Math.max(0, anteilProWE - deckel);         // nicht förderfähiger Überhang
    gesamtBasis += basis;

    const selbst = i <= selbstgenutztWE;               // WE 1..selbstgenutztWE = selbst genutzt
    const haupt  = i === 1 && selbstgenutztWE >= 1;    // nur WE1 ist Hauptwohneinheit

    const we = calcWE({ basis, gasAlt,
                        selbstgenutzt: selbst,
                        istHauptwohnung: haupt,
                        mitKlima, klimaSatz, einkommenSatz, heiztyp });
    we.nummer = i;
    we.selbst = selbst;
    weListe.push(we);
    zuschussGes += we.zuschuss;
  }

  const effSatz = investition > 0 ? Math.round(zuschussGes / investition * 1000) / 10 : 0;

  // Kompatibilität mit bestehender Anzeige: we1 / we2 / Aggregat für WE3+
  const we1 = weListe[0];
  const we2 = weListe[1] || null;
  const basisWE1 = we1?.basis || 0;
  const basisWE2 = we2?.basis || 0;
  let basisWeitereWE = 0, zuschussWeitereWE = 0;
  for (let i = 2; i < weListe.length; i++) {
    basisWeitereWE += weListe[i].basis;
    zuschussWeitereWE += weListe[i].zuschuss;
  }

  return { we1, we2, weListe, anteilProWE, zuschussGes, effSatz,
           investNetto: investition - zuschussGes,
           basisWE1, basisWE2, basisWeitereWE, rest, gesamtBasis,
           einkommenSatz, zuschussWeitereWE };
}

// § 35c EStG – Steuerermäßigung über 3 Jahre berechnen
function berechneSteuer35c(investition) {
  const bemessung = Math.min(investition, STEUER_35C_MAX_BEMESSUNG);
  const gedeckelt  = investition > STEUER_35C_MAX_BEMESSUNG;
  const jahre = STEUER_35C_JAHRE.map(j => ({ ...j, betrag: Math.min(bemessung * j.satz / 100, j.deckel) }));
  const summe = jahre.reduce((s,j) => s + j.betrag, 0);
  const effSatz = investition > 0 ? Math.round(summe / investition * 1000) / 10 : 0;
  return { bemessung, gedeckelt, jahre, summe, effSatz, investNetto: investition - summe };
}

// ═════════════════════════════════════════════════════════════════════════════
// HAUPT-APP
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [themeKey, setThemeKey] = useState("dark");
  const T = THEMES[themeKey];
  const isDark = themeKey === "dark";

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("rechner");

  // ── Gebäude & Heizung ──────────────────────────────────────────────────────
  const [heiztyp,  setHeiztyp]  = useState("gas");
  const [gebaeude, setGebaeude] = useState("efh");
  const [selbstWE, setSelbstWE] = useState(1);

  // ── Wärmebedarf & WP ───────────────────────────────────────────────────────
  const [verbrauch, setVerbrauch] = useState(20000);
  const [cop,       setCop]       = useState(3.5);
  const [jahre,     setJahre]     = useState(20);

  // ── Investition & KfW ──────────────────────────────────────────────────────
  const [investition,  setInvestition]  = useState(22000);
  const [gasAlt,       setGasAlt]       = useState(true);
  const [mitKlima,     setMitKlima]     = useState(true);
  const [haushaltseinkommen, setHaushaltseinkommen] = useState(55000); // zu versteuerndes Haushaltseinkommen €
  const [kindImHaushalt,     setKindImHaushalt]     = useState(false); // pauschal −10.000 € Anrechnung
  const [anzahlWE,           setAnzahlWE]           = useState(2);    // bei ZFH/MFH
  const [klimaZeitraumId, setKlimaZeitraumId] = useState(()=>aktuellerKlimaZeitraum().id);

  // ── Fördervariante: KfW-458-Zuschuss ODER § 35c EStG (Alternative, nicht kombinierbar) ──
  const [foerderVariante, setFoerderVariante] = useState("kfw"); // "kfw" | "35c"
  const [gebaeudeUeber10Jahre, setGebaeudeUeber10Jahre] = useState(true); // Voraussetzung § 35c

  // ── Energiepreise & Steigerung ─────────────────────────────────────────────
  const [preise, setPreise] = useState({ gas:0.12, oel:1.00, nachtspeicher:0.28, fernwaerme:0.14, wp_strom:0.22 });
  const [steigerung, setSteigerung] = useState({ gas:5, oel:4, nachtspeicher:2, fernwaerme:3, wp_strom:1 });
  const [co2Start, setCo2Start] = useState(55);
  const [co2Ziel,  setCo2Ziel]  = useState(150);

  // ── Nebenkosten (editierbar) ───────────────────────────────────────────────
  const [nk, setNk] = useState(NK_DEFAULT);
  const [nkOpen, setNkOpen] = useState(null); // accordion: welcher Heiztyp ist offen
  const setNkVal = (typ, feld, val) => setNk(n => ({ ...n, [typ]: { ...n[typ], [feld]: parseFloat(val)||0 } }));

  // ── Abgeleitete Werte ──────────────────────────────────────────────────────
  const setP = (k,v) => setPreise(p => ({ ...p, [k]:v }));
  const setS = (k,v) => setSteigerung(s => ({ ...s, [k]:v }));

  const klimaZeitraum = KLIMA_ZEITRAEUME.find(z=>z.id===klimaZeitraumId) || KLIMA_ZEITRAEUME[0];

  const kfw = useMemo(() => berechneKfW({
    gebaeude, selbstgenutztWE:selbstWE, investition, anzahlWE,
    gasAlt, mitKlima, klimaSatz:klimaZeitraum.satz, haushaltseinkommen, kindImHaushalt, heiztyp,
  }), [gebaeude, selbstWE, investition, anzahlWE, gasAlt, mitKlima, klimaZeitraum.satz, haushaltseinkommen, kindImHaushalt, heiztyp]);

  const steuer35c = useMemo(() => berechneSteuer35c(investition), [investition]);
  const berechtigt35c = gebaeudeUeber10Jahre && selbstWE >= 1;

  const zeitreihe = useMemo(() => {
    const rows = [];
    let kumulAlt = 0, kumulWP = kfw.investNetto;
    for (let y = 2025; y <= 2025 + jahre; y++) {
      const r = berechneJahr(y, heiztyp, verbrauch, preise, steigerung, cop, co2Start, co2Ziel, nk, nk.wp.wartung);
      kumulAlt += r.gesamtAlt;
      if (y > 2025) kumulWP += r.gesamtWP;
      rows.push({ ...r, kumulAlt, kumulWP, kumulDiff: kumulAlt - kumulWP });
    }
    return rows;
  }, [heiztyp, verbrauch, preise, steigerung, cop, jahre, kfw.investNetto, co2Start, co2Ziel, nk]);

  const j1        = zeitreihe[0] || {};
  const amortJahr = zeitreihe.find(r => r.kumulDiff > 0);
  const amortText = amortJahr ? `${amortJahr.year}` : `>${2025+jahre}`;
  const erspGes   = (zeitreihe[zeitreihe.length-1]||{}).kumulDiff || 0;
  const co2ErsJahr = verbrauch * (HEIZUNGEN[heiztyp].co2_kwh - WP_CO2_KWH / cop);

  const detail1 = useMemo(() => {
    const n = nk[heiztyp] || {};
    const co2T = verbrauch * HEIZUNGEN[heiztyp].co2_kwh / 1000;
    let nebenk = 0;
    if (heiztyp==="oel")           nebenk = n.wartung+n.schornstein+n.tankmiete+n.strom_pumpe;
    if (heiztyp==="gas")           nebenk = n.wartung+n.schornstein+n.grundpreis+n.strom_pumpe+verbrauch*n.netzentgelt_aufschlag;
    if (heiztyp==="kohle")         nebenk = (n.wartung||150)+(n.schornstein||180)+(n.strom_pumpe||30);
    if (heiztyp==="nachtspeicher") nebenk = n.wartung+n.strom_pumpe;
    if (heiztyp==="fernwaerme")    nebenk = n.grundpreis+n.wartung;
    return { nebenk, co2Abgabe: co2T * co2Start };
  }, [heiztyp, verbrauch, co2Start, nk]);

  const chartKumul = zeitreihe.filter((_,i)=>i%2===0||i===zeitreihe.length-1).map(r=>({
    Jahr:r.year, [HEIZUNGEN[heiztyp].label]:Math.round(r.kumulAlt), "Wärmepumpe":Math.round(r.kumulWP)
  }));
  const chartJaehrlich = Object.entries(HEIZUNGEN).map(([key,v])=>{
    const r  = berechneJahr(2025,key,verbrauch,preise,steigerung,cop,co2Start,co2Ziel,nk,nk.wp.wartung);
    const rW = berechneJahr(2025,heiztyp,verbrauch,preise,steigerung,cop,co2Start,co2Ziel,nk,nk.wp.wartung);
    return { name:v.label,"Heizkosten":Math.round(r.gesamtAlt),"Wärmepumpe":Math.round(rW.gesamtWP),farbe:v.farbe,key };
  });

  // ── Style-Helpers (theme-abhängig) ─────────────────────────────────────────
  const C_S = { background:T.card, border:`1px solid ${T.cardBorder}`, borderRadius:18, padding:"22px 26px" };
  const SEC  = { fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:T.secColor, marginBottom:16 };
  const LBL  = { fontSize:12, color:T.textSub, fontWeight:500 };
  const INP  = { width:"100%", boxSizing:"border-box", background:T.input, border:`1px solid ${T.inputBorder}`,
                  borderRadius:10, padding:"10px 14px", color:T.text, fontSize:14, fontFamily:"inherit", outline:"none" };

  const ChartTip = ({ active, payload, label }) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={{ background:T.chartTipBg, border:`1px solid ${T.accent}40`, borderRadius:10,
        padding:"10px 16px", fontFamily:"inherit", fontSize:13, color:T.text }}>
        <div style={{ color:T.accent, fontWeight:700, marginBottom:5 }}>{label}</div>
        {payload.map((p,i)=><div key={i} style={{ color:p.color, marginBottom:2 }}>{p.name}: <strong>{fmt(p.value)}</strong></div>)}
      </div>
    );
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={()=>setTab(id)} style={{
      padding:"9px 18px", borderRadius:9, border:"none", cursor:"pointer",
      fontSize:13, fontWeight:600, fontFamily:"inherit",
      background: tab===id ? T.tabActive : T.tabInactive,
      color: tab===id ? T.tabActiveTxt : T.tabInactiveTxt, transition:"all 0.18s",
    }}>{label}</button>
  );

  // Eingabefeld mit lokalem Tipp-Zustand: erlaubt komplettes Leeren des Feldes,
  // begrenzt erst beim Verlassen (onBlur) auf den erlaubten Bereich.
  const NumberField = ({ value, onChange, min, max, step, color, width=84 }) => {
    const c = color || T.accent;
    const [draft, setDraft] = useState(null); // null = zeigt den echten value; sonst Tipp-Text
    const shown = draft !== null ? draft : String(value);
    const commit = (raw) => {
      if (raw === "" || raw === "-") { setDraft(null); return; } // leer → zurück zum Wert
      let v = parseFloat(String(raw).replace(",", "."));
      if (isNaN(v)) { setDraft(null); return; }
      if (v < min) v = min;
      if (v > max) v = max;
      onChange(v);
      setDraft(null);
    };
    return (
      <input
        type="text" inputMode="decimal" value={shown}
        onChange={e => setDraft(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
        onFocus={e => e.target.select()}
        style={{ width, boxSizing:"border-box", textAlign:"right",
          background:T.input, border:`1px solid ${c}55`, borderRadius:8,
          padding:"4px 8px", color:c, fontSize:14, fontWeight:700,
          fontFamily:"inherit", outline:"none" }} />
    );
  };

  // Volle-Breite-Variante für die Einstellungen (Preise, Steigerung, Nebenkosten)
  const NumberFieldFull = ({ value, onChange, min=0, max=Infinity, step, suffix, suffixWidth=28 }) => {
    const [draft, setDraft] = useState(null);
    const shown = draft !== null ? draft : String(value);
    const commit = (raw) => {
      if (raw === "") { onChange(0); setDraft(null); return; }
      let v = parseFloat(String(raw).replace(",", "."));
      if (isNaN(v)) { setDraft(null); return; }
      if (v < min) v = min;
      if (v > max) v = max;
      onChange(v);
      setDraft(null);
    };
    return (
      <div style={{ position:"relative" }}>
        <input type="text" inputMode="decimal" value={shown}
          onChange={e => setDraft(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
          onFocus={e => e.target.select()}
          style={{ ...INP, paddingRight:suffixWidth, marginBottom:4, fontWeight:700, fontSize:15 }} />
        {suffix && <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-60%)",
          fontSize:11, color:T.textFaint }}>{suffix}</span>}
      </div>
    );
  };

  const Slider = ({ label, value, onChange, min, max, step, unit, color }) => {
    const c = color || T.accent;
    return (
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={LBL}>{label}</span>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <NumberField value={value} onChange={onChange} min={min} max={max} step={step} color={c} />
            {unit && <span style={{ fontSize:12, fontWeight:600, color:T.textMuted, minWidth:18 }}>{unit.trim()}</span>}
          </div>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e=>onChange(+e.target.value)} style={{ width:"100%", accentColor:c }} />
      </div>
    );
  };

  const Row = ({ label, value, color, bold }) => (
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
      <span style={{ fontSize:12, color:color||T.textSub }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:bold?800:600, color:color||T.text }}>{value}</span>
    </div>
  );

  const CheckBox = ({ label, checked, onChange, disabled }) => (
    <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:disabled?"not-allowed":"pointer",
      opacity:disabled?0.4:1, fontSize:12, color:T.textSub, marginBottom:10, lineHeight:1.5 }}>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}
        disabled={disabled} style={{ accentColor:T.accent, width:15, height:15, flexShrink:0, marginTop:1 }} />
      {label}
    </label>
  );

  const KPI = ({ label, value, sub, big, color, badge, badgeGreen }) => {
    const c = color || T.text;
    return (
      <div style={{
        background: big ? T.infoBoxGreen : T.rowHover,
        border: big ? `1px solid ${T.accent}35` : `1px solid ${T.cardBorder}`,
        borderRadius:14, padding:"16px 18px", gridColumn:big?"1/-1":"auto",
      }}>
        <div style={{ fontSize:10, color:T.textMuted, textTransform:"uppercase", letterSpacing:1.2, fontWeight:600, marginBottom:5 }}>{label}</div>
        <div style={{ fontSize:big?30:21, fontWeight:800, color:c, letterSpacing:"-0.5px", lineHeight:1 }}>{value}</div>
        {sub   && <div style={{ fontSize:11, color:T.textMuted, marginTop:4 }}>{sub}</div>}
        {badge && <div style={{ display:"inline-block", marginTop:6, padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700,
          background:badgeGreen?`${T.accent}25`:"rgba(255,80,80,0.15)",
          color:badgeGreen?T.accent:"#ff5959" }}>{badge}</div>}
      </div>
    );
  };

  const HzBtn = ({ k, v }) => (
    <button onClick={()=>setHeiztyp(k)} style={{
      padding:"11px 6px", borderRadius:11, cursor:"pointer", textAlign:"center",
      fontSize:12, fontFamily:"inherit",
      border: heiztyp===k?`2px solid ${T.accent}`:`1px solid ${T.cardBorder}`,
      background: heiztyp===k ? (isDark?"rgba(0,229,160,0.12)":"rgba(0,180,120,0.1)") : T.rowHover,
      color: heiztyp===k?T.accent:T.textSub, fontWeight:heiztyp===k?700:500,
    }}>
      <div style={{ fontSize:20, marginBottom:3 }}>{v.icon}</div>{v.label}
    </button>
  );

  // Klimabonus-Label
  const klimaBerechtigt = mitKlima && HEIZUNGEN[heiztyp]?.klimaFaehig && (heiztyp!=="gas"||gasAlt);
  const klimaLabel = heiztyp==="gas"
    ? `+${klimaZeitraum.satz} % Klimabonus (Gas ${gasAlt?"≥ 20 J. ✔":"< 20 J. ✗"})`
    : `+${klimaZeitraum.satz} % Klimabonus (${HEIZUNGEN[heiztyp]?.label} ✔)`;

  // Nebenkosten-Total für aktiven Heiztyp (für Anzeige im Accordion-Header)
  const nkTotal = (typ) => {
    const n = nk[typ] || {};
    if (typ==="oel") return n.wartung+n.schornstein+n.tankmiete+n.strom_pumpe;
    if (typ==="gas") return n.wartung+n.schornstein+n.grundpreis+n.strom_pumpe;
    if (typ==="nachtspeicher") return n.wartung+n.strom_pumpe;
    if (typ==="fernwaerme") return n.grundpreis+n.wartung;
    if (typ==="wp") return n.wartung;
    return 0;
  };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Segoe UI',system-ui,sans-serif",
      color:T.text, fontSize:14, isolation:"isolate" }}>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom:`1px solid ${T.headerBorder}`, padding:"14px 28px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12,
        background:T.header }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <img src="/logo.png" alt="Dirk Demant – Heizung Sanitär Solar"
            style={{ height:48, width:"auto",
              background: isDark ? "transparent" : "#0a0a0a",
              borderRadius: isDark ? 0 : 8,
              padding: isDark ? 0 : "6px 10px" }} />
          <div style={{ borderLeft:`1px solid ${T.divider}`, paddingLeft:16 }}>
            <div style={{ fontSize:18, fontWeight:800, background:"linear-gradient(90deg,#00b890,#0090d0)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Wärmepumpen-Rechner</div>
            <div style={{ fontSize:11, color:T.textMuted, marginTop:1 }}>
              Kostenvergleich · KfW-Förderrechner · Amortisation · CO₂ · Prognose bis {2025+jahre}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          {/* Theme-Toggle */}
          <button onClick={()=>setThemeKey(isDark?"light":"dark")} style={{
            display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:20,
            border:`1px solid ${T.toggleBorder}`, background:T.toggleBg, cursor:"pointer",
            fontSize:12, fontWeight:600, fontFamily:"inherit", color:T.text, transition:"all 0.2s",
          }}>
            <span style={{ fontSize:16 }}>{isDark?"☀️":"🌙"}</span>
            <span>{isDark?"Hell":"Dunkel"}</span>
            <span style={{ display:"inline-block", width:32, height:18, borderRadius:9,
              background: isDark?"rgba(255,255,255,0.15)":"rgba(0,180,120,0.3)",
              position:"relative", transition:"all 0.2s" }}>
              <span style={{ position:"absolute", top:2, left: isDark?2:16, width:14, height:14,
                borderRadius:"50%", background: isDark?"#e8f4ff":"#00b890", transition:"all 0.2s" }} />
            </span>
          </button>

          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <TabBtn id="rechner"      label="🧮 Rechner" />
            <TabBtn id="foerderung"   label="🏦 Förderrechner" />
            <TabBtn id="einstellungen" label="⚙️ Einstellungen" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: RECHNER
      ══════════════════════════════════════════════════════════════════════ */}
      {tab==="rechner" && (
        <div style={{ maxWidth:1220, margin:"0 auto", padding:"26px 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:20, alignItems:"start" }}>

            {/* LINKS */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              <div style={C_S}>
                <div style={SEC}>Meine aktuelle Heizung</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  {Object.entries(HEIZUNGEN).map(([k,v]) => <HzBtn key={k} k={k} v={v} />)}
                </div>
                {heiztyp==="gas" && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>Alter der Gasheizung:</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {[[true,"≥ 20 Jahre (Klimabonus ✔)"],[false,"< 20 Jahre (kein Klimabonus)"]].map(([val,lbl])=>(
                        <button key={String(val)} onClick={()=>setGasAlt(val)} style={{
                          padding:"9px 8px", borderRadius:9, cursor:"pointer", fontSize:11,
                          fontFamily:"inherit", textAlign:"center",
                          border: gasAlt===val?"2px solid #f59e0b":`1px solid ${T.cardBorder}`,
                          background: gasAlt===val?(isDark?"#1a1506":"#fdf8e8"):T.rowHover,
                          color: gasAlt===val?"#d4891a":T.textSub, fontWeight:gasAlt===val?700:500,
                        }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ background:T.rowHover, borderRadius:10, padding:"10px 12px", fontSize:11, border:`1px solid ${T.cardBorder}` }}>
                  <div style={{ color:T.textMuted, marginBottom:5, fontWeight:600 }}>Vollkosten Jahr 1:</div>
                  <Row label="Energiekosten" value={fmt(j1.detail?.betrieb||0)} />
                  <Row label="Nebenkosten (Wartung, Netz…)" value={fmt(detail1.nebenk)} />
                  <Row label="CO₂-Abgabe" value={fmt(detail1.co2Abgabe)} color={isDark?"rgba(255,160,80,0.85)":"#c05010"} />
                  <div style={{ height:1, background:T.divider, margin:"5px 0" }} />
                  <Row label="Gesamt/Jahr" value={fmt(j1.gesamtAlt||0)} bold color={T.text} />
                </div>
              </div>

              <div style={C_S}>
                <div style={SEC}>Gebäude & Wärmepumpe</div>
                <Slider label="Jährlicher Wärmebedarf" value={verbrauch} onChange={setVerbrauch} min={5000} max={60000} step={1000} unit=" kWh" />
                <div style={{ fontSize:10, color:T.textFaint, marginTop:-12, marginBottom:16 }}>Richtwert: Wohnfläche × 80–200 kWh/m²/J.</div>
                <Slider label="Jahresarbeitszahl (JAZ / COP)" value={cop} onChange={setCop} min={2.0} max={6.0} step={0.1} unit="" />
                <div style={{ fontSize:10, color:T.textFaint, marginTop:-12 }}>Luft-WP: 3,0–4,0 · Erdwärme: 4,0–5,5</div>
              </div>

              <div style={C_S}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={SEC}>Investition & KfW-Förderung</div>
                  <button onClick={()=>setTab("foerderung")} style={{ fontSize:10, color:T.accent, background:"none",
                    border:"none", cursor:"pointer", textDecoration:"underline", marginTop:-10, paddingBottom:14 }}>Details →</button>
                </div>
                <Slider label="Investitionskosten (brutto)" value={investition} onChange={setInvestition} min={8000} max={60000} step={500} unit=" €" />
                <div style={{ background:T.infoBoxBlue, border:`1px solid ${T.accent2}30`, borderRadius:12, padding:"13px 15px", fontSize:12 }}>
                  <Row label={`${gebaeude==="efh"?"🏠 EFH":"🏘️ ZFH"} · Fördersatz`}
                    value={`${kfw.we1.satz}%${kfw.we2?` / ${kfw.we2.satz}% (WE2)`:""}`} color={T.accent} bold />
                  <Row label="KfW-Zuschuss gesamt" value={`− ${fmt(kfw.zuschussGes)}`} color={T.accent} bold />
                  <div style={{ height:1, background:`${T.accent2}30`, margin:"6px 0" }} />
                  <Row label="Ihr Eigenanteil" value={fmt(kfw.investNetto)} color={T.accent2} bold />
                </div>
                <div style={{ marginTop:16 }}>
                  <Slider label="Betrachtungszeitraum" value={jahre} onChange={setJahre} min={5} max={25} step={1} unit=" Jahre" />
                </div>
              </div>
            </div>

            {/* RECHTS */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={C_S}>
                <div style={SEC}>Ergebnisse auf einen Blick</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:4 }}>
                  <KPI big label="💰 Ersparnis im 1. Jahr (Vollkosten inkl. Nebenkosten & CO₂)"
                    value={fmt(j1.ersparnis||0)} color={T.accent}
                    sub={`${fmt(j1.gesamtAlt||0)}/J. → ${fmt(j1.gesamtWP||0)}/J.`}
                    badge={`▼ ${Math.round(((j1.ersparnis||0)/(j1.gesamtAlt||1))*100)}% günstiger`} badgeGreen />
                  <KPI label="📅 Amortisation" value={amortText} sub="Kostengleichheit" color={T.accent2} />
                  <KPI label={`💵 Ersparnis in ${jahre} J.`} value={fmt(erspGes)} sub="inkl. CO₂-Preisentwicklung" />
                  <KPI label="🌱 CO₂ gespart/Jahr"
                    value={`${fmtN(Math.max(0,Math.round(co2ErsJahr)))} kg`}
                    sub={`≈ ${Math.max(0,Math.round(co2ErsJahr/120))} Bäume/Jahr`} />
                </div>
              </div>

              <div style={C_S}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={SEC}>📈 Kumulierte Gesamtkosten bis {2025+jahre}</div>
                  <div style={{ fontSize:10, color:T.textFaint }}>inkl. Nebenkosten, CO₂ & Preissteigerung</div>
                </div>
                <ResponsiveContainer width="100%" height={225}>
                  <LineChart data={chartKumul} margin={{ top:4, right:12, bottom:0, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} vertical={false} />
                    <XAxis dataKey="Jahr" tick={{ fill:T.textMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v=>`${Math.round(v/1000)}k€`} tick={{ fill:T.textFaint, fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize:12, color:T.textMuted, paddingTop:8 }} />
                    <Line type="monotone" dataKey={HEIZUNGEN[heiztyp].label} stroke={HEIZUNGEN[heiztyp].farbe} strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="Wärmepumpe" stroke={T.accent} strokeWidth={2.5} dot={false} />
                    {amortJahr && <ReferenceLine x={amortJahr.year} stroke={`${T.accent}60`} strokeDasharray="5 4"
                      label={{ value:"Amortisation", fill:T.accent, fontSize:10, position:"insideTopRight" }} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={C_S}>
                <div style={SEC}>📊 Jährliche Vollkosten — alle Systeme (2025)</div>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={chartJaehrlich} barCategoryGap="30%" barGap={4} margin={{ top:4, right:8, bottom:0, left:4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill:T.textMuted, fontSize:12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v=>`${Math.round(v/1000)}k€`} tick={{ fill:T.textFaint, fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill:isDark?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.03)" }} />
                    <Bar dataKey="Heizkosten" name="Vollkosten inkl. CO₂" radius={[6,6,0,0]}>
                      {chartJaehrlich.map((e,i)=><Cell key={i} fill={e.farbe} opacity={e.key===heiztyp?1:0.35} />)}
                    </Bar>
                    <Bar dataKey="Wärmepumpe" name="Wärmepumpe" fill={T.accent} radius={[6,6,0,0]} opacity={0.9} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ ...C_S, padding:"11px 20px" }}>
                <div style={{ fontSize:10, color:T.textFaint, lineHeight:1.9 }}>
                  <strong style={{ color:T.textMuted }}>Hinweis:</strong> Vollkostenrechnung
                  inkl. Wartung, Schornstein, Netz & CO₂-Abgabe ({co2Start}→{co2Ziel} €/t).
                  KfW 458: {fmt(kfw.zuschussGes)} Zuschuss · Eigenanteil {fmt(kfw.investNetto)}.{" "}
                  <span onClick={()=>setTab("foerderung")} style={{ color:T.accent, cursor:"pointer", textDecoration:"underline" }}>Förderdetails →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: FÖRDERRECHNER
      ══════════════════════════════════════════════════════════════════════ */}
      {tab==="foerderung" && (
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"26px 20px" }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:17, fontWeight:800, marginBottom:3, color:T.text }}>🏦 Förderrechner & Szenarien</div>
            <div style={{ fontSize:12, color:T.textMuted }}>Alle Einstellungen mit dem Rechner-Tab verknüpft · BEG-EM-Richtlinien Stand 21.07.2026</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:20, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              <div style={C_S}>
                <div style={SEC}>Fördervariante</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                  {[["kfw","🏦","KfW 458","Zuschuss"],["35c","📄","§ 35c EStG","Steuerermäßigung"]].map(([id,ico,lbl,sub])=>(
                    <button key={id} onClick={()=>setFoerderVariante(id)} style={{
                      padding:"13px 8px", borderRadius:12, cursor:"pointer", textAlign:"center", fontFamily:"inherit",
                      border: foerderVariante===id?`2px solid ${T.accent}`:`1px solid ${T.cardBorder}`,
                      background: foerderVariante===id?(isDark?"rgba(0,229,160,0.1)":"rgba(0,180,120,0.08)"):T.rowHover,
                      color: foerderVariante===id?T.accent:T.textSub, fontWeight:foerderVariante===id?700:500,
                    }}>
                      <div style={{ fontSize:22, marginBottom:4 }}>{ico}</div>
                      <div style={{ fontSize:13 }}>{lbl}</div>
                      <div style={{ fontSize:10, color:T.textFaint, marginTop:2 }}>{sub}</div>
                    </button>
                  ))}
                </div>
                <div style={{ background:T.rowHover, borderRadius:10, padding:"10px 12px", fontSize:11, border:`1px solid ${T.cardBorder}` }}>
                  <Row label="🏦 KfW-458-Zuschuss wäre" value={fmt(kfw.zuschussGes)} color={foerderVariante==="kfw"?T.accent:T.textMuted} bold={foerderVariante==="kfw"} />
                  <Row label="📄 § 35c Steuerermäßigung wäre" value={`${fmt(steuer35c.summe)} (3 J.)`} color={foerderVariante==="35c"?T.accent:T.textMuted} bold={foerderVariante==="35c"} />
                </div>
                <div style={{ fontSize:10, color:T.textFaint, lineHeight:1.7, marginTop:10 }}>
                  ⚖️ Beide Förderarten sind für dieselbe Maßnahme <strong>nicht kombinierbar</strong> — nur eine
                  Variante ist wählbar. Ein KfW-Zuschuss oder zinsverbilligter Förderkredit schließt die
                  Steuerermäßigung nach § 35c EStG für diese Maßnahme aus, und umgekehrt.
                </div>
              </div>

              <div style={C_S}>
                <div style={SEC}>Gebäudeart & Nutzung</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[["efh","🏠","Einfamilienhaus","1 Wohneinheit"],["zfh","🏘️","Zweifamilienhaus","2 Wohneinheiten"]].map(([id,ico,lbl,sub])=>(
                    <button key={id} onClick={()=>setGebaeude(id)} style={{
                      padding:"13px 8px", borderRadius:12, cursor:"pointer", textAlign:"center", fontFamily:"inherit",
                      border: gebaeude===id?`2px solid ${T.accent}`:`1px solid ${T.cardBorder}`,
                      background: gebaeude===id?(isDark?"rgba(0,229,160,0.1)":"rgba(0,180,120,0.08)"):T.rowHover,
                      color: gebaeude===id?T.accent:T.textSub, fontWeight:gebaeude===id?700:500,
                    }}>
                      <div style={{ fontSize:22, marginBottom:4 }}>{ico}</div>
                      <div style={{ fontSize:13 }}>{lbl}</div>
                      <div style={{ fontSize:10, color:T.textFaint, marginTop:2 }}>{sub}</div>
                    </button>
                  ))}
                </div>
                {gebaeude==="zfh" && (
                  <div>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, fontWeight:600 }}>Wohneinheiten gesamt:</div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <input type="range" min={2} max={12} step={1} value={anzahlWE}
                        onChange={e=>setAnzahlWE(+e.target.value)}
                        style={{ flex:1, accentColor:T.accent }} />
                      <span style={{ fontSize:16, fontWeight:800, color:T.accent, minWidth:30 }}>{anzahlWE}</span>
                    </div>
                    <div style={{ fontSize:10, color:T.textFaint, marginBottom:10, lineHeight:1.7 }}>
                      WE 1: {fmt(KFW_WE1)} · WE 2–6: je {fmt(KFW_WE2_6)} · ab WE 7: je {fmt(KFW_WE7PLUS)} Förderbasis
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, fontWeight:600 }}>Nutzung durch den Eigentümer:</div>
                    {[
                      [0,"Nur vermietet","Keine selbstgenutzte WE — nur Grundförderung (30 %) für alle Einheiten"],
                      [1,"Eine WE selbst bewohnt","WE 1 = Hauptwohnsitz (alle Boni möglich), übrige WE vermietet (30 %)"],
                      [2,"Zwei WE selbst bewohnt","WE 1 = Hauptwohnsitz (alle Boni), WE 2 selbst (Klimabonus, aber kein Einkommensbonus)"],
                    ].map(([val,lbl,sub])=>(
                      <label key={val} style={{ display:"flex", alignItems:"flex-start", gap:9, cursor:"pointer",
                        fontSize:12, color:selbstWE===val?T.accent:T.textSub,
                        marginBottom:7, padding:"9px 11px", borderRadius:8, lineHeight:1.4,
                        background:selbstWE===val?(isDark?"rgba(0,229,160,0.08)":"rgba(0,180,120,0.07)"):T.rowHover,
                        border:selbstWE===val?`1px solid ${T.accent}30`:`1px solid transparent` }}>
                        <input type="radio" name="sw" value={val} checked={selbstWE===val}
                          onChange={()=>setSelbstWE(val)} style={{ accentColor:T.accent, marginTop:2, flexShrink:0 }} />
                        <span>
                          <span style={{ fontWeight:600 }}>{lbl}</span>
                          <span style={{ display:"block", fontSize:10, color:T.textFaint, marginTop:2 }}>{sub}</span>
                        </span>
                      </label>
                    ))}
                    <div style={{ fontSize:10, color:T.textMuted, marginTop:8, padding:"9px 11px",
                      background:T.infoBoxAmber, borderRadius:8, lineHeight:1.7 }}>
                      ⚖️ <strong>Wichtig (KfW 458, Stand 21.07.2026):</strong> Die Investitionskosten werden
                      <strong> anteilig auf die Wohneinheiten</strong> verteilt; je WE wird auf den eigenen
                      Höchstbetrag gedeckelt (WE 1: {fmt(KFW_WE1)}, WE 2–6: je {fmt(KFW_WE2_6)}). Der <strong>Einkommensbonus</strong> gilt
                      nur für die <strong>eine selbstgenutzte Hauptwohneinheit</strong>, der <strong>Klimabonus</strong>
                      für jede selbstgenutzte WE. Vermietete WE erhalten nur die Grundförderung (30 %).
                    </div>
                  </div>
                )}
              </div>

              <div style={C_S}>
                <div style={SEC}>Heizung & Klimabonus</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                  {Object.entries(HEIZUNGEN).map(([k,v])=><HzBtn key={k} k={k} v={v} />)}
                </div>
                {heiztyp==="gas" && (
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>Alter der Gasheizung:</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {[[true,"≥ 20 J. (Klimabonus ✔)"],[false,"< 20 J. (kein Klimabonus)"]].map(([val,lbl])=>(
                        <button key={String(val)} onClick={()=>setGasAlt(val)} style={{
                          padding:"9px 6px", borderRadius:9, cursor:"pointer", fontSize:11,
                          fontFamily:"inherit", textAlign:"center",
                          border: gasAlt===val?"2px solid #f59e0b":`1px solid ${T.cardBorder}`,
                          background: gasAlt===val?(isDark?"#1a1506":"#fdf8e8"):T.rowHover,
                          color: gasAlt===val?"#d4891a":T.textSub, fontWeight:gasAlt===val?700:500,
                        }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {foerderVariante==="35c" && (
                <div style={C_S}>
                  <div style={SEC}>Voraussetzungen § 35c EStG</div>
                  <CheckBox label="Gebäude ist bei Beginn der Maßnahme mindestens 10 Jahre alt"
                    checked={gebaeudeUeber10Jahre} onChange={setGebaeudeUeber10Jahre} />
                  <div style={{ fontSize:12, color:T.textSub, marginBottom:10, lineHeight:1.6 }}>
                    Nutzung: {selbstWE>=1
                      ? <span style={{ color:T.accent, fontWeight:700 }}>Selbstgenutzt ✔ (Voraussetzung erfüllt)</span>
                      : <span style={{ color:"#ff5959", fontWeight:700 }}>Nicht selbstgenutzt ✘ — § 35c gilt nur für selbstgenutztes Wohneigentum</span>}
                  </div>
                  {!berechtigt35c && (
                    <div style={{ background:T.infoBoxAmber, borderRadius:10, padding:"10px 12px", fontSize:11,
                      color:isDark?"#e0b040":"#8a5a00", lineHeight:1.7, marginBottom:6 }}>
                      ⚠️ § 35c EStG ist hier <strong>nicht anwendbar</strong> — beide Voraussetzungen (Gebäudealter
                      ≥ 10 Jahre, Selbstnutzung) müssen erfüllt sein.
                    </div>
                  )}
                  <div style={{ fontSize:10, color:T.textFaint, lineHeight:1.8, marginTop:8 }}>
                    Weitere Voraussetzungen: Ausführung durch ein <strong>Fachunternehmen</strong> mit Bescheinigung
                    nach amtlichem Muster (ESanMV); Beantragung über die <strong>Steuererklärung</strong>
                    (Anlage „Energetische Maßnahmen“) für die 3 Jahre nach Fertigstellung. Aufwendungen für einen
                    Energieberater sind zusätzlich zu 50 % (statt 20 %) absetzbar.
                  </div>
                </div>
              )}

              {foerderVariante==="kfw" && (
              <div style={C_S}>
                <div style={SEC}>Förderbausteine KfW 458 (Stand 21.07.2026)</div>
                <CheckBox label="✅ Grundförderung 30 % (immer enthalten)" checked={true} onChange={()=>{}} disabled />

                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:11, color:T.textMuted, marginBottom:6 }}>Klimabonus-Zeitraum (Antragstellung):</div>
                  <select value={klimaZeitraumId} onChange={e=>setKlimaZeitraumId(e.target.value)} style={INP}>
                    {KLIMA_ZEITRAEUME.map(z=><option key={z.id} value={z.id}>{z.label} — {z.satz} %</option>)}
                  </select>
                </div>
                <CheckBox label={klimaLabel} checked={mitKlima} onChange={setMitKlima}
                  disabled={!HEIZUNGEN[heiztyp]?.klimaFaehig||(gebaeude==="zfh"&&selbstWE===0)} />

                <div style={{ height:1, background:T.divider, margin:"10px 0" }} />
                <div style={{ fontSize:12, color:T.textSub, marginBottom:6, fontWeight:600 }}>Einkommensbonus (gestaffelt, nur Hauptwohneinheit):</div>
                <input type="number" value={haushaltseinkommen}
                  onChange={e=>setHaushaltseinkommen(+e.target.value||0)}
                  disabled={gebaeude==="zfh"&&selbstWE===0}
                  placeholder="Zu versteuerndes Haushaltseinkommen €"
                  style={{ ...INP, marginBottom:8, opacity:(gebaeude==="zfh"&&selbstWE===0)?0.4:1 }} />
                <CheckBox label="Mind. 1 Kind (< 18 J.) im Haushalt (− 10.000 € pauschal angerechnet)"
                  checked={kindImHaushalt} onChange={setKindImHaushalt} disabled={gebaeude==="zfh"&&selbstWE===0} />
                <div style={{ fontSize:11, color:T.accent, fontWeight:700, marginTop:-2, marginBottom:4 }}>
                  → {kfw.einkommenSatz} % Einkommensbonus ({kfw.einkommenSatz===40?"≤ 30.000 €":kfw.einkommenSatz===30?"30.001–40.000 €":kfw.einkommenSatz===10?"40.001–50.000 €":"> 50.000 €"} maßgeblich)
                </div>

                <div style={{ fontSize:10, color:T.textFaint, lineHeight:1.7, marginTop:8 }}>
                  Seit 21.07.2026 entfallen: Effizienzbonus (5 %) und Emissionsminderungszuschlag (2.500 €) ersatzlos.
                  Förderdeckel je Wohneinheit jetzt {KFW_CAP} % (vorher 70 %).
                </div>
              </div>
              )}

              <div style={C_S}>
                <div style={SEC}>Investitionskosten</div>
                <Slider label="Gesamtkosten Wärmepumpe (brutto)" value={investition} onChange={setInvestition} min={8000} max={60000} step={500} unit=" €" />
              </div>
            </div>

            {/* RECHTS Förderrechner */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {foerderVariante==="kfw" && (<>
              <div style={{ ...C_S, background:T.cardAlt, border:`1px solid ${T.accent}30` }}>
                <div style={SEC}>Ihr KfW-Förderanspruch</div>
                <div style={{ marginBottom:16 }}>
                  {gebaeude==="zfh" ? (<>
                    <Row label="Investition gesamt" value={fmt(investition)} />
                    <div style={{ fontSize:10, color:T.textFaint, marginBottom:6, marginTop:-2, paddingLeft:2 }}>
                      Aufteilung: {fmt(kfw.anteilProWE)} je Wohneinheit ({anzahlWE} WE, gleichmäßig)
                    </div>
                    <Row label={`Förderfähig WE 1 (Anteil, max. ${fmt(KFW_WE1)})`} value={fmt(kfw.basisWE1)} color={T.textMuted} />
                    <Row label={`Förderfähig WE 2 (Anteil, max. ${fmt(KFW_WE2_6)})`} value={fmt(kfw.basisWE2)} color={T.textMuted} />
                    {anzahlWE > 2 && <Row label={`Förderfähig WE 3–${Math.min(anzahlWE,6)}: je ${fmt(KFW_WE2_6)} / ab WE7: je ${fmt(KFW_WE7PLUS)}`} value={fmt(kfw.basisWeitereWE)} color={T.textMuted} />}
                    {kfw.rest>0 && <Row label="Über KfW-Deckel (0% Förderung)" value={fmt(kfw.rest)} color={isDark?"rgba(255,160,80,0.85)":"#c05010"} />}
                    <div style={{ height:1, background:T.divider, margin:"8px 0" }} />
                    <Row label={`Zuschuss WE 1 — ${selbstWE>=1?"selbst genutzt":"vermietet"} (${kfw.we1.satz}%)`}
                      value={fmt(kfw.we1.zuschuss)} color={T.accent} bold />
                    <div style={{ fontSize:10, color:T.textFaint, marginBottom:8, marginTop:-2, paddingLeft:2 }}>
                      30% Grund{kfw.we1.klima>0?` + ${kfw.we1.klima}% Klima`:""}{kfw.we1.eink>0?` + ${kfw.we1.eink}% Einkommen`:""}{kfw.we1.grund+kfw.we1.klima+kfw.we1.eink>KFW_CAP?` (auf ${KFW_CAP}% gedeckelt)`:""}
                    </div>
                    {kfw.we2 && <><Row label={`Zuschuss WE 2 — ${selbstWE>=2?"selbst genutzt":"vermietet"} (${kfw.we2.satz}%)`}
                      value={fmt(kfw.we2.zuschuss)} color={T.accent} bold />
                    <div style={{ fontSize:10, color:T.textFaint, marginBottom:8, marginTop:-2, paddingLeft:2 }}>
                      30% Grund{kfw.we2.klima>0?` + ${kfw.we2.klima}% Klima`:""}{kfw.we2.eink>0?` + ${kfw.we2.eink}% Einkommen`:" · kein Einkommensbonus"}
                    </div></>}
                    {anzahlWE > 2 && kfw.zuschussWeitereWE > 0 && <Row label={`Zuschuss WE 3–${anzahlWE} (vermietet, je 30%)`} value={fmt(kfw.zuschussWeitereWE)} color={T.accent} bold />}
                  </>) : (<>
                    <Row label="Investition gesamt" value={fmt(investition)} />
                    <Row label={`Förderfähig (max. ${fmt(KFW_WE1)})`} value={fmt(kfw.basisWE1)} color={T.textMuted} />
                    {kfw.rest>0 && <Row label="Über KfW-Deckel (0% Förderung)" value={fmt(kfw.rest)} color={isDark?"rgba(255,160,80,0.85)":"#c05010"} />}
                    <div style={{ height:1, background:T.divider, margin:"8px 0" }} />
                    <Row label={`KfW-Zuschuss (${kfw.we1.satz}%)`} value={fmt(kfw.we1.zuschuss)} color={T.accent} bold />
                  </>)}
                </div>
                <div style={{ background:T.card, borderRadius:14, padding:"16px 20px", marginBottom:14, border:`1px solid ${T.cardBorder}` }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <div style={{ fontSize:10, color:T.textMuted, marginBottom:4 }}>KfW-Zuschuss gesamt</div>
                      <div style={{ fontSize:32, fontWeight:800, color:T.accent, letterSpacing:"-1px" }}>{fmt(kfw.zuschussGes)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:T.textMuted, marginBottom:4 }}>Ihr Eigenanteil</div>
                      <div style={{ fontSize:32, fontWeight:800, color:T.accent2, letterSpacing:"-1px" }}>{fmt(kfw.investNetto)}</div>
                    </div>
                  </div>
                </div>
                {/* Satzbalken */}
                {[[kfw.we1, gebaeude==="efh"?"Einfamilienhaus":("WE 1 (Selbstgenutzt)")], kfw.we2 ? [kfw.we2,"WE 2 (Vermietet)"] : null].filter(Boolean).map(([we,lbl])=>(
                  <div key={lbl} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:T.textSub, marginBottom:6 }}>{lbl} — {we.satz} % Fördersatz</div>
                    <div style={{ display:"flex", height:12, borderRadius:6, overflow:"hidden", marginBottom:4 }}>
                      {[{w:we.grund,c:"#3b82f6"},{w:we.klima,c:"#f59e0b"},{w:we.eink,c:"#10b981"}].map((s,i)=>s.w>0&&(
                        <div key={i} style={{ width:`${(s.w/KFW_CAP)*100}%`, background:s.c, minWidth:4 }} />
                      ))}
                      <div style={{ flex:1, background:T.divider }} />
                    </div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      {[["30% Basis","#3b82f6",we.grund>0],[`+${we.klima}% Klima`,"#f59e0b",we.klima>0],[`+${we.eink}% Eink.`,"#10b981",we.eink>0]].map(([n,c,a])=>(
                        <span key={n} style={{ fontSize:9, color:a?T.textSub:T.textFaint, display:"flex", alignItems:"center", gap:3 }}>
                          <span style={{ width:6, height:6, borderRadius:2, background:a?c:T.divider, display:"inline-block" }} />{n}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Szenarien-Grid */}
              <div style={C_S}>
                <div style={SEC}>📋 Einkommensbonus-Szenarien im Vergleich — {gebaeude==="efh"?"EFH":"ZFH"}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {EINK_SZENARIEN.map(s=>{
                    const k = berechneKfW({ gebaeude, selbstgenutztWE:selbstWE, investition, anzahlWE,
                      gasAlt, mitKlima, klimaSatz:klimaZeitraum.satz, haushaltseinkommen:s.beispiel, kindImHaushalt:false, heiztyp });
                    const isAktiv = kfw.einkommenSatz === s.satz;
                    return (
                      <div key={s.id} onClick={()=>{ setHaushaltseinkommen(s.beispiel); setKindImHaushalt(false); }}
                        style={{ padding:"14px 16px", borderRadius:14, cursor:"pointer", transition:"all 0.15s",
                          border: isAktiv?`2px solid ${T.accent}`:`1px solid ${T.cardBorder}`,
                          background: isAktiv?T.infoBoxGreen:T.rowHover }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div>
                            <span style={{ fontSize:13, fontWeight:800, color:isAktiv?T.accent:T.text }}>+{s.satz}% Einkommen</span>
                            {isAktiv && <span style={{ fontSize:9, background:`${T.accent}25`, color:T.accent,
                              borderRadius:8, padding:"2px 7px", marginLeft:6, fontWeight:700 }}>AKTIV</span>}
                          </div>
                          <span style={{ fontSize:18, fontWeight:800, color:T.accent }}>{fmt(k.zuschussGes)}</span>
                        </div>
                        <div style={{ fontSize:10, color:T.textFaint, marginBottom:8, lineHeight:1.5 }}>{s.label} zu versteuerndes Einkommen</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, fontSize:10 }}>
                          {gebaeude==="zfh" ? (<>
                            <div style={{ color:T.textMuted }}>WE1: {k.we1.satz}% → {fmt(k.we1.zuschuss)}</div>
                            <div style={{ color:T.textMuted }}>WE2: {k.we2?.satz}% → {fmt(k.we2?.zuschuss||0)}</div>
                            <div style={{ color:T.textFaint, fontStyle:"italic" }}>Effektiv: {k.effSatz}%</div>
                          </>) : (
                            <div style={{ color:T.textMuted }}>Fördersatz: <strong style={{ color:T.accent }}>{k.we1.satz}%</strong></div>
                          )}
                          <div style={{ color:T.accent2, fontWeight:700 }}>Eigenanteil: {fmt(k.investNetto)}</div>
                        </div>
                        <div style={{ display:"flex", height:5, borderRadius:3, overflow:"hidden", marginTop:8 }}>
                          {[{w:k.we1.grund,c:"#3b82f6"},{w:k.we1.klima,c:"#f59e0b"},{w:k.we1.eink,c:"#10b981"}].map((seg,i)=>seg.w>0&&(
                            <div key={i} style={{ width:`${(seg.w/KFW_CAP)*100}%`, background:seg.c, minWidth:3 }} />
                          ))}
                          <div style={{ flex:1, background:T.divider }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize:10, color:T.textFaint, marginTop:10, lineHeight:1.8 }}>
                  Klick auf eine Variante übernimmt das Beispiel-Einkommen · Klimabonus aktuell: {klimaZeitraum.satz}% ({klimaZeitraum.label})
                </div>
              </div>

              <div style={{ ...C_S, padding:"13px 20px" }}>
                <div style={{ fontSize:11, color:T.textMuted, lineHeight:1.8 }}>
                  🔔 Antragstellung: <strong>Meine KfW</strong> (kfw.de) — zwingend <strong>vor</strong> Auftragsvergabe! ·
                  KfW-Ergänzungskredit 358/359 für Eigenanteil {fmt(kfw.investNetto)} ab 0,01 % eff.
                </div>
              </div>
              </>)}

              {foerderVariante==="35c" && (<>
              <div style={{ ...C_S, background:T.cardAlt, border:`1px solid ${T.accent}30` }}>
                <div style={SEC}>Ihre Steuerermäßigung § 35c EStG</div>
                <div style={{ marginBottom:16 }}>
                  <Row label="Investition gesamt" value={fmt(investition)} />
                  <Row label={`Bemessungsgrundlage (max. ${fmt(STEUER_35C_MAX_BEMESSUNG)})`} value={fmt(steuer35c.bemessung)} color={T.textMuted} />
                  {steuer35c.gedeckelt && <Row label="Über dem Bemessungs-Deckel (0 % begünstigt)" value={fmt(investition-steuer35c.bemessung)} color={isDark?"rgba(255,160,80,0.85)":"#c05010"} />}
                  <div style={{ height:1, background:T.divider, margin:"8px 0" }} />
                  {steuer35c.jahre.map(j=>(
                    <Row key={j.jahr} label={`Steuerjahr ${j.jahr} (${j.satz} %, max. ${fmt(j.deckel)})`} value={fmt(j.betrag)} color={T.accent} bold />
                  ))}
                </div>
                <div style={{ background:T.card, borderRadius:14, padding:"16px 20px", marginBottom:14, border:`1px solid ${T.cardBorder}` }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <div style={{ fontSize:10, color:T.textMuted, marginBottom:4 }}>Steuerermäßigung gesamt (3 J.)</div>
                      <div style={{ fontSize:32, fontWeight:800, color:T.accent, letterSpacing:"-1px" }}>{fmt(steuer35c.summe)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:T.textMuted, marginBottom:4 }}>Ihr Eigenanteil (rechnerisch)</div>
                      <div style={{ fontSize:32, fontWeight:800, color:T.accent2, letterSpacing:"-1px" }}>{fmt(steuer35c.investNetto)}</div>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:T.textSub, marginBottom:6 }}>Verteilung über 3 Steuerjahre — {steuer35c.effSatz} % effektiv</div>
                <div style={{ display:"flex", height:12, borderRadius:6, overflow:"hidden", marginBottom:8 }}>
                  {steuer35c.jahre.map((j,i)=>(
                    <div key={i} style={{ width:`${(j.betrag/(steuer35c.summe||1))*100}%`, background:["#3b82f6","#f59e0b","#10b981"][i], minWidth:j.betrag>0?4:0 }} />
                  ))}
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {steuer35c.jahre.map((j,i)=>(
                    <span key={i} style={{ fontSize:9, color:T.textSub, display:"flex", alignItems:"center", gap:3 }}>
                      <span style={{ width:6, height:6, borderRadius:2, background:["#3b82f6","#f59e0b","#10b981"][i], display:"inline-block" }} />
                      Jahr {j.jahr}: {fmt(j.betrag)}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ ...C_S, padding:"13px 20px" }}>
                <div style={{ fontSize:11, color:T.textMuted, lineHeight:1.8 }}>
                  🔔 Die Steuerermäßigung mindert unmittelbar die <strong>Steuerschuld</strong> (kein Abzug von der
                  Bemessungsgrundlage) und kann diese in keinem Jahr unter 0 € senken; nicht ausgeschöpfte Beträge
                  verfallen und werden <strong>nicht</strong> auf Folgejahre übertragen. Beantragung über die
                  Steuererklärung (Anlage „Energetische Maßnahmen“) — Rechtsgrundlage: § 35c EStG i. V. m. ESanMV.
                </div>
              </div>
              </>)}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: EINSTELLUNGEN
      ══════════════════════════════════════════════════════════════════════ */}
      {tab==="einstellungen" && (
        <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 20px" }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:17, fontWeight:800, marginBottom:4, color:T.text }}>⚙️ Einstellungen</div>
            <div style={{ fontSize:12, color:T.textMuted }}>Alle Änderungen gelten sofort in Rechner & Förderrechner.</div>
          </div>

          {/* ERSCHEINUNGSBILD */}
          <div style={{ ...C_S, marginBottom:16 }}>
            <div style={SEC}>🎨 Erscheinungsbild</div>
            <div style={{ display:"flex", gap:12 }}>
              {Object.entries(THEMES).map(([key,th])=>(
                <button key={key} onClick={()=>setThemeKey(key)} style={{
                  display:"flex", alignItems:"center", gap:10, padding:"12px 20px",
                  borderRadius:12, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600,
                  border: themeKey===key?`2px solid ${T.accent}`:`1px solid ${T.cardBorder}`,
                  background: themeKey===key?T.infoBoxGreen:T.rowHover,
                  color: themeKey===key?T.accent:T.textSub, transition:"all 0.18s",
                }}>
                  <span style={{ fontSize:20 }}>{key==="dark"?"🌙":"☀️"}</span>
                  <div style={{ textAlign:"left" }}>
                    <div>{th.name}</div>
                    <div style={{ fontSize:10, color:T.textFaint, fontWeight:400 }}>
                      {key==="dark"?"Dunkler Hintergrund":"Heller Hintergrund"}
                    </div>
                  </div>
                  {themeKey===key && <span style={{ fontSize:10, color:T.accent, fontWeight:700, marginLeft:4 }}>✔ Aktiv</span>}
                </button>
              ))}
            </div>
          </div>

          {/* ENERGIEPREISE */}
          <div style={{ ...C_S, marginBottom:16 }}>
            <div style={SEC}>Aktuelle Energiepreise</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"2px 24px" }}>
              {[["gas","🔥 Erdgas","€/kWh","ca. 0,10–0,14"],["oel","🛢️ Heizöl","€/Liter","ca. 0,90–1,10"],
                ["nachtspeicher","⚡ Nachtspeicher","€/kWh","ca. 0,25–0,32"],
                ["fernwaerme","🏭 Fernwärme","€/kWh","ca. 0,12–0,18"],
                ["wp_strom","♨️ WP-Strom","€/kWh","WP-Tarif ca. 0,18–0,25"],
              ].map(([k,lbl,hint,rw])=>(
                <div key={k}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <label style={LBL}>{lbl}</label>
                    <span style={{ fontSize:10, color:T.textFaint }}>{hint}</span>
                  </div>
                  <NumberFieldFull value={preise[k]} onChange={v=>setP(k,v)} min={0} step={0.01} suffix="€" />
                  <div style={{ fontSize:10, color:T.textFaint, marginBottom:12 }}>{rw}</div>
                </div>
              ))}
            </div>
          </div>

          {/* NEBENKOSTEN — Accordion */}
          <div style={{ ...C_S, marginBottom:16 }}>
            <div style={SEC}>Nebenkosten je Heizungstyp (editierbar)</div>
            <div style={{ fontSize:11, color:T.textMuted, marginBottom:14, lineHeight:1.7 }}>
              Diese Kosten werden automatisch zu den Energiekosten addiert und erscheinen im Rechner als
              Vollkostenvergleich. Karten aufklappen zum Bearbeiten.
            </div>

            {/* WP-Nebenkosten separat oben */}
            {[
              { typ:"wp",           label:"♨️ Wärmepumpe",    farbe:"#00b890" },
              { typ:"gas",          label:"🔥 Erdgas",          farbe:"#FF6B35" },
              { typ:"oel",          label:"🛢️ Heizöl",          farbe:"#c0703a" },
              { typ:"kohle",        label:"⬛ Kohle",            farbe:"#5a5a6e" },
              { typ:"nachtspeicher",label:"⚡ Nachtspeicher",   farbe:"#d4a800" },
              { typ:"fernwaerme",   label:"🏭 Fernwärme",       farbe:"#9B59B6" },
            ].map(({ typ, label, farbe }) => {
              const isOpen = nkOpen === typ;
              const total  = nkTotal(typ);
              const felder = NK_FELDER[typ] || [];
              return (
                <div key={typ} style={{ marginBottom:10 }}>
                  {/* Header */}
                  <button onClick={()=>setNkOpen(isOpen ? null : typ)} style={{
                    width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"13px 16px", borderRadius: isOpen ? "12px 12px 0 0" : 12,
                    border:`1px solid ${isOpen?farbe+"60":T.cardBorder}`,
                    background: isOpen?(isDark?`${farbe}15`:T.infoBoxGreen):T.rowHover,
                    cursor:"pointer", fontFamily:"inherit", transition:"all 0.18s",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:15, fontWeight:700, color:farbe }}>{label}</span>
                      <span style={{ fontSize:11, color:T.textMuted }}>
                        {felder.length} {felder.length===1?"Position":"Positionen"} · {typ==="gas"||typ==="oel"||typ==="nachtspeicher"||typ==="fernwaerme"||typ==="wp" ? fmt(total)+"/Jahr" : ""}
                        {typ==="gas" && nk.gas.netzentgelt_aufschlag > 0 ? ` + ${(nk.gas.netzentgelt_aufschlag*100).toFixed(1)} ct/kWh Netzentgelt` : ""}
                      </span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:14, fontWeight:800, color:T.accent }}>{typ==="gas"||typ==="oel"||typ==="nachtspeicher"||typ==="fernwaerme"||typ==="wp" ? fmt(total) : ""}</span>
                      <span style={{ fontSize:16, color:T.textMuted, transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
                    </div>
                  </button>

                  {/* Body */}
                  {isOpen && (
                    <div style={{ border:`1px solid ${farbe}60`, borderTop:"none", borderRadius:"0 0 12px 12px",
                      padding:"16px 20px", background:T.card }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 24px" }}>
                        {felder.map(([feld, feldLabel, einheit])=>(
                          <div key={feld}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                              <label style={{ fontSize:12, color:T.textSub, fontWeight:500 }}>{feldLabel}</label>
                              <span style={{ fontSize:10, color:T.textFaint }}>{einheit}</span>
                            </div>
                            <NumberFieldFull value={nk[typ][feld]}
                              onChange={v=>setNkVal(typ, feld, v)}
                              min={0} step={feld==="netzentgelt_aufschlag"?0.001:1}
                              suffix={einheit.replace("€/","").replace("/Jahr","").replace("J.","€")==="€"?"€":einheit}
                              suffixWidth={36} />
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>{
                        const def = NK_DEFAULT[typ];
                        setNk(n=>({ ...n, [typ]:{ ...def } }));
                      }} style={{ fontSize:11, color:T.textMuted, background:"none", border:`1px solid ${T.cardBorder}`,
                        borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>
                        ↺ Standardwerte für {label}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PREISSTEIGERUNG */}
          <div style={{ ...C_S, marginBottom:16 }}>
            <div style={SEC}>Jährliche Preissteigerung (%/Jahr)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"2px 24px" }}>
              {[["gas","🔥 Gas"],["oel","🛢️ Heizöl"],["nachtspeicher","⚡ Nachtspeicher"],["fernwaerme","🏭 Fernwärme"],["wp_strom","♨️ WP-Strom"]].map(([k,lbl])=>(
                <div key={k}>
                  <label style={{ ...LBL, display:"block", marginBottom:5 }}>{lbl}</label>
                  <NumberFieldFull value={steigerung[k]} onChange={v=>setS(k,v)} min={0} max={20} step={0.5} suffix="%" />
                  <div style={{ marginBottom:14 }} />
                </div>
              ))}
            </div>
          </div>

          {/* CO₂ */}
          <div style={{ ...C_S, marginBottom:20 }}>
            <div style={SEC}>CO₂-Preisprognose</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px 24px" }}>
              {[[co2Start,setCo2Start,"CO₂-Preis aktuell (€/t)","2025: 55 €/t (gesetzlich)"],
                [co2Ziel, setCo2Ziel, "CO₂-Preis 2030 (€/t, Prognose)","Prognose: 100–200 €/t"]
              ].map(([val,setter,lbl,hint],i)=>(
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <label style={LBL}>{lbl}</label>
                    <span style={{ fontSize:10, color:T.textFaint }}>{hint}</span>
                  </div>
                  <NumberFieldFull value={val} onChange={v=>setter(v)} min={0} max={500} step={5} suffix="€/t" suffixWidth={38} />
                  <div style={{ marginBottom:14 }} />
                </div>
              ))}
            </div>
          </div>

          {/* RESET */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <button onClick={()=>{
              setPreise({ gas:0.12, oel:1.00, nachtspeicher:0.28, fernwaerme:0.14, wp_strom:0.22 });
              setSteigerung({ gas:5, oel:4, nachtspeicher:2, fernwaerme:3, wp_strom:1 });
              setNk(NK_DEFAULT);
              setCo2Start(55); setCo2Ziel(150);
            }} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${T.resetBorder}`,
              background:T.resetBg, color:T.resetTxt,
              cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit" }}>
              ↺ Alle Standardwerte wiederherstellen
            </button>
            <span style={{ fontSize:10, color:T.textFaint }}>BDEW 2025 · KfW · Polarstern · Fraunhofer ISE</span>
          </div>
        </div>
      )}
    </div>
  );
}
