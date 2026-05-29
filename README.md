# PulseDesk

Multi-tenant analytics SaaS platform with enterprise-grade infrastructure — event-driven architecture, realtime updates, API platform, and integrated billing.

## Features

- **Event-Driven** — async job queue with retries and dead-letter handling
- **Realtime** — Server-Sent Events for live dashboard updates and notifications
- **Multi-Tenant** — team-isolated workspaces with RBAC
- **Billing** — Stripe Checkout, Customer Portal, subscription webhooks
- **API Platform** — personal access tokens (`pd_*`), scope-based auth, key management
- **Observability** — structured logging, audit trails, in-memory metrics, admin health API
- **Caching** — Redis cache layer with in-memory fallback
- **Metrics** — Recharts dashboard with revenue, user growth, engagement analytics
- **Rate Limiting** — per-user/per-IP rate limiting on all API routes
- **Validation** — Zod schemas across all endpoints
- **UI** — dark zinc monochrome, premium SaaS aesthetic

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth.js + Google OAuth |
| Payments | Stripe |
| Async | BullMQ + Redis (optional, in-memory fallback) |
| Caching | ioredis (optional, in-memory fallback) |
| Charts | Recharts |
| UI | Tailwind CSS 4 + shadcn/ui |
| Validation | Zod 4 |
| Testing | Vitest |

## Setup

```bash
cp .env.example .env   # fill in your values
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Required env vars

```
DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```

### Optional env vars

```
REDIS_URL                  # enables distributed queues + caching
NEXT_PUBLIC_APP_URL        # base URL for links
SENTRY_DSN                 # error tracking
OTEL_SERVICE_NAME           # OpenTelemetry service name
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run Vitest tests |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Run pending migrations |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:studio` | Prisma Studio GUI |
| `npx tsx src/worker.ts` | Start background job worker |

## Architecture

```
src/
├── app/
│   ├── (auth)/                  # login, signup (centered narrow layout)
│   ├── (protected)/             # dashboard, billing, settings, admin
│   └── api/
│       ├── admin/               # audit log, tenant diagnostics, health
│       ├── keys/                # personal access token management
│       ├── metrics/             # metric creation + aggregation
│       ├── realtime/            # SSE endpoint
│       ├── stripe/              # checkout, portal, webhook
│       └── team/                # create, members
├── components/
│   ├── auth/                    # SignInForm, SignUpForm
│   ├── charts/                  # RevenueChart, UserGrowthChart, etc.
│   ├── team/                    # TeamMembers table
│   └── ui/                      # Button, Input (shadcn)
├── hooks/
│   └── use-sse.ts               # SSE client hook
├── lib/
│   ├── api-keys.ts              # key generation, hashing, auth
│   ├── api-utils.ts             # badRequest, serverError, logTiming
│   ├── audit.ts                 # audit trail logging
│   ├── auth.ts                  # NextAuth config (DO NOT MODIFY)
│   ├── cache.ts                 # Redis + in-memory cache
│   ├── env.ts                   # env validation
│   ├── event-bus.ts             # typed event pub/sub
│   ├── jobs.ts                  # background job handlers
│   ├── observability/           # logger, metrics
│   ├── prisma.ts                # Prisma client
│   ├── queue.ts                 # job queue with retries
│   ├── rate-limit.ts            # in-memory rate limiter
│   ├── rbac.ts                  # auth + role checks (DO NOT MODIFY)
│   ├── realtime.ts              # SSE client manager
│   ├── stripe.ts                # Stripe client
│   └── validations.ts           # Zod schemas
├── worker.ts                    # background worker entry point
└── middleware.ts                # Next.js middleware
```

## Data Models

- **User** — profile, role (ADMIN/MEMBER), team membership
- **Team** — workspace with slug, owner, members
- **Metric** — key/value time-series data per team
- **Customer** / **Subscription** — Stripe billing state
- **ApiKey** — personal access tokens (SHA-256 hashed)
- **AuditEvent** — immutable action log with metadata
- **EventLog** — async job history with retry tracking
- **Notification** — per-user notification feed

## Event Bus

System emits typed events for key actions:

- `billing:*` — checkout completed, subscription changes, payment failures
- `team:*` — member added/removed, team created
- `metrics:*` — data created, aggregation complete
- `audit:log` — all audit events
- `notification:send` — user notifications
- `api-key:*` — creation and revocation

## Background Jobs

Defined in `src/lib/jobs.ts`:

- `metrics:aggregate` — pre-compute dashboard aggregations, cache results
- `notification:send` — persist user notifications
- `cache:invalidate` — pattern-based cache invalidation
- `audit:persist` — process audit events

Run the worker with `npx tsx src/worker.ts`.

## API Platform

Personal access tokens (`pd_*` prefix) with scope-based authorization.

```
Authorization: Bearer pd_<64-char-hex>
```

Endpoints at `GET/POST/DELETE /api/keys`. Tokens are SHA-256 hashed before storage; the raw key is shown once on creation.

## Stripe

- Checkout at `POST /api/stripe/checkout` (requires `priceId`)
- Customer Portal at `POST /api/stripe/portal`
- Webhook at `POST /api/stripe/webhook` (configure in Stripe dashboard)
- Enable events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Testing

```bash
npm test                    # 25 tests across 3 files
npm run lint                # ESLint
npm run build               # TypeScript check + production build
```

## Deploy

Set all environment variables in your hosting platform. Configure Stripe webhooks to point to `https://your-domain.com/api/stripe/webhook`. Set `REDIS_URL` for production queue/cache functionality.

## License

MIT
