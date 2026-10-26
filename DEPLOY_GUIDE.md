# BondhuMeter — Complete Deployment Guide
### Put your website on your domain: `bondhumeter.dpdns.org`

Total cost: **0 BDT**. Total time: **about 30–40 minutes**.
You need: this project folder, a free GitHub account, a free Vercel account, a free Neon account, and your DigitalPlat dashboard.

---

## The big picture

A website needs 3 things to go live on your domain:

| Piece | What it is | We use | Cost |
|---|---|---|---|
| **Domain** | The address people type | `bondhumeter.dpdns.org` | Free (DigitalPlat) |
| **Hosting** | The computer that runs the website | Vercel | Free |
| **Database** | Where users, quizzes, visits are saved | Neon Postgres | Free |

Flow: **GitHub (your code) → Vercel (runs the app) → Neon (saves the data) → DigitalPlat DNS (points your domain at Vercel).**

---

## Part 1 — Create the free database (Neon)

The website currently uses a local SQLite file. Hosting on the internet needs a real database. Neon gives one free.

1. Go to **https://neon.tech** → **Sign Up** (use Google — fastest).
2. Click **Create project** (name: `bondhumeter`). Region: choose the one closest to Bangladesh, e.g. *Singapore*.
3. On the dashboard, find **Connection string** and click the copy icon.
   It looks like:
   `postgresql://neondb_owner:LONGPASSWORD@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
4. **Keep this tab open.** You will paste this string in Part 3.

> Treat this string like a password — never share it publicly.

---

## Part 2 — Put the code on GitHub

GitHub stores your website's code and lets Vercel read it.

**Easiest way (no commands):**
1. Create a free account at **https://github.com** (if you don't have one).
2. Click the **+** (top right) → **New repository** → name it `bondhumeter` → keep it **Private** or Public (either is fine) → **Create repository**.
3. On the new repo page click **uploading an existing file**.
4. Unzip `bondhumeter-website.zip` on your computer, then **drag the whole folder's contents** into the GitHub upload area.
   (If GitHub complains about the 100-file drag limit, drag in 2–3 batches, then click **Commit changes**.)
5. Done — your code is on GitHub.

**Alternative (GitHub Desktop app):** install GitHub Desktop → *File → Add local repository* → select the unzipped folder → *Publish repository*. Done.

---

## Part 3 — Deploy on Vercel

1. Go to **https://vercel.com** → **Sign Up with GitHub** (same account — this connects them automatically).
2. Click **Add New… → Project** → find `bondhumeter` in the list → **Import**.
3. Vercel auto-detects Next.js. Before pressing Deploy, open **Environment Variables** and add these:

| Name | Value |
|---|---|
| `DATABASE_URL` | the Neon connection string from Part 1 |
| `AUTH_SECRET` | any long random text — generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_PASSWORD` | the password YOU want for the admin control room |
| `GOOGLE_CLIENT_ID` | *(optional — leave out to skip Google login)* |
| `GOOGLE_CLIENT_SECRET` | *(optional)* |

4. Press **Deploy**. Wait 2–4 minutes.
   The build automatically: switches the database to Postgres → creates all tables → seeds the demo quiz → compiles the site.
5. When it finishes you get a temporary address like `bondhumeter-xxxx.vercel.app`. **Open it — the website is already live!** (Your custom domain comes in Part 4.)

> If the build fails with a message about `DATABASE_URL`, you skipped step 3 — add the variables, then *Deployments → ⋯ → Redeploy*.

---

## Part 4 — Connect `bondhumeter.dpdns.org`

### 4a. Add the domain in Vercel
1. Vercel → your project → **Settings → Domains**.
2. Type `bondhumeter.dpdns.org` → **Add**.
3. Vercel shows you exactly which DNS records it needs. It will look like this:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` *(use the exact value Vercel's card shows — some projects get a different IP like `216.198.79.x`)* |
| `CNAME` | `www` | `cname.vercel-dns.com` *(or the exact target Vercel shows)* |

### 4b. Add those records in DigitalPlat
1. Open your DigitalPlat dashboard → **bondhumeter.dpdns.org** → the **DNS records** tab (the one in your screenshot).
2. Click **Add record**:
   - Record 1: Type **A**, Name/Host **@** (or empty), Value **the IP from Vercel**, TTL default → Save.
   - Record 2: Type **CNAME**, Name **www**, Value **the CNAME target from Vercel** → Save.
3. If the panel offers **WHOIS Privacy**, enable it (hides your personal info — it's free).

### 4c. Wait, then celebrate
- DNS propagation: usually **5–30 minutes**, sometimes up to a few hours.
- Vercel's Domain page will flip from *Pending* to **Valid Configuration**, and an HTTPS certificate is issued **automatically** (free, auto-renewing).
- Open **https://bondhumeter.dpdns.org** — that is your website, on your domain, with the lock icon.

---

## Part 5 — Check everything works

| Check | How |
|---|---|
| Home loads | open the domain in browser + on phone |
| Create account | sign up with email + password |
| Make a quiz | dashboard → create → publish → copy link |
| Friend plays | open the share link in an incognito window |
| Share card | paste the quiz link into a WhatsApp chat — the branded card should appear |
| Admin room | website footer → Admin → your `ADMIN_PASSWORD` |
| Visitor tracking | open the site in incognito → Admin → Visitors shows the visit with IP, city, ISP, device |

---

## Part 6 — After launch

- **Renew the domain (important!)** Free DigitalPlat domains expire — yours expires **2027-10-26**. Renew from the **Renew** tab in the same dashboard before that date. Set a phone reminder for **September 2027**.
- **Google login (optional):** follow `GOOGLE_SETUP.md`; when creating the OAuth client, use redirect URI `https://bondhumeter.dpdns.org/api/auth/google/callback`, then add the two env vars in Vercel and redeploy.
- **Updating the website later:** edit code → push to GitHub (upload changed files or GitHub Desktop → Commit + Push) → Vercel redeploys automatically in ~2 minutes. Your data and settings stay safe.
- **Site appearance, fonts, demo questions, admin contact link:** all editable live from **Admin Control Room → Settings** — no redeploy needed.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build error: `DATABASE_URL is missing` | Add the Neon string in Vercel → Settings → Environment Variables → Redeploy |
| Domain shows *Invalid Configuration* in Vercel | The DNS records don't match — copy the exact values from Vercel's domain card again, delete wrong records, wait 10 min |
| Site opens without the lock icon | Vercel is still issuing the SSL certificate — wait up to 30 min, it's automatic |
| "Too many requests" on login | Anti-brute-force protection — wait a minute and try again |
| Leaderboard/settings empty on a fresh deploy | Normal — data starts collecting from your first visitor |
| Forgot admin password | Vercel → Settings → Environment Variables → change `ADMIN_PASSWORD` → Redeploy |
