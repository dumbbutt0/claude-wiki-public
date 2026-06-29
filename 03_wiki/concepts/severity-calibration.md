---
title: Severity Calibration
aliases: ["Severity Calibration", "severity-calibration"]
type: concept
status: active
created: 2026-06-28
updated: 2026-06-28
review_due: 2026-06-28
interval: 0
ease: 2.5
review_attempts: 0
sources: []
source_count: 0
tags: [concept, audit, severity, triage]
related: ["triage-readiness", "ice-scoring", "poc-validation", "novelty-originality-gate"]
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

# Severity Calibration

Generalized discipline for assigning a **defensible** severity to a smart-contract finding — distilled from repeated
submission-readiness reviews (all target/exploit specifics stripped per autonomy-policy).

## Principles
- **Severity follows the proven impact path, not the code smell.** A bug class is only as severe as the
  *attacker-reachable* consequence you can demonstrate (ice-scoring: root → state → consumer → action → impact).
- **High requires attacker-reachability + concrete loss.** If the vulnerable state is only reachable via admin/
  deploy misconfiguration, it is typically **Medium (design / fail-open)** or hardening — not High.
- **Don't put uncertainty in the severity field.** State one severity; keep "could be higher if…" in a scope caveat.
  A hedged severity field reads as low confidence.
- **Prove the user path, not the owner path.** A PoC that creates the condition via an owner/admin call proves less
  than one routed through the normal user / relayer entry path.
- **Negative control.** Show the same action *reverts* when the guard is present — that isolates the bug as the cause.

Pairs with triage-readiness · poc-validation · full-pipeline-run-discipline · [[report-defensibility-review]].
