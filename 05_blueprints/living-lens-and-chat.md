---
title: "Living, self-connecting Lens + a Claude-session chat"
aliases: ["Living, self-connecting Lens + a Claude-session chat", "living-lens-and-chat"]
type: blueprint
status: building
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [blueprint, visualizer, chat, link-inference, eye]
related: ["[[ide-for-thought-assessment]]", "[[human-claude-workflow]]", "[[click-to-learn]]", "[[cognitive-zoom]]", "[[recall-review-loop]]", "[[operator-and-hermes]]", "autonomy-policy"]
iris_ring: inner
mode: meta
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.72
privacy_scope: public_system
graph_scope: public
provenance: ["approved plan, 2026-06-29 — foundation-first; tiered auto-write; fast-heuristic auto-links; Monitor chat-loop"]
---

# Living, self-connecting Lens + a Claude-session chat  *(blueprint · building)*

Four phases turning the Lens from a viewer into a **living workspace** that connects ideas, shows Claude working, and
talks back. Built foundation-first.

## Phase 1 — Eye: alive + connection-forward  ✅ (Eye 2.8.0)
No spin. Dots spread across the whole **almond ellipse** (not the inner iris circle) → they fill the space. **Edges are
the emphasis:** all links drawn (was reciprocal-only), reciprocal brighter, + a **living-conduit** layer sending a slow
dot down each strong connection. Ideas read as *connected*, not scattered.

## Phase 2 — Link-inference engine  ▸ next
`tools/infer_links.py`: fast **tag + shared-term overlap** between nodes → inferred edges in
`07_visualizer/graph-inferred.json` (`type:"inferred"`, score, reason). No API, no page-text edits, reversible,
local-only (kept out of the public graph). `/connect` reports the strongest new pathways + promotes the best to real
`wikilinks` (Tier 1). The Eye renders inferred edges **distinctly** (dashed/cooler). *"Connect ideas as fast as possible."*

## Phase 3 — Runtime-development visualization  ▸
`eye_state.py --edges "a|b,…" --building "<note>"` → `activeEdges` in `eye-state.json`; the Eye lights those as **bright
animated development conduits** + a HUD "building" label. Every command + the loop narrates as it works → opening the
Lens shows a **live glowing subgraph of where Claude is developing the system.**

## Phase 4 — The chat (Obsidian ↔ a running Claude session)
File bridge: `09_working/chat-inbox.jsonl` (plugin appends user messages) + `chat-outbox.jsonl` (Claude appends replies
+ node refs + artifact paths). A chat panel in the Lens; a `/chat` command that classifies intent (find · internal /
external research · develop-system · write artifact/paper/blueprint · life-optimize), **acts** (reusing `/recall`
`/query` `/study` `/compose` `/blueprint`), **auto-writes tiered** (Tier 0–2 save; Tier 3 quarantine; privacy-scoped),
and **narrates to the Eye** as it works. A **dedicated Monitor-driven chat-loop** watches the inbox and replies within
seconds while it runs (the honest limit of [[operator-and-hermes]]: it needs a running session — the loop is that engine).

## Principles
- **Connections over nodes** — the value is the *links between* ideas; the Lens makes them primary.
- **Tiered auto-write + privacy** (autonomy-policy): Tier 0–2 auto, Tier 3 quarantine; personal/life → local, edge
  → restricted, only generalizable methodology → public. "Optimize my life in my image" = freely write personal
  artifacts **locally**, never public.
- **Legible handoff** ([[human-claude-workflow]]): you always see whether Claude is live, what it's building, and where.
