import { useRef, useState } from "react";
import { TILE_TYPES, BOARD_SIZE, randomTileId, getLevel } from "./gameData";
import { G, btnStyle, panelStyle } from "./theme";
import { MAX_ENERGY } from "./useProgress";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ── Spielfeld-Hilfsfunktionen ────────────────────────────────────────────────
function findMatches(board) {
  const matched = new Set();
  for (let r = 0; r < BOARD_SIZE; r++) {
    let runStart = 0;
    for (let c = 1; c <= BOARD_SIZE; c++) {
      if (c < BOARD_SIZE && board[r][c] === board[r][runStart]) continue;
      if (c - runStart >= 3) for (let k = runStart; k < c; k++) matched.add(`${r},${k}`);
      runStart = c;
    }
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    let runStart = 0;
    for (let r = 1; r <= BOARD_SIZE; r++) {
      if (r < BOARD_SIZE && board[r][c] === board[runStart][c]) continue;
      if (r - runStart >= 3) for (let k = runStart; k < r; k++) matched.add(`${k},${c}`);
      runStart = r;
    }
  }
  return [...matched].map((s) => s.split(",").map(Number));
}

function wouldMatch(board, r1, c1, r2, c2) {
  const clone = board.map((row) => [...row]);
  [clone[r1][c1], clone[r2][c2]] = [clone[r2][c2], clone[r1][c1]];
  return findMatches(clone).length > 0;
}

function hasPossibleMove(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (c + 1 < BOARD_SIZE && wouldMatch(board, r, c, r, c + 1)) return true;
      if (r + 1 < BOARD_SIZE && wouldMatch(board, r, c, r + 1, c)) return true;
    }
  }
  return false;
}

function createBoard() {
  let board;
  let tries = 0;
  do {
    board = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, randomTileId)
    );
    tries++;
  } while ((findMatches(board).length > 0 || !hasPossibleMove(board)) && tries < 200);
  return board;
}

function collapseBoard(board) {
  for (let c = 0; c < BOARD_SIZE; c++) {
    const col = [];
    for (let r = 0; r < BOARD_SIZE; r++) if (board[r][c] !== null) col.push(board[r][c]);
    while (col.length < BOARD_SIZE) col.unshift(randomTileId());
    for (let r = 0; r < BOARD_SIZE; r++) board[r][c] = col[r];
  }
}

