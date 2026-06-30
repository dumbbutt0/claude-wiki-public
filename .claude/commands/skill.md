---
description: Distill a reusable procedure into 03_wiki/skills/ — the wiki's learn-as-we-go layer
argument-hint: [skill-name | from-outcome [[page]] | from-conversation <path>]
---

# /skill — capture a learned, reusable procedure

The **learn-as-we-go** loop (the good idea from agent frameworks like Hermes, realized **locally** — no cloud, no
context leaving the machine). Turns repeated work into a reusable `type: skill` page in `03_wiki/skills/`.

**A skill page is a PROCEDURE, not a fact.** It always has: **When to use · Procedure (numbered steps) · Inputs /
Outputs · Learned-from**. Generalize — strip sensitive/identity specifics (route those per [[autonomy-policy]]:
specifics → `restricted/`, personal → `local/`, methodology → `public_system`).

## Behaviour
1. **Source the skill** from one of: an explicit name; a `/record-outcome` result; a deep-mined conversation
   ([[deep-mine-conversation]]); or a procedure you just executed ≥2 times the same way.
2. **Auto-propose, don't force:** only mint a skill when a procedure has recurred (≥2 similar outcomes/conversations)
   or is clearly reusable. Tier 1–2 self-approve; uncertain → `tentative`.
3. **Write** `03_wiki/skills/<kebab>.md` with the four sections + `aliases` + `tags:[skill, …, learned]` +
   `steward/autonomy_tier/claim_class/confidence/provenance` + `privacy_scope`/`graph_scope`.
4. **Link generously** into the concepts/patterns/capabilities the skill operationalizes, and back from them.
5. Update `index.md` (Skills section), append `log.md` + a [[steward-ledger]] entry, regenerate the graph.

## When the steward runs it
`/steward-pending` and `/record-outcome` should **propose a skill** whenever they see the same procedure converge
across ≥2 sources — that is the wiki teaching itself a faster path, the same compounding the rest of the system has.

Seeded skills: [[conversion-labeling]] · [[reject-first-gating]] · [[deep-mine-conversation]]. See [[CLAUDE]] §19.
