---
title: "Human ↔ Claude workflow — friction + small steps"
aliases: ["Human ↔ Claude workflow", "human-claude-workflow", "the loop between you and Claude"]
type: synthesis
status: active
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [synthesis, workflow, meta, ux]
related: ["[[ide-for-thought-assessment]]", "[[click-to-learn]]", "[[recall-review-loop]]", "[[cognitive-zoom]]", "[[operator-and-hermes]]", "[[long-horizon-agent-loops]]"]
iris_ring: middle
mode: meta
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.7
privacy_scope: public_system
graph_scope: public
provenance: ["review of a 2026-06-29 screen recording of the Lens+Obsidian workflow"]
---

# Human ↔ Claude workflow — friction + small steps

> Reviewed from a 3.5-min screen recording (2026-06-29) of the owner working in Obsidian + the Cognitive Lens.

## The loop, as observed
Human clicks a node in the **Lens** → the **detail card** shows its links + an *opening question* → human **opens the
note** to read → *if a Claude session/loop is live*, the click drains from the queue and the node **blooms** with fresh
research. Two panes: the Lens and the note, hopped between.

## Friction points (and what was fixed)
1. **No "is Claude listening" signal.** The card promised *"expanding in the background"* **unconditionally** — but
   that only happens if a session/loop is live. On one dot the owner literally typed *"(this popup did not work)."* The
   human couldn't tell a *queued* click from one being *acted on*. → **FIXED:** a **LIVE / idle** indicator in the HUD
   (green ● when Claude drove the Eye in the last 2 min), and the card now reads **"researching now"** vs
   **"◌ queued — runs when Claude is live."**
2. **Jumpy parallax.** The whole scene shifted *instantly* with the cursor (un-eased `par`), and a ~1000-node hover
   hit-test ran on **every** mouse-move. → **FIXED:** the parallax now **eases** toward the cursor (glides, not lurches),
   magnitude trimmed; the hover hit-test is fold-aware (skips folded dots) + sampled every other move.
3. **Pending exchange was invisible.** The human couldn't see what's outstanding. → **PARTIAL:** the HUD LEARNING line
   now shows **"N gaps · M due"** (concepts due for active-recall review). A *"queued to research"* count is next.
4. **No persistent long-term goal.** The HUD MISSION shows the *current focus node*, not a north-star the work ladders
   up to over weeks. → **NEXT** (see below).

## The next small steps (prioritized)
- ▸ **Persistent north-star goal + progress.** `eye-state` already carries a `goal` ([[click-to-learn]] bridge); surface
  it *persistently* and show how many goal-related nodes are fresh / studied / due — so the Lens answers *"am I moving
  toward my goal?"*, not just *"what's here?"* This is the missing **long-term-goaling** layer.
- ▸ **A "queued to research · due to review" line** — the full pending human↔Claude exchange at a glance.
- ▸ **A one-gesture "drain my clicks now"** — let the human trigger the round-trip from the Lens (write a sentinel the
  running loop watches) instead of switching to the terminal. Tightens the **cross-chain** handoff.
- ▸ **Surface the loop state in Obsidian**, not just the Lens — a status-bar item ("● Claude live · 3 queued · 12 due").

## The principle
The human↔Claude loop has two halves: the human's **intent** (clicks, reads, goals) and Claude's **action** (research,
recall, maintenance). Every friction above is a place where one half **couldn't see the other**. The fix is always the
same: make the handoff **legible** — show whether Claude is listening, what's queued, and whether it moved you toward
your goal. Honest signals beat silent promises (cf. [[operator-and-hermes]]: an LLM can't act unattended, so *say so*).
