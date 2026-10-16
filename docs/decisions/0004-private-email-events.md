# Private Resend event ingestion

## Context and authority

The owner confirmed this is one business operating its own shop(s), not a merchant SaaS.
They identified formerbase (`edwbhglpjyohrqtunkbt`) as the hosted target and authorized
the private email tables and webhook receiver. No organization/tenant tables are needed
for this slice. Customer and staff authorization are still future work.

## Decision

- `integrations.resend_events` is private storage, not an exposed Data API schema. RLS
  is enabled, with no customer policies or grants. Even `service_role` has no direct
  schema/table privileges from this migration.
- A narrowly scoped `public.record_resend_event` RPC is the server-side insertion bridge.
  Only `service_role` can execute it. Its security-definer privileges are necessary to
  reach the private table, its search path is empty, and all object names are qualified.
  It has no dynamic SQL and does not accept recipient addresses or arbitrary JSON.
- The `resend-webhook` Edge Function verifies the raw body and signed Svix ID/timestamp
  using pinned `svix@2.8.0`, then parses and validates metadata. This library's v2
  `verify()` returns void, not parsed JSON; the regression suite covers that contract.
- Provider authentication replaces user-JWT verification on this function only. It is
  not a public email-sending endpoint. Missing configuration fails closed.
- The unique provider delivery ID is the idempotency key. Identical retries are acknowledged;
  conflicting reuse fails. Events are immutable receipts, not a mutable last-delivery-status
  row, so out-of-order arrivals cannot overwrite history. No email is sent by ingestion.
- Store email ID, event type, provider event time, receipt time, and SHA-256 of the raw body.
  Do not store raw bodies, addresses, subjects, or message content. Logs contain fixed error
  codes only. This is an event ledger, not a customer profile or suppression system.
- Validate a bounded email-event envelope, permitting future `email.*` event names.
  Correctly signed non-email events are acknowledged and ignored. Select email events in Resend.

## Boundaries and follow-up

No SMTP, Auth email hook, outbound API sender, automatic suppression, inbox processing,
customer accounts, or commerce data is implemented. Future `commerce` storage and a deliberate
customer `api` surface should be introduced with actual use cases, not empty schemas.

No automated retention deletion is enabled. Before growing volume, agree retention and add
a reviewed cleanup job using the receipt-time index. Alerts/rate limits and secret rotation
are operational follow-up, not guarantees from this function. A valid signature is not a
substitute for checking future business-specific associations before triggering side effects.

Rollback: first disable the webhook in Resend. Removing the function stops ingestion;
dropping the RPC/table/schema would destroy receipts and requires separate approval.
Do not roll back the database while the webhook is active.
