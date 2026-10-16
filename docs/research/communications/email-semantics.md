# D — Minimum safe two-way email semantics

Research-only dossier; accessed **2026-10-16 UTC**. Owner: email-semantics
workstream D. No implementation, sends, mailbox access, DNS changes, paid resources,
or employer resources used. No child agents spawned (allocation: zero).

## Decision frame and conclusion

Determine the minimum identity, reply, thread, deliverability, and trust contracts
needed for **one personal company, one human owner, and operational AI agents**.
Provider selection/API contracts belong to B/C; durable execution mechanics belong
to E; jurisdiction-specific obligations belong to H. No actual domain, jurisdiction,
recipient population, consent model, or sending volume is established.

**High-confidence conclusion:** use company-controlled public addresses as routing
identities, not as the identities or permissions of individual workers. A small
shared inbound surface can support many internal agents. Neither a separate mailbox
per agent nor separate subdomains follow from email standards. Preserve distinct
envelope and header identities, actual transmitted Message-IDs, raw artifacts, and
an application-owned conversation/authorization model. Header correlation and valid
domain authentication are evidence, never business authorization.

**Conditional gate:** a provider must expose enough inbound envelope information,
headers and original content, and preserve or reveal actual outbound thread headers.
If only rendered bodies, subjects, or opaque provider thread IDs are recoverable,
safe portable two-way processing is not established. B/C must prove the exact APIs.

Bounded questions: (1) what actually routes mail versus what is displayed; (2) how
to correlate replies without identity/subject confusion; (3) what authentication
does and does not prove; (4) how to prevent unwanted automated sends and loops;
(5) what must survive provider migration or parser failure. Acceptance is grounded
constraints and explicit experiments, not a claim of working deliverability.

## Evidence and findings

Labels: **documented** means directly supported by retained primary sources;
**inference/proposed** means a design judgment, not an RFC requirement;
**unknown** means unverified here. Source IDs resolve to the bibliography below.

### 1. Envelope, displayed addresses, aliases, and worker identity

| Element                         | Documented meaning                                                                                      | Proposed handling                                                                                                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SMTP `RCPT TO`                  | Envelope recipient controlling delivery; separate from message content (D01 §§2.3.1, 3.3).              | Capture accepted recipient(s) and receiving route from authenticated ingress metadata. Route company aliases using this, not display `To` alone.                              |
| Header `To` / `Cc` / `Bcc`      | Intended primary/copy/hidden recipients. Bcc may be removed or empty in delivered content (D02 §3.6.3). | Retain separately from envelope. Never infer absent Bcc recipients; never copy Bcc into visible reply recipients.                                                             |
| Header `From`                   | Author(s), including systems, responsible for writing (D02 §3.6.2).                                     | One approved company address and honest display name per outgoing message; do not spoof a customer's address.                                                                 |
| Header `Sender`                 | Agent responsible for transmission, not the reply destination (D02 §3.6.2; D03 §4).                     | Do not confuse the RFC term “agent” with an authenticated AI worker. Use only where semantically appropriate, not to encode tool permissions.                                 |
| Header `Reply-To`               | Author's suggested reply address(es); absent it, ordinary replies default to `From` (D02 §3.6.2).       | Our outgoing Reply-To, if used, must lead to a monitored company route. Inbound Reply-To can redirect to a different party and is not identity proof.                         |
| SMTP `MAIL FROM` / reverse-path | Address for delivery errors; can be null `<>` (D01 §§3.3, 4.5.5).                                       | Keep distinct from conversational recipient and visible From; associate bounce handling with send attempts.                                                                   |
| `Return-Path`                   | Delivery trace derived from reverse-path; final delivery SMTP system inserts it (D01 §4.4).             | Do not fabricate it as an ordinary author header or use it as the universal human reply address. Trust the receiving system's provenance, not any attacker-supplied instance. |

