import { CopyButton } from "@/components/CopyButton";

export function BlurbCard({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-line bg-ink-2 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-cream">{title}</h3>
        <CopyButton text={body} label="Copy" event="blurb_copied" entityType="blurb" entityId={id} />
      </div>
      <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-muted">{body}</p>
    </div>
  );
}
