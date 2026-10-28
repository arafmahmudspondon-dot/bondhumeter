/**
 * prepare-db.mjs (v2) — runs at the start of `npm run build` (local AND Vercel).
 *
 * Chooses the Prisma provider from DATABASE_URL:
 *   postgresql://...  →  provider = "postgresql"  (production, e.g. Neon)
 *   file:... / unset  →  provider = "sqlite"      (local development)
 *
 * v2: auto-cleans commonly botched pastes — wrapping quotes, `export ` /
 * `DATABASE_URL=` prefixes, or copying Neon's whole `psql "..."` snippet.
 * On Vercel, a missing Postgres URL fails the build with a self-diagnosis
 * checklist instead of a mystery error.
 */
import fs from "fs";

const SCHEMA = "prisma/schema.prisma";
const raw = fs.readFileSync(SCHEMA, "utf8");

function findDbUrl() {
  // 1. Read the raw value: real env var first, then local .env file.
  let value = process.env.DATABASE_URL || "";
  if (!value) {
    try {
      const env = fs.readFileSync(".env", "utf8");
      const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
      if (m) value = m[1].trim();
    } catch {
      /* no .env — fine */
    }
  }
  value = String(value || "").trim();
  // 2. Strip accidental prefixes people paste along with the URL.
  value = value
    .replace(/^export\s+/i, "")
    .replace(/^(DATABASE_URL|POSTGRES_URL)\s*=\s*/i, "");
  // 3. If a whole snippet was pasted (e.g. `psql "postgresql://..."`),
  //    extract just the URL itself.
  const match = value.match(/postgres(?:ql)?:\/\/[^\s"'`]+/i);
  if (match) return match[0];
  // 4. Otherwise strip wrapping quotes/spaces.
  return value.replace(/^["'`]+|["'`]+$/g, "").trim();
}

const url = findDbUrl();
const isPg = /^postgres/i.test(url);
const provider = isPg ? "postgresql" : "sqlite";

// On Vercel a real database is required — fail loudly and helpfully.
if (process.env.VERCEL && !isPg) {
  const hint = url
    ? `\nVercel DID find a DATABASE_URL, but it is not a Postgres URL.\nIt starts with: "${url.slice(0, 16)}" (length ${url.length})\n\nFix: Settings → Environment Variables → DATABASE_URL → Edit →\nreplace the value so it BEGINS with postgresql:// (nothing before it,\nno quotes, no DATABASE_URL= prefix).\n`
    : "";
  console.error(
    [
      "",
      "[prepare-db]  DATABASE_URL is missing or is not a Postgres URL.",
      "",
      hint +
        "Checklist — Vercel → your project → Settings → Environment Variables:\n" +
        "  1. Variable NAME is exactly:  DATABASE_URL   (all caps, underscore, no spaces)\n" +
        "  2. VALUE starts with:  postgresql://   (nothing before it)\n" +
        "     GOOD:  postgresql://neondb_owner:npg_xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require\n" +
        "     BAD:   DATABASE_URL=\"postgresql://...\"      <- whole snippet pasted\n" +
        "     BAD:   psql \"postgresql://...\"              <- copied the psql tab\n" +
        "     BAD:   \"postgresql://...\"                   <- quotes around it\n" +
        "  3. All three environments ticked: Production, Preview, Development\n" +
        "  4. After saving: Deployments → ... → Redeploy\n" +
        "",
      "No Neon database yet? Free at https://neon.tech — or use Vercel →\n" +
        "Storage tab → Marketplace → Neon (auto-wires everything, no copy-paste).\n",
    ].join("\n")
  );
  process.exit(1);
}

// Rewrite the provider line in schema.prisma (only the datasource block
// matches — the generator block uses "prisma-client-js").
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
