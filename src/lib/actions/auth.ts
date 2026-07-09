"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/session";
import { track } from "@/lib/track";

export type FormState = { error?: string; values?: Record<string, string> } | undefined;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const values = { email };

  if (!email || !password) return { error: "Please enter your email and password.", values };

  const user = await db.user.findUnique({ where: { email } });
  const invalid = { error: "Invalid email or password.", values };
  if (!user) return invalid;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return invalid;
  if (user.status !== "active") {
    return { error: "Your access has been revoked. Contact Pepe or Alex if you think this is a mistake.", values };
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  await track("login", { userId: user.id });
  redirect("/portal");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function acceptInvite(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const invite = await db.invite.findUnique({ where: { token } });
  if (!invite || invite.status !== "pending") {
    return { error: "This invite is no longer valid." };
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    await db.invite.update({ where: { id: invite.id }, data: { status: "expired" } });
    return { error: "This invite has expired. Ask for a new one." };
  }

  const name = String(formData.get("name") || "").trim();
  const email = (invite.email || String(formData.get("email") || "")).trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const values = { name, email };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address.", values };
  }
  if (password.length < 8) return { error: "Password must be at least 8 characters.", values };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Try signing in instead.", values };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role: invite.role,
      status: "active",
      lastLoginAt: new Date(),
    },
  });
  await db.invite.update({
    where: { id: invite.id },
    data: { status: "accepted", acceptedBy: user.id },
  });

  await createSession(user.id);
  await track("invite_accepted", { userId: user.id, entityType: "invite", entityId: invite.id });
  redirect("/portal");
}

export async function getSessionUser() {
  return getCurrentUser();
}
