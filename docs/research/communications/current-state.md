# Current state, requirements, and authority

Research inspection: 2026-10-16 UTC. This is the owner's personal business, **not Averra**.
No employer repository, Twilio account, Graph mailbox, or unrelated database was inspected.
Labels below distinguish observed implementation from proposed work. Historical test claims
in existing documents are not presented as new executions.

## Inventory before replacement

| Area                    | Observed evidence                                                                                                                           | Status / implication                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository              | `AGENTS.md`; `README.md:1–16`; `docs/architecture.md`; `docs/backend.md`; `apps/storefront/README.md`                                       | Backend-first pnpm/Turbo/Next foundation, owned UI, separate operations preview and shop                                                                                                                                                             |
| Shop                    | `apps/storefront/src/lib/catalog.ts`; storefront README:34 onward; bag and navigation tests                                                 | Fixture catalog and browser-local bag; disabled checkout. Not connected headless Shopify                                                                                                                                                             |
| Operations              | `apps/web/src/lib/sections.ts:17–26`; README:15–16                                                                                          | Empty order/supplier states, not live operational systems                                                                                                                                                                                            |
| Email receipt code      | `packages/database/supabase/functions/resend-webhook/{index,handler,handler.test}.ts`; migration `20261016032855_resend_event_receipts.sql` | Signature checking and minimal lifecycle-event receipts only. No message-body retrieval, sending, conversation management or jobs                                                                                                                    |
| Hosted deployment       | Read-only formerbase `list_migrations`, `list_tables`, `list_edge_functions`                                                                | Migration `20261016032855`; `resend-webhook` v1 ACTIVE, JWT off with handler signature validation; one private table                                                                                                                                 |
| Hosted data / privilege | Bounded read-only catalog query, PostgreSQL 17.11                                                                                           | `integrations.resend_events` count **0**; RLS on; anon/authenticated/service_role lack schema USAGE; receipt RPC security-definer with empty search_path; only service_role can execute it                                                           |
| Queues / agent runtime  | Source search `shopify                                                                                                                      | bird                                                                                                                                                                                                                                                 | messagebird | sparkpost | JEV | twilio | pgmq | approval | advertis | fulfill`; hosted installed-extension list | No application integrations or approval runtime found; no installed PGMQ extension in inspected project. No claim about systems outside this repo |
| Security advisory       | Hosted security advisor and catalog query                                                                                                   | Pre-existing `public.rls_auto_enable()` security-definer event-trigger function callable by anon/authenticated. Advisor flags it; investigate actual invocation exposure before assigning exploitability. Do not change unrelated grants in research |
| Tests rerun             | `pnpm --filter @repo/database test`, exit 0                                                                                                 | **16 passed / 0 failed**, synthetic Svix signatures and injected persistence function; not live signed delivery or real database transaction testing                                                                                                 |
| Git / working state     | `git status --short -- .`, `git rev-parse --show-toplevel`                                                                                  | Root **is now `/Volumes/dev/store`**; many pre-existing untracked implementation files. Prior parent-root caveat is stale, not justification to restructure Git                                                                                      |

Hosted checks confirmed the named project's existing state; no hosted writes occurred.
No Bird account entitlement, connected domain, Shopify store, agent credentials, live sender,
owner authentication, or provider sandbox was inspected. Context7 documentation lookup hit
its monthly quota; official direct sources were used instead. No `anti.md` or additional
plan/spec convention was found by bounded filename reconnaissance.

## Requirements map

