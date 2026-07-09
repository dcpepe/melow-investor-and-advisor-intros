import Link from "next/link";
import { MelowLogo } from "@/components/MelowLogo";
import { logout } from "@/lib/actions/auth";

export function PortalNav({
  userEmail,
  isAdmin,
  active,
}: {
  userEmail: string;
  isAdmin: boolean;
  active: "portal" | "admin";
}) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-2xl border border-line bg-ink-2/90 px-4 py-2.5 backdrop-blur sm:px-5">
        <Link href="/portal" className="shrink-0">
          <MelowLogo />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-faint md:inline">{userEmail}</span>
          {isAdmin && (
            <Link
              href={active === "admin" ? "/portal" : "/admin"}
              className="rounded-full border border-line-2 bg-surface-2 px-3 py-1.5 text-xs font-medium text-cream transition-colors hover:border-gold-dim hover:text-gold"
            >
              {active === "admin" ? "View portal" : "Admin"}
            </Link>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-gold"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
