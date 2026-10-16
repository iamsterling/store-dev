# Resend event receiver

## Hosted target

The owner authorized formerbase (`edwbhglpjyohrqtunkbt`). The first migration was applied
as `20261016032855_resend_event_receipts`. Local filename matches the hosted migration version.
The frontend apps still do not query the database.

Webhook URL:

```text
https://edwbhglpjyohrqtunkbt.supabase.co/functions/v1/resend-webhook
```

## Activate in Resend

1. In the existing Resend webhook's settings, replace the fictional
   `https://formerhuman.com/api/webhooks/resend` URL with the URL above.
2. Select email lifecycle events (for example sent, delivered, delayed, bounced,
   complained, failed). Non-email events are intentionally ignored. This does not
   fetch inbound email content or attachments.
3. Copy **that webhook's signing secret** into Supabase → Edge Functions → Secrets as
   `RESEND_WEBHOOK_SECRET`. This is not the Resend API key. Never paste it into chat,
   browser code, logs, or source control. Updating the webhook URL should use the same
   existing webhook; recreating it may produce a different signing secret.
4. Send a signed test event from Resend (or replay a delivery). Expect HTTP 200 and a
   receipt in `integrations.resend_events`. A resend of the same delivery should not add
   another row. Do not enable production-dependent processing until this succeeds.

The CLI credentials available during implementation could not manage hosted secrets (403).
A live unsigned POST reached the handler and returned 400 rather than the missing-secret
503, indicating a nonempty signing-secret environment variable was present. That alone
does **not** prove it matches the Resend webhook. A signed Resend delivery is required.

## Inspect receipts

Use the privileged Supabase SQL Editor, not a customer browser client:

```sql
select event_id, email_id, event_type, occurred_at, received_at
from integrations.resend_events
order by received_at desc
limit 20;
```

No recipients, bodies, or subjects are stored. `received_at` is ingestion time;
`occurred_at` is provider event time. Ingestion does not send emails or automatically
unsubscribe/suppress anyone. See [the decision](decisions/0004-private-email-events.md).

## Local development and verification

The repo pins Deno for Edge Function lint, typechecking, and tests. Its reviewed install
script links the platform-specific `@deno` binary; the function's npm dependencies are
pinned in `deno.json` and integrity-locked in `deno.lock`.

```sh
pnpm --filter @repo/database test
pnpm --filter @repo/database lint
pnpm --filter @repo/database typecheck
```

For SQL tests, use a **local test database** with the migration applied and Supabase API
roles present. Set `PGHOST`, `PGPORT`, `PGUSER`, and `PGDATABASE` (and password if needed), then:

```sh
pnpm --filter @repo/database db:test:receipts
```

SQL tests use synthetic rows and roll back the transaction. They check insert/retry/conflict,
invalid values, RLS, and denial for anonymous and authenticated customers. This is a
single-business service-only table, not a tenant-owned customer table.

The CI workflow includes PostgreSQL 17 migration replay and role-isolation tests. It must
be adapted to the actual parent Git root before GitHub discovers it (see root README).
This job is not a full Supabase gateway or Edge Runtime integration test.

To serve locally with Docker running, discover the pinned CLI's `functions serve --help`,
copy `packages/database/supabase/functions/.env.example` to `.env.local` there, and pass that
env file. The local config disables JWT checking for this signed-provider endpoint only.
Never put a real signing secret into a fixture.

## Response behavior

| Status | Meaning                                                                                      |
| ------ | -------------------------------------------------------------------------------------------- |
| 200    | Persisted, identical duplicate, or correctly signed non-email event ignored                  |
| 400    | Missing/invalid signature, stale/future timestamp, malformed body, or invalid email metadata |
| 405    | Not a POST request                                                                           |
| 413    | Body exceeds 256 KiB                                                                         |
| 503    | Missing/invalid configuration or persistence failed; provider should retry                   |

Only acknowledge accepted email events after the database RPC succeeds. On 503, inspect
fixed error codes in function logs and the configuration; never log the full request to debug.

## Observed verification and limitations

- 16 Deno handler tests cover valid signatures, tampering, wrong keys, timestamp replay
  windows, malformed payloads, body limits, duplicates, and database failure handling.
- Migration replay and SQL regression passed on temporary local PostgreSQL 16.14.
- Rollback-only behavioral/permission checks also passed on hosted formerbase PostgreSQL 17.11.
- Function deployment and read-back succeeded. Live unsigned POST returned 400; GET returned 405.
- No signed Resend-to-database delivery has been observed yet. No outgoing email was sent.
- Supabase advisors report intentional `rls_enabled_no_policy` on this deny-by-default table
  and an unused retention index while it has no traffic. Separately, the hosted bootstrap
  `public.rls_auto_enable()` function has anonymous/authenticated execution warnings; that
  pre-existing function was not changed by this migration. Review its ACL independently:
  [anonymous definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable),
  [authenticated definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
