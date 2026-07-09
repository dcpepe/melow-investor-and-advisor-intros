"use client";

import { useState } from "react";
import { getEmbedUrl, getVideoThumbnail } from "@/lib/video";
import { CopyButton } from "@/components/CopyButton";
import { trackEvent } from "@/lib/actions/track";

export function VideoCard({
  id,
  title,
  description,
  videoUrl,
  thumbnailUrl,
}: {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
}) {
  const embedUrl = getEmbedUrl(videoUrl);
  const cover = thumbnailUrl || getVideoThumbnail(videoUrl);
  const [playing, setPlaying] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  function handlePlay() {
    void trackEvent("video_opened", "video", id);
    if (embedUrl) {
      setPlaying(true);
    } else if (videoUrl) {
      window.open(videoUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-line bg-ink-2 transition-colors hover:border-line-2">
      <div className="relative aspect-video w-full overflow-hidden bg-[#0d0c08]">
        {playing && embedUrl ? (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play ${title}`}
            className="absolute inset-0 flex cursor-pointer items-center justify-center"
          >
            {cover && !coverFailed && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                onError={() => setCoverFailed(true)}
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
            )}
            <span
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 110%, rgba(255,198,41,0.14), transparent 60%), linear-gradient(180deg, rgba(11,11,9,0.15), rgba(11,11,9,0.55))",
              }}
            />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gold text-ink shadow-lg transition-transform group-hover:scale-105">
              <svg viewBox="0 0 16 16" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M4 2.5v11l9-5.5-9-5.5Z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-sm font-semibold text-cream">{title}</h3>
        <p className="text-xs leading-relaxed text-muted">{description}</p>
        <div className="mt-3 flex items-center gap-2">
          <CopyButton
            text={videoUrl}
            label="Copy link"
            event="video_link_copied"
            entityType="video"
            entityId={id}
          />
          <a
            href={videoUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackEvent("video_opened", "video", id)}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:text-gold"
          >
            Open
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M6 3h7v7M13 3 7 9M12 13H3V4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
