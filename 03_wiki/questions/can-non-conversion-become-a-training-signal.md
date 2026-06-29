---
title: Can non-conversion (the primary_blocker label) become a model training signal?
aliases: ["Can non-conversion (the primary_blocker label) become a model training signal?", "can-non-conversion-become-a-training-signal"]
type: question
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [question, methodology, ai-learning, evals, labels]
related: ["[[evidence-learning-canon]]", "[[conversion-learning]]", "outcome-learning-loop", "ground-truth-metrics", "[[reject-first-precision]]"]
iris_ring: pupil
mode: ai-engineering
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.55
privacy_scope: public_system
graph_scope: public
provenance: ["/study --drain on [[evidence-learning-canon]] (self-triggered north-star gap, 2026-06-28)"]
---

# Q: Can non-conversion become a model training signal?

The canon's sharpest move is *learn from non-conversion* — [[conversion-learning]] treats the **`primary_blocker`**
(the precise reason a candidate did *not* convert) as the gold label, more valuable than a vague positive. Today that
label trains **a human's judgement.** Could it train **a model** directly?

## What would deepen this
- **Map `primary_blocker` to known ML practice.** Negatives that are *almost* positives are exactly what hard-negative
  mining / contrastive learning / preference data exploit. Is the canon's gold negative the same object under a
  different name? (Web-research candidate — *do not assume; verify against sources before writing a concept page.*)
- **Design the label schema.** What fields make a non-conversion machine-usable: blocker class, the controlled test
  that settled it ([[reject-first-precision]]), the delta from the nearest conversion?
- **Close the loop.** Could outcome-learning-loop + ground-truth-metrics feed a re-ranker or a gate that is
  *retrained* on accumulated blockers, not just hand-tuned?

## Why it matters
If yes, the methodology stops being only a discipline for the operator and becomes a **dataset** — the bridge from
"good auditor" to precision-ai-trainer. This is the single highest-leverage way the canon could compound.

→ feeds [[evidence-learning-canon-study-plan]].
