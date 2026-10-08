# Bahrain Athletics Association: digital platform (prototype)

A full redesign of [baa.bh](https://www.baa.bh) as a national-federation platform: a public site where athletes, results, competitions, events and news are connected entities, plus an admin dashboard with role-based access.

Prepared by **Al Riffai Software Solutions**. Discovery, strategy, sitemap and design system: [`docs/STRATEGY.md`](docs/STRATEGY.md).

## Quick start

```bash
npm install
npm run db:reset     # creates data/baa.db, runs migrations, seeds real + demo content
npm run dev          # http://localhost:3000
```

Admin: <http://localhost:3000/admin>. There is **no default password**. `npm run db:seed` generates a random one and prints it once in the terminal (or uses `SEED_ADMIN_PASSWORD` if you set it, 12 to 72 characters). The seeded accounts share it, so change it after the first sign-in.

| Email | Role |
|---|---|
| superadmin@baa.demo | Super Admin |
| admin@baa.demo | Administrator |
| content@baa.demo | Content Manager |
| results@baa.demo | Results Manager |
| events@baa.demo | Event Manager |
| editor@baa.demo | Editor |

Never commit `.env*` files or `data/*.db`. Copy `.env.example` to `.env.local`. See [SECURITY.md](SECURITY.md) for the security model, the audit results and the pre-launch checklist.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, React Server Components, Server Actions) | SSR/ISR for SEO, server-side data access, no separate API to maintain |
| Language | TypeScript (strict) | |
| Styling | Tailwind CSS v4 with BAA tokens (`src/app/globals.css`) | One design system for site and dashboard |
| UI primitives | Radix (Dialog, Dropdown, Tabs, Tooltip), custom-styled | Accessible behaviour without a template look |
| Icons | Lucide | |
| Motion | Motion (`motion/react`) | Reveals, counters, hero, filtering; respects `prefers-reduced-motion` |
| Database | SQLite via libSQL + Drizzle ORM | Relational, zero-ops locally; the same schema runs on Turso, or on Postgres by switching the Drizzle dialect |
| Auth | DB-backed sessions (hashed tokens, httpOnly cookies), bcrypt passwords | No third-party dependency; permissions enforced in every server action |
| Validation | Zod | |

No other runtime dependencies. Charts are inline SVG.

## Structure

```
src/
  app/
    (site)/            public website (home, athletes, results, competitions, events, news, about, clean-athletics, contact, search)
    admin/             dashboard (login, overview, CRUD for every entity, users, settings, activity)
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx
  components/
    ui/                design-system primitives (Button, Badge, Photo, motifs, motion, filters)
    domain/            ResultsTable, AthleteCard, EventRow, NewsStory, EventsCalendar
    site/ home/ admin/
  db/                  schema.ts, seed.ts, seed-data/real.ts (sourced), seed-data/demo.ts (labelled)
  lib/                 queries.ts, auth.ts, permissions.ts, actions/, images.ts, marks.ts, status.ts
drizzle/               SQL migrations
```

## Data model

Athlete ↔ Results ↔ Competition ↔ Discipline, plus Achievements, News (many-to-many with athletes, linked to competitions), Events (linked to competitions), Board, Committees, Documents, Media, Messages, Users, Sessions, Activity log, Settings.

- Personal and season bests are **derived from results**, never typed in by hand.
- Event status (upcoming, live, completed) is **derived from dates**, so the calendar never goes stale. Postponed and cancelled are editorial overrides.
- Every row has `is_demo`; real facts carry `source_url` back to the BAA report they came from.

## Content honesty

- **Real**: about text, mission, vision, the board, contact details and socials, Clean Athletics structure and partner links, and 2026 results, achievements and news as published on baa.bh (read 5 Oct 2026). Where BAA reported a placing without a mark, the mark shows as **TBC**. Where BAA did not publish exact meeting dates, dates are approximated from its report dates.
- **Demo**: extra athletes, their results, upcoming national events, two articles, documents and committee remits. All are labelled **DEMO** in the UI and can be removed in one action (Admin → Settings → Purge demo data).
- **Photography**: placeholder athletics photography hotlinked from Unsplash (free licence). It never depicts BAA athletes. Profiles show "Official portrait pending" until BAA uploads portraits through the media library.

## Production deployment (recommended)

- **Hosting**: Vercel, or a Node container on AWS or Azure in the Bahrain/ME region (`npm run build && npm start`).
- **Database**: Turso (libSQL, no code change: set `DATABASE_URL` and `DATABASE_AUTH_TOKEN`), or managed Postgres (swap `sqlite-core` → `pg-core` in `schema.ts` and the driver in `db/index.ts`).
- **Media**: S3-compatible object storage + CDN; add the host to `images.remotePatterns`.
- **Edge**: Cloudflare in front for CDN, WAF, bot protection and rate limiting (login and the contact form already have an in-process limiter, plus a honeypot on the form).
- **Monitoring**: Sentry (`@sentry/nextjs`) for errors and performance; Vercel or Cloudflare analytics.
- **Env**: `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap, OG), `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `SEED_ADMIN_PASSWORD`.

## Next phases

1. Arabic edition (RTL is ready: the type system pairs Archivo with IBM Plex Sans Arabic, and layouts use logical spacing).
2. Official photography and athlete portrait shoot.
3. Results import from World Athletics or competition timing systems (CSV/JSON importer in the admin).
4. Media uploads to object storage (currently images are added by URL).