**Documented:** SMTP aliases can expand recipients without changing message data
(D01 §3.9.1). Local-part interpretation belongs to the receiving domain; local-parts
must have case preserved, whereas domains are case-insensitive (D01 §§2.3.11, 2.4).

**Inference/proposed:** a registry of approved company aliases can map many
addresses to a single shared inbox/work queue. An alias is not a mailbox login,
worker credential, person, or capability. Store `worker_principal_id`, role,
delegation/policy version, approval identity, and public sending identity separately.
Do not allow a model to select arbitrary From addresses merely because a provider
technically accepts them. Domain verification can enable multiple local-parts at
some providers, but exact permission and reply-receipt behavior remain B/C gates.

Do not globally strip `+tags`, remove dots, lowercase local-parts, or equate two
addresses based on a display name. Such transformations require a domain-specific
rule or verified contact mapping. Unknown aliases should be quarantined/rejected by
an explicit policy, not silently given a new agent or contact identity. Catch-all
reception is a possible capability, not an obligation or default authorization.

### 2. Message identity, reply correlation, and ambiguity

**Documented (D02 §3.6.4):** every message SHOULD have Message-ID; its generator
must guarantee global uniqueness. Replies SHOULD carry appropriate In-Reply-To
and References. Message-ID identifies a message version, not a person, order,
conversation, delivery attempt, or business action. A reply has a **new** Message-ID.
For a normal single-parent reply:

- `In-Reply-To` = parent's Message-ID, if available.
- `References` = parent's References followed by parent's Message-ID; if References
  is absent but parent In-Reply-To has one ID, use that then parent Message-ID.
- Do not invent a missing parent's Message-ID. Multiple-parent References
  construction is discouraged and not defined by the RFC.

**Proposed portable correlation contract:**

1. Persist an internal `message_record_id`, `conversation_id`, `business_case_id`,
   provider IDs, submitted Message-ID (if selectable), and **actual transmitted**
   Message-ID. They are distinct namespaces. An outbound ID rewrite must be known
   before reliable matching is claimed; a “custom header accepted” claim is insufficient.
2. Parse outer message In-Reply-To/References with a real header parser. Match
   exact parsed IDs to known records, retaining raw forms and provenance. A unique
   parent match supplies a conversation candidate, not access to its private history.
   Validate addressed company route, participant relationship, case scope, and
   disclosure policy before supplying context or sending a reply.
3. An opaque per-conversation reply alias/token is an optional additional routing
   signal if supported. Make it hard to guess, map it server-side, and treat it as
   leakable through forwards. It is not authority to refund, change bank details,
   approve advertising, or read unrelated records. Contradictory token/header
   matches go to ambiguity review, not an arbitrary precedence winner.
4. If IDs are absent, duplicate across distinct artifacts, malformed, refer to
   several conversations, or conflict with routing, preserve the message and mark
   correlation `ambiguous`/`unmatched`. Contact/subject/time heuristics can suggest
   a case to the owner; never silently merge cases or authorize side effects.
5. Subject is presentation/search data, **not a primary thread key**. “Re: Order”
   can collide across customers/orders, and valid replies can change subject.
   RFC identification fields support ancestry; they do not establish universal
   mail-client UI grouping. Provider/client thread IDs remain secondary hints.

**Inference:** Message-IDs are forgeable input and observable by correspondents.
A copied valid ID can attract an attack into an existing thread. Even DKIM coverage
of those headers does not establish that the sender is entitled to the case. Do
not deduplicate all inbound records by Message-ID alone: a malicious duplicate could
otherwise suppress a legitimate message or replace its content. Retain delivery
instances/artifacts separately; E owns event idempotency and send-attempt state.

**Forwarding/shared-inbox cases:**

- Transparent alias forwarding may retain original From/Message-ID while changing
  envelope recipients. Store both facts; missing original alias information after
  forwarding cannot safely be reconstructed from visible To alone (D01, D10).
