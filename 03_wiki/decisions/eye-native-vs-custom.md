---
title: Eye — custom Lens + native-graph companion (hybrid)
aliases: ["Eye — custom Lens + native-graph companion (hybrid)", "eye-native-vs-custom", "Eye Native vs Custom"]
type: decision
status: active
created: 2026-06-28
updated: 2026-06-28
sources: ["ai-workspace-interfaces"]
source_count: 1
tags: [decision, visualizer, obsidian, lens, graph]
related: ["wiki-eye-plugin", "gap-webgl-lens", "eye-layout-spec", "obsidian-native-graph", "gap-cognitive-zoom", "[[when-does-a-knowledge-graph-outgrow-its-native-viewer]]", "[[what-can-a-custom-lens-show-that-a-native-graph-cannot]]"]
revisit: when the Lens nears ~1.5–2k nodes (Canvas-2D strain) → build gap-webgl-lens; or if Extended Graph proves smooth at ~1k
superseded_by: none (current)
iris_ring: middle
mode: meta
privacy_scope: public_system
graph_scope: public
---

# Eye — custom Lens + native-graph companion (hybrid)

## Problem
Should the Cognitive Lens stay a custom canvas, integrate an Obsidian graph plugin (Extended Graph / 3D Graph), or
go hybrid? Goal: the Eye should feel **native, alive, scalable** — not a forced custom canvas.

## Decision — Hybrid (keep custom + native companion; build WebGL custom later)
Researched Extended Graph, 3D Graph, the native graph, and the landscape (verified vs GitHub/forum; Reddit treated
as sentiment only). **Keep the Lens fully custom** — its **eye shape**, **Cognition atmosphere**, **reasoning-state
bridge**, **semantic morphing**, **IDE status bar**, and **privacy-scope rendering of `graph-local.json`** exist in
no plugin. **Make Obsidian's native graph a continuous companion**: the 827 idea-dots are real files, so the native
graph already holds the full local graph; `tools/build_obsidian_graph.py` now colours it by the **same 11 themes +
12 categories** as the Lens (a round coloured galaxy). **Build the galaxy-at-scale WebGL renderer custom & later**
(gap-webgl-lens); **trial — not depend on — Extended Graph** for image/icon nodes.

## Why this way
- Plugins render the *files*; the Lens renders the *cognitive process*. Only the Lens does eye / atmosphere /
  reasoning / privacy.
- Extended Graph & 3D Graph read the **native link graph only** (no external JSON) and have **explicit perf
  ceilings** (Extended Graph "not recommended for thousands of notes"; 3D Graph ships a node-limit guard + dev
  "perf issue I don't know how to fix") → **no hard dependency**, and **no export-for-plugins layer** (they can't
  consume `graph-local.json`).
- The galaxy aesthetic is **feasible as a custom WebGL build** (darcynorman built one with Claude Code in ~2h:
  instanced GPU, additive bloom, Bezier filaments) → that's gap-webgl-lens, ours, not borrowed.
- For **explore + scale today**, Obsidian's native force graph already beats Canvas-2D at thousands of nodes and is
  native by definition.

## Tradeoffs (honest)
- Native graph shows **one colour per node** (category OR theme), not a layered privacy tint — acceptable (it's
  all-local; privacy is enforced at the public-export allowlist).
- Canvas-2D Lens strains toward ~2k nodes → WebGL is the eventual answer (deferred; **breaks the no-build /
  plain-CommonJS plugin** → needs a build step or vendored three.js).
- Extended Graph is GPLv3 + perf-limited → **trial only, never load-bearing.**

## Two-view model
**Cognitive Lens** = the symbolic cognitive IDE (state · reasoning · atmosphere). **Native graph (tuned)** = explore
+ scale, continuous colours. Both read the same local files / `graph-local.json`. Public sharing stays the
`graph-public.json` allowlist.

## Relates
Extends wiki-eye-plugin + obsidian-native-graph — the native graph is now a *first-class companion*, not a
retired alternative. Defers gap-webgl-lens + gap-cognitive-zoom.
