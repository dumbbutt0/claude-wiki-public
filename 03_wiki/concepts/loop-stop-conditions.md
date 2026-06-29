---
title: Loop Stop Conditions
aliases: ["Loop Stop Conditions", "loop-stop-conditions"]
type: concept
status: active
created: 2026-06-28
updated: 2026-06-28
review_due: 2026-06-28
interval: 0
ease: 2.5
review_attempts: 0
sources: ["[[agent-loop-pattern]]"]
source_count: 1
tags: [agent-loops, safety, ai-engineering]
related: ["[[agent-loop]]", "[[long-horizon-agent-loops]]", "[[reject-first-precision]]", "[[determinism-at-the-authority-boundary]]"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.85
privacy_scope: public_system
graph_scope: public
provenance: ["`the-loop-not-the-prompt` (raw) (methodology abstraction)"]
---

# Loop Stop Conditions

The hard part of an [[agent-loop]] is not the intelligence — it's **knowing when to stop.** A loop with no guard burns
money (the article: 90 iterations / $40 before it was killed).

> The intelligence lives in the model. **The control lives in the stop rule.**

## The single-task trio (three lines)
1. **Turn cap** — a hard iteration limit (e.g. 25). Add this *first*, before any tool.
2. **`stop_reason` check** — exit when the model returns `end_turn` (it declared itself done).
3. **Token / cost budget** — a running total that trips a hard stop.

## At long horizons, completion ≠ the only stop (extends to thousands of items)
A single turn-cap is wrong for a loop that processes a large work-list. There you also need
([[long-horizon-agent-loops]]):
- **Drain-to-zero** — stop when the queue is empty (process *every* item, cheaply triaged).
- **Loop-until-dry** — stop after **K consecutive rounds** that find nothing new (for discovery, where the end is unknown).
- **Convergence / diminishing-returns** — stop when value-per-iteration tapers (don't grind a dry tail; flag it for a human).
- **Per-batch caps + a global budget** — so one runaway item can't drain the whole run.

## Why it's a safety primitive
Stop conditions are the **deterministic control** around a non-deterministic engine — the loop-level form of
[[determinism-at-the-authority-boundary]] and the operational form of [[reject-first-precision]] (*reward correct
stopping*). Pair with a **ledger** so a long run is auditable + resumable.
