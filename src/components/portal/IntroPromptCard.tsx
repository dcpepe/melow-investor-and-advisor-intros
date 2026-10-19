"use client";

import { CopyButton } from "@/components/CopyButton";
import { DownloadCsvButton } from "@/components/portal/DownloadCsvButton";

export function IntroPromptCard({ prompt, csvRows }: { prompt: string; csvRows: string[][] }) {
  return (
    <div className="rounded-xl border border-gold-dim/40 bg-ink-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-cream">
            Mine your network <span className="text-gold-soft">with AI</span>
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Copy this prompt into Claude (or any AI agent that can see your contacts, inbox, or
            CRM) and it will surface the warm paths you have into our target accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadCsvButton filename="melow-target-accounts.csv" rows={csvRows} label="All accounts (CSV)" />
          <CopyButton text={prompt} label="Copy prompt" variant="gold" event="intro_prompt_copied" />
        </div>
      </div>
      <pre className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line bg-ink p-4 font-mono text-[11px] leading-relaxed text-muted">
        {prompt}
      </pre>
    </div>
  );
}
