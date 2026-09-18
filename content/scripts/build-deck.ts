import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { buildDeck } from "../../lib/game/deck";
import type { CardRating, GameCard } from "../../lib/game/types";
import { ALL_CATEGORIES } from "../../lib/game/types";

const LETTERS = "ABCDEFGHJKLMNPQRSTVWXYZ".split("");

function expandWithLetterVariants(cards: GameCard[]): GameCard[] {
  const expanded: GameCard[] = [...cards];
  let variantId = 0;

  const letterTemplates: Record<string, [string, string]> = {
    animals: [
      "Name 3 animals starting with {L}",
      "Name 3 pets starting with {L}",
    ],
    food: [
      "Name 3 foods starting with {L}",
      "Name 3 fruits starting with {L}",
    ],
    random: [
      "Name 3 things starting with {L}",
      "Name 3 objects starting with {L}",
    ],
    geography: [
      "Name 3 countries starting with {L}",
      "Name 3 cities starting with {L}",
    ],
    music: [
      "Name 3 bands starting with {L}",
      "Name 3 songs starting with {L}",
    ],
  };

  for (const category of ALL_CATEGORIES) {
    const templates = letterTemplates[category];
    if (!templates) continue;
    const rating = cards.find((c) => c.category === category)?.rating ?? "family";

    for (const letter of LETTERS) {
      const [tA, tB] = templates;
      expanded.push({
        id: `${category}-var-${variantId++}`,
        sideA: tA.replace("{L}", letter),
        sideB: tB.replace("{L}", letter),
        category,
        rating: rating as CardRating,
        difficulty: 2,
        tags: [category, "letter-variant"],
        enabled: true,
      });
    }
  }

  return expanded;
}

function expandWithNumericVariants(cards: GameCard[]): GameCard[] {
  const expanded = [...cards];
  let id = 0;
  const nums = ["2", "4", "5", "6", "7", "8", "9", "10"];

  const templates: [string, string][] = [
    ["Name 3 things you need {N} of", "Name 3 things that come in packs of {N}"],
    ["Name 3 reasons to wake up at {N} AM", "Name 3 things that take {N} minutes"],
    ["Name 3 items on a ${N} shopping list", "Name 3 gifts under ${N}"],
  ];

  for (const card of cards.slice(0, 120)) {
    for (const num of nums) {
      const [tA, tB] = templates[id % templates.length];
      expanded.push({
        id: `${card.category}-num-${id++}`,
        sideA: tA.replace("{N}", num).replace("${N}", num),
        sideB: tB.replace("{N}", num).replace("${N}", num),
        category: card.category,
        rating: card.rating,
        difficulty: 3,
        tags: [card.category, "numeric-variant"],
        enabled: true,
      });
    }
  }

  return expanded;
}

const base = buildDeck();
const withLetters = expandWithLetterVariants(base);
const full = expandWithNumericVariants(withLetters);

const byRating = {
  family: full.filter((c) => c.rating === "family"),
  teen: full.filter((c) => c.rating === "teen"),
  adult: full.filter((c) => c.rating === "adult"),
  spicy: full.filter((c) => c.rating === "spicy"),
};

const outDir = join(process.cwd(), "lib", "prompts");
mkdirSync(outDir, { recursive: true });
mkdirSync(join(process.cwd(), "content", "cards"), { recursive: true });

writeFileSync(join(outDir, "deck.json"), JSON.stringify(full, null, 0));
writeFileSync(
  join(process.cwd(), "content", "cards", "family.json"),
  JSON.stringify(byRating.family, null, 2),
);
writeFileSync(
  join(process.cwd(), "content", "cards", "teen.json"),
  JSON.stringify(byRating.teen, null, 2),
);
writeFileSync(
  join(process.cwd(), "content", "cards", "adult.json"),
  JSON.stringify(byRating.adult, null, 2),
);
writeFileSync(
  join(process.cwd(), "content", "cards", "spicy.json"),
  JSON.stringify(byRating.spicy, null, 2),
);

writeFileSync(
  join(process.cwd(), "content", "manifest.json"),
  JSON.stringify(
    {
      version: "1.0.0",
      totalCards: full.length,
      files: {
        family: { count: byRating.family.length },
        teen: { count: byRating.teen.length },
        adult: { count: byRating.adult.length },
        spicy: { count: byRating.spicy.length },
      },
    },
    null,
    2,
  ),
);

console.log(`Built ${full.length} cards`);
