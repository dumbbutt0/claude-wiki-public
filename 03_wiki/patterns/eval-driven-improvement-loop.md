---
title: Eval-Driven Improvement Loop
aliases: ["Eval-Driven Improvement Loop", "eval-driven-improvement-loop"]
type: pattern
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [security-research, evaluation, methodology, pattern]
related: ["ground-truth-metrics", "outcome-learning-loop", "false-positive-control", "full-pipeline-run-discipline", "[[evaluate-tool-effectiveness]]", "[[reject-first-precision]]", "[[source-answer-key-eval]]"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-16-audit-watch-eval-loop (methodology abstraction)"]
---

# Eval-Driven Improvement Loop

A repeatable loop for **raising recall while protecting precision** by learning from *completed* work with a known
answer key — without overfitting to it. The shape generalizes to any detection/judgement system that has an eval
harness + a regression suite.

## The loop
1. **Source one completed, answer-keyed unit** — public source + public final findings, small enough for one run,
   2–10 confirmed findings, distinct bug class from prior evals ([[source-answer-key-eval]]).
2. **Add it as an eval fixture** (source snapshot · answer key · expected affected functions · expected bug classes ·
   expected exploit shape). *Do not change detector logic yet.*
3. **Run baseline + a miss table:** `finding_id | expected root cause | first-missed stage | why missed | likely
   reusable logic`. Attribute each miss to a stage (coverage / candidate-gen / lensing / severity / exploitability /
   evidence / packaging).
4. **Add the smallest *generalizable* logic** per miss (a new invariant picker, defense-map rule, admission rule,
   cross-function linkage, harness template, severity guard, FP-suppression rule…).
5. **Re-run targeted** — every expected finding detected *or* explicitly `human_pending` with a reason; no new false
   `READY`; every hit has a reportable candidate with self-contained evidence.
6. **100% gate** — 100% of expected findings hit (or documented human-pending), 0 false-READY, no regression, the
   change is wired into the **normal workflow** (not just the eval script — see full-pipeline-run-discipline).
7. **Regression** — revert/narrow anything that lowers precision; rerun until clean.
8. **Phase summary + rotate** (e.g. language: Move → Rust → Solidity → …), smallest/cleanest audits first.

## Hard rules (what keeps it honest)
- **No answer-key matching · no audit-specific allowlists · no hardcoded function names** in logic (only in eval metadata).
- **No fake positives to reach 100%**; if a finding can't be proven, **mark it human-pending**, don't force it.
- **Precision is protected** — new logic must pass existing regression (false-positive-control).
- **Smallest generalizable change** — improve the *workflow*, not this one audit.

This is the supervised half of outcome-learning-loop + ground-truth-metrics (a Recall Lab with answer keys),
governed by [[reject-first-precision]]. Measure effectiveness with [[evaluate-tool-effectiveness]]; the per-fixture
procedure is [[source-answer-key-eval]].
