import crypto from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  type ContentEntity,
  CONTENT_ENTITIES,
  getAllContent,
  saveContentCore,
  deleteContentCore,
  setPublishedCore,
  moveContentCore,
} from "@/lib/content-ops";
import { db } from "@/lib/db";
import { DEFAULT_INTRO_PROMPT_TEMPLATE, INTRO_PROMPT_SETTING_KEY } from "@/lib/intro-prompt";

/**
 * Agent content API — lets a trusted automation (e.g. Claude) read and manage
 * portal content. Protected by the AGENT_API_TOKEN environment variable:
 *   Authorization: Bearer <AGENT_API_TOKEN>
 *
 * GET  /api/agent/content            → full content dump (including unpublished)
 * POST /api/agent/content            → { operations: [...] }, applied in order:
 *   { action: "create",  entity, data }                 data: entity fields; accountList accepts accounts: string[]
 *   { action: "update",  entity, id, data }             only the fields present in data change
 *   { action: "delete",  entity, id }
 *   { action: "publish", entity, id, published? }       omit `published` to toggle
 *   { action: "move",    entity, id, direction }        direction: "up" | "down"
 */

function authorized(req: Request): boolean {
  const token = process.env.AGENT_API_TOKEN;
  if (!token) return false;
  const provided = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const unauthorized = () =>
  NextResponse.json(
    { error: "Unauthorized. Send Authorization: Bearer <AGENT_API_TOKEN>; the token must be configured in the environment." },
    { status: 401 }
  );

export async function GET(req: Request) {
  if (!authorized(req)) return unauthorized();
  const [content, promptSetting] = await Promise.all([
    getAllContent(),
    db.setting.findUnique({ where: { key: INTRO_PROMPT_SETTING_KEY } }),
  ]);
  return NextResponse.json({
    ...content,
    introPromptTemplate: promptSetting?.value ?? DEFAULT_INTRO_PROMPT_TEMPLATE,
  });
}

type Operation = {
  action: "create" | "update" | "delete" | "publish" | "move";
  entity: ContentEntity | "introPromptTemplate";
  id?: string;
  data?: Record<string, unknown>;
  published?: boolean;
  direction?: "up" | "down";
};

export async function POST(req: Request) {
  if (!authorized(req)) return unauthorized();

  let body: { operations?: Operation[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON: { operations: [...] }" }, { status: 400 });
  }
  const operations = body.operations;
  if (!Array.isArray(operations) || operations.length === 0 || operations.length > 100) {
    return NextResponse.json({ error: "Provide 1-100 operations." }, { status: 400 });
  }

  const results: Array<Record<string, unknown>> = [];
  for (const [i, op] of operations.entries()) {
    try {
      // The intro prompt template is a single setting: only "update" with data.value.
      if (op.entity === "introPromptTemplate") {
        if (op.action !== "update" || typeof op.data?.value !== "string") {
          throw new Error('introPromptTemplate supports only { action: "update", data: { value } }');
        }
        await db.setting.upsert({
          where: { key: INTRO_PROMPT_SETTING_KEY },
          create: { key: INTRO_PROMPT_SETTING_KEY, value: op.data.value },
          update: { value: op.data.value },
        });
        results.push({ ok: true, action: op.action, entity: op.entity });
        continue;
      }
      if (!CONTENT_ENTITIES.includes(op.entity)) throw new Error(`Unknown entity "${op.entity}"`);
      switch (op.action) {
        case "create": {
          const id = await saveContentCore(op.entity, { ...(op.data ?? {}), id: "" });
          results.push({ ok: true, action: op.action, entity: op.entity, id });
          break;
        }
        case "update": {
          if (!op.id) throw new Error("update requires id");
          await saveContentCore(op.entity, { ...(op.data ?? {}), id: op.id });
          results.push({ ok: true, action: op.action, entity: op.entity, id: op.id });
          break;
        }
        case "delete":
          if (!op.id) throw new Error("delete requires id");
          await deleteContentCore(op.entity, op.id);
          results.push({ ok: true, action: op.action, entity: op.entity, id: op.id });
          break;
        case "publish":
          if (!op.id) throw new Error("publish requires id");
          await setPublishedCore(op.entity, op.id, op.published);
          results.push({ ok: true, action: op.action, entity: op.entity, id: op.id });
          break;
        case "move":
          if (!op.id || !op.direction) throw new Error("move requires id and direction");
          await moveContentCore(op.entity, op.id, op.direction);
          results.push({ ok: true, action: op.action, entity: op.entity, id: op.id });
          break;
        default:
          throw new Error(`Unknown action "${(op as Operation).action}"`);
      }
    } catch (e) {
      results.push({ ok: false, index: i, error: e instanceof Error ? e.message : "failed" });
    }
  }

  revalidatePath("/portal");
  revalidatePath("/admin");
  return NextResponse.json({ results });
}
