---
description: Record an architecture/design decision (Rust vs TS, MCP vs native, …) so the reasoning persists instead of vanishing into chat — Problem, Options, Decision, Why, Tradeoffs, Revisit, Superseded-by.
argument-hint: "[the decision / problem]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(date:*), Bash(python3 07_visualizer/build_graph.py:*)
---

Record a **decision** ([@CLAUDE.md](../../CLAUDE.md) §11). Today: !`date +%F`. Topic: **$ARGUMENTS**

1. Clarify the **problem** and the real **options** (with honest pros/cons). If the user already
   stated the choice, capture it; otherwise lay out the tradeoffs and ask which they're taking.
2. Write `03_wiki/decisions/<slug>.md` from `06_templates/decision-template.md`: Problem · Options ·
   Decision · Why · Tradeoffs · **Revisit** (date/trigger) · **Superseded by** (`none (current)`) ·
   **Related projects**.
3. If this **supersedes** an existing decision, set that page's `superseded_by:` to point here
   (don't delete the old one — the history is the value).
4. Update `index.md` (Decisions), append `log.md`, regenerate the graph.
5. Report the decision in one line so "why did we do X?" now has an answer.
