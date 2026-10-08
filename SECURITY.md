# Security

Audit performed 8 October 2026 against the code in this repository. This file records what was found,
what was fixed, and what still has to be done outside the code before a real launch.

## Reporting a vulnerability

Email the BAA web team (see the Contact page). Please do not open a public issue for a vulnerability.

## Security model

| Area | How it works |
|---|---|
| Public site | Read-only server components. No public API routes. The only write is the contact form. |
| Admin area | `/admin/*`. The proxy redirects visitors without a session cookie; **every** page calls `requireUser()` and **every** server action calls `assertCan(resource, action)`. The UI is never the security boundary. |
| Authentication | Email + password, bcrypt (cost 12). Sessions are random 256-bit tokens; only their SHA-256 is stored. Cookie: `HttpOnly`, `SameSite=Lax`, `Secure` and `__Host-` prefixed in production, 12 h lifetime. Deactivating a user or resetting a password signs them out everywhere. |
| Access control | Six roles, permission matrix in `src/lib/permissions.ts` (read / write / delete / publish per resource). |
| Input handling | Every form and action input is validated with Zod (types, lengths, enums, URL schemes). SQL is parameterised by Drizzle. React escapes all output; there is no `dangerouslySetInnerHTML` except JSON-LD, which is escaped (see below). |
| Secrets | None in the code or git history. Server variables are validated in `src/lib/env.ts`; only `NEXT_PUBLIC_SITE_URL` (a public URL) reaches the browser. |

## Audit results

### Critical (fixed)

1. **Public demo credentials.** The admin sign-in page displayed all six admin emails and the shared password, and pre-filled the form on click, so anyone could become Super Admin. The panel and the password prop were removed; the page no longer reveals accounts.
2. **Known default admin password.** Seeding used `baa-demo-2026` unless overridden, and the same seed ran automatically on Vercel demo mode. Seeding now uses `SEED_ADMIN_PASSWORD` or a random 24-character password (printed once by `npm run db:seed`); demo mode on Vercel creates accounts nobody knows the password of. The old password is also rejected by the user form.
3. **Database file committed to git.** `data/baa.db` (accounts with bcrypt hashes of the default password, visitor messages) was tracked. It is now untracked and ignored (`/data/`, `*.db`).

### High (fixed)

4. **No brute-force protection on login.** Added limits: 5 attempts per IP + email and 30 per IP per 15 minutes, generic error messages, counter reset on success.
5. **Missing security headers / no CSP.** Added a per-request nonce Content-Security-Policy (`src/proxy.ts`), HSTS (2 years, preload), `X-Frame-Options: DENY`, COOP, CORP, `X-Permitted-Cross-Domain-Policies`, expanded Permissions-Policy. Admin responses are `no-store` and `noindex`.
6. **Stored-XSS path in JSON-LD.** Titles and names were written into `<script type="application/ld+json">` with plain `JSON.stringify`; a value containing `</script>` would break out. All five sites now use `jsonLd()` which escapes `<`, `>`, `&` and line separators.
7. **Internal error text sent to the browser.** Server actions returned raw `error.message` (could include SQL and table names). Only deliberate `UserError`s are shown now; everything else is logged on the server and replaced by a generic message.

### Medium (fixed)

8. Session cookie now uses the `__Host-` prefix in production; expired sessions are purged on login.
9. Password policy: 12 to 72 characters (bcrypt ignores bytes after 72), letter + number required.
10. `optUrl` accepted `/\\evil.com`-style paths; tightened. `javascript:` and `data:` URLs were already rejected.
11. Search boxes: LIKE wildcards (`%`, `_`, `\`) are stripped and the length is capped.
12. Contact form rate limit moved to the shared limiter (3 per minute, 15 per hour per IP); trusted-proxy aware IP detection (`x-forwarded-for` is client-controllable, so the platform header is preferred).
13. Server Action payloads capped at 1 MB; `poweredByHeader` off; browser source maps off.

### Checked and found sound

- **Admin routes / access control:** every action goes through `assertCan` (via `saveRow`/`removeRows` or directly); every admin page through `requireUser`. A forged session cookie passes the proxy but is rejected by the server and redirected to login.
- **CORS:** the app exposes no API routes and sends no `Access-Control-*` headers; cross-origin requests are not allowed. Server Actions enforce same-origin (Origin must match Host).
- **Sensitive files:** `.env`, `.git`, `data/`, `drizzle/`, `package.json`, `src/` and `docs/` all return 404 from the running server. Only `/public` is served.
- **Open redirect:** the login `next` parameter only allows same-site `/admin` paths.
- **Password hashing:** bcrypt cost 12; timing-safe login (a dummy hash is compared for unknown emails).
- **Git history:** 3 commits scanned for keys, tokens, private keys, `.env` files: nothing found, apart from the database file above.

### Dependencies

- Updated Next.js 16.3.8 to 16.4.0, React 19.2.8 to 19.3.0, `lucide-react`, Radix and the lockfile.
- Removed unused packages: `jose`, `@radix-ui/react-tabs`, `@radix-ui/react-tooltip`.
- `npm audit --omit=dev`: **0 vulnerabilities** (what runs in production).
- `npm audit` (including dev tools): 2 residual findings in **development-only** packages and not exploitable in production: `braces` (via `eslint-config-next` > `fast-glob`; no patched release exists upstream) and an old `esbuild` inside `drizzle-kit` (dev server only). npm's suggested "fix" is a breaking downgrade, so it was not applied. Re-check when `drizzle-kit` and `eslint-config-next` publish updates.

## Before a real launch (cannot be done in code)

1. **Rotate everything that ever used the old default.** The previous password hashes are still in the git history of the GitHub repository. Use a real database with new passwords. If the repository is public, either make it private or purge the history (`git filter-repo --path data/baa.db --invert-paths`, then force-push) and treat the old accounts as compromised.
2. Use a hosted database (Turso/libSQL) via `DATABASE_URL` + `DATABASE_AUTH_TOKEN` set in the host's secret store, then run the seed once with `SEED_ADMIN_PASSWORD` set, and delete the demo accounts you do not need.
3. Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS domain.
4. Put Cloudflare (or the host's WAF) in front for DDoS and distributed rate limiting. The built-in limiter is per server instance; on serverless hosts each instance counts separately.
5. Add two-factor authentication for Super Admin / Administrator accounts when an identity provider is chosen.
6. Add error monitoring (Sentry) and alerts on repeated failed logins (the activity log already records logins).
7. Back up the database and test a restore.
