---
title: Conversion Learning
aliases: ["Conversion Learning", "conversion-learning", "runtime-confirmed is not reportable"]
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
tags: [ai-learning, security-research, evaluation, methodology]
related: ["poc-validation", "[[severity-calibration]]", "triage-readiness", "outcome-learning-loop", "no-trust-validation", "[[adversarial-reasoning]]", "[[reject-first-precision]]", "[[structured-adversarial-evidence-learning]]"]
iris_ring: inner
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-04-tool-effectiveness-evaluation (claim-level: methodology only; target specifics → restricted)"]
---

# Conversion Learning

**The core distinction:** a candidate finding being *suspicious* is not enough; being *runtime-confirmed* is not
enough. A candidate must **convert** through a chain — and a learning system should model the whole chain, not just
the first link:

```
lead → suspicious surface → mechanism hypothesis → source-grounded evidence
→ runtime proof → reachability proof → severity proof → novelty check → reportability → outcome
```

> **Runtime-confirmed ≠ reportable.** `reportable = mechanism exists + attacker reachability + severity + novelty + in-scope.`

This reframes a bug-finding pipeline as a **conversion-learning engine**: it learns *which signals actually convert
into valid, severity-bearing, non-duplicate reports* — not merely whether a mechanism can be proven. That second
question is far more valuable (it directly extends outcome-learning-loop and ground-truth-metrics).

## The four field layers (what to label per candidate)
1. **Discovery** — where the lead came from (detector/lens/prompt origin, architecture class, surface type, what
   promoted it, what rejected its neighbors). Teaches *which lead-generators are useful*.
2. **Proof** — whether the mechanism is real (runtime status, harness cost, real-contract-used, corrected reference,
   control case, state/economic delta). Teaches *what can be verified cheaply + cleanly* — see poc-validation.
3. **Exploitability** — whether a real attacker can use it (entrypoint, caller permissions, attacker-controlled vs
   user-influenced vs trusted-role-only fields, signed-vs-executed fields, replay, reachability verdict). Stops the
   system treating every mechanism as a finding.
4. **Conversion** — whether it becomes a good report (severity, impact type, duplicate/known status, report quality,
   `submission_ready`, `conversion_outcome`, `primary_blocker`). This is the actual learning layer; see
   [[severity-calibration]] + triage-readiness.

## The gold field: `primary_blocker` (the non-conversion reason)
For every failed or paused candidate, force **one** primary blocker: `runtime_refuted · unreachable · privileged_only
· severity_too_low · duplicate · out_of_scope · insufficient_evidence · business_logic_unclear ·
requires_unreasonable_assumption · harness_artifact_only · wrong_mechanism · wrong_impact · known_design_choice`.

> **A high-quality negative label is worth more than a vague positive.** Blockers teach the system *what not to promote*.

## Why it matters
Optimizing only for `runtime_confirmed` trains the system to **over-promote** (a noisy scanner). Rewarding **correct
stopping** — a real mechanism that is *not* reportable because no attacker-reachable path exists — is what separates a
useful autonomous security engine from a scanner. This is the precision discipline of [[reject-first-precision]] and
the constraint-solving of [[adversarial-reasoning]]; the transferable form is [[structured-adversarial-evidence-learning]].
