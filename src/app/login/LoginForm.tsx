"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-8 flex flex-col gap-3">
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        defaultValue={state?.values?.email ?? ""}
        placeholder="you@company.com"
        className="w-full rounded-xl border border-line-2 bg-ink-2 px-4 py-3 text-sm text-cream placeholder:text-faint outline-none transition-colors focus:border-gold-dim"
      />
      <input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder="Password"
        className="w-full rounded-xl border border-line-2 bg-ink-2 px-4 py-3 text-sm text-cream placeholder:text-faint outline-none transition-colors focus:border-gold-dim"
      />

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full cursor-pointer rounded-full bg-gold py-3 text-sm font-semibold text-ink transition-colors hover:bg-[#ffd45c] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
