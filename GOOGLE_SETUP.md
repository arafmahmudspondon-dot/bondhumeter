# 🔐 Enable real Google Login on BondhuMeter (5 minutes)

Google sign-in is **already fully coded** into the website. It stays hidden until you
paste your own Google credentials into the `.env` file. As soon as both values exist,
the sign-in page automatically shows the **“Continue with Google”** button — no code
changes needed.

## Step 1 — Create the OAuth credentials in Google Cloud

1. Open <https://console.cloud.google.com/> and sign in with your Google account.
2. Top-left → **Create Project** → name it `BondhuMeter` → **Create**.
3. In the sidebar: **APIs & Services → OAuth consent screen**
   - User type: **External** → **Create**
   - App name: `BondhuMeter`, choose your support email
   - **Audience → Add users**: add your own Gmail so you can test while the app is in *Testing* mode
   - Save. (You can “Publish app” later to allow anyone to sign in.)
4. Sidebar: **APIs & Services → Credentials → + Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins** — add every address your site is opened from, e.g.:
     - `http://localhost:3000`
     - your live site origin, e.g. `https://your-site.example.com`
   - **Authorized redirect URIs** — add the same origins + this exact path:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://your-site.example.com/api/auth/google/callback`
     > ⚠️ The redirect URI must match **character-for-character** (no trailing slash),
     > or Google shows `redirect_uri_mismatch`.
5. Click **Create** — a dialog shows the **Client ID** and **Client Secret**. Copy both.

## Step 2 — Paste them into `.env`

Open `/home/z/my-project/.env` and fill the two empty values:

```env
GOOGLE_CLIENT_ID=1234567890-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
```

## Step 3 — Restart the server

Stop the dev server and start it again (env vars are read at startup).
The **Sign in** page will now show the Google button, and visits/quiz data
automatically link to the Google account of whoever signs in — visible in the
Admin Control Room.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `redirect_uri_mismatch` | The origin/port/path in Google Console doesn't exactly match the address you're visiting. Copy the exact URI from the browser error message into the console list. |
| `access_blocked: app not verified` | Add yourself under **Test users** in the OAuth consent screen, or press *Advanced → Go to app (unsafe)* while testing. |
| Google button still missing | Both `GOOGLE_CLIENT_ID` **and** `GOOGLE_CLIENT_SECRET` must be non-empty, and the server must be restarted. |
| `invalid_client` | Client secret copied incorrectly — re-copy it (it starts with `GOCSPX-`). |

## Notes

- Email sign-in keeps working side-by-side — users choose either method.
- If someone previously played quizzes with email sign-in using the **same email**
  as their Google account, the visits are linked to the same user automatically.
