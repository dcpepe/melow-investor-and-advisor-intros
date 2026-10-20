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
  "accounts_csv_downloaded",
  "intro_prompt_copied",
  "profile_copied",
]);

export async function trackEvent(eventType: string, entityType?: string, entityId?: string) {
  if (!ALLOWED_EVENTS.has(eventType)) return;
  // The portal is public, so events may be anonymous.
  const user = await getCurrentUser();
  await track(eventType, { userId: user?.id ?? null, entityType, entityId });
}
