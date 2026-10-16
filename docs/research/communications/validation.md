# Validation evidence and operational acceptance

Research scope is not production authorization. Tests below have distinct evidence levels.
No live Bird/Resend account credentials or approved sink mailboxes were available; no paid
resource, DNS change, unsolicited send, customer mutation or hosted migration was attempted.

## Executed observations

### V01 — Existing receiver rejects invalid ingress and minimizes stored data

Claim: existing handler validates synthetic raw-body Svix signatures, rejects malformed/replayed/
oversize input, awaits injected persistence and returns retryable errors without leaking details.
Procedure: `pnpm --filter @repo/database test`. Preconditions: existing pinned Deno and local
fixture key, mock persistence. Pass: all named tests pass, no network sends or real secrets.

Observed command output:

```text
running 16 tests from ./supabase/functions/resend-webhook/handler.test.ts
valid signed event persists only minimal metadata ... ok
duplicate database receipt is acknowledged without another workflow ... ok
missing signature is denied ... ok
raw body tampering is denied ... ok
expired and future replay timestamps are denied ... ok
oversize body without Content-Length is rejected before persistence ... ok
database errors are retryable and do not leak details ... ok
ok | 16 passed | 0 failed
Command exited with code 0.
```

Full test names remain in `handler.test.ts`. **Pass within fixture scope**, not proof that
Resend is configured, that a DB transaction enqueues work, or that Bird uses Svix headers.
The duplicate test injects a duplicate result; it does not itself exercise real SQL deduplication.

### V02 — Existing hosted deployment and privilege metadata

Preconditions: owner-identified formerbase read access only. Procedure: migration/table/function
listing, security advisor, bounded `pg_namespace`/`pg_extension`/`pg_proc` privilege query and
receipt count. No customer rows or message bodies fetched. Observed: migration `20261016032855`,
ACTIVE receiver, PostgreSQL 17.11, RLS enabled, **0 receipts**, no integrations schema USAGE for
anon/authenticated/service_role; restricted receipt RPC callable only by service_role. No PGMQ
installed. Existing `rls_auto_enable()` advisory remains unresolved.

Result: **observed deployment/catalog state**, not behavioral security certification. Zero
receipts does not prove absence of external Resend use; it proves no receipts in this table
at inspection. No signed end-to-end delivery was demonstrated.

### V03 — Executable failure-boundary models

Procedure: `node docs/research/communications/boundary-model.mjs`. This file has no external
I/O and no production integration. Preconditions: synthetic in-memory state and clock.
Pass criteria: assertions reproduce unsafe counterexamples and explicitly modeled safeguards.

```text
PASS split receipt/work commits exhibit a lost-work crash window
PASS modeled atomic receipt/work rolls back or commits both
PASS provider acceptance plus lost result makes blind retry duplicate
PASS mocked idempotency suppresses retries only inside its assumed window
PASS exact-version owner approval expires; spoofed mail is not authority
PASS append-only delivery facts do not clear complaint on delayed delivery
6 model checks passed; 0 live-provider guarantees tested
Command exited with code 0.
```

Consequence: separate commits are insufficient; local outbox/leases do not solve remote
ambiguity; advertising silence and changed-version approvals must fail closed; suppression
cannot be projected by last webhook arrival. **These are toy models, not application approval,
queue, crash-recovery or provider tests.** They make failure reasoning reproducible only.

### V04 — Repository regression checks

Initial `pnpm check && pnpm smoke` exited **1** because seven new research Markdown files were
not formatted; 12 other tasks succeeded or replayed Turbo cache. `pnpm smoke` did not run in
that attempt because of `&&`. Final `pnpm format && pnpm check && pnpm smoke` exited **0**:
format succeeded; check **13/13 successful, 12 cached**; smoke **3/3 successful, 2 cached**.
The two Next builds were cached; the executed HTTP smoke checked **seven operations-preview
routes plus shared stylesheet**. It was not a storefront/browser/DB integration test.
Local research Markdown link check: **12 targets checked, 0 missing**. Cached results are not
new executions of each underlying suite. No UI behavior changed, so storefront E2E was not rerun.

