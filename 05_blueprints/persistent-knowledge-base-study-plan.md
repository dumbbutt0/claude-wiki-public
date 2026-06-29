---
title: Persistent Knowledge Base — study plan
aliases: ["Persistent Knowledge Base — study plan", "persistent-knowledge-base-study-plan"]
type: blueprint
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [blueprint, study-plan, knowledge-management]
related: ["persistent-knowledge-base", "karpathy-llm-wiki", "ingest-query-lint-loop", "inference-aware-scaling", "horizontal-scaling-hypothesis"]
iris_ring: outer
mode: meta
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.6
privacy_scope: public_system
graph_scope: public
provenance: ["/study on persistent-knowledge-base (click-to-learn, 2026-06-28)"]
---

# Persistent Knowledge Base — study plan  *(grown from your click)*

You clicked **persistent-knowledge-base**.

## Open questions
1. **When does a compiled KB beat RAG, quantitatively?** At what query-reuse count does the upfront ingest cost pay off?
2. **How do you keep it from rotting** (stale claims) as the graph grows — lint cadence vs graph size?
3. **Could the KB be the retrieval store for a small local model** (KB → context → cheap inference)? — ties to
   inference-aware-scaling + the horizontal-scaling-hypothesis.

## Study directions
- Place the LLM-wiki pattern against **RAG / GraphRAG / memory-augmented agents** — where does it sit, what does it win?
- Re-read karpathy-llm-wiki + the ingest-query-lint-loop discipline.

## Project seed
Wire the persistent KB as the **context source for a small local model** — the horizontal-scaling-hypothesis made real.
