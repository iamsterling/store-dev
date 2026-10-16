# Communications infrastructure decision brief

**Research-only recommendation — 2026-10-16 UTC.** No production implementation, provider
purchase, DNS change, real email send or hosted mutation was performed.

## Decision

**Use Bird as the preferred candidate for a tightly bounded two-way email proof, not as an
already-cleared production dependency.** Its current regional **Bird Email REST `/v1` API**,
not the older Channels API or an assumed SparkPost integration, documents the required direct
sending, inbound MIME/attachment retrieval, signed webhooks and inbound listing. Supabase can
own the business state without Bird Conversations, CRM or one mailbox per agent. [B01–B08]

**Production selection is conditional.** Bird has an explicitly documented uncertain-send
duplicate window, only three-hour response replay, unresolved account entitlement/commercial
terms, and untested reply fidelity. Do not begin autonomous production sends until the proof
and operational gates pass. If Bird cannot meet them at acceptable cost and exception burden,
**Resend is the first fallback candidate**, not a second simultaneous transport: its documented
24-hour send replay contract is materially stronger, and current receiving APIs exist. Its own
retention, permissions, reply and failure tests still need to pass. [B09, C01–C26]

If the owner requires automatic recovery of every uncertain send without human exceptions,
**do not select Bird under the presently documented contract**. Local queues cannot supply the
missing external atomicity. Neither provider has been demonstrated exactly-once by this research.

Confidence: **high** in the cited documentation and inspected project state; **moderate** in
the proposed small architecture; **unverified** account-specific access, economics, real mail
fidelity, recovery behavior and human exception volume. No weighted score can average away a
failed hard gate.

## What makes this recommendation defensible

| Gate                                          | Bird                                                                                                                                                                     | Focused alternative / decision consequence                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| API-first own-domain send and two-way capture | Current direct API documents full original MIME, attachments and list recovery; 20 MB, 30-day inbound window. Trusted envelope/receiving-route provenance remains a gate | Resend also documents receiving, raw content and listing; both require capture and route-provenance tests                          |
| App state stays in Supabase                   | Direct endpoints need no Bird CRM/Conversations workflow                                                                                                                 | Same proposed model possible with Resend; external suppression and transport facts remain provider-owned                           |
| Authenticated and recoverable events          | Standard Webhooks; unordered at-least-once; ~27.5-hour retry schedule; failed-attempt replay only three days                                                             | Independent reconciliation required; webhook replay is not a complete history                                                      |
| Safe retry after uncertain acceptance         | Detailed guide explicitly permits re-execution before response retention; three-hour replay                                                                              | Resend documents 24-hour replay including response-loss recovery. This is a real advantage, not proof against every provider fault |
| Solo operation and cost                       | Feasible only with bounded automatic work and rare held exceptions; public pricing models conflict                                                                       | Actual inbound entitlement and written applicable SKU terms are selection gates, not optional procurement detail                   |

The decisive adverse Bird source is
<https://bird.com/docs/guides/idempotency>, independently fetched by coordinator as well as B.
It explicitly says an operation can take effect before its response is retained and a retry can
execute it again. Disable SDK/proxy automatic send retries while this remains unresolved.
Store the exact request first; reconcile positive acceptance evidence, otherwise hold unknown.
An empty eventually consistent search result is not proof that sending is safe. [B09, B21]

## Smallest sound design

1. One selected transport and one initial support receiving identity; use a test route before
   touching real DNS. Agent principals are internal permissions, not separate employee mailboxes.
2. Supabase private event/message/conversation/action records, immutable artifact storage and
   **one leased Postgres work table** initially. Receipt and work creation commit together.
3. Short Edge ingress and bounded workers, plus scheduled sweeps. Models are outside Postgres;
   add external parsing/scanning compute only when measured limits or artifact safety require it.
4. Scoped proposal tools and deterministic authorization. Routine approved informational replies
   can run automatically; no refund/spend/supplier-commitment tools without defined policy.
5. Exact-version authenticated owner approvals where required. Email cannot prove owner authority.
   Advertising silence expires/declines; the approximately 12–24-hour duration is still unset.
6. Outbox, per-attempt evidence, unknown-send hold, independent provider reconciliation,
   suppression checks, emergency outbound stop and tested DB **and object** recovery.

This is a new communications implementation beside an existing minimal Resend event receiver,
**not a mailbox migration**. Leave that deployed receiver untouched until its purpose is resolved.
The shop is fixtures with disabled checkout; Shopify/JEV are prior direction, not working integrations.

## Read the package by purpose

- [Current implementation and requirements](current-state.md): A/G/F, inspected hosted permissions,
  commerce authority and missing owner policies.
- [Bird dossier](bird.md): B01–B24, exact product/endpoints, contradictions and gates.
- [Focused alternatives](alternatives.md): C01–C26, Resend and Mailgun; no vendor encyclopedia.
- [Email identities and semantics](email-semantics.md): D sources, addressing/threading/trust.
- [Durability and execution](execution.md): E sources, PGMQ/Edge/backup semantics.
- [Solo operations and economics](operations.md): H sources, pricing conflicts and conditional legal gates.
- [Architecture and minimal contracts](architecture.md): diagram, trust/data boundaries and failure paths.
- [Validation and operations plan](validation.md): executed evidence versus blocked tests.
- [Phased implementation and decisions](plan.md): actionable acceptance/rollback and owner choices.
- [Independent challenge](review.md): objections and coordinator dispositions.
- [Shared research ledger](ledger.md): question ownership, research controls and stop decision.

## What not to build now

No omnichannel layer, campaign engine, automatic multi-provider failover, mailbox per agent,
universal adapter framework, autonomous financial authority, full helpdesk, vector database,
supplier platform or Shopify migration. Do not buy dedicated IPs, PITR or extra worker hosting
merely to make an architecture diagram look complete; choose these against explicit needs/RPO.

## Concrete next step

An implementation agent should first produce the **Bird contract-and-fixture proof** in phase 0,
without altering the shop or deployed receiver: confirm exact account/API/region entitlement
and applicable inbound terms, then under separately authorized test access prove capture,
reply headers, reconciliation and fail-closed uncertain sends. If it fails a hard gate, test
Resend against the same fixtures. No new research is needed to invent a large framework.

Owner decisions genuinely remaining: domain/test-account authority and permitted test recipients;
business/customer jurisdictions; first support-address/response policy and safe recipient behavior;
budget and acceptable exception/RPO/RTO limits. Advertising expiry and commerce mutation policies
are required **before those features**, not blockers to an email-only proof. No secrets in chat.
