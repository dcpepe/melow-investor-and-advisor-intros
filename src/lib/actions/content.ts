"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type ContentEntity = "video" | "icpBlock" | "accountList" | "salesMaterial" | "blurb";

/* eslint-disable @typescript-eslint/no-explicit-any */
function delegate(entity: ContentEntity): any {
  switch (entity) {
    case "video":
      return db.video;
    case "icpBlock":
      return db.icpBlock;
    case "accountList":
      return db.accountList;
    case "salesMaterial":
      return db.salesMaterial;
    case "blurb":
      return db.blurb;
  }
}

function revalidate() {
  revalidatePath("/portal");
  revalidatePath("/admin/content");
}

const FIELDS: Record<ContentEntity, string[]> = {
  video: ["title", "description", "videoUrl", "thumbnailUrl"],
  icpBlock: ["title", "bullets"],
  accountList: ["title", "description"],
  salesMaterial: ["title", "description", "type", "fileUrl", "externalUrl"],
  blurb: ["title", "body"],
};

const NULLABLE_FIELDS = new Set(["thumbnailUrl", "description:accountList", "fileUrl", "externalUrl"]);

export async function saveContentItem(entity: ContentEntity, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const model = delegate(entity);

  const data: Record<string, unknown> = {};
  for (const field of FIELDS[entity]) {
    const raw = formData.get(field);
    if (raw === null) continue;
    const value = String(raw).trim();
    const nullable = NULLABLE_FIELDS.has(field) || NULLABLE_FIELDS.has(`${field}:${entity}`);
    data[field] = value === "" && nullable ? null : value;
  }
  if (!data.title) throw new Error("Title is required.");

  let itemId = id;
  if (id) {
    await model.update({ where: { id }, data });
  } else {
    const last = await model.findFirst({ orderBy: { order: "desc" } });
    const created = await model.create({ data: { ...data, order: (last?.order ?? -1) + 1 } });
    itemId = created.id;
  }

  // Account lists edit their accounts inline as one name per line.
  if (entity === "accountList" && formData.has("accounts")) {
    const names = String(formData.get("accounts") || "")
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    await db.$transaction([
      db.account.deleteMany({ where: { accountListId: itemId } }),
      db.account.createMany({
        data: names.map((name, i) => ({ accountListId: itemId, name, order: i })),
      }),
    ]);
  }

  revalidate();
}

export async function deleteContentItem(entity: ContentEntity, id: string) {
  await requireAdmin();
  await delegate(entity).delete({ where: { id } });
  revalidate();
}

export async function togglePublished(entity: ContentEntity, id: string) {
  await requireAdmin();
  const model = delegate(entity);
  const item = await model.findUnique({ where: { id } });
  if (!item) return;
  await model.update({ where: { id }, data: { published: !item.published } });
  revalidate();
}

export async function moveContentItem(entity: ContentEntity, id: string, direction: "up" | "down") {
  await requireAdmin();
  const model = delegate(entity);
  const items: { id: string }[] = await model.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const index = items.findIndex((i) => i.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= items.length) return;

  [items[index], items[swapWith]] = [items[swapWith], items[index]];
  await db.$transaction(items.map((item, i) => model.update({ where: { id: item.id }, data: { order: i } })));
  revalidate();
}
