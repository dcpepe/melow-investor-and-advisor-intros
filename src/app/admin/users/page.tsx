import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { UserRow } from "./UserRow";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
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
  );
}
