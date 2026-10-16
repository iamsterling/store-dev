# Independent adversarial review and coordinator resolutions

Reviewer: independent `reviewer` child session `ses_ebd2320baffe3V4uSAvzVjOnqH`, after the
preliminary decision/dossiers existed; not an architecture author. Review result returned as
read-only report, transcribed here by coordinator. No provider tests or account access.
Primary sources independently fetched: Bird get/list inbound references, receiving guide,
detailed idempotency guide and Resend idempotency documentation. Reviewer also executed the
six research model checks and existing 16 handler tests; both passed within their limited scope.

## I-01 — Medium: “complete inbound” overstates envelope-route provenance

**Evidence:** Bird GET/LIST references define `to`/`cc` as message-header recipients, expose
nullable mailbox identity and an inbound-address list filter, but the inspected contract does
not establish the original accepted SMTP envelope recipient. Raw RFC 5322 MIME does not by
itself reconstruct the SMTP envelope. Bird dossier originally called this a complete pass.

**Failure:** Bcc-only or transparently forwarded mail arrives at a catch-all with a different
visible To; implementer invents receiving-alias attribution or trusts attacker-controlled headers.

**Required correction:** downgrade route/envelope completeness to conditional, define a provable
server-side receiving-route-to-company-identity binding or obtain an actual trusted envelope field.
Test Bcc-only, forwarding, mismatch and two aliases through both webhooks and LIST backfill.
Missing/contradictory evidence must hold/quarantine, not use visible To as a fallback.

**Coordinator disposition — accepted and corrected:** Bird matrix and receiving section now
state this gap; decision brief includes it; architecture defines trusted-route requirement;
phase 0 requires the fixtures and backfill mapping. No claim Bird cannot provide it is made.
This remains a production gate, not a reason to invent mailbox provisioning now.

## I-02 — Medium: linked execution dossier contradicts initial queue choice

**Evidence:** synthesis selected one leased Postgres table, but specialist execution dossier
initially recommended PGMQ/two queues and presented its SQL as initial mechanics.

**Failure:** an implementation agent has to choose infrastructure or invent table transitions
despite the package claiming the implementation choice is made.

**Required correction:** one adopted initial contract: receipt/work transaction without extension,
guarded claim/heartbeat/complete/retry/dead transitions and expired-send reconciliation. Clearly
defer PGMQ/version/dump checks rather than presenting both as adopted.

**Coordinator disposition — accepted and corrected:** execution dossier's recommendation/layout/
SQL/verdict now identify PGMQ as deferred. Architecture's “Initial work-table transition contract”
specifies lock order, clock, unique keys, SKIP LOCKED claim, fences, non-resurrecting heartbeat,
completion/retry guards, no reclaim-to-resend, and dispatch-sweep-to-unknown. Phase 1 tests that
selected design; PGMQ extension checks apply only if later adopted. Evidence on PGMQ is retained,
not silently discarded or turned into an installed feature.

## Other challenges and retained limits

The reviewer found no additional proven finding within the reviewed scope. This is not security
or reliability certification. Bird preference bias is controlled by hard gates and Resend comparison;
no all-in price or account availability is claimed. Detailed Bird idempotency overrides “safe retry”
summaries; hidden SDK retries are expressly addressed. An empty send search never authorizes resend.
Supabase history cannot override transport or commerce facts. Owner approval must be authenticated,
version-bound and unexpired; advertising silence never authorizes spending. No observed agent/JEV,
Shopify integration or mailbox is invented to justify migration. Human exception burden remains
measured-and-owner-approved, not guaranteed by a 99% aspiration.

**Overall resolution:** both material documentation objections corrected before handoff; retain
only a **gated Bird research proof**, with production selection unresolved until named gates pass.
No second independent review of the corrections or live acceptance suite was performed; coordinator
performed the cross-file consistency check. Account/SKU, applicable direct-inbound price, route
provenance, real reply/artifact behavior and unknown-send workload remain explicit uncertainty.
