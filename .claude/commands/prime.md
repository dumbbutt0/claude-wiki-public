---
description: Prime a focused workspace for a goal — assemble the relevant subgraph (projects, concepts, capabilities, pipelines, decisions, outcomes, blueprints, open questions) into an ephemeral session bundle, reason inside it, then promote durable discoveries. The "active" context engine.
argument-hint: "[goal]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(date:*), Bash(mkdir:*), Bash(python3 tools/eye_state.py:*)
---

You are the **context engine** ([@CLAUDE.md](../../CLAUDE.md); see [[context-priming]]).
Today: !`date +%F`. Goal: **$ARGUMENTS**

Turn `question → search → answer` into `prime → assemble → reason → persist → discard`:

0. **Semantic seed:** `python3 tools/semantic_index.py --query "$ARGUMENTS" --n 15` → the most *semantically* relevant nodes (meaning, not just keywords). This is the ranked seed set; then:
1. **Retrieve.** Read `index.md`. Grep/Glob the goal + obvious synonyms across `02_sources/`,
   `03_wiki/`, `04_synthesis/`, `05_blueprints/`. Collect candidate pages.
2. **Rank** by relevance: graph proximity to the seed matches (follow `[[wikilinks]]`/`related:`),
   shared `mode:`, and type priority (projects/systems → concepts/capabilities/pipelines →
   decisions/outcomes → blueprints/questions). Keep the focused set; drop the rest.
3. **Assemble.** Write `09_working/session-<slug>.md` from `06_templates/session-template.md`,
   filling each section with the ranked `[[links]]` and a one-line "why it's in scope." This is the
   workspace — a focused subgraph, not all 200 pages.
4. **Reason inside it.** Produce a focused answer/plan grounded *only* in the assembled set, citing
   pages. If a [[blueprint]] matches the goal, point to it; if none does, draft the plan.
5. **Persist discoveries.** Anything durable (a real insight, a reusable plan, a recorded choice)
   → promote to a permanent page (`/blueprint`, a `04_synthesis/` page, `/decision`, `/record-outcome`),
   updating `index.md`/`log.md`/graph. Everything else stays in the ephemeral session file.
6. **Build the conversation eye.** Write `09_working/_focus.md` — a note that materializes *this*
   conversation as a native eye. Format:
   ```
   # 🎯 <goal>
   *Ephemeral focus for the Local Graph eye — regenerated each /prime. git-ignored.*

   - [[most-relevant-page]]
   - [[next-most-relevant]]
   - … (ranked from step 2; ~8–20 links)
   ```
   **Drive the living eye** (if the Wiki Eye plugin is open): run
   `python3 tools/eye_state.py --goal "<goal>" --status primed --focus <most-central page id> --active <comma-separated relevant page ids>`
   — the eye **focuses to the goal** (active nodes move inward, the rest fade, pupil shows the goal).
   Then tell the user: **open `09_working/_focus.md` → "Open local graph"** — that note is the **pupil**
   and the linked relevant pages **ring out** around it = the eye for this conversation. (Set Local Graph
   depth to 1–2; see [[eye-layout-spec]].) Honest: Local Graph is force-directed, so the *set* and *centre*
   reflect the conversation but it won't rank pages by distance.
7. **Discard.** Remind: `09_working/*` (incl. `_focus.md`) is git-ignored scratch — overwritten next
   `/prime`; not a source of truth.

Honest scope: this is structured retrieval + assembly that *focuses* reasoning — real and useful, not
a separate cognitive process. Be honest about gaps — if the wiki barely covers the goal, say what to
`/ingest` first.
