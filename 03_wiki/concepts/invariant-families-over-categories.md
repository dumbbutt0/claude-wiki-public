---
title: Invariant Families over Categories
aliases: ["Invariant Families over Categories", "invariant-families-over-categories", "detector-market-fit"]
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
tags: [security-research, detection, strategy, methodology]
related: ["validate-finding", "cross-project-patterns", "context-mapping", "[[evaluate-tool-effectiveness]]", "[[corrected-reference-lens]]", "[[structured-adversarial-evidence-learning]]"]
iris_ring: inner
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-06-01-bug-detection-priorities (methodology abstraction)"]
---

# Invariant Families over Categories

Organize detection capability around **bug-class / invariant families** that cut across venues — **not** around the
venue's surface categories (lending, yield, stablecoins, trading, …). The common mistake is building a "lending
detector" or "yield detector"; real vulnerabilities **span categories** — the same accounting bug appears in a lending
protocol, a vault, a stablecoin, and a tokenization platform.

## Build families, then map families → categories
| invariant family | spans |
|---|---|
| **Accounting** (share inflation · debt · fee · reward · rounding accumulation) | lending · yield · stablecoins · tokenization |
| **State-machine** (missing transition · bypassed cooldown/timelock · bad status) | **all** |
| **Collateral / solvency** (liquidation prevention · health-factor manipulation · redemption mismatch) | lending · stablecoins |
| **Cross-function** (deposit↔withdraw · mint↔redeem · borrow↔repay · stake↔unstake) | **all** |
| **Privilege boundaries · Multicall effects · Cross-contract invariants** | **all** |
| **Oracle dependencies · Mint/redeem logic** | price-touching / minting venues |

The broadest families (state-machine, cross-function, privilege, multicall, cross-contract) pay off everywhere — build
those first; they compound across every target. This is the security expression of cross-project-patterns: invest
in the transferable mechanism, not the surface label.

## Detector-market-fit (target selection)
Pick targets where **(your strongest families) × (that class's prevalence/value at the venue)** is highest — play to
your detector strengths rather than chasing a category because it's popular. Then prove each candidate against a real
in-repo reference ([[corrected-reference-lens]]) and validate it (validate-finding).

**Generalizes:** organize *any* capability by **transferable mechanism families**, not by surface taxonomy — a pillar
of [[structured-adversarial-evidence-learning]]. Grounding starts from context-mapping; effectiveness is measured
by [[evaluate-tool-effectiveness]].
