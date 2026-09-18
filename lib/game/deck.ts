import type { CardRating, GameCard } from "./types";
import { ALL_CATEGORIES } from "./types";

const CATEGORY_DEFAULT_RATING: Record<string, CardRating> = {
  animals: "family",
  food: "family",
  sports: "family",
  geography: "family",
  holidays: "family",
  household: "family",
  school_work: "family",
  random: "family",
  movies_tv: "teen",
  music: "teen",
  science: "teen",
  pop_culture: "teen",
  would_you_rather: "teen",
  embarrassing: "teen",
  dating: "adult",
  party: "adult",
  adults_only: "adult",
  spicy: "spicy",
  crazy: "spicy",
  nsfw_adjacent: "spicy",
};

const PROMPT_PAIRS: Record<string, [string, string][]> = {
  animals: [
    ["Name 3 animals that live in the ocean", "Name 3 animals that can fly"],
    ["Name 3 pets people commonly own", "Name 3 animals with stripes"],
    ["Name 3 animals that hibernate", "Name 3 farm animals"],
    ["Name 3 animals that lay eggs", "Name 3 zoo animals"],
    ["Name 3 carnivores", "Name 3 herbivores"],
    ["Name 3 animals with fur", "Name 3 reptiles"],
    ["Name 3 insects", "Name 3 animals that swim"],
    ["Name 3 jungle animals", "Name 3 desert animals"],
    ["Name 3 animals with horns", "Name 3 animals with tails"],
    ["Name 3 birds", "Name 3 rodents"],
    ["Name 3 animals that are nocturnal", "Name 3 animals that migrate"],
    ["Name 3 animals with spots", "Name 3 animals that climb trees"],
    ["Name 3 sea creatures", "Name 3 animals that bark"],
    ["Name 3 animals with shells", "Name 3 animals with wings"],
    ["Name 3 animals found in Africa", "Name 3 animals found in Australia"],
    ["Name 3 animals that are endangered", "Name 3 animals that are fast"],
    ["Name 3 animals with long necks", "Name 3 animals with sharp teeth"],
    ["Name 3 animals that live in cold climates", "Name 3 animals that live in trees"],
    ["Name 3 animals that are black and white", "Name 3 animals that are colorful"],
    ["Name 3 animals that live in groups", "Name 3 animals that are solitary"],
  ],
  food: [
    ["Name 3 pizza toppings", "Name 3 pasta shapes"],
    ["Name 3 breakfast foods", "Name 3 desserts"],
    ["Name 3 fruits", "Name 3 vegetables"],
    ["Name 3 ice cream flavors", "Name 3 types of soup"],
    ["Name 3 Mexican dishes", "Name 3 Italian dishes"],
    ["Name 3 things you eat with a spoon", "Name 3 things you eat with chopsticks"],
    ["Name 3 green vegetables", "Name 3 red fruits"],
    ["Name 3 Thanksgiving dishes", "Name 3 movie theater snacks"],
    ["Name 3 chip flavors", "Name 3 cereals"],
    ["Name 3 sushi types", "Name 3 sandwich fillings"],
    ["Name 3 spicy foods", "Name 3 sweet foods"],
    ["Name 3 foods you grill", "Name 3 foods you bake"],
    ["Name 3 fast food chains", "Name 3 coffee drinks"],
    ["Name 3 cheeses", "Name 3 nuts"],
    ["Name 3 foods served cold", "Name 3 foods served hot"],
    ["Name 3 condiments", "Name 3 herbs"],
    ["Name 3 round foods", "Name 3 foods you dip"],
    ["Name 3 foods you would never eat", "Name 3 comfort foods"],
    ["Name 3 foods that are crunchy", "Name 3 foods that are soft"],
    ["Name 3 foods you eat at a picnic", "Name 3 foods you eat at a barbecue"],
  ],
  sports: [
    ["Name 3 Olympic sports", "Name 3 sports with a ball"],
    ["Name 3 water sports", "Name 3 winter sports"],
    ["Name 3 team sports", "Name 3 individual sports"],
    ["Name 3 sports with a net", "Name 3 sports with a racket"],
    ["Name 3 sports played indoors", "Name 3 sports played outdoors"],
    ["Name 3 sports with a bat", "Name 3 sports with a stick"],
    ["Name 3 extreme sports", "Name 3 board sports"],
    ["Name 3 sports you watch on TV", "Name 3 sports you played as a kid"],
    ["Name 3 martial arts", "Name 3 racing sports"],
    ["Name 3 sports at the beach", "Name 3 sports in the gym"],
    ["Name 3 NFL teams", "Name 3 NBA teams"],
    ["Name 3 sports that use helmets", "Name 3 sports with goals"],
    ["Name 3 card games", "Name 3 party games"],
    ["Name 3 sports that need ice", "Name 3 sports that need water"],
    ["Name 3 sports with referees", "Name 3 sports with penalties"],
  ],
  geography: [
    ["Name 3 countries in Europe", "Name 3 countries in Asia"],
    ["Name 3 US states", "Name 3 capital cities"],
    ["Name 3 continents", "Name 3 islands"],
    ["Name 3 famous landmarks", "Name 3 deserts"],
    ["Name 3 rivers", "Name 3 mountains"],
    ["Name 3 countries you want to visit", "Name 3 countries you have visited"],
    ["Name 3 cities in your country", "Name 3 bodies of water"],
    ["Name 3 Wonders of the World", "Name 3 national parks"],
    ["Name 3 countries that speak Spanish", "Name 3 countries that speak French"],
    ["Name 3 cold countries", "Name 3 tropical countries"],
    ["Name 3 rooms in a house", "Name 3 places in a school"],
    ["Name 3 things in a kitchen", "Name 3 things in a bathroom"],
    ["Name 3 countries in South America", "Name 3 countries in Africa"],
    ["Name 3 bridges", "Name 3 volcanoes"],
    ["Name 3 time zones", "Name 3 borders"],
  ],
  holidays: [
    ["Name 3 Halloween candies", "Name 3 Halloween costumes"],
    ["Name 3 Christmas movies", "Name 3 Christmas songs"],
    ["Name 3 Thanksgiving foods", "Name 3 birthday traditions"],
    ["Name 3 summer activities", "Name 3 winter activities"],
    ["Name 3 holidays with parades", "Name 3 holidays with fireworks"],
    ["Name 3 Valentine's gifts", "Name 3 Easter traditions"],
    ["Name 3 things you do on New Year's Eve", "Name 3 things you do on your birthday"],
    ["Name 3 holiday decorations", "Name 3 holiday desserts"],
    ["Name 3 places to hide Easter eggs", "Name 3 Hanukkah foods"],
    ["Name 3 things you are thankful for", "Name 3 holiday movies"],
  ],
  household: [
    ["Name 3 things in a garage", "Name 3 things in a bedroom"],
    ["Name 3 kitchen appliances", "Name 3 cleaning supplies"],
    ["Name 3 things you find in a drawer", "Name 3 things on a desk"],
    ["Name 3 tools", "Name 3 things that need batteries"],
    ["Name 3 things you plug in", "Name 3 things with buttons"],
    ["Name 3 things in a laundry room", "Name 3 things in a living room"],
    ["Name 3 things that are sticky", "Name 3 things that are fragile"],
    ["Name 3 things you lose often", "Name 3 things you never throw away"],
    ["Name 3 things in a junk drawer", "Name 3 things in a closet"],
    ["Name 3 household chores", "Name 3 things you fix with tape"],
  ],
  school_work: [
    ["Name 3 school subjects", "Name 3 things on a teacher's desk"],
    ["Name 3 jobs that wear uniforms", "Name 3 office supplies"],
    ["Name 3 things in a backpack", "Name 3 reasons to be late"],
    ["Name 3 college majors", "Name 3 skills for a resume"],
    ["Name 3 things you do in class", "Name 3 things you do at recess"],
    ["Name 3 famous scientists", "Name 3 types of engineers"],
    ["Name 3 things you Google for homework", "Name 3 excuses for missing class"],
    ["Name 3 things in a cafeteria", "Name 3 school clubs"],
    ["Name 3 things teachers say", "Name 3 things students say"],
    ["Name 3 careers in medicine", "Name 3 careers in tech"],
  ],
  random: [
    ["Name 3 things that glow", "Name 3 things that bounce"],
    ["Name 3 things that are round", "Name 3 things that are square"],
    ["Name 3 things that are loud", "Name 3 things that are quiet"],
    ["Name 3 things you find in a car", "Name 3 things you find in a purse"],
    ["Name 3 things that smell bad", "Name 3 things that smell good"],
    ["Name 3 things you do before bed", "Name 3 things you do in the morning"],
    ["Name 3 things that are expensive", "Name 3 things that are cheap"],
    ["Name 3 things you can't live without", "Name 3 things you could live without"],
    ["Name 3 things that start with B", "Name 3 things that start with S"],
    ["Name 3 dinosaur species", "Name 3 types of vehicles"],
    ["Name 3 colors in a rainbow", "Name 3 organs in the human body"],
    ["Name 3 types of footwear", "Name 3 things you cook dinner with"],
    ["Name 3 things you think are disgusting", "Name 3 things that are overrated"],
    ["Name 3 things that break easily", "Name 3 things that last forever"],
    ["Name 3 things you hoard", "Name 3 things you donate"],
  ],
  movies_tv: [
    ["Name 3 Disney villains", "Name 3 superhero movies"],
    ["Name 3 horror movies", "Name 3 comedy movies"],
    ["Name 3 TV shows about doctors", "Name 3 reality TV shows"],
    ["Name 3 Star Wars characters", "Name 3 Marvel characters"],
    ["Name 3 animated movies", "Name 3 movie franchises"],
    ["Name 3 actors named Chris", "Name 3 actresses named Jennifer"],
    ["Name 3 movies based on books", "Name 3 movie sequels"],
    ["Name 3 streaming services", "Name 3 movie genres"],
    ["Name 3 sitcoms", "Name 3 crime dramas"],
    ["Name 3 movie snacks", "Name 3 things you yell at the screen"],
    ["Name 3 cartoon characters", "Name 3 video game adaptations"],
    ["Name 3 movie plot twists", "Name 3 movie quotes everyone knows"],
    ["Name 3 binge-worthy shows", "Name 3 shows everyone has an opinion on"],
    ["Name 3 movie directors", "Name 3 Oscar-winning films"],
    ["Name 3 things that ruin a movie", "Name 3 things that make a movie great"],
  ],
  music: [
    ["Name 3 musical instruments", "Name 3 music genres"],
    ["Name 3 famous singers", "Name 3 boy bands"],
    ["Name 3 classic rock bands", "Name 3 pop stars"],
    ["Name 3 songs for a road trip", "Name 3 songs for a party"],
    ["Name 3 instruments with strings", "Name 3 percussion instruments"],
    ["Name 3 Queen songs", "Name 3 holiday songs"],
    ["Name 3 songs you know all the words to", "Name 3 songs you skip"],
    ["Name 3 music festivals", "Name 3 concert venues"],
    ["Name 3 one-hit wonders", "Name 3 albums everyone owns"],
    ["Name 3 songs you'd sing in the shower", "Name 3 songs that get stuck in your head"],
    ["Name 3 rappers", "Name 3 country singers"],
    ["Name 3 things at a concert", "Name 3 things musicians do on stage"],
    ["Name 3 guilty pleasure songs", "Name 3 songs from your childhood"],
    ["Name 3 music apps", "Name 3 things you need to be a DJ"],
    ["Name 3 songs that make you dance", "Name 3 songs that make you cry"],
  ],
  science: [
    ["Name 3 planets", "Name 3 elements on the periodic table"],
    ["Name 3 things that are magnetic", "Name 3 sources of energy"],
    ["Name 3 social media apps", "Name 3 tech companies"],
    ["Name 3 bones in the body", "Name 3 organs"],
    ["Name 3 weather phenomena", "Name 3 natural disasters"],
    ["Name 3 inventions", "Name 3 scientists"],
    ["Name 3 things in space", "Name 3 types of rocks"],
    ["Name 3 chemical elements", "Name 3 types of clouds"],
    ["Name 3 things you measure", "Name 3 units of measurement"],
    ["Name 3 things that use electricity", "Name 3 renewable resources"],
    ["Name 3 programming languages", "Name 3 phone brands"],
    ["Name 3 things in a lab", "Name 3 things astronauts need"],
    ["Name 3 diseases", "Name 3 vitamins"],
    ["Name 3 things that evolve", "Name 3 extinct animals"],
    ["Name 3 things that float", "Name 3 things that sink"],
  ],
  pop_culture: [
    ["Name 3 TikTok trends", "Name 3 meme formats"],
    ["Name 3 celebrity couples", "Name 3 celebrity scandals"],
    ["Name 3 reality show contestants", "Name 3 influencers"],
    ["Name 3 fashion trends", "Name 3 slang words"],
    ["Name 3 viral videos", "Name 3 internet challenges"],
    ["Name 3 things that were cool in the 90s", "Name 3 things that are cool now"],
    ["Name 3 things people collect", "Name 3 things people argue about online"],
    ["Name 3 podcast topics", "Name 3 YouTube channels"],
    ["Name 3 things that went viral", "Name 3 things that aged poorly"],
    ["Name 3 red carpet moments", "Name 3 award shows"],
    ["Name 3 things Gen Z says", "Name 3 things boomers say"],
    ["Name 3 celebrity feuds", "Name 3 celebrity comebacks"],
    ["Name 3 things people stan", "Name 3 things people cancel"],
    ["Name 3 fashion brands", "Name 3 sneaker brands"],
    ["Name 3 things that trend on Twitter", "Name 3 things that trend on Instagram"],
  ],
  would_you_rather: [
    ["Name 3 things you'd rather do on a Monday", "Name 3 places you'd never vacation"],
    ["Name 3 foods you'd eat for $1,000", "Name 3 foods you'd never eat for any amount"],
    ["Name 3 superpowers you'd want", "Name 3 superpowers you'd avoid"],
    ["Name 3 things you'd do if you were invisible", "Name 3 things you'd do if you were rich"],
    ["Name 3 people you'd want as roommates", "Name 3 people you'd never room with"],
    ["Name 3 jobs you'd quit immediately", "Name 3 jobs you'd love to have"],
    ["Name 3 things you'd bring to a desert island", "Name 3 things you'd leave behind"],
    ["Name 3 ways to spend a million dollars", "Name 3 ways to waste money"],
    ["Name 3 things you'd do with extra time", "Name 3 things you'd do with no time left"],
    ["Name 3 things you'd change about yourself", "Name 3 things you'd never change"],
  ],
  embarrassing: [
    ["Name 3 things you've googled in private", "Name 3 awkward first-date topics"],
    ["Name 3 texts you regret sending", "Name 3 things you've said to the wrong person"],
    ["Name 3 times you've tripped in public", "Name 3 times you've laughed at the wrong moment"],
    ["Name 3 things in your search history", "Name 3 things in your camera roll"],
    ["Name 3 nicknames you hate", "Name 3 things you've pretended to like"],
    ["Name 3 autocorrect fails", "Name 3 voice message regrets"],
    ["Name 3 things you've done while drunk", "Name 3 things you've blamed on someone else"],
    ["Name 3 embarrassing childhood memories", "Name 3 embarrassing parent moments"],
    ["Name 3 things you've walked into", "Name 3 things you've spilled on yourself"],
    ["Name 3 things you've lied about on social media", "Name 3 things you've deleted"],
  ],
  dating: [
    ["Name 3 red flags on a first date", "Name 3 green flags on a first date"],
    ["Name 3 pickup lines that never work", "Name 3 compliments that sound creepy"],
    ["Name 3 places for a first date", "Name 3 places to avoid on a first date"],
    ["Name 3 reasons you'd swipe left", "Name 3 reasons you'd swipe right"],
    ["Name 3 things that kill romance", "Name 3 things that spark romance"],
    ["Name 3 dating app bios you've seen", "Name 3 dating app red flags"],
    ["Name 3 things you'd never tell a date", "Name 3 things you overshare"],
    ["Name 3 exes you'd avoid", "Name 3 qualities in a partner"],
    ["Name 3 things you'd do for love", "Name 3 things you'd never do for love"],
    ["Name 3 relationship dealbreakers", "Name 3 relationship green flags"],
  ],
  party: [
    ["Name 3 drinks you'd order at a bar", "Name 3 excuses to leave a party early"],
    ["Name 3 things you'd do after midnight", "Name 3 things you'd never do sober"],
    ["Name 3 bar games you'd dominate", "Name 3 things you've lost at a party"],
    ["Name 3 hangover cures that don't work", "Name 3 party themes"],
    ["Name 3 things you'd blame on alcohol", "Name 3 things you'd never blame on alcohol"],
    ["Name 3 party snacks", "Name 3 party playlists"],
    ["Name 3 things you'd find at a house party", "Name 3 things you'd find at a club"],
    ["Name 3 drinking games", "Name 3 party fouls"],
    ["Name 3 things you'd do when someone else is paying", "Name 3 things you'd never order"],
    ["Name 3 ways to start a conversation at a party", "Name 3 ways to end one"],
  ],
  adults_only: [
    ["Name 3 lies you've told your boss", "Name 3 lies you've told your parents"],
    ["Name 3 guilty pleasures after 30", "Name 3 things you'd never tell your partner"],
    ["Name 3 purchases you'd hide", "Name 3 excuses you've used to cancel plans"],
    ["Name 3 things you've pretended to like for someone", "Name 3 things you've faked"],
    ["Name 3 people you'd never invite to your wedding", "Name 3 people you'd invite to everything"],
    ["Name 3 things you've done in a bathroom you shouldn't", "Name 3 things you've done at work you shouldn't"],
    ["Name 3 lies on your resume", "Name 3 secrets you'd take to the grave"],
    ["Name 3 things you'd do differently", "Name 3 things you have no regrets about"],
    ["Name 3 things you've googled at work", "Name 3 things you've deleted from your phone"],
    ["Name 3 habits you'd never admit", "Name 3 opinions you'd never share at dinner"],
  ],
  spicy: [
    ["Name 3 things that kill the mood", "Name 3 turn-ons you're embarrassed to admit"],
    ["Name 3 places you'd kiss someone", "Name 3 pickup lines that backfired"],
    ["Name 3 things that sound romantic but aren't", "Name 3 things that sound weird but work"],
    ["Name 3 songs for a romantic playlist", "Name 3 songs that ruin the moment"],
    ["Name 3 compliments that went too far", "Name 3 things you'd whisper"],
    ["Name 3 reasons to leave a date", "Name 3 reasons to stay"],
    ["Name 3 things that are overrated in dating", "Name 3 things that are underrated"],
    ["Name 3 flirting mistakes", "Name 3 flirting wins"],
    ["Name 3 things you'd never post about your relationship", "Name 3 things you overshare about it"],
    ["Name 3 things that make you blush", "Name 3 things that make you cringe"],
  ],
  crazy: [
    ["Name 3 things you'd do for a million dollars", "Name 3 things you wouldn't do for any amount"],
    ["Name 3 rules you'd break if nobody knew", "Name 3 dares you'd actually accept"],
    ["Name 3 pranks that went too far", "Name 3 bets you'd never make again"],
    ["Name 3 things on your bucket list", "Name 3 things you're too scared to try"],
    ["Name 3 things you'd do on a dare", "Name 3 things you'd never do on a dare"],
    ["Name 3 chaos moves at a party", "Name 3 ways to get kicked out"],
    ["Name 3 things you've done on impulse", "Name 3 things you've regretted immediately"],
    ["Name 3 wild stories you'd tell", "Name 3 wild stories you'd never tell"],
    ["Name 3 things that seemed like a good idea", "Name 3 things that definitely weren't"],
    ["Name 3 risks worth taking", "Name 3 risks never worth taking"],
  ],
  nsfw_adjacent: [
    ["Name 3 things that sound dirty but aren't", "Name 3 words you shouldn't say during a toast"],
    ["Name 3 bedroom mood killers", "Name 3 things you'd blame on the alcohol"],
    ["Name 3 things that are awkward to explain", "Name 3 things that are awkward to witness"],
    ["Name 3 habits that drive people crazy", "Name 3 habits you won't admit you have"],
    ["Name 3 things you'd never google at work", "Name 3 things you've accidentally sent to the wrong person"],
    ["Name 3 things that are funnier after midnight", "Name 3 things that are worse after midnight"],
    ["Name 3 things you'd never admit out loud", "Name 3 things everyone thinks but won't say"],
    ["Name 3 party topics that go too far", "Name 3 party topics that always land"],
    ["Name 3 things you'd delete if someone checked your phone", "Name 3 things you'd proudly show"],
    ["Name 3 things that are fine in private", "Name 3 things that are never fine in public"],
  ],
};

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

export function buildDeck(): GameCard[] {
  const cards: GameCard[] = [];
  let id = 0;

  for (const category of ALL_CATEGORIES) {
    const pairs = PROMPT_PAIRS[category] ?? [];
    const rating = CATEGORY_DEFAULT_RATING[category] ?? "family";

    for (let i = 0; i < pairs.length; i++) {
      const [sideA, sideB] = pairs[i];
      const difficulty = (i % 5) + 1;
      cards.push({
        id: `${category}-${String(i + 1).padStart(3, "0")}`,
        sideA,
        sideB,
        category,
        rating,
        difficulty,
        tags: [category],
        enabled: true,
      });
      id++;
    }
  }

  return cards;
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

export function shuffleDeck(cards: GameCard[], seed: string): GameCard[] {
  return seededShuffle(cards, seed);
}

export function getCardById(cards: GameCard[], id: string): GameCard | undefined {
  return cards.find((c) => c.id === id);
}