## Unexecuted acceptance suite — no provider behavior assumed

Use an explicitly authorized sandbox/account and controlled mailboxes only. Each row is a
separate acceptance gate; mocks establish local logic, never provider production guarantees.

| ID / claim                                         | Procedure and failure injection                                                                                                                                                             | Pass criteria                                                                                                                                                                                                                            | Current result / consequence                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| T01 Complete inbound and correct replies           | Send controlled multipart text/HTML, repeated headers, To/Cc/Bcc, Reply-To, Unicode names and nested MIME; capture original/raw bytes and attachments; reply twice and inspect sink headers | All supported artifacts preserved, envelope/display fields distinct, actual RFC IDs available, In-Reply-To/References correct, no subject-only matching; unsupported inputs explicit                                                     | **Blocked:** no approved account/sinks. Hard production gate                                                    |
| T02 Duplicate delivery creates one business action | Replay signed receipt before/after commit and acknowledgment loss; deliver same message through duplicate recipient/event routes                                                            | One scoped event/work and one response intent; same ID/different body is conflict; no repeated send                                                                                                                                      | **Unexecuted:** new queue/message logic absent. Existing V01 only verifies injected duplicate response          |
| T03 Out-of-order delivery facts                    | Deliver complaint before delivered; deferred after bounce; duplicate late bounce; reconcile provider state                                                                                  | Append facts, restrictions never cleared by late delivery, no false total-status ordering                                                                                                                                                | **Model only V03**; real DB/projection fixture required                                                         |
| T04 Atomic intake and lease crash recovery         | Kill before commit, after commit/before ack, after claim and during completion; concurrent workers; expired lease resumes old worker                                                        | Both receipt/work committed or neither; work recovered; stale fence cannot commit; accepted/unknown intent not resubmitted on reclaim                                                                                                    | **Unexecuted:** use disposable local DB after implementation, not production                                    |
| T05 Acceptance with lost response                  | Controlled transport drops result after provider acceptance; disable hidden SDK/proxy retries; restart; test concurrent identical keys and provider-window expiry                           | Bird: no blind retry, unique tag/readback positive reconciliation or unknown hold; stronger automatic recovery requires written contract plus evidence. Resend: same key/payload within 24h returns original result; outside window held | **Blocked:** account/sinks and implementation absent. Ordinary timeout test cannot prove all server crash paths |
| T06 Attachments and expiry                         | Hash binary/inline/nested MIME; near/over supported size; fetch expired URLs and renew; simulate capture outage before/after retention deadline; malformed archives and unsafe URLs         | Durable independent bytes/hash before workflow; bounded download/scan, no arbitrary URL/redirect fetch or archive bomb; quarantine explicit; irreversible expiry alarms                                                                  | **Blocked:** no provider fixture access. Bird 20 MB/30-day doc is not a tested artifact SLA                     |
| T07 Bounce/complaint/auto-response                 | Send to supported provider test sinks; ingest suppressed and late-bounce outcomes; loop auto-replies and DSNs between fixture mailboxes                                                     | No response loops or DSN replies; current local/provider restrictions enforced; acceptance not equated with delivery                                                                                                                     | **Blocked:** no sinks. Auto-Submitted behavior and recipient rules must be approved/tested                      |
| T08 Unauthorized send and spoofed owner            | Authenticated low-privilege agent attempts arbitrary From, recipient, other conversation/attachment; email claims owner; injected content demands tool/spend                                | Tool invocation denied before side effect; audit records denial without secret/content leak; benign authorized routine reply succeeds                                                                                                    | **Model only V03** for identity/approval predicate; actual auth/RLS/tool tests missing                          |
| T09 Silence, expiry and amendment                  | Pending advertising approval with no response; process at expiry; modify recipients/content/amount after grant; replay consumed grant                                                       | No financial execution; amended version needs new authority; expiry checked at side-effect boundary; deadline configured explicitly                                                                                                      | **Model only V03**; no advertising runtime or selected duration exists                                          |
| T10 Outage, replay gap and restore                 | Disable worker; interrupt webhook; exercise Bird pause/unattempted gap; poll with overlap; restore DB plus object archive into isolated target; rebuild queue from canonical jobs           | Missing messages recovered within retention; unknown sends remain blocked; no duplicate accepted intents; restored refs/bytes/hashes consistent                                                                                          | **Unexecuted:** no approved isolated target or backup design deployed. Must pass before live dependency         |

