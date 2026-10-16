# Store platform

A backend-first dropshipping platform foundation. Turborepo orchestrates a pnpm workspace;
Next.js provides a customer storefront and a separate operations preview; shadcn/ui is owned in a shared package;
Supabase tooling is ready for local database development.

**Implemented:** customer storefront with a sample collection, search/filter/sort, product pages,
and a browser-persisted shopping bag; plus an internal overview, catalog/orders/suppliers empty states, setup guide,
shared UI primitives, typed Supabase client scaffolding, tests, linting, formatting, and CI configuration.

**Not implemented:** authentication, tenancy, business tables, supplier integrations, live
metrics, checkout, payments, background jobs, or a hosted database connection. The placeholder
does not read or write any database. An empty bootstrap `Database` type is intentionally marked
as such until schema exists.

## Quick start

Use Node **24** (`.node-version`) and pnpm **11.9.0** (`packageManager`). If pnpm isn't installed,
install that exact version using your Node tool manager or `npm install --global pnpm@11.9.0`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open **<http://localhost:3001> for the customer storefront**.
The separate internal operations preview is at <http://localhost:3000>.
No secrets or running database are required for either app.

To run only the storefront: `pnpm --filter @repo/storefront dev`.

```sh
pnpm check          # lint, typecheck, unit tests, formatting
pnpm build          # production build; no Supabase credentials needed
pnpm smoke          # builds then serves/checks all preview routes, 404s, and shared CSS
pnpm test:e2e       # builds then tests the customer storefront in desktop/mobile Chromium
pnpm start          # production server (build dependency managed by Turbo)
pnpm format         # format repository-owned source and documentation
pnpm --filter @repo/web typecheck
```

## Workspace

```text
apps/web/             Next.js App Router operations preview
apps/storefront/      Customer-facing shop (port 3001); sample catalog and local bag
packages/ui/          Shared shadcn source, theme tokens, components.json
packages/database/    Supabase CLI project, seeds, migrations, database types
packages/config/      Shared strict TypeScript and ESLint defaults
packages/tooling/     Pinned shadcn CLI and repository formatter
docs/                 Architecture, backend workflow, decisions
```

## Supabase

For a local database, start Docker first, then:

```sh
pnpm --filter @repo/database db:start
pnpm --filter @repo/database db:status
cp apps/web/.env.example apps/web/.env.local
```

Fill the two public values in `apps/web/.env.local` using local status output or the new hosted
development project's Connect dialog. Prefer a publishable key; the local legacy **anon** key
is also accepted. Never use secret/service-role keys. Restart Next after changes; public
variables are embedded at build time in production.

The starter client helpers are not wired into the preview. SSR auth is deliberately incomplete:
before login/protected data is added, implement a refresh proxy and authorization as described
in [the backend guide](docs/backend.md). A URL/key pair is not proof of connectivity.

```sh
pnpm --filter @repo/database db:types  # requires a running local stack; safe file replacement
pnpm --filter @repo/database db:lint
pnpm --filter @repo/database db:test  # requires SQL tests once business schema is added
pnpm --filter @repo/database db:stop
```

`db:reset` destroys **local** development data and replays migrations and seeds. It is never
part of normal install/build/check. No remote project has been linked or provisioned by this scaffold.

## shadcn as a first-class workspace

```sh
# Run from the repo root. Dependencies/components route into packages/ui.
pnpm --filter @repo/tooling exec shadcn add dialog --cwd ../../apps/web --yes
```

Import via `@repo/ui/components/*` and `@repo/ui/lib/utils`. Both workspaces have matching
`components.json` settings. Tailwind v4 shared tokens live in `packages/ui/src/styles/globals.css`;
each app imports them and scans its own source in `src/app/globals.css`.
Review CLI changes before committing, especially aliases
and unexpected dependencies. Avoid a second UI directory in the app for shared primitives.

## Working discipline

Read [AGENTS.md](AGENTS.md), [architecture](docs/architecture.md), and
[backend workflow](docs/backend.md). PRs should be focused, include tests, and document any
migration, environment, permission, or architecture changes.

The GitHub Actions workflow runs a frozen install, quality checks, and production build with no
database credentials. **This directory currently belongs to a parent Git repository. GitHub only
discovers `.github/` at the actual repository root.** If `store/` remains nested, the repository
owner must move/adapt the workflow and Dependabot config to that root, with working-directory
and lockfile paths set to `store/`. If published as its own repository, the included configuration
works at the root as written. Branch protection must separately require the `quality` job.

Dependency updates are configured weekly; automatic merging is not enabled. Database tests
must be added to CI when the first schema is introduced (local Docker stack + migration replay +
RLS tests + generated-type drift check). Current CI does not claim database integration coverage.

### Dependency audit note (2026-10-15)

`pnpm audit` reports one high-severity transitive advisory in `braces@3.0.3`
([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)), reached by the Next
ESLint configuration and shadcn CLI through glob tooling. The advisory lists `>=3.0.4` as patched,
but `npm view braces@3.0.4 version` returned 404 during setup. No audit suppression or unverified
override has been added. Do not feed untrusted glob patterns into these tools; revisit the
upstream patch before treating the dependency audit as clean. This is build/tooling exposure,
not a database or deployed-app security assessment.
# store-dev
