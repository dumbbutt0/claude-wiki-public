---
title: "Prompt injection & system-prompt leakage (glossary)"
aliases: ["Prompt injection", "system prompt leakage", "indirect prompt injection", "OWASP LLM01", "prompt-injection"]
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
  - "https://genai.owasp.org/llmrisk/llm01-prompt-injection/"
  - "https://www.indusface.com/learning/owasp-llm-system-prompt-leakage/"
  - "https://www.lakera.ai/blog/guide-to-prompt-injection"
source_count: 3
tags: [glossary, offensive-security, ai-security, llm]
related: ["[[adversarial-reasoning]]", "[[agent-autonomy-levels]]", "[[determinism-at-the-authority-boundary]]", "autonomy-policy"]
iris_ring: outer
mode: audit
steward: auto
autonomy_tier: 2
claim_class: factual
confidence: 0.9
privacy_scope: public_system
graph_scope: public
provenance: ["/study web research (click-to-learn, 2026-06-28) on a System-Prompt-Leak conversation — generic AI-security craft"]
---

# Prompt injection & system-prompt leakage  *(glossary · web-researched)*

**One line:** unlike attacks on *code*, prompt injection targets the model's **instruction-following logic** — crafted
input overrides the system's intent. **OWASP ranks it the #1 LLM risk (LLM01:2025).**

## The two faces
- **Direct injection** — the user input itself says "ignore previous instructions…".
- **Indirect injection** — malicious instructions ride in **content the agent ingests** (a web page, a document, a
  retrieved record) and execute when the model reads them. *This is the dangerous one for autonomous agents.*
- **System-prompt leakage (LLM07:2025)** — extraction attacks pull out the confidential system prompt. Once leaked, it
  can be reverse-engineered to design **targeted** injections, and may reveal internal data sources, APIs, or RAG
  indexes — expanding the attack surface.

## Mitigations (the defender's menu)
- **Never embed secrets in prompts** — retrieve sensitive data dynamically, only when needed.
- **Assume the prompt is public** — don't let security *depend* on prompt secrecy; layer defenses beyond it.
- **Detect extraction attempts** and **constrain tool/authority** so a hijacked instruction can't do damage.

## How to apply  *(why it's in the glossary — and self-relevant)*
- This wiki **ingests untrusted content** (ChatGPT exports, web research) → an **indirect-injection surface**. Defense:
  the LLM proposes, but the consequential write stays behind a deterministic, human-gated boundary
  ([[determinism-at-the-authority-boundary]], autonomy-policy tiers) — a hijacked instruction can't self-promote.
- It's the AI-native case for [[agent-autonomy-levels]]: least privilege + scoped tools bound the blast radius of a
  successful injection.

## Sources
[OWASP LLM01:2025 — Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) ·
[OWASP LLM07 — System Prompt Leakage (Indusface)](https://www.indusface.com/learning/owasp-llm-system-prompt-leakage/) ·
[Lakera — guide to prompt injection](https://www.lakera.ai/blog/guide-to-prompt-injection)
