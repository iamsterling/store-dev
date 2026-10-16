# Architecture and boundaries

## Current dependency direction

`apps/web` → `@repo/ui` and `@repo/database/types`.
`apps/storefront` → `@repo/ui`. It is a separate customer-facing app, not another operations view.
It currently owns a small illustrative catalog and a local-only bag; it has no database dependency.
All TypeScript workspaces use `@repo/config`. `@repo/tooling` owns formatting and the shadcn CLI.
Packages do not import apps. UI has no Supabase dependency. Public package `exports` are the
contract; consumers must declare a dependency rather than reaching into sibling directories.

Internal packages are just-in-time TypeScript source consumed by Next. They do not emit a
separate bundle. Add a compiled package strategy only if a consumer actually needs it.
There is no standalone API server yet: Next server-side adapters are the initial boundary.
Extract domain behavior into a framework-free package when actual use cases justify it.

## Frontend

App Router layouts/pages render on the server. Navigation is a small client component for
active-route state. Routes use async params and bounded static section generation. Metadata,
not-found UI, skip navigation, semantic headings, focus states, and responsive layouts are
included. No fonts or images require third-party network access at build time.

The shared design system is owned shadcn/Radix source with Tailwind v4 tokens. Each app scans
its own source in its CSS entry point; the shared UI package does not depend on app paths. Use semantic
tokens rather than ad-hoc colors. The initial theme is light-only; dark variants on generated
primitives are not a complete dark theme. Avoid global client providers until needed.

## Turbo tasks and environment

Root scripts only orchestrate package scripts. `build` follows workspace dependency edges;
Next output is cached except `.next/cache`. A transit task propagates dependency hashes for
source-consuming lint/typecheck/test tasks. Shared config changes invalidate task caches.
Formatting is intentionally uncached because it scans repository-wide files.

Web environment files belong to `apps/web`, not the root. Build hashes include local env files
and the two declared public Supabase variables. Turbo strict env mode stays enabled. New
runtime/build variables must be added to the owning package's example and task environment
configuration. Never put secrets into shared global environment settings without a real need.

## Backend runway, not backend implementation

Supabase CLI/config lives entirely in `packages/database`. The hosted formerbase project has a
private Resend receipt table and signed Edge Function receiver; no commerce tables yet.
See [email setup](email.md) and [the decision](decisions/0004-private-email-events.md).
Client helpers are lazy (env validation happens at client creation), server clients are
request-scoped, and server-only imports prevent accidentally bundling server adapters.

Before authenticated data is connected, complete the SSR proxy/session flow and authorization
tests. Before commerce tables, decide tenancy and data ownership. Before supplier side effects,
decide idempotency, signature validation, retry/backoff, and reconciliation semantics.

## Testing strategy

- Unit tests cover public configuration validation and shared class composition today.
- Production build checks route compilation; runtime HTTP smoke checks validate serving separately.
- Add domain unit tests as real behavior lands.
- Add database integration and cross-tenant RLS tests with the first migration.
- Add browser E2E tests when an actual interactive business flow exists.

Do not mistake a placeholder route or a passing build for a working order pipeline.
