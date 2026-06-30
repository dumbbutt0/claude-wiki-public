---
description: Infer + surface NEW connections between related-but-unlinked ideas (fast tag/term overlap), render them as dashed pathways in the Lens, and optionally promote the strongest to real [[wikilinks]].
argument-hint: "[--show | --promote N | <topic>]"
allowed-tools: Read, Grep, Glob, Bash(python3:*), Edit, Write
---

You are running **link inference** — *connect ideas as fast as possible*. Argument: **$ARGUMENTS**

## Default / `--show` — surface the pathways
1. `python3 tools/infer_links.py` — fast **tag + shared-term overlap** → writes `07_visualizer/graph-inferred.json`
   (local-only, `type:"inferred"`) and prints the strongest new pathways.
2. `python3 07_visualizer/build_graph.py --scope local` — merge the inferred edges into `graph-local.json`. The Eye
   renders them as **dashed cool-teal "suggested" pathways** (they stay **out** of the public graph; structural layout
   is unaffected).
3. Report: how many pathways, the top ~8 (with their shared terms), and which read like *genuine missing links* worth promoting.

## `--promote N` (or a `<topic>`) — turn suggestions into real links
For the top N inferred pathways (or those touching the named topic), judge each: is it a **real missing connection**, or
just generic-word overlap? For each that's real:
- Add a real **`[[wikilink]]`** in the more-relevant page's body or `related:` frontmatter — **Tier 1** (links between
  existing concepts).
- **Narrate it to the Eye** as you go: `python3 tools/eye_state.py --status composing --building "connecting <a> ↔ <b>" --edges "<a>|<b>" --active "<a>,<b>"` — the user *watches the pathway form* (Phase 3 runtime glow).
- **Privacy:** a link added to a `public_system` page may only point to another `public_system` page; never link a
  public page to a private one (keep that connection local).
- Rebuild `--scope both`, leakage-gate, `verify.js`, update `log.md`.
Skip the noise (shared only structural words like "next/actions/pipeline"). Report promoted vs skipped.

## Notes
- Inferred links **never touch page text** unless you `--promote`; the dashed overlay is fully reversible (re-run, or
  delete `graph-inferred.json`).
- Re-run anytime as the graph grows. Cf. [[living-lens-and-chat]] (Phase 2), [[ide-for-thought-assessment]] (compounding).
