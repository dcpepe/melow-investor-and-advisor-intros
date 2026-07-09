import { db } from "@/lib/db";

const EVENT_LABELS: Record<string, string> = {
  portal_viewed: "Portal views",
  login: "Logins",
  blurb_copied: "Blurbs copied",
  material_link_copied: "Material links copied",
  material_opened: "Materials opened",
  video_link_copied: "Video links copied",
  video_opened: "Videos opened",
  invite_accepted: "Invites accepted",
};

export default async function AdminOverviewPage() {
  // Server component — reading the clock for a reporting window is fine here.
  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [activeUsers, pendingInvites, videos, materials, blurbs, lists, events] = await Promise.all([
    db.user.count({ where: { status: "active" } }),
    db.invite.count({ where: { status: "pending" } }),
    db.video.count(),
    db.salesMaterial.count(),
    db.blurb.count(),
    db.accountList.count(),
    db.analyticsEvent.groupBy({
      by: ["eventType"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { eventType: true },
    }),
  ]);

  const stats = [
    { label: "Active users", value: activeUsers },
    { label: "Pending invites", value: pendingInvites },
    { label: "Videos", value: videos },
    { label: "Sales materials", value: materials },
    { label: "Blurbs", value: blurbs },
    { label: "Account lists", value: lists },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-surface p-4">
            <div className="text-2xl font-semibold text-gold">{s.value}</div>
            <div className="mt-1 text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold">Activity — last 30 days</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-xs text-muted">No activity recorded yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {events
              .sort((a, b) => b._count.eventType - a._count.eventType)
              .map((e) => (
                <div key={e.eventType} className="rounded-lg border border-line bg-ink-2 p-3">
                  <div className="text-lg font-semibold text-cream">{e._count.eventType}</div>
                  <div className="mt-0.5 text-[11px] text-muted">
                    {EVENT_LABELS[e.eventType] ?? e.eventType}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
