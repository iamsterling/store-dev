# H — Solo operations, economics, and conditional privacy gates

Research-only dossier. Observed access date: **2026-10-16 UTC** (host clock).
Owner: workstream H. No accounts, credentials, employer systems, DNS, paid resources,
real sends, or implementation were accessed. Only this dossier is authored by H.
Bird API/recovery contracts belong to B; durable execution mechanics belong to E;
alternative capability selection belongs to C. This document specifies operating
acceptance requirements, not claims that those mechanisms exist.

## Decision and bounded questions

Can one human safely supervise personal-business email with agents doing routine work,
Supabase as canonical operational state, and Bird preferred subject to hard gates?
Answer requires (1) a cost model with correct product meters, (2) a human-capacity and
incident model, (3) backup/recovery acceptance, and (4) jurisdiction choices before any
personal data reaches email, model, or storage vendors. Research cannot choose the
owner's availability, budget, jurisdictions, retention purposes, or risk tolerance.

### Executive verdict

- **ADOPT, proposed:** Supabase-owned operational ledger, separate artifact archive,
  manual exception queue, explicit send authority, independent kill control, and
  reconciliation as launch requirements. No claim of implemented reliability.
- **ADAPT, conditional:** Bird remains preferred, but **public pricing is internally
  contradictory**. Canonical Email pricing currently says recurring wallet deposits,
  no included paid sends, and usage from the first send [H01]; billing documentation
  still describes flat allowances, overage, and non-rollover-style capacity [H03].
  A currently fetched alternate product-pricing URL resolves to the deposit model,
  not the flat table that search returned [H04]. Do not silently blend these models.
- **DEFER:** Bird commercial commitment until B names the exact API/product and the
  owner obtains applicable written billing terms. Mailbox is **custom quote**, not
  automatically included in Email sending [H05]. Neither an Email rate nor free
  Inbox software establishes free two-way mailbox storage or inbound processing.
- **ADOPT, documented:** Pro Supabase is a useful cost baseline, not a selected plan:
  $25/month for one Micro project within included usage. A second Micro project makes
  that baseline $35, not $50 [H06]. Backups do **not** include Storage objects [H07].
- **REJECT:** “99% autonomous” as a staffing model, free tiers as evidence of production
  suitability, automatic resend after uncertainty, and a claimed all-in monthly total.
- **Confidence:** high in the observed pricing contradiction and Supabase backup gap;
  medium in published list rates as planning inputs; no confidence claimed in any
  account's entitlement, unobserved system performance, or legal applicability.

## 1. Price sheet: keep products and accounting models separate

USD public list observations, before tax; no account or contract checked.

### Bird

| Product / model                               | Observed price or gate                                                                                                                                                           | Modeling consequence                                                                                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email, current canonical page [H01]           | Startup deposit $15/month, $0.90/1,000 transactional sends; Growth $250 deposit, $0.45/1,000; Scale deposits $1,000/$2,500/$5,000/$10,000 with $0.35/$0.30/$0.25/$0.20 per 1,000 | Deposit adds spendable balance, unused funds carry forward, paid sends charged from first send; do **not** add deposit and consumed usage as two expenses                  |
| Email, billing-doc flat-allowance model [H03] | Recurring fixed charge plus included volume; paid overage per 1,000 if enabled; default total usage cap 5× allowance; Enterprise sales gate                                      | Contradicts H01. Numerical flat-plan allowance/overage table from search is **not adopted** as fetched current pricing                                                     |
| Free Email [H01,H03]                          | 1,000/month; billing docs additionally say 50/day, one domain, no overage                                                                                                        | These are caps, not production capacity or proof of inbound entitlement; reconcile with applicable product terms                                                           |
| Mailbox API [H05]                             | Custom quote: mailbox count, message volume, storage, attachments, retention, sending/receiving, domains, support; implementation/setup may be separate                          | Add unknown `Q_mailbox`; obtain written included units and extra rates. Sending plan does not automatically include mailboxes                                              |
| General product page [H02]                    | Free Inbox software but channel charges apply; dedicated IP listed $24.95/IP/month; other services have separate meters                                                          | Do not buy a dedicated IP merely because agents send mail. Need and eligibility are separate decisions; not assumed in model                                               |
| Older/dynamic marketing discovery             | Search surfaced $1.50/1,000 and targeted-contact pricing on marketing-v2; direct read returned HTTP 401                                                                          | **Unverified candidate only**, not a price. No login/access workaround attempted. Contact-based marketing must not be substituted for transactional API or Mailbox pricing |

