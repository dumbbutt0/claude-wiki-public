# CLAUDE.md — Operating Schema for the Personal Claude Wiki

This file is the **schema / operating system** for this wiki, in the sense of
[[schema-as-agent-operating-system]]. Any Claude (or human) maintaining this vault
reads this file first and follows it. It is the contract between the human curator
and the LLM maintainer.

---

## 1. Purpose

This is not "an Obsidian vault with a nice graph." It is a **personal operating
system for skills**: a persistent, compounding knowledge base that turns raw project
docs, notes, and experiments into a living skill map. It exists to help the owner:

1. understand what they already know,
2. refine the pipelines behind your active projects,
3. sharpen the tools and methods those projects depend on,
4. generate blueprints for future projects,
5. connect ideas across your domains — engineering, tooling, agents, content, and strategy,
6. eventually visualize the knowledge as an interactive **eye** graph.

Architecture follows Karpathy's [[llm-wiki]] pattern: **raw immutable sources → an
LLM-maintained wiki → this schema file.** See [[persistent-knowledge-base]] for why
this beats plain RAG.

## 2. File ownership & boundaries (safety)

- **Edit only inside `Claude-Wiki/`.** Never create or modify files elsewhere in the
  vault or filesystem without explicit per-task approval from the owner.
- **Never touch `.obsidian/`** (the vault config). Not read-critical, never written.
- **The main repo stays LOCAL-ONLY** — it holds your private source material (`01_raw/project-x/**`, design conversations,
  moat feedback committed before the privacy system). **Never add a public/shared git remote to it.** The *only*
  thing that goes to a remote is the **clean public export** (`tools/export_public.py` → the `public_system` subset →
  private GitHub). Durability of everything = `tools/backup_private.sh` (encrypted). See [[durability-and-public-export]].
- **`01_raw/` is immutable** — read-only after capture. See rule 4.
- Work in **small, reviewable batches.** Prefer 5–15 file changes per pass with a
  clear log entry over one massive rewrite.
- This vault lives on a Windows drive accessed through WSL2. Use forward-slash paths
  relative to `Claude-Wiki/`. Avoid line-ending churn (`.gitattributes` handles it
  if git is initialized).

## 3. Directory map

```
Claude-Wiki/
  CLAUDE.md            this schema
  README.md            human orientation
  index.md             content catalog (every page, one line each)
  log.md               append-only history (ingest/query/lint)
  graph-manifest.json  node-type → color / iris-ring / mode map for the visualizer

  00_inbox/            unprocessed drop zone
  01_raw/              IMMUTABLE source snapshots + SOURCES.md provenance
  02_sources/          source-summaries (factual) · source-maps · source-claims
  03_wiki/             the owned wiki:
    concepts/ entities/ projects/ systems/ skills/
    patterns/ decisions/ contradictions/ questions/
    capabilities/      what agents can DO (Inputs/Outputs/Used-by)
    outcomes/          memory records (what happened → lesson → pattern)
    stages/ interfaces/ pipelines/   the composition language (reusable bricks + contracts)
    gaps/              first-class "missing" nodes → future blueprints
    sessions/          reasoning-session pages — how ideas evolved (from design conversations)
  04_synthesis/        cross-source interpretation (the "so what")
  05_blueprints/       forward-looking outputs (what to do next)
  06_templates/        page skeletons
  07_visualizer/       graph spec + build_graph.py + graph-export.json (integrity); the
                       visualization IS Obsidian's native Graph view (tools/build_obsidian_graph.py)
  08_maintenance/      lint reports, orphans, stale claims, weekly review
  09_working/          EPHEMERAL working memory (/prime sessions); git-ignored, not graphed
  tools/               utility scripts (e.g. extract_dialogue.py for /mine-conversation); not graphed
```

## 4. Source immutability

- Files in `01_raw/` are never edited or deleted once captured.
- Provenance lives in `01_raw/SOURCES.md` (path, git commit, capture date, what was
  copied/excluded).
