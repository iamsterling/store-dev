# Phased implementation plan and final decision register

**Proposed execution plan, not authority to deploy.** All hosted changes still require a named
target and owner authorization. Work only in this personal-business repository/project; never
reuse employer accounts, credentials or domains. Reuse the existing webhook's tested defensive
patterns, not its event-only schema or provider-specific signature protocol unchanged.

## Phase 0 — Resolve transport gates with a contract-and-fixture proof

- **Objective:** select one actual two-way transport without building production infrastructure.
- **Dependencies:** authorized empty/test Bird account on current regional `/v1` API; explicit
  test recipients; domain/test-route authority if needed; owner budget and jurisdiction answers.
- **Changes:** research proof harness/fixtures only, vendor entitlement sheet and recorded results;
  choose minimal support identity, informational response scope and recipient contract. Confirm
  direct inbound/MIME/attachment/list access and exact service-key permissions. Do not buy optional
  Mailbox merely because it has a familiar name. Obtain applicable written pricing/retention.
- **Acceptance:** T01/T05/T06 provider portions; raw/attachment hashes and actual reply RFC IDs;
  independent inbound listing and trusted receiving-identity mapping surviving lost-webhook backfill
  (Bcc-only, header/envelope mismatch, forwarded mail and two-alias fixtures); measured positive
  send-reconciliation lag; SDK/proxy retries disabled
  for uncertain Bird sends; unknown outcome demonstrably holds. Written acknowledgment of Bird's
  non-atomic retry limitation or a stronger email-specific contract. Fail if undisclosed entitlement,
  incomplete artifacts/replies, unacceptable limits/cost or unacceptable exception burden remains.
- **Decision branch:** if Bird meets bounded workflow requirements and owner accepts exception
  handling, select it. If stronger automatic uncertain-send recovery is required or a gate fails,
  run the same fixtures against Resend; confirm its full-access inbound credential tradeoff and
  artifact retention rather than assuming it passes. Do not install two production senders.
- **Rollback:** remove only test resources created under separate authorization; retain redacted
  evidence. No existing receiver change or production DNS rollback should be necessary.
- **Unresolved:** account/API/region and commercial terms; approved addresses and operator tolerance.

## Phase 1 — Durable private intake and artifact capture, no AI sending

- **Objective:** reliably own received email and recover missed notifications.
- **Dependencies:** selected transport and tested capture contract; approved retention/backup goals.
- **Changes:** versioned migration(s) for minimal private records and restricted RPCs; one leased
  Postgres work table; raw-byte authenticated ingress; atomic receipt/work insert; capture worker,
  private quarantine storage, artifact backup, independent inbound backfill and safe HTML rendering.
  Choose explicit size/time limits and alert deadlines below the provider retention window.
- **Acceptance:** T02/T03/T04 intake, T06, T10 capture/restore portions. Success, malformed input,
  unauthorized roles, cross-customer data/artifact denial, conflicting IDs, concurrent claims,
  delayed events, orphan objects and stale completion tests. Queue rebuild from canonical work
  preserves idempotency. `pnpm check`/`pnpm smoke`; local SQL regression; authorized hosted readback
  only after separately approved deployment. Prove object bytes restore, not just DB references.
- **Rollback:** disable new subscription and worker; preserve durable captured data under retention;
  forward/retain receiving route according to an approved continuity plan before changing MX.
  Disable exposed operations first; do not drop data blindly or edit applied migration history.
- **Unresolved:** owner RPO/RTO, retention and backup destination. PGMQ not needed for this phase.

## Phase 2 — One safe support response workflow

- **Objective:** receive one real class of inquiry, correlate safely, produce an authorized useful
  response, send once intentionally, record transport outcome and recover exceptions.
- **Dependencies:** phase 1; selected model runtime/terms; authenticated owner interface and independent
  escalation route; explicit standing policy for routine informational replies and recipient semantics.
- **Changes:** conversation-scoped read/proposal tools; model/JEV advice optional; immutable action
  versions; deterministic policy, identities and recipient allowlisting; outbox/attempt ledger,
  dispatch fencing, suppression mirror/recheck, loop prevention, kill switch, unknown-send reconciliation.
  Start with non-order-specific help grounded in approved shop information. Ambiguity requests
  clarification or creates an exception; never invent shipping/refund promises from fixture products.
- **Acceptance:** complete T01–T08/T10 for this scope; benign authorized replies succeed without
  per-message owner approval; spoofed owner and injected tools fail; no cross-customer data access;
  identical replay creates no new intent; held unknown send cannot be automatically retried after
  restart/restore; bounced/suppressed/automated messages do not start loops. Measure owner exception
  minutes and message outcomes against owner-selected operating limits before general release.
- **Rollback:** turn off automatic authorization/dispatch while preserving intake and drafts; revoke
  send worker key if needed. Do not resend unknown intents manually without a recorded decision.
- **Unresolved:** JEV runtime is not implemented. Select an actual integration only if useful; its
  classification never substitutes for authentication/policy. External worker only if measured needed.

## Phase 3 — One commerce-aware informational workflow, only after commerce exists

- **Objective:** answer a verified customer's order-status question using fresh authoritative state.
- **Dependencies:** actual Shopify/commerce selection, implemented authenticated access and source
  APIs, notification-ownership inventory; not inferred from prior discussion.
- **Changes:** store scoped external IDs and snapshot provenance/freshness; narrow read-only order
  lookup; authorization at every lookup; verified state refresh; choose exactly one system for each
  transactional notice. No cancellation/refund/discount tools in this slice.
