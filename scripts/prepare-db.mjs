/**
 * prepare-db.mjs — runs at the start of `npm run build` (local AND Vercel).
 *
 * Chooses the Prisma provider from DATABASE_URL:
 *   postgresql://...  →  provider = "postgresql"  (production, e.g. Neon)
 *   file:... / unset  →  provider = "sqlite"      (local development)
 *
 * On Vercel a Postgres URL is REQUIRED (serverless has no writable disk),
 * so we fail the build with friendly instructions instead of a mystery error.
 */
import fs from "fs";

const SCHEMA = "prisma/schema.prisma";
const raw = fs.readFileSync(SCHEMA, "utf8");

// 1. Find DATABASE_URL: real env first, then local .env file.
let url = process.env.DATABASE_URL || "";
if (!url) {
  try {
    const env = fs.readFileSync(".env", "utf8");
    const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
    if (m) url = m[1].trim();
  } catch {
    /* no .env — fine */
  }
}

const isPg = /^postgres/i.test(url);
const provider = isPg ? "postgresql" : "sqlite";

// 2. Vercel needs a real database — fail loudly and helpfully.
if (process.env.VERCEL && !isPg) {
  console.error(
    [
      "",
      "[prepare-db]  DATABASE_URL is missing or is not a Postgres URL.",
      "",
      "BondhuMeter keeps users, quizzes, attempts, visitors and settings",
      "in a database. On Vercel you need a free Postgres database:",
      "",
      "  1. Go to https://neon.tech  →  Sign up (free, no card)",
      "  2. Create a project  →  copy the connection string",
      "     (it looks like postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require)",
      "  3. In Vercel: your Project → Settings → Environment Variables",
      "     Name:  DATABASE_URL",
      "     Value: paste the connection string (Production + Preview + Development)",
      "  4. Redeploy (Deployments → latest → Redeploy).",
      "",
    ].join("\n")
  );
  process.exit(1);
}

// 3. Rewrite the provider line in schema.prisma (only the datasource block
//    matches — the generator block uses "prisma-client-js").
const updated = raw.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${provider}"`
);
if (updated !== raw) fs.writeFileSync(SCHEMA, updated);

console.log(
  `[prepare-db] provider=${provider} (DATABASE_URL ${
    url ? "found" : "not set — using local SQLite default"
  })`
);
