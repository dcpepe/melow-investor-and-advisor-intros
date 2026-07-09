import "server-only";
import { db } from "./db";

/** Fire-and-forget analytics. Never throws — analytics must not break the portal. */
export async function track(
  eventType: string,
  opts: { userId?: string | null; entityType?: string; entityId?: string; metadata?: Record<string, unknown> } = {}
) {
  try {
    await db.analyticsEvent.create({
      data: {
        userId: opts.userId ?? null,
        eventType,
        entityType: opts.entityType ?? null,
        entityId: opts.entityId ?? null,
        metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
      },
    });
  } catch (err) {
    console.error("[track] failed", err);
  }
}