- If a source changes upstream, capture a **new** snapshot — never overwrite.
- All factual claims in the wiki must be traceable to a raw source or be explicitly
  marked as interpretation/inference.

## 5. Page naming

- Files: `kebab-case.md` (e.g. `quality-control.md`).
- **Aliases are mandatory for Title-Case links.** Obsidian resolves `[[wikilinks]]` by **filename or
  `aliases:` — NOT by the `title:` property** (and *not* by slugifying Title Case → kebab). So a
  `[[False Positive Control]]` link only resolves if the page `quality-control.md` carries
  `aliases: ["False Positive Control"]`. **Every page must include `aliases: ["<its title>"]`** (see §6),
  else Title-Case links spawn duplicate phantom nodes in the graph. `tools/` has no fixer — keep the field
  in templates and on every new page.
- One concept/entity/project per page. Split rather than let a page sprawl.

## 6. Frontmatter schema (every `.md` page)

```yaml
---
title: Human Readable Title
aliases: ["Human Readable Title"]   # = title, so [[Title Case]] links resolve in Obsidian (§5)
type: source-summary | source-map | concept | entity | project | system | skill | pattern | decision | contradiction | question | synthesis | blueprint | capability | outcome | pipeline | stage | interface | gap | reasoning-session | template | report
status: draft | active | stale | placeholder
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: []          # [[source-summary pages]] or raw refs this page draws on
source_count: 0      # how many distinct sources back this page
tags: []
related: []          # [[wikilinks]] to sibling pages
iris_ring: pupil | inner | middle | outer    # default layout distance in the eye graph
mode: research | building | ai-engineering | content | life-strategy | meta
---
```

- `iris_ring` and `mode` feed the [[eye-layout-spec|eye graph]]. `meta` mode = pages
  about the wiki itself (this schema, the Karpathy pattern).
- `privacy_scope` (public_system | local_private | restricted_private | quarantine_review | raw_source) +
  `graph_scope` (public | local | none) gate the dual-scope graph (§18). **Default (omitted) = local — never
  published.** Steward-written pages set these explicitly; `steward: auto`, `autonomy_tier`, `claim_class`,
  `confidence`, `provenance` accompany autonomous writes.
- Factual pages (`source-summary`) cite sources heavily and avoid interpretation.
  Interpretation belongs in `concept`, `synthesis`, `pattern`, `decision`, or
  `blueprint` pages.
- `type: report` is for operational pages (the `08_maintenance/` lint outputs and the
  `00_inbox/` drop zone), not wiki knowledge pages.
- `type: reasoning-session` describes **how ideas evolved** (a conversation = a reasoning trace), not
  facts about the world. Raw transcripts live in `01_raw/design-conversations/`; the page is the
  distilled how/why. Don't promote operational chatter (e.g. WSL cleanup) from a transcript into pages.

## 7. Ingest workflow  · `/ingest` (§17)

When a new source is added (per [[ingest-query-lint-loop]]):

1. Stage the raw material under `01_raw/<source>/` and record it in `SOURCES.md`.
2. Read it. Write a **factual** `02_sources/source-summaries/<source>.md` (no
   interpretation — just what the source says).
3. Optionally build a `02_sources/source-maps/<source>.md` listing the topics the
   source covers and which wiki pages they map to.
4. Create or update ~10–15 `03_wiki/` pages (concepts, entities, systems, skills,
   patterns) that the source touches. Add `[[wikilinks]]` generously, including
   forward-links to pages worth writing later.
5. Record any conflicts with existing pages as contradictions (rule 11).
6. Update `index.md` (rule 12) and append to `log.md` (rule 13).

Prefer small batches. It is fine to stop after step 4 and continue later.

## 8. Query (ephemeral) & Expand (persist)  · `/query` `/recall` `/expand` `/explain` (§17)

The wiki **grows from questions** ([[expanding-answer-base]]). Two distinct steps:
- **Query** (ephemeral, writes nothing): read `index.md`, traverse the graph, synthesize a cited
  answer, state confidence. Most questions end here.
