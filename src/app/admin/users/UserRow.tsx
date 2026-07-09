"use client";

import { useTransition } from "react";
import { setUserRole, setUserStatus, deleteUser } from "@/lib/actions/admin";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function UserRow({
  user,
  isSelf,
}: {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt: string | null;
  };
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const active = user.status === "active";

  return (
    <tr className={`border-b border-line last:border-b-0 ${pending ? "opacity-50" : ""}`}>
      <td className="px-4 py-3">
        <div className="font-medium text-cream">{user.name || "—"}</div>
        <div className="text-muted">{user.email}</div>
      </td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="rounded-full border border-line-2 px-2.5 py-1 text-[11px] text-gold-soft">
            {user.role} (you)
          </span>
        ) : (
          <select
            value={user.role}
            disabled={pending}
            onChange={(e) =>
              startTransition(() => setUserRole(user.id, e.target.value as "admin" | "viewer"))
            }
            className="cursor-pointer rounded-full border border-line-2 bg-surface-2 px-2.5 py-1 text-[11px] text-cream outline-none"
          >
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
          </select>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
            active ? "bg-gold/10 text-gold" : "bg-danger/10 text-danger"
          }`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-4 py-3 text-muted">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-3 text-muted">{formatDate(user.lastLoginAt)}</td>
      <td className="px-4 py-3">
        {!isSelf && (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(() => setUserStatus(user.id, active ? "revoked" : "active"))
              }
              className="cursor-pointer rounded-full border border-line-2 bg-surface-2 px-2.5 py-1 text-[11px] text-cream transition-colors hover:border-gold-dim hover:text-gold"
            >
              {active ? "Revoke" : "Reactivate"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (confirm(`Delete ${user.email}? This can’t be undone.`)) {
                  startTransition(() => deleteUser(user.id));
                }
              }}
              className="cursor-pointer rounded-full px-2 py-1 text-[11px] text-muted transition-colors hover:text-danger"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
