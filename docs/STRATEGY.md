# BAA Digital Platform — Discovery, Strategy & Design System

Prepared by Al Riffai Software Solutions · Phases 1–5 · 5 October 2026

---

## 1. What we studied

| Source | How | Used for |
|---|---|---|
| baa.bh (Home, About, Board Members, News, Events, Clean Athletics + 8 subpages, Ineligible list, ~20 news posts) | Read page by page | Content, facts, IA, journeys |
| BAA logo (209×209 PNG supplied) | Visual analysis | Palette, motifs, tone |
| bfa.bh | Quality benchmark only | Bar for polish, never layout or components |
| alriffai.ai | Agency reference | Delivery standard and positioning |

### 1.1 Current baa.bh: what exists
- **Platform:** Wix. Nav: Home · About (Board Members) · News · Events · Clean Athletics (8 subpages) · Contact.
- **Homepage:** carousel hero, latest news, President's vision quote (Mohamed Abdullatif Bin Jalal), "upcoming participations" list, contact form.
- **Real content worth carrying over:** about statement, 11 board members and roles, the 2026 international season reporting (Birhanu Balew, Winfred Yavi, Salwa Eid Naser, youth medallists), the participations calendar, the Clean Athletics content and its B‑NADO / AIU / WADA links, contact details and social handles.

### 1.2 UX / IA problems found
1. **No athlete entity.** Athletes appear only inside news headlines. You can't open "Birhanu Balew" and see his results, records and news.
2. **No results data.** Results (12:45.70 AR in Brussels, 49.57 SB in Silesia) exist only as prose. They can't be searched, filtered or compared.
3. **Events are a flat list** with mixed past, future and postponed items and no status or link to outcomes.
4. **Clean Athletics URLs are auto-generated** (`/copy-of-supplements-policy-1`), which hurts SEO and trust, and the Ineligible list has no context or intro.
5. **News headlines are full sentences** (40+ words) with no excerpts, categories or imagery hierarchy.
6. **Governance is thin.** There's a board page but no committees, structure, documents or policies hub.
7. **Template feel.** Generic Wix typography, carousels and spacing, and no visual system from the logo.
8. **No admin workflow**, so content quality depends on whoever edits the Wix page.

---

## 2. Logo analysis → identity

The logo is **one red and white**: an arched "BAHRAIN" wordmark, a shield carrying the **national flag's serrated edge**, a **sprinter in a white disc**, **concentric arches** that read as running-track lanes, and an Arabic ribbon reading الاتحاد البحريني لألعاب القوى.

| Logo element | Design system translation |
|---|---|
| Flag red | One brand red (Bahrain Red) used with discipline: CTAs, live states, key numerals |
| Serrated flag edge (5 points) | **Serration divider**, used rarely at major transitions (hero base, footer) |
| Concentric arches | **Lane-line motif**: thin curved strokes for backgrounds and section corners |
| Sprinter | Motion direction: everything moves **left→right, fast-in/soft-out**, like a start |
| Heavy arched wordmark | Condensed heavy display type, uppercase eyebrows |
| Arabic ribbon | First-class Arabic typeface pairing (IBM Plex Sans Arabic) |

**Mood:** national pride + timing-board precision + editorial sports media. Not neon, not glassy, not childish.

---

## 3. Design strategy

**Positioning line (proposal, for BAA to approve):** *"The home of Bahraini athletics."*

Principles:
1. **Athletes are the product.** Every result, news story and competition links back to a person.
2. **Data as design.** Marks, positions and records are typeset like a stadium timing board and get hierarchy instead of boxes.
3. **Editorial rhythm.** Light/dark alternation, asymmetric 12‑col grids, full-bleed photo moments, numbered sections (01, 02…) like lane numbers.
4. **Institutional trust.** Governance and Clean Athletics get calm, document-like layouts, plain language and clear external routes (B‑NADO, AIU, WADA).
5. **Honest content.** Real BAA facts carry a source link. Demo data is labelled **DEMO** in the UI and the database (`is_demo`).
6. **One product.** The admin dashboard uses the same tokens, type and motifs as the public site.

---

## 4. Sitemap

```
/                         Home
/athletes                 Directory (search · discipline · gender · category · status · sort)
/athletes/[slug]          Profile: PBs, SBs, results, achievements, competitions, news
/results                  Results centre (search · discipline · athlete · competition · year · gender · round · pagination)
/competitions             Competitions hub (status · level)
/competitions/[slug]      Event hub: athletes, disciplines, results, medals, news, documents
/events                   Calendar: upcoming · ongoing · completed (list + month view)
/events/[slug]            Event detail → related competition / results
/achievements             Medals, records, milestones timeline
/news                     Editorial index (categories)
/news/[slug]              Article: related athletes, competition, stories, share
/about                    Who we are, mission, role
/about/board              Board members
/about/governance         Committees, structure, policies
/about/documents          Document library
/clean-athletics          Integrity hub
/clean-athletics/[topic]  code-of-conduct · anti-doping-rules · check-your-medication · supplements-policy ·
                          therapeutic-use-exemptions · ineligible · whistleblowing · report-doping
/contact                  Contact + form (stored to DB, visible in admin)
/search                   Global search across athletes, news, competitions, events

/admin/login
/admin                    Overview
/admin/{athletes|competitions|events|results|news|media|achievements|governance|documents|messages|users|settings|activity}
```

