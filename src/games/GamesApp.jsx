import { useState } from "react";
import { Link } from "react-router-dom";
import "./games.css";
import { useProgress, msUntilNextEnergy, MAX_ENERGY } from "./useProgress";
import { HARBOR_STAGES, harborStage, getLevel } from "./gameData";
import { G, btnStyle, panelStyle } from "./theme";
import Match3 from "./Match3";
import BlockPuzzle from "./BlockPuzzle";
import Solitaire from "./Solitaire";

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GamesApp() {
  const [progress, setProgress] = useProgress();
  const [view, setView] = useState("hub"); // hub | match3 | blocks | solitaire

  const stageIdx = harborStage(progress.stars);
  const stage = HARBOR_STAGES[stageIdx];
  const nextStage = HARBOR_STAGES[stageIdx + 1];
  const stagePct = nextStage
    ? Math.round(((progress.stars - stage.stars) / (nextStage.stars - stage.stars)) * 100)
    : 100;
  const level = getLevel(progress.match3Level);
  const regenMs = msUntilNextEnergy(progress);

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: G.font, color: G.text, padding: "20px 16px 60px" }}>
      {/* HEADER */}
      <div style={{ maxWidth: 580, margin: "0 auto 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#06d6a0,#118ab2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            🏝️
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>Hafen-Mix</div>
            <div style={{ fontSize: 11, color: G.textMuted }}>Match-3 · Block-Puzzle · Solitaire</div>
          </div>
        </div>
        <Link to="/" style={{ ...btnStyle(false), textDecoration: "none", display: "inline-block" }}>
          ♨️ Zum Wärmepumpen-Rechner
        </Link>
      </div>

      {view === "hub" && (
        <div style={{ maxWidth: 580, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* HAFEN-VISUAL */}
          <div style={{ ...panelStyle, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 64, lineHeight: 1 }}>{stage.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginTop: 6 }}>{stage.label}</div>
            <div style={{ fontSize: 12, color: G.textMuted, marginTop: 2 }}>
              {nextStage ? `${progress.stars} / ${nextStage.stars} ⭐ bis "${nextStage.label}"` : "Maximaler Ausbau erreicht! 🎉"}
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stagePct}%`, background: G.accent, transition: "width 0.3s" }} />
            </div>
          </div>

          {/* WÄHRUNGEN */}
          <div style={{ ...panelStyle, padding: 16, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, fontSize: 13 }}>
            <Stat label="Münzen" value={`💰 ${progress.coins}`} />
            <Stat label="Sterne" value={`⭐ ${progress.stars}`} />
            <Stat
              label="Energie"
              value={`❤️ ${progress.energy}/${progress.maxEnergy}`}
              sub={progress.energy < progress.maxEnergy ? `+1 in ${formatTime(regenMs)}` : "voll"}
            />
            <Stat label="Booster" value={`💣 ${progress.bombs} · 🔀 ${progress.shufflers}`} />
          </div>

          {/* SPIELE */}
          <GameCard
            icon="🌊"
            title="Hafen-Match"
            desc={`Match-3 wie Gossip Harbor. Level ${level.number}: Sammle ${level.targetCount}× ${level.target.icon}.`}
            cost={`Kostet 1 ❤️ (${progress.energy} verfügbar)`}
            disabled={progress.energy <= 0}
            onClick={() => setView("match3")}
          />
          <GameCard
            icon="🧱"
            title="Block-Hafen"
            desc="Block-Puzzle wie Blockmaster / Block Blast. Räume Linien für Energie & Mischer!"
            cost="Kostenlos spielbar"
            onClick={() => setView("blocks")}
          />
          <GameCard
            icon="🃏"
            title="Hafen-Solitaire"
            desc="Klassisches Solitaire. Ein Sieg füllt deine Energie auf und schenkt dir eine Bombe!"
            cost="Kostenlos spielbar"
            onClick={() => setView("solitaire")}
          />

          <div style={{ ...panelStyle, padding: 14, fontSize: 12, color: G.textMuted, lineHeight: 1.6 }}>
            <b style={{ color: G.textSub }}>So hängt alles zusammen:</b><br />
            🌊 Hafen-Match ist dein Hauptspiel – jedes Level kostet 1 ❤️ Energie und bringt 💰 & ⭐ für den Hafen-Ausbau.<br />
            🃏 Solitaire-Siege füllen deine ❤️ Energie komplett auf und schenken dir 💣 Bomben.<br />
            🧱 Block-Hafen-Linien schenken dir zusätzliche ❤️ Energie und 🔀 Mischer für Hafen-Match.
          </div>
        </div>
      )}

      {view === "match3" && <Match3 progress={progress} setProgress={setProgress} onExit={() => setView("hub")} />}
      {view === "blocks" && <BlockPuzzle progress={progress} setProgress={setProgress} onExit={() => setView("hub")} />}
      {view === "solitaire" && <Solitaire progress={progress} setProgress={setProgress} onExit={() => setView("hub")} />}
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: G.textMuted }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: G.textMuted }}>{sub}</div>}
    </div>
  );
}

function GameCard({ icon, title, desc, cost, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...panelStyle,
        padding: 16,
        display: "flex",
        gap: 14,
        alignItems: "center",
        textAlign: "left",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: G.font,
        color: G.text,
        border: `1px solid ${G.panelBorder}`,
        width: "100%",
      }}
    >
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: G.textSub, marginTop: 2 }}>{desc}</div>
        <div style={{ fontSize: 11, color: G.accent, marginTop: 4 }}>{cost}</div>
      </div>
      <div style={{ fontSize: 20, color: G.textMuted }}>▶</div>
    </button>
  );
}
