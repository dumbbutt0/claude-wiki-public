---
title: Report Defensibility Review
aliases: ["Report Defensibility Review", "report-defensibility-review"]
type: capability
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [capability, audit, reporting, triage]
related: ["validate-finding", "parse-report", "novelty-originality-gate", "[[severity-calibration]]"]
iris_ring: middle
mode: audit
steward: auto
autonomy_tier: 1
claim_class: factual
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["chatgpt-export 2026-06 — audit submission reviews (specifics stripped)"]
---

# Report Defensibility Review

A reusable capability: before submitting a finding, review the report for the **dismissal angles** a program could
use to reject it, and close each one. Generalized from repeated submission reviews (no target/exploit specifics).

## Evidence checklist (before submission)
- **Attacker-reachable PoC** through the real user/relay path — not an owner/admin shortcut.
- **Negative control** proving the same action is rejected when the guard is present.
- **No overclaim** — claim only what the PoC proves (e.g. position-opening ≠ withdrawal/theft unless shown).
- **Reachability stated honestly** — if the bad state needs a deploy/upgrade window, say so; don't assert
  "permissionless" unless proven.
- **Defensible severity** ([[severity-calibration]]) — one value, caveats separate.
- **Output matches the claim** — captured logs/timestamps are internally consistent (reviewers notice mismatches).
- **Scope caveat** — name the condition under which it is in / out of scope.

Feeds validate-finding → parse-report; complements novelty-originality-gate.
