/**
 * seed-prod.mjs (v2) — runs after `prisma db push` inside the build.
 * On a FRESH database (Neon production OR a new local SQLite) it creates
 * the public demo quiz DEMO001 so the home page "Try the demo" pill works.
 * Already-seeded databases are skipped automatically.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const q = (text, options, correctIndex) => ({
  text,
  options: JSON.stringify(options),
  correctIndex,
});

const QUESTIONS = [
  q("What is my go-to comfort food?", ["Biriyani", "Chanachur", "Ice cream", "Magic noodles"], 0),
  q("Pick my dream travel spot.", ["Sajek Valley", "Cox's Bazar at sunset", "Paris", "Tokyo"], 1),
  q("What time do I usually sleep?", ["Before 10 PM", "Around midnight", "2 AM (send help)", "I never sleep"], 2),
  q("What is my phone's biggest fear?", ["Low battery", "Water", "Falling face-down", "My own pocket"], 3),
  q("My playlist is mostly...", ["Old classics", "Movie hits", "English pop", "Whatever the algorithm feeds me"], 3),
  q("If I got 1 crore taka tomorrow, the first thing I would do is...", ["Buy a bike", "Travel the world", "Save it all", "Treat my friends"], 1),
  q("How do I react to bad jokes?", ["Laugh loudly", "Fake smile", "Explain why it is not funny", "Send a better one"], 0),
  q("What is my biggest ick?", ["Slow internet", "One-word replies", "Chewing loudly", "Being late"], 1),
];

main()
  .catch((e) => console.error("[seed] skipped:", e?.message || e))
  .finally(() => db.$disconnect());

async function main() {
  const exists = await db.quiz.findUnique({ where: { code: "DEMO001" } });
  if (exists) {
    console.log("[seed] demo quiz DEMO001 already present");
    return;
  }
  await db.quiz.create({
    data: {
      code: "DEMO001",
      title: "How well do you really know me?",
      creatorName: "BondhuMeter",
      questions: { create: QUESTIONS.map((item, i) => ({ ...item, order: i })) },
    },
  });
  console.log("[seed] demo quiz DEMO001 created (8 questions)");
}
