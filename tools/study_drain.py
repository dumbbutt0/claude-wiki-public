#!/usr/bin/env python3
"""Drain the Eye's click-driven learning-intent queue for /study.

The Cognitive Lens appends one JSON object per node-click to `09_working/learning-intent-queue.jsonl`
(`{nodeId,title,type,mode,clickedAt,depth}`). This de-dups by nodeId (latest click wins), skips already-studied
subjects, and prints the next N (newest first) for `/study` to expand. `--mark` records them as studied.
Git-ignored working memory. Stdlib only.

  python3 tools/study_drain.py [--n 3] [--mark]
"""
import argparse, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q = os.path.join(ROOT, "09_working", "learning-intent-queue.jsonl")
DONE = os.path.join(ROOT, "09_working", "learning-studied.txt")


def studied():
    return set(open(DONE, encoding="utf-8").read().split()) if os.path.exists(DONE) else set()


def intents():
    seen = {}
    if os.path.exists(Q):
        for line in open(Q, encoding="utf-8"):
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except Exception:
                continue
            if r.get("nodeId"):
                seen[r["nodeId"]] = r          # latest click for a node wins
    return list(seen.values())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=3)
    ap.add_argument("--mark", action="store_true")
    a = ap.parse_args()
    done = studied()
    pending = [r for r in intents() if r["nodeId"] not in done]
    pending.sort(key=lambda r: r.get("clickedAt", 0), reverse=True)          # newest clicks first
    batch = pending[:a.n]
    for r in batch:
        print(f"{r['nodeId']}\t{r.get('title', '')}\t{r.get('depth', 'both')}")
    if a.mark and batch:
        open(DONE, "a", encoding="utf-8").write("".join(r["nodeId"] + "\n" for r in batch))
    if not batch:
        print("(no pending click-intents)")
    print(f"# pending {len(pending)} · studied {len(done)}", flush=True)


if __name__ == "__main__":
    main()
