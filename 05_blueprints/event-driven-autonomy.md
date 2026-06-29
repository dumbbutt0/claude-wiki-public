---
title: "Event-driven autonomy — the loopless engine"
aliases: ["Event-driven autonomy — the loopless engine", "event-driven-autonomy"]
type: blueprint
status: active
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [blueprint, autonomy, architecture, daemon]
related: ["[[growing-indefinitely]]", "[[semantic-memory-and-self-model]]", "[[living-lens-and-chat]]", "[[long-horizon-agent-loops]]", "[[self-maintenance-loop]]", "[[agent-loop]]"]
iris_ring: inner
mode: meta
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["designed + step-1 built 2026-06-29 — the graduation from the babysat /loop to a real-time event-driven daemon"]
---

# Event-driven autonomy — replacing the babysat loop  *(step 1 built)*

## Problem
The engine was a Claude session kept alive by `/loop` + a file-watching Monitor. It works, but it's **babysitting** — a
long-lived session polling queues. Real autonomy is each **click / chat** directly triggering a fresh action **in real
time**, with no loop to keep alive.

## The model
An always-on **plain-Python daemon** (`tools/lens_daemon.py` — ~0 cost when idle, *not* a Claude session) watches the
Eye's intent queues and fires a **headless `claude -p`** per event. The [[semantic-memory-and-self-model|self-model spine
+ auto-orient]] make each ephemeral spawn re-orient instantly, so per-event invocations are viable.

```
click / chat  →  intent file changes  →  daemon (debounce · lock · rate-limit)  →  claude -p "<cmd>"  →  acts + writes  →  Eye renders
```

No loop. Real-time. Pay-per-event, zero idle babysitting. The headless primitive is already proven — `steward_cron.sh`
runs `claude -p` on a timer; the daemon is the same primitive made **event-triggered**.

## Roadmap
1. **✅ `lens_daemon.py`** — watches `chat-inbox` → `/chat --drain` and `learning-intent-queue` → `/study --drain`.
   Single-threaded (one `claude -p` at a time = an inherent lock against concurrent graph writes), debounce (batch
   bursts), per-command cooldown, hourly rate-limit (runaway backstop), per-invocation timeout, `--dry-run` / `--once`.
   *Built; the live smoke test caught a real bug — headless `-p` doesn't auto-load project slash commands
   (`steward_cron.sh` shared it) — fixed by handing Claude the command spec to read+execute; then a full chat
   round-trip validated end-to-end.*
2. **Richer intents** — each event names its command so the daemon routes it (mostly present already).
3. **Tighten per-command `allowed-tools`** — headless is a real permission surface; the autonomy tiers + leakage gate
   are the guardrails.
4. **Self-triggering** — the steward enqueues its *own* research/connect intents → outputs become inputs. Bounded by a
   budget + the tiers. *This is the system interacting with itself.*
5. **✅ Daemonize** — `tools/lens-daemon.service` (systemd **user** service): `systemctl --user enable --now` +
   `loginctl enable-linger` = auto-start, restart-on-failure, survives logout + reboot (conservative
   `--max-per-hour 8`, `--timeout 900`). Verified: a chat round-trip completed against the *detached* service
   (`claude` auth + PATH resolve under systemd).
6. **Polish** — `stream-json` for token-level live narration to the Lens; a small SQLite queue for atomic concurrency.

## Run EITHER the daemon OR the loop
Both drain the same queues — running both double-processes every event. **Going live with the daemon = stop the `/loop`
Monitor** (TaskStop). The daemon is the successor; the loop was the scaffold.

## Trade-offs (honest)
Tokens per event (but only on *real* events — no idle drain) · needs the machine on + API access + the daemon running
(**autonomous = no *human* babysitting, not no compute**) · headless write-access is genuine risk → the leakage gate +
Tier-3 quarantine are the safety net.

## Relates
The graduation of [[long-horizon-agent-loops]] + [[self-maintenance-loop]]; enabled by
[[semantic-memory-and-self-model]] (instant re-orientation); in service of [[growing-indefinitely]].
