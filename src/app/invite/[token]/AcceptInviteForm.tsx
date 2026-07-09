"use client";

import { useActionState } from "react";
import { acceptInvite } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-xl border border-line-2 bg-ink-2 px-4 py-3 text-sm text-cream placeholder:text-faint outline-none transition-colors focus:border-gold-dim";

export function AcceptInviteForm({ token, email }: { token: string; email: string | null }) {
  const boundAction = acceptInvite.bind(null, token);
  const [state, action, pending] = useActionState(boundAction, undefined);

  return (
    <form action={action} className="mt-8 flex flex-col gap-3">
      <input
        type="text"
        name="name"
        autoComplete="name"
        defaultValue={state?.values?.name ?? ""}
        placeholder="Your name"
        className={inputClass}
      />
      {email ? (
        <input
          type="email"
          value={email}
          disabled
          className={`${inputClass} cursor-not-allowed opacity-60`}
        />
      ) : (
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={state?.values?.email ?? ""}
          placeholder="you@company.com"
          className={inputClass}
        />
      )}
      <input
        type="password"
        name="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Create a password (min. 8 characters)"
        className={inputClass}
      />

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full cursor-pointer rounded-full bg-gold py-3 text-sm font-semibold text-ink transition-colors hover:bg-[#ffd45c] disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Accept invite & create account"}
      </button>
    </form>
  );
}
