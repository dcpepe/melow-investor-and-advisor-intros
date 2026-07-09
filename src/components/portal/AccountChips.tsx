"use client";

import { useState } from "react";

const INITIAL_VISIBLE = 24;

export function AccountChips({ names }: { names: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? names : names.slice(0, INITIAL_VISIBLE);
  const hasMore = names.length > INITIAL_VISIBLE;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((name) => (
          <span
            key={name}
            className="rounded-full border border-line-2 bg-surface-2 px-2.5 py-1 text-xs text-cream/90"
          >
            {name}
          </span>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 cursor-pointer text-xs font-medium text-gold-soft hover:text-gold"
        >
          {expanded ? "Show less" : `Show all ${names.length}`}
        </button>
      )}
    </div>
  );
}
