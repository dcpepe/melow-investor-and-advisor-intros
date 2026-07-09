import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { MelowLogo } from "@/components/MelowLogo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in | Melow Intro Portal" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/portal");

  return (
    <main className="melow-glow flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-10 flex flex-col items-center gap-3">
        <MelowLogo />
        <span className="text-xs uppercase tracking-[0.2em] text-faint">
          Investor &amp; Advisor Intro Portal
        </span>
      </div>

      <div className="melow-card-glow w-full max-w-md rounded-2xl border border-line bg-surface p-8 sm:p-10">
        <h1 className="text-center text-2xl font-semibold leading-snug tracking-tight">
          Welcome to Melow’s
          <br />
          <span className="text-gold-soft">Investor &amp; Advisor</span> Intro Portal
        </h1>
        <p className="mt-4 text-center text-sm leading-relaxed text-muted">
          Sign in to access Melow materials, target accounts, and intro templates you can share
          with your network.
        </p>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-faint">
          Need help? Contact Pepe or Alex.
        </p>
      </div>
    </main>
  );
}
