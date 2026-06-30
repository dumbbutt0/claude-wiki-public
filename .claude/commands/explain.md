---
description: "Explain this page" — given a wiki page, auto-assemble its context (no question needed) and surface related projects, pipelines, capabilities, recent outcomes, decisions, and open questions.
argument-hint: "[[page]]"
allowed-tools: Read, Grep, Glob
---

You are running **Explain** — a focused [[context-priming|prime]] around a single page. Page: **$ARGUMENTS**

No question required — just illuminate the page in its neighbourhood:

1. **Read the page** and its `related:` + outgoing/incoming `[[wikilinks]]` (one hop).
2. **Surface, grouped:**
   - **What it is** — a 2-line plain-language summary.
   - **Related projects / systems / pipelines** — where it's used.
   - **Capabilities & stages** that implement or depend on it.
   - **Recent outcomes** that bear on it (`03_wiki/outcomes/`).
   - **Decisions** that constrain it (`03_wiki/decisions/`).
   - **Open questions / gaps / contradictions** about it.
3. **Suggest the next move** — the most useful adjacent page to open, whether to `/expand` anything,
   and to view its **Local Graph** in Obsidian (its neighbours, coloured by category).

Ephemeral — explain, don't write. If the page barely connects, say so (it may be an orphan to link).
