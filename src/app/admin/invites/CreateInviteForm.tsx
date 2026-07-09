"use client";

import { useRef, useState, useTransition } from "react";
import { createInvite, type InviteResult } from "@/lib/actions/admin";
import { CopyButton } from "@/components/CopyButton";

const inputClass =
  "rounded-xl border border-line-2 bg-ink-2 px-3.5 py-2.5 text-xs text-cream placeholder:text-faint outline-none transition-colors focus:border-gold-dim";

export function CreateInviteForm() {
  const [result, setResult] = useState<InviteResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createInvite(formData);
      setResult(res);
      if (res.ok) formRef.current?.reset();
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="text-sm font-semibold">Invite someone</h2>
      <p className="mt-1 text-xs text-muted">
        Add an email to tie the invite to one person, or leave it blank to generate an open invite link.
      </p>

      <form ref={formRef} action={handleSubmit} className="mt-4 flex flex-wrap items-center gap-2.5">
        <input
          type="email"
          name="email"
          placeholder="email@company.com (optional)"
          className={`${inputClass} w-full sm:w-64`}
        />
        <select name="role" defaultValue="viewer" className={`${inputClass} cursor-pointer`}>
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
        <select name="expiresDays" defaultValue="14" className={`${inputClass} cursor-pointer`}>
          <option value="0">Never expires</option>
          <option value="7">Expires in 7 days</option>
          <option value="14">Expires in 14 days</option>
          <option value="30">Expires in 30 days</option>
        </select>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted">
          <input type="checkbox" name="sendEmail" defaultChecked className="accent-[#ffc629]" />
          Send invite email
        </label>
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-full bg-gold px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-[#ffd45c] disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create invite"}
        </button>
      </form>

      {result && !result.ok && <p className="mt-3 text-xs text-danger">{result.error}</p>}
      {result?.ok && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-ink-2 p-3">
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-gold-soft">{result.link}</span>
          <CopyButton text={result.link} label="Copy invite link" />
          {result.emailStatus && <span className="w-full text-[11px] text-muted">{result.emailStatus}</span>}
        </div>
      )}
    </div>
  );
}
