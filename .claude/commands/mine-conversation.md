---
description: Mine a conversation for durable knowledge — segment it, classify each segment (architecture/research/engineering/support/logistics), extract concepts/decisions/questions/roadmap, diff against the graph, and propose a changeset to apply (via /expand discipline). Learns from thinking, not just documents.
argument-hint: "[path | --pending] [--propose-only]  (or paste the conversation)"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(date:*), Bash(mkdir:*), Bash(cp:*), Bash(python3 tools/extract_dialogue.py:*), Bash(python3 07_visualizer/build_graph.py:*)
---

You are the **conversation miner** ([@CLAUDE.md](../../CLAUDE.md); see [[mine-conversation]] capability,
[[gap-conversation-mining]]). Today: !`date +%F`. Source: **$ARGUMENTS**

A conversation is a **reasoning trace** ([[2026-06-27-ai-os-genesis]] is one). Mine only the durable,
high-value parts — and **propose, never auto-write** ([[expanding-answer-base]]).

1. **Load.** If the source is a `.jsonl` Claude transcript →
   `python3 tools/extract_dialogue.py <path> 09_working/_mine-src.md` then read that. If a `.md`/`.txt`
   → read it. If pasted text → use it directly.
2. **Segment** the conversation into topical chunks.
3. **Classify** each segment — `architecture` · `research` · `engineering` · `support` · `logistics` ·
   `chatter`. Only `architecture` / `research` / `engineering` are candidates for the wiki; **discard**
   support/logistics/chatter (e.g. WSL cleanup, export steps) — say what you dropped and why (no silent truncation).
4. **Extract** from the keep segments: concepts · decisions · open questions · roadmap/blueprints ·
   outcomes · gaps.
5. **Diff against the graph** (Grep/Glob + read like `/recall`). Drop anything already captured; apply
   [[no-trust-validation]] — don't invent. This is the anti-bloat step.
6. **Propose** to `09_working/mine-<slug>.md`: a table `segment · class · keep/discard · extracted items`,
   then a typed changeset (concept / update / decision / blueprint / outcome / gap / links) — exactly the
   [[expanding-answer-base|/expand]] format.
7. **Apply on approval only.** If the conversation itself is worth keeping, stage it immutably in
   `01_raw/design-conversations/<slug>/` (+ `SOURCES.md`); create the approved pages from `06_templates/`;
   update `index.md` + `log.md`; regenerate the graph. Small, reviewable batches.

## Flags
- `--propose-only` — stop after writing `09_working/mine-<slug>.md` (the changeset). **Never** apply or write to
  `03_wiki`, `01_raw`, `index.md`, or `log.md`. (This is already the default posture; the flag makes it explicit/forced.)
- `--pending` — drain the auto-capture queue `09_working/mining-queue.txt` (written by the SessionEnd hook
  `tools/capture_session.py`). For each captured `01_raw/design-conversations/<slug>/`, read its `conversation.md`,
  run steps 2–6, and write **one proposal** `09_working/mine-<slug>.md`. On approval of a given capture: apply
  (step 7), set `mined: true` in that capture's `metadata.yaml`, and remove its line from the queue. With
  `--propose-only`, propose for every pending capture and stop (no writes beyond `09_working/`).

## The auto-capture flow (raw → propose → approve)
The SessionEnd hook captures every wiki session as **raw only** (`tools/capture_session.py` → conversation.md +
metadata.yaml + git-ignored `transcript.full.jsonl`, enqueued); a SessionStart reminder (`tools/pending_captures.py`)
shows the backlog. **Mining is a separate, human-gated step** — a hook is a shell command and cannot run an LLM, so
nothing reaches `03_wiki` without your approval. Decision: [[conversation-capture-hook]].

This is a [[conversation-mining-pipeline]] instance: [[observe]] (load) → [[map-context]] (segment+classify)
→ [[generate-candidates]] (extract) → [[validate]] (genuinely new?) → [[human-review]] (approve) →
[[learn]] (compile in). Honest: classification is heuristic; the human decides.
