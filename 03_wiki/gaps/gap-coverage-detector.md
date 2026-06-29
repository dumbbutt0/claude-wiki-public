---
title: "Gap — coverage detector (missing module = failure)"
aliases: ["Gap — coverage detector (missing module = failure)", "gap-coverage-detector"]
type: gap
status: open
created: 2026-06-29
updated: 2026-06-29
sources: ["deep-research-ai-scaling-summary"]
source_count: 1
tags: [gap, missing, horizontal-scaling, validation, ai-engineering]
related: ["deep-research-ai-scaling", "horizontal-scaling-hypothesis", "horizontal-scaling", "[[evaluate-tool-effectiveness]]", "[[eval-driven-improvement-loop]]", "precision-ai-trainer"]
gap_kind: validation
iris_ring: outer
mode: ai-engineering
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.6
privacy_scope: public_system
graph_scope: public
provenance: ["/study --drain on deep-research-ai-scaling-study-plan (click-to-learn, 2026-06-29)"]
---

# Gap — coverage detector (missing module = failure)

> A **first-class missing-node**: the system recording what it *can't* yet do. Promoted from
> deep-research-ai-scaling-study-plan, which named this *"the first real gap to formalize."* See CLAUDE §6.

## What's missing
A **coverage check** over a horizontal / composed AI system. The AI-scaling research's headline failure mode for
horizontal architectures (compose smaller modules — retrieval + tools + agents + knowledge-graph) is blunt: *a single
missing or broken module makes the whole pipeline fail.* A monolithic (vertical) model degrades gracefully; a
composed one fails **categorically** at the weakest link. Nothing currently *detects* which module is the weak link
before it silently caps capability.

## Why it matters
This is the load-bearing risk of the horizontal-scaling-hypothesis — the bet that *this* personal AI-OS is best
built horizontally. If that bet is right, the binding question stops being "make the core smarter" and becomes
"**which module is missing or weakest right now?**" For a precision-ai-trainer that *is* the resource-allocation
decision: the marginal hour belongs to whichever module is currently the coverage gap (retrieval · tool-use · agent
orchestration · the knowledge graph itself), not to whatever is most fun to improve.

## Blocks
- The horizontal pipeline (horizontal-scaling) — its real-world reliability is **unmeasured**; any module could be
  silently degrading the whole without a signal.
- [[evaluate-tool-effectiveness]] / [[eval-driven-improvement-loop]] — an ablation-style "drop one module, measure the
  drop" harness is exactly the missing instrument; without it the eval loop can't say *where* to spend effort.

## Recommendation
- → blueprint: a **coverage-gap detector** = per-module ablation on one fixed task. Disable retrieval, then tools, then
  the agent layer, one at a time; the largest capability drop names the most load-bearing module, the smallest names
  the candidate for removal. Cheap to prototype (re-run one eval set N times with one module stubbed).
- Pair it with the AI-OS bench harness seed in deep-research-ai-scaling-study-plan so the same fixture answers
  both "are we better than a bare LLM?" and "which module earns its place?"

## Status
`open` — prototype is a single ablation loop over one eval set; closes into a capability once it runs and logs an outcome.