| Job                                                                        | Evidence category                                                                  | Launch recommendation                                                                                                                              |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Receive and reply to support inquiries                                     | Candidate need inferred from operating a shop, **not observed production traffic** | First narrow proof: receive a controlled support message and send a policy-allowed informational reply; ambiguity becomes an owner task            |
| Receive supplier mail / attachments                                        | Candidate requirement, supplier and fulfillment arrangements unknown               | Design preservation/quarantine now; automate commitments only after actual supplier process and authority are established                          |
| Transactional order notifications                                          | Candidate requirement; no orders integration                                       | Assign one sender per notification after commerce selection. Do not duplicate Shopify notifications                                                |
| Marketing / campaigns                                                      | Not approved launch scope                                                          | Do not enable; consent, unsubscribe, audience, jurisdiction and spend policy unresolved                                                            |
| SMS / WhatsApp / voice / agent mailboxes                                   | Not established                                                                    | Do not build                                                                                                                                       |
| Supabase owns application identities, history, routing, workflow, policies | **Owner requirement**                                                              | Canonical records in private backend; provider retains transport facts and required operational infrastructure                                     |
| Bird preferred over Resend                                                 | **Owner preference**                                                               | Evaluate hard gates first; preference breaks genuine ties, not missing inbound or recovery capabilities                                            |
| Shopify custom headless frontend, JEV decisions, ~99% autonomous           | **Prior owner direction**                                                          | Not implemented evidence. No Shopify migration or JEV tool guarantees may be inferred                                                              |
| Advertising proposals need explicit approval, silence declines/expires     | **Owner requirement**                                                              | Exact expiry duration unset (roughly 12–24h discussed); no default authorization and no automatic advertising action in email pilot                |
| Refunds, discounts, cancellations, supplier commitments                    | **Unresolved business policy**                                                     | No invented thresholds. Omit mutation tools initially; later grant explicit bounded policies, rather than require approval for every routine reply |

## Commerce source-of-truth boundary (proposed, conditional on selection)

Supabase should own conversation/work assignment and references to authoritative external IDs,
not assert that a cached order snapshot is current truth. If Shopify is selected, its order
and fulfillment records remain authoritative for commerce actions in its scope; payment
settlement remains with the selected payment processor and actual transport events with the
transport. Store snapshot time, source ID/version where supplied, and reconciliation outcome.

Before an order-specific answer: resolve customer relationship under access policy, fetch fresh
source state, and refuse unrelated-customer lookup. An order number or matching email subject
is neither customer identity nor permission. Recheck the source immediately before consequential
mutation and inspect result afterward. An email saying “canceled” is not a successful cancellation.

Official Shopify webhook documentation redirects the inspected URL
<https://shopify.dev/docs/apps/build/webhooks/subscribe/https> to
<https://shopify.dev/docs/apps/build/webhooks/verify-deliveries> (source G01, accessed 2026-10-16,
current unversioned guide, publication date unstated). It documents raw-body HMAC verification
and delivery-ID duplicate handling. Retained to prevent assuming commerce webhooks are trusted
or exactly-once. No Shopify integration is selected or implemented by this research.

## Agent authority boundary (proposed)

No project JEV integration was found. A Jev advisory tool in this assistant environment is not
the company's deployed decision system, identity provider, policy authority, or executable
approval. Leave a typed optional classification/advice interface, not a dependency on invented
JEV behavior.

Keep six steps separate: receive → interpret → propose → authorize → execute → verify.
The model gets conversation-scoped data and cannot read provider/service secrets. Deterministic
backend checks restrict sender identities, destination participants, attachments, allowed reply
type, policy version, conversation revision and one active response intent. Tool authentication
is workload identity; a model-generated role string is not authority. Kill switches and current
suppression checks run again immediately before dispatch.

Owner approvals occur in an authenticated owner interface with verified identity and fresh
authorization, not by replying “approved” to email. Bind approval to a digest of exact action,
target, recipients, content/artifact hashes, source-state preconditions, policy version and expiry.
Changes invalidate it. One-time consumption is transactional with the authorized intent; an
expired approval cannot be revived by delayed processing. Advertising expires/declines on
silence; no duration is silently chosen. Ordinary safe replies can execute under explicit standing
policy without per-message approval. Consequential commerce tools stay absent until policies exist.

Security source F01: OWASP, current LLM Prompt Injection Prevention Cheat Sheet,
<https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html>,
accessed 2026-10-16; publication date unstated. Retained for its explicit external-email/attachment
threat model, warning that prompt formatting is not enforcement, and tool-boundary authorization.
It supports defense-in-depth, **not a claim this design defeats prompt injection**. Untrusted
mail, HTML, attachments, provider results and retrieved memories remain data; classifier/JEV
agreement cannot grant permission. Use artifact isolation and scoped reads to limit leakage.

## Unknowns that matter

Real domains and DNS authority; provider entitlement/region; business/customer jurisdictions;
actual support and supplier workflow; commerce selection; traffic and attachment sizes; model
runtime; approved routine-response policy; owner authentication and escalation destination;
advertising expiry and all consequential-action policies. Research can design gates but cannot
invent these business choices. They do not justify migrating a nonexistent mailbox system.
