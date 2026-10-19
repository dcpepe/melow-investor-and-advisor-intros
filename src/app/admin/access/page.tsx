import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getBaseUrl } from "@/lib/base-url";
import { CreateInviteForm } from "@/components/admin/CreateInviteForm";
import { InviteRow } from "@/components/admin/InviteRow";
import { UserRow } from "@/components/admin/UserRow";

export default async function AdminAccessPage() {
  const admin = await requireAdmin();
  const [users, invites, base] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    db.invite.findMany({ orderBy: { createdAt: "desc" }, include: { creator: true, acceptor: true } }),
    getBaseUrl(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-muted">
        The portal itself is public. Accounts here are only for people who manage it (admins) or
        were invited before it went open.
      </p>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Team</h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-faint">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  user={{
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    role: u.role,
                    status: u.status,
                    createdAt: u.createdAt.toISOString(),
                    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
                  }}
                  isSelf={u.id === admin.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Invites</h2>
        <div className="flex flex-col gap-4">
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
                      No invites yet.
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
      </section>
    </div>
  );
}
