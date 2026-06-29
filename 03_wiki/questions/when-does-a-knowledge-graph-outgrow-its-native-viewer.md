---
title: "When does a knowledge graph outgrow its native viewer?"
aliases: ["When does a knowledge graph outgrow its native viewer?", "when-does-a-knowledge-graph-outgrow-its-native-viewer"]
type: question
status: active
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [meta, visualizer, graph, obsidian, scale, open-question]
related: ["obsidian-native-graph", "[[eye-native-vs-custom]]", "gap-webgl-lens", "eye-layout-spec", "wiki-eye-plugin"]
iris_ring: pupil
mode: meta
steward: auto
autonomy_tier: 1
claim_class: tentative
confidence: 0.6
privacy_scope: public_system
graph_scope: public
provenance: ["/study --drain expansion of obsidian-native-graph, 2026-06-29 (internal generation, no external claim)"]
---

# When does a knowledge graph outgrow its native viewer?

obsidian-native-graph chose Obsidian's native Graph view *partly on scale* — the native force layout
"already beats Canvas-2D at thousands of nodes" ([[eye-native-vs-custom]]). But the same note pins two ceilings
that aren't yet measured:

- **Canvas-2D Lens** strains toward **~1.5–2k nodes** → the trigger to build gap-webgl-lens.
- **Extended Graph** is "not recommended for thousands of notes"; the **3D Graph** ships a node-limit guard.

So "which renderer" is really *a function of graph size and link density* — and right now the switch is a vibe,
not a threshold.

## What would deepen this
- What's the **actual node/edge count** of `graph-local.json` today (827 idea-dots + the wiki), and at what growth
  rate does it cross each ceiling? (Mechanically countable — answer it, don't guess.)
- Is the binding constraint **node count, edge count, or label-render cost**? A sparse 3k-node graph and a dense
  1k-node graph fail differently — which one are we actually near?
- Does **readability** degrade *before* performance? The browser eye was retired because users "found it hard to
  read," not because it was slow — so the real ceiling may be cognitive, not computational.
- Can the views **degrade gracefully** — collapse clusters / hide leaf idea-dots past a threshold — so the question
  becomes "when to summarize," not "when to switch engines"? (Pairs with gap-cognitive-zoom.)

> **Hypothesis to test:** the trigger to leave the native viewer is **readability collapse**, which arrives *earlier*
> than the perf ceiling — so the right metric to watch is "can I find a node by eye," not frames-per-second.
