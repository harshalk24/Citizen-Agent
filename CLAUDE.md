# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start Next.js dev server (port 3000)
npm run build        # prisma generate + next build (runs before Vercel deploy)
npm run lint         # ESLint — must pass before pushing (Vercel blocks on lint errors)
npm run db:push      # push Prisma schema changes to Neon (dev / preview)
npm run db:migrate   # run pending migrations (production)
npm run scrape       # scrape government portals for service data
```

> **Build gotcha**: `npm run build` runs `prisma generate` first. If you add a new model or field, always run `npm run db:push` locally before pushing so the schema and client stay in sync.

> **ESLint is strict**: `@typescript-eslint/no-unused-vars` and `react/no-unescaped-entities` will fail the Vercel build. Apostrophes in JSX must be `&apos;`, and every declared variable must be used.

---

## Architecture

### Stack
- **Next.js 14** App Router (TypeScript), deployed on **Vercel**
- **PostgreSQL** via **Neon** (pooled + direct URLs), ORM: **Prisma 5**
- **AI**: Google Gemini 2.0 Flash (`lib/ai.ts`) for chat and plan generation
- **Auth**: custom JWT stored in an `httpOnly` cookie (`ca_session`), signed with `jose`

### Auth & Session Flow
`middleware.ts` protects `/discover`, `/plan`, `/dashboard`, `/chat`. Unauthenticated requests redirect to `/auth?from=<path>`.

Auth is email-only (no phone/OTP in prod). `POST /api/auth` with `{ action: "login", name }` creates a `Citizen` row and sets the JWT cookie. After onboarding, the redirect **must use `window.location.href`** (not `router.push`) so the browser sends the fresh cookie on the next request.

Server components and route handlers read the citizen ID from the `x-citizen-id` request header (set by middleware) or by calling `getSession()` from `lib/session.ts`.

### Data Flow: Entitlements
1. User picks life event + employment + country in `SituationBuilder`
2. `POST /api/entitlements` calls `filterServices()` from `lib/knowledge-base.ts` (pure in-memory filter — no DB or AI)
3. If authenticated, the API persists `lifeEvent/employment/country` on the `Citizen` row and upserts `SavedService` records
4. Results are also cached to `localStorage` as `ca_services` / `ca_situation` for the plan page

### Data Flow: Action Plan
`POST /api/plan` sends the filtered services + situation to Gemini via `generateJSON()` and stores the result as `ActionPlan.planJson` (stringified). `GET /api/plan` returns the most recent saved plan. The plan page tries DB first, then falls back to localStorage, then to fetching the citizen profile + entitlements on-the-fly.

### AI Layer (`lib/ai.ts`)
- `streamChat()` — streaming Gemini chat, returns an async iterable of text chunks
- `generateJSON<T>()` — structured JSON generation with `responseMimeType: "application/json"`
- `buildChatSystemPrompt()` — constructs context-aware prompts; embeds eligible schemes from the knowledge base; defines the annotation system (`[CA_SCHEMES:...]`, `[CA_RECOMMEND:...]`, `[CA_CHIPS:...]`) that the chat UI renders as rich components

### Knowledge Base (`lib/knowledge-base.ts`)
All government services are hardcoded in this file as a `GovernmentService[]` array. There is no external service database. To add a new country:
1. Add the country code to the `Country` type union
2. Add service objects with matching `country`, `lifeEvents`, and `employment` fields
3. Update `countryNames` in `getAssumptions()`, `COUNTRY_NAMES` in `lib/ai.ts`, and `countryFlag()`/`countryName()` in `lib/utils.ts`
4. Add the country chip to `SituationBuilder.tsx` and `OnboardingFlow.tsx`

Current countries: `IE` (Ireland), `UAE`, `RW` (Rwanda), `IN` (India), `CA-US` (California), `SV` (El Salvador).

### Apply Enrichment (`lib/apply-enrichment.ts`)
Maps `serviceId → { applyUrl, prefillFields }`. Controls whether the "Apply" button appears on cards and which fields are pre-filled in `ApplyModal`. To enable Apply for a service, add an entry keyed by its `id`.

---

## Design System (AQQRUE)

**All new UI must use CSS custom properties via inline styles, not Tailwind utility classes.** The `tailwind.config.ts` still contains old dark-theme values (`bg-bg-tertiary`, `text-accent-blue`, `border-[#1E2D4A]`) that conflict with the current light theme — do not use those Tailwind tokens.

### Core tokens (from `app/globals.css`)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#f5f4ef` | Page background |
| `--paper` | `#ffffff` | Card surfaces |
| `--primary` | `#1a5c3a` | Brand green, CTAs |
| `--primary-soft` | `#d4ead9` | Tinted green backgrounds |
| `--ink` | `#0f1117` | Headings |
| `--ink-mute` | `#7a7b87` | Secondary text |
| `--line` | `rgba(15,17,23,0.08)` | Borders — always `0.5px` |
| `--partial` | `#854f0b` | Warning / amber |
| `--ineligible` | `#b91c1c` | Error / red urgency |
| `--eligible` | `#1a5c3a` | Success / completed |

### Rules
- Borders: always `0.5px solid var(--line)`. Use `border-radius: var(--r-lg)` (10px) for cards.
- No box shadows (`--shadow-*` are all `none`). Depth is achieved via background contrast.
- Hover states: change `borderColor` to `rgba(26,92,58,0.2)` for green hover.
- Fonts: `var(--font-sans)` (Plus Jakarta Sans), `var(--font-display)` (DM Serif Display), `var(--font-mono)` (DM Mono).
- Animations: use `animate-fade-in`, `animate-slide-down` Tailwind classes (these are defined in `tailwind.config.ts` keyframes and are safe to use).

### Button classes (defined in `globals.css`)
- `.btn.btn-primary` — solid green button
- `.btn.btn-outline` — bordered ghost button
- `.btn.btn-sm` / `.btn-lg` — size variants
- `.chip` / `.chip.selected` — selection pill (used in SituationBuilder)
- `.eyebrow` — small mono uppercase label

---

## Key Patterns

**Server vs Client**: Dashboard is a server component (`app/dashboard/page.tsx`) that fetches data and passes it to `DashboardClient`. API routes read citizen ID from `getSession()`. Client components fetch via `/api/*`.

**Discover page context**: `SituationBuilder` accepts `prefillCountry/lifeEvent/employment` props and auto-submits after 400ms when all three are set. The discover page passes a `key` prop tied to `profileLoaded` to force a remount after the async citizen fetch — this triggers the auto-submit with saved context.

**Status cycling on dashboard**: Clicking a service's status badge cycles `not_started → in_progress → completed` with an optimistic update + rollback on error.

**Chat annotation system**: The AI embeds `[CA_SCHEMES:id1,id2]`, `[CA_RECOMMEND:id]`, `[CA_CHIPS:Q1|Q2]` annotations in its responses. The chat page parses and renders these as interactive UI components before displaying the plain text.
