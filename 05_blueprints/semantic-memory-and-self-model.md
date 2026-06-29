---
title: "Semantic memory + the self-model spine"
aliases: ["Semantic memory + the self-model spine", "semantic-memory-and-self-model"]
type: blueprint
status: active
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [blueprint, retrieval, self-model, architecture]
related: ["[[growing-indefinitely]]", "[[ide-for-thought-assessment]]", "[[living-lens-and-chat]]", "context-priming", "persistent-knowledge-base", "long-horizon-agent-loops"]
iris_ring: inner
mode: meta
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["implements the chat answer [[growing-indefinitely]] — local TF-IDF semantic memory + a living self-model + auto-orientation (2026-06-29)"]
---

# Semantic memory + the self-model spine  *(built)*

## Problem
The system *accumulated* knowledge but the agent operating on it was **ephemeral + keyword-bound**
([[growing-indefinitely]]): it re-orients from scratch each session, retrieves by keyword, and appends to the graph
more than it reasons *with* it. For **indefinite** growth the agent must always re-enter **fully oriented**, retrieve by
**meaning**, and aim at **the person**, not just a bigger pile.

## What was built (the three layers)
1. **Semantic memory (local TF-IDF):** `tools/semantic_index.py` — scikit-learn TF-IDF over every node
   (title + aliases + tags + body) → `graph-semantic.{npz,pkl,json}` (git-ignored). `--query` / `--similar` rank by
   **cosine** (catches synonyms grep misses). Wired as a **semantic seed** into `/recall` · `/prime` · `/query`, and as
   `infer_links.py --semantic` into `/connect`. 100% local, deterministic, no model download.
2. **The self-model spine:** `local/self-model/self-model.md` — the *living* model (north-star · direction · skills +
   confidence · taste · aversions · recurring patterns · desires). `tools/self_model.py` assembles it +
   `north-star.json` into `09_working/self-model.json`. **`/me`** views + refines it (tentative, Tier 1, local-only).
   `/prime` · `/steward-pending` · `/chat` read the JSON to **bias retrieval + capture toward the owner's direction**.
3. **Auto-orientation:** `tools/auto_orient.py` (SessionStart hook) loads north-star + self-model + due-reviews +
   pending captures/chat + last session → prints an orientation block. The agent **re-enters oriented** (a hook can't
   reason — it *loads + prints*; the agent acts on it).

## Why it grows *indefinitely* and *with you*
- **Indefinitely:** semantic retrieval scales by *meaning*, so at 1k or 100k nodes the agent surfaces the right context
  — *size never outpaces comprehension.*
- **With you:** the self-model aims capture, retrieval, the loop, and the chat at *who you're becoming*, not just a
  bigger pile. Auto-orient removes the per-session re-orientation tax.

## Privacy
The self-model, `self-model.json`, the TF-IDF index, and semantic-inferred links are **`local_private`, git-ignored**
(personal direction + private node text). Only this *design* is `public_system`.

## Relates
Implements [[growing-indefinitely]] (the chat answer); closes the [[ide-for-thought-assessment]] #1 gap
(destination → ambient); rides on [[living-lens-and-chat]] and context-priming.
