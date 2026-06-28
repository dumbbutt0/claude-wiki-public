---
title: Source an Answer-Key Eval
aliases: ["Source an Answer-Key Eval", "source-answer-key-eval"]
type: skill
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [skill, security-research, evaluation, learned]
related: ["[[eval-driven-improvement-loop]]", "ground-truth-metrics", "[[evaluate-tool-effectiveness]]", "no-trust-validation"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-16-audit-watch-eval-loop"]
---

# Source an Answer-Key Eval  ·  *skill*

**When to use:** turning a *completed* public audit (with a public final report = the answer key) into a reproducible
**eval fixture** — the input to the [[eval-driven-improvement-loop]].

**Selection criteria:** public source code · public final report/answer key · **2–10** confirmed findings · codebase
small enough for one run · clear affected contracts/modules/functions · a **different bug class** from prior evals.
Prefer smaller, clean-report audits first; avoid massive protocols until several simple evals pass.

**Procedure:**
1. **Record metadata:** audit name · language · repo/source location · final-report location · confirmed-findings
   list · severity · affected files/functions · short root-cause summary.
2. **Create the fixture** in existing conventions: source snapshot · answer key · finding index · language tag ·
   expected affected functions · expected bug classes · expected exploit shape. *Read-only except adding eval files.*
3. **Baseline only** — run the current system, capture detected / missed / false-positive / incomplete, and the
   **first stage** that dropped each miss. Do **not** edit detector logic yet.
4. Emit the **miss table** (`finding_id | expected root cause | first-missed stage | why missed | likely reusable
   logic`) and hand it to the [[eval-driven-improvement-loop]].

**Guardrails:** no answer-key string matching, no audit-specific allowlists, no hardcoded function names in logic
(metadata only). Every confirmed hit must carry self-contained evidence (no-trust-validation).

**Inputs:** one completed public audit. **Outputs:** a reproducible eval fixture + a baseline miss table.
**Learned-from:** building Audit-Watch's cross-language (Recall Lab) eval rotation.
