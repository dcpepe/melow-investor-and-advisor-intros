import "server-only";
import { db } from "@/lib/db";

export type ContentEntity = "video" | "icpBlock" | "accountList" | "salesMaterial" | "blurb";

export const CONTENT_ENTITIES: ContentEntity[] = [
  "video",
  "icpBlock",
  "accountList",
  "salesMaterial",
  "blurb",
];

export const CONTENT_FIELDS: Record<ContentEntity, string[]> = {
  video: ["title", "description", "videoUrl", "thumbnailUrl"],
  icpBlock: ["title", "bullets"],
  accountList: ["title", "description"],
  salesMaterial: ["title", "description", "type", "fileUrl", "externalUrl"],
  blurb: ["title", "body"],
};

const NULLABLE_FIELDS = new Set(["thumbnailUrl", "description:accountList", "fileUrl", "externalUrl"]);

/* eslint-disable @typescript-eslint/no-explicit-any */
export function contentDelegate(entity: ContentEntity): any {
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

/**
 * Create or update a content item from a plain object. Fields missing from
 * `input` are left unchanged. For account lists, `accounts` (array of names,
 * or one-per-line string) replaces the list's accounts in the given order.
 * Returns the item id.
 */
export async function saveContentCore(entity: ContentEntity, input: Record<string, unknown>): Promise<string> {
  const id = typeof input.id === "string" ? input.id : "";
  const model = contentDelegate(entity);

  const data: Record<string, unknown> = {};
  for (const field of CONTENT_FIELDS[entity]) {
    if (!(field in input)) continue;
    const raw = input[field];
    const value = raw == null ? "" : String(raw).trim();
    const nullable = NULLABLE_FIELDS.has(field) || NULLABLE_FIELDS.has(`${field}:${entity}`);
    data[field] = value === "" && nullable ? null : value;
  }

  let itemId = id;
  if (id) {
    await model.update({ where: { id }, data });
  } else {
    if (!data.title) throw new Error("Title is required.");
    const last = await model.findFirst({ orderBy: { order: "desc" } });
    const created = await model.create({ data: { ...data, order: (last?.order ?? -1) + 1 } });
    itemId = created.id;
  }

  if (entity === "accountList" && input.accounts !== undefined) {
    const names = (
      Array.isArray(input.accounts)
        ? input.accounts.map(String)
        : String(input.accounts ?? "").split("\n")
    )
      .map((n) => n.trim())
      .filter(Boolean);
    await db.$transaction([
      db.account.deleteMany({ where: { accountListId: itemId } }),
      db.account.createMany({
        data: names.map((name, i) => ({ accountListId: itemId, name, order: i })),
      }),
    ]);
  }

  return itemId;
}

export async function deleteContentCore(entity: ContentEntity, id: string) {
  await contentDelegate(entity).delete({ where: { id } });
}

/** Set published explicitly, or toggle it when `published` is omitted. */
export async function setPublishedCore(entity: ContentEntity, id: string, published?: boolean) {
  const model = contentDelegate(entity);
  const item = await model.findUnique({ where: { id } });
  if (!item) throw new Error("Item not found.");
  await model.update({ where: { id }, data: { published: published ?? !item.published } });
}

export async function moveContentCore(entity: ContentEntity, id: string, direction: "up" | "down") {
  const model = contentDelegate(entity);
  const items: { id: string }[] = await model.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const index = items.findIndex((i) => i.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= items.length) return;

  [items[index], items[swapWith]] = [items[swapWith], items[index]];
  await db.$transaction(items.map((item, i) => model.update({ where: { id: item.id }, data: { order: i } })));
}

/** Everything on the portal, including unpublished items, with ids for editing. */
export async function getAllContent() {
  const orderBy = [{ order: "asc" as const }, { createdAt: "asc" as const }];
  const [videos, icpBlocks, accountLists, salesMaterials, blurbs] = await Promise.all([
    db.video.findMany({ orderBy }),
    db.icpBlock.findMany({ orderBy }),
    db.accountList.findMany({ orderBy, include: { accounts: { orderBy } } }),
    db.salesMaterial.findMany({ orderBy }),
    db.blurb.findMany({ orderBy }),
  ]);
  return { videos, icpBlocks, accountLists, salesMaterials, blurbs };
}
