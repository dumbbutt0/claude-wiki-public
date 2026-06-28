---
title: Three-Layer Zero-Trust Audit Architecture
aliases: ["Three-Layer Zero-Trust Audit Architecture", "three-layer-zero-trust-audit", "zero-trust auditing framework"]
type: pattern
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [security-research, architecture, agents, mcp, pattern]
related: ["specialist-agents", "audit-pipeline", "[[determinism-at-the-authority-boundary]]", "[[orchestration-governor]]", "[[reject-first-precision]]", "[[safe-post-run-sync]]"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-05-15-smart-contract-auditing-framework (architecture abstraction; a specific bounty submission in the same convo kept local)"]
---

# Three-Layer Zero-Trust Audit Architecture

An LLM-driven smart-contract audit system (built on an agent runtime + sub-agents + MCP + static tools) is strongest
as **three layers that don't trust each other**, plus a hardening shell. No single layer is authoritative — each
backstops the one above ([[reject-first-precision]]).

## Layer 1 — Semantic state & architecture (AI multi-agents)
The cognitive wave: map **developer intent vs actual behaviour**, isolate state machines and access-control semantics
**without** relying on regex patterns. Orchestrate parallel **specialist agents** per bug class (reentrancy incl.
EIP-1153 transient storage, ERC-4626 inflation vectors, token-blacklisting anomalies). *(see specialist-agents;
governed, not analyzed-by, an [[orchestration-governor]].)* Public skills exist here (QuillShield BSA/Semantic-Guard,
senior-researcher risk-matrix skills, 5–7-agent multi-audit skills).

## Layer 2 — On-chain context & data synthesis (MCP servers)
LLM logic alone misses **economic / flash-loan / oracle** exploits — feed it **live chain context** via MCP: tx
history + failed-path simulation + bytecode (e.g. an EVM MCP), TVL/slippage/health for game-theoretic threat modeling
(analytics MCP), and historical subgraph state to check variable changes over time. Context is what turns "looks
suspicious" into "reachable + economically real."

## Layer 3 — Hard rules & static verification (hybrid tooling)
AI hallucinates and misses syntax-driven bugs, so a **deterministic backstop** runs underneath: static dataflow/CFG
(Slither/Mythril) fed into the agent, cross-repo **variant analysis** (Glider) to find matches of a newly-isolated
bug, and a native security-review pass for secrets/dependencies/glaring access-control. This is
[[determinism-at-the-authority-boundary]] applied to the audit verdict.

## Hardening shell — zero-trust guardrails
Because the agent runs locally **with execute permissions**, the pipeline must be **sandboxed against prompt injection
from untrusted source code**: permission-containment fences around sub-agent processes, hardened/validated MCP inputs,
and dev-container network/filesystem isolation. Treat the audited code as hostile input — the same isolation discipline
as [[safe-post-run-sync]]. This is the concrete instantiation of the audit-pipeline as a *zero-trust* system.
