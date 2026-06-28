---
title: Agent Loop (the loop, not the prompt)
aliases: ["Agent Loop (the loop, not the prompt)", "agent-loop", "the loop not the prompt"]
type: concept
status: active
created: 2026-06-28
updated: 2026-06-28
sources: ["[[agent-loop-pattern]]"]
source_count: 1
tags: [agent-loops, ai-engineering, methodology]
related: ["[[loop-stop-conditions]]", "[[long-horizon-agent-loops]]", "reference-agentic-pipeline", "agentic-pipeline-pattern", "[[determinism-at-the-authority-boundary]]", "human-in-the-loop-review"]
iris_ring: inner
mode: ai-engineering
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.85
privacy_scope: public_system
graph_scope: public
provenance: ["`the-loop-not-the-prompt` (raw) (methodology abstraction)"]
---

# Agent Loop — *the loop, not the prompt*

The bottleneck moved from **prompt wording** to **loop structure.** A one-shot prompt is *structurally blind* — it
never sees the traceback, the empty result, the failed call. A loop lets the model **act → watch → act again.**

> A prompt is one sentence spoken into a void. A loop is a paragraph that edits itself until it reads right.

## The four things a loop adds (that a prompt cannot)
1. **Observation** — it sees the result of its last action.
2. **Correction** — it rewrites based on what it saw.
3. **State** — it remembers across steps.
4. **A stop rule** — it knows when the job is done ([[loop-stop-conditions]]).

## The whole agent fits in `while True`
Model picks a tool → code runs it → the `tool_result` goes back into the next message → repeat. **Few tools, one loop,
zero dependencies** — no graph library, no orchestration framework needed for a single task. The intelligence is in the
model; the harness is plumbing.

## The cost trade
A loop multiplies model cost (~4× one call) but **removes the human from the repair step** — the most expensive part of
a one-shot pipeline. The bill shifts from **people-hours → tokens**, and tokens are cheaper than people. (At long
horizons this trade changes — see [[long-horizon-agent-loops]].)

## Prompt engineering dropped one level
Wording still matters **inside each step** (a vague instruction at iteration 7 still gives a vague result). It went from
*the whole building* to *a single brick*. The craft is now a layer up: **design how the bricks get called, checked, and
repeated** — and where the [[determinism-at-the-authority-boundary|authority boundary]] + human gate sit.

## Build order (single task)
one tool + `while True` feeding `tool_result` back → **turn cap first** (a bug can't drain the account) → budget guard →
**human-approval for actions touching real data/money** → add tools one at a time, watching the loop recover from each
failure. This is the canonical reference-agentic-pipeline in its smallest form. For thousands of items / persistent
state, see **[[long-horizon-agent-loops]]**.
