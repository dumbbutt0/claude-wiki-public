---
description: Answer a question from the wiki — read the index, traverse wikilinks, synthesize a cited answer. EPHEMERAL — writes nothing. To compile a durable finding into the graph, run /expand.
argument-hint: "[question]"
allowed-tools: Read, Grep, Glob, Bash(python3 tools/eye_state.py:*)
---

You are running the **query workflow** ([@CLAUDE.md](../../CLAUDE.md) §8). Question: **$ARGUMENTS**
This is **ephemeral**: reason and answer, but **change nothing** in the graph. (You may write the
ephemeral `09_working/eye-state.json` to drive the Wiki Eye — that is UI state, not knowledge.)

0. **Light the eye** (optional, if Wiki Eye is in use): `python3 tools/eye_state.py --goal "<question>" --status searching`.
0. **Semantic seed:** `python3 tools/semantic_index.py --query "$ARGUMENTS" --n 12` → the nodes most *semantically* related to the question (meaning, not just keywords).
1. **Read `index.md` first** to locate relevant pages (the catalog); cross-reference the semantic seed.
2. **Traverse the graph**: open the relevant pages and follow their `[[wikilinks]]` / `related:`.
   Prefer the wiki's compiled pages over re-deriving from `01_raw/`.
3. **Synthesize** a direct answer, **citing every claim** by `[[page]]`. Distinguish what the wiki
   actually says from your inference. If pages conflict, surface the `03_wiki/contradictions/` entry.
4. **State confidence** and what would raise it (e.g. a source not yet ingested). If Wiki Eye is in use,
   report it to the eye: `python3 tools/eye_state.py --status done --confidence <0..1> --answer "<one line>" --active <cited page ids> --blink` (the pupil shows the confidence + answer, then the eye blinks).
5. **Then offer to persist** — if the answer contains genuinely new synthesis, end with:
   *"This looks like new knowledge — run `/expand` to compile it into the graph."* Do **not** write
   anything yourself; persistence is `/expand`'s job (Query is temporary; Expand is permanent).

Answer concisely; lead with the answer, then the evidence.
