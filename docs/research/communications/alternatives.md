# C — Focused email fallback decision

Research/access date: **2026-10-16 UTC** (local clock observed at 03:53 UTC).
Owner: alternatives specialist. Authority: public documentation research and this dossier only;
no accounts, credentials, DNS, sends, deployments, purchases, or implementation.

## Decision and executive finding

**Adapt Resend as the first fallback candidate if Bird fails a hard gate. Do not call it
deployed, tested, or selected.** Current Resend documentation explicitly supports two-way
email, including full inbound content, headers, raw MIME and attachment retrieval. The
project's existing lifecycle-metadata receiver is not evidence that those capabilities are
implemented here. The earlier assertion that Resend cannot receive email is rejected.

Resend's most decision-changing documented contract is **24-hour send idempotency**:
retrying the same key and payload returns the original response without sending again.
This is materially stronger than merely searching logs after an uncertain send. It does
not remove the ambiguity after 24 hours. [C01–C06]

Mailgun is the one additional provider examined: strong inbound MIME/headers/attachments,
temporary storage and domain sending keys, but **no general send-idempotency contract was
found in the inspected send API**. Its similarly named inbox-placement key deduplicates
tests, not email sends. Keep it deferred rather than treating it as an equally safe
autonomous-send fallback. SES and Postmark were not evaluated; no inferred feature grades.
[C15–C22]

**Confidence:** high in these documented API capabilities; medium in operational suitability;
unknown account entitlement, real delivery behavior, regional/legal suitability and affordability.
No provider runtime behavior was tested.

### Bounded questions

1. Can the application recover inbound content and attachments when its webhook is lost?
2. Can it preserve reply identities and RFC message correlation?
3. Can it recover a send accepted by the provider when the response is lost, without duplicates?
4. Are ingress authentication, replay handling, suppressions and machine credentials adequate?
5. Which remaining facts would reverse Bird preference or block the fallback?

Competing explanations were: Resend remains metadata-only; Resend now supports full inbound
but cannot recover missed notifications; or Resend supports recoverable two-way transport.
The received-message GET, attachment GET and received-message LIST references distinguish
them and support the third explanation, subject to finite retention. [C01–C04]

## Contract comparison, not a vendor encyclopedia

| Gate                   | Resend current Email/Receiving REST API                                                                                                                                                                                         | Mailgun Send/Routes API                                                                                                                                             | Decision                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Full inbound           | GET returns HTML, text, headers, message_id, reply_to, cc/bcc, attachment metadata; raw signed URL includes original email and attachments. Parsed headers are an object, so use raw MIME where duplicate headers/order matter. | Forward parsed text/HTML and ordered MIME headers; multipart attachments or JSON base64 attachments; MIME destination suffix provides body-mime.                    | Both credible transport capabilities, not proof of a human mailbox UI.                            |
| Missed inbound event   | LIST received messages, then GET each missing ID. Body is not delivered in notification.                                                                                                                                        | store() plus Events search and Messages retrieval, independent of notify delivery.                                                                                  | Resend documented polling recovery is attractive for solo operations.                             |
| Artifact expiry        | Attachment download URL lasts **1 hour**, renewable via Attachments API. General email data retention **30 days** Free/Pro/Scale. Raw response exposes expires_at; raw TTL not separately guaranteed in inspected reference.    | store() says **up to 3 days**. Retrieval also refers to domain message-retention policy. No separate renewable signed-URL attachment TTL established.               | Archive bytes promptly in app-controlled storage; don't persist only temporary URLs.              |
| Replies                | reply_to plus custom headers; guide explicitly uses In-Reply-To and References chain. Sent LIST exposes RFC message_id distinct from API id.                                                                                    | h: custom header prefix and full MIME submission permit reply headers; exact delivered preservation not tested.                                                     | Supabase owns identity/participants/thread correlation; provider thread UI unnecessary.           |
| Uncertain send         | Same key + same payload returns same response within 24h; payload mismatch and concurrent key requests are 409 variants.                                                                                                        | Send returns queued message ID; variables appear in events. Inspected API has no general send-deduplication key.                                                    | Resend first fallback; Mailgun requires unresolved-send hold and reconciliation, not blind retry. |
| Webhook authentication | Endpoint signing secret; signature over raw body and Svix ID/timestamp. Timestamp freshness and ID dedupe are both needed.                                                                                                      | Classic form/event HMAC authenticates timestamp+token, **not body**; new JSON Routes variant documents signing timestamp+entire raw body. Account-wide signing key. | Prefer payload-bound mode; never confuse signed notification with trusted email author/content.   |
| Retry/replay           | Retry schedule totals roughly 27h35m5s after initial attempt; endpoint can auto-disable; dashboard manual replay documented.                                                                                                    | 8h retries except delivery notification; inbound/general schedules differ. Stored-message retrieval is recovery, not webhook replay.                                | Polling reconciliation remains necessary. No verified API replay endpoint for either.             |
| Suppressions           | Team-wide bounce/complaint/manual list; API list/get/add/remove/bulk; events to sync.                                                                                                                                           | Domain-addressed bounce, complaint, unsubscribe API lists/imports/removal.                                                                                          | App maintains consent/safety policy across provider migration; do not unsuppress automatically.   |
| Service credentials    | Bearer API keys; sending_access optionally one domain; full_access can mutate any resource. No inbound-only key documented.                                                                                                     | Basic API authentication; domain sending keys; read roles available on Enterprise/certain Business plans.                                                           | Keep provider secrets in trusted workers, not agents; expose narrow app tools.                    |

