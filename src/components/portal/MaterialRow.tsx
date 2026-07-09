"use client";

import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";

const TYPE_ICONS: Record<string, string> = {
  Deck: "M2 3.5h12v8H2v-8Zm4 8v2m4-2v2M5 13.5h6",
  "Case study": "M4 2.5h6l3 3v8H4v-11Zm6 0v3h3",
  "One-pager": "M4.5 2h7v12h-7V2Zm2 3h3m-3 2.5h3m-3 2.5h2",
  Memo: "M3 3h10v8.5L10.5 14H3V3Zm7.5 11v-2.5H13",
  PDF: "M4 2.5h6l3 3v8H4v-11Zm6 0v3h3M6 9h4M6 11h2.5",
  Link: "M6.5 9.5 9.5 6.5M5 8 3.5 9.5a2.5 2.5 0 0 0 3.5 3.5L8.5 11.5M11 8l1.5-1.5A2.5 2.5 0 0 0 9 3l-1.5 1.5",
};

export function MaterialRow({
  id,
  title,
  description,
  type,
  shareUrl,
  isExternal,
}: {
  id: string;
  title: string;
  description: string;
  type: string;
  shareUrl: string;
  isExternal: boolean;
}) {
  const openHref = isExternal ? shareUrl : `/materials/${id}`;

  return (
    <div className="flex flex-col gap-3 border-b border-line py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-2 bg-surface-2 text-gold">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <path d={TYPE_ICONS[type] ?? TYPE_ICONS.PDF} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-cream">{title}</h3>
            <span className="rounded-full border border-line-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
              {type}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
        <CopyButton
          text={shareUrl}
          label="Copy link"
          event="material_link_copied"
          entityType="salesMaterial"
          entityId={id}
        />
        <Link
          href={openHref}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface-2 px-3 py-1.5 text-xs font-medium text-cream transition-colors hover:border-gold-dim hover:text-gold"
        >
          Open
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M6 3h7v7M13 3 7 9M12 13H3V4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