Commercial acceptance sheet for later owner/vendor discussion: exact product/API,
legal billing entity/currency/tax, rate version/effective date, inbound meter,
recipient-vs-message counting (including To/Cc/Bcc), duplicates/rejected/failed sends,
attachments/retention/storage, mailbox count, setup, minimum recurring cash commitment,
wallet rollover/refund/expiry/cancellation, top-up behavior, support and outage terms.
This is not authority to contact sales now.

Two conditional Bird formulas (choose only after terms resolved):

```text
Deposit model:
  U_B = N_billable_send * p_send/1000 + Q_mailbox + U_other
  B_end = B_start + D + topups - U_B
  Required extra topups >= max(0, U_B - B_start - D)
  cash funding = D + topups; consumption = U_B (not D + U_B)

Flat allowance model:
  C_B = F_plan + p_over * max(0, N_billable_send - V_included)/1000
        + Q_mailbox + add_ons
```

`D`, `F_plan`, `V_included`, inbound rates and billable units must match the actual
agreement. Top-up minimums/billing granularity remain unknown. A larger deposit may
lower unit rate but lock up cash; optimize total liquidity and commitments, not just
per-email price. No volume here justifies choosing Growth or Scale.

### Supabase

| Item               | Public planning input [H06–H09]                                                          | Qualification                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Free               | 500 MB DB/project, 1 GB files, 5 GB uncached + 5 GB cached egress, 500k Edge invocations | Inactivity pause after one week; no automatic DB backups; not adopted for live operations                                                    |
| Pro                | $25/org/month; $10 compute credit; 8 GB DB disk/project, 100 GB files/org                | Compute separate per project; usage quotas aggregate across org except stated per-project disk                                               |
| Compute            | Micro ~$10/month, Small ~$15, Medium ~$60; hourly metered                                | One credit per org, not per project; workers/model execution are not implicitly covered                                                      |
| DB disk            | $0.125/GB beyond 8 GB/project on general-purpose disk                                    | Provisioned disk, indexes, WAL/bloat/headroom matter, not just serialized message size                                                       |
| Object files       | $0.0213/GB-month beyond 100 GB                                                           | Pricing page precision used; not a raw MIME-only estimate                                                                                    |
| Egress             | 250 GB uncached then $0.09/GB; independent 250 GB cached then $0.03/GB                   | Model reads, downloads, exports and cross-service calls; cache hits cannot be assumed for private mail                                       |
| Edge               | 2m invocations/org then $2/million                                                       | Invocation count is not permission to run an unlimited durable worker; E owns runtime suitability                                            |
| Logs               | Pro 7-day retention; 20 GB ingestion then $0.50/GB                                       | Canonical history cannot depend on short-lived platform logs; avoid bodies/secrets in logs                                                   |
| Backups            | Pro daily DB backups retained 7 days; Team ($599 baseline) 14 days                       | Storage objects excluded; restore causes project downtime; custom-role passwords need separate recovery                                      |
| PITR               | ~$100/$200/$400 per month for 7/14/28-day retention                                      | Requires at least Small compute. One Pro+Small+7-day PITR baseline ~$130 = 25+15−10+100, before usage/artifact backup; not a selected budget |
| Optional log drain | $60/drain/project/month plus $0.20/million events and $0.09/GB egress                    | Not required by this design; compare simpler independent alerts/export before adding                                                         |

Spend cap is **not a universal dollar budget**: Pro controls selected usage, can
restrict service at quota, excludes compute/PITR/branches/log-drain items, and does
not offer arbitrary per-item budgets [H08]. Independently meter model/API calls,
attachment bytes, retries and cash funding; bound inbound abuse before expensive work.

### Credible alternative cost comparator (capability verdict remains C's)

