import type { ReactNode } from "react";

export function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line-2 bg-surface-2 text-gold">
          {icon}
        </span>
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
