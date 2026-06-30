---
description: Compose a NEW system design from reusable pipeline fragments — assemble stages for a goal, map them to existing capabilities/projects, and run the gap detector (what capability/knowledge/data/validation/benchmark/outcome-history is missing). Outputs a design proposal, not a note.
argument-hint: "[goal / system idea]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(date:*), Bash(mkdir:*), Bash(python3 tools/eye_state.py:*)
---

You are the **composition engine**. Today: !`date +%F`. Idea: **$ARGUMENTS**

Don't search for a matching project — **assemble** a design from the stage library
(`03_wiki/stages/`), interfaces (`03_wiki/interfaces/`), and capabilities (`03_wiki/capabilities/`).
Model: the [[reference-agentic-pipeline]].

1. **Decompose the goal** into the stages it needs (observe / map-context / generate-candidates /
   score / validate / human-review / learn — add/rename as the goal demands).
2. **Assemble** the sequence and **type-check** it: each stage's output [[interface]] must match the
   next stage's input. Flag any interface mismatch.
3. **Map to what exists** — for each stage, name the [[capability]] that could implement it and the
   [[project]] that already does something similar (reuse, don't reinvent).
4. **Run the gap detector** — for the design, list what's **missing**, by kind:
   missing **capability** · **knowledge** · **data** · **validation** · **benchmark** · **outcome-history**.
   Check `03_wiki/gaps/` for known gaps; surface new ones.
5. **Write the proposal** to `09_working/compose-<slug>.md`: goal · assembled stage sequence ·
   capabilities/projects referenced · **gaps (with a recommended blueprint each)** · open questions ·
   suggested research/next sources to ingest.
6. **See it in Obsidian.** List the stages / capabilities / gaps used so the user can open them in
   Obsidian; the Local Graph shows how they connect (colour = category; see [[eye-layout-spec]]).
   **Pulse the living eye** (if Wiki Eye is open): `python3 tools/eye_state.py --goal "<goal>" --status composing --pipeline <comma-separated stage ids in order> --active <capability/project ids>`
   — the reasoning **pulses stage-by-stage** through the assembled pipeline.
7. **Promote** durable gaps → a `03_wiki/gaps/` page; a green-light design → a `/blueprint project`.
   The compose file itself is ephemeral ([[context-priming]]).

Honest scope: this is structured composition + retrieval that *proposes* a design and names what's
missing — a real engineering-copilot move, not a formal synthesizer. Be candid about low-confidence
stages and big gaps; a design that's 60% missing should say so.