export default function Match3({ progress, setProgress, onExit }) {
  const level = getLevel(progress.match3Level);

  const boardRef = useRef(null);
  const [board, setBoardState] = useState(null);
  const [selected, setSelected] = useState(null);
  const [flashing, setFlashing] = useState(new Set());
  const [shake, setShake] = useState(null);
  const [busy, setBusy] = useState(false);
  const [movesLeft, setMovesLeft] = useState(level.moves);
  const [collected, setCollected] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("start"); // start | playing | won | lost
  const [bombMode, setBombMode] = useState(false);
  const [info, setInfo] = useState("");

  const setBoard = (b) => {
    boardRef.current = b;
    setBoardState(b.map((row) => [...row]));
  };

  function startLevel() {
    if (progress.energy <= 0) return;
    setProgress((p) => ({
      ...p,
      energy: p.energy - 1,
      lastEnergyTs: p.energy >= p.maxEnergy ? Date.now() : p.lastEnergyTs,
    }));
    setBoard(createBoard());
    setMovesLeft(level.moves);
    setCollected(0);
    setScore(0);
    setSelected(null);
    setBombMode(false);
    setInfo("");
    setPhase("playing");
  }

  // ── Kaskaden-Auflösung ──────────────────────────────────────────────────────
  async function clearAndCollapse(boardArr, cells) {
    const counts = {};
    let scoreGain = 0;
    setFlashing(new Set(cells.map(([r, c]) => `${r},${c}`)));
    await delay(180);
    for (const [r, c] of cells) {
      const t = boardArr[r][c];
      if (t === null) continue;
      counts[t] = (counts[t] || 0) + 1;
      scoreGain += 10;
      boardArr[r][c] = null;
    }
    collapseBoard(boardArr);
    setFlashing(new Set());
    setBoard(boardArr);
    await delay(180);
    return { counts, scoreGain };
  }

  async function resolveLoop(boardArr) {
    const totalCounts = {};
    let totalScore = 0;
    while (true) {
      const matches = findMatches(boardArr);
      if (matches.length === 0) break;
      const { counts, scoreGain } = await clearAndCollapse(boardArr, matches);
      for (const [k, v] of Object.entries(counts)) totalCounts[k] = (totalCounts[k] || 0) + v;
      totalScore += scoreGain;
    }
    return { totalCounts, totalScore };
  }

  function finishMove(totalCounts, totalScore, movesAfter) {
    const gained = totalCounts[level.target.id] || 0;
    setScore((s) => s + totalScore);
    setCollected((c) => {
      const newCollected = c + gained;
      const won = newCollected >= level.targetCount;
      if (won) {
        const stars = movesAfter >= level.moves * 0.4 ? 3 : movesAfter > 0 ? 2 : 1;
        const coinReward = 20 + level.number * 3;
        setProgress((p) => ({
          ...p,
          coins: p.coins + coinReward,
          stars: p.stars + stars,
          match3Level: p.match3Level + 1,
        }));
        setPhase("won");
      } else if (movesAfter <= 0) {
        setPhase("lost");
      }
      return newCollected;
    });
  }

  async function handleSwap(r1, c1, r2, c2) {
    const boardArr = boardRef.current.map((row) => [...row]);
    [boardArr[r1][c1], boardArr[r2][c2]] = [boardArr[r2][c2], boardArr[r1][c1]];

    if (findMatches(boardArr).length === 0) {
      setShake(`${r1},${c1}|${r2},${c2}`);
      await delay(260);
      setShake(null);
      setSelected(null);
      return;
    }

    setBusy(true);
    setSelected(null);
    setBoard(boardArr);
    await delay(120);
    const newMoves = movesLeft - 1;
    setMovesLeft(newMoves);

    const { totalCounts, totalScore } = await resolveLoop(boardArr);

    if (!hasPossibleMove(boardArr) && findMatches(boardArr).length === 0) {
      setInfo("🔀 Keine Züge mehr möglich – Spielfeld neu gemischt!");
      await delay(400);
      setBoard(createBoard());
      setInfo("");
    }

    finishMove(totalCounts, totalScore, newMoves);
    setBusy(false);
  }

  async function useBomb(r, c) {
    if (progress.bombs <= 0 || busy) return;
    setBusy(true);
    setBombMode(false);
    setProgress((p) => ({ ...p, bombs: p.bombs - 1 }));

    const boardArr = boardRef.current.map((row) => [...row]);
    const cells = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE) cells.push([rr, cc]);
      }
    }
    const { counts, scoreGain } = await clearAndCollapse(boardArr, cells);
    const { totalCounts: cascadeCounts, totalScore: cascadeScore } = await resolveLoop(boardArr);

    const combinedCounts = { ...counts };
    for (const [k, v] of Object.entries(cascadeCounts)) combinedCounts[k] = (combinedCounts[k] || 0) + v;

    if (!hasPossibleMove(boardArr) && findMatches(boardArr).length === 0) {
      await delay(300);
      setBoard(createBoard());
    }

    finishMove(combinedCounts, scoreGain + cascadeScore, movesLeft);
    setBusy(false);
  }

  function useShuffle() {
    if (progress.shufflers <= 0 || busy || phase !== "playing") return;
    setProgress((p) => ({ ...p, shufflers: p.shufflers - 1 }));
    setBoard(createBoard());
    setInfo("🔀 Spielfeld gemischt!");
    setTimeout(() => setInfo(""), 1200);
  }

  function handleTileClick(r, c) {
    if (busy || phase !== "playing") return;
    if (bombMode) {
      useBomb(r, c);
      return;
    }
    if (!selected) {
      setSelected({ r, c });
      return;
    }
    if (selected.r === r && selected.c === c) {
      setSelected(null);
      return;
    }
    const adjacent = Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1;
    if (adjacent) {
      handleSwap(selected.r, selected.c, r, c);
    } else {
      setSelected({ r, c });
    }
  }

  const progressPct = Math.min(100, Math.round((collected / level.targetCount) * 100));

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      {/* HUD */}
      <div style={{ ...panelStyle, padding: "12px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <button onClick={onExit} style={{ ...btnStyle(false), padding: "6px 10px", fontSize: 12 }}>← Hafen</button>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🌊 Level {level.number}</div>
          <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
            <span>💰 {progress.coins}</span>
            <span>⭐ {progress.stars}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: G.textSub }}>
          <div>
            Sammle: <span style={{ fontSize: 18 }}>{level.target.icon}</span> {collected}/{level.targetCount}
          </div>
          <div>Züge: <b style={{ color: movesLeft <= 3 ? G.accent3 : G.text }}>{movesLeft}</b></div>
          <div>Punkte: {score}</div>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: G.accent2, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Booster-Leiste */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button
          style={btnStyle(bombMode, G.accent3)}
          disabled={progress.bombs <= 0 || phase !== "playing" || busy}
          onClick={() => setBombMode((b) => !b)}
          title="Bombe: räumt ein 3x3-Feld frei"
        >
          💣 Bombe ({progress.bombs})
        </button>
        <button
          style={btnStyle(false, G.accent)}
          disabled={progress.shufflers <= 0 || phase !== "playing" || busy}
          onClick={useShuffle}
          title="Mischer: mischt das Spielfeld neu"
        >
          🔀 Mischer ({progress.shufflers})
        </button>
        {bombMode && <span style={{ fontSize: 12, color: G.accent3 }}>Wähle ein Feld zum Sprengen!</span>}
        {info && <span style={{ fontSize: 12, color: G.accent }}>{info}</span>}
      </div>

      {/* Spielfeld */}
      {board && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gap: 4,
            background: G.cardAlt,
            borderRadius: G.radius,
            padding: 6,
            aspectRatio: "1 / 1",
            opacity: phase === "playing" ? 1 : 0.5,
            pointerEvents: phase === "playing" ? "auto" : "none",
          }}
        >
          {board.map((row, r) =>
            row.map((tileId, c) => {
              const tile = TILE_TYPES[tileId];
              const key = `${r},${c}`;
              const isSelected = selected && selected.r === r && selected.c === c;
              const isFlashing = flashing.has(key);
              const isShaking = shake && shake.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => handleTileClick(r, c)}
                  style={{
                    border: isSelected ? `2px solid ${G.accent}` : "2px solid transparent",
                    borderRadius: 10,
                    background: tile.color + "33",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "clamp(16px, 4.2vw, 26px)",
                    cursor: bombMode ? "crosshair" : "pointer",
                    transition: "transform 0.12s, border 0.12s",
                    transform: isSelected ? "scale(1.08)" : "scale(1)",
                    animation: isFlashing
                      ? "hm-pop 0.18s ease-out"
                      : isShaking
                      ? "hm-shake 0.26s ease-in-out"
                      : "none",
                  }}
                >
                  {tile.icon}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Overlays */}
      {phase === "start" && (
        <Overlay>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌊</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Level {level.number}</div>
          <div style={{ color: G.textSub, marginBottom: 16, textAlign: "center" }}>
            Sammle {level.targetCount}× {level.target.icon} in {level.moves} Zügen.
          </div>
          {progress.energy > 0 ? (
            <button style={{ ...btnStyle(true, G.accent2), padding: "12px 28px", fontSize: 15 }} onClick={startLevel}>
              ▶️ Level starten (-1 ❤️)
            </button>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 10, color: G.accent3, fontWeight: 700 }}>Keine Energie mehr ❤️</div>
              <div style={{ fontSize: 12, color: G.textMuted, marginBottom: 12 }}>
                Spiele Solitaire, um Energie aufzuladen, oder warte auf die Regeneration.
              </div>
            </div>
          )}
          <button style={{ ...btnStyle(false), marginTop: 12 }} onClick={onExit}>← Zurück zum Hafen</button>
        </Overlay>
      )}

      {phase === "won" && (
        <Overlay>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Level geschafft!</div>
          <div style={{ color: G.textSub, marginBottom: 16 }}>
            +{20 + level.number * 3} 💰 Münzen · Punkte: {score}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...btnStyle(true, G.accent2), padding: "10px 22px" }} onClick={() => setPhase("start")}>
              ▶️ Nächstes Level
            </button>
            <button style={btnStyle(false)} onClick={onExit}>🏠 Zum Hafen</button>
          </div>
        </Overlay>
      )}

      {phase === "lost" && (
        <Overlay>
          <div style={{ fontSize: 40, marginBottom: 8 }}>😕</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Keine Züge mehr!</div>
          <div style={{ color: G.textSub, marginBottom: 16 }}>
            {collected}/{level.targetCount} {level.target.icon} gesammelt
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{ ...btnStyle(progress.energy > 0, G.accent2), padding: "10px 22px" }}
              disabled={progress.energy <= 0}
              onClick={() => setPhase("start")}
            >
              🔁 Erneut versuchen
            </button>
            <button style={btnStyle(false)} onClick={onExit}>🏠 Zum Hafen</button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Overlay({ children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,20,36,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        style={{
          ...panelStyle,
          background: G.panelSolid,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 360,
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
