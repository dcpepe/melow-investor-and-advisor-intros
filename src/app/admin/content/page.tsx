import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { ContentSection, type FieldDef } from "./ContentSection";

const MATERIAL_TYPES = ["Deck", "Case study", "One-pager", "Memo", "PDF", "Link"];

const videoFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", placeholder: "Melow demo video" },
  { name: "description", label: "Description", type: "textarea", rows: 2 },
  {
    name: "videoUrl",
    label: "Video URL",
    type: "text",
    placeholder: "https://www.youtube.com/watch?v=…",
    hint: "YouTube, Vimeo, and Loom links embed automatically.",
  },
  { name: "thumbnailUrl", label: "Thumbnail URL (optional)", type: "text", placeholder: "https://…" },
];

const icpFields: FieldDef[] = [
  { name: "title", label: "Card title", type: "text", placeholder: "Ideal Customer Profile titles" },
  {
    name: "bullets",
    label: "Bullet points",
    type: "textarea",
    rows: 8,
    hint: "One bullet point per line.",
  },
];

const accountListFields: FieldDef[] = [
  { name: "title", label: "List title", type: "text", placeholder: "Top priority accounts" },
  { name: "description", label: "Description (optional)", type: "text" },
  {
    name: "accounts",
    label: "Accounts",
    type: "textarea",
    rows: 10,
    hint: "One company name per line. Order here is the display order.",
  },
];

const materialFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", placeholder: "Short Deck: An Intro to Melow" },
  { name: "type", label: "Type", type: "select", options: MATERIAL_TYPES },
  { name: "description", label: "Description", type: "textarea", rows: 2 },
  {
    name: "fileUrl",
    label: "File URL (hosted PDF)",
    type: "text",
    placeholder: "https://…/melow-intro.pdf",
    hint: "Paste a hosted, shareable file URL. It will be embedded in the in-portal preview.",
  },
  {
    name: "externalUrl",
    label: "External URL (optional)",
    type: "text",
    hint: "Used for Link-type materials, or as the shareable link if it differs from the file URL.",
  },
];

const blurbFields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", placeholder: "LinkedIn warm intro" },
  { name: "body", label: "Blurb text", type: "textarea", rows: 8 },
];

export default async function AdminContentPage() {
  await requireAdmin();

  const orderBy = [{ order: "asc" as const }, { createdAt: "asc" as const }];
  const [videos, icpBlocks, accountLists, materials, blurbs] = await Promise.all([
    db.video.findMany({ orderBy }),
    db.icpBlock.findMany({ orderBy }),
    db.accountList.findMany({ orderBy, include: { accounts: { orderBy } } }),
    db.salesMaterial.findMany({ orderBy }),
    db.blurb.findMany({ orderBy }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <ContentSection
        entity="video"
        heading="Watch & Share — videos"
        description="Video cards shown in the first portal block."
        addLabel="Add video"
        fields={videoFields}
        items={videos.map((v) => ({
          id: v.id,
          title: v.title,
          subtitle: v.videoUrl,
          published: v.published,
          values: {
            title: v.title,
            description: v.description,
            videoUrl: v.videoUrl,
            thumbnailUrl: v.thumbnailUrl ?? "",
          },
        }))}
      />

      <ContentSection
        entity="icpBlock"
        heading="What we’re looking for — profile cards"
        description="The ICP titles and company profile cards."
        addLabel="Add card"
        fields={icpFields}
        items={icpBlocks.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: `${b.bullets.split("\n").filter(Boolean).length} bullets`,
          published: b.published,
          values: { title: b.title, bullets: b.bullets },
        }))}
      />

      <ContentSection
        entity="accountList"
        heading="Account lists"
        description="Target account lists shown as chips under the profile cards."
        addLabel="Add list"
        fields={accountListFields}
        items={accountLists.map((l) => ({
          id: l.id,
          title: l.title,
          subtitle: `${l.accounts.length} accounts`,
          published: l.published,
          values: {
            title: l.title,
            description: l.description ?? "",
            accounts: l.accounts.map((a) => a.name).join("\n"),
          },
        }))}
      />

      <ContentSection
        entity="salesMaterial"
        heading="Sales materials"
        description="Decks, case studies, one-pagers, memos, PDFs, and links."
        addLabel="Add material"
        fields={materialFields}
        items={materials.map((m) => ({
          id: m.id,
          title: m.title,
          subtitle: m.type,
          published: m.published,
          values: {
            title: m.title,
            type: m.type,
            description: m.description,
            fileUrl: m.fileUrl ?? "",
            externalUrl: m.externalUrl ?? "",
          },
        }))}
      />

      <ContentSection
        entity="blurb"
        heading="Blurbs you can send"
        description="Copy-ready intro templates."
        addLabel="Add blurb"
        fields={blurbFields}
        items={blurbs.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.body.slice(0, 80),
          published: b.published,
          values: { title: b.title, body: b.body },
        }))}
      />
    </div>
  );
}