## Solo operating model (proposed defaults to validate)

The following intervals are implementation starting points, not observed service levels or
business commitments: minute-scale bounded drain/recovery sweeps, five-minute overlapping
inbound reconciliation, daily suppression/readback audit. Measure load and rate limits before
selecting schedules, and keep retention deadlines safely larger than outage plus response time.
Do not claim a five-minute poll makes an event API complete or immediately consistent.

| Signal                                                                                  | Automatic response                                                        | Owner visibility                                                              |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Unauthorized side effect, credential compromise, cross-customer exposure                | Stop outbound/mutations; preserve audit; isolate offending worker         | Immediate via independent verified alert route                                |
| Capture deadline risk, webhook paused, sustained failed ingress, growing oldest job age | Retry within budget; independent provider list reconciliation             | Immediate if data-loss deadline or configured outage threshold threatened     |
| Unknown send acceptance                                                                 | Hold intent, attempt positive reconciliation, never blind failover/resend | Exception task; immediate if promised response deadline at risk               |
| Poison job / unsupported attachment                                                     | Quarantine, bounded retries, dead-work record with replay tool            | Digest unless safety/data-loss/response deadline requires immediate attention |
| Ordinary successful work / transient recovered failure                                  | Record metrics and outcome, no approval request                           | Daily digest / weekly review                                                  |

Required counters: verified/rejected ingress; duplicate/conflict rate; capture lag and deadline;
queue ready/leased/dead counts and oldest age; stale-fence rejections; reconciliation coverage
and last success; unknown sends; accepted/delivered/bounced/complained per identity/purpose;
suppression-sync age; owner exception count/age/time spent; provider/model costs and quota headroom.
Logs carry scoped IDs/status/errors, not raw bodies, signed URLs, API keys or attachment contents.
Avoid unbounded high-cardinality tags in metrics even if operation IDs are stored in the DB.

Provider outage: keep intake where available, pause sends, back off, preserve accepted/unknown
state, reconcile before releasing queued work. Operator emergency stop must work without the
model and be checked immediately before dispatch; it cannot recall already accepted email.
Credential rotation needs overlapping verification where supported, a test event and readback;
never put secrets in agent prompts or chat. Break-glass administrator access is distinct from
routine worker privileges.

Backup: choose owner-approved RPO/RTO and retention, export DB with necessary role/extension
coverage, independently copy private objects, protect and test restore credentials, restore
into isolated infrastructure under separate authorization. Verify message/artifact hashes and
reconcile accepted/unknown sends **before** enabling outbound after restore. A pre-backup sent
email must not be resent merely because restored state predates its outcome. Consult E/H for
documented DB/object and PGMQ backup limits. Retention/deletion must include artifacts, extracts,
model logs and backups under applicable obligations, not a perpetual raw-email archive by default.

## Economics and legal acceptance

Use operations.md's illustrative scenarios and equations, not invented business forecasts.
Bird's $15 wallet-deposit/$0.90-per-1,000 page conflicts with fixed-allowance documentation;
do not add deposit and consumed usage as two expenses or assume direct inbound is free.
Optional Bird Mailbox quote terms do not establish pricing for direct inbound. Obtain the
**chosen API's** exact entitlement and meters. Resend's current $20/50k baseline is a comparison,
not a selected subscription. Supabase, artifact backups, model/OCR, worker, observability and
human exception time all matter. No defensible all-in total exists without these inputs.

Business/customer jurisdictions and activities are unknown. Apply the conditional official-source
privacy/consent/data-location checklist in operations.md before real personal data processing;
do not infer incorporation from physical location or classify promotional mail as transactional
to bypass consent. No legal compliance claim is made. Marketing is not enabled by this plan.
