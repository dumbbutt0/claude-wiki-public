---
title: Codebase Self-Evaluation
aliases: ["Codebase Self-Evaluation", "codebase-self-evaluation"]
type: skill
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [skill, evaluation, ai-engineering, learned]
related: ["[[evaluate-tool-effectiveness]]", "no-trust-validation", "[[reject-first-precision]]", "[[honest-partial-eval]]"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-03-claude-code-evaluation-prompt"]
---

# Codebase Self-Evaluation  ·  *skill*

**When to use:** to get an **honest, grounded** assessment of where a codebase/system actually sits — what's
production-ready vs research-only — from an agent (e.g. Claude Code) run from the repo root.

**The prompt shape (reusable):**
1. **Persona + grounding rule:** "senior engineer + operator + product evaluator. **Ground every judgment in files,
   scripts, configs, prompts, tests, docs, or observed command output. No unsupported claims.**"
2. **Operating rules (anti-overclaim):** evaluation-only · don't submit/contact-external/modify · **mark anything
   unverifiable as `unverified` instead of guessing** · **separate "works today" from "promising but not proven"** ·
   be skeptical of hallucination, false positives, duplicate risk, missing context, overclaiming.
3. **Scope:** list every subsystem to assess (architecture, each pipeline stage, controls, tests, docs, usability, …).
4. **Steps:** (a) **repo map** — directories + their purpose; (b) **pipeline reconstruction** — the real end-to-end
   stages, each with files / inputs / outputs / **maturity** / automated-vs-manual / failure risks; (c) **run safe
   local checks** (`find`, the test suite, dashboards) — observe, don't assume; (d) **ratings + progress bars +
   recommendations**, ranked by impact.

**Why it works:** it forces evidence over vibes and the *works-today vs promising* split — the same discipline as
[[evaluate-tool-effectiveness]] + no-trust-validation, governed by [[reject-first-precision]] (mark unverified,
don't overclaim). Pairs with [[honest-partial-eval]] when the assessment can't cover everything.

**Inputs:** a repo + the prompt. **Outputs:** a grounded where-it-sits evaluation + ranked next-step recommendations.
**Learned-from:** evaluating an agentic audit codebase for non-expert usability + competitive standing.
