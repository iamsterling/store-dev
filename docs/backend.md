# Backend development workflow

## Scope and authority

The owner identified formerbase (`edwbhglpjyohrqtunkbt`, PostgreSQL 17.11) as this platform's
hosted project and authorized the private Resend receiver. See [email setup](email.md).
The CLI is not implicitly linked, and the Next apps still do not query hosted data.
Local Supabase requires Docker. Other remote changes still require a named target and
owner approval; never substitute a different available MCP database.

## First decision: tenancy

The owner confirmed one business operating its own shop(s), not a merchant SaaS.
Before customer/staff tables, document ownership and permissions.
Define membership/roles, ownership transfer, and which actions a supplier integration can take.
Do not infer tenancy from client-supplied IDs or user-editable `user_metadata` claims.

## Migrations

This project uses imperative, versioned SQL migrations. No declarative schema paths are configured.
Run CLI commands in `packages/database`, or via `pnpm --filter @repo/database exec supabase ...`.
Discover flags using `--help` for the pinned CLI rather than copying stale snippets.

1. Inspect existing schema/migration history. Use `supabase migration new <descriptive_name>`
   to create a new migration, then author/review the SQL. Do not edit migrations applied to shared environments.
2. New exposed tables require `enable row level security`, explicit grants, and policies.
   Local `api.auto_expose_new_tables = false` avoids relying on implicit Data API privileges.
3. Add synthetic local seeds and SQL tests under `supabase/tests/`. Test unauthenticated denial,
   valid ownership, unrelated-user denial, cross-tenant access, and ownership reassignment.
4. Replay with `pnpm --filter @repo/database db:reset` (**local data is destroyed**), run
   `db:lint`, `db:test`, and the CLI advisors available in the pinned version.
5. Regenerate `db:types`, review the diff, run `pnpm check` and `pnpm build`.
6. A remote rollout is a separate reviewed operation. Document reversibility, locks/backfill
   effects, and application/schema compatibility. Prefer additive expand/contract migrations.

No migration is generated just to populate an empty folder. `Database` types now come from
the hosted public schema, including the service-only receipt RPC; private storage is not a
customer API. Regenerate the public schema locally after replaying migrations.
Type generation runs the CLI before atomically replacing the file, so a failed CLI doesn't
truncate committed types. Do not add hand-written fake table types.

## Access control

- Use policies with `TO authenticated` **and** a real ownership/membership predicate.
- UPDATE requires SELECT visibility and both `USING` and `WITH CHECK`; test both.
- Views should use `security_invoker = true` where appropriate; default views can bypass RLS.
- Prefer security-invoker functions. Definer functions require a security review, restricted
  execution grants, fixed search paths, and explicit authorization.
- Validate/authorize at every Route Handler/Server Action; never rely only on a layout or proxy.
- Use verified `auth.getClaims()`/`getUser()` for identity, not unverified `getSession()` data.
- Never create a privileged browser client to make an RLS failure disappear.

## Supabase SSR before authentication

The browser/server helpers are installed for future use, but no authentication flow is wired.
The current server helper follows the read/write-cookie adapter pattern; Server Components
cannot persist cookie changes. **Do not enable authenticated features until a tested Next.js
`proxy.ts` refresh flow is implemented.** Follow the current official guide:
<https://supabase.com/docs/guides/auth/server-side/creating-a-client>.

The proxy must refresh verified claims, propagate cookies to the request and response, and
preserve cache-prevention headers on all returned responses. Do not share/cache user clients
across requests or cache cookie-bearing responses. Test expiry/refresh, invalid tokens, denied
actions, and independent sessions. The proxy is session plumbing, not tenant authorization.

## Dropshipping correctness requirements for future slices

These are requirements to address when implementing features, not prebuilt subsystems:

- Store monetary amounts as integer minor units plus an explicit currency; avoid floating-point money.
- Keep supplier product IDs distinct from internal product/variant IDs.
- Ingest signed webhooks with replay protection, idempotency keys, and durable processing state.
- Supplier calls must have timeouts, retry classification, backoff, and reconciliation.
- Define valid order/fulfillment state transitions; avoid double-ordering on retries.
- Stock is time-sensitive; record sync timestamps and surface stale inventory.
- Redact customer PII and integration credentials from logs; use structured correlation IDs.

Prefer one tested vertical slice (authenticated tenant → supplier/product → order) over broad,
untested CRUD scaffolding.
