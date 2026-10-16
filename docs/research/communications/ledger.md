# Communications research control and evidence ledger

Research date: 2026-10-16 (UTC). Decision is **not yet selected**. Research-only authority:
local documentation and safe synthetic experiments; hosted project inspection is read-only.
No production changes, paid resources, DNS, real email sends, or unrelated employer access.

## Shared outcome and questions

Most valuable priority: establish whether Bird can support one reliable two-way email
workflow with Supabase-owned operational state, including recovery from uncertain sends.
Hard gates precede pricing: controllable identities; complete inbound capture; correct reply
semantics; authenticated ingress; recoverable events/artifacts; safe external side effects;
least-privilege agent tools; realistic single-human operations.

Owner: one personal business; one internal human; agents run routine operations; Supabase
owns application identities/history/routing/policies/workflow; Bird preferred, not preselected.
Shopify/JEV/99% autonomy are prior direction, not established integrations. Advertising needs
explicit approval; no response declines/expires; duration approximately 12–24h remains unset.
No financial thresholds or automatic authority for refunds/etc. have been granted.

## Question ownership (exclusive dossiers)

| ID    | Owner                                          | Uncertainty and decision informed                                              | Owned output                                 |
| ----- | ---------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------- |
| A/G/F | Coordinator                                    | Actual implementation, launch workflow, agent authority and commerce ownership | current-state.md; decision/architecture/plan |
| B     | Bird specialist                                | Exact product/API and critical two-way/recovery gates                          | bird.md; source IDs B01…                     |
| C     | Alternatives specialist                        | Focused fallback and conditions reversing Bird preference                      | alternatives.md; C01…                        |
| D     | Email semantics specialist                     | Reply identity, correlation, headers, deliverability trust                     | email-semantics.md; D01…                     |
| E     | Supabase specialist                            | Durable state, atomic queues, leases, external-send crash gap                  | execution.md; E01…                           |
| H     | Operations specialist                          | Solo operations, economic scenarios, jurisdiction-sensitive obligations        | operations.md; H01…                          |
| I     | Independent reviewer, assigned after synthesis | Adversarial failure scenarios, source gaps and bias                            | review.md                                    |

Specialists read this ledger and existing docs; write only their dossier. Children return
evidence to their parent; no shared-file writes. Coordinator alone updates this ledger and
synthesis. Every retained source includes URL, access date, version/product, relevant date
if stated, claim, limits, and why retained. Reports must label owner/observed/documented/tested/
inference/proposed/unknown, and include contradictions and stopping rationale.

## Delegation budget and controls

Exposed `subagent` control supports role, prompt, background mode and resuming a session;
it exposes no max-depth or concurrency configuration. Therefore six levels are **not claimed
enabled**. Five specialist parents are authorized initially. Only B, C, and E may each spawn
one narrowly scoped child (return-only, no grandchildren); D and H have no child allocation
unless coordinator reallocates. Maximum is eight researchers in this wave plus coordinator;
independent reviewer follows. This is a shared budget, not eight per parent. Actual depth and
completion are recorded at synthesis. Do not evade runtime denials or tool limits.

## Evidence conventions

Project claims cite repo path/line or bounded database query. Provider claims cite primary
sources. Dossier source IDs are globally distinct; siblings can reuse IDs with their URLs.
Search snippets are leads, not established evidence. No authenticated provider sandbox
access is established. Source findings do not establish account-specific entitlement.

## Decisions, contradictions, and recurrence controls

- Initial hypothesis H1: current Bird Channels Email supports sufficient programmable inbound
  and outbound recovery, no Bird-owned workflow necessary. H2: legacy SparkPost relay or another
  product is required. H3: a focused alternative is materially safer. Exact inbound retrieval,
  attachments and uncertain-send behavior distinguish these hypotheses.
- Observed Git root is now `/Volumes/dev/store`; older docs claiming a parent root are stale.
  Do not edit existing implementation or reinterpret their historical evidence as current tests.
- Native reflection/FM tools were not discoverable by name; normal evidence-led reasoning is used.

## Updates

Reconnaissance and five specialist dossiers completed; independent reviewer completed afterward.
See README, current-state, architecture, validation, plan and review for the synthesized package.

### Actual delegation and tool limits

- Five specialist sessions ran at depth **one below coordinator**, with disjoint dossier ownership;
  maximum observed authorized wave was five specialists plus coordinator, not 8–12 researchers.
