---
title: The Evidence-Learning Canon
aliases: ["The Evidence-Learning Canon", "evidence-learning-canon", "methodology canon", "the canon"]
type: synthesis
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [synthesis, ai-learning, methodology, canon, capstone]
related: ["[[structured-adversarial-evidence-learning]]", "[[conversion-learning]]", "[[adversarial-reasoning]]", "[[reject-first-precision]]", "[[determinism-at-the-authority-boundary]]", "[[orchestration-governor]]", "[[open-ideas-not-edge]]", "personal-operating-system", "precision-ai-trainer", "skill-tree"]
iris_ring: pupil
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["synthesis of the methodology corpus distilled from the ChatGPT archive (/loop iterations 1–5)"]
---

# The Evidence-Learning Canon

The ChatGPT archive, deep-mined, is **not a pile of audit tips.** It is one coherent method — a way to turn attempts
into a compounding, calibrated body of judgement that **ports across domains.** This page is the capstone: it organizes
the ~25 methodology nodes under their spine, [[structured-adversarial-evidence-learning]].

## The spine
```
candidate → hypothesis → evidence → controlled test → real-world reachability → impact → conversion outcome
```
Six transferable moves: **generate hypotheses · attack your own hypotheses · require controls · label failure modes ·
separate proof from usefulness · learn from non-conversion.** Everything below is one of those moves, made concrete.

## The corpus, organized by the method

**1 · Reason adversarially (generate + attack).** [[adversarial-reasoning]] (constraint-solving — attack *and*
falsify); [[corrected-reference-lens]] (flag only the delta vs a real in-repo reference); [[precedent-guided-source-anchored]]
(past evals pick the lens, current code earns the lift); [[invariant-families-over-categories]] (organize hypotheses by
transferable mechanism families, not surface categories).

**2 · Prove, and separate proof from usefulness.** [[conversion-learning]] is the heart — *runtime-confirmed ≠
reportable*; model the whole chain (discovery → proof → exploitability → conversion), and treat the **`primary_blocker`**
(the non-conversion reason) as the gold label. Operationalized by [[conversion-labeling]] and grounded by
poc-validation.

**3 · Reject first (reward correct stopping).** [[reject-first-precision]] (separation of responsibilities · frozen
baselines · stop conditions) and its runnable gate [[reject-first-gating]]; upstream of false-positive-control,
[[severity-calibration]], triage-readiness, novelty-originality-gate.

**4 · Make authority deterministic (architecture).** [[determinism-at-the-authority-boundary]] — *retrieval may
suggest, hooks must verify.* Instantiated by [[three-layer-zero-trust-audit]] (layered, mutually-distrusting defense),
[[safe-post-run-sync]] (guarded state mutation), and governed by an [[orchestration-governor]] (*govern, don't analyze*)
over specialist-agents behind a validation-gate-pattern + human-in-the-loop-review.

**5 · Learn from outcomes (calibrate + evolve).** outcome-learning-loop + ground-truth-metrics; the supervised
[[eval-driven-improvement-loop]] fed by [[source-answer-key-eval]], kept honest by [[honest-partial-eval]], and measured
by [[evaluate-tool-effectiveness]] + [[codebase-self-evaluation]]. The wiki itself learns this way — the `skills/`
layer + [[deep-mine-conversation]] are *dynamic skill evolution*.

**6 · Govern disclosure (what leaves the machine).** [[open-ideas-not-edge]] — publish the methodology, keep the alpha
— is the principle; the dual-scope graph + [[operator-and-hermes]] (local learn-loop, cloud deferred) are it enforced.
**This very page is Layer-1 disclosure; the edge stays in `restricted/`.**

## Why it's one body, not 25 fragments
Each node is a different facet of the same discipline: *let intelligence roam upstream; make authority deterministic;
reward correct stopping; learn most from what did **not** convert.* That is the compounding artifact Karpathy's
LLM-wiki promises — the cross-references are already here.

## The transfer (why it outlives security)
The skeleton is domain-blind: **medicine** (symptom → diagnosis → test → differential → confirmed/ruled-out),
**finance** (anomaly → hypothesis → backtest → live constraints → risk-adjusted return), **law**, **science**. The
durable asset is not "smart-contract auditing" — it is the **precision-ai-trainer** craft: building learning
pressure (labels · gates · controls · stop conditions) into a system. That is the thesis of the
personal-operating-system and the root of the skill-tree.

> Start here, then follow the spine: [[structured-adversarial-evidence-learning]] → [[conversion-learning]] →
> [[reject-first-precision]] → [[determinism-at-the-authority-boundary]].
