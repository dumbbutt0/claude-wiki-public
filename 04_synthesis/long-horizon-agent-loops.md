---
title: Long-Horizon Agent Loops (+1000 nodes)
aliases: ["Long-Horizon Agent Loops (+1000 nodes)", "long-horizon-agent-loops", "agent loops at scale"]
type: synthesis
status: active
created: 2026-06-28
updated: 2026-06-28
sources: ["[[agent-loop-pattern]]"]
source_count: 1
tags: [agent-loops, scale, architecture, synthesis]
related: ["[[agent-loop]]", "[[loop-stop-conditions]]", "persistent-knowledge-base", "autonomy-policy", "[[orchestration-governor]]", "[[determinism-at-the-authority-boundary]]", "human-in-the-loop-review", "[[operator-and-hermes]]", "[[structured-adversarial-evidence-learning]]", "steward-ledger"]
iris_ring: inner
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.78
privacy_scope: public_system
graph_scope: public
provenance: ["interpretation extending [[agent-loop]] to long-horizon/large-state runs; grounded in this wiki's own steward/loop/graph"]
---

# Long-Horizon Agent Loops (+1000 nodes)

The [[agent-loop]] article describes a **single task** (observe → correct → state → stop, in one `while True`). A
*long-horizon* loop — thousands of items, persistent growing state, runs across days — is a **different machine**, and
its hard parts are the ones the single-task framing omits. This is the form this wiki actually runs (the steward loop,
the Eye's click-to-learn, the 827-conversation drain). Nine principles.

## 1 · State lives OUTSIDE the context window
A single-task loop keeps "state" in the message history. **At +1000 nodes that's impossible** — the context window is
*working memory*, not long-term memory. The agent's real state must be an **external store** it reads + writes: files,
a queue, a graph, a DB. Here that store is the persistent-knowledge-base / `graph-local.json`. The loop's job each
iteration: load the slice it needs, act, write back. *The context window is a cache; the graph is the disk.*

## 2 · Batch · checkpoint · resume
A long loop can't finish in one session. Process in **batches**, record progress to a durable marker
(`steward-processed.txt`, a queue file), and make every iteration **resumable** — it reads "what's done" and picks the
next. The `/loop` + `ScheduleWakeup` pattern *is* this: each wake is one batch; the journal lets it pick up where it left off.

## 3 · Triage cheap, deep-process rare
At scale, **most items are low-value.** A long-horizon loop needs a **two-speed** step: a cheap triage that *fast-routes
the dross* and a deep step that mines the veins. (This wiki: fast-route 50 personal conversations/iter, deep-mine the
1-in-10 with real methodology.) Deep-processing everything is the classic way to burn a budget for no gain.

## 4 · Stop conditions are queue- and convergence-based, not just a turn cap
The single-task turn cap is wrong here. You need **drain-to-zero** (process until the queue is empty), **loop-until-dry**
(stop after K empty rounds, for open-ended discovery), and **convergence** (stop when value-per-iteration tapers — don't
grind a dry tail; flag it). See [[loop-stop-conditions]]. *Knowing a long loop has converged is as important as starting it.*

## 5 · Fan out to sub-agents for breadth + fresh context
When the work-list is huge or needs many angles, **spawn sub-agents** — each with its own clean context window — instead
of one ballooning context. A **governor** routes + synthesizes; **workers** do the domain work
([[orchestration-governor]] — *govern, don't analyze*). This is how you parallelize a 1000-item sweep without context rot.

## 6 · The authority boundary stays deterministic + tiered
The article's "human approval for risky actions" doesn't scale to thousands of writes. **Tier** them: auto the safe
(Tier 0–2), gate/quarantine the risky (Tier 3) — autonomy-policy. The consequential mutation stays behind a
deterministic, reversible gate ([[determinism-at-the-authority-boundary]], human-in-the-loop-review). Intelligence
roams upstream; authority is fail-closed.

## 7 · Cost compounds — so the cheap path must be the common path
A single-task loop costs ~4× one call. A long-horizon loop over 1000 items costs ~1000× — so **the triage (cheap path
for most) + per-batch + global budget caps** matter far more than in the single-task case. Spend deep compute only where
expected value rises (the governor's job).

## 8 · A ledger is not optional
Over a long horizon you can't watch every step. A durable **ledger** of what the loop did (steward-ledger) makes the
run **auditable, reversible, and resumable** — and lets a human review a sample instead of the whole. No ledger = a
black box you can't trust at scale.

## 9 · Convergence + a hand-off to the human
A long-horizon **learning** loop should *converge*, not run forever. When new value tapers, the right move is to **stop
and synthesize** (a capstone — [[structured-adversarial-evidence-learning]]) rather than keep grinding. The honest end
state is a human deciding what the loop surfaced was worth.

## The one-line mental model
> A **single-task loop** edits one answer until it reads right. A **long-horizon loop** is a *governor + external memory
> + a tiered authority gate*, draining a triaged queue in resumable batches until it converges — and the hard parts are
> **state, stop, and trust at scale**, not the inner `while True`.

The unattended overnight version still needs a launched session (an LLM can't run from nothing — [[operator-and-hermes]]);
the loop *is* that engine, pointed at a queue.
