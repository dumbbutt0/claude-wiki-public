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
3. **✅ Tighten the permission surface** — every daemon/cron `claude -p` spawn now passes **`--disallowed-tools`**
   (deny-rules block even under acceptEdits): no `git push` · no `export_public` · no `WebFetch`/`curl`/`wget`/`nc`/
   `ssh`/`scp` · no `rm`/`sudo`. That **cuts the lethal-trifecta egress leg** → publication becomes a human action.
   Plus **input spotlighting** (queue/ingested/web content is treated as DATA, not instructions) + per-command
   `allowed-tools`. Crown-jewel guarantee is *structural*: the main repo has no remote, so an autonomous spawn **cannot
   publish**. Full methodology: [[autonomous-agent-threat-surface]].
4. **✅ Self-triggering (built · opt-in to enable)** — `tools/self_trigger.py` enqueues the daemon's *own*
   learning-intents, **aimed** at the self-model direction (semantic alignment to the north-star); the daemon then
   `/study`s them, and as study creates questions + links those become next-round fuel → outputs become inputs.
   Bounded on every axis: **idle-fill only** (stands down if humans queued work) · per-run cap · daily budget · dedup
   vs studied/queued/already-triggered · **never the edge** (restricted_private skipped) · Tier 0-2 only. Runs on
   `tools/lens-trigger.timer` (every 3h). **Enabling the autonomous timer is a deliberate human opt-in**
   (`systemctl --user enable --now lens-trigger.timer`) — a recurring self-spawning loop must be the owner's explicit
   choice, not the agent's. *This is the system interacting with itself.*
5. **✅ Daemonize** — `tools/lens-daemon.service` (systemd **user** service): `systemctl --user enable --now` +
   `loginctl enable-linger` = auto-start, restart-on-failure, survives logout + reboot (conservative
   `--max-per-hour 8`, `--timeout 900`). Verified: a chat round-trip completed against the *detached* service
   (`claude` auth + PATH resolve under systemd).
6. **✅ Polish** — **stream-json live narration**: the daemon spawns with `--output-format stream-json` and surfaces
   each sub-step (`⚙ WebSearch · …`, `⚙ Write · page.md`, `💭 …`) to its log + a throttled, **atomic** (temp+rename) Lens
   HUD ticker, so you *watch it think* (`--no-stream` to disable; a watchdog thread enforces the timeout on a stalled
   stream). **SQLite queue — deliberately deferred (not built).** Under the *one-engine* rule the queues have a single
   drainer, and the append + mark-processed design loses no messages (a partial read self-heals next poll), so
   atomic-*dequeue* solves a problem this layout doesn't have — and the Obsidian plugin can't use SQLite without a heavy
   dependency. The real concurrency fix here was **atomic state writes** (done); SQLite stays a noted option only if a
   future *multi-writer* design ever needs it.

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
