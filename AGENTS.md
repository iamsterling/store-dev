# Agent working agreement

## Start here

This is a backend-first dropshipping platform foundation, not a working commerce product.
Read `README.md`, `docs/architecture.md`, and `docs/backend.md` before changing behavior.
Inspect `git status` and existing changes first. Work only in this directory; its current
Git root may be a parent directory. Never stage unrelated parent files or initialize a
nested repository without the owner's decision.

## Tools and checks

- Node 24; pnpm version is pinned in `package.json`. Use pnpm, not npm/yarn/bun lockfiles.
- Install: `pnpm install --frozen-lockfile`.
- Before handoff: `pnpm check` and `pnpm smoke` (includes build). Report exact checks and failures.
- Format with `pnpm format`. Do not weaken lint/TypeScript/test settings to pass a check.
- Add a regression test for every behavioral fix. Test success, invalid input, denied access,
  and tenant isolation when the change touches permissions.
- Root scripts delegate to Turbo. Task implementation lives in the owning package.
- Pin new direct dependencies, commit the lockfile, and review install-script approvals.

## Boundaries

- `apps/web`: App Router routes, composition, Next-specific Supabase adapters.
- `apps/storefront`: the customer-facing shop (port 3001), not a merchant dashboard.
  Read its README before changing shopping behavior. Catalog/prices are fixtures; checkout is disabled.
  Run `pnpm test:e2e` for cart or navigation changes (requires the pinned Playwright Chromium).
- `packages/ui`: shared shadcn primitives and tokens. No business logic or database clients.
- `packages/database`: Supabase configuration, migrations, local seeds, generated database types.
- `packages/config`: shared compiler/lint configuration. `packages/tooling`: repo-wide tools.
- Use declared `workspace:*` dependencies and public exports. Never reach into sibling source
  with relative paths. No imports from apps into packages.
- Add a domain package only when real, framework-independent business behavior exists. Do not
  pre-build empty services, queues, microservices, or abstraction layers.

## Next.js and UI

- Server Components by default. Put `"use client"` only at interactive leaves.
- Await Next request APIs (`params`, `cookies`, etc.). Follow the installed Next documentation
  at `apps/web/node_modules/next/dist/docs` when present, otherwise official versioned docs.
- Shared components are owned source: `@repo/ui/components/button`, not an opaque UI dependency.
- Add components using the pinned CLI from the repo root:
  `pnpm --filter @repo/tooling exec shadcn add <component> --cwd ../../apps/web --yes`.
- Inspect generated imports and manifests. Registry output is not automatically correct.
  Use `@repo/ui/lib/utils` for `cn`; remove unnecessary duplicate utility dependencies.
- Use theme tokens, semantic elements, keyboard focus, labels, and honest loading/empty/error states.
- Never represent sample data or configured credentials as a working database connection.

## Backend and security

- No hosted project is linked. Remote writes, resets, deploys, migrations, purchases, or new
  infrastructure require an explicitly identified target and authorization.
- New exposed tables require RLS, explicit least-privilege grants, policies, and isolation tests
  in the same change. See `docs/backend.md`; never grant broad access just to fix a UI error.
- No secret/service-role keys in public env, browser code, logs, fixtures, or commits.
- Validate untrusted input at server boundaries. Authorization must occur at every mutation/read
  boundary; hiding navigation or protecting a layout is not authorization.
- Authentication is NOT implemented. Before using cookie-backed clients for authenticated
  features, add and test the documented Supabase refresh proxy (including cache headers), verified
  identity checks, and route/action authorization. Never trust `getSession()` as identity proof.
- Do not cache user-specific responses or cookie-bearing responses in a shared cache.
- External fulfillment/webhook work must be idempotent and retryable; verify signatures first.

## Definition of done

Keep changes narrow, test them, update relevant docs and `.env.example`, and record consequential
decisions in `docs/decisions/`. Summarize what changed, observed verification, and what remains
unverified. Do not claim deployment, connectivity, security compliance, or feature completion
from compilation alone.