Resend publicly lists Free 3,000/month with 100/day; Pro $20 for 50,000 and $0.90 per
1,000 beyond allowance; $35 for 100,000; Scale starts $90 for 100,000. Inbound counts
toward transactional quota. Three inboxes included; paid PAYG extra inbox $1/month.
Marketing contacts and vendor AI credits are separate meters, **not** the budget for
our own AI model [H10]. Current page states overage buckets of 1,000:

```text
N_Resend = N_received + N_sent (verify recipient counting for chosen workflow)
C_Resend_Pro50k = 20 + 0.90*ceil(max(0,N_Resend-50000)/1000)
                  + max(0,inboxes-3)*1
```

This is a list-price comparator, not an assertion of API equivalence or permission to
switch. When `alternatives.md` exists, use C's hard-gate analysis before choosing it.
No alternatives dossier existed at initial H inspection; this avoids blocking costs
on sibling timing and avoids duplicating capability research.

## 2. Runnable spreadsheet model, not a fabricated total

Inputs: `I` inbound/month; `O` outbound recipient deliveries/month (including order
notices, support, supplier mail and any approved campaigns); `f_i/f_o` fraction with
attachments; `a_i/a_o` mean attachment MB among messages with attachments; `b_i/b_o`
mean retained raw MIME MB **excluding attachment payloads**; `R_a/R_b` retention days;
`d` days/month (30 only in examples); `k_a/k_b` retained-copy/encoding multipliers.
Count both incoming and outgoing evidence and any versioned artifacts; do not double
count attachments if `b` is instead measured from full raw MIME. Base64 wire inflation,
deduplication, quarantine copies, extracts and thumbnails need measurement.

```text
M = I + O
monthly_attachment_GB = (I*f_i*a_i + O*f_o*a_o)/1000
monthly_body_GB = (I*b_i + O*b_o)/1000
steady_object_GB = monthly_attachment_GB*R_a/d*k_a
                  + monthly_body_GB*R_b/d*k_b + quarantine_GB
  (at launch, use elapsed days rather than full retention until steady state)

DB_GB = retained_rows*measured_row_plus_index_bytes/1e9 + system/WAL/headroom
E_uncached = body_and_attachment_reads_GB + model_transfer_GB
             + exports_GB + other_service_egress_GB
  (count each byte where it actually exits Supabase; don't count ingress as egress)
V_edge = ingress_calls + event_calls + scheduled_polls + worker_calls
         + retries + reconciliation_calls + abuse_calls

Pro_SB = 25 + max(0, sum(hourly_compute_charges)-10)
       + .125*sum(max(0,project_provisioned_DB_GB-8))
       + .0213*max(0,avg_object_GB-100)
       + .09*max(0,E_uncached-250) + .03*max(0,E_cached-250)
       + 2*max(0,V_edge-2000000)/1000000
       + .50*max(0,log_ingest_GB-20) + selected_addons
```

Use vendor billing granularity/GB definitions for final invoicing; formulas approximate
published units. MAU/Realtime and other product usage, if introduced, add their meters.
Archive backup storage is **separate** from active object storage.

```text
For each model/task j (triage, reply, review, attachment OCR, summary):
  C_model_j = calls_j * (input_tokens_j*p_in_j + output_tokens_j*p_out_j)/1e6
              + separately_priced_cache/tool/OCR_units_j
C_model = sum(C_model_j), with failures/retries included in calls_j
C_worker = fixed_worker_host + compute_seconds*p_second + billed_requests*p_request
C_backup = offsite_GB*p_storage + backup/export_egress + restore_drill_compute
C_total_consumed = C_email + Pro_SB + C_model + C_worker + C_backup
                   + monitoring/security + domain/postal/admin + taxes
C_economic = C_total_consumed + human_hours*owner_value_per_hour
```

Model provider/rates, hosting, domains, postal address solution, monitoring, backup
vendor and taxes are **unknown variables**, not zero. Hosted agent subscriptions,
orchestrator charges and usage-based tools must be included if selected. Do not add
Edge runtime hosting twice if that is the selected worker. `cash required` separately
includes vendor deposits, recurring prepayments and working-capital buffer.

### Illustrative workload scenarios — not forecasts, targets, or chosen retention

