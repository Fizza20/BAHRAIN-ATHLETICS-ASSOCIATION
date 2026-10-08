import "server-only";
import { headers } from "next/headers";

/**
 * Sliding-window rate limiter held in memory.
 *
 * Good enough to stop scripted password guessing and form spam against a single server
 * instance. On serverless hosts (Vercel) every instance has its own counters, so for strong
 * guarantees also enable the host's WAF / rate-limit rules or back this with Redis/Upstash.
 */
const store = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export type Limit = { limit: number; windowMs: number };
export type LimitResult = { ok: boolean; retryAfterSec: number };

export function rateLimit(key: string, { limit, windowMs }: Limit): LimitResult {
  const now = Date.now();
  const recent = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    store.set(key, recent);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000)) };
  }
  recent.push(now);
  store.set(key, recent);
  if (store.size > MAX_KEYS) {
    // Drop the oldest entries so the map can never grow without bound.
    for (const k of store.keys()) {
      store.delete(k);
      if (store.size <= MAX_KEYS * 0.8) break;
    }
  }
  return { ok: true, retryAfterSec: 0 };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}

/** Best-effort client IP. Platform-set headers win over the client-controllable X-Forwarded-For. */
export async function clientIp() {
  const h = await headers();
  const direct = h.get("x-vercel-forwarded-for") ?? h.get("cf-connecting-ip") ?? h.get("x-real-ip");
  if (direct) return direct.trim().slice(0, 64);
  const xff = h.get("x-forwarded-for");
  // The right-most entry is the one added by our own proxy; the left-most can be forged.
  if (xff) return xff.split(",").at(-1)!.trim().slice(0, 64);
  return "unknown";
}
