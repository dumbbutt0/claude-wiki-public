---
description: View or refine your living self-model — the spine the system steers by (north-star, direction, skills, taste, aversions, patterns, desires). Tentative, local-only.
argument-hint: "[--show | refine | a note about yourself]"
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(python3:*)
---

You are tending the **self-model** ([[self-model]]) — the living model of who the owner is + becoming. Arg: **$ARGUMENTS**

## `--show`
`python3 tools/self_model.py --show` → print the assembled model. Summarise it in a sentence.

## refine  (or when the arg is a note about the owner)
1. **Gather signals:** read `local/self-model/self-model.md` + recent evidence — latest `/record-outcome` pages,
   reviews, the chat (`09_working/chat-*.jsonl`), recent `log.md` entries, and the owner's note if given.
2. **Propose tentative refinements** (Tier 1, `local_private`, `claim_class: tentative`): a sharpened direction, a skill
   with fresh evidence (bump confidence only on recurrence ≥2–3), a new taste/aversion, a recurring cross-domain
   pattern, a desire. **Identity claims → Tier 3 (quarantine)** — never harden a tentative direction into a fixed
   identity without the owner; hedge and promote only on recurrence.
3. **Apply:** edit the relevant section of `self-model.md` (+ bump `updated:`), then `python3 tools/self_model.py` to
   re-assemble `09_working/self-model.json`. Append one line to `local/self-model/self-model-ledger.md` (what changed ·
   why · evidence).
4. **Report** what shifted, the evidence, and what's still tentative.

## Notes
- **Never public** — the self-model carries personal direction → `local_private` only.
- This is the **spine**: `/prime`, `/steward-pending`, `/chat`, and `auto_orient` read `09_working/self-model.json` to
  aim retrieval + capture at the owner's direction. Keeping it sharp is what keeps the system growing *with* them
  ([[growing-indefinitely]], [[living-lens-and-chat]]).
