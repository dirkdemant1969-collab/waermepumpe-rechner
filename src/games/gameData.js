// ═════════════════════════════════════════════════════════════════════════════
// GEMEINSAME SPIEL-DATEN: Match-3 Tiles, Block-Formen, Kartenspiel-Utilities
// ═════════════════════════════════════════════════════════════════════════════

// ── MATCH-3: Hafen-Symbole ───────────────────────────────────────────────────
export const TILE_TYPES = [
  { id: 0, icon: "🐚", color: "#fde68a" },
  { id: 1, icon: "🦀", color: "#fca5a5" },
  { id: 2, icon: "🐠", color: "#93c5fd" },
  { id: 3, icon: "⚓", color: "#c4b5fd" },
  { id: 4, icon: "🌊", color: "#67e8f9" },
  { id: 5, icon: "🎏", color: "#86efac" },
];

export const BOARD_SIZE = 8;

export function randomTileId() {
  return Math.floor(Math.random() * TILE_TYPES.length);
}

export function getLevel(n) {
  const target = TILE_TYPES[(n - 1) % TILE_TYPES.length];
  return {
    number: n,
    target,
    targetCount: 12 + Math.floor(n * 1.4),
    moves: 18 + Math.floor(n / 4),
  };
}

// ── HAFEN-AUSBAU: Sterne-Schwellen für die Hafen-Dekoration ──────────────────
export const HARBOR_STAGES = [
  { stars: 0, icon: "🏚️", label: "Ruine" },
  { stars: 10, icon: "⛵", label: "Bootssteg" },
  { stars: 25, icon: "🏠", label: "Fischerhaus" },
  { stars: 50, icon: "🏡", label: "Hafenvilla" },
  { stars: 90, icon: "🗼", label: "Leuchtturm" },
  { stars: 150, icon: "🏰", label: "Hafenschloss" },
  { stars: 250, icon: "🌅", label: "Traumhafen" },
];

export function harborStage(stars) {
  let idx = 0;
  for (let i = 0; i < HARBOR_STAGES.length; i++) {
    if (stars >= HARBOR_STAGES[i].stars) idx = i;
  }
  return idx;
}

// ── BLOCK-PUZZLE: Formen (relative Zellen [Zeile, Spalte], normalisiert) ─────
export const BLOCK_SHAPES = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2]],
  [[0, 0], [1, 0], [1, 1], [1, 2]],
  [[0, 0], [0, 1], [1, 0], [2, 0]],
  [[0, 2], [1, 2], [1, 1], [1, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
  [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  [[0, 0], [0, 1], [1, 1], [1, 2]],
  [[0, 1], [0, 2], [1, 0], [1, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 1], [1, 0], [1, 1], [2, 0]],
];

export const BLOCK_COLORS = [
  "#ffd166", "#06d6a0", "#118ab2", "#ef476f", "#c4b5fd", "#86efac", "#fca5a5", "#67e8f9",
];

export function randomPiece() {
  const shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
  const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
  return { id: Math.random().toString(36).slice(2), shape, color };
}

export function randomTray() {
  return [randomPiece(), randomPiece(), randomPiece()];
}

// ── SOLITAIRE: Kartenspiel-Utilities ─────────────────────────────────────────
export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANK_LABELS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function isRed(suit) {
  return suit === "♥" || suit === "♦";
}

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        id: `${suit}${value}`,
        suit,
        value,
        label: RANK_LABELS[value - 1],
        red: isRed(suit),
        faceUp: false,
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck) {
  const arr = deck.map((c) => ({ ...c }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
