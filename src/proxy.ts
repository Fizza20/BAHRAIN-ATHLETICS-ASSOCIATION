import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for the admin area: no session cookie → login page.
 * The real check (valid, unexpired session + role permission) happens in
 * requireUser()/assertCan() on every admin page and server action.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !request.cookies.has("baa_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
