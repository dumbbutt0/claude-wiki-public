---
title: "Symbolic execution & SMT solving (glossary)"
aliases: ["Symbolic execution", "SMT solving", "constraint solving", "Z3", "symbolic-execution"]
type: glossary
field: offensive-security
status: active
created: 2026-06-28
updated: 2026-06-28
review_due: 2026-06-28
interval: 0
ease: 2.5
review_attempts: 0
sources:
  - "https://nomoslabs.io/blog/symbolic-execution-smart-contract-audits-deep-dive"
  - "https://www.cyfrin.io/blog/solidity-smart-contract-formal-verification-symbolic-execution"
  - "https://arxiv.org/pdf/2209.05872"
source_count: 3
tags: [glossary, offensive-security, formal-methods, defi]
related: ["[[adversarial-reasoning]]", "[[corrected-reference-lens]]", "[[invariant-families-over-categories]]", "[[determinism-at-the-authority-boundary]]"]
iris_ring: outer
mode: audit
steward: auto
autonomy_tier: 2
claim_class: factual
confidence: 0.9
privacy_scope: public_system
graph_scope: public
provenance: ["/study web research (click-to-learn, 2026-06-28) on [[adversarial-reasoning]] — generic technique, no targets"]
---

# Symbolic execution & SMT solving  *(glossary · web-researched)*

**One line:** replace concrete inputs with **symbolic variables**, explore execution paths algebraically (forking at
each branch, accumulating **path constraints**), then hand the constraints to an **SMT solver** (usually **Z3**) to find
a concrete input that violates an assertion — an **exact counterexample** that triggers the bug.

## How it works
1. Variables become symbols; execution **forks** at each conditional, accruing path conditions.
2. At an assertion, path conditions are translated to logical formulas and submitted to a **Satisfiability Modulo
   Theories** solver.
3. The solver returns either *unsat* (no input violates it) or a **counterexample** — specific values that reach the bug.
4. ~90% of smart-contract symbolic tools rely on **Z3**; principal tools: **Mythril, Oyente** (+ extensions).

## Limits (why it's not a silver bullet)
- **Path explosion** — branches multiply combinatorially → needs pruning (incl. LLM-guided pruning, 2025).
- **Hard-to-solve constraints** — hash functions and complex memory/contract-interaction models defeat the SMT solver.

## How to apply  *(why it's in the glossary)*
- This is the formal face of [[adversarial-reasoning]] ("reasoning as constraint-solving"): an automated adversary that
  *proves* a violating input exists, vs a heuristic that merely suspects one.
- Pairs with [[corrected-reference-lens]] (the solver is an external oracle, not the model's self-judgment) and
  [[invariant-families-over-categories]] (encode the invariant as the assertion to refute).

## Sources
[Symbolic execution in audits (Nomos)](https://nomoslabs.io/blog/symbolic-execution-smart-contract-audits-deep-dive) ·
[Cyfrin — formal verification & symbolic execution](https://www.cyfrin.io/blog/solidity-smart-contract-formal-verification-symbolic-execution) ·
[Vulnerability detection survey (arXiv 2209.05872)](https://arxiv.org/pdf/2209.05872)