- **Expand** (persist): when an answer is *genuinely new*, propose a **typed
  changeset** (new concept / updated page / blueprint / decision / outcome / links), diff it against
  the existing graph, write it (§7/§10/§11 workflows), update `index.md` + `log.md`, regenerate the graph.
  Only real synthesis becomes permanent. **Approval is now tiered (§18):** low-risk growth (Tier 0–2)
  self-approves under the Graph Steward; **Tier 3 (identity / external facts / deletions / public claims /
  high-stakes external conclusions) still requires your approval.**
- **Explain** (`/explain [[page]]`): a focused prime around one page — surfaces its related projects,
  pipelines, capabilities, outcomes, decisions, and open questions without a question.

## 9. Lint workflow  · `/lint` (§17)

Run periodically (and capture results in `08_maintenance/`):

- **Contradictions** — claims that conflict → `03_wiki/contradictions/`.
- **Stale claims** — outdated vs. current raw sources → `stale-claims.md`.
- **Orphans** — pages with no inbound/outbound links → `orphan-pages.md`.
- **Duplicates** — overlapping concept pages to merge → `duplicate-concepts.md`.
- **Gaps** — expected pages that don't exist yet (from source-maps).
- Summarize each pass in `lint-report.md` and append a `lint` entry to `log.md`.

## 10. Blueprint workflow (the compounding-value engine)  · `/blueprint` (§17)

Every good query should be able to produce a forward-looking artifact in
`05_blueprints/`. Blueprint kinds:

- **Skill blueprint** — what to practice next.
- **Project blueprint** — what to build next.
- **Pipeline blueprint** — how to improve a system (e.g. one of your active projects).
- **Content blueprint** — how this becomes a YouTube/X/demo post.
- **Research blueprint** — what sources to ingest next.
- **Decision blueprint** — a tradeoff to resolve (pairs with `03_wiki/decisions/`).

Blueprints must link back to the wiki pages and sources that justify them.

## 11. Contradiction handling

When two claims conflict, **never silently pick one.** Create
`03_wiki/contradictions/<topic>.md` (use the template) stating both claims, their
sources, and the current resolution status (`open` / `resolved` + how). Link the
affected pages to it.

## 12. index.md rules

- `index.md` is a catalog: one line per page — `[[link]] — one-line summary`,
  grouped by section (sources, concepts, patterns, synthesis, blueprints, …).
- Update it in the **same batch** as any page create/rename/delete. A page that
  isn't in `index.md` is effectively invisible to future queries.

## 13. log.md rules

- Append-only. Never edit past entries.
- One entry per ingest/query/lint pass, newest at the bottom under its date.
- Header format: `## [YYYY-MM-DD] <ingest|query|lint> | <subject>` followed by a
  short bullet list of what changed.

## 14. Graph-export rules

- `07_visualizer/graph-export.json` is **derived** from the wiki: nodes = pages
  (carrying `title`, `type`, `iris_ring`, `mode`), edges = wikilinks.
- Keep it valid JSON. It is a generated artifact — regenerate it rather than
  hand-editing where possible. A real wikilink→JSON exporter is a later phase; until
  then, update it when the page set changes materially.
- `graph-manifest.json` maps `type` → color (the canonical type/colour reference).

## 15. Visualization = Obsidian's native Graph view  (see [[eye-layout-spec]], [[obsidian-native-graph]])

The graph IS **Obsidian's own Graph view** — there is no browser app. `tools/build_obsidian_graph.py`
writes `.obsidian/graph.json` with **category colour-groups** (by folder) + a **declutter filter** (hides
`01_raw`/templates/working/control). Re-run it to restore (Obsidian overwrites graph settings on UI
changes). Read it as: colour = category · **Local Graph** = a page's neighbours (focus) · search = filter.
The *interactive* reasoning (goal-lens, etc.) lives in the commands (`/prime`, `/explain`), not the graph.
`graph-export.json` remains the machine-readable graph for `/lint` + `/graph` integrity checks.

