---
description: Health-check the wiki — regenerate the graph and surface contradictions, orphans, stale claims, duplicate concepts, missing frontmatter, draft stubs, and dangling links. Then fix/record findings. Follows CLAUDE.md §9.
allowed-tools: Read, Edit, Write, Bash(python3:*), Bash(grep:*), Bash(date:*)
---

You are running the **lint workflow** ([@CLAUDE.md](../../CLAUDE.md) §9). Live signals:

```!
D=$(date +%F)
echo "== graph (regenerated) =="
python3 07_visualizer/build_graph.py "$D"
python3 - <<'PY'
import json
d=json.load(open("07_visualizer/graph-export.json"))
ids={n["id"] for n in d["nodes"]}
dangling=[(e["source"],e["target"]) for e in d["edges"] if e["source"] not in ids or e["target"] not in ids]
fwd=sorted(n["id"] for n in d["nodes"] if not n.get("exists"))
deg={}
for e in d["edges"]:
    deg[e["source"]]=deg.get(e["source"],0)+1; deg[e["target"]]=deg.get(e["target"],0)+1
orphans=sorted(n["id"] for n in d["nodes"] if deg.get(n["id"],0)==0)
print("dangling edges:", dangling or "none")
print("forward-links (unwritten):", fwd or "none")
print("graph orphans (0 links):", orphans or "none")
PY
echo "== pages missing frontmatter (wiki only) =="
grep -rL '^---' . --include='*.md' --exclude-dir=01_raw --exclude-dir=.claude --exclude-dir=09_working || echo "none"
echo "== draft stubs =="
grep -rl 'status: draft' 02_sources 03_wiki 04_synthesis 05_blueprints 2>/dev/null || echo "none"
echo "== open contradictions =="
grep -rl 'status: open' 03_wiki/contradictions 2>/dev/null || echo "none"
```

Using the signals above:
1. **Triage each finding.** Real contradictions → record/update `03_wiki/contradictions/`
   (never resolve silently). Orphans/dangling → fix the links or note expected forward-links.
   Stale claims → check against `01_raw/` and flag. Duplicate concepts → propose a merge.
2. **Update the maintenance pages** in `08_maintenance/` (`lint-report.md`, `orphan-pages.md`,
   `stale-claims.md`, `duplicate-concepts.md`) with a dated pass.
3. **Append `log.md`**: `## [<date>] lint | <summary>`.
4. Report a short health verdict (what's clean, what needs attention). Don't fabricate
   problems — if a signal is empty, say so.
