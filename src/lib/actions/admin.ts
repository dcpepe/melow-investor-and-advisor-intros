"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { sendInviteEmail } from "@/lib/email";

function inviteUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/invite/${token}`;
}

export type InviteResult =
  | { ok: true; link: string; emailStatus?: string }
  | { ok: false; error: string };

export async function createInvite(formData: FormData): Promise<InviteResult> {
  const admin = await requireAdmin();
  const email = String(formData.get("email") || "").trim().toLowerCase() || null;
  const role = formData.get("role") === "admin" ? "admin" : "viewer";
  const expiresDays = Number(formData.get("expiresDays") || 0);
  const shouldSendEmail = formData.get("sendEmail") === "on";

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (email) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { ok: false, error: "A user with this email already exists." };
  }

  const token = crypto.randomBytes(24).toString("base64url");
  const invite = await db.invite.create({
    data: {
      email,
      token,
      role,
      expiresAt: expiresDays > 0 ? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000) : null,
      createdBy: admin.id,
    },
  });

  const link = inviteUrl(invite.token);
  let emailStatus: string | undefined;
  if (email && shouldSendEmail) {
    const result = await sendInviteEmail(email, link);
    emailStatus = result.sent ? "Invite email sent." : result.reason;
  }

  revalidatePath("/admin/invites");
  return { ok: true, link, emailStatus };
}

export async function resendInviteEmail(inviteId: string): Promise<InviteResult> {
  await requireAdmin();
  const invite = await db.invite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.status !== "pending" || !invite.email) {
    return { ok: false, error: "This invite can’t be emailed." };
  }
  const link = inviteUrl(invite.token);
  const result = await sendInviteEmail(invite.email, link);
  return { ok: true, link, emailStatus: result.sent ? "Invite email sent." : result.reason };
}

export async function revokeInvite(inviteId: string) {
  await requireAdmin();
  await db.invite.update({ where: { id: inviteId }, data: { status: "revoked" } });
  revalidatePath("/admin/invites");
}

export async function setUserStatus(userId: string, status: "active" | "revoked") {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("You can’t change your own access.");
  await db.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/admin/users");
}

export async function setUserRole(userId: string, role: "admin" | "viewer") {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("You can’t change your own role.");
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error("You can’t delete yourself.");
  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