All use `O=2I`, `f_i=.2`, `f_o=.1`, `a_i=a_o=2 MB`, `b_i=b_o=.05 MB`,
`R_a=R_b=90 days`, `k_a=k_b=1`, 30-day months. These are deliberately simple
replacement inputs; actual attachments/duplicates/multiple recipients can dominate.

| Scenario       | I / O per month | Attachment GB/month | Body GB/month | Steady active objects | Email-only comparison at 50k Pro Resend / Bird Startup usage* |
| -------------- | --------------- | ------------------- | ------------- | --------------------- | ------------------------------------------------------------- |
| Small example  | 300 / 600       | .24                 | .045          | .855 GB               | $20 / $.54                                                    |
| Larger example | 3,000 / 6,000   | 2.4                 | .45           | 8.55 GB               | $20 / $5.40                                                   |
| Stress example | 30,000 / 60,000 | 24                  | 4.5           | 85.5 GB               | $56 / $54                                                     |

`*` Resend counts inbound + outbound (900/9k/90k); Bird values use only outbound at
H01 $0.90/1,000 and **exclude unknown inbound/Mailbox costs and $15 recurring cash
deposit**. They are not comparable two-way totals; specifically show why a cheap
outbound quote cannot settle the choice. At 365-day retention the stress example's
objects become 346.75 GB before duplicate/backup copies, not 85.5 GB. Storage crossing
100 GB is not the main solo-human capacity test.

## 3. Human capacity and operating contract

**Proposed/inference, not measured:** assign one accountable human, finite staffed
windows and a clear unstaffed mode. No response is not approval. Advertising, financial
exceptions and changed commitments remain explicit-approval work. The ledger's possible
12–24h approval window is unset; it cannot become an incident-response promise.

```text
daily_human_minutes = incoming_cases_day*exception_fraction*minutes_exception
                    + sampled_auto_cases_day*minutes_review
                    + fixed_reconciliation_minutes + incident_minutes
utilization = required_human_minutes / actually_available_minutes
```

For illustration only, `10/100/1000 inbound/day`, 10% exceptions, 8 min/exception,
review 5 automated cases at 2 min and 15 min fixed operations imply **33/105/825
minutes/day**, before incidents, sourcing, tax, returns or fulfillment. No claim that
10% is achievable. Owner chooses daily availability and safety margin below full
utilization; measure pilot exception rates and queue aging before authorizing scale.
Agent quality score is not a replacement for oldest-case age or unresolved-send count.

### Proposed severity policy (owner must ratify response targets)

| Severity                  | Trigger                                                                                                        | Immediate safe action                                                                                                               | Human action / restart gate                                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S0 safety/security        | Suspected data disclosure, stolen key, recipient mix-up, uncontrolled sending, fabricated financial commitment | Stop affected outbound and model disclosure immediately; global stop if scope unclear; preserve evidence                            | Independent alert to owner; contain, assess breach/reporting obligations with appropriate help, rotate compromised material; only owner restarts after bounded verification |
| S1 integrity/availability | Inbound capture gap, missing artifacts, unresolved send outcomes, ledger unavailable, outage, budget exhausted | Hold affected work; no blind resend or silent vendor failover; retain ingress only where verified durable capture remains possible  | Owner checks recovery window and vendor evidence; reconcile before replay; if unavailable, remain stopped and do not promise 24/7 response                                  |
| S2 customer exception     | Refund request, disputed order, sensitive attachment, address change/fraud concern, privacy/consent request    | Hold unauthorized commitments; route case with minimal evidence and due date; safe receipt acknowledgement only if already approved | Owner decides within selected staffed windows/deadlines; expiry declines/escalates, never approves                                                                          |
| S3 routine                | Low-risk bounded reply within approved facts and policy                                                        | Proceed only with valid permissions and healthy dependencies                                                                        | Daily sampling and trend review; regressions raise severity                                                                                                                 |

Hard kill control must be outside model discretion and checked at the final send gate.
Provide scope (global/domain/workflow/vendor), owner/reason/time, and a separate
manual provider-revocation path if the application is compromised. Stop _sends_ without
deleting evidence or disabling safe receipt capture. In-flight accepted sends cannot
be promised recalled. Recovery mode starts stopped; restoring a database must not
restore blanket authority or resurrect stale approvals. Detailed execution belongs E.

### Solo cadence and recovery acceptance

