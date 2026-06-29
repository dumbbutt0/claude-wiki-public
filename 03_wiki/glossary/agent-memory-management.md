---
title: "Agent memory management (glossary)"
aliases: ["Agent memory management", "agent long-term memory", "context window management", "agent-memory-management"]
type: glossary
field: ai-engineering
status: active
created: 2026-06-28
updated: 2026-06-28
review_due: 2026-06-28
interval: 0
ease: 2.5
review_attempts: 0
sources:
  - "https://aiagentmemory.org/articles/llm-memory-system/"
  - "https://arxiv.org/pdf/2508.07407"
  - "https://github.com/Shichun-Liu/Agent-Memory-Paper-List"
source_count: 3
tags: [glossary, ai-engineering, agents, memory]
related: ["[[long-horizon-agent-loops]]", "retrieval-augmented-generation", "persistent-knowledge-base", "[[agent-loop]]"]
iris_ring: outer
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: factual
confidence: 0.85
privacy_scope: public_system
graph_scope: public
provenance: ["/study web research (click-to-learn, 2026-06-28) on [[long-horizon-agent-loops]]"]
---

# Agent memory management  *(glossary · web-researched)*

**One line:** how an agent retains information beyond its fixed context window — **short-term** (within a session) vs
**long-term** (across sessions) — so a long-horizon task doesn't forget. The practical face of *"state outside the
context window"* in [[long-horizon-agent-loops]].

## The menu (how agents remember)
- **Summarization (abstractive):** compress raw history into concise text. *Hierarchical/recursive* summarization
  (à la Generative Agents) keeps a high-level reflection in working memory and detailed logs in long-term storage.
- **Retrieval (RAG):** externalize info to a store; fetch by similarity at query
  time. **GraphRAG** builds entity-document graphs to capture structural dependencies (this wiki's graph is that idea).
- **Long-context models:** simply fit more in the window (frontier models now ~400k tokens) — buys headroom, not
  unbounded memory; cost/attention still degrade.
- **Agent-centric memory:** the agent *itself* decides what to write and retrieve (vs a fixed RAG pipeline) — the 2025
  shift toward self-managed memory.

## How to apply
- Treat the window as **cache**, an external store as **disk** — exactly the [[long-horizon-agent-loops]] principle.
- This wiki uses **GraphRAG-style** memory: the persistent-knowledge-base / graph *is* the agent's long-term store;
  each loop iteration loads a slice, acts, writes back.
- Pick by horizon: short tasks → summarize; cross-session knowledge → retrieval over an external graph/DB.

## Sources
[LLM memory system overview](https://aiagentmemory.org/articles/llm-memory-system/) ·
[Self-Evolving AI Agents survey (arXiv 2508.07407)](https://arxiv.org/pdf/2508.07407) ·
[Agent-Memory paper list](https://github.com/Shichun-Liu/Agent-Memory-Paper-List)
