import "server-only";
import { headers } from "next/headers";

/**
 * Base URL for building absolute links (e.g. invite links). Derived from the
 * incoming request's host so links always match the domain the admin is using,
 * with NEXT_PUBLIC_APP_URL as a fallback for non-request contexts.
 */
export async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // headers() unavailable outside a request context — fall through
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
