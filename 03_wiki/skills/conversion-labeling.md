---
title: Conversion Labeling
aliases: ["Conversion Labeling", "conversion-labeling"]
type: skill
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [skill, ai-learning, security-research, learned]
related: ["[[conversion-learning]]", "[[reject-first-gating]]", "[[severity-calibration]]", "triage-readiness", "outcome-learning-loop"]
iris_ring: middle
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-04-tool-effectiveness-evaluation"]
---

# Conversion Labeling  ·  *skill*

**When to use:** at the end of investigating any candidate finding (or any "lead → outcome" attempt in a transferable
domain), before promoting or shelving it.

**Why:** a label that captures *why it did or didn't convert* turns each attempt into reusable training signal (see
[[conversion-learning]]). High-quality negative labels are the most valuable.

**Procedure:**
1. Confirm the **mechanism** layer (runtime status, corrected reference, control). Proof ≠ usefulness.
2. Resolve the **exploitability** layer (entrypoint, caller permissions, signed-vs-executed fields, reachability verdict).
3. Resolve the **conversion** layer (severity, duplicate/known, scope, report quality → [[severity-calibration]],
   triage-readiness).
4. Emit one compact label:
   ```yaml
   conversion:
     mechanism_confirmed: true|false|unknown
     attacker_reachable:  true|false|unknown
     severity_bearing:    true|false|unknown
     novelty_clear:       true|false|unknown
     reportable:          true|false|unknown
     outcome:             <enum>     # runtime_confirmed_but_not_reportable, paid_valid, runtime_refuted, ...
     blocker:             <enum|null># the single primary non-conversion reason
   ```
5. **Force one `blocker`** when not reportable (`unreachable · privileged_only · severity_too_low · duplicate ·
   wrong_mechanism · …`). Feed the row to outcome-learning-loop.

**Inputs:** an investigated candidate + its evidence. **Outputs:** one conversion-labeled row.
**Learned-from:** a real runtime-confirmed mechanism correctly labeled *not reportable / privileged-only* (the
boundary-stop exemplar — concrete target kept local). Pairs with [[reject-first-gating]].
