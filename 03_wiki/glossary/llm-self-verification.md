---
title: "LLM self-verification (glossary)"
aliases: ["LLM self-verification", "self-critique", "self-correction", "adversarial self-play critic", "llm-self-verification"]
type: glossary
field: ai-engineering
status: active
created: 2026-06-28
updated: 2026-06-28
sources:
  - "https://www.emergentmind.com/topics/self-verification-based-llms"
  - "https://arxiv.org/pdf/2504.19162"
  - "https://arxiv.org/pdf/2402.08115"
source_count: 3
tags: [glossary, ai-engineering, reasoning, verification]
related: ["[[structured-adversarial-evidence-learning]]", "[[adversarial-reasoning]]", "[[reject-first-precision]]", "[[corrected-reference-lens]]", "[[honest-partial-eval]]"]
iris_ring: outer
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: factual
confidence: 0.85
privacy_scope: public_system
graph_scope: public
provenance: ["/study web research (click-to-learn, 2026-06-28) on [[structured-adversarial-evidence-learning]]"]
---

# LLM self-verification  *(glossary · web-researched)*

**One line:** an LLM critiques, checks, and selectively revises **its own** output to catch errors — without an
external discriminator. Powerful, but with a **sharp limitation** that shapes how this wiki does verification.

## The menu
- **Self-verification prompting** — ask the model to re-check its answer (cheap, weak).
- **RL-incentivized self-verify** (S²R) — train the model to self-verify/correct with rewards from ground-truth
  correctness.
- **Adversarial self-play critic** (SPC) — spin up an identical base model as a **critic** whose goal is to find the
  reasoning's flaws → the two play an adversarial game; the critic *evolves*.
- **Self-evolving code agents** (ReVeal) — reliable self-verification via executable checks.

## The limitation that matters most
On **hard** reasoning, LLMs are **poor verifiers**: critique generation and consideration degrade, and **stacked errors
can make the self-critique loop perform *worse* than just answering once.** Direct self-correction prompting is
suboptimal in most scenarios. *Self-judgment alone is not trustworthy.*

## How to apply  *(why this is in the glossary)*
- This is the empirical case **for** [[structured-adversarial-evidence-learning]]: don't trust a model grading itself —
  separate the **adversary** from the author and anchor on **external evidence**, not introspection.
- It validates [[corrected-reference-lens]] (check against an external reference, not the model's own confidence),
  [[adversarial-reasoning]] (an independent skeptic), and [[reject-first-precision]] + [[honest-partial-eval]]
  (reward correct *rejection/abstention*, don't let a confident self-check rubber-stamp a wrong answer).

## Sources
[Self-verification-based LLMs (EmergentMind)](https://www.emergentmind.com/topics/self-verification-based-llms) ·
[SPC: self-play critic via adversarial games (arXiv 2504.19162)](https://arxiv.org/pdf/2504.19162) ·
[Self-verification limitations (arXiv 2402.08115)](https://arxiv.org/pdf/2402.08115)
