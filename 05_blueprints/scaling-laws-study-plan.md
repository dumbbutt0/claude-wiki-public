---
title: Scaling Laws — study plan
aliases: ["Scaling Laws — study plan", "scaling-laws-study-plan"]
type: blueprint
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [blueprint, study-plan, ai-scaling]
related: ["scaling-laws", "[[inference-aware-scaling]]", "horizontal-scaling-hypothesis", "persistent-knowledge-base", "vertical-scaling"]
iris_ring: outer
mode: ai-engineering
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.6
privacy_scope: public_system
graph_scope: public
provenance: ["/study on scaling-laws (click-to-learn, 2026-06-28)"]
---

# Scaling Laws — study plan  *(grown from your click)*

You clicked **scaling-laws** to go deeper. New ground was just added: **[[inference-aware-scaling]]** (Beyond-Chinchilla).

## Open questions to resolve
1. For *your* stack (small models run constantly + a persistent-knowledge-base), does inference-aware scaling argue
   for **small-model + more-data + retrieval** over a bigger model? (Likely yes — the horizontal-scaling-hypothesis.)
2. What **tokens/param** target fits a model you'd self-host? (Chinchilla 20:1 vs Llama-3 ~1,875:1.)
3. Can **inference-time scaling** (longer reasoning at answer time) substitute for model size on your tasks (audit
   reasoning, study synthesis)?

## Study directions
- Read **Beyond Chinchilla** (arxiv 2401.00448) + the 2025 architecture-aware survey (arxiv 2502.12051).
- Map the cost curve: *train-once* vs *serve-forever* for a personal model.
- Connect vertical-scaling (the curve) ↔ horizontal-scaling (the route around it).

## Project seed
Estimate a small open model's lifetime serve-cost vs a larger one for your daily use → pick a self-host target. Feeds
business-ideas + [[decentralized-ai-training]].
