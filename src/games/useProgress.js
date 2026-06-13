import { useEffect, useState } from "react";

// ═════════════════════════════════════════════════════════════════════════════
// GEMEINSAMER FORTSCHRITT FÜR ALLE DREI SPIEL-MODI
// Münzen, Sterne, Energie & Booster werden zwischen Match-3, Block-Puzzle
// und Solitaire geteilt und in localStorage gespeichert.
// ═════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "hafenmix_progress_v1";
const REGEN_MS = 3 * 60 * 1000; // 1 Energie alle 3 Minuten

export const MAX_ENERGY = 5;

const DEFAULTS = {
  coins: 0,
  stars: 0,
  energy: MAX_ENERGY,
  maxEnergy: MAX_ENERGY,
  lastEnergyTs: Date.now(),
  bombs: 1,
  shufflers: 1,
  match3Level: 1,
  blockHighscore: 0,
  blockLineClears: 0,
  solitaireWins: 0,
};

function applyRegen(p) {
  if (p.energy >= p.maxEnergy) return p;
  const elapsed = Date.now() - p.lastEnergyTs;
  const gained = Math.floor(elapsed / REGEN_MS);
  if (gained <= 0) return p;
  return {
    ...p,
    energy: Math.min(p.maxEnergy, p.energy + gained),
    lastEnergyTs: p.lastEnergyTs + gained * REGEN_MS,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const data = JSON.parse(raw);
    return applyRegen({ ...DEFAULTS, ...data });
  } catch {
    return { ...DEFAULTS };
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* Speicher evtl. voll oder gesperrt – Fortschritt bleibt nur in dieser Sitzung */
    }
  }, [progress]);

  // Energie regeneriert sich auch während die App offen ist
  useEffect(() => {
    const id = setInterval(() => setProgress(applyRegen), 15000);
    return () => clearInterval(id);
  }, []);

  return [progress, setProgress];
}

export function msUntilNextEnergy(progress) {
  if (progress.energy >= progress.maxEnergy) return 0;
  const elapsed = Date.now() - progress.lastEnergyTs;
  return Math.max(0, REGEN_MS - elapsed);
}
