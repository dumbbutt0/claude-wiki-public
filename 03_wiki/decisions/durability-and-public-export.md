---
title: Durability — encrypted backup + clean public export
aliases: ["Durability — encrypted backup + clean public export", "durability-and-public-export"]
type: decision
status: active
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [decision, durability, privacy, backup]
related: ["[[open-ideas-not-edge]]", "[[long-horizon-agent-loops]]", "autonomy-policy", "[[eye-native-vs-custom]]"]
revisit: if the public corpus grows enough to flip the GitHub repo public
superseded_by: none (current)
iris_ring: middle
mode: meta
privacy_scope: public_system
graph_scope: public
---

# Durability — encrypted backup + clean public export

## Problem
Everything lived on **one Windows disk with no offsite backup** — one drive failure = total loss of ~1,000 nodes
+ all history. The long-term-optimization #1 ("state outside the single machine" — [[long-horizon-agent-loops]]).
**Complication:** the main git tree still contains pre-privacy-system private content (`01_raw/audit-watch/**` = the
edge, the genesis design conversation, competitive-moat feedback), so it **cannot** be pushed to any remote.

## Decision — two durability layers, never mixed
1. **Encrypted full backup** (`tools/backup_private.sh`): gpg-AES256 archive of the **entire vault** — including the
   git-ignored private layers (`local/`, `restricted/`, `01_raw/` bodies, `graph-local.json`) that git never carries.
   Opt-in (your passphrase); copy the `.gpg` offsite. This backs up *everything*, safely, even to an untrusted destination.
2. **Clean public export** (`tools/export_public.py` → `~/claude-wiki-public` → private GitHub
   `dumbbutt0/claude-wiki-public`): a **fresh-history** repo with **only the `public_system` pages** (35 methodology
   nodes), wikilinks to non-public pages **stripped to plain text**, + `graph-public.json` + a README. This is the
   shareable "system logic" — [[open-ideas-not-edge]] enforced mechanically.

## The hard guard
**The main `Claude-Wiki/` git repo stays LOCAL-ONLY — never add a public/shared remote to it.** It holds the edge.
The *only* thing that goes to GitHub is the clean export. To refresh GitHub after new public pages:
`python3 tools/export_public.py && cd ~/claude-wiki-public && git add -A && git commit -m "sync" && git push`.

## Why this way
- Backup covers **durability** (everything, encrypted, offsite); the export covers **shareability** (system logic only).
- A private GitHub repo is still third-party infra — so the *edge* uses the encrypted backup, **not** GitHub, even
  privately. The audited export proved 0 target/edge/source leakage before the first push.

## Relates
[[open-ideas-not-edge]] (the principle) · autonomy-policy (the privacy scopes) · [[long-horizon-agent-loops]]
(durability as a long-horizon property).
