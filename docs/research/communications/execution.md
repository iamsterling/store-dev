# E — Minimal Supabase-owned communications execution

Research-only dossier. Access date: **2026-10-16 UTC** (local clock observed
03:53Z). No hosted database/provider inspection, production tests, schema changes,
deployment, or sends performed. Only this dossier is owned by E. Depth actually
used: one specialist, **zero children**; source inspection, not runtime verification.

## Decision and stopping boundary

**Coordinator synthesis / review I-02 resolution:** the selected initial queue is **one leased
Postgres work table**, not PGMQ. Its complete initial transition contract is in
[architecture.md](architecture.md#initial-work-table-transition-contract).
PGMQ-specific SQL, two-queue layout, extension/version/export checks and queue acknowledgments
below are a **deferred implementation alternative**, retained as specialist evidence, not
instructions for phase 1. No initial acceptance gate requires installing the extension.

**Recommendation (proposed; high confidence in the boundaries):** Postgres owns
receipts, message/artifact references, actionable work, approval decisions, and an
outbound outbox. Logged PGMQ queues can provide at-least-once work delivery if adopted later. One small
bounded worker implementation starts on Edge Functions; Cron only wakes it. Move
the same worker contract to an external runtime only when capture/processing cannot
fit verified Edge limits or the provider's retention deadline. Do not build a
universal agent platform, Kafka replacement, or provider-independent workflow engine.

Bounded questions answered here:

1. Can authenticated ingress commit a receipt and work atomically? **Yes**, inside
   one Postgres RPC/transaction, not two HTTP calls (E03–E05).
2. Does queue delivery alone prevent duplicate work or stale acknowledgements?
   **No**; use application idempotency and fenced state changes (E02–E04, E16).
3. Can Edge background promises or Cron substitute for durable work? **No**;
   resource limits and unlogged HTTP wakeups remain (E06–E10).
4. Can transactions guarantee a single external send? **No**; acceptance can be
   unknown after a crash. Provider-specific recovery is a launch gate owned by B/C.
5. Does a database backup recover attachments? **No**; separately back up bytes,
   retain a manifest, and rehearse reconciliation before resuming sends (E11–E14).

Competing hypotheses were: H1, Edge plus PGMQ is enough for a bounded email slice;
H2, all processing requires an external worker; H3, direct background tasks/Cron
HTTP provide sufficient durability. Evidence rejects H3. H1 remains a viable deferred
queue alternative; the selected initial work-table design uses the same transaction/fencing boundaries.
Provider attachment expiry, maximum payloads, CPU/memory measurements and
acceptable outage duration distinguish H1 from H2. No account-specific entitlement
or performance claim is established.

## Observed repository versus proposed system

- `docs/backend.md:5–9` identifies formerbase and PostgreSQL 17.11 as historical
  implementation evidence; no new remote verification was done here. AGENTS'
  blanket “no hosted project linked” wording is less current than those docs;
  neither grants new research writes.
- `packages/database/supabase/migrations/20261016032855_resend_event_receipts.sql:9–23`
  contains one private receipt table: event ID, email UUID, event type, provider
  time, ingestion time, SHA-256. Two indexes cover email/time and ingestion time.
  No body, attachment, queue, outbox, conversation or agent state is present there.
- Its `public.record_resend_event` (`:25–64`) is a service-only, fixed-search-path
  definer bridge: insert-on-conflict, identical duplicate returns false, different
  content for the same ID raises `23505`. It does **not** enqueue anything.
- `functions/resend-webhook/handler.ts:94–169` verifies the raw body with Svix,
  bounds body size to 256 KiB, checks metadata, hashes the body, awaits persistence,
  and only then returns 200. It ignores signed non-email events. Database failures
  return 503. This is a useful receipt boundary, **not inbound content capture**.
- `docs/email.md:19–21,46–48,95–108` explicitly says no content/attachment capture
  or outgoing send, and no observed signed Resend-to-database event yet. Historical
  test results are reported there; E did not rerun them.
- `README.md:15–16` and `docs/architecture.md:41–51` confirm missing background jobs
  and authorization/commerce features. Do not present the proposed worker or agent
  tools below as existing capabilities.

## Verified semantics and material contradictions

### Transactions, queue delivery and ownership

**Documented/source-observed:** `pgmq.send` inserts into a Postgres queue table;
`read` selects eligible rows with `FOR UPDATE SKIP LOCKED`, advances `vt`, increments
`read_ct`; `archive` deletes from queue and inserts into archive in one SQL
statement; `delete` permanently removes; `set_vt` changes visibility (E03/E04).
Postgres transactions make receipt+job+send all-or-nothing (E05). Aborted sequence
increments can leave message-ID gaps; IDs are not a count or gapless ledger (E16).

**Important wording limit:** E02 advertises “exactly once” delivery **within a
visibility window**, while E03 explicitly says the message becomes visible again
after timeout. That is consistent with **at-least-once processing**, not exactly-once
effects. Producer retries can also create distinct queue messages for the same job.
Use a stable application job/business key, not `msg_id`, for deduplication.

**Source-observed:** in v1.5.1, `delete`, `archive`, and `set_vt` require queue/name
and message ID, **not a lease token or read count** (E04). A slow worker can otherwise
acknowledge another worker's delivery after its own visibility expires. A lease is
not cancellation: an old process can still be executing. A DB fence protects DB
updates, not an external provider that does not recognize that fence.

**Version gate:** current upstream `main` differs from v1.5.1 in record shape,
archive ownership/dump handling and other features (E04/E14). Supabase's dated
2025-10-08 notice says new projects received 1.5.1 while existing 1.4.4 upgrades
were paused, and warns about `delay` changes (E15). This is not proof that a 2026
project has either version. Future approved inspection must record `pg_extension`
versions and installed function signatures; test that exact combination. Use only
basic `send/read/set_vt/archive` behind owned wrappers, positional explicit types,
and no new FIFO/group API assumptions. Hosted extension pinning is now deprecated
according to the current changelog (E01); do not promise version pin control.

### Execution limits and Cron

**Documented hosted limits (E06):** 256 MB memory; worker wall-clock lifetime 150 s
Free / 400 s paid; CPU 2 s **per request**, excluding async I/O; request idle timeout
150 s. Wall time is worker lifetime, **not guaranteed fresh budget for each request**.
Maximum bundle 20 MB locally / 5 MB server-side; SMTP ports 25/587 blocked. Use the
provider HTTPS API. Streaming large files can still consume memory/CPU in hashing,
parsing, decompression, base64 and SDK buffering; 256 MB is not an attachment allowance.

`EdgeRuntime.waitUntil` permits post-response work but shuts down at runtime limits
(E07). **Inference:** it is a latency optimization after durable enqueue, not a
durable scheduler or safe place to keep the only copy of receipt/content/send intent.
Do not acknowledge a webhook first and hope a background task persists it later.

Supabase Cron recommends at most **8 concurrent jobs** and each at most **10 min**
(E08); these are recommendations, not Edge limits or measured throughput guarantees.
Upstream pg_cron runs one SQL instance of a particular job at once, queues an overlap,
and leaves run history for the operator to clean (E10). **Inference:** a Cron SQL
job that merely queues asynchronous HTTP can finish while prior Edge invocations
still run; this is not worker mutual exclusion.

E09 documents `pg_net` requests start after commit but request/response tables are
**unlogged**, lost on crash/unclean shutdown; responses normally retained six hours;
default HTTP timeout 2,000 ms; intended at most 200 requests/s, not a comms SLA.
Therefore a successful Cron run or HTTP request ID is not processing completion.
Use recurring wakeups and monitor durable backlog/progress. E17's March changelog
reports minimum 5,000 nested calls/minute, while E06's current limits page says
30 requests/trace in 60 seconds. Treat current stricter limit as planning evidence,
not a resolved account fact; do not self-recurse to drain queues. The architecture
does not depend on either nested-call number.

## Proposed minimal state and invariants

Private schema, deny public/customer grants; least-privilege worker RPCs only. RLS
is defense in depth, not permission for an agent to hold `service_role`. Fixed
search paths, restricted EXECUTE and server-side authorization are mandatory.
Existing one-business ownership does not authorize arbitrary recipient/sender use.

Logical records (not migrations):

| Record            | Minimal purpose and uniqueness                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| verified receipt  | `(provider, account_scope, event_id)` unique; digest and provider/received times; enough authenticated payload or retrievable locator for recovery; conflict quarantined                                                   |
| work job          | `job_id`, unique `business_key`, fixed `kind`, receipt/message reference, status, `fence bigint`, lease expiry, attempt count, next attempt, queue message ID, last fixed error code                                       |
| outbound outbox   | unique caller operation key; immutable sender/recipient/content artifact hash, identity and policy/approval version, expiry, status, stable provider request key if supported, provider message ID and acceptance evidence |
| send attempt      | outbox ID + attempt/fence unique; request digest, start/deadline, response classification and evidence reference; no credentials                                                                                           |
| artifact manifest | message/artifact ID, provider object ID, source expiry if known, immutable Storage key, byte count, SHA-256, capture/verification/backup state                                                                             |

Message/conversation/header normalization is owned by A/D; reuse those records,
not a second universal event store. If PGMQ is later adopted, queue payloads contain **job IDs only**, not
full email bodies, credentials or expiring bearer URLs. The deferred PGMQ layout uses logged,
non-partitioned queues: `comms_capture` and `comms_dispatch`, separating urgent
capture from sends waiting on rate limits/approval. Same worker code and RPC
contract; two queues are not two services. One queue is acceptable only if the
fixture workload proves capture deadlines despite send backlog. No unlogged queues.

Job states: `ready → leased → done`; `leased → ready` for known retryable work;
`leased → failed` for permanent/attempt-budget exhaustion. Expired leases are
reclaimable for **idempotent** capture/normalization. Outbound jobs additionally
use `sending → accepted | rejected | uncertain`; **never** reclaim `sending` as
permission to send again. A separate reconciliation step resolves `uncertain`.
An accepted send is not a delivered email. Delivery/bounce facts stay append-only;
do not regress state by applying arrival order as provider event order.

### Deferred PGMQ alternative: transition shapes (not initial implementation)

These are **proposed SQL contract excerpts**, not runnable migrations or tested
functions. Placeholder tables/parameters are intentional. All grouped steps below
are one short RPC transaction; network calls happen **outside** transactions.
Check every expected affected-row count, raise/rollback on a missing guard, and
fix one lock order (job → outbox → attempt) across wrappers. Catching an exception
must not accidentally commit a receipt without its queue message.

**1. Ingress: authenticate first, then atomic receipt + job + queue.**

```sql
-- PL/pgSQL body, READ COMMITTED; v_receipt_id/v_job_id are generated IDs.
insert into comms.receipts(provider, account_scope, event_id, digest)
values (p_provider, p_scope, p_event_id, p_digest)
on conflict (provider, account_scope, event_id) do nothing
returning id into v_receipt_id;

if v_receipt_id is null then
  -- Separate statement sees a concurrent committed winner at READ COMMITTED.
  if not exists (select 1 from comms.receipts
    where provider=p_provider and account_scope=p_scope
      and event_id=p_event_id and digest=p_digest) then
    raise exception 'receipt_content_conflict';
  end if;
  return; -- identical retry; no second job
end if;

insert into comms.jobs(id, business_key, kind, receipt_id, status, fence)
values (v_job_id, p_business_key, 'capture', v_receipt_id, 'ready', 0);
select msg_id into strict v_msg_id
from pgmq.send('comms_capture'::text,
              jsonb_build_object('job_id', v_job_id)) as msg_id;
update comms.jobs set queue_msg_id=v_msg_id where id=v_job_id;
-- HTTP 2xx only after RPC commit; lost response → safe provider retry.
```

This extends the current receipt pattern; it does not claim the old minimal
Resend metadata is sufficient for full recovery. Two deliveries representing the
same provider email may be different events; preserve receipts but deduplicate
capture at the message/artifact business key, not by discarding valid event types.

**2. Claim: queue read and application fence in the same RPC.**

```sql
select * into r from pgmq.read('comms_capture'::text, 120::integer, 1::integer);
-- If none: return empty. Validate job ID shape; malformed payload is quarantined.
update comms.jobs
set status='leased', fence=fence+1,
    lease_until=clock_timestamp()+interval '120 seconds', attempts=attempts+1
where id=(r.message->>'job_id')::uuid and queue_msg_id=r.msg_id
  and next_attempt_at <= clock_timestamp()
  and (status='ready' or
       (status='leased' and lease_until <= clock_timestamp()))
returning * into j;
-- Return job + new fence + expiry only after commit.
```

120 s is a **fixture starting value**, not a service guarantee. Pick a smaller
work chunk and real lease after latency tests. Do not read a large batch whose
last item cannot start before its lease expires. If no guarded update: inspect
under lock; archive only terminal/stale queue messages safely; otherwise leave
for redelivery. Do not blindly delete a job owned by an active claimant. Dispatch
claim permits only `ready` or expired pre-send `leased`, **not** `sending`.

**3. Completion, retry, heartbeat: no naked queue acknowledgements.**

```sql
select * into j from comms.jobs where id=p_job_id for update;
-- Require status='leased', fence=p_fence, queue_msg_id=p_msg_id,
-- lease_until > clock_timestamp(); else raise 'stale_claim'.
-- Apply normalized message/artifact/result writes with unique business keys.
update comms.jobs set status='done', lease_until=null where id=p_job_id;
if not pgmq.archive(p_queue::text, p_msg_id::bigint) then
  raise exception 'queue_ack_missing';
end if;
```

Queue name is selected by server-side kind, **not arbitrary caller input**. A
heartbeat holds the same job lock, validates current fence/unexpired lease,
updates job expiry and calls `pgmq.set_vt(queue,msg_id,seconds)` in that transaction.
Retry holds the same lock and guard, sets `ready`, clears lease, persists bounded
exponential backoff+jitter/Retry-After in `next_attempt_at`, and sets queue VT to
that backoff. Preserve the same queue message. A crash rolls back both. Attempt
budget is application attempts, not raw queue `read_ct`. Exhaustion sets `failed`
and archives atomically; show it in operator work, never silently drop it.
All worker entry points use wrappers, so an old worker cannot call raw `set_vt`,
`archive`, `delete` or update job rows directly.

**4. Outbound: freeze intent, authorize, then record possible send before network.**

- Approval/enqueue RPC locks the outbound intent, validates current actor/policy,
  expiry, sender/recipient allowlists and immutable content hash. Insert outbox
  keyed by stable caller operation ID; same key/different content is an error.
  Insert the dispatch job and `pgmq.send` in this same transaction. A tool cannot
  bypass an expired/declined approval by inventing a different operation key.
- `begin_send(job_id,fence)` locks job then outbox, validates unexpired claim,
  approval version/expiry, suppression and content digest. Perform guarded state
  change and append send attempt in the transaction:

```sql
update comms.outbox set status='sending', dispatch_fence=p_fence,
  dispatch_started_at=clock_timestamp()
where id=p_outbox_id and status='queued'; -- must affect exactly one row
update comms.jobs set status='sending' where id=p_job_id;
insert into comms.send_attempts(outbox_id,fence,request_digest,started_at)
values(p_outbox_id,p_fence,p_digest,clock_timestamp());
```

- Only after successful commit does the worker invoke provider HTTPS, with hard
  deadline and the stored stable request key **if** B/C establishes its semantics.
  No database row lock spans the provider call. No HTTP/client automatic retry of
  a non-idempotent send. A failed/unknown `begin_send` RPC response is not permission
  to call: first read/reconcile state. Duplicate worker execution of a claim must
  not produce a second network call; only the successful queued→sending transition
  grants that one attempt.
- `record_send_result` locks job/outbox and checks dispatch fence and attempt.
  Known acceptance sets outbox/job `accepted`/`done`, stores provider ID/evidence,
  and archives queue atomically. Known nonacceptance is classified by B/C: permanent
  → `rejected`/`failed`; retryable **definitely not accepted** → `queued`/`ready`
  with backoff. Network timeout, ambiguous 5xx, missing response, or process death
  after `begin_send` → `uncertain`, never ordinary retry.
- Sweeper converts expired `sending` to `uncertain` under the same locks, fences
  future mutations, archives dispatch and opens reconciliation work. Late old
  results may append bounded evidence for the original attempt but cannot change
  canonical state through the stale fence. Reconciliation can then adopt verified
  acceptance. **No new send attempt until uncertainty is safely resolved.**

The unavoidable gap is provider acceptance → crash before DB acceptance commit;
also DB `sending` commit → crash before actual call is indistinguishable locally.
Neither Serializable isolation nor a longer visibility lease solves it. Recovery
needs provider idempotency with known key scope/TTL/payload rules, authoritative
lookup by stored operation/provider correlation, or human review choosing between
possible duplicate and possible omission. A fence cannot stop an already-started
HTTP call. Provider B/C owns the exact replay/reconciliation proof; absent that,
automatic resending uncertain mail is **rejected**. Advertisements/financial actions
receive no authority from this design.

## Attachments: capture deadline before agent work

**Proposed:** verified inbound event immediately creates capture work. Retrieve
body/raw MIME and attachment bytes with provider object IDs; record source expiry,
size, content type and original filename as untrusted metadata. Do not merely
save an expiring download URL. B/C must establish provider retrieval/retention and
refresh behavior; E makes **no provider-specific expiry claim**.

Capture uses deterministic immutable object keys (message/artifact ID plus digest),
byte limits, allowed provider hosts/redirect policy, request deadlines and bounded
streaming. Do not fetch arbitrary email-supplied URLs (SSRF). Do not execute HTML,
macros or attachments. Quarantine and scan before agent interpretation or sharing;
an external worker may be required for MIME parsing, AV/OCR, decompression or
native libraries. Keep original evidence distinct from sanitized extracted text.

Storage write and application DB completion are **not one transaction**. Reserve
manifest → upload immutable bytes without overwrite → verify size/hash/readability
→ fenced mark `captured`. Crash after upload leaves an orphan recoverable by key;
crash before upload leaves pending capture. Retry checks existing object and hash,
not “object exists therefore success.” Never mark message complete until required
artifacts are captured or explicitly marked unavailable with escalation. Private
bucket/access wrapper, not public URLs; E12 documents service keys bypass Storage
RLS, so workers must not hand them to agents.

Required feasibility inequality (inference): outage allowance + queue delay +
capture/retry budget + safety margin **< provider retrieval retention**. If it
cannot be met, launch is blocked or capture moves to an authorized always-on
external worker/durable ingress. External compute alone does not repair a provider
that discarded the only bytes during an outage. Deadline-first capture queue and
alerts matter more than fast drafting. Proposed Edge starting envelope: one small
item per invocation, stop taking work early, external I/O deadlines well below
150 s, no unbounded task loops. Actual CPU/peak-memory/throughput envelope remains
unmeasured and must be established with synthetic maximum-size fixtures.

## Narrow worker and agent tool interfaces

Worker-only RPC/API surface: `accept_verified_receipt`, `claim_capture`,
`claim_dispatch`, `heartbeat_claim`, `finish_capture`, `retry_or_fail_claim`,
`begin_send`, `record_send_result`, `reconcile_uncertain`, and a bounded sweeper.
Server code chooses queue, backoff bounds, allowed state transitions and result
classification; caller cannot supply arbitrary SQL, queue, URL, or terminal status.
Worker credentials are dedicated capabilities where available; otherwise confine
the secret to trusted server adapters and explicitly acknowledge its larger blast
radius. Cron wakeup endpoint must authenticate a dedicated secret/verified worker
identity; the public publishable key in a tutorial is not worker authorization.

Agent tools: `read_conversation(id,limit)`, `read_safe_artifact(id)`,
`propose_reply(conversation,expected_version,content_ref,operation_key)`,
`request_approval(intent,policy_version)`, `get_action_status(id)`. An authorized
server policy may transition an eligible routine reply to queued; agents do not
call raw send, queue admin, unrestricted Storage, provider keys or service-role
SQL. Human approval binding covers exact immutable intent/version and expiry;
no response declines/expires, never implies approval. Actual approval duration
and consequential-action thresholds remain owner decisions, not defaults here.

## Retention, indexes, backups and restore

**Documented:** daily DB backups on Pro/Team/Enterprise with 7/14/up-to-30-day
access respectively; Free should export/offsite; PITR is paid add-on, requires at
least Small compute, replaces daily backups, worst-case documented RPO two minutes;
restore causes downtime. Database backups include Storage metadata, **not bytes**;
project deletion also removes hosted backups (E11). These are service policies,
not observed configuration of formerbase. Do not claim zero loss or a tested RTO.

**Proposed minimum:** choose explicit RPO/RTO and retention before dependence on
email history. Back up private object bytes independently to an approved separate
failure domain with hash manifest and deletion/version policy; approve resources
first. A same-project second bucket is not independent disaster recovery. Match
object retention to the oldest retained DB recovery point, plus operational margin;
otherwise restoring valid metadata yields missing objects. Backups also prolong
PII retention; deletion/tombstone replay and access governance are H/owner decisions.

Keep indexes narrow: receipt unique provider/account/event and `received_at`;
message `(conversation_id, occurred_at, id)`; unique provider message/artifact IDs;
jobs partial indexes on `(next_attempt_at,id)` for ready work and `(lease_until,id)`
for leased/sending sweeps; outbox operation-key unique and provider-ID lookup;
artifact unique object key and capture deadline/state lookup. Match query predicates
to actual indexes using local `EXPLAIN`, not unused-index warnings on empty tables.
PGMQ v1.5.1 creates VT and archive-time indexes (E04). Don't add blanket JSON GIN,
vector search or partitioning before a real query/volume need.

Queue archive is not the communications history or an immutable backup. Retain
authoritative message/intent/attempt records independently. Delete/archive rows in
bounded batches after an approved period, keep unresolved work and uncertainty,
and preserve minimal deduplication tombstones through the provider replay horizon
and recovery window. Premature receipt deletion allows old events to look new.
Cron history needs its own cleanup (E10). DELETE does not immediately shrink disk;
vacuum cleans dead tuples and index space for reuse; avoid routine `VACUUM FULL`
and its exclusive lock (E13). Retention period is intentionally not invented.

**Logical restore trap (source-backed risk, not a reproduced incident):** E14
upstream `main` marks configuration tables for dumps and no longer treats queue
archives like older extension members. E04 v1.5.1 adds queue/archive tables to the
extension; E18 explains ordinary extension members are not independently dumped
unless configured. This requires a version-specific export/restore test; generic
`db dump` success is insufficient evidence that queue rows/sequences/archives
survived. Physical backups and logical exports are different. Keep jobs/outbox in
ordinary application tables so pending work can be rebuilt from authoritative
state if queue contents need reconstruction; never reconstruct sending/uncertain
jobs as automatic sends. Do not patch upstream extension internals speculatively.

Restore runbook boundary: externally disable sender credentials/worker triggers
before restore (a DB-only pause flag may itself roll back); fence old workers and
rotate worker epoch/capability; restore DB + bytes; verify manifest/hash and
permissions; inspect installed extensions and queue rows/sequence state; replay
provider events since recovery point where available; reconcile every send that
could have been accepted after that point; rebuild only safe work; resume capture
first and sends only after explicit review. A DB restore does not unsend mail or
restore provider idempotency keys beyond their retention. This is the same external
side-effect gap at disaster-recovery scale.

## Operating failures and safe fixture experiments (not executed)

| Scenario                                      | Required outcome / distinguishing fixture observation                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| RPC fails after receipt insert/before enqueue | Neither committed; local fault injection verifies rollback, no receipt without work                          |
| Duplicate signed delivery/concurrent inserts  | One receipt/job/message; same key/different digest errors; two local SQL sessions, no real provider          |
| Response lost after ingress commit            | Retry is identical duplicate, no extra queue work                                                            |
| Two consumers, then lease expiry              | Initial claims disjoint; expired job redelivered; stale fence cannot finish/heartbeat/archive newer delivery |
| Worker killed mid-capture/upload              | Job redelivers; deterministic object recovered; no duplicate manifest or false captured state                |
| Poison/malformed payload                      | Fixed error + failed/quarantined work visible; no infinite tight read loop                                   |
| Lost pg_net wakeup / overlapping Cron HTTP    | Next tick recovers backlog; DB fence, not scheduler, prevents concurrent state completion                    |
| Provider accepted then response dropped       | Fake provider retains acceptance; job becomes uncertain, never blind second send; reconcile by B/C contract  |
| Process killed after begin_send before HTTP   | Conservatively uncertain; no claim that mail was sent                                                        |
| Expired approval/content changed              | begin_send denied, operation key cannot be reused for changed body                                           |
| Attachment URL expires during outage          | Test fake retrieval/refresh contract; deadline alert; unavailable is explicit, not empty attachment success  |
| Restore to before accepted mail               | Network disabled during fixture restore; reconciliation required, no automatic resend                        |
| Logical dump/restore on installed PGMQ        | Verify ordinary jobs/outbox, queue/archive counts, next identity values, grants and RLS; document omissions  |
| Object/DB recovery mismatch                   | Missing/hash-mismatched bytes block artifact availability and agent access                                   |

Coordinator can run isolated PostgreSQL/Supabase fixtures and a localhost fake
provider; no production tests are requested. Add denied-role and isolation tests
for every worker/agent RPC. Record latency, maximum resident memory and CPU at the
largest permitted MIME/attachment sizes before selecting Edge versus external.
Unit/static success alone is not proof of hosted runtime or provider integration.

Minimum human dashboard/alerts: oldest pending capture relative to expiry,
last successful worker progress (not merely Cron success), backlog age/count,
expired leases, failed jobs, uncertain send count, retries/429s, free DB/storage
capacity and latest verified backup/restore rehearsal. Alert delivery must have a
route independent of the email pipeline being monitored; exact integration belongs
to H/owner. Bounded daily review is still required; agents do not own risk acceptance.

## Source register (retained primary sources)

All URLs below were actually fetched on **2026-10-16 UTC**. Supabase guide pages
are rolling hosted-product documentation, without an explicit version/publication
date unless noted. Source truth is assessed, not assumed from vendor wording.

| ID  | URL; version/date                                                                                                                                                                            | Supported claim, limit and why retained                                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | <https://supabase.com/changelog.md>; current index through 2026-10-14                                                                                                                        | Currency scan; 2026-07-22 extension pin deprecation, 2026 backup fixes, 2025 PGMQ change; index is a lead/summary, not evidence of project rollout                                                |
| E02 | <https://supabase.com/docs/guides/queues.md>; rolling Supabase Queues                                                                                                                        | Postgres-native durable queues; exactly-once wording scoped to visibility; direct product positioning checked against implementation                                                              |
| E03 | <https://supabase.com/docs/guides/queues/pgmq.md>; rolling PGMQ guide                                                                                                                        | Read/expiry/reappearance, pop at-most-once warning, send/delete/archive/set_vt; primary API definitions, not ownership fencing guarantee                                                          |
| E04 | <https://raw.githubusercontent.com/pgmq/pgmq/v1.5.1/pgmq-extension/sql/pgmq.sql>; tagged v1.5.1, release date not established here                                                           | Actual SQL send/read/SKIP LOCKED/archive/delete/set_vt and logged creation/index/member behavior; strongest bounded implementation evidence, not installed-project proof                          |
| E05 | <https://www.postgresql.org/docs/17/tutorial-transactions.html>; PostgreSQL 17.11 docs                                                                                                       | All-or-nothing DB changes/commit; does not include external HTTP/object-store effects; matches documented project major version                                                                   |
| E06 | <https://supabase.com/docs/guides/functions/limits.md>; rolling hosted Edge                                                                                                                  | 256 MB, 150/400 s worker life, 2 s/request CPU, 150 s request timeout, bundle limits, blocked SMTP, nested limit; direct current limits, no entitlement measurement                               |
| E07 | <https://supabase.com/docs/guides/functions/background-tasks.md>; rolling Edge                                                                                                               | waitUntil behavior and shutdown at resource caps; not documented durable retry; explicitly qualifies tempting background shortcut                                                                 |
| E08 | <https://supabase.com/docs/guides/cron.md>; rolling Supabase Cron                                                                                                                            | pg_cron integration; 8 concurrent/10 min recommendations; not hard compute quota or completion SLA                                                                                                |
| E09 | <https://supabase.com/docs/guides/database/extensions/pg_net.md>; beta API, reconfiguration v0.12.0+                                                                                         | HTTP after commit, unlogged queues/responses, six-hour response TTL, 2 s default timeout, 200 req/s intention; decisive wakeup-not-work durability distinction                                    |
| E10 | <https://raw.githubusercontent.com/citusdata/pg_cron/main/README.md>; upstream main snapshot                                                                                                 | One SQL instance/job; overlaps queued; settings/history cleanup; upstream default 32 max running differs from hosted recommendation 8, not hosted entitlement                                     |
| E11 | <https://supabase.com/docs/guides/platform/backups.md>; rolling, physical backups for Postgres 15.8.1.079+                                                                                   | Paid daily/PITR policies, two-minute worst-case documented PITR RPO, downtime, Storage bytes excluded and project deletion removes backups; authoritative recovery scope                          |
| E12 | <https://supabase.com/docs/guides/storage/security/access-control.md>; rolling Storage                                                                                                       | Default upload denial/policies, overwrite grants and service-key RLS bypass; justifies private trusted capture wrapper, not malware safety                                                        |
| E13 | <https://www.postgresql.org/docs/17/routine-vacuuming.html>; PostgreSQL 17.11 docs                                                                                                           | Updates/deletes leave dead tuples; ordinary vacuum reuse versus FULL rewrite/lock; retention must include index/space maintenance                                                                 |
| E14 | <https://raw.githubusercontent.com/pgmq/pgmq/main/pgmq-extension/sql/pgmq.sql>; mutable main snapshot                                                                                        | Current source differs: last_read_at/record shape, config dump calls, archive member handling; contrast only, not production contract                                                             |
| E15 | <https://supabase.com/changelog/39378-potential-breaking-change-in-pgmq-from-1-4-4-to-1-5-1-and-temporary-halt-on-upgrade-for-existing-projects>; published 2025-10-08, PG image 17.6.1.016+ | Explicit version/upgrade/delay warning; dated notice does not settle 2026 installed extension                                                                                                     |
| E16 | <https://www.postgresql.org/docs/17/transaction-iso.html>; PostgreSQL 17.11 docs                                                                                                             | READ COMMITTED snapshots/ON CONFLICT concurrency, UPDATE predicate recheck, sequences not rolled back, Serializable retries; supports simple guarded updates rather than magical global atomicity |
| E17 | <https://supabase.com/changelog/43644-edge-functions-rate-limits-on-recursive-nested-edge-functions-calls>; published 2026-03-11, policy introduced 2026-03-06                               | Historical 5,000/min request-chain budget conflicts with stricter current guide; no self-recursive architecture relies on it                                                                      |
| E18 | <https://www.postgresql.org/docs/17/extend-extensions.html>; PostgreSQL 17.11 §36.17.3                                                                                                       | Extension members ordinarily omitted from logical dump unless configuration relation; validates restore-risk mechanism, not an actual tested Supabase omission                                    |

Supplemental fetched sources: <https://supabase.com/docs/guides/queues/api.md>
confirms `pgmq_public` client wrappers (not adopted for agents);
<https://supabase.com/docs/guides/functions/schedule-functions.md> confirms
Cron+pg_net+Vault wakeup recipe (tutorial publishable key is not internal authority);
<https://supabase.com/docs/guides/storage/production/scaling.md> supports bucket
size limits and listing-performance tradeoffs, not necessary for the minimal decision.

## Research ledger, unknowns and verdicts

**Negative results retained:** broad `web_search` returned
`WEB_SEARCH_CONFIG_INVALID`; no snippets were accepted as evidence. Context7
library resolution returned monthly quota exceeded; direct primary webfetch was
used instead. `curiosity_decide` was not discoverable by exact-name tool discovery
(returned no such tool); ordinary bounded evidence-led reflection is recorded
here, without claiming native execution. Initial guessed migration directory was
absent; actual files were found under `packages/database/supabase/`. No hosted
tools, REA, delegated child, or runtime experiments were used: this question is
answered by complete ordinary source/docs, not binary/runtime investigation.

Curiosity pass at local evidence boundary: atomic enqueue versus two-call gap
(relevance/value/novelty high, low cost) was pursued with Postgres + PGMQ SQL.
At queue boundary: stale acknowledgement and version drift (high/high/high,
low cost) won over generalized FIFO/platform research. At execution boundary:
pg_net durability (high/high/high, low cost) was pursued and invalidated direct
HTTP-as-work. At restore boundary: extension-member logical-dump behavior
(high/high/high, moderate cost) was pursued with PostgreSQL extension docs and
both PGMQ sources. Final pass: account configuration and workload performance
are important but cannot be settled within no-production-call authority; gated
fixture/approved inspection is more valuable than further web searching.

`CURIOSITY_NO_GO`: enterprise orchestrators/multi-region HA, vector memory,
general agent marketplace, upstream FIFO/group features and full provider research
are outside the minimal decision or sibling ownership. Arbitrary retention-day
prescriptions have low evidence value without owner/H decisions. Independent
external-worker vendor comparison is deferred until a concrete Edge envelope or
capture-deadline failure exists. Current index exposes TLS and other changes, but
exhaustive unrelated changelog archaeology cannot alter these execution boundaries.

| Verdict | Item / confidence                                                                                                                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Adapt   | Atomic DB receipt+job transaction initially; optional PGMQ enqueue only if later adopted. At-least-once processing, DB idempotency and fenced completion apply to both. High, documented plus inspected SQL; not fixture-tested                                                      |
| Adapt   | Edge worker + periodic Cron wakeup, small batches and deadline-first capture; keep Postgres state when changing compute. High on limits, medium on workload fit pending fixtures                                                                                                     |
| Adopt   | Outbox `uncertain` state and provider reconciliation gate; immutable approved intent. High conceptual confidence; provider proof owned by B/C                                                                                                                                        |
| Reject  | `pop` for durable external processing; naked ack/set_vt; background promise as sole receipt; pg_net as durable outbox; DB restore as permission to resend. High                                                                                                                      |
| Defer   | External worker infrastructure until attachment/CPU/memory/retention envelope requires it; then explicit target and owner authorization. Medium conditional                                                                                                                          |
| Gate    | Signed live ingress, provider retrieval/expiry/idempotency recovery, selected work-table fencing, independent byte backup, restore rehearsal, policy/approval expiry and alert route. Installed PGMQ signatures/export tests only if extension adopted later. Unknown until verified |

**Stop:** actionable architecture and failure boundaries are established. More
general documentation would not resolve the remaining provider/account/fixture
unknowns. This dossier is a design recommendation, **not implementation, launch
approval, a security audit, or a demonstrated reliable email service**.
