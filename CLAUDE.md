# Melow Investor & Advisor Intro Portal

Public fundraise portal (Next.js App Router + Prisma/Postgres on Supabase, deployed on Vercel).
Live at: https://melow-investor-and-advisor-intros.vercel.app

- The portal (`/portal`, `/materials/[id]`) is **public**. Only `/admin` requires login.
- Content (videos, ICP cards, account lists, sales materials, blurbs) lives in the
  **database**, not in this repo — editing code does not change content.

## Updating portal content (the usual request)

When asked to add/edit/remove/reorder/publish portal content, use the agent content API.
It needs the `AGENT_API_TOKEN` secret — read it from the environment (`$AGENT_API_TOKEN`);
if it isn't set, ask the user for it rather than guessing.

```bash
BASE=https://melow-investor-and-advisor-intros.vercel.app

# 1. Always GET first — you need current ids and order
curl -s -H "Authorization: Bearer $AGENT_API_TOKEN" $BASE/api/agent/content

# 2. Apply changes (operations run in order; see src/app/api/agent/content/route.ts)
curl -s -X POST -H "Authorization: Bearer $AGENT_API_TOKEN" -H 'Content-Type: application/json' \
  -d '{"operations":[{"action":"update","entity":"blurb","id":"<id>","data":{"body":"…"}}]}' \
  $BASE/api/agent/content
```

Operations: `create` (entity, data), `update` (entity, id, data — only fields present in
`data` change), `delete` (entity, id), `publish` (entity, id, optional `published` bool),
`move` (entity, id, direction "up"|"down").
Entities: `video`, `icpBlock`, `accountList`, `salesMaterial`, `blurb`.
Account lists: pass `accounts` in `data` as an array of names (replaces the whole list in
order). ICP cards: `bullets` is one bullet per line in a single string.

After writing, GET again and confirm the change landed before reporting success.

## Code changes

- Develop on a feature branch, open a PR to `main`; Vercel auto-deploys `main`.
- The Vercel build runs `prisma migrate deploy && prisma db seed && next build`.
  The seed is idempotent and re-syncs the admin password from `ADMIN_PASSWORD`.
- Local dev needs Postgres; see README for env vars (`.env.example`).
- Run `npm run lint` and `npm run build` before pushing.

## Ops notes

- Admin login: `pepe@melow.ai` + the current `ADMIN_PASSWORD` env var in Vercel
  (changing the var + redeploying resets the password).
- Database: Supabase project `laqabhwelthdjpyuhonz` (Pro plan, us-east-1).
- Never commit secrets; they live in Vercel env vars.