Sources: Resend C01–C14/C24; Mailgun C15–C23. All table entries are documented except explicit
inferences/recommendations. Neither table column proves configuration in this repository.

## Resend fallback: critical detail and conditions

### Inbound capture and recovery

**Documented:** `GET /emails/receiving/{id}` returns full HTML/text and parsed headers,
`message_id`, `reply_to`, envelope-related `received_for`, attachment metadata and nullable
`raw` download data. Provider-computed SPF/DKIM/DMARC results are separate from untrusted
message headers, nullable for older emails. Inline HTML can be returned with CID references;
very large expanded HTML forces CID even if data-URI format was requested. [C01]

**Documented:** receiving attachment GET returns content_id, disposition, size, MIME type,
download_url and expires_at; attachment guide explicitly states 1h URL lifetime and renewal
by API call. Receiving LIST supports before/after IDs and up to 100 with an explicit limit.
Use explicit pagination rather than relying on the prose about unlimited/default listing.
[C02–C04]

**Inference/proposed:** verified notification → durable app event → fetch message/raw/bytes →
durable app-owned archive; scheduled received-LIST reconciliation catches lost notifications.
Use raw MIME to preserve repeated headers and non-text MIME parts; quarantine attachments
and render HTML safely. Email sender authentication is evidence, not authority to execute
business actions. Do not copy the attachment guide's unsigned webhook sample as security design.

**Unknown:** general retention docs say 30-day content/metadata/events/logs but do not separately
promise attachment/raw blob retention for that entire window or raw URL renewal semantics.
The raw field is nullable. Require provider confirmation plus authorized expiry/recovery tests;
30 days is a documented planning bound, not an observed artifact SLA. [C01,C02,C05]

### Outbound replies and crash gap

**Documented:** POST `/emails` supports `from`, `reply_to`, recipients, custom headers and
`Idempotency-Key`. The reply guide explicitly includes In-Reply-To = received RFC message_id,
and References = prior references plus parent ID. API IDs and RFC message IDs are different;
sent LIST includes both `id` and `message_id`. [C06–C08,C24]

**Proposed:** persist an immutable send intent, body/attachment snapshot, approved identity,
payload digest and stable key before the provider call. Retrying within the provider window
must reuse the identical payload/key. An ambiguous timeout is not a failed send. Stop automatic
retries safely before key expiry (margin to be set by execution owner); after expiry hold
`acceptance_unknown` for reconciliation/human review. Listing messages with similar time,
subject and recipient does not prove a particular intent was accepted or not accepted.

