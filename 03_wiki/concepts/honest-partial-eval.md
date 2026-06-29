---
title: Honest Partial Evaluation
aliases: ["Honest Partial Evaluation", "honest-partial-eval", "NOT RUN discipline"]
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
tags: [evaluation, rigor, methodology]
related: ["[[eval-driven-improvement-loop]]", "ground-truth-metrics", "[[conversion-learning]]", "[[reject-first-precision]]", "[[evaluate-tool-effectiveness]]", "specialist-agents"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-02-a-b-c-promotion-strategy (methodology abstraction; internal lead/phase names stripped)"]
---

# Honest Partial Evaluation

When a careful eval is too expensive to finish in one pass, **rigour beats coverage.** A rushed full set produces
*noisy fake coverage*; a careful partial set with honest accounting produces a real signal.

## The NOT-RUN rule
Complete a meaningful minimum carefully (e.g. ≥6 with an isolated adversarial check each), then for everything else:
mark it **`NOT RUN`** — *not failed, not abstained, not silently omitted* — and **exclude it from denominator
metrics**. State it plainly: *"Completed N fully-investigated items; remaining were not run due to cost and are
excluded from denominators. No conclusions are drawn from unrun items."*

## Separate the questions you are testing
Don't let one eval answer two questions at once and contaminate both. Keep distinct:
- **Discovery / ranking quality** — can blind ranking surface the right items? (report capture rates as their own metric)
- **Conversion quality** — once the *right* surface is selected, does the system produce correct mechanism + impact?
  (see [[conversion-learning]])

Report ranking capture **separately** from conversion scoring; never use the ranking score as the conversion-set
selector.

## Disclose the selection bias
Always label selection as **key-informed (disclosed)** vs **key-blind**. A key-informed set tests *"can it convert
when pointed at the right surface,"* not *"can it discover"* — a valid test, but only if disclosed. Selection priority:
highest-value leads first · include at least one **low-blind-score** awarded lead (tests whether the informed set
rescues important misses) · include **controls** · avoid cherry-picking easy wins.

## Denominator discipline
Keep set sizes internally consistent (don't quote "9 leads" while investigating 7-covering-9). An expensive eval is
only worth it if its numbers are defensible — the rigour half of [[eval-driven-improvement-loop]] +
ground-truth-metrics, guarded by [[reject-first-precision]]. Pair with an **isolated adversarial check per
promotion** (specialist-agents) so careful judgement isn't contaminated across items.
