---
title: Click-to-Learn — the Eye as an active learning loop
aliases: ["Click-to-Learn — the Eye as an active learning loop", "click-to-learn", "Click to Learn"]
type: decision
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [decision, visualizer, learning, autonomy]
related: ["wiki-eye-plugin", "[[eye-native-vs-custom]]", "[[operator-and-hermes]]", "expanding-answer-base", "context-priming", "gap-execution-layer"]
revisit: when web-research-per-click proves too slow or noisy
superseded_by: none (current)
iris_ring: middle
mode: meta
privacy_scope: public_system
graph_scope: public
---

# Click-to-Learn — the Eye as an active learning loop

## Problem
The Cognitive Lens was a beautiful *read-only* map — clicking a node only focused it. The owner wants a click to mean
*"I'm actively expanding MY knowledge on this"* → the system should **research + grow the graph around the subject in
the background**, so by the time the note opens, fresh connectivity + studyable concepts/questions/projects have bloomed.

## Decision — a reverse channel + `/study`, drained by the steward loop
Wire **visual → tool use → questions/ideas**:
1. **Eye → Claude reverse channel:** on click (`primeOn`), the Eye appends a learning-intent to
   `09_working/learning-intent-queue.jsonl` (debounced 20s) and marks the node "researching" in the card. (The forward
   channel `eye-state.json` already existed; this is its mirror.)
2. **`/study`** expands each queued subject in two waves: **internal first** (open questions → `03_wiki/questions/`,
   missing-connection links, a `05_blueprints/<subject>-study-plan` — ready by note-open) **then web research** (sourced
   new concepts). Claim-level + privacy-scoped; Tier 0–2 auto, Tier 3 quarantine.
3. **The steward loop is repurposed:** instead of draining the conversation backlog it drains the click-queue
   (`tools/study_drain.py` → `/study --drain`) — every node you click researches itself while you browse.
4. **The Eye blooms:** `/study` regenerates `graph-local.json` + writes `eye-state.json --status expanding`; the plugin
   reloads (the `maybeReload` watcher now catches `graph-local.json`) and the open card refreshes with fresh links.

## Why this way
- **Reuses everything:** `/prime` (retrieval) · `/mine-conversation` (extraction) · `/blueprint` (study-plans) ·
  `/expand` (typed writes) · `eye_state.py` (bloom) · the privacy ontology. The only new pieces are the **reverse
  channel** + the `/study` driver + `study_drain.py`.
- **Internal-first** keeps the note non-empty instantly; **web-in-background** brings genuinely new knowledge (pulled
  *in* — nothing leaks out).
- It's a partial fulfilment of gap-execution-layer: the wiki now *does* something (researches) in response to intent.

## Honest limit
Background research still needs a **running Claude session** (the steward loop / `steward_cron.sh`) — an LLM can't run
unattended from nothing. Web research per click hits the network and is slower, so it's the second wave. See
[[operator-and-hermes]].

## Relates
Extends wiki-eye-plugin + expanding-answer-base + context-priming; the operator engine is [[operator-and-hermes]].
