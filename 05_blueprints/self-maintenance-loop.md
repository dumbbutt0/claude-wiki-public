---
title: "Self-Maintenance Loop — install + automate the lint"
aliases: ["Self-Maintenance Loop", "self-maintenance-loop", "recurring lint", "anti-rot loop"]
type: blueprint
status: proposed
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [blueprint, maintenance, lint, cron]
related: ["[[ide-for-thought-assessment]]", "[[long-horizon-agent-loops]]", "autonomy-policy", "[[durability-and-public-export]]", "[[operator-and-hermes]]"]
iris_ring: middle
mode: meta
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.75
privacy_scope: public_system
graph_scope: public
provenance: ["spec'd from [[ide-for-thought-assessment]] gap #4 (rots); the pieces exist but aren't wired"]
---

# Self-Maintenance Loop — install + automate the lint  *(blueprint)*

## Problem
The wiki **rots**. Every maintenance report (`lint-report`, `orphan-pages`, `stale-claims`, `duplicate-concepts`) is
dated **06-27 — before the graph tripled to 1012 nodes**, and `tools/steward_cron.sh` is **uninstalled**. It grows but
doesn't self-heal ([[ide-for-thought-assessment]] gap #4). An IDE has *live* diagnostics; this needs them too. This is
mostly **wiring what already exists**, not new machinery.

## What already exists (reuse)
- **`/lint`** (`.claude/commands/lint.md`) — already regenerates the graph and surfaces dangling edges, forward/unwritten
  links, orphans (0-link nodes), missing frontmatter, draft stubs, and open contradictions; records to `08_maintenance/`.
- **`tools/steward_cron.sh`** — already chains `/study --drain` → `/steward-pending` → `/lint --scope changed` →
  **public-only commit**, with `set -euo pipefail` + a `claude` presence check + a "nothing to commit" guard. It is just
  never installed (opt-in by design — [[operator-and-hermes]]).
- **The tier + privacy gates** (autonomy-policy) — Tier 0–2 auto, Tier 3 quarantine; public-only commit. The cron
  inherits these, so unattended runs stay safe.

## Upgrades (the actual work)
1. **`/lint --scope changed`** — `lint.md` currently runs a *full* lint; add a `changed` scope that lints only nodes
   touched since the last commit + their one-hop neighbours (the Karpathy-gist discipline — cheap enough to run nightly).
   Full lint stays available for weekly/after-big-ingest.
2. **Freshness check** — ensure the stale pass runs: flag pages whose `updated:` predates their source's re-capture date
   (recorded in `SOURCES.md`) → `stale-claims.md`. The hook exists in §9; make it fire each pass.
3. **`tools/install_cron.sh`** (NEW, optional, idempotent) — appends the documented crontab line
   (`0 6 * * * cd <root> && bash tools/steward_cron.sh >> 09_working/steward-cron.log 2>&1`) only if absent; prints
   `crontab -l` for the owner to confirm. The owner runs it (their machine); the wiki never self-installs cron.
4. **One-time full lint now** — the reports are 3× stale; regenerate `lint-report` / `orphan-pages` / `stale-claims` /
   `duplicate-concepts` at 1012 nodes so the baseline is current before the recurring loop starts.

## Cadence (already defined in `08_maintenance/weekly-review.md`)
Nightly (cron): `/study --drain` → `/steward-pending --batch N` → `/lint --scope changed` → public commit. Weekly (hand):
full `/lint` + skill check + distill-ratio glance. This blueprint just makes the nightly half actually run.

## Privacy
Cron commits **public artifacts only** (`local/`, `restricted/`, `graph-local.json`, raw bodies are git-ignored and
never staged) — same guarantee as the manual loop. Honest limit: needs an always-on machine + a headless-authenticated
`claude` CLI (an LLM can't run itself from nothing — the local price of privacy, per [[operator-and-hermes]]).

## Files
`.claude/commands/lint.md` (--scope changed + ensure freshness) · `tools/install_cron.sh` (new) ·
`tools/steward_cron.sh` (verify steps) · `08_maintenance/*` (regenerate) · `CLAUDE.md` (§ self-maintenance) ·
`index.md` / `log.md`.

## Verification
Full `/lint` now → the 4 reports refresh at 1012 nodes (current orphan/stale/dup counts) → `/lint --scope changed` runs
on a small changed set in seconds → `bash tools/install_cron.sh` appends the line once (idempotent on re-run) → owner
confirms with `crontab -l` → next 06:00 the cron deep-mines + scoped-lints + commits public-only (check
`09_working/steward-cron.log`).