- **Every staffed day:** inspect oldest open case, capture/artifact lag, uncertain
  sends, failed/dead-letter jobs, provider-vs-ledger count differences, suppressions,
  complaints/bounces, low wallet balance, model token burn, attachment growth and backup
  freshness. Healthy status requires a fresh heartbeat; silence is not “all good.”
- **Daily reconciliation:** compare distinct provider records/events with canonical
  intents and artifacts, using a checkpoint and overlap window sized to documented
  retention. Counts alone miss swapped recipients: spot-check identity and hashes.
  Flag missing/unmatched items for human resolution. Neither Bird dashboard nor agent
  memory is canonical. If B finds no recoverable provider history, this is a hard
  recovery gap, not a task to fix by polling harder.
- **Weekly proposed review:** exception/complaint trends, policy changes, quota and
  cash runway, delayed suppliers, unresolved privacy requests, artifact expiry and
  deletion failures. Use the results to reduce autonomy before queues overwhelm one
  human. Adjust cadence to observed risk; these are not legal deadlines.
- **Backups:** independently protect canonical DB, object bytes and manifests/hashes,
  routing/policy versions, suppression evidence, configuration, and recovery access.
  DB backup alone cannot restore deleted attachments [H07]. Encryption and separated
  access are required design criteria; retention for backup copies must be explicit.
- **Restore drill before live autonomy, then after material changes and on an
  owner-selected cadence:** restore an isolated dataset with sends disabled, verify
  message/artifact links and access controls, reapply deletion/suppression tombstones,
  compare post-restore provider outcomes, and measure achieved RPO/RTO. Do not replay
  already accepted messages from a rolled-back intent table. Test key recovery and
  custom-role credentials separately. No drill was run in this research.
- **Rotation:** inventory Bird, Supabase, worker, model, webhook, archive and alert
  secrets with owner/scope/last check. Planned rotation uses least privilege, staged
  overlap only where supported, synthetic verification, old-key revocation and audit.
  Suspected compromise triggers immediate containment/rotation; do not invent a
  universal 90-day requirement. No secrets in logs or recovery documents.
- **Outages:** model unavailable → approved static acknowledgement or hold, not
  another model with unreviewed privacy terms. Bird unavailable → queue/hold with
  expiry and reconcile uncertain submissions after recovery. Supabase unavailable →
  stop externally visible actions; verified upstream retention/buffering must cover
  recovery, otherwise declare capture risk. Alerting must not depend solely on the
  failed email/vendor path. Vendor failover requires previously approved identities,
  suppressions, privacy terms and recovery semantics; no DNS or provider mutation
  is authorized by this dossier.
- **Unavailability/vacation:** default to lower autonomy and honest response windows.
  One human cannot promise round-the-clock emergency intervention. If a case requires
  continuous supervision, add authorized coverage or decline that operating scope.

Owner must choose maximum tolerable data loss (`RPO`), recovery delay (`RTO`), oldest
case age and unattended duration. PITR's documented worst-case two-minute DB RPO
does not establish end-to-end mail/artifact RPO or an observed restore time [H07].

## 4. Conditional jurisdiction and AI/privacy gates

These are decision gates, **not legal advice or a conclusion that a law applies**.
No incorporation, operating country, customer region, supplier region or model
provider is established. “Personal business” is not equivalent to purely household
data processing. Confirm actual establishment, targeted markets and data flows first.

