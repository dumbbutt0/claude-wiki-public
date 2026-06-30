---
description: Record the outcome of a completed run (experiment, build, run, paper) as a memory page — what happened, the lesson, the reusable pattern, linked capabilities, projects affected. Compounds into a dataset.
argument-hint: "[what happened / which run]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(date:*), Bash(python3 07_visualizer/build_graph.py:*)
---

Record a **memory / outcome** ([@CLAUDE.md](../../CLAUDE.md) §6). Today: !`date +%F`.
Run: **$ARGUMENTS**

1. Gather the facts — verified figures only ([[no-trust-validation]]); if a number is unconfirmed,
   say so. Don't fabricate.
2. Write `03_wiki/outcomes/<slug>.md` from `06_templates/outcome-template.md`: what happened ·
   metrics · mistakes · **lesson** · **reusable pattern** (link it) · **linked capabilities**
   (`03_wiki/capabilities/`) · **projects affected** (link the next-action blueprint).
3. **Wiki-only boundary**: this records into the wiki and *points to* the project's own
   record-keeping (e.g. the project's own record-keeping) — it does **not**
   write outside `Claude-Wiki/`. Remind the user to log it in the project too if relevant.
4. Update `index.md` (Outcomes), append `log.md`, and regenerate the graph
   (`python3 07_visualizer/build_graph.py <date>`).
5. Report the lesson + the one action it implies.

The value is cumulative — after many outcomes this folder is a dataset more useful than any single run.
