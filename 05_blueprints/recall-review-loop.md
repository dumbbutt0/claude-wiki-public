---
title: "Recall/Review Loop — active-recall spaced repetition"
aliases: ["Recall/Review Loop", "recall-review-loop", "review loop", "spaced repetition"]
type: blueprint
status: proposed
created: 2026-06-28
updated: 2026-06-28
sources: []
source_count: 0
tags: [blueprint, learning, spaced-repetition, eye]
related: ["[[ide-for-thought-assessment]]", "[[deliberate-practice]]", "[[reinforcement-learning-verifiable-rewards]]", "[[llm-self-verification]]", "[[source-answer-key-eval]]", "[[click-to-learn]]", "[[deep-glossary]]"]
iris_ring: inner
mode: ai-engineering
steward: auto
autonomy_tier: 2
claim_class: interpretive
confidence: 0.7
privacy_scope: public_system
graph_scope: public
provenance: ["spec'd from [[ide-for-thought-assessment]] gap #2 (captures-but-doesn't-teach); review style = active-recall (owner-confirmed)"]
---

# Recall/Review Loop — active-recall spaced repetition  *(blueprint · PRIORITY)*

## Problem
The wiki **captures** knowledge beautifully but never **tests retention** — no spaced repetition, no recall drilling
(confirmed: zero `review_due|interval|ease|sm2` machinery exists). A glossary entry written ≠ a concept learned. This
closes the #1 *learning* gap in [[ide-for-thought-assessment]]. The irony to fix: [[deliberate-practice]] (target +
immediate feedback + repetition) was researched but never applied **to the owner**.

## Principle — grade against the page, not against yourself
Active recall, **not** self-rating. The system generates a question, the owner answers, and the answer is graded
**against the concept's page + its `sources:`** — the page *is* the verifiable answer key. This is
[[source-answer-key-eval]] / [[reinforcement-learning-verifiable-rewards|RLVR]] discipline applied to learning, and it
deliberately avoids the self-judgment weakness proven in [[llm-self-verification]] (naive self-rating can score worse
than guessing).

## Architecture — mirror the click-to-learn loop, don't rebuild
Reuse the existing capture→queue→drain→bloom machinery; add a *schedule* and a *grader*.

### 1 · Schedule state (SM2, in the page frontmatter)
Add to reviewable pages (glossary + concepts): `review_due: YYYY-MM-DD` · `interval` (days) · `ease` (default `2.5`) ·
`last_reviewed` · `review_attempts`. New pages seed `review_due = created + 3d`. SM2 update on grade `q` (0–5):
`ease' = max(1.3, ease + 0.1 − (5−q)(0.08 + (5−q)·0.02))`; `interval' = 1` if `q<3`, else `q`-th success →
`prev·ease`. `review_due = today + interval'`.

### 2 · `tools/review_select.py`  (NEW — mirror of `tools/study_drain.py`)
- Scan `03_wiki/glossary/`, `local/glossary/`, `03_wiki/concepts/` for pages with `review_due ≤ today` (or unseeded).
- Print the N most-overdue (most-overdue first): `id\ttitle\tdue\tease`.
- `--grade <id> <0-5>` → the **only** writer of the SM2 fields: recompute + rewrite that page's frontmatter in place.

### 3 · `/review` command  (`.claude/commands/review.md`, NEW — mirror of `study.md`)
Usage `/review [topic | --due]`. For each due concept:
1. Read its page + `sources:`.
2. **Generate one active-recall question** (definition / mechanism / "when would you reach for this" / a discriminating
   contrast with a sibling concept).
3. Owner answers in their own words.
4. **Grade 0–5 against the page+sources** — cite what was right/missing; never invent beyond the page.
5. `python3 tools/review_select.py --grade <id> <q>` reschedules; `eye_state.py --status reviewing --focus <id>`.
6. If a recurring miss reveals a real knowledge gap → optionally spawn `/study` on it (re-uses click-to-learn).

### 4 · Eye integration  (`wiki-eye-plugin/main.js`)
- Read `review_due` from the node (build_graph emits it — see below); render a subtle **"due" ring/pulse** on overdue
  nodes (distinct from the hot/active glow).
- **Click a due node → trigger `/review` on it**: reuse the click→queue channel (`queueLearning()` at `main.js:926`)
  writing a parallel `09_working/review-queue.jsonl` (same shape as `learning-intent-queue.jsonl`), drained by
  `review_select.py`.

### 5 · `build_graph.py` (~5-line change at the node-emit block, `:125-132`)
Emit the review fields if present: `review_due`, `interval`, `ease`, `last_reviewed` → so the Eye can show "due".

### 6 · Cron  (`tools/steward_cron.sh`)
Add a `claude -p "/review --due"` step — the night-shift surfaces what's due so a morning session is a ready drill set.

## Privacy
Drills are local working memory. The SM2 schedule lives in each page's frontmatter (public pages carry public review
fields — harmless; local pages stay local). No edge enters a question.

## Files
`tools/review_select.py` (new) · `.claude/commands/review.md` (new) · `07_visualizer/build_graph.py` (emit review fields)
· `07_visualizer/wiki-eye-plugin/main.js` (due-pulse + click→review) · `CLAUDE.md` (§ review loop) ·
`tools/steward_cron.sh` (add `/review --due`) · `index.md` / `log.md`.

## Verification
Seed `review_due` on 3 glossary pages (one overdue) → `python3 tools/review_select.py --n 3` lists them →
`/review --due` generates a question → answer → grade → the page's `review_due`/`interval`/`ease` advance per SM2 →
reload Obsidian → the Eye shows the due pulse, clearing after review → `verify.js` 26/26.

## Why this is #1
It is the single change that converts the system from a **library** (stores for you) into a **tutor** (grows *with*
you) — the core of the original vision. Everything else (zoom, maintenance) makes the library better; only this makes
*you* better.
