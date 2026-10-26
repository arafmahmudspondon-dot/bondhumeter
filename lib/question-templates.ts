/**
 * Ready-made question templates for the quiz builder — rewritten for
 * quality: specific, funny, personality-driven options that make the
 * score feel personal. No emojis anywhere — category tiles use brand
 * SVG icons instead. Also seeds the public demo quiz (DEMO001).
 * Plain TS — safe on server and client.
 */

export type TemplateCategory =
  | "food"
  | "personality"
  | "friendship"
  | "love"
  | "habits"
  | "random";

/** lucide-react icon names — mapped to real icons in the builder UI. */
export const CATEGORY_ICON: Record<TemplateCategory, string> = {
  food: "UtensilsCrossed",
  personality: "Drama",
  friendship: "HeartHandshake",
  love: "Heart",
  habits: "AlarmClock",
  random: "Dices",
};

export const CATEGORY_META: Record<TemplateCategory, { label: string }> = {
  food: { label: "Food & Taste" },
  personality: { label: "Personality" },
  friendship: { label: "Friendship" },
  love: { label: "Love & Crush" },
  habits: { label: "Habits & Quirks" },
  random: { label: "Random Fun" },
};

export interface QuestionTemplate {
  text: string;
  options: string[];
  category: TemplateCategory;
}

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  /* ---------- food ---------- */
  {
    category: "food",
    text: "My last meal on Earth would be…",
    options: ["Kacchi Biryani", "Beef tehari", "Momos", "A double cheeseburger"],
  },
  {
    category: "food",
    text: "I can never say no to…",
    options: ["Sweets", "Cha (tea)", "Street fuchka", "Cold coffee"],
  },
  {
    category: "food",
    text: "My midnight snack of choice?",
    options: ["Instant noodles", "Chips & chanachur", "Ice cream from the fridge", "Leftover rice and achar"],
  },
  {
    category: "food",
    text: "Rainy day comfort food for me is…",
    options: ["Khichuri with beef", "Piaju and beguni", "Fried rice", "Hot chocolate"],
  },
  {
    category: "food",
    text: "Which one would I actually finish first?",
    options: ["A whole pizza", "A box of mishti", "A plate of fuchka", "A bucket of fried chicken"],
  },

  /* ---------- personality ---------- */
  {
    category: "personality",
    text: "My friends would describe me in ONE word…",
    options: ["Crazy", "Loyal", "Genius", "Drama queen"],
  },
  {
    category: "personality",
    text: "My biggest fear is…",
    options: ["Losing my family", "Lizards and insects", "Public speaking", "Failing my goals"],
  },
  {
    category: "personality",
    text: "I do my best work…",
    options: ["After midnight", "At sunrise", "Under pressure", "Never — I procrastinate"],
  },
  {
    category: "personality",
    text: "When I'm angry, I usually…",
    options: ["Go completely silent", "Snap fast, cool fast", "Cry it out alone", "Post a cryptic status"],
  },
  {
    category: "personality",
    text: "If I got scolded for no reason, I would…",
    options: ["Argue back instantly", "Walk away quietly", "Cry later in private", "Roast them with sarcasm"],
  },
  {
    category: "personality",
    text: "My hidden talent nobody believes is…",
    options: ["Singing in the shower", "Perfect memory for songs", "Sleeping anywhere, anytime", "Winning every argument"],
  },

  /* ---------- friendship ---------- */
  {
    category: "friendship",
    text: "Who knows my deepest secret?",
    options: ["My bestie", "My mom", "Nobody at all", "My private notes app"],
  },
  {
    category: "friendship",
    text: "My perfect hangout with friends?",
    options: ["Café hopping", "A late-night walk", "Gaming till 4am", "Movie marathon with snacks"],
  },
  {
    category: "friendship",
    text: "How do I actually text?",
    options: ["Long paragraphs", "One-word replies", "Only memes and stickers", "Voice notes always"],
  },
  {
    category: "friendship",
    text: "If I won 1 crore taka tonight, first thing I'd do…",
    options: ["Travel the world", "Buy my dream setup", "Gift my parents", "Invest and act normal"],
  },
  {
    category: "friendship",
    text: "The friend I call first with good news?",
    options: ["My childhood bestie", "My group chat", "My mom", "I post it online first"],
  },
  {
    category: "friendship",
    text: "If a friend owes me 100 taka, I…",
    options: ["Totally forget it", "Remind them daily", "Drop hints with memes", "Make them buy food instead"],
  },

  /* ---------- love ---------- */
  {
    category: "love",
    text: "My celebrity crush is…",
    options: ["A Bollywood star", "A Hollywood star", "A K-drama actor", "A cricketer"],
  },
  {
    category: "love",
    text: "Do I believe in love at first sight?",
    options: ["Absolutely", "Maybe — 50/50", "Not at all", "Only for biryani"],
  },
  {
    category: "love",
    text: "My ideal type is someone who is…",
    options: ["Funny", "Smart", "Kind-hearted", "Tall and good-looking"],
  },
  {
    category: "love",
    text: "My relationship status right now…",
    options: ["Single and happy", "Taken", "It's complicated", "Married to my phone"],
  },
  {
    category: "love",
    text: "If someone confessed to me today, I'd…",
    options: ["Blush and panic", "Play it cool", "Change the topic", "Say yes immediately"],
  },
  {
    category: "love",
    text: "My idea of a perfect date is…",
    options: ["Street food walk", "Cinema and dinner", "Stargazing on a rooftop", "Long drive with songs"],
  },

  /* ---------- habits ---------- */
  {
    category: "habits",
    text: "How many alarms do I need to wake up?",
    options: ["Just 1 — I'm built different", "Around 3", "At least 10", "Nobody truly knows"],
  },
  {
    category: "habits",
    text: "The first thing I check in the morning…",
    options: ["Phone notifications", "The mirror", "The fridge", "Nothing — I sleep again"],
  },
  {
    category: "habits",
    text: "When I'm nervous, I…",
    options: ["Bite my nails", "Talk too much", "Laugh at random things", "Go totally quiet"],
  },
  {
    category: "habits",
    text: "I always forget to…",
    options: ["Reply to texts", "Carry my charger", "Eat on time", "Where I put my keys"],
  },
  {
    category: "habits",
    text: "My screen time on a lazy day is…",
    options: ["Under 3 hours — I'm normal", "5 hours, tops", "8 hours, no shame", "We don't talk about it"],
  },
  {
    category: "habits",
    text: "My room is usually…",
    options: ["Spotless — always", "Organised chaos", "A disaster zone", "Clean only when guests come"],
  },

  /* ---------- random ---------- */
  {
    category: "random",
    text: "If I could teleport anywhere right now…",
    options: ["Sylhet tea gardens", "Cox's Bazar at sunset", "Paris", "Straight to my bed"],
  },
  {
    category: "random",
    text: "My dream superpower would be…",
    options: ["Reading minds", "Flying", "Time travel", "Invisibility"],
  },
  {
    category: "random",
    text: "If my life were a movie, it would be…",
    options: ["A comedy", "A thriller", "A rom-com", "A documentary about naps"],
  },
  {
    category: "random",
    text: "One thing I truly can't live without…",
    options: ["My phone", "My besties", "Internet", "Home food"],
  },
  {
    category: "random",
    text: "In a zombie apocalypse, my role would be…",
    options: ["The planner", "The fighter", "The snack keeper", "The first to panic"],
  },
  {
    category: "random",
    text: "Pick the one I'd survive without more easily:",
    options: ["Social media", "Sweets", "Music", "Air conditioning"],
  },
  {
    category: "random",
    text: "My spirit animal is closest to…",
    options: ["A cat — chill but moody", "A dog — loyal and loud", "An owl — awake all night", "A panda — eat and sleep"],
  },
];

