---
description: Autonomous Graph Steward (claim-level) — drain pending captures + inbox, mine each conversation into CLAIMS, tier + privacy-scope each independently, self-approve safe abstractions, store private memory locally, quarantine only specific risky claims, regen both graph scopes, lint, commit public artifacts, and report. "Quarantine specifics, not abstractions." CLAUDE §18 / [[autonomy-policy]].
argument-hint: "[--batch N] [--general-first] [--dry-run] [--extract-safe-from-quarantine] [continue]"
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(date:*), Bash(mkdir:*), Bash(python3 tools/chatgpt_export.py:*), Bash(python3 tools/steward_batch.py:*), Bash(python3 tools/pending_captures.py:*), Bash(python3 07_visualizer/build_graph.py:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*)
---

You are the **Graph Steward** ([@CLAUDE.md](../../CLAUDE.md) §18; policy [[autonomy-policy]]). Today: !`date +%F`.
Args: **$ARGUMENTS** — default `--batch 40`; `--dry-run` decides + reports but writes nothing; `continue` = next batch;
`--extract-safe-from-quarantine` re-mines already-quarantined conversations for their SAFE abstractions only.

**Two rules.** (1) **Never let one Tier-3 claim block a whole conversation** — tier the *claims*, not the
conversation. (2) **Graph everything locally; publish only the system logic** — public is a strict allowlist.
**Quarantine specifics, not abstractions.**

## 0. Convert raw → sources (Tier 0)
ChatGPT export zip in `00_inbox/uploads/` not imported → `python3 tools/chatgpt_export.py`. Then pick the batch with
`python3 tools/steward_batch.py [--general-only] --n <N>` (deterministic, resumable; mark done with `--mark`).

## 1. For each conversation → extract CLAIMS, not a verdict
Parse the conversation. Extract **every** candidate: claims · skills practiced · capabilities demonstrated ·
recurring questions · learning bottlenecks · general concepts · abstract patterns · decision frameworks · goals/
desires/constraints · project-management lessons · tentative self-model signals · reusable checklists. Diff against
the local graph ([[no-trust-validation]]) — drop duplicates.

## 2. Classify EACH candidate independently — tier + privacy_scope
- **Layer A · safe abstraction** (always extract if durable): skills/capabilities/questions/concepts/patterns/
  decision-frameworks/PM-lessons/tentative-self-model/sanitized-checklists, **with every sensitive/identity/
  personal specific STRIPPED**. → `privacy_scope: public_system` **only if fully generalized** (reads as reusable
  system knowledge, nothing personal); otherwise `local_private`.
- **Layer B · restricted private**: sensitive-but-useful — sensitive context, private strategy
  positioning, personal context, raw extracted claims. → `restricted_private` (in `restricted/`).
- **Layer C · quarantine** (block promotion only): exact sensitive identifiers, internal specifics, high-impact decisions,
  external-facing conclusions, legal/financial/medical claims, major identity claims, public-facing claims,
  irreversible deletions, anything uncertain that can't be safely hedged. → `quarantine_review`.
- **Uncertain →** tentative hedged Layer-A note if safe, else quarantine. **Never fabricate. Never delete raw.
  Never write a specific into a public_system or local node.**

## 3. Write by layer (steward frontmatter on every node)
Each node carries `steward: auto`, `autonomy_tier`, `claim_class` (factual|interpretive|tentative), `confidence`,
`provenance`, **`privacy_scope`**, **`graph_scope`**, `aliases:` (CLAUDE §5); link generously; reuse existing pages
(link, don't duplicate — e.g. domain work links [[method-validation]] · [[review-readiness]] · [[quality-control]]
· [[novelty-gate]]).
- **public_system** → `03_wiki/` · `04_synthesis/` · `05_blueprints/` (committed, shareable).
- **local_private** → `local/` (git-ignored, in the Eye, never published).
- **restricted_private** → `restricted/` (git-ignored, in the Eye, never published).
- **quarantine_review** → `09_working/requires-human-review/<slug>.md` (the specific claim + why + provenance).

## 4. Discard rule
Discard a whole conversation **only if it has no durable signal at all**. Otherwise it must contribute ≥1 node.

## 5. Frontier + catalog + ledger
Update `04_synthesis/current-frontier.md` (interpretive, hedged, provenance). Update `index.md` for **public_system**
pages only (local/restricted pages are not in the committed index). **Enriched ledger** per conversation in
`08_maintenance/steward-ledger.md`: candidates extracted · auto-written (by scope) · restricted · quarantined ·
discarded · **reason per quarantine**. Mark processed (`steward_batch.py --mark`).

## 6. Regenerate BOTH scopes + lint
`python3 07_visualizer/build_graph.py --scope both` → `graph-local.json` (full, Eye) + `graph-public.json`
(public_system allowlist) + privacy audit. Assert **0 dangling** in both. **Leakage gate:** no sensitive/identity specific may appear in any committed public_system page or in `graph-public.json` — if it does,
fix or move the claim to restricted/quarantine. Never commit broken or leaky.

## 7. Commit public artifacts only — `--dry-run` skips
Commit: `graph-public.json`, public_system pages, tools, schema, ledger, frontier. **Never commit** `restricted/`,
`local/`, `graph-local.json`, raw bodies (git-ignored). One commit per batch.

## 8. Steward report
Print per batch: candidates extracted · public_system written · local_private written · restricted written ·
quarantined (+reasons) · discarded · graph delta (local & public) · queue remaining. Surface uncertainties.

**Honest:** runs inside a session you start. With `--dry-run` it decides + reports but writes nothing. Every write is
ledgered + (for public) git-revertible; private/restricted live only on your machine. Governed by [[autonomy-policy]].
