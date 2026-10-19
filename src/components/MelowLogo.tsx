/* eslint-disable @next/next/no-img-element */

/** The official Melow lockup (gradient mark + white wordmark) — for dark backgrounds. */
export function MelowLogo({ className = "h-6" }: { className?: string }) {
  return <img src="/melow-logo.webp" alt="Melow" className={`${className} w-auto`} />;
}