- Inline forwarding and forwarded `.eml`/`message/rfc822` are outer-message content.
  Embedded From, Message-ID, Authentication-Results, quoted instructions, and order
  numbers must not be promoted to verified outer sender identity or instructions.
  An outer forwarding sender is not proof of the embedded author's current intent.
- A shared external address may represent multiple people; the same person may use
  several addresses. A reply from a newly introduced address requires relationship
  verification before sensitive disclosure or account/address changes.
- A message reaching two company aliases is not permission for two agents to
  respond. Shared case ownership, one claimed response operation, and human-takeover
  state must arbitrate competing agents and the owner. This is application policy,
  not an email threading feature.
- Reply-all expands disclosure. Default automated sends to one policy-validated
  correspondent, not all visible or embedded recipients. Changes in recipients,
  multi-address Reply-To/From, and mailing-list headers warrant review.

### 3. Authentication, forwarding, and business trust

**Documented:** SPF validates whether the connecting host is authorized to use the
MAIL FROM/HELO domain, not arbitrary visible From (D04 §§2.2–2.5). DKIM associates a
signing domain with signed message portions; signer and purported author are
different concepts, and signatures need not cover every header (D05 §§1.2, 1.5, 5.4).
DMARC requires a passing SPF or DKIM authenticated domain aligned with the visible
From author domain (D06 §§1, 4.3–4.4). Strict alignment means identical domains;
relaxed alignment means the same Organizational Domain, not any shared suffix.

**Currency correction:** RFC **9989 (May 2026)** supersedes RFC 7489/9091. It makes
particularly explicit that a DMARC pass validates authorized domain use, **not the
local-part, message value, safe inbox delivery, or entities other than domains**
(D06 §§1, 2.2, 2.4, 4.1). It also changes organizational-domain discovery to a DNS
tree walk. Do not implement DMARC from an old blog or assume receiver migration to
the new algorithm is universal. B/C should identify their actual validator behavior.

**Proposed trust boundary:**