## 16. WSL2 / Obsidian safety rules (summary)

- Stay inside `Claude-Wiki/`. Never write `.obsidian/`.
- `01_raw/` is immutable.
- Always update `index.md` + `log.md` with any wiki change.
- Small, reviewable batches; record contradictions instead of resolving them silently.
- Use `[[wikilinks]]` heavily; every page gets frontmatter.

## 17. Commands (operations made executable)

The workflows above are also **slash commands** in `.claude/commands/` — the executable
surface over this schema. Run Claude Code from this folder (`cd Claude-Wiki && claude`) so they
populate the `/` menu.

| Command | Does | Schema |
|---------|------|--------|
| `/ingest [url\|path\|text]` | stage a source immutably → summary → concept pages → index/log/graph | §7, §4 |
| `/query [question]` | **ephemeral** cited answer — writes nothing | §8 |
| `/expand [topic]` | **compile the conversation into the graph** — propose typed changes, apply on OK | §8, [[expanding-answer-base]] |
| `/explain [[page]]` | illuminate a page — its projects/pipelines/capabilities/outcomes/decisions/questions | §8 |
| `/recall [topic]` | "show everything I know about X" — survey + map what exists | §8 |
| `/prime [goal]` | **active context engine** — assemble a focused workspace for a goal in `09_working/`, reason, promote discoveries | [[context-priming]] |
| `/lint` | health-check (contradictions/orphans/stale/dupes/frontmatter) + fix/record | §9 |
| `/blueprint [kind] [topic]` | forward-looking blueprint grounded in the wiki | §10 |
| `/capabilities [filter]` | list/traverse what the system can DO (the capability layer) | §6 |
| `/compose [idea]` | assemble a NEW system design from reusable stages + run the gap detector | [[reference-agentic-pipeline]] |
| `/mine-conversation [src]` | segment + classify a conversation, extract durable knowledge, propose changes | [[mine-conversation]] |
| `/record-outcome [run]` | record a run's memory: what happened → lesson → pattern (wiki-only) | §6 |
| `/decision [problem]` | record an architecture/design decision (why, tradeoffs, revisit) | §11 |
| `/graph [date?]` | regenerate `graph-export.json` (integrity) + the Obsidian graph config | §14 |
| `/steward-pending [--batch N]` | **autonomous graph steward** — drain pending captures + inbox, mine, tier-classify, self-approve safe growth, quarantine risk, regen/lint/commit, report | §18 |
| `/skill [name\|from-outcome\|from-conversation]` | distill a **reusable procedure** into `03_wiki/skills/` — the learn-as-we-go layer | §19 |
| `/study [subject\|--drain]` | **click-to-learn**: expand a subject (questions/links/study-plan now, web research after) → graph blooms | §20 |
| `/review [topic\|--due]` | **active-recall spaced repetition**: drill due concepts, graded vs the page+sources, SM2 reschedule | §20 |
| `/goal [text\|--show\|--clear]` | set the **persistent north-star** the Lens orbits (banner + ✦ pole star + momentum) | §20 |
| `/connect [--show\|--promote N\|<topic>]` | **infer new pathways** between ideas (fast tag/term overlap) → dashed teal links in the Lens; promote the best to real `[[wikilinks]]` | §20 |
| `/chat [--drain]` | answer the **in-Obsidian chat** — drain user messages, act (find/research/build/write artifacts), narrate to the Lens, reply (tiered auto-write) | §20 |
| `/me [--show\|refine\|<note>]` | view/refine your **living self-model** (the spine that steers retrieval + capture). Semantic recall: `tools/semantic_index.py --query`. Session auto-orients via `tools/auto_orient.py`. | §20 |

The commands are thin wrappers — this `CLAUDE.md` remains the source of truth; they just make
§7–§10/§14 repeatable. `.claude/commands/*` are tooling, **not** wiki pages (excluded from the graph).

## 18. Autonomy — the Graph Steward  · `/steward-pending` (§17)

