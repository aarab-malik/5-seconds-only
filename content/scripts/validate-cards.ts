import { readFileSync } from "fs";
import { join } from "path";
import type { GameCard } from "../../lib/game/types";

const deckPath = join(process.cwd(), "lib", "prompts", "deck.json");

let deck: GameCard[];
try {
  deck = JSON.parse(readFileSync(deckPath, "utf-8"));
} catch {
  console.error("Run npm run build:deck first");
  process.exit(1);
}

const ids = new Set<string>();
let errors = 0;

for (const card of deck) {
  if (ids.has(card.id)) {
    console.error(`Duplicate id: ${card.id}`);
    errors++;
  }
  ids.add(card.id);

  if (!card.sideA.startsWith("Name 3") || !card.sideB.startsWith("Name 3")) {
    console.error(`Invalid prompt format: ${card.id}`);
    errors++;
  }

  if (card.sideA === card.sideB) {
    console.error(`Identical sides: ${card.id}`);
    errors++;
  }
}

console.log(`Validated ${deck.length} cards, ${errors} errors`);
process.exit(errors > 0 ? 1 : 0);
