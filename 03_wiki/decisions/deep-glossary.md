---
title: Deep glossary — web-researched across fields
aliases: ["Deep glossary — web-researched across fields", "deep-glossary", "glossary policy"]
type: decision
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [decision, glossary, learning, privacy, web-research]
related: ["[[click-to-learn]]", "[[open-ideas-not-edge]]", "[[conversion-learning]]", "[[long-horizon-agent-loops]]"]
revisit: when a field's glossary is dense enough to promote generic entries to public_system
superseded_by: none (current)
iris_ring: middle
mode: meta
privacy_scope: public_system
graph_scope: public
---

# Deep glossary — web-researched across fields

## What
A growing glossary of **topics, techniques, and methodologies** across the owner's fields (offensive security,
AI engineering, crypto/DeFi, …) — each a **deep, sourced** entry written to *learn from*. Grown by [[click-to-learn]]:
clicking a node now triggers web research that distils the generalizable craft into a glossary entry. First exemplar:
erc-4626-inflation-attack.

## Decision — web research IS allowed on sensitive topics, with one hard boundary
Originally click-to-learn web-searched only general/AI subjects and **skipped** sensitive ones. New policy: **research
any topic, including offensive-security ones** — but query the **generalizable subject matter** (the bug class, the
technique, the protocol mechanics, the methodology), **never the owner's private identifiers** (specific
target / contest / finding names, contract addresses).

> Web research pulls knowledge **IN**; this boundary keeps the edge from leaking **OUT**. The query goes through the
> public craft (*"ERC-4626 inflation attack"*), never the private hunt (*"<target> <finding-id>"*). This is
> [[open-ideas-not-edge]] applied to the search box — and it fully serves "expand my knowledge," because what deepens
> the craft is the public technique, not the owner's own finding ID.

## Privacy default
Glossary entries default to **`local_private`** (`local/glossary/`) — the owner's personal learning corpus: in the Eye,
**not** auto-published. Generic, edge-free entries can be **promoted to `public_system`** later. This expands knowledge
without publishing the whole learning agenda.

## Entry shape
definition (one line) · mechanism · the menu (mitigations / variants / trade-offs) · **how to apply or spot it** (why
it's worth learning) · real-world · **sources** (URLs). Sourced + `claim_class: factual` where the web supports it.

## Relates
[[click-to-learn]] (the trigger) · [[open-ideas-not-edge]] (the boundary) · [[conversion-learning]] (turning a read
into a usable skill) · [[long-horizon-agent-loops]] (the loop that grows it).
