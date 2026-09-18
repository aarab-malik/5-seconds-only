import type { CardRating, GameCard } from "./types";
import { buildDeck as buildDeckProgrammatic } from "./deck";

let cachedDeck: GameCard[] | null = null;

export function getDeck(): GameCard[] {
  if (cachedDeck) return cachedDeck;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const json = require("../prompts/deck.json") as GameCard[];
    cachedDeck = json;
    return json;
  } catch {
    cachedDeck = buildDeckProgrammatic();
    return cachedDeck;
  }
}

export function buildDeck(): GameCard[] {
  return getDeck();
}

export function filterDeck(
  cards: GameCard[],
  settings: {
    maxRating: CardRating;
    enabledCategories: string[];
    difficultyRange: [number, number];
  },
): GameCard[] {
  const maxIdx = ["family", "teen", "adult", "spicy"].indexOf(settings.maxRating);

  return cards.filter((c) => {
    if (!c.enabled) return false;
    const ratingIdx = ["family", "teen", "adult", "spicy"].indexOf(c.rating);
    if (ratingIdx > maxIdx) return false;
    if (!settings.enabledCategories.includes(c.category)) return false;
    if (
      c.difficulty < settings.difficultyRange[0] ||
      c.difficulty > settings.difficultyRange[1]
    ) {
      return false;
    }
    return true;
  });
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const j = h % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function shuffleDeck(cards: GameCard[], seed: string): GameCard[] {
  return seededShuffle(cards, seed);
}

export function getCardById(id: string): GameCard | undefined {
  return getDeck().find((c) => c.id === id);
}
