# Melow — Investor & Advisor Intro Portal

A private, Melow-branded portal where investors, advisors, partners, and friendly operators can log in to:

1. Watch and share Melow intro videos
2. See which ICP titles, company profiles, and target accounts matter most
3. Copy links to sales materials (decks, case studies, one-pagers, PDFs)
4. Copy ready-to-send intro blurbs

Admins manage users, invites, and every piece of portal content from an in-app dashboard — no code changes needed.

## Stack

- **Next.js (App Router) + TypeScript** — pages and server actions, no separate API layer
- **Tailwind CSS 4** — Melow dark/gold theme defined in `src/app/globals.css`
- **Prisma + SQLite** — swap `DATABASE_URL` for a hosted DB (e.g. Postgres + a one-line provider change in `prisma/schema.prisma`) when deploying
- **Auth** — email/password (bcrypt) with signed JWT session cookies (`jose`); revocation is checked against the database on every request
- **Email** — provider-agnostic invite emails via a Resend-compatible HTTP API (optional; invite links always work without it)

## Getting started

```bash
npm install
cp .env.example .env       # then fill in the values (see below)
npm run db:migrate         # create the SQLite database
npm run db:seed            # create the first admin + placeholder content
npm run dev                # http://localhost:3000
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Database connection (default `file:./dev.db`) |
| `AUTH_SECRET` | Session-cookie signing secret — generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Base URL used to build invite links |
| `ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD` | First admin account, created by `npm run db:seed` |
| `EMAIL_API_KEY` | Optional — Resend API key for sending invite emails |
| `EMAIL_FROM` | From address for invite emails |

### Creating the first admin

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, then run `npm run db:seed`. The seed is idempotent — it skips anything that already exists. Additional admins can be invited from **Admin → Invites** with the role set to "Admin".

## How it works

| Route | Who | What |
| --- | --- | --- |
| `/login` | public | Sign in |
| `/invite/[token]` | public | Accept an invite and create an account |
| `/portal` | signed in | The four-block intro portal |
| `/materials/[id]` | signed in | Embedded PDF preview / external-link redirect |
| `/admin` | admins | Overview stats + 30-day activity |
| `/admin/users` | admins | Change roles, revoke/reactivate, delete |
| `/admin/invites` | admins | Create/copy/revoke invite links, send invite emails |
| `/admin/content` | admins | Manage videos, ICP cards, account lists, materials, blurbs (create / edit / reorder / publish / delete) |

Sales materials are URL-based: paste any hosted, shareable file URL (e.g. a public PDF) and it is embedded in the in-portal preview; "Copy link" copies the shareable URL directly. Link-type materials open the external URL.

## Content editing tips

- **ICP cards** — one bullet per line
- **Account lists** — one company per line; line order is display order
- **Videos** — YouTube, Vimeo, and Loom URLs embed automatically (click-to-play)

## Deploying

Any Node host works (Vercel, Fly, Railway, a VPS). Remember to:

1. Use a persistent database (`DATABASE_URL`) — SQLite on ephemeral file systems will lose data
2. Set all env vars, with `NEXT_PUBLIC_APP_URL` pointing at the deployed domain
3. Run `npm run db:deploy && npm run db:seed` once against the production database
