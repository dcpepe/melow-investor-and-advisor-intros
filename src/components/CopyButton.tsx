"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/actions/track";

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

export function CopyButton({
  text,
  label = "Copy",
  event,
  entityType,
  entityId,
  variant = "outline",
  className = "",
  icon = true,
}: {
  text: string;
  label?: string;
  event?: string;
  entityType?: string;
  entityId?: string;
  variant?: "outline" | "gold" | "ghost";
  className?: string;
  icon?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      fallbackCopy(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    if (event) void trackEvent(event, entityType, entityId);
  }

  const base =
    "inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap";
  const variants = {
    outline:
      "border border-line-2 bg-surface-2 px-3 py-1.5 text-cream hover:border-gold-dim hover:text-gold",
    gold: "bg-gold px-3.5 py-1.5 text-ink font-semibold hover:bg-[#ffd45c]",
    ghost: "px-2 py-1 text-muted hover:text-gold",
  };

  return (
    <button type="button" onClick={handleCopy} className={`${base} ${variants[variant]} ${className}`}>
      {icon && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          {copied ? (
            <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
              <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
            </>
          )}
        </svg>
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
