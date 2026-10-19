"use client";

import { useState, useTransition } from "react";
import { revokeInvite, resendInviteEmail } from "@/lib/actions/admin";
import { CopyButton } from "@/components/CopyButton";

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  accepted: "bg-emerald-400/10 text-emerald-400",
  expired: "bg-line-2 text-muted",
  revoked: "bg-danger/10 text-danger",
};

export function InviteRow({
  invite,
}: {
  invite: {
    id: string;
    email: string | null;
    role: string;
    status: string;
    link: string;
    expiresAt: string | null;
    createdBy: string;
    acceptedBy: string | null;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <tr className={`border-b border-line last:border-b-0 ${pending ? "opacity-50" : ""}`}>
      <td className="px-4 py-3">
        <div className="font-medium text-cream">{invite.email || "Open invite link"}</div>
        {notice && <div className="mt-0.5 text-[11px] text-gold-soft">{notice}</div>}
      </td>
      <td className="px-4 py-3 text-muted">{invite.role}</td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[invite.status] ?? ""}`}>
          {invite.status}
        </span>
      </td>
      <td className="px-4 py-3 text-muted">{formatDate(invite.expiresAt)}</td>
      <td className="px-4 py-3 text-muted">{invite.createdBy}</td>
      <td className="px-4 py-3 text-muted">{invite.acceptedBy || "—"}</td>
      <td className="px-4 py-3">
        {invite.status === "pending" && (
          <div className="flex justify-end gap-2">
            <CopyButton text={invite.link} label="Copy link" />
            {invite.email && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await resendInviteEmail(invite.id);
                    setNotice(res.ok ? (res.emailStatus ?? null) : res.error);
                  })
                }
                className="cursor-pointer rounded-full border border-line-2 bg-surface-2 px-2.5 py-1.5 text-[11px] text-cream transition-colors hover:border-gold-dim hover:text-gold"
              >
                Send email
              </button>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => revokeInvite(invite.id))}
              className="cursor-pointer rounded-full px-2 py-1.5 text-[11px] text-muted transition-colors hover:text-danger"
            >
              Revoke
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
