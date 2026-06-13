import { useState } from "react";
import { createDeck, shuffleDeck } from "./gameData";
import { G, btnStyle, panelStyle } from "./theme";

const SUIT_ICONS = ["♠", "♥", "♦", "♣"];

function dealNewGame() {
  const deck = shuffleDeck(createDeck());
  const tableau = [[], [], [], [], [], [], []];
  let idx = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = { ...deck[idx++], faceUp: j === i };
      tableau[i].push(card);
    }
  }
  const stock = deck.slice(idx).map((c) => ({ ...c, faceUp: false }));
  return { tableau, foundations: [[], [], [], []], waste: [], stock };
}

function cloneState(state) {
  return {
    tableau: state.tableau.map((pile) => pile.map((c) => ({ ...c }))),
    foundations: state.foundations.map((pile) => pile.map((c) => ({ ...c }))),
    waste: state.waste.map((c) => ({ ...c })),
    stock: state.stock.map((c) => ({ ...c })),
  };
}

function getStack(state, selected) {
  if (!selected) return [];
  if (selected.type === "tableau") return state.tableau[selected.pileIndex].slice(selected.cardIndex);
  if (selected.type === "waste") return state.waste.length ? [state.waste[state.waste.length - 1]] : [];
  if (selected.type === "foundation") {
    const pile = state.foundations[selected.pileIndex];
    return pile.length ? [pile[pile.length - 1]] : [];
  }
  return [];
}

function removeStackFromSource(state, selected) {
  if (selected.type === "tableau") {
    const pile = state.tableau[selected.pileIndex];
    pile.splice(selected.cardIndex);
    if (pile.length > 0 && !pile[pile.length - 1].faceUp) pile[pile.length - 1].faceUp = true;
  } else if (selected.type === "waste") {
    state.waste.pop();
  } else if (selected.type === "foundation") {
    state.foundations[selected.pileIndex].pop();
  }
}

function tryMove(state, selected, destType, destIndex) {
  const stack = getStack(state, selected);
  if (!stack.length) return null;
  const first = stack[0];

  if (destType === "foundation") {
    if (stack.length !== 1) return null;
    const pile = state.foundations[destIndex];
    const top = pile[pile.length - 1];
    const valid = pile.length === 0 ? first.value === 1 : top.suit === first.suit && first.value === top.value + 1;
    if (!valid) return null;
  } else {
    const pile = state.tableau[destIndex];
    const top = pile[pile.length - 1];
    const valid = pile.length === 0 ? first.value === 13 : top.faceUp && top.red !== first.red && first.value === top.value - 1;
    if (!valid) return null;
  }

  const next = cloneState(state);
  removeStackFromSource(next, selected);
  const movedStack = stack.map((c) => ({ ...c, faceUp: true }));
  if (destType === "foundation") next.foundations[destIndex].push(...movedStack);
  else next.tableau[destIndex].push(...movedStack);
  return next;
}

function checkWin(state) {
  return state.foundations.every((p) => p.length === 13);
}

