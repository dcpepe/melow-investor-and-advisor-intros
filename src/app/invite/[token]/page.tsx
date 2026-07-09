import Link from "next/link";
import { db } from "@/lib/db";
import { MelowLogo } from "@/components/MelowLogo";
import { AcceptInviteForm } from "./AcceptInviteForm";

export const metadata = { title: "Accept invite | Melow Intro Portal" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.invite.findUnique({ where: { token } });

  const expired = invite?.expiresAt ? invite.expiresAt < new Date() : false;
  const valid = invite && invite.status === "pending" && !expired;

  return (
    <main className="melow-glow flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-10 flex flex-col items-center gap-3">
        <MelowLogo />
        <span className="text-xs uppercase tracking-[0.2em] text-faint">
          Investor &amp; Advisor Intro Portal
        </span>
      </div>

      <div className="melow-card-glow w-full max-w-md rounded-2xl border border-line bg-surface p-8 sm:p-10">
        {valid ? (
          <>
            <h1 className="text-center text-2xl font-semibold leading-snug tracking-tight">
              You’re invited to <span className="text-gold-soft">Melow’s</span> Intro Portal
            </h1>
            <p className="mt-4 text-center text-sm leading-relaxed text-muted">
              Create your account to access Melow materials, target accounts, and intro templates.
            </p>
            <AcceptInviteForm token={token} email={invite.email} />
          </>
        ) : (
          <>
            <h1 className="text-center text-2xl font-semibold leading-snug tracking-tight">
              This invite is <span className="text-gold-soft">no longer valid</span>
            </h1>
            <p className="mt-4 text-center text-sm leading-relaxed text-muted">
              {expired
                ? "This invite link has expired. Ask Pepe or Alex for a new one."
                : "This invite link has been used or revoked. If you already have an account, sign in below."}
            </p>
            <Link
              href="/login"
              className="mt-8 block w-full rounded-full bg-gold py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-[#ffd45c]"
            >
              Go to sign in
            </Link>
          </>
        )}
        <p className="mt-6 text-center text-xs text-faint">Need help? Contact Pepe or Alex.</p>
      </div>
    </main>
  );
}
