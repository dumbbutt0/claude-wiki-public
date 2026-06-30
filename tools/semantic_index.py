#!/usr/bin/env python3
"""semantic_index.py — a LOCAL TF-IDF semantic memory over the wiki.

Builds a term-vector index of every graph node (title + aliases + tags + body) with scikit-learn, so retrieval works by
MEANING / term-overlap rather than exact keyword grep. 100% local, deterministic, no model download, privacy-safe.
Powers semantic /recall, /prime, /query, and richer link inference. Index files are git-ignored (they encode private
node text + names).

  python3 tools/semantic_index.py --build                  # (re)build the index → graph-semantic.{npz,pkl,json}
  python3 tools/semantic_index.py --query "..." [--n 12]    # top-K nodes by cosine similarity to the text
  python3 tools/semantic_index.py --similar <id> [--n 12]   # top-K nodes nearest to a node
"""
import argparse, json, os, pickle, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRAPH = os.path.join(ROOT, "07_visualizer", "graph-local.json")
NPZ = os.path.join(ROOT, "07_visualizer", "graph-semantic.npz")
PKL = os.path.join(ROOT, "07_visualizer", "graph-semantic-vec.pkl")
META = os.path.join(ROOT, "07_visualizer", "graph-semantic.json")

FM_RE = re.compile(r"^---\n(.*?)\n---\n?", re.S)
TAGS_RE = re.compile(r"^tags:\s*\[(.*?)\]", re.M)
ALIAS_RE = re.compile(r"^aliases:\s*\[(.*?)\]", re.M)


def doc_text(node):
    parts = [node.get("title", ""), node.get("title", ""), node.get("excerpt", "")]   # title twice = light weight
    p = node.get("path")
    if p:
        try:
            raw = open(os.path.join(ROOT, p), encoding="utf-8").read()
            m = FM_RE.match(raw)
            head, body = (m.group(1), raw[m.end():]) if m else ("", raw)
            for rx in (TAGS_RE, ALIAS_RE):
                mm = rx.search(head)
                if mm:
                    parts.append(mm.group(1).replace('"', " ").replace("'", " "))
            body = re.sub(r"```.*?```", " ", body, flags=re.S)        # strip fenced code
            body = re.sub(r"https?://\S+", " ", body)                  # strip urls
            body = re.sub(r"[#>*`\[\]\(\)|_~]", " ", body)             # strip md punctuation
            parts.append(body[:4000])
        except Exception:
            pass
    return " ".join(parts)


def build():
    from sklearn.feature_extraction.text import TfidfVectorizer
    import scipy.sparse as sp
    g = json.load(open(GRAPH, encoding="utf-8"))
    nodes = [n for n in g["nodes"] if n.get("exists", True)]
    ids = [n["id"] for n in nodes]
    titles = {n["id"]: n.get("title", n["id"]) for n in nodes}
    vec = TfidfVectorizer(stop_words="english", max_features=20000, ngram_range=(1, 2), min_df=2, sublinear_tf=True)
    X = vec.fit_transform(doc_text(n) for n in nodes)
    sp.save_npz(NPZ, X)
    pickle.dump(vec, open(PKL, "wb"))
    json.dump({"ids": ids, "titles": titles, "n": len(ids), "terms": len(vec.vocabulary_)}, open(META, "w", encoding="utf-8"))
    return ids, X, vec, titles


def load():
    import scipy.sparse as sp
    if not all(os.path.exists(p) for p in (NPZ, PKL, META)):
        return build()
    meta = json.load(open(META, encoding="utf-8"))
    return meta["ids"], sp.load_npz(NPZ), pickle.load(open(PKL, "rb")), meta["titles"]


def _rank(sims, ids, titles, n, skip=None):
    order = sims.argsort()[::-1]
    out = []
    for i in order:
        if ids[i] == skip:
            continue
        if sims[i] <= 0.01 or len(out) >= n:
            break
        out.append((ids[i], float(sims[i]), titles.get(ids[i], ids[i])))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", action="store_true")
    ap.add_argument("--query")
    ap.add_argument("--similar")
    ap.add_argument("--n", type=int, default=12)
    a = ap.parse_args()

    if a.build and not (a.query or a.similar):
        ids, X, vec, titles = build()
        print(f"semantic index built: {len(ids)} nodes · {X.shape[1]} terms → graph-semantic.{{npz,pkl,json}} (git-ignored)")
        return

    from sklearn.metrics.pairwise import cosine_similarity
    ids, X, vec, titles = load()
    if a.query:
        sims = cosine_similarity(vec.transform([a.query]), X)[0]
        res = _rank(sims, ids, titles, a.n)
        print(f"# semantic matches for: {a.query}")
    elif a.similar:
        if a.similar not in ids:
            print(f"# unknown node: {a.similar}"); return
        i0 = ids.index(a.similar)
        sims = cosine_similarity(X[i0], X)[0]
        res = _rank(sims, ids, titles, a.n, skip=a.similar)
        print(f"# nearest to: {a.similar}")
    else:
        print("usage: --build | --query TEXT | --similar ID"); return
    for nid, s, title in res:
        print(f"{s:.3f}\t{nid}\t{title}")


if __name__ == "__main__":
    main()
