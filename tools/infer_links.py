#!/usr/bin/env python3
"""infer_links.py — FAST link inference: connect related-but-unlinked idea nodes via tag + shared-term overlap.

Reads 07_visualizer/graph-local.json (nodes + existing wikilink edges) + each node's frontmatter (tags/aliases),
scores pairwise overlap with a df-weighted (TF-IDF-ish) signal, and writes the strongest NEW pathways to
07_visualizer/graph-inferred.json as {source, target, type:"inferred", score, reason}. No API, no page-text edits,
fully reversible, local-only (kept out of the public graph). The Eye renders these as dashed "suggested" pathways.

  python3 tools/infer_links.py [--per-node 5] [--min 0.9] [--df-cap 40] [--top 0]
"""
import argparse, json, os, re, math
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRAPH = os.path.join(ROOT, "07_visualizer", "graph-local.json")
OUT = os.path.join(ROOT, "07_visualizer", "graph-inferred.json")

STOP = set((
    "the a an of and or to for in on with at by from as is are be it its this that these those how what why when "
    "my your our their his her i you we they he she them us not no yes can will would should could into over out "
    "up down off about via using use used new old more most some any all one two three plus vs etc study plan idea "
    "dot note page concept system data based").split())

TAGS_RE = re.compile(r"^tags:\s*\[(.*?)\]", re.M)
ALIAS_RE = re.compile(r"^aliases:\s*\[(.*?)\]", re.M)


def features(title, aliases, tags):
    f = {}
    for tg in tags:
        t = tg.strip().lower()
        if t and t not in ("dot", "hub"):
            f[("tag", t)] = 2.0                                  # tags are the strong signal
    for w in re.findall(r"[a-z0-9][a-z0-9\-]{2,}", " ".join([title] + aliases).lower()):
        if w in STOP or len(w) < 3:
            continue
        f.setdefault(("term", w), 1.0)                           # title/alias tokens: medium signal
    return f


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-node", type=int, default=5)
    ap.add_argument("--min", type=float, default=0.9)
    ap.add_argument("--df-cap", type=int, default=40)
    ap.add_argument("--top", type=int, default=0)                # 0 = no global cap
    ap.add_argument("--semantic", action="store_true", help="blend in TF-IDF meaning-similarity (graph-semantic index)")
    a = ap.parse_args()

    g = json.load(open(GRAPH, encoding="utf-8"))
    nodes = {n["id"]: n for n in g["nodes"]}
    existing = set()
    for e in g.get("edges", []):
        if e.get("type") == "inferred":                         # exclude only STRUCTURAL links — re-runs must not shrink as prior inferred merge into graph-local
            continue
        existing.add((e["source"], e["target"]))
        existing.add((e["target"], e["source"]))

    feats = {}
    for nid, n in nodes.items():
        if not n.get("exists", True):
            continue
        tags, aliases = [], []
        p = n.get("path")
        if p:
            try:
                head = open(os.path.join(ROOT, p), encoding="utf-8").read(1400)   # frontmatter region only
                m = TAGS_RE.search(head)
                if m:
                    tags = [x.strip().strip('"').strip("'") for x in m.group(1).split(",") if x.strip()]
                m = ALIAS_RE.search(head)
                if m:
                    aliases = [x.strip().strip('"').strip("'") for x in m.group(1).split(",") if x.strip()]
            except Exception:
                pass
        if n.get("cluster"):
            tags.append(n["cluster"])                            # theme as a tag-like feature
        feats[nid] = features(n.get("title", nid), aliases, tags)

    index = defaultdict(list)                                    # feature -> node ids
    for nid, fs in feats.items():
        for f in fs:
            index[f].append(nid)

    scores, shared = defaultdict(float), defaultdict(list)
    for f, ids in index.items():
        df = len(ids)
        if df < 2 or df > a.df_cap:                              # skip rare-noise + ubiquitous-generic features
            continue
        w = (2.0 if f[0] == "tag" else 1.0) / math.log2(2 + df)  # rarer = stronger
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                x, y = ids[i], ids[j]
                key = (x, y) if x < y else (y, x)
                scores[key] += w
                shared[key].append(f[1])

    if a.semantic:                                               # blend in meaning-similarity (synonyms grep/tags miss)
        try:
            import sys
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            import semantic_index as si
            from sklearn.metrics.pairwise import cosine_similarity
            sids, X, _vec, _t = si.load()
            sim = cosine_similarity(X)
            for i, nid in enumerate(sids):
                row = sim[i]
                order = row.argsort()[::-1]
                added = 0
                for j in order:
                    if sids[j] == nid:
                        continue
                    if row[j] < 0.20 or added >= a.per_node:
                        break
                    x, y = (nid, sids[j]) if nid < sids[j] else (sids[j], nid)
                    if (x, y) in existing:
                        continue
                    scores[(x, y)] += float(row[j]) * 2.2
                    shared[(x, y)].append("≈meaning")
                    added += 1
            print("  + semantic similarity blended")
        except Exception as ex:
            print(f"  semantic blend skipped: {ex}")

    cand = [(s, x, y, shared[(x, y)]) for (x, y), s in scores.items() if s >= a.min and (x, y) not in existing]
    cand.sort(reverse=True)

    per, edges, seen = defaultdict(int), [], set()
    for s, x, y, sh in cand:
        if per[x] >= a.per_node or per[y] >= a.per_node or (x, y) in seen:
            continue
        seen.add((x, y)); per[x] += 1; per[y] += 1
        edges.append({"source": x, "target": y, "type": "inferred", "score": round(s, 2),
                      "reason": "shared: " + ", ".join(sorted(set(sh))[:4])})

    if a.top and len(edges) > a.top:
        edges = sorted(edges, key=lambda e: -e["score"])[:a.top]

    json.dump({"edges": edges, "generated_from": len(nodes)}, open(OUT, "w", encoding="utf-8"))
    print(f"inferred {len(edges)} new pathways across {len(nodes)} nodes "
          f"(per-node≤{a.per_node}, min≥{a.min}, df-cap≤{a.df_cap}) → {os.path.relpath(OUT, ROOT)}")
    for e in sorted(edges, key=lambda e: -e["score"])[:8]:
        print(f"  {e['score']:.2f}  {e['source']}  ↔  {e['target']}   ({e['reason']})")


if __name__ == "__main__":
    main()
