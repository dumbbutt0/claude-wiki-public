---
title: Safe Post-Run State Sync
aliases: ["Safe Post-Run State Sync", "safe-post-run-sync"]
type: pattern
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [automation, safety, state, pattern]
related: ["validation-gate-pattern", "human-in-the-loop-review", "[[determinism-at-the-authority-boundary]]", "[[reject-first-precision]]", "[[operator-and-hermes]]"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.78
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-07-audit-sync-hook-guide (process abstraction; internal target/phase names stripped)"]
---

# Safe Post-Run State Sync

When an autonomous run should update **shared state** (a dashboard, a global index, an active-context pointer), the
answer is a **guarded post-run sync hook — never a blind "always mutate" hook.**

## The rule
Sync shared state **only after** the run has:
1. produced **valid artifacts** (the outputs exist, parse, and pass their schema/adapter checks),
2. passed a **source/format adapter** for *this* run's shape (a per-source adapter, not a one-size mutation tuned to a
   different corpus), and
3. cleared the safety checks below.

Otherwise the run stays **isolated** — visible only in its own workspace — and flags the missing adapter as the
explicit follow-on. *(Better an honestly-isolated result than a contaminated shared view.)*

## Isolation + reversibility guards
- **Never mutate a prior deliverable** to make a new run show up — extend through an adapter, don't overwrite.
- **Restore the baseline** after the run (e.g. reset the active-context pointer to where it was).
- **Verify START == END**: production / forbidden files byte-identical before and after; no hand-edits to the
  authority path; no route/submit/promote side effects during a measurement run.
- Make the sync **idempotent** and reversible (re-running can't corrupt; a bad sync is one revert away).

## Why
This is [[determinism-at-the-authority-boundary]] applied to *state writes*: let the run roam, but gate the mutation of
shared truth behind validation (validation-gate-pattern), keep it reversible, and surface anything uncertain for
review (human-in-the-loop-review). It's the same discipline the wiki's own local operator uses
([[operator-and-hermes]] — commit only public artifacts, never blind writes). Governed by [[reject-first-precision]]:
when in doubt, isolate rather than mutate.