| If / question                                                                             | Decision-changing consequence                                                                                                                                                                                                                               | Evidence / scope                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| US commercial email rules apply; message is promotion rather than narrowly transactional? | Accurate sender/routing/subject, advertisement treatment, valid physical postal address and usable opt-out; opt-outs honored within 10 business days, mechanism available ≥30 days. Vendor outsourcing does not remove responsibility                       | FTC [H11]. Mixed support-plus-upsell can change primary purpose. Do not quote the page's dated penalty figure as a 2026 maximum                  |
| UK PECR applies to unsolicited electronic marketing to individual subscribers?            | Consent or _all_ conditions of product/service soft opt-in; direct collection during sale/negotiation, own similar products, opt-out at collection and every later message. Public email address is not consent; sole traders can be individual subscribers | ICO [H12]. Corporate subscribers differ; no blanket “B2B exempt” assumption. Source has 2026 charity update, irrelevant to this business         |
| Established in EEA, targeting goods/services to people there, or monitoring there?        | Assess GDPR scope; appropriate lawful basis, transparency, minimisation, security and purpose-specific retention; customer addresses, receipts, pictures and order references are personal data                                                             | EDPB [H13]. A small/solo operation is not presumed exempt                                                                                        |
| Vendor/model receives personal data under GDPR processor arrangement?                     | Document roles/instructions and contract, subprocessors, security, rights assistance, deletion/return and audit evidence. Do not assume a consumer chat subscription is an approved processor channel                                                       | EDPB [H14]; applying this to our vendor selection is a proposed gate, not vendor-specific findings                                               |
| Data subject to GDPR is made available to another organization outside EEA?               | Assess Chapter V mechanism (applicable adequacy or appropriate safeguards and transfer assessment), on top of lawful basis and processor terms                                                                                                              | EDPB [H15]. EU DB location alone does not settle email/model/support/backup access; don't treat exceptional derogations as routine authorization |
| Required residency specified?                                                             | Name exact Supabase region; “Europe” grouping is not proof of EU-only residency. Map Bird, worker, model, telemetry, archive and support separately                                                                                                         | Supabase [H09]; region selection is not a compliance certificate                                                                                 |
| Other countries/states, regulated goods, children, or sensitive data are in scope?        | Stop and obtain a targeted local review before launch/expansion; do not infer US/UK/EEA review covers them                                                                                                                                                  | Deferred because geography/product scope is unknown; no encyclopedia or applicability invented                                                   |

### Minimum privacy operating sheet (proposed)

Before any real inbox/model processing, record purpose and lawful basis where needed,
approved data classes, exact vendors/features/regions, DPA and subprocessors, transfer
basis where needed, training/secondary-use terms, abuse-log retention, contractual
deletion exceptions, access model, incident contact, rights/export/deletion process and
owner. **Unknown model provider means these gates are open**, not that raw email can
be sent to whichever model is easiest. Do not assume “zero retention” or “no training.”

Treat email and attachments as untrusted data. Prefer minimal structured fields and
redacted excerpts to full threads. Quarantine identity documents, payment-card data,
health/child-related or irrelevant sensitive material; do not pass to models by default.
Do not create embeddings or attachment OCR archives without a purpose and retention
decision; those are additional copies/processors, not free transient operations.

Choose retention by **purpose**, not a universal “keep everything” interval:

| Data class                              | Required owner decision / deletion behavior                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Raw MIME/body/attachment                | Select support/dispute necessity and periods; attachment can expire earlier than order/accounting record; quarantine separately     |
| Normalized case/order evidence          | Keep only fields needed for service, disputes and applicable accounting duties; legal holds require documented reason and review    |
| Consent/suppression                     | Preserve enough evidence to respect opt-out and demonstrate basis; do not erase suppression then reimport the person as marketable  |
| Model prompts/outputs, traces, extracts | Minimize content; short justified debug periods; include vendor abuse logs, local exports and caches in inventory                   |
| Backups                                 | Finite expiry, restricted restore, deletion tombstones replayed after restore; no claim of immediate erasure from immutable backups |

Do not confuse internal agent drafting with legally significant autonomous decisions.
If future scope includes automatic credit/fraud rejection, binding refunds, profiling
or sensitive-data decisions, reopen targeted legal/impact review before granting that
authority. This dossier does not decide AI Act classifications or mandate a particular
disclosure formula. Truthful notice of actual AI processing and a workable human
contact are proposed defaults; exact legal duties require the chosen use case/regions.

## 5. Findings, curiosity decisions, and stop

Competing pricing explanations: stale search index, stale billing docs, different
product generations, or a recent commercial change. Observation distinguishing them:
the applicable SKU/API and written terms with effective date. Public pages establish
conflict but do **not** establish which explanation is true.

Native `curiosity_decide` was not discoverable (search returned no such tool), matching
the shared ledger limitation. Decisions below are explicit evidence-led substitutes,
not a claim that a native gate ran. Search text was treated as untrusted candidates;
only fetched primary sources support adopted provider/legal claims.

