#!/usr/bin/env python3
"""Configure Obsidian's native Graph view to be the categorized "eye".

Writes colour groups (per category, by folder) + a declutter filter into the vault's
`.obsidian/graph.json`, preserving Obsidian's other keys. This is the source of truth —
Obsidian rewrites graph.json when you change graph settings in the UI, so re-run this to
restore the categories (ideally with Obsidian closed; reopen to load). Stdlib only.

Usage:  python3 tools/build_obsidian_graph.py
"""
import json, os

# (label, search query, hex colour) — node belongs to the FIRST matching group, so order matters.
CATEGORIES = [
    ("SOURCES",      "path:02_sources/",                                                   "#8a8f98"),
    ("CONCEPTS",     "path:03_wiki/concepts/",                                             "#4f9dde"),
    ("PATTERNS",     "path:03_wiki/patterns/",                                             "#b07fd9"),
    ("SYNTHESIS",    "path:04_synthesis/",                                                 "#9b59b6"),
    ("PROJECTS",     "path:03_wiki/projects/ OR path:03_wiki/systems/ OR path:03_wiki/entities/", "#e0a458"),
    ("PIPELINES",    "path:03_wiki/pipelines/ OR path:03_wiki/stages/ OR path:03_wiki/interfaces/", "#7e9cff"),
    ("CAPABILITIES", "path:03_wiki/capabilities/",                                         "#2ec4b6"),
    ("OUTCOMES",     "path:03_wiki/outcomes/",                                             "#e07a5f"),
    ("DECISIONS",    "path:03_wiki/decisions/ OR path:03_wiki/contradictions/",            "#d96d6d"),
    ("GAPS",         "path:03_wiki/gaps/",                                                 "#ff4d4d"),
    ("BLUEPRINTS",   "path:05_blueprints/ OR path:03_wiki/questions/",                     "#2ecc71"),
    ("SESSIONS",     "path:03_wiki/sessions/",                                             "#b48ead"),
]

# Theme tag-groups for the steward's idea-dots (local/dots/) — so the native graph clusters by the SAME
# constellations as the Cognitive Lens. Dots carry `tags: [dot, <theme>, chatgpt]`; the path CATEGORIES above win
# for wiki pages, these colour the dots. Colours drawn from the Lens palette. (Native graph = the full LOCAL graph.)
THEME_GROUPS = [
    ("th-domain-a", "tag:#domain-a", "#d96d6d"),
    ("th-domain-b", "tag:#domain-b", "#ff4d4d"),
    ("th-ai-engineering",     "tag:#ai-engineering",     "#4f9dde"),
    ("th-domain-c", "tag:#domain-c", "#e0a458"),
    ("th-domain-d", "tag:#domain-d", "#2ecc71"),
    ("th-creative-design",    "tag:#creative-design",    "#b07fd9"),
    ("th-writing-career",     "tag:#writing-career",     "#9b59b6"),
    ("th-coding-dev",         "tag:#coding-dev",         "#2ec4b6"),
    ("th-learning",           "tag:#learning",           "#7e9cff"),
    ("th-life-strategy",      "tag:#life-strategy",      "#e07a5f"),
    ("th-misc",               "tag:#misc",               "#5b6b80"),
]

# Force/display settings that make the global graph read as a round "eye" (iris).
EYE_FORCES = {
    "showOrphans": False,        # drop stray/empty notes so the iris stays tight
    "showTags": False,
    "showAttachments": False,
    "centerStrength": 0.9,       # strong pull to centre → round blob
    "repelStrength": 8,
    "linkStrength": 1,
    "linkDistance": 180,
    "nodeSizeMultiplier": 1.1,   # hubs (more links) render bigger → a natural pupil
}

# --- declutter filter ---------------------------------------------------------------------------
# DANGER: Obsidian path-matching is CASE-INSENSITIVE SUBSTRING. A bare `-path:"CLAUDE"` matches the
# vault folder "Claude-Wiki" and hides the ENTIRE wiki (the 3-dots bug). So:
#   - exclude FOLDERS with a trailing slash (none are substrings of the wiki folder name), and
#   - exclude control FILES by their full "<Wiki>/<file>.md" path (specific, never matches the folder).
def build_filter(wiki):
    folders = ["01_raw/", "06_templates/", "09_working/", "08_maintenance/", "00_inbox/"]
    # NOTE: local/ + restricted/ are intentionally NOT excluded — the native graph is the FULL LOCAL graph (the Eye
    # uses everything). Only the per-folder README stubs are dropped so they don't become junk nodes.
    files = ["CLAUDE.md", "index.md", "README.md", "log.md", "local/README.md", "restricted/README.md"]
    terms = [f'-path:"{f}"' for f in folders] + [f'-path:"{wiki}/{f}"' for f in files]
    return " ".join(terms)

def rgb_int(hex_):
    h = hex_.lstrip("#")
    return (int(h[0:2], 16) << 16) | (int(h[2:4], 16) << 8) | int(h[4:6], 16)

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    wiki = os.path.basename(os.path.normpath(os.path.join(here, "..")))  # "Claude-Wiki"
    path = os.path.normpath(os.path.join(here, "..", "..", ".obsidian", "graph.json"))
    cfg = {}
    if os.path.exists(path):
        try: cfg = json.load(open(path, encoding="utf-8"))
        except Exception: cfg = {}
    cfg["search"] = build_filter(wiki)
    cfg["colorGroups"] = [{"query": q, "color": {"a": 1, "rgb": rgb_int(c)}} for (_, q, c) in CATEGORIES + THEME_GROUPS]
    cfg.update(EYE_FORCES)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)
    print(f"wrote {path} — {len(CATEGORIES) + len(THEME_GROUPS)} colour groups ({len(CATEGORIES)} category + {len(THEME_GROUPS)} theme) + eye forces + safe filter (wiki={wiki})")

    # If the Juggl plugin ("detailed eye") is installed, sync our version-controlled stylesheet
    # into it (Juggl reads .obsidian/plugins/juggl/graph.css). No-op until Juggl is installed.
    src = os.path.join(here, "..", "07_visualizer", "juggl-graph.css")
    juggl = os.path.normpath(os.path.join(here, "..", "..", ".obsidian", "plugins", "juggl"))
    if os.path.isdir(juggl) and os.path.exists(src):
        with open(src, encoding="utf-8") as a, open(os.path.join(juggl, "graph.css"), "w", encoding="utf-8") as b:
            b.write(a.read())
        print("synced 07_visualizer/juggl-graph.css -> .obsidian/plugins/juggl/graph.css (detailed eye)")

    print("Reopen Obsidian (or reload) to see it. Changing graph settings in the UI overwrites this; re-run to restore.")

if __name__ == "__main__":
    main()