- Authenticate ingress delivery independently (provider webhook/API verification is
  B/C/E's contract). Authentic ingress proves the provider delivered an event; it
  does not make the event's external message safe.
- Accept authentication verdicts only from a configured trusted receiving service
  through its authenticated channel. Authentication-Results headers can be forged;
  RFC 8601 requires an actual trust boundary, not merely a matching authserv-id
  string (D07 §§1.1–1.2, 1.6, 5, 7.1). Preserve untrusted copies for debugging,
  but do not use them as verdicts. Embedded verdicts are not outer-message verdicts.
- Keep `transport_authenticated`, `sender_domain_result`, `contact_relationship`,
  `conversation_match`, `business_authorization`, and `content_risk` separate.
  Unknown/none/temperror is not pass. A failed check is also not conclusive proof of
  malice: forwarding can break SPF alignment and content changes can break DKIM
  (D10 §§2.2–2.3; D06 §7).
- A validly authenticated supplier/customer email can contain malicious links,
  prompt injection, forged role claims, or a compromised account's instructions.
  Treat body/attachments/quoted “owner approvals” as data. Financial changes,
  sensitive disclosure, purchases, and agent-policy changes require independent
  application authorization/owner approval, not a From allowlist or DMARC pass.

No “DMARC failure => discard business request” or “DMARC pass => execute” rule.
Suspicious or ambiguous requests can be retained for review without responding or
revealing case data. Do not auto-fetch arbitrary external attachment URLs or load
remote images to investigate; content handling needs separate safety controls.

### 4. Deliverability and suppression baseline

**Documented mailbox-provider requirements, not measured delivery:**

| Primary source                 | All-sender / bulk distinctions and limits                                                                                                                                                                                                                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gmail personal accounts, D08   | All senders: SPF **or** DKIM, valid forward/reverse DNS, TLS, RFC 5322, spam rate below 0.3%. More than 5,000/day: SPF **and** DKIM, DMARC (p=none permitted), aligned direct mail, one-click plus visible body unsubscribe for marketing/subscribed mail. Page also recommends staying below 0.10%, avoiding 0.30% or higher.      |
| Yahoo, D09                     | All: SPF or DKIM, spam rate below 0.3%, forward/reverse DNS, RFC 5321/5322. Bulk: both, passing DMARC with at least p=none/alignment, easy unsubscribe for marketing/subscribed messages; honor within two days. This page does not establish a universal numeric bulk threshold.                                                   |
| Outlook.com consumer mail, D11 | Effective May 5, 2025: domains over 5,000/day to Outlook.com must satisfy SPF, DKIM, DMARC at least p=none/alignment. Current policy says junk placement and possible rejection if unresolved. Also cease retrying a permanently rejected message to that recipient, and cease further sends after multiple non-delivery responses. |

**Proposed:** choose a provider capable of SPF, aligned DKIM, and DMARC regardless
of unknown initial volume; verify TLS/PTR responsibilities and actual received
headers in an authorized launch test. For RSA DKIM, use SHA-256, not SHA-1; at least
1024-bit keys, preferably 2048-bit (D12). No current DNS or deliverability is verified.
DMARC enforcement rollout must follow inventory/testing of all legitimate senders
and forwarding paths; no immediate p=reject prescription is justified here.

Suppression is minimum operational state even for non-marketing service mail:

- Persist recipient, reason, scope, source event, effective time, and review history
  for hard bounce, repeated temporary failure, complaint, opt-out, and manual block.
  Recheck at dispatch, not only when composing/queuing. E owns atomicity.
- Do not retry unchanged permanent failures. Distinguish invalid-recipient failures
  from authentication/content-policy failures; the latter may require stopping a
  sending stream rather than marking the customer's address nonexistent (D10 §4.1.3.3).
- Complaints halt routine automated contact and create a review task; do not send a
  “we received your complaint” email automatically. Provider suppression overrides
  cannot be bypassed by switching alias, agent, provider, or message category.
- Keep marketing consent/list opt-outs separate from deliverability hard blocks.
  A marketing unsubscribe is not blanket permission to suppress required service
  notices, and a “transactional” label is not permission to ignore complaints.
  Critical service-contact alternatives and exceptions need owner/legal policy.
- Do not assume every complaint is exposed per recipient; receiver feedback and
  low-volume reputation visibility are provider-dependent unknowns. Monitor both
  provider events and available aggregate reputation feedback.

**Marketing is a candidate, not an approved workflow.** Separate requested service
correspondence/receipts from promotional/subscribed mail in purpose, consent,
templates, suppression scope, and reporting. Do not add promotions to receipts
(D08). Provider guidance recommends separating reputations/types (D08/D09), but
does not justify selecting premature subdomains, dedicated IPs, or per-agent mailboxes.
Revisit technical separation only when actual streams, volume, and risk warrant it.

For an approved marketing stream, proposed baseline is RFC 8058 HTTPS POST one-click
plus a visible body link: both List-Unsubscribe and List-Unsubscribe-Post must be
covered by valid DKIM; encode recipient/list in a hard-to-forge opaque URL; no login,
cookies or extra context; no HTTPS redirect; GET/prefetch must not perform the
one-click removal (D13 §§3–4, 6). Yahoo accepts mailto under its policy, but that
does not substitute for RFC 8058/Gmail's HTTPS POST contract. These are receiver
requirements and protocol mechanics, not a determination of applicable law.

### 5. Automated responses: do not conflate acknowledgments and correspondence

**Documented (D03):** RFC 3834 forbids blindly responding to every message; says
SHOULD NOT respond to Auto-Submitted values other than `no`; recommends
`Auto-Submitted: auto-replied` for direct automatic responses and `auto-generated`
for independent generated messages. It discourages list traffic/amplification and
prefers at most one response destination. For ordinary absence notices, the
recommended repeat interval is seven days; that is not a blanket support-answer SLA.

**Important conflict with naive implementations:** ordinary human reply semantics
use Reply-To/From (D02), but unsolicited automatic Personal/Group responses should
go to the envelope return address/Return-Path, **not Reply-To** (D03 §4). A Service
Responder MAY use From or another precisely specified request-payload address;
it SHOULD NOT use Reply-To for that purpose. A classifier answering on behalf of
one mailbox can be a Personal Responder under D03 §1.1. Merely calling an AI a
“service” does not eliminate this distinction.

**Proposed launch rule:**

1. Tag message purpose explicitly: transport status, unsolicited acknowledgment/
   vacation notice, approved service response, human-reviewed correspondence, or
   independently generated notification. Do not apply one universal reply-target rule.
2. Optional unsolicited acknowledgments follow D03's envelope-target recommendations;
   skip them when safe target/provenance is absent. Do not send them to a customer's
   Reply-To simply to make the UI look threaded. Missing Return-Path is not license
   to guess. Never target `<>`.
3. For autonomous substantive correspondence, require an owner-approved, documented
   service recipient contract (for example, a verified case-contact endpoint) before
   enabling sends. This is an **adaptation**, not a claim that arbitrary Reply-To
   behavior complies with RFC 3834. Default differing/multiple/new Reply-To targets
   to human review; never blindly send to a third party suggested by message text.
   Human-reviewed ordinary reply composition can use D02 semantics, with recipient
   and disclosure checks. Exact automation classification remains a launch decision.
4. Suppress automatic response triggers for auto-submitted mail, delivery/disposition
   reports, known system addresses, our own identities, mailing lists and malformed/
   spam/quarantined requests. D03 does not mandate one precise Precedence behavior;
   it is a heuristic, not proof. Automated partner traffic needing a response is an
   explicit bounded exception, never a global relaxation.
5. Use one response operation per inbound delivery/case event, per-correspondent and
   per-conversation budgets, a repeated-content/loop detector, human takeover, and a
   global kill switch. Exact limits are owner decisions. Set Auto-Submitted on actual
   automatic messages; do not mislabel autonomous output as human-submitted.
6. Use a nonresponding bounce-handling return route or null reverse-path where
   appropriate and supported (D03 §3.3). Do not force null reverse-path for all
   operational mail: needed delivery diagnostics/provider support must be evaluated.
   Do not echo attachments or large quoted content into automatic notices.

### 6. Preserve original artifacts and make derivations replaceable

**Proposed minimum storage contract (informed by D01/D02/D05/D07/D10):**

- Capture original received MIME/RFC 5322 bytes **as supplied by ingress**, original
  ordered/repeated headers, envelope metadata, raw authenticated event payload,
  receiving timestamp, provider identifiers, and received authentication results
  with verifier/provenance. Record whether the provider transformed content; never
  label reconstructed JSON-to-MIME as the original SMTP artifact.
- Capture outbound submitted payload/MIME, intended envelope/display recipients,
  actual provider/transmitted headers where available, attachments and send-attempt
  links. Retain hashes, byte sizes, content types, attachment part identifiers and
  object references. Raw headers alone cannot recover an omitted Bcc envelope.
- Keep parsed text/HTML, attachment extraction, rendered/sanitized views, summaries,
  classifications, correlation decisions and parser/model versions as **derived**
  records. Preserve errors and ambiguity rather than silently repairing originals.
- Export should contain raw messages, attachments, envelopes/events, identity and
  correlation mappings, suppression history, and audit decisions in documented
  portable forms. A provider conversation URL is not an export strategy.
- Hashes demonstrate stored-byte consistency, not origin authenticity. Offline SPF
  reconstruction may be impossible without trusted session metadata and contemporaneous
  DNS; DKIM rechecking later may fail after key removal. Preserve original verification
  observations and their time, not just a mutable “trusted sender” flag.
- Encrypt/restrict artifact access, sanitize rendering, isolate attachments, and
  define retention/deletion/export policy before real use. Debugging preservation
  does not justify indefinite retention or giving every agent every attachment.

## Focused experiments (proposed; none executed)

Safe local synthetic fixtures are possible now; real provider/DNS/mailbox tests need
a specifically authorized target. No experiment below grants that authority.

| Experiment                                                                                           | Expected distinguishing observation / acceptance                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Envelope/header mismatch; Bcc-only; two aliases; mixed-case local-parts and plus tags                | Route from trusted envelope metadata; preserve displayed recipients independently; no global address rewriting; one case response despite several aliases. Missing envelope metadata is a capture gap, not inferred success. |
| Two unrelated messages with identical subject and customer; changed subject on valid reply           | No subject-only merge; exact ancestry supplies candidate thread; explicit ambiguity when no ancestry/token.                                                                                                                  |
| Duplicate Message-ID with different bytes; forged References to a private case                       | Preserve both artifacts; flag collision; no private history disclosure or action authority.                                                                                                                                  |
| Parent/reply chain, missing ID, malformed/repeated headers, conflicting token and ancestry           | Correct new outgoing ID/In-Reply-To/References; deterministic quarantine/review, not parser-dependent recipient selection.                                                                                                   |
| Provider outbound round trip (later authorized)                                                      | Compare submitted and received raw headers; prove actual ID mapping and Reply-To receipt. Test alias replies, attachments, Unicode display names, and header folding without relying on client UI threading.                 |
| Forward as redirect, inline, and attached .eml                                                       | Distinguish outer from embedded identity; preserve original route if supplied; embedded approvals/verdicts never become authority.                                                                                           |
| Forged Authentication-Results; DKIM pass for unrelated domain; DMARC pass with malicious instruction | Only trusted receiver verdicts accepted; alignment recorded; all content remains untrusted and business authorization unchanged.                                                                                             |
| Two responders; own-alias messages; null return-path; DSN; List-*; Auto-Submitted                    | No loop/amplification; no auto reply to reports, own routes, lists or null target; tested circuit breaker; differing Reply-To not silently followed.                                                                         |
| Hard bounce, temporary deferral, complaint, unsubscribe racing queued send                           | Dispatch checks effective suppression; no permanent-failure retry or alias/provider evasion; cause and scope preserved. E supplies atomicity tests.                                                                          |
| Export/import and parser upgrade                                                                     | Raw bytes/attachment hashes unchanged; envelopes/IDs/correlation/audit/suppression retained; derived parsing replaceable.                                                                                                    |

## Unknowns and consequential verdicts

| Verdict                   | Item / rationale                                                                                                                                                                                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Adopted for synthesis** | Envelope/header separation; stable approved company identity; worker principal separation; raw-artifact preservation; new reply IDs; ancestry as correlation not authority; authenticated ingress and untrusted business content separation. High confidence in constraints; design remains proposed.     |
| **Adapted**               | Shared inbox and small alias registry suit one human without dictating mailbox count. Automated correspondence needs an explicit recipient/service contract rather than blindly copying either human or vacation-responder rules. Medium confidence pending owner workflow decisions/tests.               |
| **Rejected**              | Subject-only threads, arbitrary model-selected From, per-agent mailbox requirement, address/domain authentication as approval, duplicate-ID-only dedupe, reply-all by default, automatic trust in forwarded headers. These fail the documented distinctions/security constraints.                         |
| **Deferred**              | Exact provider capture/header/suppression contracts (B/C); transactional execution/leases (E); jurisdiction and message classification (H); domain and DMARC policy rollout; any dedicated IP/subdomain design; autonomous Reply-To exception policy; retention duration and critical-contact exceptions. |

No official source establishes the selected provider's account entitlements, actual
mailbox-client grouping, mailbox availability, full complaint visibility, or inbox
placement. No domain ownership, MX configuration, consent evidence, sending rate,
or customer/supplier identity verification workflow has been observed.

## Evidence boundaries, curiosity decisions, and stop

Native `curiosity_decide` was not exposed by tool discovery; no call or native record
is claimed. The following bounded manual decisions preserve the same evidence-led
discipline. Scores are qualitative, not authority or measurements.

| Evidence boundary       | In-frame gap (relevance / value / novelty / cost)                                                                             | Decision and result                                                                                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controls and discovery  | Primary standards versus generic sender blogs (high/high/high/low)                                                            | Pursued RFC/editor and receiver-owned pages. Search results treated as **untrusted evidence candidates**, not findings. Native web_search returned `WEB_SEARCH_CONFIG_INVALID`; exposed alternate websearch worked. Negative tool result retained. |
| Base RFCs + Gmail/Yahoo | Automated Reply-To conflict (high/high/high/low)                                                                              | Read D03 §4 against D02 ordinary replies; retained conflict explicitly, with separate purpose/recipient contracts. No claim that all AI replies can use Reply-To.                                                                                  |
| Authentication pass     | Is old DMARC specification current? (high/high/high/low)                                                                      | Search led to D06; fetched RFC 9989, which supersedes 7489/9091 and directly states domain-only validation limits. Continued to D07 trust-boundary guidance and D10 forwarding analysis.                                                           |
| Sender-policy synthesis | Outlook-specific high-volume baseline and permanent failures (high/medium/medium/low)                                         | Fetched D11 policy, not community replies. Distinction retained: consumer scope, possible rejection, and no retransmission of permanently rejected message.                                                                                        |
| Final synthesis         | Detailed ARC deployment, SRS algorithms, full internationalized-address implementation (medium/low/medium/high)               | **CURIOSITY_NO_GO:** no forwarding product or international address requirement established; preserve metadata and require later focused compatibility tests instead.                                                                              |
| Final synthesis         | BIMI/logos, dedicated IP economics, subdomain topology, per-agent mailbox catalog (low/low/low/medium)                        | **CURIOSITY_NO_GO:** cannot change current identity/thread trust decision and risks premature architecture.                                                                                                                                        |
| Final synthesis         | Country-by-country marketing law, exact vendor APIs, real deliverability tests (relevant but outside D's authority/ownership) | **CURIOSITY_NO_GO:** leave law to H and APIs to B/C; no authorized domain/mailbox/send target. Do not broaden authority to fill evidence gaps.                                                                                                     |

**Stop:** key identity/thread/trust constraints are grounded in primary standards
and triangulated against receiver requirements. Additional general browsing will not
settle remaining account/workflow questions. Reopen for a named provider capture gap,
an approved autonomous-recipient policy, a real forwarding failure, or an authorized
domain/consent/volume launch plan. No product acceptance or production readiness is
claimed from this research.

## Primary-source bibliography (all fetched/read)

All URLs below accessed **2026-10-16 UTC**; publication/effective dates are distinct
from access date. RFC sources are protocol specifications, not observations of any
provider implementation. Exact sections above are the claim locators.

| ID  | URL; version/date                                                                                                                                                                                       | Retained claim, limitation, and rationale                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D01 | https://www.rfc-editor.org/rfc/rfc5321 — RFC 5321, October 2008; page notes update 7504                                                                                                                 | SMTP envelope/content separation, local-part semantics, alias expansion, Return-Path, null reverse-path. Authoritative base transport semantics; not a provider capture or sending-identity entitlement contract.                                                                          |
| D02 | https://www.rfc-editor.org/rfc/rfc5322 — RFC 5322, October 2008; page notes update 6854                                                                                                                 | Originator/recipient fields, Bcc, Message-ID and reply ancestry. Chosen over client tutorials because it specifies field meaning; not universal UI threading or proof of sender honesty.                                                                                                   |
| D03 | https://www.rfc-editor.org/rfc/rfc3834 — RFC 3834, August 2004; page notes update 5436                                                                                                                  | Auto-Submitted, loop/backscatter avoidance, Personal/Group/Service classification and destination differences. Primary automatic-response recommendations; not an AI-specific exemption or authority framework.                                                                            |
| D04 | https://www.rfc-editor.org/rfc/rfc7208 — SPF v1, April 2014; page notes updates 7372/8553/8616                                                                                                          | MAIL FROM/HELO host authorization and result meanings; §4.6.4 lookup bounds. Primary SPF definition; not visible From/person authentication or forwarding immunity.                                                                                                                        |
| D05 | https://www.rfc-editor.org/rfc/rfc6376 — DKIM, September 2011, STD 76; page notes updates 8301/8463/8553/8616                                                                                           | Signing-domain responsibility, selected content integrity, signer/author separation, canonicalization and replay risks. Primary DKIM definition; original SHA-1/key guidance superseded—use D12 for RSA baseline.                                                                          |
| D06 | https://www.rfc-editor.org/rfc/rfc9989 — DMARC, May 2026, Proposed Standard                                                                                                                             | Supersedes 7489/9091; alignment, domain-only authorization limits, DNS tree walk, indirect flows. Current primary authority rather than legacy 7489 summaries; actual receiver/provider implementation rollout unverified.                                                                 |
| D07 | https://www.rfc-editor.org/rfc/rfc8601 — Authentication-Results, May 2019                                                                                                                               | Trust boundary, forged headers, embedded instances, producer/consumer relationship. Directly supports provenance-sensitive verdict ingestion; does not itself secure a webhook or assign business permissions.                                                                             |
| D08 | https://support.google.com/mail/answer/81126 — living Gmail sender guidelines; requirements effective February 1, 2024; page lists TLS addition December 2023; overall publication/update date unstated | Current receiver-specific all/bulk requirements, honest display identity, valid IDs, unsubscribe, spam thresholds, no inbox guarantee. Personal Gmail scope only; not law or an account test.                                                                                              |
| D09 | https://senders.yahooinc.com/best-practices/ — living Sender Hub requirements; enforcement beginning February 2024; overall publication/update date unstated                                            | Yahoo all/bulk authentication, complaints, invalid recipients, unsubscribe within two days; forwarding/stream separation guidance. Receiver-owned primary policy; bulk numeric threshold not established by this page; CAN-SPAM language is provider guidance, not a jurisdiction finding. |
| D10 | https://www.rfc-editor.org/rfc/rfc7960 — Informational RFC, September 2016                                                                                                                              | Forwarding/alias SPF and DKIM breakage, message modification, risk of interpreting auth bounces as invalid recipients. Retained technical causal analysis also referenced by current D06; historical proposed mitigations are not adopted as current deployment instructions.              |
| D11 | https://substrate.office.com/ip-domain-management-snds/postmaster/Policies — living Outlook.com Postmaster policy; high-volume rules effective May 5, 2025; overall publication/update date unstated    | Consumer high-volume SPF/DKIM/DMARC, permanent-failure retry prohibition, repeated failure hygiene and reverse DNS. Current direct policy preferred over stale blog/community quotations; not all Microsoft 365 tenants or proof of uniform enforcement.                                   |
| D12 | https://www.rfc-editor.org/rfc/rfc8301 — RFC 8301, January 2018, updates 6376                                                                                                                           | RSA SHA-256, SHA-1 prohibition, minimum/recommended key sizes. Prevents applying obsolete D05 crypto language; not an exhaustive algorithm comparison or selected-provider verification.                                                                                                   |
| D13 | https://www.rfc-editor.org/rfc/rfc8058 — RFC 8058, January 2017                                                                                                                                         | HTTPS POST one-click unsubscribe, DKIM-covered headers, no redirects/context, opaque token and consent implications. Primary protocol mechanics; not automatic legal applicability or assurance a receiving UI offers one-click.                                                           |

### Observed verification

Only this dossier was authored by D. Initial `git status --short` showed existing
README changes and many untracked project files; no staging or unrelated edits.
Final verification is documentation readback/source-reference inspection, not a
runtime email test. `pnpm check`/`pnpm smoke` are not claimed run for this research-only
document; no application behavior or dependency changed. Experiments remain proposed.