| Evidence boundary / question                                                   | Relevance / value / novelty / cost (1 low–5 high) | Decision and result                                                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Bird search vs fetched Email terms disagree: inspect billing and alternate URL | 5/5/5/1                                           | Pursued: H03 conflicts with H01; H04 fetch matches H01. Retain contradiction and require terms, not another guessed number |
| Could two-way mailbox be silently extra?                                       | 5/5/4/1                                           | Pursued: H05 explicitly quote-only, separate from sending; retain unknown inbound/storage cost                             |
| Does DB backup cover attachment archive and cheap recovery?                    | 5/5/4/1                                           | Pursued: H07 excludes objects; PITR requires Small. Add object backup and ~$130 PITR baseline                              |
| Are location and model processing prerequisites resolved by an EU DB?          | 5/5/3/2                                           | Pursued: H09/H13–H15 require separate data-flow/transfer/contract decisions; owner unknowns remain                         |
| Broader provider shopping                                                      | 2/2/1/3                                           | CURIOSITY_NO_GO: C owns alternatives; retain one primary cost comparator without duplicating feature diligence             |
| Resolve old marketing-v2 rates through credentials                             | 1/1/2/5                                           | CURIOSITY_NO_GO: 401 access boundary, outside authority, unnecessary to current API decision                               |
| All-country legal survey / AI-law encyclopedia                                 | 1/1/2/5                                           | CURIOSITY_NO_GO: no regions/use-case established; would produce false precision, not change today's gate                   |
| Pick model/host and optimize token prices now                                  | 2/2/2/4                                           | CURIOSITY_NO_GO: provider/privacy/quality/workload unset; preserve replaceable variables instead                           |

### Owner decisions public research cannot settle

1. Business establishment and permitted customer/supplier regions; transactional-only
   launch versus separately approved marketing; legal sender identity/postal address.
2. Exact Bird product after B's feasibility findings; acceptance of a mailbox quote,
   minimum cash deposits, budget ceiling and required support/recovery terms.
3. Actual workloads/attachment distributions and daily human availability; escalation
   response/expiry windows, maximum unattended duration and authority boundaries.
4. Model provider/product, worker host, approved data/regions, contract/privacy terms,
   retention/deletion policy and incident/legal assistance route.
5. Backup RPO/RTO, archive protection and drill budget; appetite for PITR versus daily
   DB backups and independently recoverable artifacts.

**Stop:** executable equations, scenario sensitivities and owner-run operating checks
are present. Further public research cannot select those inputs or reconcile account
terms. Reopen after B identifies API/product, C supplies capability comparison, or the
owner supplies jurisdictions, budget, workload, availability and model provider.

## 6. Retained source ledger

All sources accessed **2026-10-16 UTC** by unauthenticated webfetch. No effective date
was stated in vendor pages unless noted; these are observations, not contracts.

