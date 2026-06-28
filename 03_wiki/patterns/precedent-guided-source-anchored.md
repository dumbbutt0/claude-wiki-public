---
title: Precedent-Guided, Source-Anchored Retrieval
aliases: ["Precedent-Guided, Source-Anchored Retrieval", "precedent-guided-source-anchored", "lens router"]
type: pattern
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [security-research, retrieval, learning, methodology, pattern]
related: ["[[corrected-reference-lens]]", "[[eval-driven-improvement-loop]]", "outcome-learning-loop", "novelty-originality-gate", "[[determinism-at-the-authority-boundary]]", "[[reject-first-precision]]"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.78
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-09-corrected-reference-lens-method (methodology abstraction)"]
---

# Precedent-Guided, Source-Anchored Retrieval

How to **learn from past wins** to widen recall *without* letting "this resembles an old bug" become an enforcement
path. Past experience recognises classes you have no local sibling for ([[corrected-reference-lens]] can't); the trick
is to use precedent only to **route**, never to **prove**.

> **Past evals supply priors, not proof. Current code supplies proof, or nothing lifts.**

## The mechanism
1. Build a **precedent index** from the awarded corpus, keyed on **structural fingerprints** (from validated detector
   families), **not free text**. Each entry: mechanism family · the source-backed primitive that made it real ·
   root-cause template · exploit/impact preconditions · known FP/refutation conditions · the detector family that held 0 FP.
2. For a candidate, retrieve top-k precedents by structural fingerprint. The index only answers: **which lens to run,
   and what concrete primitive to look for** — it does **not** decide the candidate is a bug.
3. **Lift only when all hold:** (a) a structurally similar precedent matches · (b) the **same source primitive** is
   present in *this* code · (c) impact preconditions present · (d) the precedent's FP/refutation rules don't fire ·
   (e) detector family validated 0-FP **or** output stays advisory · (f) cap at MEDIUM until trace/human confirms.

## The one rule that protects precision
**Forbidden:** `precedent match → lift`. **Safe:** `precedent match → choose lens → prove the primitive in current
code → run refutations → advisory or capped lift`. Similarity is a **routing score, never an evidence score**.
- Similarity → recall · current-code primitive → precision · refutation branch → FP · human promotion → enforcement.
- Weak/fuzzy matches route to **human review** (novelty-originality-gate); auto-derived patterns stay advisory and
  enter the lift path only via human promotion after metrics show FP held (closed-loop calibration, cross-audit
  negative memory pre-suppresses any pattern that produced an FP elsewhere).

This is the recall-expanding companion to the supervised [[eval-driven-improvement-loop]] and the calibrated
outcome-learning-loop — all of it sitting behind the hard line of [[determinism-at-the-authority-boundary]].
