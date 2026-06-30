---
description: Active-recall spaced-repetition review — drill a due concept, grade the answer against its page+sources, reschedule via SM2
argument-hint: "[topic | --due]"
allowed-tools: Read, Grep, Glob, Bash(python3:*)
---

# /review — active recall, graded against the page (not against yourself)

The **recall/review loop** ([[recall-review-loop]]): the wiki *captures* knowledge but never *tests retention*. This
closes that gap. The system asks, **you** answer in your own words, and the answer is graded **against the concept's
page + its `sources:`** — the page *is* the verifiable answer key ([[evaluation-rubric-method]] /
[[reinforcement-learning-verifiable-rewards|RLVR]]). This is **answer-key discipline, NOT self-rating**: naive
self-judgment can score worse than guessing ([[llm-self-verification]]). Grade only what the page+sources support;
**never invent beyond them.**

## Usage `/review [topic | --due]`

- `--due` — drill what the schedule surfaces: `python3 tools/review_select.py --n 3` → the most-overdue concepts.
- `[topic]` — drill a named glossary/concept page now (its `id` = its filename stem).

## Per concept — the drill

1. **Read** the page + the URLs in its `sources:` (Read / WebFetch). This is the answer key — load it before asking.
2. **Generate ONE active-recall question** — pick the angle that probes understanding, not recognition:
   *definition* · *mechanism* ("how/why does it work") · *"when would you reach for this?"* · or a **discriminating
   contrast** with a sibling concept (what distinguishes it from a near-neighbour in its `related:`).
3. **You answer** in your own words. (No multiple choice — recall, not recognition.)
4. **GRADE 0–5 against the page+sources** — cite *what was right* and *what was missing or wrong*, quoting the page.
   This is RLVR/answer-key grading, not vibes: **NEVER** credit or penalize anything the page+sources don't support
   ([[reinforcement-learning-verifiable-rewards]] + [[llm-self-verification]]). Rubric: **5** complete + precise ·
   **4** correct, minor gap · **3** core right, notable gap · **2** partial · **1** fragment · **0** blank/wrong.
5. **Reschedule (SM2):** `python3 tools/review_select.py --grade <id> <q> --today <YYYY-MM-DD>` — the only writer of
   the schedule; it advances `interval/ease/review_due/last_reviewed/review_attempts` in the page's frontmatter.
6. **Bloom the Eye:** `python3 tools/eye_state.py --status reviewing --focus <id>`.
7. **Gap → study:** if a *recurring* miss reveals a real knowledge gap (not just a slip), suggest `/study <id>` to
   deepen it (re-uses the click-to-learn loop) — but the drill itself stays read-only; it never writes wiki content.

## Safety + scope ([[CLAUDE]] §18/§20)

- **Grade against the answer key only.** Quote the page/sources for every credit or deduction; never fabricate a
  "correct answer" the page doesn't contain. `--grade` is the **sole** SM2 writer — the loop touches no other content.
- Local pages stay local: a drill reads `restricted/`+`local/` pages but **no private specifics ever enter a question
  or leaves the session**. Public pages carry public review fields (harmless schedule metadata).

## Result

End by reporting **how many concepts reviewed** + a **next-due summary** (re-run `python3 tools/review_select.py --n 3`
to show what remains). Over sessions this turns the **library** (stores for you) into a **tutor** (grows *with* you).
See [[recall-review-loop]] · [[deliberate-practice]] · [[ide-for-thought-assessment]].