export default function Solitaire({ progress, setProgress, onExit }) {
  const [state, setState] = useState(dealNewGame);
  const [selected, setSelected] = useState(null);
  const [won, setWon] = useState(false);
  const [reward, setReward] = useState(null);

  function newGame() {
    setState(dealNewGame());
    setSelected(null);
    setWon(false);
    setReward(null);
  }

  function onWin() {
    const coinsEarned = 50;
    const starsEarned = 5;
    const bombsEarned = 1;
    setProgress((p) => ({
      ...p,
      coins: p.coins + coinsEarned,
      stars: p.stars + starsEarned,
      bombs: p.bombs + bombsEarned,
      energy: p.maxEnergy,
      lastEnergyTs: Date.now(),
      solitaireWins: p.solitaireWins + 1,
    }));
    setReward({ coinsEarned, starsEarned, bombsEarned });
    setWon(true);
  }

  function applyMove(newState) {
    setState(newState);
    setSelected(null);
    if (checkWin(newState)) onWin();
  }

  function handleStockClick() {
    if (won) return;
    const next = cloneState(state);
    if (next.stock.length > 0) {
      const card = next.stock.pop();
      card.faceUp = true;
      next.waste.push(card);
    } else if (next.waste.length > 0) {
      next.stock = next.waste.reverse().map((c) => ({ ...c, faceUp: false }));
      next.waste = [];
    }
    setState(next);
    setSelected(null);
  }

  function handleWasteClick() {
    if (won || state.waste.length === 0) return;
    if (selected && selected.type === "waste") {
      setSelected(null);
      return;
    }
    setSelected({ type: "waste", pileIndex: 0, cardIndex: state.waste.length - 1 });
  }

  function handleTableauClick(colIdx, cardIdx) {
    if (won) return;
    const pile = state.tableau[colIdx];
    const card = pile[cardIdx];

    if (selected) {
      const moved = tryMove(state, selected, "tableau", colIdx);
      if (moved) {
        applyMove(moved);
        return;
      }
    }

    if (card && card.faceUp) {
      if (selected && selected.type === "tableau" && selected.pileIndex === colIdx && selected.cardIndex === cardIdx) {
        setSelected(null);
      } else {
        setSelected({ type: "tableau", pileIndex: colIdx, cardIndex: cardIdx });
      }
    }
  }

  function handleFoundationClick(suitIdx) {
    if (won) return;
    if (selected) {
      const moved = tryMove(state, selected, "foundation", suitIdx);
      if (moved) {
        applyMove(moved);
        return;
      }
    }
    const pile = state.foundations[suitIdx];
    if (pile.length > 0) {
      if (selected && selected.type === "foundation" && selected.pileIndex === suitIdx) setSelected(null);
      else setSelected({ type: "foundation", pileIndex: suitIdx, cardIndex: pile.length - 1 });
    } else {
      setSelected(null);
    }
  }

  function handleDoubleClick(type, pileIndex, cardIndex) {
    if (won) return;
    const sel = { type, pileIndex, cardIndex };
    const stack = getStack(state, sel);
    if (stack.length !== 1) return;
    for (let f = 0; f < 4; f++) {
      const moved = tryMove(state, sel, "foundation", f);
      if (moved) {
        applyMove(moved);
        return;
      }
    }
  }

  return (
    <div style={{ maxWidth: 580, margin: "0 auto" }}>
      {/* HUD */}
      <div style={{ ...panelStyle, padding: "12px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🃏 Hafen-Solitaire</div>
          <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
            <span>💰 {progress.coins}</span>
            <span>⭐ {progress.stars}</span>
            <span>🏆 {progress.solitaireWins}</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: G.textMuted, marginTop: 6 }}>
          Sieg = volle ❤️ Energie + 💣 Bombe + 50 💰 + 5 ⭐ für Hafen-Match!
        </div>
      </div>

      {/* Stock / Waste / Foundations */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <CardSlot onClick={handleStockClick}>
            {state.stock.length > 0 ? (
              <CardBack />
            ) : (
              <div style={{ fontSize: 18, color: G.textMuted }}>↺</div>
            )}
          </CardSlot>
          <CardSlot onClick={handleWasteClick}>
            {state.waste.length > 0 && (
              <Card
                card={state.waste[state.waste.length - 1]}
                selected={selected && selected.type === "waste"}
                onDoubleClick={() => handleDoubleClick("waste", 0, state.waste.length - 1)}
              />
            )}
          </CardSlot>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {state.foundations.map((pile, i) => (
            <CardSlot key={i} onClick={() => handleFoundationClick(i)}>
              {pile.length > 0 ? (
                <Card card={pile[pile.length - 1]} selected={selected && selected.type === "foundation" && selected.pileIndex === i} />
              ) : (
                <div style={{ fontSize: 18, color: G.textMuted }}>{SUIT_ICONS[i]}</div>
              )}
            </CardSlot>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {state.tableau.map((pile, colIdx) => (
          <div
            key={colIdx}
            onClick={() => pile.length === 0 && handleTableauClick(colIdx, 0)}
            style={{
              position: "relative",
              height: pile.length === 0 ? 90 : (pile.length - 1) * 20 + 120,
              border: pile.length === 0 ? `1px dashed ${G.panelBorder}` : "none",
              borderRadius: 8,
            }}
          >
            {pile.map((card, cardIdx) => (
              <div
                key={card.id}
                style={{ position: "absolute", top: cardIdx * 20, left: 0, right: 0, zIndex: cardIdx }}
              >
                <Card
                  card={card}
                  selected={
                    selected &&
                    selected.type === "tableau" &&
                    selected.pileIndex === colIdx &&
                    cardIdx >= selected.cardIndex
                  }
                  onClick={() => handleTableauClick(colIdx, cardIdx)}
                  onDoubleClick={() => handleDoubleClick("tableau", colIdx, cardIdx)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button style={{ ...btnStyle(false), marginRight: 8 }} onClick={newGame}>🔁 Neues Spiel</button>
        <button style={btnStyle(false)} onClick={onExit}>← Zurück zum Hafen</button>
      </div>

      {won && (
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
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Gewonnen!</div>
            {reward && (
              <div style={{ color: G.textSub, marginBottom: 16, textAlign: "center" }}>
                +{reward.coinsEarned} 💰 · +{reward.starsEarned} ⭐ · +{reward.bombsEarned} 💣
                <div style={{ marginTop: 4, color: G.accent }}>❤️ Energie aufgefüllt!</div>
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

function CardSlot({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "13%",
        minWidth: 44,
        aspectRatio: "0.7 / 1",
        border: `1px solid ${G.panelBorder}`,
        borderRadius: 8,
        background: "rgba(255,255,255,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {children}
    </div>
  );
}

function CardBack() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 7,
        background: "repeating-linear-gradient(45deg, #118ab2, #118ab2 6px, #0d3354 6px, #0d3354 12px)",
      }}
    />
  );
}

function Card({ card, selected, onClick, onDoubleClick }) {
  if (!card.faceUp) {
    return (
      <div onClick={onClick} style={{ width: "100%", aspectRatio: "0.7 / 1", cursor: "pointer" }}>
        <CardBack />
      </div>
    );
  }
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{
        width: "100%",
        aspectRatio: "0.7 / 1",
        borderRadius: 7,
        background: "#fdfdfd",
        border: selected ? `2px solid ${G.accent}` : "1px solid rgba(0,0,0,0.15)",
        boxShadow: selected ? `0 0 10px ${G.accent}aa` : "0 1px 3px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "4px 5px",
        color: card.red ? "#d62839" : "#1a1a2e",
        fontWeight: 700,
        fontSize: "clamp(10px, 2.6vw, 15px)",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div>{card.label}</div>
      <div style={{ textAlign: "center", fontSize: "clamp(12px, 3.4vw, 20px)" }}>{card.suit}</div>
      <div style={{ textAlign: "right", transform: "rotate(180deg)" }}>{card.label}</div>
    </div>
  );
}
