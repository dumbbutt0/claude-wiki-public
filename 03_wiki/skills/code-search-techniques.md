---
title: Code-Search Techniques (find strings across repos & GitHub)
aliases: ["Code-Search Techniques (find strings across repos & GitHub)", "code-search-techniques", "Code Search Techniques"]
type: skill
status: active
created: 2026-06-29
updated: 2026-06-29
sources: []
source_count: 0
tags: [skill, coding-dev, search, git, github, audit]
related: ["coding-dev", "efficient-github-string-search", "audit-repository", "[[codebase-self-evaluation]]", "[[invariant-families-over-categories]]"]
iris_ring: middle
mode: meta
steward: auto
autonomy_tier: 1
claim_class: interpretive
confidence: 0.7
privacy_scope: public_system
graph_scope: public
provenance: ["/study --drain on efficient-github-string-search (click-to-learn, 2026-06-29)"]
---

# Code-Search Techniques — find strings across repos & GitHub

> Distilled from the idea-dot efficient-github-string-search (*"the most efficient way to search for certain
> strings in a GitHub path"*). Pure generalizable methodology — the technique, not any target. Feeds the coding-dev
> theme and the audit pipeline's discovery step (audit-repository). Live-source citations deferred to Wave-2.

## When to use
You need to locate a literal string, symbol, pattern, or *when something was introduced/removed* — across a local
checkout, across history, or across many remote repos you don't have cloned. Choosing the **right tool for the
locus** is the whole skill: searching working-tree text, searching history, and searching remote-at-scale are three
different problems.

## Procedure — pick by locus

**1. Local working tree → `ripgrep` (`rg`).** Fastest content search; respects `.gitignore`, skips binaries by
default. Key flags: `-i` (case-insensitive), `-w` (whole word), `-F` (fixed string, no regex), `-g '<glob>'` /
`-g '!<glob>'` (include/exclude paths), `-t <type>` (e.g. `-t sol`, `-t py`), `-l` (filenames only),
`-A/-B/-C n` (context lines). For symbols specifically, prefer a structural/AST tool (`ast-grep`, language LSP, or
`ctags`) over text regex — it won't match comments and strings.

**2. Across history (when, by whom, in which commit) → git's "pickaxe".**
- `git log -S '<string>'` — commits that change the **count** of occurrences of a string (added or removed). The way
  to answer *"when did this literal first appear / get deleted?"*
- `git log -G '<regex>'` — commits whose **diff** matches a regex (broader than `-S`).
- Add `-p` to see the diffs, `--all` to span every ref, `-- <path>` to scope. `git grep '<pat>' <rev>` searches the
  tree *at a given revision* (much faster than checking out).

**3. Remote, at scale (repos you haven't cloned) → GitHub code search.**
- Web/`gh search code` qualifiers: `path:`, `language:`, `repo:owner/name`, `org:`, `filename:`, `extension:`,
  and quoted phrases for exact strings. The newer GitHub code search supports richer query syntax (boolean `AND`/`OR`/
  `NOT`, some regex with `/…/`).
- **Caveat (verify in GitHub docs — numbers change):** indexed code search covers a *subset* of repos/files and has
  documented limits on file size, result counts, and which content is indexed; it is **not** a guarantee of total
  recall. For exhaustive certainty on one repo, clone and `rg` it.
- The REST/GraphQL **search API** is the programmatic path (what a pipeline like audit-repository would call),
  subject to rate limits and the same index scope.

## Inputs / Outputs
- **In:** a target string/pattern + the locus (this tree · this history · the open ecosystem) + scope filters
  (language, path, org).
- **Out:** file:line hits (local), the introducing/removing commit (history), or a candidate-repo list (remote) —
  feed into reading ([[codebase-self-evaluation]]) or auditing (audit-repository).

## Decision shortcut
*Is it on my disk now?* → `rg`. *Is it about a change over time?* → `git log -S/-G`. *Is it "who else on GitHub has
this?"* → GitHub code search / API, then clone the hits and `rg` for certainty.

## Open question
What's the **recall vs. cost** tradeoff for an audit-discovery sweep — when is GitHub's indexed search "good enough"
vs. when must you clone-and-grep a candidate set? (a real fixture for [[evaluate-tool-effectiveness]].)

## Learned-from
- efficient-github-string-search — the seeding dot (ChatGPT archive, 2024-07-30).
- **Wave-2 deferred:** confirm GitHub code search's *current* indexing limits, regex support, and API rate limits
  against `docs.github.com` (WebSearch not permitted this run; no numbers asserted that need a live source).
