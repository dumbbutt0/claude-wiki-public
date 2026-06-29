---
title: "Reinforcement learning with verifiable rewards (glossary)"
aliases: ["Reinforcement learning with verifiable rewards", "RLVR", "verifiable rewards", "reinforcement-learning-verifiable-rewards"]
type: glossary
field: ai-engineering
status: active
created: 2026-06-28
updated: 2026-06-28
sources:
  - "https://www.emergentmind.com/topics/reinforcement-learning-with-verifiable-rewards-rlvr"
  - "https://github.com/opendilab/awesome-RLVR"
  - "https://www.appen.com/blog/rlvr"
source_count: 3
tags: [glossary, ai-engineering, rl, training, evaluation]
related: ["outcome-learning-loop", "[[eval-driven-improvement-loop]]", "[[source-answer-key-eval]]", "scaling-laws"]
iris_ring: outer
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: factual
confidence: 0.85
privacy_scope: public_system
graph_scope: public
provenance: ["/study web research (click-to-learn, 2026-06-28) on outcome-learning-loop"]
---

# Reinforcement learning with verifiable rewards (RLVR)  *(glossary · web-researched)*

**One line:** improve an LLM's reasoning using **objective, automatically-checkable** reward signals — does the code
run, does the answer match ground truth — instead of a learned model of subjective human preference.

## RLVR vs RLHF
- **RLHF** learns a reward function from subjective human preferences over candidate responses → vulnerable to
  **reward hacking** (the model games the proxy).
- **RLVR** uses **programmable / verifiable** criteria as the reward (execute the generated code; check the math against
  the solution) → objective feedback, less reward-hacking, no preference-model to corrupt.

## The menu (2025)
- **Outcome-driven RL (GRPO)** — reward the final verified outcome.
- **Rubric-anchored RL** — structured rubrics score *open-ended* responses where there's no single ground truth.
- **Verifier-free** (e.g. VeriFree) and **cross-domain RLVR** — LLM-derived scoring for domains lacking reference answers.
- **RLVR-trained LLM-as-judge** — train the evaluator itself with verifiable rewards for deeper, more accurate judging.

## How to apply
- This is the training-time cousin of this wiki's outcome-learning-loop + [[eval-driven-improvement-loop]]: let an
  **objective signal** (not a vibe) drive improvement.
- **[[source-answer-key-eval]] is RLVR-style evaluation** — the source *is* the verifiable answer key; correctness is
  checkable, not subjective. The same discipline that makes RLVR work makes the wiki's evals trustworthy.

## Sources
[RLVR overview (EmergentMind)](https://www.emergentmind.com/topics/reinforcement-learning-with-verifiable-rewards-rlvr) ·
[awesome-RLVR list](https://github.com/opendilab/awesome-RLVR) ·
[Appen — RLVR for reliable enterprise LLMs](https://www.appen.com/blog/rlvr)
