import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PortalNav } from "@/components/PortalNav";
import { AdminTabs } from "./AdminTabs";

export const metadata = { title: "Admin | Melow Intro Portal" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/portal");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PortalNav userEmail={user.email} isAdmin active="admin" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin <span className="text-gold-soft">dashboard</span>
          </h1>
          <Link href="/portal" className="text-xs text-muted transition-colors hover:text-gold">
            ← Back to portal
          </Link>
        </div>
        <AdminTabs />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
