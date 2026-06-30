---
description: List and traverse what the system can DO — the capability layer (Inputs/Outputs/Used-by). Grouped by project; shows how to compose capabilities into a workflow.
argument-hint: "[filter: project or mode (optional)]"
allowed-tools: Read, Grep, Glob
---

Survey the **capability layer** ([@CLAUDE.md](../../CLAUDE.md) §6). Filter: **$ARGUMENTS** (optional).

1. List the pages in `03_wiki/capabilities/` (filter by `mode:` or `Used by` if an argument was given).
2. For each, show: **name** · inputs → outputs · **Used by** (project) · status (built/partial/aspirational).
3. Group by project, and note how they **compose** (e.g. ingest-source → validate-claim →
   generate-artifact is a full research workflow; design-stage → plan-step is a build workflow).
4. Surface **gaps**: capabilities that are `partial`/`aspirational`, and obvious missing ones a
   project would want.

This is how an agent discovers workflows by traversing the graph rather than being told them.
Don't invent capabilities — only report what's recorded (add new ones via `/blueprint` or directly).
