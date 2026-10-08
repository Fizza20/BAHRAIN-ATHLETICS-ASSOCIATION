/**
 * Session cookie name, shared by the proxy (edge) and auth (Node), so it must stay free of
 * server-only imports. In production the `__Host-` prefix makes browsers refuse the cookie
 * unless it is Secure, host-only and Path=/, which blocks subdomain cookie-injection attacks.
 */
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-baa_session" : "baa_session";
