---
title: Deep-Mine a Conversation
aliases: ["Deep-Mine a Conversation", "deep-mine-conversation"]
type: skill
status: active
created: 2026-06-28
updated: 2026-06-28
sources: ["karpathy-llm-wiki"]
source_count: 1
tags: [skill, meta, wiki-maintenance, learned]
related: ["mine-conversation", "autonomy-policy", "expanding-answer-base", "ingest-query-lint-loop", "conversion-labeling"]
iris_ring: middle
mode: meta
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.7
privacy_scope: public_system
graph_scope: public
provenance: ["the wiki's own /mine-conversation + claim-level steward procedure (self-referential)"]
---

# Deep-Mine a Conversation  ·  *skill (the wiki's own learn-as-we-go loop)*

**When to use:** turning a captured raw conversation (e.g. a ChatGPT-export idea-dot) into **compounding linked
knowledge** — the distill step Karpathy's LLM-wiki is built on, and the fix for the
capture-to-distill backlog.

**Procedure (claim-level, privacy-scoped — see autonomy-policy):**
1. **Read the raw body** (immutable, in `01_raw/`). Identify the *durable, reusable* ideas vs operational chatter.
2. **Extract abstractions, not specifics.** For each durable idea write a tight, well-linked page: `concept` /
   `capability` / `pattern` / `skill` / `synthesis`. Generalize — strip sensitive/identity specifics.
3. **Route by privacy:** reusable methodology → `public_system` (committed); personal/self-model → `local/`
   (`local_private`); private/sensitive specifics → `restricted/` (`restricted_private`); external/impact
   decisions or unverified external facts → quarantine (`09_working/requires-human-review/`).
4. **Link generously** into existing pages (the value is the cross-references, not the page count). Add aliases.
5. **Self-approve T0–2; quarantine T3.** Append a steward-ledger entry (provenance · tier · checks · rollback).
6. Mark the conversation processed; regenerate the graph (`build_graph.py --scope both`); run a scoped lint.

**Inputs:** one raw conversation. **Outputs:** 1–N linked wiki pages (+ private/restricted/quarantine as needed) +
a ledger entry. **Rule of thumb:** depth + linking over volume — one richly-linked page beats five stubs.
**Learned-from:** restarting the 9:1 distill backlog; this skill *is* the recurring engine (see ingest-query-lint-loop).
