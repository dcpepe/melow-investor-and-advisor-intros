export function MelowMark({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 21 Q6.5 9 10 13.5 T17 12"
        stroke="#FFC629"
        strokeWidth="4.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13 21 Q16.5 5 20 10 T27 8"
        stroke="#FFC629"
        strokeWidth="4.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.92"
      />
      <path
        d="M23 21 Q26 2 30 7"
        stroke="#FFC629"
        strokeWidth="4.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}

export function MelowLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <MelowMark className="h-5 w-auto" />
      <span className="text-lg font-semibold tracking-tight text-cream">melow</span>
    </span>
  );
}
