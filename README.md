# BondhuMeter

**How well do your friends know you?** — a fun quiz platform.
You build a secret quiz about yourself, share one link, and friends test how well they really know you. Server-scored, cheat-proof, with viral share cards, leaderboards and a full admin control room with silent visitor analytics.

- Live on your domain in ~30 minutes → see **DEPLOY_GUIDE.md** (free: Vercel + Neon + DigitalPlat domain)
- Google login setup (optional) → **GOOGLE_SETUP.md**

## Local development

```bash
npm install          # or: bun install
cp .env.example .env # then fill AUTH_SECRET + ADMIN_PASSWORD
npm run db:push      # create local SQLite database
npm run dev          # http://localhost:3000
```

## Production build

```bash
npm run build   # auto-detects DATABASE_URL: postgres → prod, else local SQLite
npm start       # self-hosting (standalone). On Vercel just push — it deploys itself.
```

## Feature map

| Area | Where |
|---|---|
| Quiz builder, share, play, results | `src/components/bondhu/` |
| API (auth, quizzes, scoring, tracking, admin) | `src/app/api/` |
| Share-card generator (OG images) | `src/app/api/og/route.tsx` |
| Admin-editable site settings (accent, fonts, demo questions) | `src/lib/settings.ts` |
| Anti-cheat server-side scoring | `src/app/api/quiz/[code]/submit` |
| Silent visitor analytics (IP, geo, ISP, device) | `src/lib/geo.ts`, `src/lib/ua.ts`, `/api/track` |

Stack: Next.js 16 · TypeScript · Tailwind 4 · Prisma (SQLite local / Postgres prod) · zero-emoji custom SVG brand system.
