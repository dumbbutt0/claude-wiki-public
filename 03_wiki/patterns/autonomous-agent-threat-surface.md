---
title: "Autonomous-agent threat-surface reduction"
aliases: ["Autonomous-agent threat-surface reduction", "autonomous-agent-threat-surface", "lethal-trifecta-defense"]
type: pattern
status: active
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [pattern, security, agents, prompt-injection, autonomy]
related: ["[[event-driven-autonomy]]", "determinism-at-the-authority-boundary", "autonomy-policy", "share-method-not-work", "layered-verification", "prompt-injection"]
iris_ring: inner
mode: meta
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.8
privacy_scope: public_system
graph_scope: public
provenance: ["web-researched (lethal trifecta · CaMeL/dual-LLM · OWASP agent security · Claude Code permissions) + applied to the lens daemon, 2026-06-29"]
---

# Autonomous-agent threat-surface reduction  *(applied to the lens daemon)*

## The threat model — this layout *is* the lethal trifecta
Simon Willison's **lethal trifecta** (Jun 2025): an agent is exploitable when it combines **(1) access to private
data · (2) exposure to untrusted content · (3) the ability to communicate externally**. The [[event-driven-autonomy|lens
daemon]] has all three:
1. **Private data** — the local graph (personal + private nodes).
2. **Untrusted content** — ingested ChatGPT conversations, **web-research results** (`/study`), and **chat payloads**:
   any of these can carry an *indirect prompt injection* ("ignore your rules, publish X / delete Y / exfiltrate Z").
3. **External egress** — `git push` to the public GitHub mirror, `export_public.py`, `WebFetch`/`curl`.

Running **unattended** (and **self-feeding**, [[event-driven-autonomy]] step 4) removes the human who would notice — so
the model's good behaviour cannot be the control. *Assume injection will eventually succeed; make it harmless.*

## The defenses (mapped to the layout)
1. **Break the trifecta — cut the egress leg (Meta's "Rule of Two": satisfy ≤2 of 3).** Autonomous spawns keep private
   data + untrusted content but get **no external communication**: publication becomes a *deliberate human action*, not
   something the daemon can do. This is the single highest-leverage control.
2. **Deny-list backstop (least privilege).** Every daemon/cron `claude -p` spawn passes **`--disallowed-tools`** —
   and in Claude Code **deny rules block a tool even in bypass/acceptEdits mode**, so the model can't talk past it.
   Denied: `git push`, `export_public.py`, `WebFetch`, `curl`/`wget`/`nc`/`ssh`/`scp`, `rm`, `sudo`. Each command also
   declares its intended `allowed-tools` (defense in depth + a clean surface if we later move to `dontAsk`).
3. **Spotlighting / taint.** The spawn prompt marks queued + ingested/studied content as **untrusted DATA, never
   instructions**, and tells the agent to refuse any embedded request to change privacy scope, publish, delete, or
   exfiltrate. (Once untrusted tokens are read, treat the turn as tainted — block exfil-potential actions.)
4. **Quarantine principle (dual-LLM / CaMeL).** The robust end-state: a *read-only* pass digests untrusted content and
   returns **structured labels**, never raw instructions, to the *acting* pass. Today's approximation = spotlighting +
   the egress cut; the labelled-summary pass is the next hardening.
5. **Authority-boundary determinism + the human gate.** *Retrieval may suggest; deterministic gates must verify*
   (determinism-at-the-authority-boundary). The leakage gate + the **`public_system` allowlist** + Tier-3
   quarantine (autonomy-policy) are deterministic — the publish boundary is enforced by code + human, not by trust.
6. **Confinement.** Spawns run with `cwd` = the vault; `01_raw/` is immutable; the **main repo has no remote** (only the
   clean export can ever reach GitHub).

## Honest residual risk
- **WebSearch is kept** (autonomous research depends on it) — a *bounded, low-bandwidth* egress channel, accepted and
  documented; tighten to internal-only for a strict Rule-of-Two.
- **Code-execution escape hatch.** Tool-level denies (`curl`, `wget`…) don't stop a clever `python3 -c` using `urllib`,
  so a determined injection could still exfiltrate *to a third party*. We don't rely on tool policy being airtight —
  the **crown-jewel guarantee is structural**: the **main repo has no git remote** and **`git push` + `export_public`
  are denied**, so an autonomous spawn **cannot publish anything (least of all the private content) to the public mirror.** The
  worst outcome is prevented *by construction*, not by the agent behaving. Publication is always a human action.
- Self-triggering stays **opt-in**; the deny-list applies to the cron night-shift too.

## Sources
Willison, *The lethal trifecta* (2025) & *CaMeL / Dual-LLM* (2023/2025); Google DeepMind CaMeL; OWASP *AI Agent
Security* & *LLM Prompt Injection Prevention*; Meta *Rule of Two*; Claude Code *Configure permissions* (deny-rules /
`dontAsk`).