**Documented:** same-key different payload yields invalid_idempotent_request; concurrent
same-key requests yield concurrent_idempotent_requests and may safely be retried later.
The success response returns the provider email ID. [C06]

**Unknown:** exact key scope across endpoints/keys/team, acceptance-boundary timing and durable
lookup by original idempotency key beyond 24h are not established. Do not advertise indefinite
exactly-once delivery. Delivery to an SMTP server is not proof of inbox placement/readership.

### Identity, credentials, suppressions and solo operation

**Documented:** any local part can send once its domain is verified; no separate sender identity
registration is required. Custom receiving requires its MX and verified receiving domain.
Existing MX and Resend MX are not a mailbox mirroring strategy: use a receiving subdomain or
authorized forwarding; equal-priority MX can distribute unpredictably. [C09,C10]

**Proposed:** allowlist personal-business identities and recipients/purpose in application
policy; domain-scoped send keys cannot constrain local-part identity or authorized business
actions. Use a sending-only worker key and a separate trusted ingestion worker; full-access
read credentials stay behind the service boundary. An agent receives app capabilities, not
the provider master key. Full-access ingestion is a real least-privilege compromise. [C11]

**Documented:** suppressions apply across team domains to transactional and Broadcast sends;
bounce, complaint and manual origins exist. API and suppression.added/removed events support
sync. Not every mailbox provider reports complaints, notably Gmail/Workspace. [C12]

**Documented:** Resend signs raw-body notifications using Svix headers; Svix signs
`id.timestamp.body`, preserves event ID across resends, and requires timestamp checking.
Resend can disable continuously failing endpoints and notify the team by email; manual
dashboard replay and re-enable are documented, not an established API-first full recovery
loop. [C13,C14,C25]

**Proposed:** fast acknowledge only after durable event capture; dedupe authenticated event ID;
monitor received-list lag, ingestion/artifact age and disabled hooks through a separate alert
path. One human must be able to recover without using the failing inbound channel itself.

### Decision-changing cost/limit notes only

Both sent **and received** emails count toward Resend quota. Free is 100/day and 3,000/month;
each outbound To/CC/BCC recipient counts separately. Paid transactional plans remove daily
cap, retain monthly quota and default 5x overage ceiling; all API keys share team rate limit
(starts 10 requests/sec). Receiving catch-all junk therefore affects quota, and hydration
requires multiple API calls. These are planning inputs, not reasons to assume Free fits.
[C05] Mailgun granular read-role availability can require Enterprise/certain Business plans,
which may change single-human affordability. [C21] Full cost modeling belongs to operations.

## Mailgun: why retain it, and why not first fallback

**Documented:** Routes can forward/store/stop; without stop lower routes may also execute.
store(notify=...) retains messages up to 3 days; one can search Events and retrieve Messages
without successful notification. The inbound manual documents raw MIME via Accept
message/rfc2822 and parsed bodies plus ordered header lists and attachment metadata. Forward
JSON includes attachment bytes base64; multipart mode includes actual attachments. [C15–C17]

**Documented:** send custom headers use h: prefix; v: variables appear in events and in delivered
X-Mailgun-Variables (over 4KB may be truncated in events). Accepted response says queued and
returns ID. o:inbox-placement-test-key deduplicates Inbox Placement tests only. [C18]

**Inference:** h:In-Reply-To, h:References and h:Reply-To should implement reply semantics,
subject to delivered-MIME tests. Event correlation via a stable intent variable can confirm
positive acceptance, but missing events cannot prove non-acceptance; it is not send idempotency.
No general send-idempotency contract found is a negative research result, not proof that no
private capability exists. Ask provider if Mailgun must become the selected sender.

