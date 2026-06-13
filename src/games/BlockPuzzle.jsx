import { useState } from "react";
import { randomTray } from "./gameData";
import { G, btnStyle, panelStyle } from "./theme";

const SIZE = 8;

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
}

function canPlace(grid, shape, anchorR, anchorC) {
  for (const [dr, dc] of shape) {
    const r = anchorR + dr, c = anchorC + dc;
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
    if (grid[r][c]) return false;
  }
  return true;
}

function canPlaceAnywhere(grid, shape) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (canPlace(grid, shape, r, c)) return true;
  return false;
}

function clearFullLines(grid) {
  const fullRows = [];
  const fullCols = [];
  for (let r = 0; r < SIZE; r++) if (grid[r].every((cell) => cell)) fullRows.push(r);
  for (let c = 0; c < SIZE; c++) if (grid.every((row) => row[c])) fullCols.push(c);
  for (const r of fullRows) for (let c = 0; c < SIZE; c++) grid[r][c] = null;
  for (const c of fullCols) for (let r = 0; r < SIZE; r++) grid[r][c] = null;
  return fullRows.length + fullCols.length;
}

export default function BlockPuzzle({ progress, setProgress, onExit }) {
  const [grid, setGrid] = useState(emptyGrid);
  const [tray, setTray] = useState(randomTray);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [hover, setHover] = useState(null);
  const [score, setScore] = useState(0);
  const [lineClears, setLineClears] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);

  function newGame() {
    setGrid(emptyGrid());
    setTray(randomTray());
    setSelectedIdx(null);
    setHover(null);
    setScore(0);
    setLineClears(0);
    setGameOver(false);
    setResult(null);
  }

  function checkGameOver(g, currentTray) {
    for (const piece of currentTray) {
      if (piece && canPlaceAnywhere(g, piece.shape)) return false;
    }
    return true;
  }

  function endGame(finalScore, finalLineClears) {
    const coinsEarned = Math.floor(finalScore / 2);
    const starsEarned = Math.floor(finalScore / 25);
    const prevTotal = progress.blockLineClears;
    const newTotal = prevTotal + finalLineClears;
    const thresholds = Math.floor(newTotal / 10) - Math.floor(prevTotal / 10);

    setProgress((p) => ({
      ...p,
      coins: p.coins + coinsEarned,
      stars: p.stars + starsEarned + thresholds,
      blockHighscore: Math.max(p.blockHighscore, finalScore),
      blockLineClears: newTotal,
      energy: Math.min(p.maxEnergy, p.energy + thresholds),
      shufflers: p.shufflers + thresholds,
    }));

    setResult({ coinsEarned, starsEarned, thresholds });
    setGameOver(true);
  }

  function placePiece(anchorR, anchorC) {
    if (selectedIdx === null || gameOver) return;
    const piece = tray[selectedIdx];
    if (!piece || !canPlace(grid, piece.shape, anchorR, anchorC)) return;

    const newGrid = grid.map((row) => [...row]);
    for (const [dr, dc] of piece.shape) newGrid[anchorR + dr][anchorC + dc] = piece.color;

    const placedCells = piece.shape.length;
    const cleared = clearFullLines(newGrid);
    const gained = placedCells + cleared * 8;

    let newTray = tray.map((p, i) => (i === selectedIdx ? null : p));
    if (newTray.every((p) => p === null)) newTray = randomTray();

    const newScore = score + gained;
    const newLineClears = lineClears + cleared;

    setGrid(newGrid);
    setTray(newTray);
    setSelectedIdx(null);
    setHover(null);
    setScore(newScore);
    setLineClears(newLineClears);

    if (checkGameOver(newGrid, newTray)) {
      endGame(newScore, newLineClears);
    }
  }

  const selectedPiece = selectedIdx !== null ? tray[selectedIdx] : null;
  const previewCells = new Set();
  let previewValid = false;
  if (selectedPiece && hover) {
    previewValid = canPlace(grid, selectedPiece.shape, hover.r, hover.c);
    for (const [dr, dc] of selectedPiece.shape) {
      const r = hover.r + dr, c = hover.c + dc;
      if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) previewCells.add(`${r},${c}`);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      {/* HUD */}
      <div style={{ ...panelStyle, padding: "12px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🧱 Block-Hafen</div>
          <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
            <span>💰 {progress.coins}</span>
            <span>⭐ {progress.stars}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: G.textSub, marginTop: 6 }}>
          <div>Punkte: <b style={{ color: G.text }}>{score}</b></div>
          <div>Bestwert: {progress.blockHighscore}</div>
          <div>Linien: {lineClears}</div>
        </div>
        <div style={{ fontSize: 11, color: G.textMuted, marginTop: 6 }}>
          Alle 10 geräumten Linien (gesamt) gibt's +1 ❤️ Energie und +1 🔀 Mischer für Hafen-Match!
        </div>
      </div>

      {/* Spielfeld */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gap: 3,
          background: G.cardAlt,
          borderRadius: G.radius,
          padding: 6,
          aspectRatio: "1 / 1",
          opacity: gameOver ? 0.5 : 1,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const isPreview = previewCells.has(key);
            return (
              <div
                key={key}
                onMouseEnter={() => setHover({ r, c })}
                onClick={() => placePiece(r, c)}
                style={{
                  borderRadius: 6,
                  background: cell
                    ? cell
                    : isPreview
                    ? previewValid
                      ? G.accent2 + "55"
                      : G.accent3 + "55"
                    : "rgba(255,255,255,0.06)",
                  border: cell ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                  cursor: selectedPiece ? "pointer" : "default",
                  transition: "background 0.1s",
                }}
              />
            );
          })
        )}
      </div>

      {/* Teile-Tray */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
        {tray.map((piece, idx) => {
          if (!piece) return <div key={idx} style={{ width: 76, height: 76 }} />;
          const maxR = Math.max(...piece.shape.map(([r]) => r)) + 1;
          const maxC = Math.max(...piece.shape.map(([, c]) => c)) + 1;
          const cellSize = 18;
          return (
            <button
              key={piece.id}
              onClick={() => setSelectedIdx(idx === selectedIdx ? null : idx)}
              style={{
                width: 76,
                height: 76,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: selectedIdx === idx ? `2px solid ${G.accent}` : `2px solid ${G.panelBorder}`,
                borderRadius: 12,
                background: selectedIdx === idx ? "rgba(255,209,102,0.12)" : "rgba(255,255,255,0.04)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: maxC * cellSize,
                  height: maxR * cellSize,
                }}
              >
                {piece.shape.map(([dr, dc], i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: dc * cellSize,
                      top: dr * cellSize,
                      width: cellSize - 2,
                      height: cellSize - 2,
                      background: piece.color,
                      borderRadius: 3,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button style={btnStyle(false)} onClick={onExit}>← Zurück zum Hafen</button>
      </div>

      {gameOver && (
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
            <div style={{ fontSize: 40, marginBottom: 8 }}>🧱</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Spiel vorbei!</div>
            <div style={{ color: G.textSub, marginBottom: 4 }}>Punkte: {score}</div>
            {result && (
              <div style={{ color: G.textSub, marginBottom: 16, textAlign: "center" }}>
                +{result.coinsEarned} 💰 · +{result.starsEarned + result.thresholds} ⭐
                {result.thresholds > 0 && (
                  <div style={{ marginTop: 4, color: G.accent }}>
                    +{result.thresholds} ❤️ Energie & +{result.thresholds} 🔀 Mischer!
                  </div>
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...btnStyle(true, G.accent2), padding: "10px 22px" }} onClick={newGame}>
                🔁 Neues Spiel
              </button>
              <button style={btnStyle(false)} onClick={onExit}>🏠 Zum Hafen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
