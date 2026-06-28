---
title: "Agent autonomy levels (glossary)"
aliases: ["Agent autonomy levels", "agent guardrails", "tiered agent permissions", "agent-autonomy-levels"]
type: glossary
field: ai-engineering
status: active
created: 2026-06-28
updated: 2026-06-28
sources:
  - "https://galileo.ai/blog/ai-agent-guardrails-framework"
  - "https://www.leanware.co/insights/agentic-ai-guardrails-how-to-build-safe-and-scalable-autonomous-systems"
  - "https://www.hcltech.com/trends-and-insights/guardrails-autonomous-ai-governance-agentic-world"
source_count: 3
tags: [glossary, ai-engineering, agents, safety, autonomy]
related: ["autonomy-policy", "[[determinism-at-the-authority-boundary]]", "human-in-the-loop-review", "[[loop-stop-conditions]]"]
iris_ring: outer
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: factual
confidence: 0.85
privacy_scope: public_system
graph_scope: public
provenance: ["/study web research (click-to-learn, 2026-06-28) on autonomy-policy"]
---

# Agent autonomy levels  *(glossary · web-researched)*

**One line:** graduated levels of *how much an agent acts without human approval*, paired with **risk-tiering** so the
blast radius of a wrong action is bounded. The industry framing behind this wiki's own autonomy-policy (Tier 0–3).

## The two axes
**Autonomy level** (SAE-style, enterprise-adapted):
- **L0–L1** — suggest only; human reviews everything.
- **L2** — partial: agent executes specific tasks with explicit approval before acting.
- **L3–L4** — bounded autonomy: agent acts independently *within defined thresholds*, **auto-escalating** when limits
  are hit.

**Risk tier** (by action consequence):
- **Tier 1** — information retrieval → automated monitoring.
- **Tier 2** — reversible actions → real-time guardrails + logging/sampling.
- **Tier 3** — financial / irreversible / external comms → **human-in-the-loop for every decision**.

## Design rules that matter
- **Least privilege + progressive autonomy:** start with narrow scoped permissions; expand *deliberately* as the agent
  proves reliable (≈95%+ correct on a few hundred sampled actions before removing a gate).
- **Avoid alert fatigue:** a system firing 500 approvals/day is *worse* than none — it turns the human into a rubber
  stamp. Gate the risky few, auto-flow the routine many.

## How to apply
- This is external validation of autonomy-policy: this wiki auto-runs Tier 0–2 (safe), quarantines Tier 3 (risky) —
  the consequential write stays behind a deterministic gate ([[determinism-at-the-authority-boundary]],
  human-in-the-loop-review). The agent-loop form is [[loop-stop-conditions]] (control lives in the stop rule).

## Sources
[Galileo — guardrails framework](https://galileo.ai/blog/ai-agent-guardrails-framework) ·
[Leanware — safe autonomous systems](https://www.leanware.co/insights/agentic-ai-guardrails-how-to-build-safe-and-scalable-autonomous-systems) ·
[HCLTech — governance in an agentic world](https://www.hcltech.com/trends-and-insights/guardrails-autonomous-ai-governance-agentic-world)