**Security distinction:** the classic signature authenticates timestamp+token. Altering body
while retaining these values is not detected by that HMAC alone (cryptographic inference).
Current forward-JSON docs explicitly substitute the whole raw body for token, with signatures
in HTTP headers. Use that mode or an independently secured transport plus API retrieval from
authenticated storage for critical inbound evidence; test the actual chosen payload format.
The generic signing page's claim that the same algorithm applies to every POST omits this
JSON exception. [C17,C19]

**Contradictions/unknowns:** general retry page lists 5m/10m/15m/1h/2h/4h; inbound page lists
10m/15m/30m/1h/2h/4h, both describe 8h and exclude delivery notification. Do not silently merge
these schedules. Route store() says up to 3d whereas stored-message API refers to domain
retention policy and describes sent messages; confirm inbound attachment retention on selected
plan. No separate attachment URL lifetime/refresh or arbitrary webhook replay API established.
[C15,C17,C20,C23]

Mailgun's domain sending keys restrict send endpoints to one domain; read-only Analyst keys
can read messages/routes/logs but suppressions require a different role; granular RBAC is
plan-gated. Domain-scoped bounce/complaint/unsubscribe APIs aid migration, not a business-wide
consent ledger by themselves. US/EU processing choices are documented but jurisdiction and
contract applicability remain unknown. [C21,C22,C26]

## Bird boundary and exact blocked acceptance tests

This dossier makes **no Bird capability claim**; the Bird owner must supply those contracts.
Preserve Bird preference only if its specific offered product passes complete inbound capture,
headers/attachments retention and recovery, correct reply headers, authenticated ingress,
recoverable uncertain acceptance and viable least-privilege operations. Price cannot repair
a failed hard gate.

If Bird cannot document/demonstrate those gates, run Resend acceptance next. If Bird's only
deficit is uncertain-send recovery, Resend's 24h idempotency is a concrete reason to switch
candidate, not a reason to perform blind cross-provider retries. **Never fail over an
acceptance-unknown send to another provider automatically.** That can duplicate an accepted send.

Blocked tests require separately approved account/domain/test targets and permission; none
were performed under this research contract:

1. Receive a controlled MIME corpus: duplicate headers, Reply-To/References, HTML+text, inline
   CID, Unicode and binary attachments; compare raw bytes/parsed output and identify nullable
   raw cases. Verify identities and deliverability through an authorized receiving target.
2. Let attachment URL expire >1h, obtain new URL and verify same bytes. Confirm/test raw URL
   renewal and attachment/raw retention near the chosen plan boundary; document deletion cases.
3. Lose inbound webhook, paginate LIST to recover message and all artifacts; exercise outage
   past automatic retry schedule and endpoint disable/re-enable. Confirm API recovery works
   without dashboard replay. Bound retention and large-message limits explicitly.
4. Lose accepted-send HTTP response; replay identical key/payload inside 24h and verify one
   provider ID and one recipient copy. Exercise concurrent-key 409 and payload-mismatch 409;
   crash after acceptance but before local commit; verify near-expiry hold, not a new send.
5. Inspect delivered reply MIME for From/Reply-To/In-Reply-To/References/Message-ID, then receive
   another reply; verify no confusion between provider UUID and RFC ID, no unintended reply-all.
6. Test wrong secret, modified raw body, stale timestamp, duplicate event and delayed legitimate
   retry. For Mailgun specifically test JSON body-bound signature vs classic token-only mode.
7. Test domain-restricted sender key cannot read/manage or send another domain; demonstrate
   ingestion worker isolation and agents cannot choose arbitrary local-part/recipient/purpose.
8. Synchronize manual/bounce/complaint suppressions, handle suppressed-send outcome and export
   state for migration. No removal without policy/human authorization. Confirm account quotas,
   region, plan entitlement, data-processing agreement and costs against actual requirements.

## Evidence ledger / adaptive bibliography

