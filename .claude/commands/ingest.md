---
description: Ingest a source (URL, file path, or pasted text) into the wiki — stage it immutably, write a factual summary, build concept pages, and update the index/log/graph. Follows CLAUDE.md §7.
argument-hint: "[url | file path | \"pasted text\"]"
allowed-tools: Read, Write, Edit, WebFetch, Bash(cp:*), Bash(mkdir:*), Bash(git -C:*), Bash(date:*), Bash(python3 07_visualizer/build_graph.py:*)
---

You are running the **ingest workflow** ([@CLAUDE.md](../../CLAUDE.md) §7, §4, §11, §12–14).
Today is !`date +%F`. Source to ingest: **$ARGUMENTS**

Work in **small, reviewable batches**. Stay inside `Claude-Wiki/`; never touch `.obsidian/`.

1. **Identify the source type** and stage it **immutably** in `01_raw/`:
   - **URL** → fetch it (WebFetch); save the captured text to `01_raw/<slug>/…`. If the host
     blocks verbatim copy, save a clearly-labelled structured extraction + the canonical URL.
   - **File path** → `cp` it (or the curated subset) into `01_raw/<slug>/`. If it's a git repo,
     record the commit (`git -C <path> rev-parse HEAD`).
   - **Pasted text** → write it to `01_raw/<slug>/…` verbatim.
   - Append a provenance entry to `01_raw/SOURCES.md` (path, what was copied/excluded, date, commit).
2. **Read it.** Write a **factual** summary in `02_sources/source-summaries/<slug>.md`
   (no interpretation — that goes in concept/synthesis pages). Optionally a source-map.
3. **Verify before asserting** ([[no-trust-validation]]): if the source makes empirical claims,
   check them against the raw material; record conflicts as `03_wiki/contradictions/` pages
   (never silently resolve).
4. **Build/update ~10–15 wiki pages** the source touches (concepts/entities/systems/skills/
   patterns), each with full YAML frontmatter and heavy `[[wikilinks]]`. Forward-links to
   not-yet-written pages are fine.
5. **Update `index.md`** (catalog every new page) and **append `log.md`**
   (`## [<date>] ingest | <source>`).
6. **Regenerate the graph**: `python3 07_visualizer/build_graph.py <date>`.
7. Report: what was staged, the pages created, any contradictions, and the new graph counts.
Pause for review rather than doing everything at once if the source is large.
