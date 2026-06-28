---
title: Reject-First Gating
aliases: ["Reject-First Gating", "reject-first-gating"]
type: skill
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [skill, security-research, precision, learned]
related: ["[[reject-first-precision]]", "[[conversion-labeling]]", "poc-validation", "false-positive-control", "[[adversarial-reasoning]]"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-04-tool-effectiveness-evaluation"]
---

# Reject-First Gating  ·  *skill*

**When to use:** before promoting any candidate toward "reportable" — run the gate to try to **kill it first**.

**Procedure — ask each gate; any single failure stops the candidate:**
1. Is the function **externally reachable** (not only a privileged role)?
2. Is the suspicious input **independently attacker-controlled** (vs derived/re-bound by the real caller)?
3. Is the **signed subject the executed subject** (no mismatch the caller silently fixes)?
4. Does the **batch path match the single path** (no sibling drift), or is the divergence the real bug?
5. Does a **corrected reference** change the result (a clean delta), and does a **matched control** behave correctly?
6. Does it cause **value movement / severity-bearing impact**, or only accounting noise?
7. Is it **novel + in-scope** (not duplicate/public-known)?

**Stop conditions (reject + label a `blocker`):** only a privileged role can trigger it · the runtime delta
disappears in the corrected path · a public caller binds the data · the issue is only theoretical · no
severity-bearing impact. Then run [[conversion-labeling]].

**Inputs:** a candidate + source evidence. **Outputs:** pass-to-human, or a rejection with one `primary_blocker`.
**Learned-from:** the precision discipline of [[reject-first-precision]]; reward correct stopping, not just finding.
Operational kin of false-positive-control and poc-validation.
