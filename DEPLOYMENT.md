# Deployment Guide — Vercel

Production-ready deployment steps for the Fresh Solutions website + management platform. The app is Next.js 15 (App Router) and deploys on Vercel with standard settings — **no custom build commands or `vercel.json` are required**. What you MUST configure before the first deploy is infrastructure: a production database and production file storage. Both are deliberately refused by the app if missing (it fails loudly instead of silently losing data).

---

## 1. Pre-flight checklist (do these first)

| # | Item | Required? | Why |
|---|------|-----------|-----|
| 1 | Managed PostgreSQL database (Supabase, Neon, Vercel Postgres, RDS…) | ✅ Yes | The app refuses to start on Vercel without `DATABASE_URL` (embedded dev Postgres is disabled on Vercel by design so no data is silently lost). |
| 2 | S3-compatible object storage with 2 buckets (private + public) | ✅ Yes for file features | Vercel's filesystem is ephemeral — uploads would vanish on every deploy. Without S3 config, file upload features stay off; core pages still work. |
| 3 | `SITE_URL` set to your production URL | ✅ Yes | Canonical URLs, sitemap, OG metadata, and links inside emails. |
| 4 | SMTP credentials (Resend, SMTP2GO, Brevo, SES…) | ⭕ Optional | If unset, email stays disabled and the admin UI honestly shows "not configured" on every relevant action. |
| 5 | `FILE_TOKEN_SECRET` | ⭕ Optional | Only signs short-lived download URLs for the *local* storage driver. Inert when S3 is configured. Generate with `openssl rand -hex 32` if you want it pinned. |

Supabase covers both items 1 and 2 in one account: a Postgres database plus S3-compatible Storage. Free-tier suggestions (verify current limits before committing): **Supabase** or **Neon** free Postgres, **Cloudflare R2** free-tier object storage, **Brevo/SMTP2GO** free SMTP relays.

---

## 2. Create the database (Supabase)

1. Create a Supabase project (save the DB password when prompted).
2. Vercel/serverless traffic should use the **connection pooler**: Supabase → Connect → **Transaction pooler** — a `postgresql://` string on port `6543`. The **direct** string (port 5432) also works but free-tier direct connections are capped.
3. **Migrations run automatically**: the app applies `db/migrations` idempotently on first database access, so there is no separate migrate step on Vercel. You can also run them explicitly from your machine with `DATABASE_URL=… npm run db:migrate` (prefer the *direct* string for this one-off DDL job).
4. If the connection string contains `@ # / $ ?` in the password, URL-encode them (`@` → `%40`, …) or reset the DB password to letters+numbers.

> In local development, leave `DATABASE_URL` empty to use the embedded real-Postgres engine (PGlite). Never point local dev at the production database.

## 3. Create file storage (Supabase Storage)

1. Storage → New bucket, twice: `fresh-solutions-private` (Public toggle OFF — CVs/attachments) and `fresh-solutions-public` (Public toggle ON).
2. Settings → Storage → **S3 connection / Access Keys** → New access key → copy Key ID + Secret.
3. Env values:
   - `S3_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3`
   - `S3_REGION=<your project region>` (Settings → General; Supabase's S3 API rejects `auto`)
   - `S3_FORCE_PATH_STYLE=true`

Files are never exposed on direct public URLs: private files use short-lived **presigned URLs**; public files are served via presigned redirects. Repair tracking reveals statuses only with reference + access code; guessing IDs cannot enumerate anything.

## 4. Configure Vercel project

1. Vercel → **Add New → Project** → import `heisnature1/Fresh_solutions`.
2. Framework preset is auto-detected as **Next.js**. Leave build/install commands at defaults. Root directory = repository root.
3. Node version: Next 15 requires Node ≥ 18.18 — Vercel's default (Node 22) is fine.
4. **Environment variables** (Production, and Preview if you want staging to work):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase pooler string from step 2 |
| `SITE_URL` | `https://your-domain.vercel.app` (update after adding a custom domain) |
| `S3_ENDPOINT` / `S3_REGION` / `S3_FORCE_PATH_STYLE` | from step 3 |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | from step 3 |
| `S3_BUCKET_PRIVATE` / `S3_BUCKET_PUBLIC` | bucket names |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | e.g. `smtp-relay.brevo.com` / `587` / `false` |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials |
| `SMTP_FROM` | `Fresh Solutions <no-reply@yourdomain>` |
| `ADMIN_NOTIFY_EMAIL` | where new-inquiry/repair notifications go |
| `SESSION_TTL_HOURS` | optional, default `12` |

Variables NOT needed on Vercel: `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` (only used by the local provisioning script), `FILE_TOKEN_SECRET`, `LOCAL_DATA_DIR` (dev only). Supabase publishable/anon keys are **not used at all** — the app speaks Postgres + S3 directly.

5. Deploy. The first request to any data-backed page runs migrations automatically; expect the very first cold start to take a few extra seconds.

> **Preview deployments share production data unless you set different values for the Preview environment.** Recommended: a separate Supabase project (db + buckets) for previews.

## 5. Provision the owner account (one-time, after first deploy)

There is intentionally **no public registration route**. Run from your own machine against the production database:

```bash
git clone https://github.com/heisnature1/Fresh_solutions && cd Fresh_solutions && npm ci
DATABASE_URL="postgresql://postgres:…@…/postgres" \
ADMIN_EMAIL="you@example.com" \
ADMIN_PASSWORD="a-strong-passphrase" \
ADMIN_NAME="Your Name" \
npm run provision:admin
```

Then log in at `https://your-site/admin`. To reset a lost password later, re-run the same command with `--reset-password`. Password policy: ≥12 chars, lower+upper, number.

## 6. Post-deploy hygiene

- **Do not run `npm run db:seed` against production** — the seed contains sample content for local development only.
- In **Admin → Website settings**, set the real company name/email/phone/address and — when you have them — paste your reviewed Privacy Policy and Terms of Service text. Until then the legal pages display an honest "template placeholders" notice (no fabricated legal text).
- Upload the real logo in Settings if you have one; the bundled mark is a clearly-labelled temporary placeholder.
- Add a custom domain in Vercel → Domains, then update `SITE_URL` to match (affects canonical URLs + sitemap + emails), and set up the SMTP sender domain (SPF/DKIM) so quote/proposal emails don't get spam-flagged.
- Vercel → Analytics/Speed Insights are optional; the app ships no client-side tracking by itself.

## 7. Known platform constraints (by design, documented honestly)

- **In-memory rate limiting is best-effort on serverless** — each function instance keeps its own counters, so limits are approximate across instances. For strict limits later, move `lib/ratelimit.ts` to Redis/Upstash (interface unchanged).
- **Sessions are DB-backed** (server-validated rows, 12 h default), so they survive cold starts and function instances — good.
- **Cold start**: first request after idleness runs the migration check (+1–3 s). You can warm it with a Vercel Cron hitting `/` if it bothers you.
- Careful with **connection limits**: the app opens a small pool (max 5) per function instance. Prefer the pooled connection string (Supabase Supavisor transaction mode, Neon pooler, PgBouncer).
- **No online payments, customer accounts, or public AI chatbot** in this MVP — by scope decision.

## 8. Redeploy / rollback

- Every push to a branch creates a Preview deployment; merging to `main` promotes to Production.
- Roll back in Vercel → Deployments → **⋯ → Promote** an older production deployment. Database schema is forward-migration only — do not roll back code across schema migrations without planning.
