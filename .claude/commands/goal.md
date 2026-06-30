---
description: Set or show the persistent NORTH-STAR goal the Cognitive Lens orbits — the long-term direction your daily work ladders up to. Shows momentum (fresh/due) in the goal's neighbourhood and the next node to act on.
argument-hint: "[goal text | --show | --clear]"
allowed-tools: Read, Grep, Glob, Bash(python3:*)
---

You are setting or showing the **north-star goal** — the persistent long-term direction the wiki + Lens orbit
(distinct from eye-state's ephemeral per-task `goal`). Argument: **$ARGUMENTS**

## Routing
- **`--show`** → run `python3 tools/north_star.py --show`, then report the current goal + its momentum (below).
- **`--clear`** → run `python3 tools/north_star.py --clear` and confirm.
- **otherwise** the argument is the **goal text**. Do:

## Setting a goal
1. **Pick the best anchor node.** Search the graph for the node whose title/aliases/topic best matches the goal
   (Grep `03_wiki/ 04_synthesis/ 05_blueprints/ local/` titles + `aliases:`; also check `07_visualizer/graph-local.json`).
   If there's a clear single match, use its id as the anchor; if the goal spans many nodes or matches none, set no anchor.
2. **Write it:** `python3 tools/north_star.py --set "<goal>" [--anchor <id>]`.
3. **Mirror to the live Eye** so it reacts now: `python3 tools/eye_state.py --status primed --goal "<goal>"`
   (add `--focus <anchor>` if set).
4. **Report momentum.** From the anchor's ~2-hop neighbourhood in `graph-local.json` (or the whole graph if no anchor):
   count **fresh** (`updated` within 7 days), **due** (`review_due ≤ today`), and total **in orbit**. Name the single
   **next node to act on** (the most central stale/undue one) and suggest `/study` or `/review` on it.

## Notes
- The goal is **local working state** (`09_working/north-star.json`, git-ignored) — your direction never publishes.
- The Lens renders it as a persistent top-centre banner + a ✦ pole-star on the anchor, with a momentum bar — so the
  Eye answers *"am I moving toward my goal?"*, not just *"what's here?"* ([[human-claude-workflow]], [[ide-for-thought-assessment]]).
