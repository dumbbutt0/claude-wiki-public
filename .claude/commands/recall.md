---
description: "Show everything I know about X" — survey all wiki pages touching a topic, traverse their links, and synthesize a structured map (what's known, open questions, gaps) with citations.
argument-hint: "[topic]"
allowed-tools: Read, Grep, Glob
---

You are running a **recall** over the wiki. Topic: **$ARGUMENTS**.
This surveys *what exists* about a topic (vs `/query`, which answers a specific question).

0. **Semantic seed (meaning, not just keywords):** `python3 tools/semantic_index.py --query "$ARGUMENTS" --n 15` → the nodes most *semantically* related to the topic (catches synonyms grep misses). Start from these, then refine with:
1. **Find every relevant page.** Search titles, `tags:`, `mode:`, and bodies across
   `02_sources/`, `03_wiki/`, `04_synthesis/`, `05_blueprints/` (use Grep/Glob — match the
   topic and obvious synonyms). Also check `index.md`.
2. **Traverse**: from the hits, follow `[[wikilinks]]` and `related:` one hop out to catch
   adjacent material.
3. **Synthesize a map**, citing every node by `[[page]]`:
   - **Core** — the concepts/projects/systems that *are* the topic.
   - **Connections** — patterns/skills/other domains it links to (cross-`mode:` especially).
   - **Blueprints / next actions** that reference it.
   - **Open questions & gaps** — `03_wiki/questions/` + `contradictions/` on the topic, and
     anything conspicuously *missing* (a source not yet ingested, an unwritten page).
4. End by suggesting the best entry page to open — in **Obsidian**, where its **Local Graph** shows the
   neighbours (colour = category).

Be honest about coverage — if the wiki barely knows the topic, say so and point to what to ingest.
