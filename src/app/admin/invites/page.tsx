import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getBaseUrl } from "@/lib/base-url";
import { CreateInviteForm } from "./CreateInviteForm";
import { InviteRow } from "./InviteRow";

export default async function AdminInvitesPage() {
  await requireAdmin();
  const invites = await db.invite.findMany({
    orderBy: { createdAt: "desc" },
    include: { creator: true, acceptor: true },
  });

  const base = await getBaseUrl();

  return (
    <div className="flex flex-col gap-6">
      <CreateInviteForm />

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[820px] text-left text-xs">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-faint">
              <th className="px-4 py-3 font-medium">Invite</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Created by</th>
              <th className="px-4 py-3 font-medium">Accepted by</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invites.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted">
                  No invites yet. Create one above.
                </td>
              </tr>
            )}
            {invites.map((invite) => {
              const expired =
                invite.status === "pending" && invite.expiresAt !== null && invite.expiresAt < new Date();
              return (
                <InviteRow
                  key={invite.id}
                  invite={{
                    id: invite.id,
                    email: invite.email,
                    role: invite.role,
                    status: expired ? "expired" : invite.status,
                    link: `${base}/invite/${invite.token}`,
                    expiresAt: invite.expiresAt?.toISOString() ?? null,
                    createdBy: invite.creator.name || invite.creator.email,
                    acceptedBy: invite.acceptor ? invite.acceptor.name || invite.acceptor.email : null,
                  }}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
