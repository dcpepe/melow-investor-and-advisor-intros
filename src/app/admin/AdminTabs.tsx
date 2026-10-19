"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Content" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/access", label: "Access" },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-gold text-ink"
                : "border border-line-2 bg-surface-2 text-muted hover:text-cream"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
