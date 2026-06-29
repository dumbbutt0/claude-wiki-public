---
title: Corrected-Reference Lens
aliases: ["Corrected-Reference Lens", "corrected-reference-lens", "differential lens"]
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
tags: [security-research, detection, precision, methodology]
related: ["poc-validation", "false-positive-control", "[[reject-first-precision]]", "[[conversion-learning]]", "[[adversarial-reasoning]]", "[[determinism-at-the-authority-boundary]]"]
iris_ring: inner
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-09-corrected-reference-lens-method (methodology abstraction; internal detector/phase names stripped)"]
---

# Corrected-Reference Lens

The highest-ROI, **zero-false-enforcement** detection lever. For each candidate, do **not** ask *"does this look like
bug class X?"* — ask *"is there an in-repo reference that shows the **expected** behaviour?"* — then flag **only the
delta**.

**Valid references (all real source, never a fabricated template):** a sibling function · the function's own inverse ·
a same-class peer contract · a lifecycle counterpart · a registry/accounting mirror · the protocol's own corrected path.

## Why it keeps false-enforcement at 0 (structural, not tuning)
The "expected" side is **real source code**, so the system never lifts from a generic class label — it lifts only on
a concrete delta against existing code. **No source-backed reference → no lift.** Most false-positives come from the
opposite move: promoting on a class label or hypothesis with no in-source anchor. Anchor to a real reference + add an
explicit **refutation branch**, and FP stays flat (the precision discipline of [[reject-first-precision]] +
false-positive-control).

## The strongest form
1. Detect candidate behaviour → 2. find an in-source reference → 3. prove the delta → 4. run a **refutation branch**
→ 5. emit **advisory** evidence (not production enforcement) → 6. require human/PoC confirmation before reportability
(poc-validation, [[conversion-learning]]).

## Honest scope — one FP-safe lens per mechanism family
Corrected-reference covers the **relationship-error family**: wrong recipient · asymmetric accounting · stale/unpaired
snapshot · wrong rounding direction · missing lifecycle mirror · sibling batch/single mismatch · inverse-conversion
error. It is the **broadest first lens**, not everything — oracle freshness, access-control, and genuinely-novel
economic logic each still need their own source-backed lens. Say *"the bulk of easy relationship bugs,"* never
*"nearly all."* To pick which lens to run from past experience without losing precision, see
[[precedent-guided-source-anchored]].
