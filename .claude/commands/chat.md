---
description: Answer the in-Obsidian chat — drain user messages, act (find / research / build / write artifacts), narrate to the Lens, and reply. Tiered auto-write; privacy-scoped.
argument-hint: "[--drain]"
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(python3:*), WebSearch
---

You are answering the **Obsidian chat panel** — the human is talking to you from inside the Lens. Argument: **$ARGUMENTS**

## Drain
1. `python3 tools/chat_drain.py` → pending user messages (oldest first, `id<TAB>text`). If none, say so and stop.
2. Handle each in order. For each message:

### a. Classify intent
One of: **find** (locate a node/fact) · **internal research** (synthesize from the wiki) · **external research**
(web) · **develop-system** (improve the wiki/tools) · **write artifact** (idea / paper / blueprint / project) ·
**life-optimize** (personal/strategy). Pick the dominant one; a message can need several.

### b. Narrate to the Lens *as you work* (so the human watches it happen)
`python3 tools/eye_state.py --status searching --building "<short: what you're doing>" --focus <node> --active "<relevant node ids>" --edges "<a|b,c|d>"`
(use `--status composing` when writing/building). The matching pathways glow live.

### c. Act — reuse the existing machinery
- **find / internal** → `/recall` or `/query` over the wiki (cite `[[pages]]`).
- **external** → `WebSearch`/`WebFetch`; pull knowledge IN (never put the owner's private private identifiers in a query — [[deep-glossary]]).
- **develop-system / write artifact** → compose the page(s): concept / `05_blueprints/<x>` / paper / skill. **Auto-write,
  tiered** (CLAUDE §18): Tier 0–2 save directly; Tier 3 (public-facing claims, identity, irreversible, legal/financial/
  medical, anything uncertain) → `09_working/requires-human-review/` and say so.
- **Privacy scope every write:** personal / life-optimize → `local_private` (`local/`); private specifics →
  `restricted_private` (`restricted/`); only fully-generalizable methodology → `public_system`. **Never publish personal
  or edge content.** Leakage-gate any `public_system` write; rebuild + `verify.js` if a public page changed.

### d. Reply
`python3 tools/chat_drain.py --reply <id> --text "<your answer — concise, conversational>" --refs "<nodeIds the human can click>" --artifacts "<paths you created/edited>"`
The Lens renders it with clickable node-refs (focus the Eye) + artifact links (open the note).

### e. Clear the glow when the batch is done
`python3 tools/eye_state.py --status idle` (or `--reset`).

## Notes
- **Honest limit:** this only runs when a Claude session/loop is live — the chat-loop (`/loop` with a Monitor on
  `chat-inbox.jsonl`) is that engine; near-instant while running, queued when not ([[operator-and-hermes]]).
- Optimize the owner's life **in their image** — write freely, but *locally* for anything personal. Cf. [[living-lens-and-chat]] (Phase 4).
