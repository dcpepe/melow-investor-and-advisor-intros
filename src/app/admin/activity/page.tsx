import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const EVENT_LABELS: Record<string, string> = {
  portal_viewed: "Portal views",
  login: "Logins",
  blurb_copied: "Blurbs copied",
  material_link_copied: "Material links copied",
  material_opened: "Materials opened",
  video_link_copied: "Video links copied",
  video_opened: "Videos opened",
  invite_accepted: "Invites accepted",
  accounts_csv_downloaded: "Account CSVs downloaded",
  intro_prompt_copied: "Intro prompts copied",
  profile_copied: "Profile cards copied",
};

export default async function AdminActivityPage() {
  await requireAdmin();
  // Server component — reading the clock for a reporting window is fine here.
  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [events, activeUsers] = await Promise.all([
    db.analyticsEvent.groupBy({
      by: ["eventType"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { eventType: true },
    }),
    db.user.count({ where: { status: "active" } }),
  ]);

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Last 30 days</h2>
        <Link href="/admin/access" className="text-xs text-muted transition-colors hover:text-gold">
          {activeUsers} team member{activeUsers === 1 ? "" : "s"} with access →
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="mt-3 text-xs text-muted">No activity recorded yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {events
            .sort((a, b) => b._count.eventType - a._count.eventType)
            .map((e) => (
              <div key={e.eventType} className="rounded-lg border border-line bg-ink-2 p-3">
                <div className="text-lg font-semibold text-gold">{e._count.eventType}</div>
                <div className="mt-0.5 text-[11px] text-muted">{EVENT_LABELS[e.eventType] ?? e.eventType}</div>
              </div>
            ))}
        </div>
      )}
      <p className="mt-4 text-[11px] text-faint">
        The portal is public, so views and copies include anonymous visitors.
      </p>
    </div>
  );
}
