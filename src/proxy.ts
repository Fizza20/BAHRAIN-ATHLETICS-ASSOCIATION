import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

/**
 * Runs before every page request:
 *  1. Optimistic gate for the admin area: no session cookie -> login page. (The real check, a valid
 *     unexpired session plus role permission, happens in requireUser()/assertCan() on every admin
 *     page and server action; this only saves a round trip.)
 *  2. A per-request Content-Security-Policy with a fresh nonce, so only scripts that Next.js itself
 *     emits can run. Injected inline scripts (XSS) are blocked by the browser.
 *  3. Admin responses are never cached.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin && pathname !== "/admin/login" && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Motion and Tailwind write inline style attributes; styles cannot execute code, scripts are the risk.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  if (isAdmin) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and prefetches
    {
      source: "/((?!_next/static|_next/image|favicon.ico|icon.png|brand/|robots.txt|sitemap.xml|manifest.webmanifest).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
