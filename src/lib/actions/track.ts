"use server";

import { getCurrentUser } from "@/lib/session";
import { track } from "@/lib/track";

const ALLOWED_EVENTS = new Set([
  "blurb_copied",
  "material_link_copied",
  "material_opened",
  "video_opened",
  "video_link_copied",
  "portal_viewed",
]);

export async function trackEvent(eventType: string, entityType?: string, entityId?: string) {
  if (!ALLOWED_EVENTS.has(eventType)) return;
  const user = await getCurrentUser();
  if (!user) return;
  await track(eventType, { userId: user.id, entityType, entityId });
}
