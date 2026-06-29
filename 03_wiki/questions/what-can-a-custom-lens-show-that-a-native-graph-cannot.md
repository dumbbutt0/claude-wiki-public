---
title: "What can a custom Lens show that a native graph structurally cannot?"
aliases: ["What can a custom Lens show that a native graph structurally cannot?", "what-can-a-custom-lens-show-that-a-native-graph-cannot"]
type: question
status: active
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [meta, visualizer, graph, lens, obsidian, open-question]
related: ["obsidian-native-graph", "[[eye-native-vs-custom]]", "wiki-eye-plugin", "eye-layout-spec", "gap-cognitive-zoom"]
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

# What can a custom Lens show that a native graph structurally cannot?

obsidian-native-graph retired the *separate browser eye*; [[eye-native-vs-custom]] then kept a **custom Lens**
*inside* Obsidian and demoted the native graph to a **companion**. The two-view model claims a clean split:

> Native graph renders the **files**; the Lens renders the **cognitive process** — reasoning state, atmosphere,
> semantic morphing, and privacy-scope tint of `graph-local.json`.

If that split is *fundamental*, maintaining both is justified. If it's just *current plugin limits*, the Lens is
re-buildable on top of the native graph and the duplication is debt.

## What would deepen this
- Enumerate the **irreducible delta**: which Lens features depend on data the native graph *cannot read* (it reads
  the link graph only, no external JSON → no `graph-local.json`, no privacy tint, no reasoning-state bridge)?
- Which Lens features are **aesthetic** (eye shape, atmosphere) vs **informational** (privacy tint, momentum,
  goal-lens)? Only the informational ones argue for a second renderer; the rest are polish.
- Could a thin **Obsidian plugin** push the *native* graph to show reasoning-state (node colour = freshness, edge
  weight = momentum), collapsing two views into one? (wiki-eye-plugin is exactly that surface.)
- Native shows **one colour per node** (category OR theme), not a layered tint — is the privacy-scope rendering a
  must-have, or does the public-export allowlist already enforce the only privacy line that matters?

> **Hypothesis to test:** the Lens earns its keep *only* for what consumes `graph-local.json` (privacy tint +
> reasoning state); everything else is reproducible natively — so the durable custom surface is **smaller** than the
> current Lens, and the rest should migrate to the native companion.
