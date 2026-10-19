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

export type { ContentEntity };

function revalidate() {
  revalidatePath("/portal");
  revalidatePath("/admin/content");
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
