---
title: Decentralized AI Training Platform (exploratory)
aliases: ["Decentralized AI Training Platform (exploratory)", "decentralized-ai-training"]
type: blueprint
status: draft
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [blueprint, ai-engineering, crypto, exploratory]
related: ["horizontal-scaling-hypothesis", "horizontal-scaling", "personal-operating-system", "business-ideas", "[[determinism-at-the-authority-boundary]]"]
iris_ring: outer
mode: ai-engineering
steward: auto
autonomy_tier: 1
claim_class: tentative
confidence: 0.4
privacy_scope: public_system
graph_scope: public
provenance: ["01_raw/chatgpt-export/.../2026-05-13-decentralized-ai-training-design (idea capture)"]
---

# Decentralized AI Training Platform  *(exploratory — needs direction)*

> **Tentative idea-blueprint.** A captured project interest, not a commitment. Pairs with the
> horizontal-scaling thesis (coordinating many cheap contributors into one capable system).

**The idea:** a blockchain-coordinated, open-source AI-training platform — but **the easy/wrong move is "put unlimited
training data on-chain."** Decentralize *coordination*, not storage.

## The right split
```
blockchain   = coordination · ownership · incentives · audit trail · governance (hashes, licenses, rewards, votes)
off-chain    = the actual datasets · model checkpoints · logs · gradients · eval artifacts (IPFS/Arweave/Filecoin/mirror)
compute net  = distributed GPU providers training the model (joining/leaving an unreliable network)
```
Flow: contribute data/compute → off-chain storage → chain records {hash, contributor, license, quality score, proof
of contribution, reward accounting} → curators/evaluators filter → approved data enters the training queue →
distributed nodes train → checkpoints + evals published → **rewards go to useful data, useful compute, useful evals.**

## The hard parts (where the real work is)
1. **Data quality** — dedup · copyright checks · toxicity · synthetic-data detection · category labeling · review.
2. **Poisoning resistance** — quarantine sets · eval gates · reputation · slashing · delayed inclusion (attackers will
   submit backdoor triggers). *(This is [[determinism-at-the-authority-boundary]] for training data.)*
3. **Proof of useful compute** — pay on checkpoint deltas / loss improvement / redundant validation / random audits /
   TEE proofs, not on a claim.
4. **Training bandwidth** — internet-scale training needs async/federated optimizers (cf. INTELLECT-1, Nous DisTrO,
   which target the inter-GPU communication problem directly).
5. **Governance** — what the model may learn from, its license, who is rewarded, what counts as a valid contribution.

## Staged MVP (don't start with a frontier model)
**Stage 1 — decentralized dataset registry:** users submit datasets; the chain stores hash, license, contributor
wallet, topic tags, review status; files live off-chain. Later stages add curation rewards, then proof-of-compute,
then distributed training. **Next step: decide whether this is a real direction** (it touches business-ideas).
