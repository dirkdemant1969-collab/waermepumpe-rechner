// ═════════════════════════════════════════════════════════════════════════════
// GEMEINSAMES THEME FÜR DIE SPIELE-APP "HAFEN-MIX"
// ═════════════════════════════════════════════════════════════════════════════
export const G = {
  bg: "linear-gradient(160deg,#0b2a4a 0%,#0e3a5f 45%,#0a2c4e 100%)",
  panel: "rgba(255,255,255,0.06)",
  panelBorder: "rgba(255,255,255,0.12)",
  panelSolid: "#0f2f4f",
  card: "#123a60",
  cardAlt: "#0d3354",
  text: "#eaf4ff",
  textSub: "rgba(230,244,255,0.7)",
  textMuted: "rgba(230,244,255,0.45)",
  accent: "#ffd166",
  accent2: "#06d6a0",
  accent3: "#ef476f",
  blue: "#118ab2",
  radius: 16,
  shadow: "0 8px 24px rgba(0,0,0,0.25)",
  font: "'Segoe UI',system-ui,sans-serif",
};

export const btnStyle = (active, color = G.accent2) => ({
  border: "none",
  borderRadius: 12,
  padding: "10px 16px",
  fontFamily: G.font,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  color: active ? "#06243e" : G.text,
  background: active ? color : "rgba(255,255,255,0.08)",
  boxShadow: active ? `0 0 14px ${color}66` : "none",
  transition: "all 0.15s",
});

export const panelStyle = {
  background: G.panel,
  border: `1px solid ${G.panelBorder}`,
  borderRadius: G.radius,
  boxShadow: G.shadow,
};
