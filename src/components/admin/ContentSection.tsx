"use client";

import { useState, useTransition } from "react";
import {
  saveContentItem,
  deleteContentItem,
  togglePublished,
  moveContentItem,
  type ContentEntity,
} from "@/lib/actions/content";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  rows?: number;
  hint?: string;
};

export type ContentItem = {
  id: string;
  title: string;
  subtitle?: string;
  published: boolean;
  values: Record<string, string>;
};

const inputClass =
  "w-full rounded-lg border border-line-2 bg-ink-2 px-3 py-2 text-xs text-cream placeholder:text-faint outline-none transition-colors focus:border-gold-dim";

function ItemForm({
  entity,
  fields,
  item,
  onDone,
}: {
  entity: ContentEntity;
  fields: FieldDef[];
  item: ContentItem | null;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await saveContentItem(entity, formData);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-line bg-ink-2 p-4">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      {fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-faint">{field.label}</span>
          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              defaultValue={item?.values[field.name] ?? ""}
              placeholder={field.placeholder}
              rows={field.rows ?? 4}
              className={inputClass}
            />
          ) : field.type === "select" ? (
            <select name={field.name} defaultValue={item?.values[field.name] ?? field.options?.[0]} className={`${inputClass} cursor-pointer`}>
              {field.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name={field.name}
              defaultValue={item?.values[field.name] ?? ""}
              placeholder={field.placeholder}
              className={inputClass}
            />
          )}
          {field.hint && <span className="text-[11px] text-faint">{field.hint}</span>}
        </label>
      ))}
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-[#ffd45c] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:text-cream"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ContentSection({
  entity,
  heading,
  description,
  fields,
  items,
  addLabel = "Add",
}: {
  entity: ContentEntity;
  heading: string;
  description: string;
  fields: FieldDef[];
  items: ContentItem[];
  addLabel?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null); // "new" = creating
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{heading}</h2>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditingId(editingId === "new" ? null : "new")}
          className="cursor-pointer rounded-full border border-line-2 bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-cream transition-colors hover:border-gold-dim hover:text-gold"
        >
          + {addLabel}
        </button>
      </div>

      {editingId === "new" && (
        <div className="mt-4">
          <ItemForm entity={entity} fields={fields} item={null} onDone={() => setEditingId(null)} />
        </div>
      )}

      <div className={`mt-4 flex flex-col gap-2 ${pending ? "opacity-60" : ""}`}>
        {items.length === 0 && <p className="py-2 text-xs text-faint">Nothing here yet.</p>}
        {items.map((item, index) => (
          <div key={item.id}>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-ink-2 px-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0 || pending}
                  onClick={() => startTransition(() => moveContentItem(entity, item.id, "up"))}
                  className="cursor-pointer text-faint transition-colors hover:text-gold disabled:opacity-30"
                  aria-label="Move up"
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 7.5 6 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1 || pending}
                  onClick={() => startTransition(() => moveContentItem(entity, item.id, "down"))}
                  className="cursor-pointer text-faint transition-colors hover:text-gold disabled:opacity-30"
                  aria-label="Move down"
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-cream">{item.title}</div>
                {item.subtitle && <div className="truncate text-[11px] text-muted">{item.subtitle}</div>}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => togglePublished(entity, item.id))}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  item.published ? "bg-gold/10 text-gold" : "bg-line-2 text-muted"
                }`}
              >
                {item.published ? "Published" : "Hidden"}
              </button>
              <button
                type="button"
                onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                className="cursor-pointer rounded-full border border-line-2 bg-surface-2 px-2.5 py-1 text-[11px] text-cream transition-colors hover:border-gold-dim hover:text-gold"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (confirm(`Delete “${item.title}”?`)) {
                    startTransition(() => deleteContentItem(entity, item.id));
                  }
                }}
                className="cursor-pointer rounded-full px-1.5 py-1 text-[11px] text-muted transition-colors hover:text-danger"
              >
                Delete
              </button>
            </div>
            {editingId === item.id && (
              <div className="mt-2">
                <ItemForm entity={entity} fields={fields} item={item} onDone={() => setEditingId(null)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