| ID  | Exact URL / product                                                                                                                                                                                                          | Exact retained claim; limitation; why retained                                                                                                                                                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H01 | https://bird.com/pricing/email — Bird Email                                                                                                                                                                                  | USD Startup $15 deposit/$0.90 per 1k, Growth $250/$0.45, Scale ladder above; paid no free sends; unused funds carry forward. No visible effective date/API entitlement. Retained canonical current economic model, not search snippet                                                               |
| H02 | https://bird.com/pricing — Bird product catalog                                                                                                                                                                              | Product-specific billing, recurring Email balance deposit, free Inbox plus channel charges, Mailbox quote, dedicated IP $24.95. Generic catalog cannot prove inbound API coverage. Retained to prevent combining unlike products                                                                    |
| H03 | https://bird.com/docs/knowledge-base/billing/plans-and-pricing — Bird billing KB                                                                                                                                             | Fixed charge/included allowance, free 1k/month 50/day, paid optional overage and default 5× total cap. No effective date; conflicts H01. Retained contradiction, not assumed governing contract                                                                                                     |
| H04 | https://bird.com/products/email/pricing — alternate Email URL                                                                                                                                                                | Fetch presented canonical H01 deposit table, while search returned flat $15/50k table. Search table not adopted. Retained redirect/currency-generation uncertainty and negative result for flat-price confirmation                                                                                  |
| H05 | https://bird.com/pricing/mailbox — Mailbox API                                                                                                                                                                               | Custom quote by count, volume, storage, retention/attachments, sending/receiving/support; sending plan does not automatically include mailboxes. No numerical unit price. Retained hard economic unknown for two-way workflow                                                                       |
| H06 | https://supabase.com/pricing — hosted plans                                                                                                                                                                                  | Free/Pro/Team/Enterprise, compute credit and hourly instances; disk/files/egress/Edge/logs/add-ons rates in sheet. Does not measure required size or actual billing. Retained primary unified rate sheet                                                                                            |
| H07 | https://supabase.com/docs/guides/platform/backups — hosted DB backups                                                                                                                                                        | Paid daily retention 7/14/up to30 days; Storage objects excluded; restore downtime/custom-role password caveat; PITR Small prerequisite and ~$100/200/400, worst-case DB RPO two minutes. Vendor documentation, not measured recovery. Retained because it changes architecture and recovery budget |
| H08 | https://supabase.com/docs/guides/platform/cost-control — Pro Spend Cap                                                                                                                                                       | Only certain meters covered; compute/PITR/branches/log drain excluded; quota restrictions possible; not fine-grained budget/notifications. Retained to avoid false safety from a spend-cap toggle                                                                                                   |
| H09 | https://supabase.com/docs/guides/platform/regions — hosted regions                                                                                                                                                           | Primary project data in chosen region; use exact region for specific jurisdiction; broad Europe may include non-EU locations; not proof of compliance. Does not cover every vendor data flow. Retained residency distinction                                                                        |
| H10 | https://resend.com/pricing — transactional, inbound, inboxes                                                                                                                                                                 | Free 3k/100 day; Pro20/50k and .90 per1k overage; inbound quota; 3 inboxes, extra1 paid PAYG; overages buckets1k. Not independent reliability measurement or equivalence finding. Retained credible alternative economic baseline for C coordination                                                |
| H11 | https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business — US CAN-SPAM guidance                                                                                                                | Primary-purpose commercial vs transactional, address, opt-out10 business days/mechanism30 days, outsourcing responsibility. Page dates August2023, edited January2024; numerical penalties intentionally not adopted as current. Retained official actionable classification gate                   |
| H12 | https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/ — UK PECR | Individual/corporate distinction, consent or all soft-opt-in conditions, no publicly available-address consent, prompt suppression. Contains charitable soft-opt-in effective5 February2026, not applied here. Retained current official marketing gate rather than stale general guide             |
| H13 | https://www.edpb.europa.eu/sme/learn-the-basics/data-protection-basics_en — GDPR SME guide                                                                                                                                   | EEA establishment/targeting/monitoring scope; personal data examples; lawfulness, minimisation, purpose/storage limitation and security. General regulator guidance, not applicability opinion. Retained scope and retention decision basis                                                         |
| H14 | https://www.edpb.europa.eu/sme/learn-the-basics/data-controller-or-data-processor_en — GDPR roles                                                                                                                            | Controller decides purposes/means; processor follows instructions; contractual processing, subprocessor authorization, assistance and deletion/return duties. Doesn't classify actual chosen vendors. Retained AI/vendor contract gate                                                              |
| H15 | https://www.edpb.europa.eu/sme/be-compliant/international-data-transfers_en — GDPR transfers                                                                                                                                 | Three cumulative transfer criteria; adequacy/safeguards, SCC assessment, derogations exceptional; transfer rules supplement lawful basis/contracts. Does not approve any named vendor. Retained to reject “EU database solves everything” inference                                                 |

Negative results retained: `tools.web_search` returned `WEB_SEARCH_CONFIG_INVALID`;
broad discovery continued with exposed `functions.websearch`, not credential access.
https://marketing-v2.bird.com/pricing returned 401. Two guessed Commission guidance
URLs returned 404; EUR-Lex ELI and CELEX full-text fetches returned no content. No
claims attributed to those unread sources; fetched EDPB guidance replaced them.
No child delegation used (allocation zero).

Verification: source-grounded research and arithmetic only; no hosted connectivity,
sending, recovery, load, compliance certification or application completion tested.
Repository checks/builds are not probative for this documentation-only research and
were not run. Dossier path and formulas checked locally before handoff.