Every C source below was actually fetched publicly on **2026-10-16 UTC**. All are primary
provider documentation, except Svix which is the primary signing implementation authority
linked by Resend. Product/version is current unversioned Resend REST/Receiving docs, Mailgun
Send/Routes v3 unless specified, or current Svix. Pages usually have no fixed release version;
relative updated dates are not converted into fabricated calendar dates. Claims are
**documented**, not independently measured. Each row states why it was retained and its limits.

| ID   | Observed source URL                                                                                                                    | Exact relevant claim / retention rationale / limits                                                                                                                                                                                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C01  | https://resend.com/docs/api-reference/emails/retrieve-received-email                                                                   | Received GET returns HTML/text/headers/RFC message_id, attachments, provider authentication results and nullable raw signed URL with expiry; retained as exact content contract, not marketing. No explicit raw TTL or repeated-header guarantee.                                               |
| C02  | https://resend.com/docs/dashboard/receiving/attachments                                                                                | Attachment URLs last 1h and can be refreshed by Attachments API; retained to separate URL expiration from deletion. No independent blob-retention promise.                                                                                                                                      |
| C03  | https://resend.com/docs/api-reference/emails/retrieve-received-email-attachment                                                        | GET by email+attachment ID returns size/type/CID/disposition/download_url/expires_at; retained to corroborate programmatic renewal path. No account test.                                                                                                                                       |
| C04  | https://resend.com/docs/api-reference/emails/list-received-emails                                                                      | Team received LIST with before/after and limit up to 100; retained as missed-webhook recovery contract. Explicit pagination needed; no unlimited-retention inference.                                                                                                                           |
| C05  | https://resend.com/docs/knowledge-base/account-quotas-and-limits                                                                       | 30d email data/content/metadata/events/logs retention Free/Pro/Scale; sent+received consume quota; shared initial 10rps team limit; retained for recovery and cost boundaries. Attachment/raw retention not separately enumerated. Inboxes described as early access, not required by fallback. |
| C06  | https://resend.com/docs/dashboard/emails/idempotency-keys                                                                              | POST send/batch and listed Inbox actions support same-key replay for 24h, same response/no duplicate; mismatch/concurrency 409; retained as core crash-gap contract. No indefinite lookup promise.                                                                                              |
| C07  | https://resend.com/docs/api-reference/emails/send-email                                                                                | from/reply_to/custom headers/attachments/tags and 24h Idempotency-Key; retained to corroborate send guide with API definition. No delivered-wire test.                                                                                                                                          |
| C08  | https://resend.com/docs/dashboard/receiving/reply-to-emails                                                                            | Explicit In-Reply-To and cumulative References examples; retained for actual reply contract rather than subject-only threading. Client grouping still untested.                                                                                                                                 |
| C09  | https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend                                            | Any local part on verified domain can send; retained for identity control and its broadness. Does not grant agent authority.                                                                                                                                                                    |
| C10  | https://resend.com/docs/dashboard/receiving/custom-domains                                                                             | Receiving MX required; subdomain/forwarding recommended with existing MX; equal-priority unpredictable; retained for coexistence boundary. DNS was not inspected or changed.                                                                                                                    |
| C11  | https://resend.com/docs/api-reference/api-keys/create-api-key                                                                          | full_access CRUD any resource; sending_access send-only with optional domain_id; retained as exact credential privilege contract. No read-only receiving permission listed.                                                                                                                     |
| C12  | https://resend.com/docs/dashboard/emails/email-suppressions                                                                            | Team-wide bounce/complaint/manual suppression with API list/get/add/remove/bulk and events; retained for policy and migration. Gmail/Workspace complaint-report gap noted.                                                                                                                      |
| C13  | https://resend.com/docs/webhooks/verify-webhooks-requests                                                                              | Raw body and Svix ID/timestamp/signature/endpoint secret used for verification; retained as ingress contract. Authentication does not remove replay by itself.                                                                                                                                  |
| C14  | https://resend.com/docs/webhooks/retries-and-replays                                                                                   | Immediate then 5s,5m,30m,2h,5h,10h,10h; auto-disable persistent failing hooks; manual dashboard replay; retained for solo recovery. Disable threshold/API replay not established.                                                                                                               |
| C15  | https://documentation.mailgun.com/docs/mailgun/user-manual/receive-forward-store/route-actions                                         | store() up to 3d, optional notify, lower routes continue without stop; retained as inbound retention contract. Page says updated 8mo ago.                                                                                                                                                       |
| C16  | https://documentation.mailgun.com/docs/mailgun/user-manual/receive-forward-store/storing-and-retrieving-messages                       | Events search plus Messages retrieval; ordered MIME headers, bodies, attachment metadata, Accept message/rfc2822 full MIME; retained for retrieval detail. Page updated 5mo ago; imperfect content-type prose.                                                                                  |
| C17  | https://documentation.mailgun.com/docs/mailgun/user-manual/receive-forward-store/receive-http                                          | Parsed/multipart, raw MIME suffix, JSON base64 attachments and timestamp+body signing variant; inbound retry schedule; retained for exact wire contracts. Updated 3wk ago; differs from general retry/signing docs.                                                                             |
| C18  | https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/messages                                                     | h: custom headers, MIME endpoint, v: event metadata, queued ID response; placement-test key dedupes tests only; retained as negative general-send-idempotency result. No general key found is not proof of universal absence.                                                                   |
| C19  | https://documentation.mailgun.com/docs/mailgun/user-manual/webhooks/securing-webhooks                                                  | Account webhook key, classic HMAC timestamp+token, optional token cache/time check; retained for precise coverage, not blanket body-auth claim. Updated 1wk ago; generic all-POST wording omits JSON exception.                                                                                 |
| C20  | https://documentation.mailgun.com/docs/mailgun/user-manual/webhooks/webhook-retries                                                    | 200 succeeds,406 stops,others retry except delivery; 5m,10m,15m,1h,2h,4h described as 8h; retained because differs from inbound page. Updated 1mo ago.                                                                                                                                          |
| C21  | https://documentation.mailgun.com/docs/mailgun/user-manual/api-key-mgmt/rbac-mgmt                                                      | Domain send-only keys; Analyst read Messages/Routes/Logs but no suppression access; granular RBAC Enterprise/certain Business; retained for least-privilege cost tradeoff. Updated 9mo ago, entitlement must be confirmed.                                                                      |
| C22a | https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/bounces                                                      | Domain bounce API CRUD/import; permanent recipient mailbox errors, not all soft/spam failures; retained for suppression migration semantics.                                                                                                                                                    |
| C22b | https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/complaints                                                   | Domain complaint CRUD/import for ESPs supporting feedback loops; retained for limits of complaint coverage.                                                                                                                                                                                     |
| C22c | https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/unsubscribe                                                  | Domain unsubscribe CRUD/import, tags or * all correspondence; retained for consent-scope difference from Resend team-wide suppression.                                                                                                                                                          |
| C23  | https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/messages/get-v3-domains--domain-name--messages--storage-key- | GET storage key obtained from events; key available during domain retention policy; retained as API corroboration and retention ambiguity. Reference describes outbound, not an inbound 3d override.                                                                                            |
| C24  | https://resend.com/docs/api-reference/emails/list-emails                                                                               | Sent LIST response includes API id and RFC message_id, timestamps,participants,last_event; retained for reply correlation/reconciliation. No idempotency-key lookup/filter documented here.                                                                                                     |
| C25  | https://docs.svix.com/receiving/verifying-payloads/how-manual                                                                          | HMAC id.timestamp.raw-body; same ID on resend; constant-time comparison and timestamp tolerance; retained to trace signing/replay claims to origin. Page last updated Oct 15 2026.                                                                                                              |
| C26  | https://documentation.mailgun.com/docs/mailgun/api-reference/api-overview                                                              | US/EU endpoints, regional message/log/suppression/routes data, global account data; retained only as jurisdiction-sensitive reevaluation lead, not compliance finding. Updated 1mo ago.                                                                                                         |

