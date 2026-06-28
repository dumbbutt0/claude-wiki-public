---
title: Reject-First Precision
aliases: ["Reject-First Precision", "reject-first-precision", "reject-unless-proven"]
type: pattern
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [security-research, methodology, precision, pattern]
related: ["validation-gate-pattern", "false-positive-control", "poc-validation", "human-in-the-loop-review", "[[conversion-learning]]", "[[adversarial-reasoning]]"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-04-tool-effectiveness-evaluation (methodology abstraction)"]
---

# Reject-First Precision

A high-recall system says *"this looks dangerous."* A precision system **rejects unless proven** and rewards
**correct stopping**. The pattern that converts a noisy scanner into a trustworthy engine has four parts.

## 1. Separation of responsibilities
Never let one component find, judge severity, write the report, *and* imply submission. Split the work so each stage
can reject:
```
detector  : find a suspicious surface
gate      : reject obvious false positives        (see validation-gate-pattern)
defense map: identify protections already present
invariant : test whether expected behaviour is violated
runtime   : prove or refute the mechanism          (see poc-validation)
human gate: decide reportability                   (see human-in-the-loop-review)
submission gate: prevent unsafe promotion
```

## 2. Frozen baselines (experimental discipline)
Learning requires stable measurement. If you change prompt, detector, harness, and target at once, you cannot
attribute the result. Freeze variables — *prompt unchanged · corpus unchanged · production source unchanged · harness
isolated · routing disabled · submission disabled* — then change **one** thing and record the effect.

## 3. Stop conditions (when to reject)
A precision system must know when to stop: *only a privileged role can trigger it · the runtime delta disappears in
the corrected path · a public caller binds the data · the issue is only theoretical · no severity-bearing impact
exists.* Hitting any one ends the candidate with a `primary_blocker` (see [[conversion-learning]]).

## 4. Controls prevent fake proof
Every proof needs a comparand: a **matched non-bug control**, a **corrected reference** (one-fix version that changes
the result), and a negative reachability review. Without controls, a passing test proves nothing.

## Why
The hardest skill in training an autonomous engine is teaching it to **reject**, not just to find. Reject-first
precision is the operational form of [[adversarial-reasoning]] (attack *and* falsify) and the upstream half of
false-positive-control. A failed eval is not wasted — it is a label for what the system does not yet understand.