- **Acceptance:** own/other customer, shared/changed email, stale shipment, duplicate commerce events,
  missing source and outage tests. Status email must match fetched state and explicitly handle unknowns.
  Sending “canceled” cannot mark commerce cancellation complete. No duplicate platform notifications.
- **Rollback:** disable commerce data tool and fall back to safe clarification; leave source orders
  untouched. No Shopify data migration is part of this communications plan.
- **Unresolved:** commerce, payment, supplier and fulfillment sources and access contracts.

## Phase 4 — Optional consequential policies, not assumed launch scope

- **Objective:** expand only after demonstrated business value and authority boundaries.
- **Dependencies:** owner chooses actual refund/order/supplier policies, not invented thresholds;
  authentic owner approval control and action-specific source-state validation.
- **Changes:** each action kind separately bounded; exact target/content/amount/currency/state digest,
  expiry, one-time grant consumption, source-side idempotency/result verification and audit. Advertising
  needs explicit approval and a configured duration, with silence = declined/expired. Marketing needs
  actual audience/consent/unsubscribe/jurisdiction design before any campaign.
- **Acceptance:** T08/T09 against real implementation; changed proposal, stale state, expired/consumed
  grant and spoofed owner all reject; valid explicitly authorized action executes and records authoritative
  result; approval alone never marks an external action successful.
- **Rollback:** remove that action capability and pending authority without interrupting safe intake/replies;
  external accepted actions may require compensating business steps, not fictional transactional rollback.
- **Unresolved:** all consequential business policies remain owner decisions. This phase is optional.

## Existing Resend receiver: retain, don't invent a migration

Observed: deployed metadata receiver, zero receipts at inspection, real signed delivery unverified.
No existing mailbox, sending service or customer communications were found to migrate. Leave it intact
during the proof. Once a transport is actually selected, ask whether an external Resend webhook is
still useful; inspect only the authorized personal account and subscription before disabling it.
If retiring later, disable the sender-side subscription first, observe a quiet window, export retained
receipts under policy and then retire receiver credentials/function under separate authorization.
Do not delete the private table as a prerequisite for Bird or assume zero rows means no external use.

## Decision register

| ID  | Choice / status                                                    | Reason and evidence                                                                                                               | Reevaluation trigger                                                                                               |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| R01 | **Preferred gated Bird proof; production conditional**             | Direct current `/v1` two-way API supports app ownership; B01–B08, B22                                                             | Failed entitlement, fidelity, reply, cost, recovery or solo-load gate                                              |
| R02 | **Reject blind uncertain-send retries**                            | Bird B09 explicit non-atomic side-effect gap; V03 counterexample; SDK B21 retries                                                 | Stronger applicable written email acceptance contract and focused evidence; still no indefinite exactly-once claim |
| R03 | **Resend first fallback, not active secondary**                    | C01–C14: complete receiving and stronger 24-hour replay, but broad read credential/retention gaps                                 | Bird fails hard gate or owner prioritizes stronger automatic retry recovery; fallback must pass same suite         |
| R04 | **Defer Mailgun and legacy SparkPost**                             | C15–C23 no general Mailgun send dedupe established; B19 legacy relay recovery unresolved despite 24-hour transmission idempotency | A verified deficiency makes these candidates materially useful                                                     |
| R05 | **Supabase canonical operational state, transport facts external** | Owner requirement; A/G/F and E; no conflicting order/payment truth                                                                | Selected commerce/transport contract changes ownership boundaries                                                  |
| R06 | **One leased work table; no PGMQ installation now**                | No queue exists; Postgres transaction provides needed atomic intake; E proves PGMQ viable but still needs app fencing             | Queue throughput/operational needs justify extension; pin version and backup behavior first                        |
| R07 | **Bounded Edge jobs, conditional external compute**                | E documented CPU/memory/time limits, no durable waitUntil guarantee                                                               | Measured MIME/scan/model tasks exceed limits or deadlines                                                          |
| R08 | **Departmental identity, separate agent principal**                | D envelope/identity/thread standards; owner API-first requirement                                                                 | Actual legal/operational need for separate public identity                                                         |
| R09 | **Scoped tools and deterministic authority**                       | No JEV implementation; F01 security source; untrusted input cannot authorize actions                                              | Explicit new standing policies with tests; model recommendation never sufficient                                   |
| R10 | **Advertising silence expires/declines; exact duration unset**     | Owner requirement, T09                                                                                                            | Owner explicitly configures duration; no automatic fallback approval                                               |
| R11 | **Independent artifact backup and restore**                        | E/H official DB backups exclude Storage bytes                                                                                     | Approved RPO/RTO or retention changes; observed restore failures                                                   |
| R12 | **No omnichannel/campaign/failover framework**                     | No established channel or marketing need; unknown sends make failover unsafe                                                      | Proven workflow need and separately authorized design                                                              |
| R13 | **No presumed compliance or production readiness**                 | Unknown jurisdictions/account terms and no live test evidence                                                                     | Actual jurisdictions/agreements and executed acceptance evidence                                                   |

## Smallest owner input set

For phase 0 only: identify or authorize the personal Bird test account/current API and region,
permitted controlled mailboxes/domain route, relevant business/customer jurisdictions, and budget
and acceptable exception burden. No secret values in chat. Before phase 2: approve the specific
routine-response policy, reply recipient behavior, owner-auth/escalation route and RPO/RTO/retention.
Before advertising or consequential commerce: set expiry and action policies. Do not ask the owner
to repeat the already-confirmed personal-business, one-human, Supabase-state and Bird-preference facts.
