import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { track } from "@/lib/track";
import { PortalNav } from "@/components/PortalNav";
import { CopyButton } from "@/components/CopyButton";

export default async function MaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const material = await db.salesMaterial.findUnique({ where: { id } });
  if (!material || (!material.published && user.role !== "admin")) notFound();

  await track("material_opened", { userId: user.id, entityType: "salesMaterial", entityId: material.id });

  // Link-type materials (or external-only ones) go straight to the external URL.
  if (!material.fileUrl && material.externalUrl) redirect(material.externalUrl);

  const shareUrl = material.externalUrl || material.fileUrl || "";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PortalNav userEmail={user.email} isAdmin={user.role === "admin"} active="portal" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-10 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link href="/portal" className="text-xs text-muted transition-colors hover:text-gold">
              ← Back to portal
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">{material.title}</h1>
              <span className="rounded-full border border-line-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                {material.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton
              text={shareUrl}
              label="Copy link"
              event="material_link_copied"
              entityType="salesMaterial"
              entityId={material.id}
            />
            {material.fileUrl && (
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-[#ffd45c]"
              >
                Open in new tab
              </a>
            )}
          </div>
        </div>

        {material.description && <p className="mt-2 text-sm text-muted">{material.description}</p>}

        <div className="mt-5 flex-1 overflow-hidden rounded-2xl border border-line bg-ink-2">
          {material.fileUrl ? (
            <iframe src={material.fileUrl} title={material.title} className="h-[75vh] w-full" />
          ) : (
            <div className="flex h-[40vh] items-center justify-center text-sm text-muted">
              No file attached to this material yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
