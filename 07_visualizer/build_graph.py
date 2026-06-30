#!/usr/bin/env python3
"""Derive the wiki graph from YAML frontmatter + [[wikilinks]] — in TWO privacy scopes.

Stdlib only. Implements CLAUDE.md §14 + §18.

  graph-local.json   = EVERYTHING (03_wiki + 04_synthesis + 05_blueprints + 02_sources + restricted/ + local/).
                       Git-ignored. Powers the Cognitive Lens (the Eye needs the full personal mass).
  graph-public.json  = ONLY nodes explicitly tagged `privacy_scope: public_system` (a strict ALLOWLIST).
                       Committed. The shareable "how to build a self-learning wiki" system graph — no personal data.

Rule: "Graph everything locally. Publish only the system logic." A node is public ONLY if it says so; default = local.

Usage:  python3 build_graph.py [--scope local|public|both] [YYYY-MM-DD]
"""
import os, re, json, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # Claude-Wiki/

args = [a for a in sys.argv[1:]]
SCOPE = "both"
if "--scope" in args:
    i = args.index("--scope")
    SCOPE = args[i + 1]
    del args[i:i + 2]
GENERATED = args[0] if args else "unknown"

# Knowledge layers that become graph nodes. restricted/ + local/ are LOCAL-ONLY (git-ignored).
PUBLIC_DIRS = ["02_sources/source-summaries", "02_sources/source-maps", "03_wiki", "04_synthesis", "05_blueprints"]
LOCAL_ONLY_DIRS = ["restricted", "local"]
INCLUDE_DIRS = PUBLIC_DIRS + LOCAL_ONLY_DIRS
INCLUDE_FILES = ["07_visualizer/eye-layout-spec.md", "07_visualizer/style-references/cognition-aesthetic.md"]
EXCLUDE_FROM_RAW = {"01_raw", "06_templates", "09_working"}

FM_RE = re.compile(r"^---\n(.*?)\n---", re.S)
LINK_RE = re.compile(r"\[\[([^\]]+?)\]\]")
FENCE_RE = re.compile(r"```.*?```", re.S)
INLINE_CODE_RE = re.compile(r"`[^`\n]*`")


def strip_code(t):
    return INLINE_CODE_RE.sub("", FENCE_RE.sub("", t))


def excerpt(text):
    body = strip_code(FM_RE.sub("", text, count=1))
    for line in body.splitlines():
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("|"):
            continue
        if s.startswith(">"):
            s = s.lstrip(">").strip()
        if s.startswith(("-", "*", "•")) or not s:
            continue
        s = re.sub(r"\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]", lambda m: m.group(2) or m.group(1), s)
        s = re.sub(r"[*_`#]", "", s).strip()
        if len(s) >= 8:
            return s[:160]
    return ""


def parse_fm(text):
    m = FM_RE.match(text)
    fm = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line and not line.startswith(" "):
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip().strip('"')
    return fm


def slug(s):
    s = s.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    return s.strip("-")


def cluster_of(fm, nid):
    # Cognition Field clustering: idea-dots cluster by their THEME (2nd tag); theme hubs ARE their theme
    # (the cluster centre). Everything else returns None → the Lens falls back to its category.
    parts = [t.strip() for t in fm.get("tags", "").strip("[]").split(",") if t.strip()]
    if "dot" in parts and len(parts) >= 2:
        return parts[1]
    if "hub" in parts:
        return nid
    return None


# every existing page stem (to skip links to ungraphed-but-real pages)
existing_stems = set()
for dp, dns, fns in os.walk(ROOT):
    if any(seg in EXCLUDE_FROM_RAW for seg in os.path.relpath(dp, ROOT).split(os.sep)):
        continue
    for fn in fns:
        if fn.endswith(".md"):
            existing_stems.add(os.path.splitext(fn)[0].lower())

paths = []
for d in INCLUDE_DIRS:
    for dp, _, fns in os.walk(os.path.join(ROOT, d)):
        paths += [os.path.join(dp, f) for f in fns if f.endswith(".md") and f.lower() != "readme.md"]
paths += [os.path.join(ROOT, f) for f in INCLUDE_FILES if os.path.exists(os.path.join(ROOT, f))]


def default_scope(rel):
    if rel.startswith("restricted/"):
        return "restricted_private"
    if rel.startswith("local/"):
        return "local_private"
    return "local_private"          # conservative: untagged committed pages are LOCAL for export (never public)


