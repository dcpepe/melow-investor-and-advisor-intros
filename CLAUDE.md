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

### If the API calls fail, diagnose before flailing

- `curl` exit 000 / `connect_rejected` / "blocked by the network egress proxy": this
  session's cloud environment does not allow the portal's domain. Do NOT keep retrying or
  invent workarounds. Tell the user exactly this: open the cloud environment menu in the
  session title bar → Edit → **Network access** → allow all domains or add
  `melow-investor-and-advisor-intros.vercel.app` to Allowed domains, then start a new
  session. (Running on a desktop/local Claude instead avoids this entirely.)
- HTTP 401: the token is missing or wrong. Read it from `$AGENT_API_TOKEN`; if unset, tell
  the user to add it in the environment settings under Network secrets / environment
  variables (same value as the `AGENT_API_TOKEN` variable in Vercel), then start a new
  session. Never ask them to paste the token into chat.
- HTTP 500 from the API: report the failing operation and its JSON body verbatim.

As a fallback when the API is unreachable and the user needs a change urgently: content can
be edited by hand in the portal admin at `/admin` (login in Ops notes below).

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