- B and C attempted one narrow child each; runtime rejected both with **Subagent depth limit
  reached (1)**. E/D/H used no children. No deeper level was enabled and no bypass was attempted.
- Independent reviewer followed the research wave, also depth one, and returned a read-only report.
  Coordinator transcribed its findings and dispositions in review.md.
- Native curiosity/FM tools were not discoverable; manual evidence-led decisions used. Context7
  quota and native web-search configuration failures were recorded by specialists; direct primary
  source fetches supplied evidence. REA was unnecessary: this was full-source/API-document research,
  not a shipped-artifact or inaccessible-runtime causal question.
- Source access dates vary between environment date October 15 and observed UTC host October 16;
  dossiers preserve their reported date. No document timestamp is invented as a provider update date.

### Decision-relevant evidence and resolved contradictions

- Current Bird direct regional `/v1` Email APIs establish a plausible two-way transport without
  Bird-owned CRM/workflow. B09's explicit non-atomic retry caveat overrules safe-retry shorthand;
  coordinator independently fetched it. Resend's 24-hour replay docs independently fetched too.
- Bird receiving envelope/route provenance is **conditional**, not a documented complete pass.
  Independent review I-01 changed the matrix and initial proof requirements.
- E's PGMQ proposal was adapted, not blindly adopted. Initial selected queue is one leased work
  table with explicit transitions; PGMQ layout/SQL/version checks are deferred (I-02).
- H's pricing contradiction is unresolved commercially, not averaged or blended. Optional Mailbox
  pricing does not determine direct inbound pricing. Written chosen-SKU terms are a gate.
- Observed hosted private receipt permissions are restrictive; existing security-definer advisory
  is disclosed without claiming exploitability or changing unrelated grants.

### Final curiosity pass and stop decision

Qualitative scores are local research judgments, not vendor grades:

| Thread                                               | Decision relevance / expected value / novelty / cost        | Action                                                                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Bird envelope provenance after independent challenge | High / high / high / low document correction, moderate test | Pursued; downgraded claim and added exact fixture/backfill gate                                             |
| Queue handoff consistency                            | High / high / high / low                                    | Pursued; one initial table contract, PGMQ explicitly deferred                                               |
| Repeat broad provider search                         | Medium / low / low / moderate                               | CURIOSITY_NO_GO: exact remaining gaps require entitlement/test evidence, not another overview               |
| Six-level delegation / concurrency workaround        | Low / negative / low / high                                 | CURIOSITY_NO_GO: runtime depth denial is binding; no authority to bypass                                    |
| More channels/vendors/agent frameworks               | Low / low / low / high                                      | CURIOSITY_NO_GO: no launch requirement, increases infrastructure burden                                     |
| Live send/DNS/paid pilot now                         | High / high / high / high authority cost                    | CURIOSITY_NO_GO for execution now: no approved provider access/sinks; phase 0 states required authorization |
| Full application implementation in research          | High later / negative now / low / high                      | CURIOSITY_NO_GO: outside mandate; only docs and isolated model authored                                     |

Coverage: A/G/F current-state/authority; B exact Bird; C focused fallback; D email semantics;
E execution; H operations/economics/conditional obligations; I independent challenge. Highest-risk
provider tests remain **blocked**, not passed. V01 reran 16 synthetic handler tests; V02 read-only
hosted metadata; V03 ran six in-memory model checks. No signed live flow was demonstrated.

**Stop decision:** research has reached a defensible bounded direction and executable proof plan.
Remaining uncertainties are account terms, route provenance, real fidelity/recovery and operator
load; their distinguishing observations require authorized tests/owner decisions, not speculative
architecture. Production selection remains conditional. No claim of product completion or deployment.

### Final repository verification

`pnpm format && pnpm check && pnpm smoke` exited 0 after formatting the research package.
Check: 13/13 successful (12 cached). Smoke: 3/3 successful (2 cached builds); executed HTTP check
covered seven operations-preview routes plus shared stylesheet, not storefront E2E or database
integration. Existing files outside the research directory were reported unchanged by formatting.
Research local-link check: 12 targets, none missing. Direct Deno run: 16 tests passed; isolated
model run: six checks passed. All runtime-provider tests remain unexecuted/blocked as specified.
No commit, push, deployment, DNS change, message send or hosted data mutation occurred.
