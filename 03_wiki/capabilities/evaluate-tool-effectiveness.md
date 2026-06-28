---
title: Evaluate Tool Effectiveness
aliases: ["Evaluate Tool Effectiveness", "evaluate-tool-effectiveness", "tool effectiveness evaluation"]
type: capability
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [security-research, evaluation, capability]
related: ["ground-truth-metrics", "no-trust-validation", "outcome-learning-loop", "poc-validation", "[[conversion-learning]]", "novelty-originality-gate"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-04-tool-effectiveness-evaluation (methodology abstraction)"]
---

# Evaluate Tool Effectiveness

**What it does:** measures whether a security-research tool is actually *effective* — not just whether it can solve a
puzzle — by scoring it as a **calibration layer**, never as proof of readiness.

**Inputs:** an evaluation target (CTF machine/challenge, a past contest with known findings, a blind/sealed repo, a
negative control) + the tool's blind output.

**Outputs:** a calibrated effectiveness read (recall / precision / exploit-confirmation / report quality) + a decision
to promote the target into the eval dashboard as a **fixture** (not as a bounty-readiness claim).

## The score (run blind, then ask)
1. Did it identify the correct vulnerable surface?
2. Did it explain the actual **root cause**, not just a suspicious pattern?
3. Did it produce a working exploit path or PoC? (see poc-validation)
4. Did it **avoid over-reporting** unrelated suspicious code? (the precision half — false-positive-control)
5. Did it write a clean, human-reviewable report?

## Eval value is tiered — no single target proves readiness
- A focused challenge tests *isolated contract reasoning* (high value as a unit test).
- A full machine tests *end-to-end investigation* (off-chain ↔ on-chain chaining) but is weak for detector
  recall/precision.
- **Neither is sufficient** as proof a bounty engine is effective.

For real effectiveness, pair calibration targets with: past Code4rena/Sherlock/CodeHawks contests with known
findings, **blind repos with sealed award lists**, your own **negative controls**, real-contract Foundry PoCs,
duplicate/public-known checks (novelty-originality-gate), and submission-readiness gates (triage-readiness).

**Used by:** Audit-Watch eval/calibration loop · feeds ground-truth-metrics + outcome-learning-loop.
**Boundary:** promote passing targets as **training/eval fixtures**, never as evidence of bounty readiness.