The wiki has an **autonomous steward**: Claude **writes low-risk knowledge growth by default**, **quarantines**
risky/irreversible/public/high-stakes claims, and **you review only the quarantine**. This relaxes §8's
"only on approval" into **tiered self-approval** (Tier 3 stays human). The rule:

> **Claude writes by default · quarantines when risky · you review only quarantine.**

**Tiers** (full policy + examples: [[autonomy-policy]]):
- **Tier 0 — always automatic:** raw capture · inbox uploads · transcript/export conversion · immutable source
  storage · metadata · pending queues · working notes · non-authoritative summaries.
- **Tier 1 — Claude self-approves into the wiki:** skill / curiosity / learning-path / capability /
  recurring-question / project / frontier / style pages · tentative self-model observations · links between
  existing concepts · duplicate cleanup by redirect/merge-note (**not deletion**).
- **Tier 2 — self-approve IF provenance exists + checks pass:** updates to existing capability/project-status
  pages · expansion of goals/desires/constraints · patterns from ≥2 conversations · lessons from ≥2 outcomes ·
  link-preserving restructuring · ontology improvements.
- **Tier 3 — human approval required → quarantine:** major identity claims · unverified external facts ·
  irreversible deletion · public-facing statements · high-stakes external conclusions · high-impact decisions · legal/
  financial/medical claims · anything that changes external-facing strategy · anything uncertain that cannot be
  safely marked tentative.

**Default when uncertain:** prefer a **tentative Tier-1 note** (hedged; `claim_class: tentative`,
`status: tentative`) over silence — but **never** convert an uncertain interpretation into a hard claim; if it
can't be safely hedged, **quarantine** it. **Never fabricate external facts. Never silently delete raw.**

**Self-approval record (required for every autonomous write):** page frontmatter carries `steward: auto`,
`autonomy_tier`, `claim_class` (factual|interpretive|tentative), `confidence`, `provenance`; **and** an entry is
appended to [[steward-ledger]] (source path · reason · tier · confidence · provenance · checks run · rollback
`git revert <sha>` · claim class). Every autonomous change is therefore **visible and reversible**.

