---
title: "Cognitive Zoom — fold dots into constellations"
aliases: ["Cognitive Zoom", "cognitive-zoom", "level-of-detail graph", "fold constellations"]
type: blueprint
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [blueprint, visualizer, eye, signal]
related: ["[[ide-for-thought-assessment]]", "gap-cognitive-zoom", "[[eye-native-vs-custom]]", "gap-webgl-lens", "[[long-horizon-agent-loops]]"]
iris_ring: inner
mode: meta
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.72
privacy_scope: public_system
graph_scope: public
provenance: ["spec'd from [[ide-for-thought-assessment]] gap #3 (81% noise); actionable version of gap-cognitive-zoom"]
---

# Cognitive Zoom — fold dots into constellations  *(blueprint)*

## Problem
**81% of the graph is noise** — 827 of 1012 nodes are idea-dots; only ~185 are deep. The Eye renders all ~1000 stars at
once, so the signal drowns. The system **accumulates** but doesn't **compress** ([[ide-for-thought-assessment]] gap #3).
This is the actionable spec for gap-cognitive-zoom.

## Goal
A **level-of-detail (LOD)** Eye: by default it shows ~11 theme **clouds** (clusters collapsed), not 1000 dots. Click or
zoom a cloud to **unfold** it into its member dots; zoom out to **re-collapse**. Information is conserved — a cloud's
size ∝ its member count. The ~185 deep nodes stay legible at the constellation level.

## Reuse — the seams are already half-built (plugin-only; no `build_graph.py` change)
`cluster` + `mode` are already emitted per node. In `07_visualizer/wiki-eye-plugin/main.js`:
- `clusterOf()` (`:214`) — already maps each node to its theme/cluster.
- `computeField()` + `this._clusterPos` (`:262-307`) — already computes per-cluster centroids (golden-angle distributed)
  and the dandelion-burst layout.
- `this.modes`, `n._zv` (fake depth), and the position easing (`:451`) — already present for smooth interpolation.

## Design — add an LOD layer over the existing field
1. **Three zoom levels:** `mode (galaxy) → cluster (constellation) → node (star)`. A `zoomLevel` state (mouse-wheel or a
   HUD chip, mirroring the existing theme/mode chips at `main.js` click-handler `:876-882`).
2. **Collapsed render:** for each cluster, draw ONE soft "cloud" super-node at its `_clusterPos` centroid, radius ∝
   `sqrt(memberCount)`, labelled with the theme; **skip drawing member dots**. Deep nodes (non-dots) stay drawn.
3. **Expand on focus:** clicking/zooming a cloud sets it `expanded` → its member dots fade in via the existing
   dandelion burst + easing; siblings stay collapsed. Zoom-out / click-away re-collapses.
4. **Interpolate, don't snap:** drive cloud↔dots with the existing `n.x/n.y` easing and `n._zv` depth so the fold/unfold
   reads as a smooth zoom, not a redraw.
5. **Keep the bridges intact:** the detail card, `eye-state` reactions, click→learn/review channels are untouched — LOD
   slots into the draw/layout pass only.

## Privacy
None affected — the same `graph-local.json` nodes, only rendered at variable detail. Public Eye (`graph-public.json`,
45 nodes) is already small; LOD mainly helps the local 1000-node graph.

## Files
`07_visualizer/wiki-eye-plugin/main.js` (the LOD/fold layer + a zoom chip) · `manifest.json` (version bump) ·
`.claude/skills/eye-cases/{cases.json,verify.js}` (a collapse→expand smoke case) · `03_wiki/gaps/gap-cognitive-zoom.md`
(mark in-progress, link this) · `index.md` / `log.md`.

## Verification
Reload Obsidian → the Field opens as ~11 labelled clouds, not 1000 dots → click a cloud → it unfolds into its dots →
zoom/click out → it re-collapses smoothly → the 185 deep nodes remain visible throughout → `verify.js` 26/26 (+1 new
collapse/expand smoke case). Frame time should *drop* (fewer stars drawn at rest).

## Boundary
Canvas-2D LOD is the right move up to ~2k nodes; past that, the WebGL rewrite (gap-webgl-lens) remains the real
answer. Cognitive-zoom buys the headroom without that rewrite.