Discovery-only sources inspected but not used as final capability authority: Resend llms.txt
index and API-key management guide; Mailgun Domains overview. Search snippets were treated
as **untrusted evidence candidates**, then checked against fetched documentation. No secondary
comparison chart was used to award a capability.

## Curiosity decisions, negative results, stop

Native curiosity_decide was searched by name but not exposed; normal evidence-led decisions
are recorded here rather than claiming a native call succeeded. Scores below are internal
research priorities (1 low–5 high; cost 5 expensive), not provider grades.

| Boundary           | In-frame next question                                                 | Relevance/value/novelty/cost | Action and update                                                                                                         |
| ------------------ | ---------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Initial discovery  | Is current Resend inbound actually full-content/recoverable?           | 5/5/5/1                      | Pursued C01–C04; rejected metadata-only hypothesis.                                                                       |
| Receiving contract | Does 1h expiry mean permanent attachment loss?                         | 5/5/4/1                      | Pursued C02,C03,C05; renewable URL documented, finite blob-retention promise still needs confirmation.                    |
| Send contract      | Does retry close accepted-but-response-lost gap?                       | 5/5/4/1                      | Pursued C06,C07,C24; yes within 24h documented; not indefinite.                                                           |
| Comparison         | Does Mailgun offer a meaningfully safer recovery/security alternative? | 5/4/3/2                      | Pursued C15–C23; strong inbound but no established general send dedupe; JSON vs classic signature distinction discovered. |
| Final synthesis    | More public breadth or authorized tests/provider clarification?        | 5/5/3/4                      | Tests/clarifications now distinguish suitability; exact blocked tests above. Stop public expansion.                       |

