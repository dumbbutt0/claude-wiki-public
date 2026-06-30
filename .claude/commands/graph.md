---
description: Regenerate graph-export.json (the machine-readable graph for integrity) and refresh Obsidian's native Graph config (category colours + filter). Reports dangling edges / forward-links. Wraps 07_visualizer/build_graph.py + tools/build_obsidian_graph.py (CLAUDE.md §14/§15).
argument-hint: "[date (YYYY-MM-DD, optional)]"
allowed-tools: Bash(python3:*), Bash(date:*)
---

Regenerating the graph (date: `${1:-today}`):

```!
D="${1:-$(date +%F)}"
python3 07_visualizer/build_graph.py "$D"
python3 tools/build_obsidian_graph.py
python3 - <<'PY'
import json,os
d=json.load(open("07_visualizer/graph-export.json"))
ids={n["id"] for n in d["nodes"]}
dangling=[(e["source"],e["target"]) for e in d["edges"] if e["source"] not in ids or e["target"] not in ids]
bad=[n["id"] for n in d["nodes"] if n.get("exists") and not os.path.exists(n.get("path",""))]
fwd=sorted(n["id"] for n in d["nodes"] if not n.get("exists"))
print("valid JSON | dangling:", dangling or "none", "| missing paths:", bad or "none")
print("forward-links:", fwd or "none (fully resolved)")
print("nodes:", len(d["nodes"]), "edges:", len(d["edges"]))
PY
```

Report the result above in one line. Dangling edges / missing paths → something `/lint` should resolve.
The **Obsidian graph config** was refreshed (category colours + declutter filter) — reopen / reload Obsidian
to see it. Note: changing graph settings in Obsidian's UI overwrites the config, so re-run `/graph` (or
`python3 tools/build_obsidian_graph.py`) to restore it. The visualization IS Obsidian's native graph
([[eye-layout-spec]]); there is no browser app.
