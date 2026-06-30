---
description: Produce a forward-looking blueprint (skill / project / pipeline / content / research / decision) grounded in the wiki, and file it under 05_blueprints/. Follows CLAUDE.md §10.
argument-hint: "[skill|project|pipeline|content|research|decision] [topic]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(date:*), Bash(python3 07_visualizer/build_graph.py:*)
---

You are running the **blueprint workflow** ([@CLAUDE.md](../../CLAUDE.md) §10). Today: !`date +%F`.
Request: **$ARGUMENTS** (first word = kind, rest = topic).

1. **Gather evidence** from the wiki: read `index.md`, then the relevant concept/project/
   synthesis pages and the [[skill-tree]] for the topic. A blueprint must be *justified by*
   wiki pages, not invented.
2. **Draft the blueprint** from `06_templates/blueprint-template.md` into
   `05_blueprints/<slug>.md` (or update an existing one). Include: trigger, the recommendation,
   concrete steps, the justification (linked `[[evidence]]`), effort/payoff, and a status.
   Be honest about what's unbuilt or speculative.
3. **Wire it in**: add it to `index.md` (Blueprints) and `04_synthesis/project-blueprints.md`
   (the rollup), append `log.md`, and regenerate the graph
   (`python3 07_visualizer/build_graph.py <date>`).
4. Report the recommendation and its top move.

If `kind` is `decision`, also create the matching `03_wiki/decisions/` page from
`06_templates/decision-template.md` and link them.
