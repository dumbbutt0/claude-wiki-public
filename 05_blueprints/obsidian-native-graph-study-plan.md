---
title: "Obsidian-Native Graph — study plan"
aliases: ["Obsidian-Native Graph — study plan", "obsidian-native-graph-study-plan"]
type: blueprint
status: active
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [blueprint, research, meta, visualizer, graph, obsidian, study-plan]
related: ["obsidian-native-graph", "[[eye-native-vs-custom]]", "wiki-eye-plugin", "eye-layout-spec", "gap-webgl-lens", "gap-cognitive-zoom", "[[when-does-a-knowledge-graph-outgrow-its-native-viewer]]", "[[what-can-a-custom-lens-show-that-a-native-graph-cannot]]"]
iris_ring: middle
mode: meta
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.65
privacy_scope: public_system
graph_scope: public
provenance: ["/study --drain expansion of obsidian-native-graph, 2026-06-29 (internal synthesis; Eye click-to-learn)"]
---

# Obsidian-Native Graph — study plan

A `/study` plan grown from clicking obsidian-native-graph in the Eye. That decision (2026-06-27, *"retire the
browser eye → native graph"*) did **not** stay put: one day later [[eye-native-vs-custom]] (2026-06-28) reframed
the native graph from a *replacement* to a **first-class companion** alongside a custom Lens kept inside Obsidian.
The arc is the real subject — **a reversal worth understanding, not papering over.**

| date | stance | the eye is… |
|---|---|---|
| 2026-06-27 obsidian-native-graph | retire the separate browser app; **native graph only** | one tool, always in front of you |
| 2026-06-28 [[eye-native-vs-custom]] | **hybrid** — custom Lens (in-Obsidian) + native companion; WebGL later | a cognitive IDE *and* a scale-explorer |

> **Thesis to pressure-test:** "make it only use Obsidian" was the durable constraint; "retire the eye entirely" was
> not. The custom surface came back the moment it lived *inside* Obsidian instead of a separate browser window — so
> the real lesson is about **window-switching cost**, not about custom-vs-native rendering.

## Study directions
1. **Measure the ceilings.** Answer [[when-does-a-knowledge-graph-outgrow-its-native-viewer]]: count the live
   `graph-local.json` nodes/edges and locate today's position against the Canvas-2D (~2k) and Extended-Graph
   ("thousands") limits. Turns the gap-webgl-lens revisit trigger from a vibe into a threshold.
2. **Find the irreducible delta.** Answer [[what-can-a-custom-lens-show-that-a-native-graph-cannot]]: split Lens
   features into *consumes `graph-local.json`* (privacy tint, reasoning-state) vs *reproducible natively* (colour
   groups, force layout). The first set is the only justification for a second renderer.
3. **Re-read the reversal as a pattern.** "Constraint survives, implementation flips" — does the same shape recur
   elsewhere in this vault (e.g. wiki-console-commands-vs-plugin's *commands now, plugin deferred*)? If so it's a
   reusable decision-hygiene note: separate the **invariant** from the **current build**.
4. **Survey prior art (web wave).** How do other knowledge-graph tools handle the native-vs-custom split — Logseq,
   Roam, Foam, Obsidian's own Extended/3D/Juggl plugins, force-graph perf at scale? Pull in named thresholds and
   degrade-gracefully techniques; nothing leaks out.

## Project seeds
- **Scale dashboard** — a tiny script that prints live node/edge counts + density per scope, flags when a ceiling is
  near, and recommends the renderer. Operationalizes direction 1 and feeds the gap-webgl-lens decision.
- **Graceful-degrade pass** — collapse leaf idea-dots / cluster by theme past a node threshold (gap-cognitive-zoom),
  so "readability collapse" (the *real* retirement cause of the browser eye) is engineered against, not waited on.
- **Content:** *"I retired my custom graph, then un-retired it in one day"* — the window-switching-cost lesson; why
  "native" beat "custom" only until "custom" moved in-tool. Threads visualizer decisions into a general UI principle.

## Why this compounds
The visualizer is the **interface to every other thing** this wiki builds. Getting the native/custom/WebGL boundary
right — and learning to separate a decision's *invariant* from its *current implementation* — is decision hygiene that
transfers far past the graph. It's the self-directed-learning habit applied to the wiki's own tooling.
