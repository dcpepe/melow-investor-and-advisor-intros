"use client";

import { useState, useTransition } from "react";
import { saveIntroPrompt, resetIntroPrompt } from "@/lib/actions/content";

export function IntroPromptEditor({ template }: { template: string }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await saveIntroPrompt(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h2 className="text-sm font-semibold">Network-mining prompt</h2>
      <p className="mt-0.5 text-xs text-muted">
        The prompt investors copy from the portal (&ldquo;Mine your network with AI&rdquo;). The
        placeholders <code className="rounded bg-ink-2 px-1 py-0.5 text-gold-soft">{"{{ICP_TITLES}}"}</code>,{" "}
        <code className="rounded bg-ink-2 px-1 py-0.5 text-gold-soft">{"{{ACCOUNT_LISTS}}"}</code> and{" "}
        <code className="rounded bg-ink-2 px-1 py-0.5 text-gold-soft">{"{{BLURBS}}"}</code> are filled
        automatically from the cards, lists, and published blurbs, so keep them in the text.
      </p>
      <form action={handleSave} className="mt-4 flex flex-col gap-3">
        <textarea
          name="value"
          defaultValue={template}
          rows={16}
          className="w-full rounded-lg border border-line-2 bg-ink-2 px-3 py-2 font-mono text-xs leading-relaxed text-cream outline-none transition-colors focus:border-gold-dim"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-[#ffd45c] disabled:opacity-60"
          >
            {pending ? "Saving…" : saved ? "Saved ✓" : "Save prompt"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Reset the prompt to the default template? Your edits will be lost.")) {
                startTransition(() => resetIntroPrompt());
              }
            }}
            className="cursor-pointer rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:text-cream"
          >
            Reset to default
          </button>
        </div>
      </form>
    </section>
  );
}