/** Quick-start packs — tap once to load a themed set into the builder. */
export interface QuickPack {
  title: string;
  description: string;
  indices: number[];
}

export const QUICK_PACKS: QuickPack[] = [
  {
    title: "Foodie check",
    description: "Taste, snacks and comfort food",
    indices: [0, 1, 2, 3, 4],
  },
  {
    title: "Bestie test",
    description: "Secrets, hangouts and loyalty",
    indices: [10, 11, 12, 13, 14],
  },
  {
    title: "Crush alert",
    description: "Love, dates and confessions",
    indices: [16, 17, 18, 19, 20],
  },
  {
    title: "Know my quirks",
    description: "Daily habits nobody admits",
    indices: [22, 23, 24, 25, 26],
  },
  {
    title: "Total random",
    description: "Fun mixed bag, zero logic",
    indices: [28, 29, 30, 32, 33],
  },
];

/** Questions used to seed the always-available public demo quiz. */
export const DEMO_QUIZ = {
  code: "DEMO001",
  title: "How well do you know ME?",
  creatorName: "Team BondhuMeter",
  questions: [
    QUESTION_TEMPLATES[0], // last meal on earth
    QUESTION_TEMPLATES[5], // one word
    QUESTION_TEMPLATES[10], // deepest secret
    QUESTION_TEMPLATES[16], // celebrity crush
    QUESTION_TEMPLATES[22], // alarms
    QUESTION_TEMPLATES[28], // teleport
  ].map((tpl, i) => ({
    order: i,
    text: tpl.text,
    options: tpl.options,
    correctIndex: 0,
  })),
};
