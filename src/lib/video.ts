/** Derive a thumbnail image URL for common video hosts (currently YouTube). */
export function getVideoThumbnail(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1] ?? null;
    } else if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0] || null;
    }
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

/** Convert common video URLs (YouTube, Vimeo, Loom) into embeddable iframe URLs. */
export function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      const shorts = u.pathname.match(/^\/shorts\/([\w-]+)/);
      if (shorts) return `https://www.youtube-nocookie.com/embed/${shorts[1]}`;
      const embed = u.pathname.match(/^\/embed\/([\w-]+)/);
      if (embed) return url;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.match(/^\/(\d+)/);
      if (id) return `https://player.vimeo.com/video/${id[1]}`;
    }
    if (host === "loom.com") {
      const id = u.pathname.match(/^\/share\/([\w-]+)/);
      if (id) return `https://www.loom.com/embed/${id[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}
