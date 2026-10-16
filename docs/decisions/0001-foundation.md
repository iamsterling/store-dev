# 0001 — Backend-first monorepo foundation

Status: accepted for the bootstrap; revisit when real requirements provide contrary evidence.

## Decision

Use pnpm + Turborepo, Next.js App Router, a source-exported shadcn UI workspace, shared strict
TypeScript/ESLint defaults, Vitest, and Supabase CLI-owned database configuration.

## Why

The initial priority is backend development with a modest operational UI. Owned primitives and
explicit workspace edges let future apps reuse UI without prematurely introducing a separate
API deployment. Local database development should be reproducible without hosted credentials.

## Deferred

Tenancy, commerce schema, authentication, background workers, payment providers, supplier adapters,
deployment target, and remote database provisioning. These need product/access-model decisions;
an empty scaffold is not sufficient evidence to choose their architecture.

## Consequences

Next transpiles internal TypeScript packages. The public preview is not a secure admin app.
Authenticated features require SSR refresh plumbing and authorization tests. DB CI must be added
when the first schema lands. Repository-root GitHub configuration only activates when located
at the actual Git root. Avoid hidden Git hooks or account/repository setting changes at bootstrap.