- **CURIOSITY_NO_GO:** SES/Postmark breadth now; first credible fallback and exact blockers
  are established, another vendor comparison would not settle the remaining account/runtime tests.
- **CURIOSITY_NO_GO:** Resend Inbox/agent settings/automations, despite new index entries;
  Inbox is early access and application state/workflow must remain Supabase-owned. Basic
  Email/Receiving APIs suffice for this decision; do not introduce vendor workflow ownership.
- **CURIOSITY_NO_GO:** Bird investigation; owned by B, duplication wastes shared budget.
- **CURIOSITY_NO_GO:** Full pricing/legal treatise; H owns economics and jurisdiction is unknown.
- **CURIOSITY_NO_GO:** Authenticated probing, DNS or test sends without separate permission.

Negative tool results retained: native web_search returned WEB_SEARCH_CONFIG_INVALID; exposed
websearch succeeded and primary webfetch was used. Context7 resolve-library-id returned monthly
quota exceeded; no alternate credential/account was sought. One authorized narrow Mailgun child
was attempted and denied: **Subagent depth limit reached (1)**. No child ran, no grandchildren,
no limit evasion; actual depth remains coordinator → C (one delegation level). Six-level or
expanded concurrency support is not claimed. Native curiosity tool was not discoverable.

### Verdicts

- **Adopted (research conclusion):** current Resend supports programmable full inbound and
  same-thread outbound; old no-inbound claim rejected. Provider docs corroborated across
  guides/API, not an independent real-world measurement.
- **Adapted (proposed fallback):** Resend transport with Supabase-owned durable state, artifact
  archive, identity policy, suppression policy and bounded idempotent outbox recovery.
- **Rejected:** automatic resend/failover after ambiguous acceptance, subject-only threading,
  treating signature-valid email as business authorization, temporary URLs as durable storage.
- **Deferred:** Mailgun as selected sender until uncertain-acceptance contract is resolved;
  Resend production adoption pending blocked tests and plan/region requirements; SES/Postmark.

Stop condition satisfied for research: at least one credible alternative's critical documented
contracts and Bird decision boundary are clear; remaining unknowns have exact acceptance tests
or confirmation requests. Only this dossier was written. No application behavior changed;
pnpm check/smoke were not run for this research-only Markdown addition.