**Quarantine:** Tier-3 proposals land in `09_working/requires-human-review/` — you review only these.
**Frontier:** the steward keeps [[current-frontier]] fresh from Tier-1/2 signals.
**Honest limit:** the steward runs inside a session you start (a hook can't invoke an LLM); frictionless writes
also depend on the harness permission mode. Raw is never deleted; deletions are always Tier 3.

### Claim-level extraction + privacy scopes
**Quarantine specifics, not abstractions.** Tier the **individual claims** inside a conversation, not the whole
conversation — **never let one Tier-3 claim block the rest.** Every conversation with durable signal contributes
safe abstractions; only the specific risky claims are restricted/quarantined. Three layers per conversation:
**A — safe abstraction** (skills/capabilities/questions/concepts/patterns/decision-frameworks/tentative self-model/
checklists with **sensitive-specifics stripped**); **B — restricted private** (sensitive context, private strategy,
personal context → `restricted/`); **C — quarantine** (exact sensitive identifiers, sensitive specifics, external-facing
conclusions, legal/financial/medical, identity claims → `09_working/requires-human-review/`).

**Two graph scopes — "graph everything locally; publish only the system logic."** Every node carries
`privacy_scope` (`public_system` | `local_private` | `restricted_private` | `quarantine_review` | `raw_source`) and
`graph_scope` (`public` | `local` | `none`):

| privacy_scope | committed | local Eye | public export | lives in |
|---|---|---|---|---|
| public_system | ✅ | ✅ | ✅ | 03_wiki / 04_synthesis / 05_blueprints |
| local_private | ❌ git-ignored | ✅ | ❌ | `local/` |
| restricted_private | ❌ git-ignored | ✅ | ❌ | `restricted/` |
| quarantine_review | ❌ | ❌ | ❌ | `09_working/requires-human-review/` |
| raw_source | ❌ if sensitive | ❌ | ❌ | `01_raw/` |

**Public is a strict allowlist — ONLY THE SYSTEM THAT MAKES UP THE WIKI ITSELF reaches GitHub, never created
knowledge/sources** (owner directive, 2026-06-29). A node is published only if it declares **BOTH** `privacy_scope:
public_system` **AND** `mode: meta` (= "pages about the wiki itself" — the AI-OS architecture: the schema, the Lens,
the autonomy/memory/retrieval design, the Karpathy pattern). **Everything domain-derived** (agent-loop, conversion
methodology, evaluation, scaling, and sensitive topics — anything compiled *from* sources or work) **stays local, even
if generalizable.** `build_graph.py --scope public` enforces `public_system AND mode:meta`; `tools/enforce_public_meta.py`
demotes any non-meta `public_system` page; **default (omitted) = local, never public.**

**Autonomous writes are NEVER public.** The daemon / cron / `/study` / `/steward` / `/chat` set new pages to
`local_private` (their real domain `mode`, never `meta`). Only a **human, in an interactive session**, may mark a page
`public_system` + `mode: meta`, and only for genuine wiki-system pages. The `mode:meta` export filter is the backstop;
the human is the gate. The most-sensitive content (`restricted/`, `local/`, `graph-local.json`, raw bodies) is **never
committed or exported.**

**Broad-capture stance:** graph generously into local (every conversation → local idea-dots/abstractions; discard
only pure chatter; *uncertain → tentative*, not quarantine). The **publish boundary** (the `public_system` allowlist)
is the only hard privacy line; **sources stay local.** `tools/steward_dots.py` seeds breadth; `/steward-pending`
deepens. See [[autonomy-policy]].

## 19. Skills — the learn-as-we-go layer  · `/skill` (§17)

The wiki **learns reusable procedures as it goes** (the good idea from background-agent frameworks like Hermes,
realized **locally** — no third-party cloud; see [[operator-and-hermes]]). `03_wiki/skills/` holds `type: skill`
pages with **When to use · Procedure · Inputs/Outputs · Learned-from**, generalized + privacy-routed like everything else.

- `/skill` mints a skill from a name, a `/record-outcome`, or a deep-mined conversation ([[deep-mine-conversation]]).
- The steward + `/record-outcome` **auto-propose** a skill when a procedure recurs across **≥2** outcomes/conversations
  (Tier 1–2; uncertain → tentative). Skills link the concepts/patterns/capabilities they operationalize.
- The **recurring local operator** is `tools/steward_cron.sh` (opt-in headless deep-mine + scoped lint + public-only
  commit) — the "night shift" that drains the capture→distill backlog while keeping sources local. Cloud Hermes is
  **deferred** with explicit triggers in [[operator-and-hermes]].

**Cadence (the gist's discipline):** run the deep-mine + a **scoped lint (changed nodes + neighbours)** regularly —
weekly by hand or nightly via the cron — so capture never out-runs distill. Seeded skills: [[conversion-labeling]] ·
[[reject-first-gating]] · [[deep-mine-conversation]].

## 20. Click-to-Learn — the Eye researches what you click  · `/study` (§17)

The Cognitive Lens is an **active** learning surface: clicking a node means *"expand MY knowledge on this."* The Eye
appends a learning-intent to `09_working/learning-intent-queue.jsonl`; **`/study`** drains it (`--drain` via
`tools/study_drain.py`) and expands the subject in two waves — **internal first** (open `questions/`, missing-connection
links, a `study-plan` blueprint — ready by note-open) **then web research** (sourced new concepts) — claim-level +
privacy-scoped (Tier 0–2 auto, Tier 3 quarantine; web pulls knowledge *in*, never leaks out). It regenerates the graph
+ writes `eye-state.json --status expanding`, so the Eye **blooms** around the subject and the open card refreshes. The
steward loop / `steward_cron.sh` runs `/study --drain` to make it autonomous. Decision: [[click-to-learn]].