nodes, title_to_id, raw = {}, {}, {}
for p in sorted(paths):
    rel = os.path.relpath(p, ROOT).replace(os.sep, "/")
    text = open(p, encoding="utf-8").read()
    fm = parse_fm(text)
    nid = os.path.splitext(os.path.basename(p))[0]
    title = fm.get("title", nid)
    psc = fm.get("privacy_scope") or default_scope(rel)
    gsc = fm.get("graph_scope") or ("public" if psc == "public_system" else "local")
    if gsc == "none":
        continue
    nodes[nid] = {"id": nid, "title": title, "type": fm.get("type", "concept"),
                  "iris_ring": fm.get("iris_ring", "outer"), "mode": fm.get("mode", "meta"),
                  "status": fm.get("status", "active"), "updated": fm.get("updated", ""),
                  "excerpt": excerpt(text), "exists": True, "path": rel,
                  "privacy_scope": psc, "graph_scope": gsc}
    for rk in ("review_due", "interval", "ease", "last_reviewed"):   # spaced-repetition schedule, if seeded
        if fm.get(rk):
            nodes[nid][rk] = fm[rk]
    cl = cluster_of(fm, nid)
    if cl:
        nodes[nid]["cluster"] = cl
    if fm.get("type") == "pipeline" and fm.get("stages"):
        nodes[nid]["seq"] = [slug(m) for m in re.findall(r"\[\[([^\]|#]+)", fm["stages"])]
    title_to_id[title.lower()] = nid
    title_to_id[nid.lower()] = nid
    raw[nid] = text


def resolve(target):
    t = target.split("|")[0].split("#")[0].strip()
    if t.lower() in title_to_id:
        return title_to_id[t.lower()], True, None
    sl = slug(t)
    if sl in nodes:
        return sl, True, None
    if sl in title_to_id:
        return title_to_id[sl], True, None
    if sl in existing_stems:
        return None, None, None
    return sl, False, t


edges, seen, forward = [], set(), {}
for nid, text in raw.items():
    for m in LINK_RE.finditer(strip_code(text)):
        tid, exists, disp = resolve(m.group(1))
        if tid is None or tid == nid:
            continue
        if exists is False and tid not in nodes and tid not in forward:
            forward[tid] = {"id": tid, "title": disp, "type": "concept", "iris_ring": "outer",
                            "mode": "meta", "exists": False, "privacy_scope": "local_private", "graph_scope": "local"}
        if (nid, tid) not in seen:
            seen.add((nid, tid))
            edges.append({"source": nid, "target": tid, "type": "wikilink"})


def write(path, all_nodes, all_edges, scope):
    json.dump({"$schema": "internal://claude-wiki/graph", "version": 2, "scope": scope, "generated": GENERATED,
               "note": "Auto-generated by build_graph.py (CLAUDE §14/§18). scope=local includes private+restricted "
                       "and is git-ignored; scope=public is the public_system allowlist only. Visual encoding: "
                       "../graph-manifest.json.",
               "nodes": all_nodes, "edges": all_edges},
              open(os.path.join(ROOT, path), "w"), indent=2)
    open(os.path.join(ROOT, path), "a").write("\n")


local_nodes = list(nodes.values()) + list(forward.values())
local_edges = list(edges)                                                        # inferred pathways merge into LOCAL only (never public)
_inf = os.path.join(ROOT, "07_visualizer", "graph-inferred.json")
if os.path.exists(_inf):
    try:
        _ie = json.load(open(_inf, encoding="utf-8")).get("edges", [])
        _nset = {n["id"] for n in local_nodes}
        _pairs = {(e["source"], e["target"]) for e in edges} | {(e["target"], e["source"]) for e in edges}
        _ic = 0
        for e in _ie:
            s, t = e.get("source"), e.get("target")
            if s in _nset and t in _nset and (s, t) not in _pairs:
                local_edges.append({"source": s, "target": t, "type": "inferred",
                                    "score": e.get("score"), "reason": e.get("reason", "")})
                _ic += 1
        if _ic:
            print(f"[local]  + {_ic} inferred pathways merged (local-only, type=inferred)")
    except Exception as _ex:
        print(f"[local]  inferred merge skipped: {_ex}")
if SCOPE in ("local", "both"):
    write("07_visualizer/graph-local.json", local_nodes, local_edges, "local")
    by = {}
    for n in local_nodes:
        by[n["privacy_scope"]] = by.get(n["privacy_scope"], 0) + 1
    fwd = sum(1 for n in local_nodes if not n.get("exists", True))
    print(f"[local]  nodes={len(local_nodes)} (forward={fwd}) edges={len(local_edges)} · by_scope={by}  -> graph-local.json (git-ignored)")

if SCOPE in ("public", "both"):
    # PUBLISH POLICY: only the SYSTEM that makes up the wiki itself (mode:meta) may go public — never created
    # knowledge/sources. This is the backstop behind tools/enforce_public_meta.py (so a future mis-scoped autonomous
    # page can't slip out). See CLAUDE §18.
    pub_ids = {nid for nid, n in nodes.items() if n["privacy_scope"] == "public_system" and n.get("mode") == "meta"}
    pub_nodes = [nodes[i] for i in pub_ids]
    pub_edges = [e for e in edges if e["source"] in pub_ids and e["target"] in pub_ids]
    write("07_visualizer/graph-public.json", pub_nodes, pub_edges, "public")
    excluded = len(nodes) - len(pub_nodes)
    print(f"[public] nodes={len(pub_nodes)} edges={len(pub_edges)}  -> graph-public.json (committed)")
    print(f"         PRIVACY AUDIT: {excluded} local/private/restricted nodes EXCLUDED from public export "
          f"({len(pub_nodes)} public_system shared).")
