# Privacy model

This repository is the **public system layer** of a personal LLM-wiki. It is built by an automated export
pipeline whose entire job is to publish *the system, not the owner's work*. The governing principle:

> **Publish the method, not the work.**

## What is in this repo

- The system **code** (graph builder, the Cognitive Lens plugin, retrieval, the autonomy daemon, the export
  + privacy-enforcement tools, the command surface) and `CLAUDE.md`, the operating schema.
- Only the wiki pages that declare **both** `privacy_scope: public_system` **and** `mode: meta` — i.e. pages
  *about the system itself* (its architecture, the Cognitive Lens, the autonomy/memory design, the Karpathy
  pattern). There are ~18 of these.

## What is NEVER in this repo

- The owner's private knowledge graph (`graph-local.json`) and semantic index.
- Raw conversations and source material (`01_raw/`).
- Private and restricted pages (`local/`, `restricted/`).
- The **self-model** (the living model of the owner's goals, skills, and direction).
- Working memory and queues (`09_working/`), the inbox (`00_inbox/`), and the Obsidian vault config.
- Anything **domain-derived** — knowledge compiled *from* the owner's sources or work — **even if it is
  generalizable**. Generalizable knowledge still stays local; only the *system* is public.

## How the boundary is enforced (defense in depth)

1. **Default-local.** A page with no `privacy_scope` is treated as local and never exported.
2. **Allowlist + meta filter.** `build_graph.py --scope public` emits a node only if it is
   `public_system AND mode: meta`. `tools/enforce_public_meta.py` demotes any `public_system` page that
   isn't `meta`.
3. **Leakage gate (`export_public.py`).** After allowlisting the public pages and stripping private
   wikilinks to plain text, `export_public.py` runs a **leakage gate** that scans the whole export for
   secrets and PII (private-key blocks, API tokens, emails, wallet addresses) **plus a configurable
   denylist** of project-specific private identifiers (read from `tools/leakage-denylist.txt`, which is
   itself git-ignored). On **any** match it prints the offending file/line and **aborts with a non-zero
   exit** — so an accidental leak can't be pushed. A second local hardening pass additionally genericizes
   domain-specific vocabulary in the exported copies before publishing.
4. **No remote on the source.** The private vault's git repo has **no public remote** — only the clean
   export is ever pushed. Autonomous writes (daemon / cron / study / steward / chat) are **never** marked
   public; only a human, interactively, may publish.

## If you fork this

Keep your own data private the same way: default everything to local, give each page its real domain
`mode`, and mark a page `public_system + mode: meta` **only** when it is about the system and you have chosen
to share it. Never add a public remote to the vault that holds your raw sources.