Legacy Wix URLs (`/blog`, `/post/*`, `/board-members`, `/anti-doping`, `/copy-of-*`, `/violations`) get 301 redirects to the new structure.

---

## 5. Design system

### Colour
| Token | Hex | Use |
|---|---|---|
| `red-600` Bahrain Red | `#CE1126` | Primary/CTA, live, key numerals |
| `red-700` | `#A80E1F` | Hover/pressed |
| `red-900` Deep Maroon | `#5E0912` | Dark accents, gradients into ink |
| `ink-950` | `#0B0B0D` | Dark sections, text |
| `ink-800 / 600 / 400` | `#1D1D21 / #4A4A52 / #8C8C94` | Surfaces, secondary text |
| `sand-100` Pearl | `#F4F0E8` | Warm light section background |
| `bone` | `#FBFAF7` | Default page background (not pure white) |
| `line` | `#E3DDD1` | Hairlines |
| `gold` | `#C39A32` | **Medals/records only** |
| `silver` / `bronze` | `#9CA3AB` / `#A4683C` | Medal states |
| success / warning / info | `#1F7A52` / `#B7791F` / `#2D5B86` | System feedback |

The red takes no more than ~10% of any screen, and pages alternate warm-light and ink sections.

### Type
- **Archivo** (variable width 62–125): condensed heavy for display, normal width for body, expanded for micro-labels. One family, three voices.
- **IBM Plex Sans Arabic** for Arabic.
- Tabular numerals for every mark/time. Fluid scale: display `clamp(3.25rem, 8vw, 8.5rem)`, h1 `clamp(2.5rem, 5vw, 4.5rem)`, body 17/28.

### Shape, space, depth
- Radius 2–6px (precision, not bubbly). 8px spacing grid. 12-col layout, 1440 max, 24–64px gutters.
- Hairlines over shadows; one elevated shadow for overlays.

### Motifs
Lane lines · serration divider · lane-number section index (01–09) · red finish-line rule · timing-board numerals.

### Motion (Motion library, reduced-motion respected)
Hero headline slides in on a start cue, counters run once in view, sections reveal with a short 24px rise, filters animate rows with layout transitions, hover shows photo zoom ≤1.04. Nothing loops except the live indicator.

### Components
Button (primary/secondary/ghost/link), Badge (status, medal, record, DEMO), Input/Select/Search, Tabs, Table (sortable, responsive card mode on mobile), Pagination, Dialog/Confirm, Dropdown, Toast, Empty/Loading/Error states, Section header (lane number + eyebrow + title), Stat, Athlete plate, Result row, Event row, News story (lead/standard/compact).

---

## 6. Architecture

- **Next.js 16 (App Router, RSC, Server Actions)**, TypeScript, Tailwind v4 with custom tokens, Radix primitives (custom-styled, not default shadcn look), Lucide, Motion.
- **Database:** relational SQLite via Drizzle ORM (libSQL driver). It is swappable to Postgres/Turso with a dialect change. Tables: athletes, disciplines, competitions, events, results, achievements, news (+news↔athletes), board_members, committees, documents, media, users, sessions, activity_log, messages, settings.
- **Auth/RBAC:** bcrypt-hashed passwords, DB-backed sessions in httpOnly SameSite cookies, permission matrix enforced in every server action and admin route (not just the UI).

| Role | Permissions |
|---|---|
| Super Admin | everything incl. users & settings |
| Administrator | all content + governance + documents + messages |
| Content Manager | news, media, achievements |
| Results Manager | results, athletes (performance data) |
| Event Manager | events, competitions |
| Editor | news drafts (submit for review, cannot publish) |

- **Production:** Vercel or a container on AWS/Azure Bahrain region, Postgres, Cloudflare CDN/WAF, Sentry, object storage for media.
- **Next phases:** full Arabic (RTL is ready: logical CSS properties throughout), athlete portrait shoots, World Athletics data import.

---

## 7. Content honesty
- **Real (sourced from baa.bh, Oct 2026):** About text, board, contact, socials, Clean Athletics structure/links, events listed on baa.bh, 2026 results and news reported on baa.bh. Each item carries `source_url`.
- **Demo (labelled):** additional athletes, extra results, stats, galleries, article bodies beyond the published summaries, committees detail.
- **Photography:** placeholder athletics photography (Unsplash licence), never presented as the athletes. To be replaced with BAA's official photography.
