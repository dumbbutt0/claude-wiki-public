---
description: Compile the conversation into the graph — detect what was genuinely learned, propose a typed changeset (new concepts / updated pages / blueprint / decision / outcome / links), and APPLY ON YOUR OK. Karpathy's expanding answer-base. The wiki grows from questions.
argument-hint: "[optional: topic or 'the last answer']"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(date:*), Bash(python3 07_visualizer/build_graph.py:*), Bash(python3 tools/eye_state.py:*)
---

You are running **Expand** ([@CLAUDE.md](../../CLAUDE.md); see [[expanding-answer-base]]).
Today: !`date +%F`. Scope: **$ARGUMENTS** (default = the most recent answer/discussion in this session).

Turn ephemeral reasoning into **permanent knowledge** — but only the genuinely new parts, and only
with the user's approval.

1. **Detect what's new.** Restate the durable insight(s) from the recent reasoning. Then **diff
   against the wiki**: Grep/Glob + read the relevant pages (like `/recall`). Discard anything already
   captured. Apply [[no-trust-validation]] — verify claims; don't invent.
2. **Propose a typed changeset** — a checklist, grouped by kind, each line saying *what* and *why*:
   ```
   Expand — proposed changes
     + concept     <name>           — <why it's new>
     ~ update      <existing page>  — <what to add>
     + blueprint   <name>           — <the action it implies>
     + decision    <name>           — <the choice to record>
     + outcome     <name>           — <the run to remember>
     + gap         <name>           — <what's missing>
     + links       [[a]]↔[[b]]      — <the connection>
   ```
   If nothing is genuinely new, **say so and stop** — not every answer expands the graph.
3. **Apply on confirm only.** Ask the user to approve (all / a subset / none). On approval: create/
   patch pages from `06_templates/`, add `[[wikilinks]]`, follow the matching workflow (§7 ingest /
   §10 blueprint / §11 contradiction), update `index.md` + `log.md`, regenerate the graph
   (`python3 07_visualizer/build_graph.py <date>`). Small, reviewable batches. Then **crystallize the new
   knowledge in the living eye** (if Wiki Eye is open): `python3 tools/eye_state.py --status expanding --new <comma-separated new page ids> --blink`
   — the new nodes fly out from the pupil and lock into the iris (watch knowledge become permanent).
4. Report what was compiled in — the wiki just grew from a question.

Never write before the user approves. The value is **discipline**: only real synthesis becomes permanent.
