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

// KfW 458 – Förderbasis-Staffelung (Stand 2025, offiziell):
// WE 1: 30.000 € · WE 2–6: je 15.000 € · WE 7+: je 8.000 €
const WP_CO2_KWH   = 0.380;
const KFW_WE1      = 30000;
const KFW_WE2_6    = 15000;
const KFW_WE7PLUS  = 8000;

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

// KfW 458 – Fördersatz einer einzelnen Wohneinheit
//  • Grundförderung 30 %  → ALLE Wohneinheiten (auch vermietete)
//  • Effizienzbonus 5 %   → ALLE WE (bei WP mit natürl. Kältemittel/Erdreich/Wasser/Abwasser)
//  • Klimabonus 20 %      → NUR selbstgenutzte WE (pro WE max. einmal)
//  • Einkommensbonus 30 % → NUR selbstgenutzte HAUPTwohneinheit (genau EINE WE, Einkommen ≤ 40.000 €)
//  • Deckel: max. 70 % je Wohneinheit
function calcWE({ basis, gasAlt, selbstgenutzt, istHauptwohnung, mitKlima, mitEinkommen, mitEffizienz, heiztyp }) {
  const klimaBerechtigt = selbstgenutzt && HEIZUNGEN[heiztyp]?.klimaFaehig && mitKlima && (heiztyp !== "gas" || gasAlt);
  const grund = 30;
  const klima = klimaBerechtigt ? 20 : 0;
  // Einkommensbonus ausschließlich für die selbstgenutzte Hauptwohneinheit (Merkblatt 12/2025)
  const eink  = (istHauptwohnung && mitEinkommen) ? 30 : 0;
  const effi  = mitEffizienz ? 5 : 0;
  const satz  = Math.min(grund + klima + eink + effi, 70);
  return { basis, grund, klima, eink, effi, satz, zuschuss: basis * satz / 100, klimaBerechtigt, istHauptwohnung };
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
// Methode laut KfW (WEG-/MFH-Beispiel):
//  1. Investitionskosten werden ANTEILIG auf die Wohneinheiten verteilt
//     (Standard: gleichmäßig je WE; alternativ nach Miteigentumsanteil).
//  2. Jeder WE-Anteil wird auf ihren KfW-Höchstbetrag gedeckelt
//     (WE1: 30.000 €, WE2–6: 15.000 €, WE7+: 8.000 €).
//  3. Auf jeden gedeckelten Anteil wird der für DIESE WE gültige Satz gerechnet:
//       • vermietet:      30 % Grund (+5 % Effizienz)  → max. 35 %
//       • selbstgenutzt:  30 % + 20 % Klima + 30 % Eink. + 5 % Effizienz → max. 70 %
//       • Einkommensbonus nur für die EINE selbstgenutzte Hauptwohneinheit
// ─────────────────────────────────────────────────────────────────────────────
function berechneKfW({ gebaeude, selbstgenutztWE, investition, anzahlWE,
                       gasAlt, mitKlima, mitEinkommen, mitEffizienz, heiztyp,
                       mitEmissionsZuschlag }) {
  const weAnzahl = gebaeude === "efh" ? 1 : (anzahlWE || 2);

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
                        mitKlima, mitEinkommen, mitEffizienz, heiztyp });
    we.nummer = i;
    we.selbst = selbst;
    weListe.push(we);
    zuschussGes += we.zuschuss;
  }

  // Emissionsminderungszuschlag: pauschal 2.500 €, unabhängig vom Förderdeckel (nur Biomasse)
  const emissionsZuschlag = mitEmissionsZuschlag ? 2500 : 0;
  zuschussGes += emissionsZuschlag;

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
           emissionsZuschlag, zuschussWeitereWE };
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
  const [mitEinkommen, setMitEinkommen] = useState(false);
  const [mitEffizienz,       setMitEffizienz]       = useState(true);
  const [anzahlWE,           setAnzahlWE]           = useState(2);    // bei ZFH/MFH
  const [mitEmissionsZuschlag, setMitEmissionsZuschlag] = useState(false); // nur Biomasse

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

  const kfw = useMemo(() => berechneKfW({
    gebaeude, selbstgenutztWE:selbstWE, investition, anzahlWE,
    gasAlt, mitKlima, mitEinkommen, mitEffizienz, heiztyp, mitEmissionsZuschlag,
  }), [gebaeude, selbstWE, investition, anzahlWE, gasAlt, mitKlima, mitEinkommen, mitEffizienz, heiztyp, mitEmissionsZuschlag]);

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

  const Slider = ({ label, value, onChange, min, max, step, unit, color }) => {
    const c = color || T.accent;
    return (
      <div style={{ marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={LBL}>{label}</span>
          <span style={{ fontSize:14, fontWeight:700, color:c }}>{fmtN(value)}{unit}</span>
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
    ? `+20 % Klimabonus (Gas ${gasAlt?"≥ 20 J. ✔":"< 20 J. ✗"})`
    : `+20 % Klimabonus (${HEIZUNGEN[heiztyp]?.label} ✔)`;

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
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12,
            background:"linear-gradient(135deg,#00e5a0,#00b4ff)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:21,
            boxShadow:"0 0 18px rgba(0,229,160,0.35)" }}>♨️</div>
          <div>
            <div style={{ fontSize:19, fontWeight:800, background:"linear-gradient(90deg,#00b890,#0090d0)",
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
            <div style={{ fontSize:17, fontWeight:800, marginBottom:3, color:T.text }}>🏦 KfW 458 — Förderrechner & Szenarien</div>
            <div style={{ fontSize:12, color:T.textMuted }}>Alle Einstellungen mit dem Rechner-Tab verknüpft · BEG-EM-Richtlinien Stand 2025</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:20, alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

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
                      WE 1: 30.000 € · WE 2–6: je 15.000 € · ab WE 7: je 8.000 € Förderbasis
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, fontWeight:600 }}>Nutzung durch den Eigentümer:</div>
                    {[
                      [0,"Nur vermietet","Keine selbstgenutzte WE — nur Grundförderung + Effizienzbonus (35 %) für alle Einheiten"],
                      [1,"Eine WE selbst bewohnt","WE 1 = Hauptwohnsitz (alle Boni möglich), übrige WE vermietet (35 %)"],
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
                      ⚖️ <strong>Wichtig (KfW-Merkblatt 12/2025):</strong> Die Investitionskosten werden
                      <strong> anteilig auf die Wohneinheiten</strong> verteilt; je WE wird auf den eigenen
                      Höchstbetrag gedeckelt (WE 1: 30.000 €, WE 2–6: je 15.000 €). Der <strong>Einkommensbonus</strong> gilt
                      nur für die <strong>eine selbstgenutzte Hauptwohneinheit</strong>, der <strong>Klimabonus</strong>
                      für jede selbstgenutzte WE. Vermietete WE erhalten nur Grundförderung + Effizienzbonus (max. 35 %).
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

              <div style={C_S}>
                <div style={SEC}>Förderbausteine KfW 458</div>
                <CheckBox label="✅ Grundförderung 30 % (immer enthalten)" checked={true} onChange={()=>{}} disabled />
                <CheckBox label={klimaLabel} checked={mitKlima} onChange={setMitKlima}
                  disabled={!HEIZUNGEN[heiztyp]?.klimaFaehig||(gebaeude==="zfh"&&selbstWE===0)} />
                <CheckBox label="+ 30 % Einkommensbonus (Haushaltseinkommen ≤ 40.000 €, nur Selbstnutzer)"
                  checked={mitEinkommen} onChange={setMitEinkommen} disabled={gebaeude==="zfh"&&selbstWE===0} />
                <CheckBox label="+ 5 % Effizienzbonus (Luft/WP mit natürl. Kältemittel oder Erdwärme)"
                  checked={mitEffizienz} onChange={setMitEffizienz} />
                <div style={{ height:1, background:T.divider, margin:"8px 0" }} />
                <CheckBox label="+ 2.500 € Emissionsminderungszuschlag (nur Biomasse-Anlagen mit Feinstaubgrenzwert ≤ 2,5 mg/m³, pauschal, außerhalb Deckel)"
                  checked={mitEmissionsZuschlag} onChange={setMitEmissionsZuschlag} />
              </div>

              <div style={C_S}>
                <div style={SEC}>Investitionskosten</div>
                <Slider label="Gesamtkosten Wärmepumpe (brutto)" value={investition} onChange={setInvestition} min={8000} max={60000} step={500} unit=" €" />
              </div>
            </div>

            {/* RECHTS Förderrechner */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
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
                      30% Grund{kfw.we1.klima>0?" + 20% Klima":""}{kfw.we1.eink>0?" + 30% Einkommen":""}{kfw.we1.effi>0?" + 5% Effizienz":""}{kfw.we1.grund+kfw.we1.klima+kfw.we1.eink+kfw.we1.effi>70?" (auf 70% gedeckelt)":""}
                    </div>
                    {kfw.we2 && <><Row label={`Zuschuss WE 2 — ${selbstWE>=2?"selbst genutzt":"vermietet"} (${kfw.we2.satz}%)`}
                      value={fmt(kfw.we2.zuschuss)} color={T.accent} bold />
                    <div style={{ fontSize:10, color:T.textFaint, marginBottom:8, marginTop:-2, paddingLeft:2 }}>
                      30% Grund{kfw.we2.klima>0?" + 20% Klima":""}{kfw.we2.eink>0?" + 30% Einkommen":" · kein Einkommensbonus"}{kfw.we2.effi>0?" + 5% Effizienz":""}
                    </div></>}
                    {anzahlWE > 2 && kfw.zuschussWeitereWE > 0 && <Row label={`Zuschuss WE 3–${anzahlWE} (vermietet, je 35%)`} value={fmt(kfw.zuschussWeitereWE)} color={T.accent} bold />}
                    {kfw.emissionsZuschlag > 0 && <Row label="Emissionsminderungszuschlag (pauschal)" value={fmt(kfw.emissionsZuschlag)} color="#10b981" bold />}
                  </>) : (<>
                    <Row label="Investition gesamt" value={fmt(investition)} />
                    <Row label={`Förderfähig (max. ${fmt(KFW_WE1)})`} value={fmt(kfw.basisWE1)} color={T.textMuted} />
                    {kfw.rest>0 && <Row label="Über KfW-Deckel (0% Förderung)" value={fmt(kfw.rest)} color={isDark?"rgba(255,160,80,0.85)":"#c05010"} />}
                    <div style={{ height:1, background:T.divider, margin:"8px 0" }} />
                    <Row label={`KfW-Zuschuss (${kfw.we1.satz}%)`} value={fmt(kfw.we1.zuschuss)} color={T.accent} bold />
                    {kfw.emissionsZuschlag > 0 && <Row label="Emissionsminderungszuschlag (pauschal)" value={fmt(kfw.emissionsZuschlag)} color="#10b981" bold />}
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
                      {[{w:we.grund,c:"#3b82f6"},{w:we.klima,c:"#f59e0b"},{w:we.eink,c:"#10b981"},{w:we.effi,c:"#8b5cf6"}].map((s,i)=>s.w>0&&(
                        <div key={i} style={{ width:`${(s.w/70)*100}%`, background:s.c, minWidth:4 }} />
                      ))}
                      <div style={{ flex:1, background:T.divider }} />
                    </div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      {[["30% Basis","#3b82f6",we.grund>0],[`+${we.klima}% Klima`,"#f59e0b",we.klima>0],[`+${we.eink}% Eink.`,"#10b981",we.eink>0],[`+${we.effi}% Effi.`,"#8b5cf6",we.effi>0]].map(([n,c,a])=>(
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
                <div style={SEC}>📋 Alle Szenarien im Vergleich — {gebaeude==="efh"?"EFH":"ZFH"}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[{id:"A",gasAlt:true,mitE:false},{id:"B",gasAlt:true,mitE:true},{id:"C",gasAlt:false,mitE:false},{id:"D",gasAlt:false,mitE:true}].map(s=>{
                    const k = berechneKfW({ gebaeude, selbstgenutztWE:selbstWE, investition, anzahlWE,
                      gasAlt:s.gasAlt, mitKlima:true, mitEinkommen:s.mitE, mitEffizienz, heiztyp, mitEmissionsZuschlag });
                    const isAktiv = gasAlt===s.gasAlt && mitEinkommen===s.mitE;
                    const desc = heiztyp==="gas"
                      ? `Gas ${s.gasAlt?"≥":"<"} 20 J. · ${s.mitE?"mit":"kein"} Einkommensbonus`
                      : `${s.gasAlt?"Klimabonus":"Kein Klimabonus"} · ${s.mitE?"mit":"kein"} Einkommensbonus`;
                    return (
                      <div key={s.id} onClick={()=>{ setGasAlt(s.gasAlt); setMitEinkommen(s.mitE); }}
                        style={{ padding:"14px 16px", borderRadius:14, cursor:"pointer", transition:"all 0.15s",
                          border: isAktiv?`2px solid ${T.accent}`:`1px solid ${T.cardBorder}`,
                          background: isAktiv?T.infoBoxGreen:T.rowHover }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div>
                            <span style={{ fontSize:13, fontWeight:800, color:isAktiv?T.accent:T.text }}>Var. {s.id}</span>
                            {isAktiv && <span style={{ fontSize:9, background:`${T.accent}25`, color:T.accent,
                              borderRadius:8, padding:"2px 7px", marginLeft:6, fontWeight:700 }}>AKTIV</span>}
                          </div>
                          <span style={{ fontSize:18, fontWeight:800, color:T.accent }}>{fmt(k.zuschussGes)}</span>
                        </div>
                        <div style={{ fontSize:10, color:T.textFaint, marginBottom:8, lineHeight:1.5 }}>{desc}</div>
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
                          {[{w:k.we1.grund,c:"#3b82f6"},{w:k.we1.klima,c:"#f59e0b"},{w:k.we1.eink,c:"#10b981"},{w:k.we1.effi,c:"#8b5cf6"}].map((seg,i)=>seg.w>0&&(
                            <div key={i} style={{ width:`${(seg.w/70)*100}%`, background:seg.c, minWidth:3 }} />
                          ))}
                          <div style={{ flex:1, background:T.divider }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize:10, color:T.textFaint, marginTop:10, lineHeight:1.8 }}>
                  Klick auf eine Variante übernimmt die Einstellungen · Effizienzbonus: {mitEffizienz?"aktiv +5%":"inaktiv"}
                </div>
              </div>

              <div style={{ ...C_S, padding:"13px 20px" }}>
                <div style={{ fontSize:11, color:T.textMuted, lineHeight:1.8 }}>
                  🔔 Antragstellung: <strong>Meine KfW</strong> (kfw.de) — zwingend <strong>vor</strong> Auftragsvergabe! ·
                  KfW-Ergänzungskredit 358/359 für Eigenanteil {fmt(kfw.investNetto)} ab 0,01 % eff.
                </div>
              </div>
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
                  <div style={{ position:"relative" }}>
                    <input type="number" step="0.01" min="0" value={preise[k]}
                      onChange={e=>setP(k, parseFloat(e.target.value)||0)}
                      style={{ ...INP, paddingRight:28, marginBottom:4, fontWeight:700, fontSize:15 }} />
                    <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-60%)",
                      fontSize:11, color:T.textFaint }}>€</span>
                  </div>
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
                            <div style={{ position:"relative" }}>
                              <input type="number" step={feld==="netzentgelt_aufschlag"?"0.001":"1"} min="0"
                                value={nk[typ][feld]}
                                onChange={e=>setNkVal(typ, feld, e.target.value)}
                                style={{ ...INP, paddingRight:36, marginBottom:14, fontWeight:700, fontSize:15 }} />
                              <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-60%)",
                                fontSize:10, color:T.textFaint }}>
                                {einheit.replace("€/","").replace("/Jahr","").replace("J.","€")==="€"?"€":einheit}
                              </span>
                            </div>
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
                  <div style={{ position:"relative" }}>
                    <input type="number" step="0.5" min="0" max="20" value={steigerung[k]}
                      onChange={e=>setS(k, parseFloat(e.target.value)||0)}
                      style={{ ...INP, paddingRight:28, marginBottom:14, fontWeight:700, fontSize:15 }} />
                    <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-60%)",
                      fontSize:11, color:T.textFaint }}>%</span>
                  </div>
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
                  <div style={{ position:"relative" }}>
                    <input type="number" step="5" min="0" max="500" value={val}
                      onChange={e=>setter(parseFloat(e.target.value)||0)}
                      style={{ ...INP, paddingRight:38, marginBottom:14, fontWeight:700, fontSize:15 }} />
                    <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-60%)",
                      fontSize:11, color:T.textFaint }}>€/t</span>
                  </div>
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
