---
title: Agent-Loop Pattern (source summary)
aliases: ["Agent-Loop Pattern (source summary)", "agent-loop-pattern"]
type: source-summary
status: active
created: 2026-06-28
updated: 2026-06-28
sources: ["`the-loop-not-the-prompt` (raw)"]
source_count: 1
tags: [source-summary, agent-loops, ai-engineering]
related: ["[[agent-loop]]", "[[loop-stop-conditions]]", "[[long-horizon-agent-loops]]"]
iris_ring: middle
mode: ai-engineering
privacy_scope: public_system
graph_scope: public
---

# Agent-Loop Pattern — source summary

Factual summary of the article (`the-loop-not-the-prompt` (raw)). No interpretation.

## What it claims
- **The bottleneck moved** from prompt wording to loop structure. When models were weak (2022–24) a sharp prompt was
  the product; strong models reason unprompted, so the prompt↔prompt gap collapsed.
- **A one-shot prompt is structurally blind** — no feedback: it never sees the traceback / empty result / failed call.
- **A loop adds four things a prompt cannot:** observation · correction · state · a stop rule.
- **The agent is a `while True`:** model picks a tool → run it → feed `tool_result` back → repeat. "6 tools, 1 loop,
  0 dependencies" — no framework.
- **Stop conditions are the hard part** (and the cheap insight): turn cap + `stop_reason == end_turn` + token budget.
  *"Intelligence lives in the model; control lives in the stop rule."*
- **Cost shifts from people-hours to tokens** (~4× model cost, minus the human repair step).
- **Prompt engineering didn't die — it dropped one level** (wording still matters *inside* each loop step).
- **Build order:** one tool + loop → turn cap → budget guard → human-approval for risky actions → add tools one at a
  time. Stated result: 312 support tickets cleared unattended over a weekend.

## Scope (stated)
A **single-task** loop on the raw API. The article does **not** address long-horizon / large-state runs (thousands of
items, persistent memory beyond the context window) — that extension is interpreted in [[long-horizon-agent-loops]].
