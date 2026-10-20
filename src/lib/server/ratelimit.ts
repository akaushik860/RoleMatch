import "server-only";
import { IP_LIMIT_PER_HOUR } from "../plans";

// Best-effort, in-memory limit per IP. Good enough to stop casual abuse at MVP
// stage; move to Upstash Redis or the database once accounts exist.
const hits = new Map<string, number[]>();

export function ipOf(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function allow(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= IP_LIMIT_PER_HOUR) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return true;
}
