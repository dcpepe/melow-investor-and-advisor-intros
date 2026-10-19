"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import {
  type ContentEntity,
  CONTENT_FIELDS,
  saveContentCore,
  deleteContentCore,
  setPublishedCore,
  moveContentCore,
} from "@/lib/content-ops";
import { db } from "@/lib/db";
import { DEFAULT_INTRO_PROMPT_TEMPLATE, INTRO_PROMPT_SETTING_KEY } from "@/lib/intro-prompt";

// NOTE: no type re-exports here — "use server" modules may only export async
// functions, and a type re-export becomes a broken runtime reference.

function revalidate() {
  revalidatePath("/portal");
  revalidatePath("/admin");
}

export async function saveContentItem(entity: ContentEntity, formData: FormData) {
  await requireAdmin();
  const input: Record<string, unknown> = { id: String(formData.get("id") || "") };
  for (const field of CONTENT_FIELDS[entity]) {
    const raw = formData.get(field);
    if (raw !== null) input[field] = String(raw);
  }
  if (entity === "accountList" && formData.has("accounts")) {
    input.accounts = String(formData.get("accounts") || "");
  }
  if (!input.id && !String(input.title || "").trim()) throw new Error("Title is required.");
  await saveContentCore(entity, input);
  revalidate();
}

export async function deleteContentItem(entity: ContentEntity, id: string) {
  await requireAdmin();
  await deleteContentCore(entity, id);
  revalidate();
}

export async function togglePublished(entity: ContentEntity, id: string) {
  await requireAdmin();
  await setPublishedCore(entity, id);
  revalidate();
}

export async function moveContentItem(entity: ContentEntity, id: string, direction: "up" | "down") {
  await requireAdmin();
  await moveContentCore(entity, id, direction);
  revalidate();
}

export async function saveIntroPrompt(formData: FormData) {
  await requireAdmin();
  const value = String(formData.get("value") || "").trim() || DEFAULT_INTRO_PROMPT_TEMPLATE;
  await db.setting.upsert({
    where: { key: INTRO_PROMPT_SETTING_KEY },
    create: { key: INTRO_PROMPT_SETTING_KEY, value },
    update: { value },
  });
  revalidate();
}

export async function resetIntroPrompt() {
  await requireAdmin();
  await db.setting.upsert({
    where: { key: INTRO_PROMPT_SETTING_KEY },
    create: { key: INTRO_PROMPT_SETTING_KEY, value: DEFAULT_INTRO_PROMPT_TEMPLATE },
    update: { value: DEFAULT_INTRO_PROMPT_TEMPLATE },
  });
  revalidate();
}
