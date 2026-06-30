---
description: Expand my knowledge on a clicked subject — research it, grow the graph, surface studyable concepts/questions/projects
argument-hint: [subject | --drain (process the Eye click-queue)]
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(python3:*), WebSearch, Bash(node .claude/skills/eye-cases/verify.js:*)
---

# /study — turn a click into background learning

The **click-to-learn** loop ([[click-to-learn]]): when you click a node in the Cognitive Lens, the Eye appends a
learning intent to `09_working/learning-intent-queue.jsonl`. `/study` drains that queue (`--drain`, via
`tools/study_drain.py`) or takes an explicit `[subject]`, and **expands your knowledge on the subject** so the graph
blooms around it — *by the time you open the note, fresh connectivity has appeared.*

## Per subject — two waves

### Wave 1 · internal (instant — ready by the time you open the note)
1. **Prime** the subject (reuse `/prime`): read its page + neighbours + related outcomes/decisions/gaps; assemble context.
2. **Generate from what you already know** (reuse `/mine-conversation` extraction):
   - **open questions** → `03_wiki/questions/<q>.md` (`type: question`, `iris_ring: pupil`) — *"what would deepen this?"*
   - **missing-connection links** `[[a]] ↔ [[b]]` between the subject and related pages
   - **study-directions + project seeds** → `05_blueprints/<subject>-study-plan.md` (`blueprint`, research/skill kind)
3. **Write Tier-1**, claim-level. **PRIVACY (CLAUDE §18): new pages are ALWAYS `local_private` with their real domain
   `mode` — NEVER `public_system`, NEVER `mode: meta`.** Publishing is a human-only action; this command is autonomous,
   so it stays local. (personal→`local/`, edge-specifics→`restricted/`.) Update `index.md`/`log.md` + [[steward-ledger]];
   **regenerate** `build_graph.py --scope both`.
4. **Bloom the Eye:** `python3 tools/eye_state.py --status expanding --new <new-ids> --focus <subject>`.

### Wave 2 · web (background — deepens over the next minutes; only if `depth` includes web)
5. **WebSearch/WebFetch** the subject → distil genuinely-new, **sourced** facts into `03_wiki/concepts/<c>.md`
   (sources cited; **always `local_private`** — autonomous writes are never public). Web pulls knowledge **in** — nothing leaks out.
   Append to the subject's cluster, regenerate, bloom again.

## Safety + scope ([[CLAUDE]] §18/§20)
- Self-approve **Tier 0–2** (questions, links, study-plans, sourced concepts); **quarantine Tier 3** (identity /
  unverified hard claims / anything risky). Never fabricate; mark uncertain `tentative`. **Leakage-gate** any committed page.
- `--drain`: `python3 tools/study_drain.py --n 3` → process each subject → `--mark` done. The running steward loop calls
  `/study --drain` each iteration; the opt-in `tools/steward_cron.sh` does the night-shift.

## Result
The subject gains **new questions, new connections, and a study-plan** — a plethora of studyable ideas to spawn
projects. Wires **visual (click) → tool use (research) → questions/ideas**. See [[click-to-learn]] · [[expanding-answer-base]].
