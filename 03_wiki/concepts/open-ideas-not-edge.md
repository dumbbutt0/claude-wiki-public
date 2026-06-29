---
title: Open the Ideas, Not the Edge
aliases: ["Open the Ideas, Not the Edge", "open-ideas-not-edge", "open source the ideas not the edge"]
type: concept
status: active
created: 2026-06-28
updated: 2026-06-28
review_due: 2026-06-28
interval: 0
ease: 2.5
review_attempts: 0
sources: []
source_count: 0
tags: [strategy, disclosure, privacy, reputation]
related: ["autonomy-policy", "public-portfolio-engine", "novelty-originality-gate", "personal-operating-system", "[[operator-and-hermes]]"]
iris_ring: middle
mode: life-strategy
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-21-open-sourcing-hacking-tools (methodology abstraction)"]
---

# Open the Ideas, Not the Edge

The disclosure principle for a competitive research practice: **publish the methodology, keep the alpha.** Anything
you build has three layers, each with a different sharing rule:

| layer | examples | rule |
|---|---|---|
| **1. Philosophy & methodology** | *"how I reduce false positives," "why exploit verification beats finding volume," a triage checklist, lessons from building an agentic loop* | **safe to publish** — builds credibility, gives away no edge |
| **2. Frameworks & sanitized workflows** | report templates, scoring rubrics, eval methodology, harness-writing patterns, false-positive taxonomies, toy/CTF benchmarks | **share selectively** — attracts collaborators, signals seriousness |
| **3. The actual alpha** | bug-surfacing prompts, ranking logic, automation glue, corpus labels, verifier architecture, exploit-gen loops, target-selection heuristics, the resolved-bounty corpus | **keep private** — this is what turns directly into money |

> **Blog the journey and results, not the machine.** Share case studies *after* reports resolve, show failure modes,
> show how you think about verification. Become known for **taste and rigor**, not just tooling — that earns
> reputation, invites, and paid work without handing everyone your weapon.

## This *is* the wiki's dual-scope architecture
This principle is exactly why the system graphs everything locally but publishes only the system
logic: `graph-public.json` is Layer 1–2 (the shareable methodology — concepts, patterns, capabilities, skills);
`graph-local.json` + `restricted/` hold Layer 3 (the edge — never committed/exported). The public allowlist *is* the
"open the ideas, not the edge" rule, enforced mechanically. Pairs with the public-portfolio-engine (turn resolved
work into credibility) and novelty-originality-gate (don't burn novel edge prematurely).

**Practical hygiene (Layer-3 storage):** keep the private archive on an encrypted local disk + one encrypted backup,
never in a public repo or un-encrypted cloud sync — the same boundary the wiki enforces with `.gitignore`.
