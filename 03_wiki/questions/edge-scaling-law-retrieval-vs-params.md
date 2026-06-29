---
title: For a local/edge model, does the binding scaling law shift from params×data to retrieval×context?
aliases: ["For a local/edge model, does the binding scaling law shift from params×data to retrieval×context?", "edge-scaling-law-retrieval-vs-params"]
type: question
status: active
created: 2026-06-29
updated: 2026-06-29
sources: ["deep-research-ai-scaling-summary"]
source_count: 1
tags: [question, scaling-laws, retrieval, edge, ai-engineering]
related: ["deep-research-ai-scaling", "deep-research-ai-scaling-study-plan", "scaling-laws", "horizontal-scaling", "vertical-scaling", "retrieval-augmented-generation", "precision-ai-trainer"]
iris_ring: pupil
mode: ai-engineering
steward: auto
autonomy_tier: 1
claim_class: tentative
confidence: 0.5
privacy_scope: public_system
graph_scope: public
provenance: ["/study --drain on deep-research-ai-scaling-study-plan (click-to-learn, 2026-06-29)"]
---

# Q: For a local/edge model, does the binding scaling law shift from params×data to retrieval×context?

Chinchilla's compute-optimal frontier (scale **parameters and training tokens together**) is a *training-time* law:
it answers "given this much training compute, how big a model and how much data?" But for a **local model running on
the edge** the scarce resource is not training compute — the owner isn't pre-training anything. The binding
constraint is **inference**: how much can be retrieved and stuffed into a finite context window per query, on
consumer hardware. So the relevant frontier may not be `params × tokens` at all but **`retrieval-corpus size ×
effective context window`** — capability bought by *what you can put in front of a fixed small model*, not by growing
the model.

## What would deepen this
- **State it as a measurable curve.** Hold the local model fixed; vary (a) retrieval-corpus size and (b) usable
  context length; measure task accuracy. Is there a Chinchilla-style compute-optimal *ratio* between corpus and
  context — e.g. is it wasteful to index 10× more documents if the window can only surface k of them?
- **Find where it breaks.** Long-context degradation ("lost in the middle") and retrieval precision are the obvious
  ceilings. The interesting number is the **point of diminishing returns**: the corpus×context budget past which a
  bigger local model would have been the cheaper capability.
- **Connect to the architecture bet.** This is the quantitative core of the horizontal-scaling-hypothesis: if
  capability really does scale with retrieval×context on a fixed core, horizontal beats vertical *for this use case*.

## Why it matters
For a precision-ai-trainer this decides where the marginal hour goes: **curate/expand the corpus and improve
retrieval** (horizontal) vs **run a bigger local core** (vertical). The AI-scaling report says *integrate both* — but
a real curve would say *which one, now, on this hardware.* `tentative` until measured — this is a hypothesis to test,
not a result.

→ feeds deep-research-ai-scaling-study-plan (the AI-OS bench harness is where this curve would get measured).
