import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { track } from "@/lib/track";
import { PortalNav } from "@/components/PortalNav";
import { SectionCard } from "@/components/portal/SectionCard";
import { VideoCard } from "@/components/portal/VideoCard";
import { AccountChips } from "@/components/portal/AccountChips";
import { MaterialRow } from "@/components/portal/MaterialRow";
import { BlurbCard } from "@/components/portal/BlurbCard";

export const metadata = { title: "Portal | Melow" };

const icons = {
  play: (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M4.5 2.8v10.4L13 8 4.5 2.8Z" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M4 2.5h6l3 3v8H4v-11Zm6 0v3h3M6 9h4M6 11h2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2v-7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default async function PortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [videos, icpBlocks, accountLists, materials, blurbs] = await Promise.all([
    db.video.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    db.icpBlock.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    db.accountList.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: { accounts: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
    }),
    db.salesMaterial.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    db.blurb.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);

  void track("portal_viewed", { userId: user.id });

  return (
    <div className="melow-glow flex min-h-full flex-1 flex-col">
      <PortalNav userEmail={user.email} isAdmin={user.role === "admin"} active="portal" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-12 sm:pt-16">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          How you can <span className="text-gold-soft">help</span>
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Everything you need to make a great introduction to Melow.
        </p>

        <div className="mt-10 flex flex-col gap-6">
          {/* Block 1: Watch & Share */}
          <SectionCard
            icon={icons.play}
            title="Watch & Share"
            subtitle="Send these to a prospect to give them a quick introduction to Melow and the customers we already work with."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <VideoCard
                  key={v.id}
                  id={v.id}
                  title={v.title}
                  description={v.description}
                  videoUrl={v.videoUrl}
                  thumbnailUrl={v.thumbnailUrl}
                />
              ))}
            </div>
          </SectionCard>

          {/* Block 2: What we're looking for */}
          <SectionCard
            icon={icons.target}
            title="What we’re looking for"
            subtitle="The most impactful introductions match these profiles."
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {icpBlocks.map((block) => (
                <div key={block.id} className="rounded-xl border border-line bg-ink-2 p-5">
                  <h3 className="text-sm font-semibold text-gold-soft">{block.title}</h3>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {block.bullets
                      .split("\n")
                      .map((b) => b.trim())
                      .filter(Boolean)
                      .map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-cream/85">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                          {bullet}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {accountLists.map((list) => (
                <div key={list.id} className="rounded-xl border border-line bg-ink-2 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-cream">{list.title}</h3>
                      {list.description && <p className="mt-0.5 text-xs text-muted">{list.description}</p>}
                    </div>
                    <span className="rounded-full border border-line-2 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-soft">
                      {list.accounts.length} accounts
                    </span>
                  </div>
                  <div className="mt-4">
                    <AccountChips names={list.accounts.map((a) => a.name)} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Block 3: Sales Materials */}
          <SectionCard
            icon={icons.doc}
            title="Sales Materials"
            subtitle="Copy a link and share directly with prospects, or open to preview."
          >
            <div className="rounded-xl border border-line bg-ink-2 px-4 sm:px-5">
              {materials.map((m) => {
                const shareUrl = m.externalUrl || m.fileUrl || "";
                return (
                  <MaterialRow
                    key={m.id}
                    id={m.id}
                    title={m.title}
                    description={m.description}
                    type={m.type}
                    shareUrl={shareUrl}
                    isExternal={m.type === "Link" || (!m.fileUrl && !!m.externalUrl)}
                  />
                );
              })}
            </div>
          </SectionCard>

          {/* Block 4: Blurbs you can send */}
          <SectionCard
            icon={icons.chat}
            title="Blurbs you can send"
            subtitle="Copy any of these and personalize the bracketed fields before sending."
          >
            <div className="flex flex-col gap-4">
              {blurbs.map((b) => (
                <BlurbCard key={b.id} id={b.id} title={b.title} body={b.body} />
              ))}
            </div>
          </SectionCard>
        </div>

        <p className="mt-12 text-center text-xs text-faint">
          Private &amp; confidential — please don’t share portal access. Questions? Contact Pepe or Alex.
        </p>
      </main>
    </div>
  );
}
