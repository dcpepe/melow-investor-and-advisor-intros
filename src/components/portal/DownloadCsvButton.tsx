"use client";

import { trackEvent } from "@/lib/actions/track";

function toCsv(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(","))
    .join("\n");
}

export function DownloadCsvButton({
  filename,
  rows,
  label = "Download CSV",
  entityId,
}: {
  filename: string;
  rows: string[][];
  label?: string;
  entityId?: string;
}) {
  function handleDownload() {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    void trackEvent("accounts_csv_downloaded", "accountList", entityId);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-line-2 bg-surface-2 px-3 py-1.5 text-xs font-medium text-cream transition-colors hover:border-gold-dim hover:text-gold"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M8 2.5v8m0 0L5 7.5M8 10.5l3-3M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
